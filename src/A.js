import Intact from './intact';
import {isNullOrUndefined} from 'miss/src/utils';
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
        console.log('lastVNode', lastVNode);
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

        this._enterEnd = (e) => {
            e && e.stopPropagation();
            removeClass(element, enterClass);
            removeClass(element, enterActiveClass);
            this._entering = false;
            TransitionEvents.off(element, this._enterEnd);
        }

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
        }
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
        }

        this._leave(this._leaveEnd);
    },

    _enter(done, enterClass, enterActiveClass) {
        const element = this.element;

        addClass(element, enterClass);
        TransitionEvents.on(element, done);
        // element.offsetWidth;
        nextFrame(() => {
            addClass(element, enterActiveClass);
        });
    },

    _leave(done) {
        const transition = this.get('a:transition');
        const element = this.element;
        addClass(element, `${transition}-leave`);
        TransitionEvents.on(element, done);
        // element.offsetWidth;
        nextFrame(() => {
            addClass(element, `${transition}-leave-active`);
        });
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
