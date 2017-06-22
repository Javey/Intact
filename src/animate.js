import Intact from './intact';
import {Types} from 'miss/src/vnode';
import Vdt from 'vdt';

let Animate;
export default Animate = Intact.extend({
    defaults: {
        'a:tag': 'div',
        'a:transition': 'animate',
        'a:appear': false,
        'a:mode': 'both', // out-in | in-out
        'a:disabled': false // 只做动画管理者，自己不进行动画
    },

    template() {
        const h = Vdt.miss.h;
        const data = this.data;
        const tagName = data.get('a:tag');
        const props = {};
        const _props = data.get();
        for (let key in data.get()) {
            if (key[0] !== 'a' || key[1] !== ':') {
                props[key] = _props[key];
            }
        }
        return h(tagName, props, data.get('children'));
    },

    init(lastVNode, nextVNode) {
        this.mountChildren = [];
        this.unmountChildren = [];
        this.updateChildren = [];
        this.children = [];
        // const parentDom = this.parentDom;
        const parentDom = this.parentVNode.dom;
        if (parentDom && parentDom._reserve) {
            lastVNode = parentDom._reserve[nextVNode.key];
        }
        return this._super(lastVNode, nextVNode);
    },

    _mount(lastVNode, vNode) {
        if (this.get('a:disabled')) return;

        let isAppear = false;
        if (this.isRender) {
            let parent;
            if (
                this.get('a:appear') && 
                (
                    this.parentDom ||
                    (parent = this.parentVNode) &&
                    parent.type & Types.ComponentClassOrInstance &&
                    !parent.children.isRender
                )
            ) {
                isAppear = true;
            }
        }

        const transition = this.get('a:transition');
        const element = this.element;

        let enterClass;
        let enterActiveClass;
        if (isAppear) {
            enterClass = `${transition}-appear`;
            enterActiveClass = `${transition}-appear-active`;
        } else {
            enterClass = `${transition}-enter`;
            enterActiveClass = `${transition}-enter-active`;
        }

        this.isAppear = isAppear;
        this.enterClass = enterClass;
        this.enterActiveClass = enterActiveClass;
        this.leaveClass = `${transition}-leave`;
        this.leaveActiveClass = `${transition}-leave-active`;
        this.moveClass = `${transition}-move`;

        this._enterEnd = (e) => {
            e && e.stopPropagation();
            removeClass(element, enterClass);
            removeClass(element, enterActiveClass);
            if (this.lastInstance) {
                element.style.position = '';
                element.style.transform = element.style.WebkitTransform = '';
                this.clone.parentNode.removeChild(this.clone);
            }
            TransitionEvents.off(element, this._enterEnd);
            this._entering = false;
        };

        // 一个动画元素被删除后，会被保存，如果下次又出现了，则要清除
        // 上一个动画状态
        if (this._lastVNode && this._lastVNode !== lastVNode) {
            const lastInstance = this._lastVNode.children;
            if (lastInstance._leaving) {
                this.lastInstance = lastInstance;
                // this._isReserve = true;
                // lastInstance._unmountCancelled = true;
                // lastInstance._leaveEnd();
            }
        }

        const parentInstance = this._getParentAnimate();

        element._unmount = (nouse, parentDom) => {
            this.vNode = vNode;
            this.parentDom = parentDom;
            if (parentInstance) {
                parentInstance.unmountChildren.push(this);
            } else {
                this._unmount();
            }
        };
       
        if (parentInstance) {
            if (isAppear || !this.isRender) {
                parentInstance.mountChildren.push(this);
            }
            parentInstance.children.push(this);
        } else if (isAppear || !this.isRender) {
            this._enter();
        }
    },

    _getParentAnimate() {
        // this.parentVNode是animate的tag，所以要拿this.parentVNode.parentVNode
        const parentVNode = this.parentVNode.parentVNode;
        if (parentVNode) {
            const parentInstance = parentVNode.children;
            if (parentInstance instanceof Animate) {
                return parentInstance;
            }
        }
    },
   
    _unmount(onlyInit) {
        if (this.get('a:disabled')) return;

        const element = this.element;
        const transition = this.get('a:transition');
        const vNode = this.vNode;
        const parentDom = this.parentDom;

        if (!parentDom._reserve) {
            parentDom._reserve = {};
        }
        parentDom._reserve[vNode.key] = vNode;

        this._leaving = true;

        if (this._entering) {
            TransitionEvents.off(element, this._enterEnd);
            this._enterEnd();
        }

        this._leaveEnd = (e) => {
            e && e.stopPropagation();
            removeClass(element, this.leaveClass);
            removeClass(element, this.leaveActiveClass);
            const s = element.style;
            s.position = 'absolute';
            s.transform = s.WebkitTransform = this.transform;
            this._leaving = false;
            delete parentDom._reserve[vNode.key];
            TransitionEvents.off(element, this._leaveEnd);
            if (!this._unmountCancelled) {
                parentDom.removeChild(element);
                this.destroy(vNode);
            }
        };

        this._leave(onlyInit);
    },

    _beforeUpdate(lastVNode, vNode) {
        // 更新之前，这里的children是上一份children
        // 包括上一次的mount和update，不包括上次unmount，
        // 但这里会有当前需要unmount的元素
        const children = this.children;
        for (let i = 0; i < children.length; i++) {
            let instance = children[i];
            instance.position = instance.element.getBoundingClientRect();
        }
    },

    _update(lastVNode, vNode) {
        if (!this.get('a:disabled')) {
            const parentInstance = this._getParentAnimate();
            if (parentInstance) {
                parentInstance.updateChildren.push(this);
            }
        }

        // 更新之后，这里的children是上一次与当前的合集
        // 包括当前mount/update/unmount
        const mountChildren = this.mountChildren;
        const updateChildren = this.updateChildren;
        const unmountChildren = this.unmountChildren;
        const children = this.children;

        let i;
        let instance;

        // step1: 先将之前的动画清空
        children.forEach(instance => {
            if (instance._entering) {
                instance._enterEnd();
            }
            if (instance._moving) {
                instance._moveEnd();
            }
        });

        unmountChildren.forEach(instance => {
            if (instance.originTransfrom === undefined) {
                instance._needMoveLeaveClass = true;
                addClass(instance.element, instance.leaveClass);
            } else {
                instance._needMoveLeaveClass = false;
            }
        });
        unmountChildren.forEach(instance => {
            if (instance.originTransfrom === undefined) {
                const element = instance.element;
                const transform = getComputedStyle(element).transform;  
                instance.originTransfrom = transform === 'none' ? '' : transform;
            }
        });
        unmountChildren.forEach(instance => {
            if (instance._needMoveLeaveClass) {
                removeClass(instance.element, instance.leaveClass);
            }
            instance.element.style.position = 'absolute';
        });
        
        // 被删除的元素，又重新进来了，需要把position还原
        mountChildren.forEach(instance => {
            if (instance.lastInstance) {
                const clone = instance.element.cloneNode();
                clone.style.position = '';
                clone.style.transform = '';
                instance.element.parentNode.insertBefore(clone, instance.element);
                instance.clone = clone;
                // instance.element.style.position = '';
                // instance.element.style.transform = '';
                // instance.element.style.transitionDuration = '0s';
            }
        });
        
        // step3: 将unmount元素脱离文档流，用于计算移动元素
        // unmountChildren.forEach(instance => {
            // const element = instance.element;
            // element.style.position = 'absolute';
        // });

        // step4: 获取元素最终位置
        unmountChildren.forEach(instance => {
            const element = instance.element;
            // const transform = getComputedStyle(element).transform;  
            instance.newPosition = element.getBoundingClientRect();
            // instance.originTransfrom = transform === 'none' ? '' : transform;
        });
        updateChildren.forEach(instance => {
            const element = instance.element;
            // const transform = getComputedStyle(element).transform;  
            instance.newPosition = element.getBoundingClientRect();
            // instance.originTransfrom = transform === 'none' ? '' : transform;
        });

        // mountChildren.forEach(instance => {
            // if (instance.lastInstance) {
                // instance.element.style.position = 'absolute';
            // }
        // });


        // step5: 判断元素是否需要移动，并还原到初始位置
        unmountChildren.forEach(instance => instance._initMove());
        updateChildren.forEach(instance => instance._initMove());

        // step6: 移动元素添加初始类名
        updateChildren.forEach((instance) => {
            if (instance._needMove) {
                instance._move(true);
            }
        });

        // step7: unmount元素初始化类名
        unmountChildren.forEach(instance => instance._unmount(true));

        // step2: 设置mount元素的进入状态
        mountChildren.forEach(instance => instance._enter(true));

        // step8: 所有动画都在下一帧处理
        // setTimeout(() => {
        nextFrame(() => {
            mountChildren.forEach(instance => instance._triggerEnter());
            unmountChildren.forEach(instance => instance._triggerLeave());
            updateChildren.forEach(instance => instance._triggerMove());
        });
 
        this.mountChildren = [];
        this.updateChildren = [];
        this.unmountChildren = [];
    },

    _initMove(isUnmount) {
        const element = this.element;
        const oldPosition = this.position;
        const newPosition = this.newPosition;

        // this.position = newPosition;
        // // mount的元素，不处理位置
        // if (!oldPosition) return;

        const dx = oldPosition.left - newPosition.left;
        const dy = oldPosition.top - newPosition.top;

        this.transform = '';
        // this.originTransfrom = '';

        if (dx || dy) {
            this._needMove = true;
            const s = element.style;
            this.transform = `translate(${dx}px, ${dy}px)`;
            s.transform = s.WebkitTransform = this.transform;
            s.transitionDuration = '0s';
        } else {
            this._needMove = false;
        }
    },

    _move(onlyInit) {
        this._moving = true;
        const element = this.element;
        const s = element.style;
        addClass(element, this.moveClass);
        this._moveEnd = (e) => {
            e && e.stopPropagation();
            if (!e || /transform$/.test(e.propertyName)) {
                TransitionEvents.off(element, this._moveEnd);
                removeClass(element, this.moveClass);
                this._moving = false;
            }
        };
        TransitionEvents.on(element, this._moveEnd);
        if (!onlyInit) {
            nextFrame(() => this._triggerMove());
        }
    },

    _triggerMove() {
        const s = this.element.style;
        s.transform = s.WebkitTransform = s.transitionDuration = '';
    },

    _enter(onlyInit) {
        // this._entering = true;
        const element = this.element;
        const enterClass = this.enterClass;
        const enterActiveClass = this.enterActiveClass;

        // 如果这个元素是上一个删除的元素，则从当前状态回到原始状态
        if (this.lastInstance) {
            this.lastInstance._unmountCancelled = true;
            this.lastInstance._leaveEnd();
            element.style.transitionDuration = '';
            addClass(element, this.enterActiveClass);
        } else {
            addClass(element, enterClass);
        }
        // addClass(this.element, this.enterActiveClass);
        TransitionEvents.on(element, this._enterEnd);
        if (!onlyInit) {
            nextFrame(() => this._triggerEnter());
        }
    },

    _triggerEnter() {
        this._entering = true;
        addClass(this.element, this.enterActiveClass);
        removeClass(this.element, this.enterClass);
    },

    _leave(onlyInit) {
        const element = this.element;
        addClass(element, this.leaveActiveClass);
        TransitionEvents.on(element, this._leaveEnd);
        if (!onlyInit) {
            nextFrame(() => {
                this._triggerLeave();
            });
        }
    },

    _triggerLeave() {
        const element = this.element;
        const s = element.style;
        if (this.transform !== undefined) {
            s.transform = s.WebkitTransform = `${this.transform} ${this.originTransfrom}`;
            s.transitionDuration = '';
        }
        addClass(element, this.leaveClass);
    },

    destroy(lastVNode, nextVNode) {
        if (this._leaving !== false) return;
        this._super(lastVNode, nextVNode);
    }
});

const raf = window.requestAnimationFrame ? 
    window.requestAnimationFrame.bind(window) : setTimeout;
export function nextFrame(fn) {
    raf(() => raf(fn));
}

function addClass(element, className) {
    if (className) {
        if (element.classList) {
            element.classList.add(className);
        } else if (!hasClass(element, className)) {
            element.className += ` ${className}`;
        }
    }
    return element;
}

function hasClass(element, className) {
    if (element.classList) {
        return !!className && element.className.contains(className);
    }
    return (` ${element.className} `).indexOf(` ${className} `) > -1;
}

function removeClass(element, className) {
    if (className) {
        if (element.classList) {
            element.classList.remove(className);
        } else if (hasClass(element, className)) {
            element.className = element.className
                .replace(new RegExp(`(^|\\s)${className}(?:\\s|$)`, 'g'), '$1')
                .replace(/\s+/g, ' ') // multiple spaces to one
                .replace(/^\s*|\s*$/g, ''); // trim the ends
        }
    }
}

let EVENT_NAME_MAP = {
    transitionend: {
        'transition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'mozTransitionEnd',
        'OTransition': 'oTransitionEnd',
        'msTransition': 'MSTransitionEnd'
    },

    animationend: {
        'animation': 'animationend',
        'WebkitAnimation': 'webkitAnimationEnd',
        'MozAnimation': 'mozAnimationEnd',
        'OAnimation': 'oAnimationEnd',
        'msAnimation': 'MSAnimationEnd'
    }
};

let endEvents = [];

function detectEvents() {
    let testEl = document.createElement('div');
    let style = testEl.style;

    // On some platforms, in particular some releases of Android 4.x,
    // the un-prefixed "animation" and "transition" properties are defined on the
    // style object but the events that fire will still be prefixed, so we need
    // to check if the un-prefixed events are useable, and if not remove them
    // from the map
    if (!('AnimationEvent' in window)) {
        delete EVENT_NAME_MAP.animationend.animation;
    }

    if (!('TransitionEvent' in window)) {
        delete EVENT_NAME_MAP.transitionend.transition;
    }

    for (let baseEventName in EVENT_NAME_MAP) {
        let baseEvents = EVENT_NAME_MAP[baseEventName];
        for (let styleName in baseEvents) {
            if (styleName in style) {
                endEvents.push(baseEvents[styleName]);
                break;
            }
        }
    }
}

detectEvents();

function addEventListener(node, eventName, eventListener) {
    node.addEventListener(eventName, eventListener, false);
}

function removeEventListener(node, eventName, eventListener) {
    node.removeEventListener(eventName, eventListener, false);
}

let TransitionEvents = {
    on: function(node, eventListener) {
        if (endEvents.length === 0) {
            // If CSS transitions are not supported, trigger an "end animation"
            // event immediately.
            window.setTimeout(eventListener, 0);
            return;
        }
        endEvents.forEach(function(endEvent) {
            addEventListener(node, endEvent, eventListener);
        });
    },

    off: function(node, eventListener) {
        if (endEvents.length === 0) {
            return;
        }
        endEvents.forEach(function(endEvent) {
            removeEventListener(node, endEvent, eventListener);
        });
    },

    one: function(node, eventListener) {
        let listener = function() {
            eventListener.apply(this, arguments);
            TransitionEvents.off(node, listener);
        };
        TransitionEvents.on(node, listener);
    }
};
