import prototype from './prototype';
import {CSSMatrix} from './utils';
import enter from './enter';
import leave from './leave';
import {getAnimateInfo, TransitionEvents} from './utils';

prototype._beforeUpdate = function(lastVNode, vNode) {
    // 更新之前，这里的children不包含本次更新mount进来的元素
    const children = this.children;
    const reservedChildren = [];
    const isMove = this.get('a:move');

    for (let i = 0; i < children.length; i++) {
        let instance = children[i];
        if (!instance._leaving && isMove) {
            instance.position = getPosition(instance);
        }
        if (instance._delayLeave) {
            reservedChildren.push(instance);
            this.updateChildren.push(instance);
        } else if (instance._needLeave) {
            // when we call _beforeUpdate twice before _update
            // the unmount children will miss
            // so we add a flag for the children and reserve it
            // ksc-fe/kpc#238
            reservedChildren.push(instance);
        }
    }

    this.children = reservedChildren;
};

prototype._update = function(lastVNode, vNode, isFromCheckMode) {
    let parentInstance;
    if (!this.get('a:disabled')) {
        parentInstance = this.parentInstance;
        if (parentInstance) {
            if (!this._needLeave) {
                parentInstance.updateChildren.push(this);
            }
            // when we call _beforeUpdate twice then call _update twice
            // this instance may exist in childaren
            // so we don't push it, but we need update position of it
            // ksc-fe/kpc#238
            const children = parentInstance.children;
            const index = children.indexOf(this);
            if (!~index) {
                children.push(this);
            } else {
                this._needUpdatePosition = true;
            }
        }
    }

    // 更新之后，这里的children包括当前mount/update/unmount的元素
    const children = this.children;
    // 不存在children，则表示没有子动画元素要管理，直接返回
    if (!children.length) return;

    let mountChildren = this.mountChildren;
    let unmountChildren = this.unmountChildren;
    const updateChildren = this.updateChildren;
    const isMove = this.get('a:move');

    // 如果是in-out模式，但是没有元素enter，则直接leave
    if (!isFromCheckMode && this._enteringAmount === 0 && 
        parentInstance && parentInstance.get('a:mode') === 'in-out'
    ) {
        for (let i = 0; i < updateChildren.length; i++) {
            let instance = updateChildren[i];
            if (instance._delayLeave) {
                unmountChildren.push(instance);
                updateChildren.splice(i, 1);
                instance._delayLeave = false;
                i--;
            }
        } 
    }

    // 进行mount元素的进入动画
    // 因为存在moving元素被unmount又被mount的情况
    // 所以最先处理
    if (isMove) {
        // if the _needUpdatePosition is true, see bellow for detail, update the position
        updateChildren.forEach(instance => {
            if (!instance._leaving && instance._needUpdatePosition) {
                instance.position = getPosition(instance);
            }
            instance._needUpdatePosition = false;
        });

        mountChildren.forEach(instance => {
            // 如果当前元素是从上一个unmount的元素来的，
            // 则要初始化最新位置，因为beforeUpdate中
            // 不包括当前mount元素的位置初始化
            // 这样才能保持位置的连贯性
            if (instance.lastInstance) {
                instance.position = getPosition(instance);
            }
        });
    }
    mountChildren.forEach(instance => enter(instance));

    // 先将之前的动画清空
    // 只有既在move又在enter的unmount元素才清空动画
    // 这种情况保持不了连贯性
    if (isMove) {
        unmountChildren.forEach(instance => {
            if (instance._moving) {
                instance._moveEnd();
                if (instance._entering) {
                    instance._enterEnd();
                }
            }
        });

        // 对于更新的元素，如果正在move，则将位置清空，以便确定最终位置
        updateChildren.forEach(instance => {
            if (instance._moving) {
                const s = instance.element.style;
                s.left = s.top = '';
            }
        });

        // 将要删除的元素，设为absolute，以便确定其它元素最终位置
        unmountChildren.forEach(instance => {
            instance.element.style.position = 'absolute';
        });

        // 获取所有元素的新位置
        children.forEach(instance => {
            instance._needLeave = false;
            instance.newPosition = getPosition(instance);
        });

        // 分别判断元素是否需要移动，并保持当前位置不变
        // unmount的元素，从当前位置直接leave，不要move了
        unmountChildren.forEach(instance => initMove(instance, true));
        updateChildren.forEach(instance => initMove(instance));
        mountChildren.forEach(instance => initMove(instance));

        // 对于animation动画，enterEnd了entering元素
        // 需要re-layout，来触发move动画
        document.body.offsetWidth;

        // 如果元素需要移动，则进行move动画
        children.forEach((instance) => {
            if (instance._needMove) {
                if (!instance._moving) {
                    move(instance);
                } else {
                    // 如果已经在移动了，那直接改变translate，保持动画连贯
                    triggerMove(instance);
                }
            }
        });
    }

    // unmount元素做leave动画
    unmountChildren.forEach(instance => {
        // for call _beforeUpdate twice before _update, ksc-fe/kpc#238
        children.splice(children.indexOf(instance), 1);
        leave(instance);
    });

    this.mountChildren = [];
    this.updateChildren = [];
    this.unmountChildren = [];
};

function initMove(o, isUnmount) {
    const {element, position: oldPosition, newPosition} = o;

    o.position = newPosition;

    // 对于新mount的元素，不进行move判断
    if (!oldPosition) return;

    const dx = oldPosition.left - newPosition.left;
    const dy = oldPosition.top - newPosition.top;
    const oDx = o.dx;
    const oDy = o.dy;

    o.dx = dx;
    o.dy = dy;

    if (dx || dy || oDx || oDy) {
        // 对于move中的元素，需要将它重新回到0
        const s = element.style;
        if (isUnmount) {
            s.left = `${oldPosition.left}px`;
            s.top = `${oldPosition.top}px`;
            o._needMove = false;
        } else {
            // 如果当前元素正在enter，而且是animation动画，则要enterEnd
            // 否则无法move
            if (o._entering && getAnimateInfo(element).type !== 'transition') {
                o._enterEnd();
            }
            o._needMove = true;
            s.position = 'relative';
            s.left = `${dx}px`;
            s.top = `${dy}px`;
        }
    } else {
        o._needMove = false;
    }
}

function move(o) {
    if (o.get('a:disabled')) return;

    o._moving = true;

    const element = o.element;
    const s = element.style;

    o._addClass(o.moveClass);

    o._moveEnd = (e) => {
        e && e.stopPropagation();
        if (!e || /transform$/.test(e.propertyName)) {
            TransitionEvents.off(element, o._moveEnd);
            o._removeClass(o.moveClass);
            s.position = s.left = s.top = s.transform = s.WebkitTransform = '';
            o.dx = o.dy = 0;
            o._moving = false;
        }
    };
    TransitionEvents.on(element, o._moveEnd);

    triggerMove(o);
    // nextFrame(() => o._triggerMove());
}

function triggerMove(o) {
    const s = o.element.style;
    s.transform = s.WebkitTransform = `translate(${0 - o.dx}px, ${0 - o.dy}px)`;
}

function getPosition(o) {
    const element = o.element;
    const style = getComputedStyle(element);
    const transform = style.transform || style.WebkitTransform;

    if (transform === 'none') {
        return {
            top: element.offsetTop,
            left: element.offsetLeft
        };
    }

    // const transform = element.style.transform;
    const matrix = new CSSMatrix(transform);
    return {
        top: element.offsetTop + matrix.m42,
        left: element.offsetLeft + matrix.m41
    };
}
