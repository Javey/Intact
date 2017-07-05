import Intact from './intact';
import {Types} from 'miss/src/vnode';
import {isNullOrUndefined, noop} from './utils';
import Vdt from 'vdt';

let Animate;
export default Animate = Intact.extend({
    defaults: {
        'a:tag': 'div',
        'a:transition': 'animate',
        'a:appear': false,
        'a:mode': 'both', // out-in | in-out | both
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
        const parentDom = this.parentVNode.dom || this.parentDom;
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
            TransitionEvents.off(element, this._enterEnd);
            this._entering = false;
        };

        // 一个动画元素被删除后，会被保存，如果下次又出现了，则要清除
        // 上一个动画状态
        if (this._lastVNode && this._lastVNode !== lastVNode) {
            const lastInstance = this._lastVNode.children;
            if (lastInstance._leaving) {
                this.lastInstance = lastInstance;
                // this.position = lastInstance.position;
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
                parentInstance.children.push(this);
            } else {
                this._unmount();
            }
        };
       
        if (parentInstance) {
            if (isAppear || !this.isRender) {
                parentInstance.mountChildren.push(this);
            }
            parentInstance.children.push(this);
            // this.position = this._getPosition();
        } else if (isAppear || !this.isRender) {
            this._enter();
        }
    },

    _getParentAnimate() {
        // 根节点为Animate，不存在parentVNode
        if (!this.parentVNode) return;
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
        // vNode都会被附上key，当只有一个子元素时，vNode.key === undefined
        // 这种情况，我们也当成有key处理
        // const hasKey = !isNullOrUndefined(vNode.key);

        // if (hasKey) {
            if (!parentDom._reserve) {
                parentDom._reserve = {};
            }
            parentDom._reserve[vNode.key] = vNode;
        // }

        this._leaving = true;

        if (this._entering) {
            TransitionEvents.off(element, this._enterEnd);
            this._enterEnd();
            // document.body.offsetWidth;
        }

        this._leaveEnd = (e) => {
            e && e.stopPropagation();
            removeClass(element, this.leaveClass);
            removeClass(element, this.leaveActiveClass);
            const s = element.style;
            // s.position = 'absolute';
            // s.transform = s.WebkitTransform = this.transform;
            s.position = s.top = s.left = s.transform = s.WebkitTransform = '';
            this._leaving = false;
            // if (hasKey) {
                delete parentDom._reserve[vNode.key];
            // }
            TransitionEvents.off(element, this._leaveEnd);
            if (!this._unmountCancelled) {
                parentDom.removeChild(element);
                this.destroy(vNode, null, parentDom);
            }
        };

        this._leave(onlyInit);
        // 存在一个dom，同时被子组件和父组件管理的情况
        element._unmount = noop;
    },

    _beforeUpdate(lastVNode, vNode) {
        // 更新之前，这里的children是上一份children
        // 包括上一次的mount和update，不包括上次unmount，
        // 但这里会有当前需要unmount的元素
        const children = this.children;
        for (let i = 0; i < children.length; i++) {
            let instance = children[i];
            // if (!instance._entering) {
                // instance.position = instance.element.getBoundingClientRect();
            // } else {
                instance.position = instance._getPosition();
            // }
        }
        this.children = [];
    },

    _getPosition() {
        const element = this.element;
        const transform = getComputedStyle(element).transform;
        const matrix = new WebKitCSSMatrix(transform);
        return {
            top: element.offsetTop + matrix.m42,
            left: element.offsetLeft + matrix.m41
        };
    },

    /**
     * 尽量保持动画的连贯性
     * 一个元素在enter又在move，leave时，不能保持连贯性
     */
    _update(lastVNode, vNode) {
        if (!this.get('a:disabled')) {
            const parentInstance = this._getParentAnimate();
            if (parentInstance) {
                parentInstance.updateChildren.push(this);
                parentInstance.children.push(this);
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

        // mountChildren.forEach(instance => {
            // console.log('p', instance.position);
            // instance._enter();
        // });

        // unmountChildren.forEach(instance => {
            // instance.element.style.position = 'absolute';
        // });

        // unmountChildren.forEach(instance => {
            // if (!instance._moving) {
                // instance.position = instance._getPosition();
            // }
        // });

        // step2: 设置mount元素的进入状态
        // 因为存在moving元素被unmount又被mount的情况
        // 所以最先处理
        mountChildren.forEach(instance => {
            // 如果当前元素是从上一个unmount的元素来的，
            // 则要初始化最新位置，因为beforeUpdate中
            // 不包括当前mount元素的位置初始化
            // 这样才能保持位置的连贯性
            if (instance.lastInstance) {
                instance.position = instance._getPosition();
            }
        });
        mountChildren.forEach(instance => instance._enter());

        // step1: 先将之前的动画清空
        // 只有既在move又在enter的unmount元素才清空动画
        // 这种情况保持不了连贯性
        unmountChildren.forEach(instance => {
            if (instance._moving) {
                instance._moveEnd();
                if (instance._entering) {
                    instance._enterEnd();
                }
            }
        });
        updateChildren.forEach(instance => {
            // if (instance._entering) {
                // instance._enterEnd();
            // }
            if (instance._moving) {
                instance.element.style.left = instance.element.style.top = '';
                // instance._moveEnd();
            }
        });

        // children.forEach(instance => {
            // const element = instance.element;
            // // const transform = getComputedStyle(element).transform;  
            // instance.newPosition = element.getBoundingClientRect();
            // // instance.originTransfrom = transform === 'none' ? '' : transform;
        // });

        // unmountChildren.forEach(instance => {
            // if (instance.originTransfrom === undefined) {
                // instance._needMoveLeaveClass = true;
                // addClass(instance.element, instance.leaveClass);
            // } else {
                // instance._needMoveLeaveClass = false;
            // }
        // });
        // unmountChildren.forEach(instance => {
            // if (instance.originTransfrom === undefined) {
                // const element = instance.element;
                // const transform = getComputedStyle(element).transform;  
                // instance.originTransfrom = transform === 'none' ? '' : transform;
            // }
        // });
        unmountChildren.forEach(instance => {
            // if (instance._needMoveLeaveClass) {
                // removeClass(instance.element, instance.leaveClass);
            // }
            const s = instance.element.style;
            s.position = 'absolute';
            // s.top = s.left = 0;
        });
        // updateChildren.forEach(instance => instance.element.style.position = 'relative');
        // 被删除的元素，又重新进来了，需要把position还原
        // mountChildren.forEach(instance => {
            // if (instance.lastInstance) {
                // const clone = instance.element.cloneNode();
                // clone.style.position = '';
                // clone.style.transform = '';
                // instance.element.parentNode.insertBefore(clone, instance.element);
                // instance.clone = clone;
                // // instance.element.style.position = '';
                // // instance.element.style.transform = '';
                // // instance.element.style.transitionDuration = '0s';
            // }
        // });
        
        // step3: 将unmount元素脱离文档流，用于计算移动元素
        // unmountChildren.forEach(instance => {
            // const element = instance.element;
            // element.style.position = 'absolute';
        // });

        // step4: 获取元素最终位置
        // unmountChildren.forEach(instance => {
            // const element = instance.element;
            // // const transform = getComputedStyle(element).transform;  
            // instance.newPosition = element.getBoundingClientRect();
            // // instance.originTransfrom = transform === 'none' ? '' : transform;
        // });
        // updateChildren.forEach(instance => {
        children.forEach(instance => {
            const element = instance.element;
            // const transform = getComputedStyle(element).transform;  
            // if (!instance._entering) {
                // instance.newPosition = element.getBoundingClientRect();
            // } else {
                instance.newPosition = instance._getPosition();
                // instance.position = instance._getPosition();
            // }
            // instance.originTransfrom = transform === 'none' ? '' : transform;
        });

        // mountChildren.forEach(instance => instance._enter());

        // mountChildren.forEach(instance => {
            // if (instance.lastInstance) {
                // instance.element.style.position = 'absolute';
            // }
        // });


        // step5: 判断元素是否需要移动，并还原到初始位置
        unmountChildren.forEach(instance => instance._initMove(true));
        updateChildren.forEach(instance => instance._initMove());
        mountChildren.forEach(instance => instance._initMove());
        // children.forEach(instance => instance._initMove());

        // step6: 移动元素添加初始类名
        // updateChildren.forEach((instance) => {
        children.forEach((instance) => {
            if (instance._needMove) {
                if (!instance._moving) {
                    instance._move();
                } else {
                    instance._triggerMove();
                }
            }
        });

        // step7: unmount元素初始化类名
        unmountChildren.forEach(instance => instance._unmount());

        // step8: 所有动画都在下一帧处理
        // setTimeout(() => {
        nextFrame(() => {
            // mountChildren.forEach(instance => instance._triggerEnter());
            // unmountChildren.forEach(instance => instance._triggerLeave());
            // updateChildren.forEach(instance => instance._triggerMove());
            // children.forEach((instance) => {
                // if (instance._needMove) {
                    // instance._triggerMove();
                // }
            // });
        });
 
        this.mountChildren = [];
        this.updateChildren = [];
        this.unmountChildren = [];
        // this.children = [];
    },

    _initMove(isUnmount) {
        const element = this.element;
        const oldPosition = this.position;
        const newPosition = this.newPosition;

        this.position = newPosition;
        // mount的元素，不处理位置
        if (!oldPosition) return;

        const dx = oldPosition.left - newPosition.left;
        const dy = oldPosition.top - newPosition.top;
        const oDx = this.dx;
        const oDy = this.dy;

        // this.transform = '';
        // this.originTransfrom = '';
        this.dx = dx;
        this.dy = dy;

        if (dx || dy || oDx || oDy) {
            // 对于move中的元素，需要将它重新回到0
            const s = element.style;
            if (isUnmount) {
                // this.transform = `translate(${dx}px, ${dy}px)`;
                // s.transform = s.WebkitTransform = this.transform;
                // s.transitionDuration = '0s';
                // s.position = '';
                // s.left = `${dx}px`;
                // s.top = `${dy}px`;
                // if (this._entering) {
                    s.left = `${oldPosition.left}px`;
                    s.top = `${oldPosition.top}px`;
                // } else {
                    // s.left = `${dx}px`;
                    // s.top = `${dy}px`;
                // }
                this._needMove = false;
            } else {
                this._needMove = true;
                s.position = 'relative';
                s.left = `${dx}px`;
                s.top = `${dy}px`;
            }
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
                s.position = s.left = s.top = s.transform = s.WebkitTransform = '';
                this._moving = false;
            }
        };
        TransitionEvents.on(element, this._moveEnd);
        if (!onlyInit) {
            this._triggerMove();
            // nextFrame(() => this._triggerMove());
        }
    },

    _triggerMove() {
        const s = this.element.style;
        // s.transform = s.WebkitTransform = s.transitionDuration = '';
        s.transform = s.WebkitTransform = `translate(${0 - this.dx}px, ${0 - this.dy}px)`;
    },

    _enter(onlyInit) {
        this._entering = true;
        const element = this.element;
        const enterClass = this.enterClass;
        const enterActiveClass = this.enterActiveClass;

        // 如果这个元素是上一个删除的元素，则从当前状态回到原始状态
        if (this.lastInstance) {
            this.lastInstance._unmountCancelled = true;
            this.lastInstance._leaveEnd();
            if (this.lastInstance._triggeredLeave) {
                addClass(element, enterActiveClass);
            } else {
                // 如果上一个元素还没来得及做动画，则当做新元素处理
                addClass(element, enterClass);
            }
        } else {
            addClass(element, enterClass);
            // addClass(this.element, this.enterActiveClass);
        }
        TransitionEvents.on(element, this._enterEnd);
        if (!onlyInit) {
            nextFrame(() => this._triggerEnter());
        }
    },

    _triggerEnter() {
        this._triggeredEnter = true;
        if (this._entering === false) {
            return removeClass(this.element, this.enterActiveClass);
        }
        addClass(this.element, this.enterActiveClass);
        removeClass(this.element, this.enterClass);
    },

    _leave(onlyInit) {
        const element = this.element;
        if (this._triggeredEnter) {
            // 如果当前元素还没有来得及做enter动画，就被删除
            // 则leaveActiveClass和leaveClass都放到下一帧添加
            // 否则leaveClass和enterClass一样就不会有动画效果
            addClass(element, this.leaveActiveClass);
        }
        TransitionEvents.on(element, this._leaveEnd);
        if (!onlyInit) {
            nextFrame(() => {
                this._triggerLeave();
            });
        }
    },

    _triggerLeave() {
        this._triggeredLeave = true;
        if (this._leaving === false) {
            return;
        }
        const element = this.element;
        addClass(element, this.leaveActiveClass);
        addClass(element, this.leaveClass);
    },

    destroy(lastVNode, nextVNode, parentDom) {
        // 不存在parentDom，则表示parentDom将被删除
        // 那子组件也要直接销毁掉，
        // 否则，所有的动画组件，都等到动画结束才销毁
        if (!parentDom && (!lastVNode || !nextVNode) && (this.parentVNode.dom !== this.element) || this.get('a:disabled') || this._leaving === false) {
        // if (!nextVNode || nextVNode.key !== lastVNode.key || this.get('a:disabled') || this._leaving === false) {
            this._super(lastVNode, nextVNode);
        }
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
