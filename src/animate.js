import Intact from './intact';
import {Types} from 'misstime/src/vnode';
import {isNullOrUndefined, noop, inBrowser, keys} from './utils';
import Vdt from 'vdt';

let Animate;
export default Animate = Intact.extend({
    defaults: {
        'a:tag': 'div',
        'a:transition': 'animate',
        'a:appear': false,
        'a:mode': 'both', // out-in | in-out | both
        'a:disabled': false, // 只做动画管理者，自己不进行动画
        'a:move': true, // 是否执行move动画
        'a:css': true, // 是否使用css动画，如果自定义动画函数，可以将它置为false
    },

    template() {
        const h = Vdt.miss.h;
        const self = this.data;
        const tagName = self.get('a:tag');
        const props = {};
        const _props = self.get();
        for (let key in _props) {
            if (
                key !== 'ref' && 
                key !== 'key' && 
                (key[0] !== 'a' || key[1] !== ':') && 
                key.substr(0, 5) !== 'ev-a:'
            ) {
                props[key] = _props[key];
            }
        }
        return h(tagName, props, self.get('children'));
    },

    _init() {
        this.isSupportCssTransition = endEvents.length;
        if (!this.isSupportCssTransition) {
            // 如果不支持css动画，则关闭css
            this.set({
                'a:css': false,
                'a:move': false
            }, {silent: true});
        }

        this.mountChildren = [];
        this.unmountChildren = [];
        this.updateChildren = [];
        this.children = [];
        this._enteringAmount = 0;
        this._leavingAmount = 0;
    },

    _hasJsTransition() {
        const events = this._events;
        for (let key in events) {
            if (key[0] === 'a' && key[1] === ':') {
                if (events[key].length) {
                    return true;
                }
            }
        }
        return false;
    },

    init: inBrowser ? 
        function(lastVNode, nextVNode) {
            // if (this.get('a:disabled')) {
                // return this._super(lastVNode, nextVNode);
            // }

            const parentDom = this.parentVNode && this.parentVNode.dom || this.parentDom;
            if (parentDom && parentDom._reserve) {
                lastVNode = parentDom._reserve[nextVNode.key];
            }
            return this._super(lastVNode, nextVNode);
        } : 
        function() { 
            return this._superApply(arguments); 
        },

    _mount(lastVNode, vNode) {
        let isAppear = false;
        if (this.isRender) {
            let parent;
            if (
                this.get('a:appear') && 
                (
                    this.parentDom ||
                    (parent = this.parentVNode) &&
                    (parent.type & Types.ComponentClassOrInstance) &&
                    !parent.children.isRender
                )
            ) {
                isAppear = true;
            }
        }

        const element = this.element;

        const initClassName = () => {
            const transition = this.get('a:transition');
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
            this.enterEventName = isAppear ? 'a:appear' : 'a:enter';
        };
        this.on('$change:a:transition', initClassName);
        initClassName();


        // 一个动画元素被删除后，会被保存
        // 如果在删除的过程中，又添加了，则要清除上一个动画状态
        // 将这种情况记录下来
        if (this._lastVNode && this._lastVNode !== lastVNode) {
            const lastInstance = this._lastVNode.children;
            if (lastInstance._leaving) {
                this.lastInstance = lastInstance;
            }
        }

        const parentInstance = this.parentInstance = this._getParentAnimate();

        this._enterEnd = (e) => {
            if (this.get('a:css') && !this.get('a:disabled')) {
                e && e.stopPropagation && e.stopPropagation();
                removeClass(element, this.enterClass);
                removeClass(element, this.enterActiveClass);
            }
            TransitionEvents.off(element, this._enterEnd);
            this._entering = false;
            if (parentInstance) {
                if (--parentInstance._enteringAmount === 0 &&
                    parentInstance.get('a:mode') === 'in-out'
                ) {
                    nextFrame(() => {
                        parentInstance._checkMode();
                    });
                }
            }
            this.trigger(`${this.enterEventName}End`, element);
        };

        element._unmount = (nouse, parentDom) => {
            // 如果该元素是延迟mount的元素，则直接删除
            if (this._delayEnter) {
                parentDom.removeChild(element);
                this.destroy(vNode);
                parentInstance._enteringAmount--;
                return;
            }
            const isNotAnimate = !this.get('a:css') && !this._hasJsTransition() || 
                this.get('a:disabled');
            this.vNode = vNode;
            this.parentDom = parentDom;
            if (parentInstance && !isNotAnimate) {
                parentInstance._leavingAmount++;
                if (parentInstance.get('a:mode') === 'in-out') {
                    parentInstance.updateChildren.push(this);
                    this._delayLeave = true;
                } else {
                    parentInstance.unmountChildren.push(this);
                }
                parentInstance.children.push(this);
            } else if (isNotAnimate) {
                parentDom.removeChild(element);
                this.destroy(vNode);
            } else {
                this._unmount();
            }
        };

        if (parentInstance) {
            // 如果存在父动画组件，则使用父级进行管理
            // 统一做动画
            if (isAppear || !this.isRender) {
                if (this.lastInstance && this.lastInstance._delayLeave) {
                    parentInstance.updateChildren.push(this);
                } else {
                    parentInstance._enteringAmount++;
                    // 如果没有unmount的元素，则直接enter
                    if (parentInstance._leavingAmount > 0 &&
                        parentInstance.get('a:mode') === 'out-in'
                    ) {
                        this._delayEnter = true;
                        element.style.display = 'none';
                    } else {
                        parentInstance.mountChildren.push(this);
                    }
                }
            }
            parentInstance.children.push(this);
        } else if (isAppear || !this.isRender) {
            // 否则单个元素自己动画
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
        const vNode = this.vNode;
        const parentDom = this.parentDom;
        // vNode都会被添加key，当只有一个子元素时，vNode.key === undefined
        // 这种情况，我们也当成有key处理，此时key为undefined
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
            if (this.get('a:css') && !this.get('a:disabled')) {
                e && e.stopPropagation && e.stopPropagation();
                removeClass(element, this.leaveClass);
                removeClass(element, this.leaveActiveClass);
            }
            const s = element.style;
            s.position = s.top = s.left = s.transform = s.WebkitTransform = '';
            this._leaving = false;
            delete parentDom._reserve[vNode.key];
            TransitionEvents.off(element, this._leaveEnd);
            if (!this._unmountCancelled) {
                parentDom.removeChild(element);
                this.destroy(vNode, null, parentDom);
            }
            const parentInstance = this.parentInstance;
            if (parentInstance) {
                if (--parentInstance._leavingAmount === 0 &&
                    parentInstance.get('a:mode') === 'out-in'
                ) {
                    parentInstance._checkMode();
                }
            }
            this.trigger('a:leaveEnd', element);
        };

        this._leave(onlyInit);
        // 存在一种情况，相同的dom，同时被子组件和父组件管理的情况
        // 所以unmount后，将其置为空函数，以免再次unmount
        element._unmount = noop;

        this.trigger('a:leaveStart', element);
    },

    _beforeUpdate(lastVNode, vNode) {
        // 更新之前，这里的children不包含本次更新mount进来的元素
        const children = this.children;
        const reservedChildren = [];
        const isMove = this.get('a:move');
        for (let i = 0; i < children.length; i++) {
            let instance = children[i];
            if (!instance._leaving && isMove) {
                instance.position = instance._getPosition();
            }
            if (instance._delayLeave) {
                reservedChildren.push(instance);
                this.updateChildren.push(instance);
            }
        }
        this.children = reservedChildren;
    },

    _getPosition() {
        const element = this.element;
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
    },

    /**
     * 尽量保持动画的连贯性
     */
    _update(lastVNode, vNode, isFromCheckMode) {
        let parentInstance;
        if (!this.get('a:disabled')) {
            parentInstance = this.parentInstance;
            if (parentInstance) {
                parentInstance.updateChildren.push(this);
                parentInstance.children.push(this);
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
            mountChildren.forEach(instance => {
                // 如果当前元素是从上一个unmount的元素来的，
                // 则要初始化最新位置，因为beforeUpdate中
                // 不包括当前mount元素的位置初始化
                // 这样才能保持位置的连贯性
                if (instance.lastInstance) {
                    instance.position = instance._getPosition();
                }
            });
        }
        mountChildren.forEach(instance => instance._enter());

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
                instance.newPosition = instance._getPosition();
            });

            // 分别判断元素是否需要移动，并保持当前位置不变
            // unmount的元素，从当前位置直接leave，不要move了
            unmountChildren.forEach(instance => instance._initMove(true));
            updateChildren.forEach(instance => instance._initMove());
            mountChildren.forEach(instance => instance._initMove());

            // 对于animation动画，enterEnd了entering元素
            // 需要re-layout，来触发move动画
            document.body.offsetWidth;

            // 如果元素需要移动，则进行move动画
            children.forEach((instance) => {
                if (instance._needMove) {
                    if (!instance._moving) {
                        instance._move();
                    } else {
                        // 如果已经在移动了，那直接改变translate，保持动画连贯
                        instance._triggerMove();
                    }
                }
            });
        }

        // unmount元素做leave动画
        unmountChildren.forEach(instance => instance._unmount());

        this.mountChildren = [];
        this.updateChildren = [];
        this.unmountChildren = [];
    },

    _checkMode() {
        const mountChildren = [];
        const updateChildren = [];
        const unmountChildren = [];
        const children = this.children = this.children.filter(instance => {
            if (instance._delayEnter) {
                instance._delayEnter = false;
                mountChildren.push(instance);
                return false;
            } else if (instance._delayLeave) {
                instance._delayLeave = false;
                unmountChildren.push(instance);
                return true;
            } else if (instance._leaving !== false) {
                updateChildren.push(instance);
                return true;
            }
            return false;
        });
        this._beforeUpdate();
        mountChildren.forEach(instance => {
            instance.element.style.display = '';
            instance.position = null;
        });
        this.mountChildren = mountChildren;
        this.updateChildren = updateChildren;
        this.unmountChildren = unmountChildren;
        this.children  = children.concat(mountChildren);
        this._update(null, null, true);
    },

    _initMove(isUnmount) {
        const element = this.element;
        const oldPosition = this.position;
        const newPosition = this.newPosition;

        this.position = newPosition;

        // 对于新mount的元素，不进行move判断
        if (!oldPosition) return;

    
        const dx = oldPosition.left - newPosition.left;
        const dy = oldPosition.top - newPosition.top;
        const oDx = this.dx;
        const oDy = this.dy;

        this.dx = dx;
        this.dy = dy;

        if (dx || dy || oDx || oDy) {
            // 对于move中的元素，需要将它重新回到0
            const s = element.style;
            if (isUnmount) {
                s.left = `${oldPosition.left}px`;
                s.top = `${oldPosition.top}px`;
                this._needMove = false;
            } else {
                // 如果当前元素正在enter，而且是animation动画，则要enterEnd
                // 否则无法move
                if (this._entering && getAnimateType(element) !== 'transition') {
                    this._enterEnd();
                }
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
        if (this.get('a:disabled')) return;
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
                this.dx = this.dy = 0;
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
        s.transform = s.WebkitTransform = `translate(${0 - this.dx}px, ${0 - this.dy}px)`;
    },

    _enter(onlyInit) {
        if (this.get('a:disabled')) return;
        this._entering = true;
        const element = this.element;
        const enterClass = this.enterClass;
        const enterActiveClass = this.enterActiveClass;
        const isCss = this.get('a:css');

        // 如果这个元素是上一个删除的元素，则从当前状态回到原始状态
        if (this.lastInstance) {
            this.lastInstance._unmountCancelled = true;
            this.lastInstance._leaveEnd();

            if (isCss) {
                if (this.lastInstance._triggeredLeave) {
                    // addClass(element, enterActiveClass);
                    // 保持连贯，添加leaveActiveClass
                    addClass(element, this.leaveActiveClass);
                } else {
                    // 如果上一个元素还没来得及做动画，则当做新元素处理
                    addClass(element, enterClass);
                }
            }
        } else if (isCss) {
            addClass(element, enterClass);
        }
        TransitionEvents.on(element, this._enterEnd);

        this.trigger(`${this.enterEventName}Start`, element);

        if (!onlyInit) {
            if (isCss && getAnimateType(element, enterActiveClass) !== 'animation') {
                nextFrame(() => this._triggerEnter());
            } else {
                // 对于animation动画，同步添加enterActiveClass，避免闪动
                this._triggerEnter();
            }
        }
    },

    _triggerEnter() {
        const element = this.element;
        this._triggeredEnter = true;
        if (this.get('a:css')) {
            if (this._entering === false) {
                return removeClass(element, this.enterActiveClass);
            }
            addClass(element, this.enterActiveClass);
            removeClass(element, this.enterClass);
            removeClass(element, this.leaveActiveClass);
        }
        this.trigger(this.enterEventName, element, this._enterEnd);
    },

    _leave(onlyInit) {
        const element = this.element;
        // 为了保持动画连贯，我们立即添加leaveActiveClass
        // 但如果当前元素还没有来得及做enter动画，就被删除
        // 则leaveActiveClass和leaveClass都放到下一帧添加
        // 否则leaveClass和enterClass一样就不会有动画效果
        if (this._triggeredEnter && this.get('a:css')) {
            addClass(element, this.leaveActiveClass);
        }
        // TransitionEvents.on(element, this._leaveEnd);
        if (!onlyInit) {
            nextFrame(() => {
                // 存在一种情况，当一个enter动画在完成的瞬间，
                // 这个元素被删除了，由于前面保持动画的连贯性
                // 添加了leaveActiveClass，则会导致绑定的leaveEnd
                // 立即执行，所以这里放到下一帧来绑定
                TransitionEvents.on(element, this._leaveEnd);
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
        if (this.get('a:css')) {
            addClass(element, this.leaveActiveClass);
            addClass(element, this.leaveClass);
        }
        this.trigger('a:leave', element, this._leaveEnd);
    },

    destroy(lastVNode, nextVNode, parentDom) {
        // 不存在parentDom，则表示parentDom将被删除
        // 那子组件也要直接销毁掉，
        // 否则，所有的动画组件，都等到动画结束才销毁
        if (!parentDom && (!lastVNode || !nextVNode) &&
            (this.parentVNode.dom !== this.element) ||
            // this.get('a:disabled') || 
            this._leaving === false
        ) {
            this._super(lastVNode, nextVNode, parentDom);
        }
    }
});

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
let transitionProp = 'transition';
let animationProp = 'animation';

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
                if (baseEventName === 'transitionend') {
                    transitionProp = styleName;
                } else {
                    animationProp = styleName;
                }
                break;
            }
        }
    }
}

function getAnimateType(element, className) {
    if (className) addClass(element, className);
    const style = window.getComputedStyle(element);
    const transitionDurations = style[`${transitionProp}Duration`].split(', ');
    const animationDurations = style[`${animationProp}Duration`].split(', ');
    const transitionDuration = getDuration(transitionDurations);
    const animationDuration = getDuration(animationDurations);
    if (className) removeClass(element, className);
    return transitionDuration > animationDuration ? 'transition' : 'animation';
}

function getDuration(durations) {
    return Math.max.apply(null, durations.map(d => d.slice(0, -1) * 1000));
}

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

let raf;
export function nextFrame(fn) {
    raf(() => raf(fn));
}

if (inBrowser) {
    raf = window.requestAnimationFrame ? 
        window.requestAnimationFrame.bind(window) : setTimeout;

    detectEvents();
}

const CSSMatrix = typeof WebKitCSSMatrix !== 'undefined' ? 
    WebKitCSSMatrix : 
    function(transform) {
        this.m42 = 0;
        this.m41 = 0;
        const type = transform.slice(0, transform.indexOf('('));
        let parts;
        if (type === 'matrix3d') {
            parts = transform.slice(9, -1).split(',');
            this.m41 = parseFloat(parts[12]);
            this.m42 = parseFloat(parts[13]);
        } else if (type === 'matrix') {
            parts = transform.slice(7, -1).split(',');
            this.m41 = parseFloat(parts[4]);
            this.m42 = parseFloat(parts[5]);
        }
    };
