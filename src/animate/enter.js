import prototype from './prototype';
import {
    getAnimateType,
    nextFrame, TransitionEvents
} from './utils';
import checkMode from './check-mode';
import leave from './leave';
import {Types} from 'misstime/src/vnode';
import {noop} from '../utils';

prototype._mount = function(lastVNode, vNode) {
    this.isAppear = detectIsAppear(this);
    this._parentDom = this.parentVNode && this.parentVNode.dom || this.parentDom;

    this.on('$change:a:transition', initClassName);
    initClassName(this);

    // for show/hide animation
    initAShow(this);

    // 一个动画元素被删除后，会被保存
    // 如果在删除的过程中，又添加了，则要清除上一个动画状态
    // 将这种情况记录下来
    if (this._lastVNode && this._lastVNode !== lastVNode) {
        const lastInstance = this._lastVNode.children;
        if (lastInstance._leaving) {
            this.lastInstance = lastInstance;
        } else {
            lastInstance._cancelLeaveNextFrame();
        }
    }

    this.parentInstance = getParentAnimate(this);

    initUnmountCallback(this, vNode);

    startEnterAnimate(this); 
};

function initAShow(o) {
    const element = o.element;
    const display = element.style.display;
    const originDisplay = display === 'none' ? '' : display; 
    if (!o.get('a:show')) {
        element.style.display = 'none';
    }

    // o.on('$change:a:disabled', (c, v) => {
        // if (v) {
            // const lastInstance = o.lastInstance;
            // if (lastInstance && lastInstance._leaving === true) {
                // lastInstance._leaveEnd();
            // }
        // }
    // });

    o.on('$changed:a:show', (c, v) => {
        // 如果是appear动画，则在show/hide改为enter动画
        if (o.isAppear) {
            o.isAppear = false;
            initClassName(o);
        }
        if (v) {
            // 如果在leaveEnd事件中，又触发了enter
            // 此时_leaving为false，如果不清空lastInstance
            // 将会在enter中再次触发leaveEnd
            const lastInstance = o.lastInstance;
            if (lastInstance && lastInstance._leaving === false) {
                o.leaveEndCallback = noop;
                o.lastInstance = null;
            }
            element.style.display = originDisplay;
            startEnterAnimate(o);
        } else {
            o.lastInstance = o;
            o.leaveEndCallback = () => {
                element.style.display = 'none';
                o.lastInstance = null;
            };
            unmountCallback(o);
        }
    });
}

function startEnterAnimate(o) {
    if (o.parentInstance) {
        // 如果存在父动画组件，则使用父级进行管理
        // 统一做动画
        animateList(o);
    } else if (o.isAppear || !o.isRender) {
        // 否则单个元素自己动画
        enter(o);
    }
};

export default function enter(o) {
    if (!o.get('a:show') || o._entering) return;

    const element = o.element;
    const isCss = o.get('a:css');
    const enterStart = o.get('a:enterStart');
    const continuity = o.get('a:continuity');
    const disabled = o.get('a:disabled');

    // getAnimateType将添加enter-active className，在firefox下将导致动画提前执行
    // 我们应该先于添加`enter` className去调用该函数
    let isTransition = false;
    if (isCss && getAnimateType(element, o.enterActiveClass) !== 'animation') {
        isTransition = true;
    }

    let endDirectly = false;
    // 如果这个元素是上一个删除的元素，则从当前状态回到原始状态
    if (o.lastInstance) {
        endDirectly = continuity && !o.lastInstance._triggeredLeave;

        o.lastInstance._cancelLeaveNextFrame();
        o.lastInstance._leaveEnd(null, true);

        // 保持连贯，添加leaveActiveClass
        if (continuity && !endDirectly && isCss && !disabled) {
            o._addClass(o.enterActiveClass);
        }
    }

    if (disabled) return;

    initEnterEndCallback(o); 
   
    function start() {
        o._entering = true;

        o.trigger(`${o.enterEventName}Start`, element);

        if (!endDirectly) {
            if (isCss) {
                o._addClass(o.enterClass);
            }

            TransitionEvents.on(element, o._enterEnd);

            if (isTransition) {
                o._cancelEnterNextFrame = nextFrame(() => triggerEnter(o));
            } else {
                // 对于animation动画，同步添加enterActiveClass，避免闪动
                triggerEnter(o);
            }
        } else {
            o._enterEnd();
        }
    }

    // 要保持leave的过程中，enter动画的连贯，enterStart中必须不能操作dom导致重绘
    // 但是往往enterStart中会重绘，一种解决思路是：
    // 将leaveEnd放在enterStart之后执行，但如果enterStart依赖元素的初始状态，而非
    // leave的中间状态，此时会导致enterStart中dom操作不符合预期
    // 另种一种思路是：
    // 不去保证拥有enterStart函数的动画的连贯性，此时我们会从enter动画初始状态进行动画
    // 这里采取第二种思路
    let i;
    if (enterStart && (i = enterStart(element)) && i.then) {
        i.then(() => {
            if (o.destroyed || !o.get('a:show')) return;
            start();
        });
    } else {
        start();
    }
}

function triggerEnter(o) {
    const element = o.element;

    if (o.get('a:css')) {
        // if (o._entering === false) {
            // return o._removeClass(o.enterActiveClass);
        // }
        o._addClass(o.enterActiveClass);
        o._removeClass(o.enterClass);
    }

    o._triggeredEnter = true;

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

    // o.isAppear = isAppear;
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
        const staticClass = {};
        const index = oldValue.length;
        for (let key in this._staticClass) {
            staticClass[newValue + key.substring(index)] = true;
        }
        this._staticClass = staticClass;
    }
}

function initEnterEndCallback(o) {
    const {element, parentInstance} = o;
    const isCss = o.get('a:css');
    const disabled = o.get('a:disabled');

    o._enterEnd = (e, isCancel) => {
        if (e && e.target !== element) return;

        TransitionEvents.off(element, o._enterEnd);

        if (isCss && !disabled) {
            e && e.stopPropagation && e.stopPropagation();
            o._removeClass(o.enterClass);
            o._removeClass(o.enterActiveClass);
        }

        o._entering = false;
        o._triggeredEnter = false;

        if (parentInstance) {
            if (--parentInstance._enteringAmount === 0 &&
                parentInstance.get('a:mode') === 'in-out'
            ) {
                nextFrame(() => {
                    checkMode(parentInstance);
                });
            }
        }

        o.trigger(`${o.enterEventName}End`, element, isCancel);
    };
}

function initUnmountCallback(o, vNode) {
    const {element} = o;

    element._unmount = (nouse, parentDom) => {
        o.vNode = vNode;
        o._parentDom = parentDom;
        o.leaveEndCallback = (isLeaveEnd) => {
            parentDom.removeChild(element);
            if (!isLeaveEnd || o.get('a:delayDestroy')) {
                o.destroy(vNode, null, parentDom, true);
            }
        };
        unmountCallback(o);

        // 存在一种情况，相同的dom，同时被子组件和父组件管理的情况
        // 所以unmount后，将其置为空函数，以免再次unmount
        element._unmount = noop;
    };
}

function unmountCallback(o) {
    const {parentInstance} = o;

    // 如果该元素是延迟mount的元素，则直接删除
    if (o._delayEnter) {
        o.leaveEndCallback();
        parentInstance._enteringAmount--;

        return;
    }

    const isNotAnimate = !o.get('a:css') && !hasJsTransition(o);

    if (parentInstance && !isNotAnimate) {
        parentInstance._leavingAmount++;
        if (parentInstance.get('a:mode') === 'in-out') {
            parentInstance.updateChildren.push(o);
            o._delayLeave = true;
        } else {
            // add a flag to indicate that this child will leave but we maybe call
            // _beforeUpdate twice before _update, so let _beforeUpdate reserve it
            // ksc-fe/kpc#238 
            o._needLeave = true;
            parentInstance.unmountChildren.push(o);
        }
        parentInstance.children.push(o);
    } else if (isNotAnimate) {
        o.leaveEndCallback();
    } else {
        leave(o); 
    }
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
