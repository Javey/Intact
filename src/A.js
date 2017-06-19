import Intact from './intact';
import {isNullOrUndefined, MountedQueue as Queue} from 'miss/src/utils';
import {Types} from 'miss/src/vnode';
import Vdt from 'vdt';

export default Intact.extend({
    defaults: {
        'a:tag': 'div',
        'a:transition': 'animate',
        'a:appear': false,
        'a:mode': 'both', // out-in | in-out
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
        const parentDom = this.parentDom;
        if (parentDom && parentDom._reserve) {
            lastVNode = parentDom._reserve[nextVNode.key];
        }
        return this._super(lastVNode, nextVNode);
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
                    parent.type & Types.ComponentClassOrInstance &&
                    !parent.children.isRender
                )
            ) {
                isAppear = true;
            }
        }

        const transition = this.get('a:transition');
        const element = this.element;

        // const parentDom = this.parentDom;
        // if (!parentDom._queue) {
            // parentDom._queue = {};
        // }
        // if (!parentDom._queue.mountedQueue) {
            // parentDom._queue.mountedQueue = new Queue();
        // }
        // parentDom._queue.mountedQueue.push(() => {
            // this.position = element.getBoundingClientRect();
        // });

        let enterClass;
        let enterActiveClass;
        if (isAppear) {
            enterClass = `${transition}-appear`;
            enterActiveClass = `${transition}-appear-active`;
        } else {
            enterClass = `${transition}-enter`;
            enterActiveClass = `${transition}-enter-active`;
        }

        this._enterEnd = (e) => {
            e && e.stopPropagation();
            removeClass(element, enterClass);
            removeClass(element, enterActiveClass);
            this._entering = false;
            TransitionEvents.off(element, this._enterEnd);
        };

        if (this._lastVNode && this._lastVNode !== lastVNode) {
            const lastInstance = this._lastVNode.children;
            if (lastInstance._leaving) {
                TransitionEvents.off(element, lastInstance._leaveEnd);
                lastInstance._unmountCancelled = true;
                lastInstance._leaveEnd();
            }
        }

        if (isAppear || !this.isRender) {
            this._entering = true;
            this._enter(this._enterEnd, enterClass, enterActiveClass);
        }

        element._unmount = (nouse, parentDom) => {
            this._unmount(lastVNode, vNode, parentDom);
        };

        this.position = element.getBoundingClientRect();
    },

    _unmount(lastVNode, vNode, parentDom) {
        const element = this.element;
        const transition = this.get('a:transition');

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
            removeClass(element, `${transition}-leave`);
            removeClass(element, `${transition}-leave-active`);
            if (!this._unmountCancelled) {
                parentDom.removeChild(element);
            }
            this._leaving = false;
            delete parentDom._reserve[vNode.key];
            TransitionEvents.off(element, this._leaveEnd);
            // this.__destroyVNode(vNode);
            this.destroy(vNode);
        };

        this._leave(this._leaveEnd);
    },

    _update(lastVNode, vNode) {
        return;
        // nextFrame(() => {

        if (this._moving) this._moveEnd();
        if (this._entering) this._enterEnd();

        const element = this.element;
        const oldPosition = this.position;
        const newPosition = this.position = element.getBoundingClientRect();
        // const oldPosition = newPosition;
        const dx = oldPosition.left - newPosition.left;
        const dy = oldPosition.top - newPosition.top;
        if (dx || dy) {
            this._moving = true;
            const s = element.style;
            s.transform = s.WebkitTransform = `translate(${dx}px, ${dy}px)`;
            s.transitionDuration = '0s';
            const className = `${this.get('a:transition')}-move`;
            addClass(element, className);
            document.body.offsetWidth;
            s.transform = s.WebkitTransform = s.transitionDuration = '';
            this._moveEnd = (e) => {
                e && e.stopPropagation();
                if (!e || /transform$/.test(e.propertyName)) {
                    TransitionEvents.off(element, this._moveEnd);
                    removeClass(element, className);
                    this._moving = false;
                }
            };
            TransitionEvents.on(element, this._moveEnd);
        }
        // })
    },

    _enter(done, enterClass, enterActiveClass) {
        const element = this.element;

        addClass(element, enterClass);
        addClass(element, enterActiveClass);
        // element.offsetWidth;
        TransitionEvents.on(element, done);
        nextFrame(() => {
        // setTimeout(() => {
            // addClass(element, enterActiveClass);
            removeClass(element, enterClass);
        });
    },

    _leave(done) {
        const transition = this.get('a:transition');
        const element = this.element;
        // addClass(element, `${transition}-leave`);
        addClass(element, `${transition}-leave-active`);
        TransitionEvents.on(element, done);
        // element.offsetWidth;
        nextFrame(() => {
            // addClass(element, `${transition}-leave-active`);
            addClass(element, `${transition}-leave`);
        });
    },

    destroy(lastVNode, nextVNode) {
        if (this._leaving !== false) return;
        this._super(lastVNode, nextVNode);
    }
});

const raf = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : setTimeout;
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
