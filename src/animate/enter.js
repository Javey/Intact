import prototype from './prototype';
import {
    addClass, removeClass, getAnimateType,
    nextFrame, TransitionEvents
} from './utils';
import checkMode from './check-mode';
import leave from './leave';
import {Types} from 'misstime/src/vnode';

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

export default function enter(o) {
    if (o.get('a:disabled')) return;

    o._entering = true;

    const element = o.element;
    const enterClass = o.enterClass;
    const enterActiveClass = o.enterActiveClass;
    const isCss = o.get('a:css');

    // getAnimateType将添加enter-active className，在firefox下将导致动画提前执行
    // 我们应该先于添加`enter` className去调用该函数
    let isTransition = false;
    if (isCss && getAnimateType(element, enterActiveClass) !== 'animation') {
        isTransition = true;
    }

    // 如果这个元素是上一个删除的元素，则从当前状态回到原始状态
    if (o.lastInstance) {
        o.lastInstance._unmountCancelled = true;
        o.lastInstance._leaveEnd();

        if (isCss) {
            if (o.lastInstance._triggeredLeave) {
                // addClass(element, enterActiveClass);
                // 保持连贯，添加leaveActiveClass
                addClass(element, o.leaveActiveClass);
            } else {
                // 如果上一个元素还没来得及做动画，则当做新元素处理
                addClass(element, enterClass);
            }
        }
    } else if (isCss) {
        addClass(element, enterClass);
    }
    TransitionEvents.on(element, o._enterEnd);

    o.trigger(`${o.enterEventName}Start`, element);

    if (isTransition) {
        nextFrame(() => triggerEnter(o));
    } else {
        // 对于animation动画，同步添加enterActiveClass，避免闪动
        triggerEnter(o);
    }
}

function triggerEnter(o) {
    const element = o.element;

    o._triggeredEnter = true;

    if (o.get('a:css')) {
        if (o._entering === false) {
            return removeClass(element, o.enterActiveClass);
        }
        addClass(element, o.enterActiveClass);
        removeClass(element, o.enterClass);
        removeClass(element, o.leaveActiveClass);
    }

    o.trigger(o.enterEventName, element, o._enterEnd);
}

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
            leave(o); 
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
