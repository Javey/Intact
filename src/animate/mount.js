import prototype from './prototype';
import {TransitionEvents, nextFrame, removeClass} from './utils';
import checkMode from './check-mode';
import enter from './enter';

prototype._mount = function(lastVNode, vNode) {
    this.isAppear = detectIsAppear(this);

    this.on('$change:a:transition', initClassName);
    initClassName(this);

    // 一个动画元素被删除后，会被保存
    // 如果在删除的过程中，又添加了，则要清除上一个动画状态
    // 将这种情况记录下来
    if (this._lastVNode && this._lastVNode !== lastVNode) {
        const lastInstance = this._lastVNode.children;
        if (lastInstance._leaving) {
            this.lastInstance = lastInstance;
        }
    }

    this.parentInstance = getParentAnimate(this);

    addEnterEndCallback(this);
    addUnmountCallback(this, vNode);

    if (this.parentInstance) {
        // 如果存在父动画组件，则使用父级进行管理
        // 统一做动画
        animateList(this);
    } else if (this.isAppear || !this.isRender) {
        // 否则单个元素自己动画
        enter(this);
    }
};

function detectIsAppear(o) {
    let isAppear = false;
    if (o.isRender) {
        let parent;
        if (
            o.get('a:appear') && 
            (
                o.parentDom ||
                (parent = o.parentVNode) &&
                (parent.type & Types.ComponentClassOrInstance) &&
                !parent.children.isRender
            )
        ) {
            isAppear = true;
        }
    }

    return isAppear;
}

function initClassName(o, newValue, oldValue) {
    const transition = o.get('a:transition');
    const {element, isAppear} = o;

    let enterClass;
    let enterActiveClass;

    if (isAppear) {
        enterClass = `${transition}-appear`;
        enterActiveClass = `${transition}-appear-active`;
    } else {
        enterClass = `${transition}-enter`;
        enterActiveClass = `${transition}-enter-active`;
    }

    o.isAppear = isAppear;
    o.enterClass = enterClass;
    o.enterActiveClass = enterActiveClass;
    o.leaveClass = `${transition}-leave`;
    o.leaveActiveClass = `${transition}-leave-active`;
    o.moveClass = `${transition}-move`;
    o.enterEventName = isAppear ? 'a:appear' : 'a:enter';

    if (oldValue) {
        element.className = element.className.replace(
            new RegExp(`\\b(${oldValue}(?=\\-(appear|enter|leave|move)))`, 'g'),
            newValue
        );
    }
}

function addEnterEndCallback(o) {
    const {element, parentInstance} = o;

    o._enterEnd = (e) => {
        if (e && e.target !== element) return;

        if (o.get('a:css') && !o.get('a:disabled')) {
            e && e.stopPropagation && e.stopPropagation();
            removeClass(element, o.enterClass);
            removeClass(element, o.enterActiveClass);
        }

        TransitionEvents.off(element, o._enterEnd);
        o._entering = false;

        if (parentInstance) {
            if (--parentInstance._enteringAmount === 0 &&
                parentInstance.get('a:mode') === 'in-out'
            ) {
                nextFrame(() => {
                    checkMode(parentInstance);
                });
            }
        }

        o.trigger(`${o.enterEventName}End`, element);
    };
}

function addUnmountCallback(o, vNode) {
    const {element, parentInstance} = o;

    element._unmount = (nouse, parentDom) => {
        // 如果该元素是延迟mount的元素，则直接删除
        if (o._delayEnter) {
            parentDom.removeChild(element);
            o.destroy(vNode);
            parentInstance._enteringAmount--;

            return;
        }

        const isNotAnimate = !o.get('a:css') && !hasJsTransition(o) || 
            o.get('a:disabled');

        o.vNode = vNode;
        o.parentDom = parentDom;

        if (parentInstance && !isNotAnimate) {
            parentInstance._leavingAmount++;
            if (parentInstance.get('a:mode') === 'in-out') {
                parentInstance.updateChildren.push(o);
                o._delayLeave = true;
            } else {
                parentInstance.unmountChildren.push(o);
            }
            parentInstance.children.push(o);
        } else if (isNotAnimate) {
            parentDom.removeChild(element);
            o.destroy(vNode);
        } else {
            o._unmount();
        }
    };
}

function animateList(o) {
    const {element, isAppear, parentInstance} = o;

    if (isAppear || !o.isRender) {
        if (o.lastInstance && o.lastInstance._delayLeave) {
            parentInstance.updateChildren.push(o);
        } else {
            parentInstance._enteringAmount++;
            // 如果没有unmount的元素，则直接enter
            if (parentInstance._leavingAmount > 0 &&
                parentInstance.get('a:mode') === 'out-in'
            ) {
                o._delayEnter = true;
                element.style.display = 'none';
            } else {
                parentInstance.mountChildren.push(o);
            }
        }
    }

    parentInstance.children.push(o);
}

function getParentAnimate(o) {
    // 根节点为Animate，不存在parentVNode
    if (!o.parentVNode) return;

    // o.parentVNode是animate的tag，所以要拿o.parentVNode.parentVNode
    const parentVNode = o.parentVNode.parentVNode;
    if (parentVNode) {
        const parentInstance = parentVNode.children;
        if (parentInstance instanceof o.constructor) {
            return parentInstance;
        }
    }
}

function hasJsTransition(o) {
    const events = o._events;
    
    for (let key in events) {
        if (key[0] === 'a' && key[1] === ':') {
            if (events[key].length) {
                return true;
            }
        }
    }

    return false;
}
