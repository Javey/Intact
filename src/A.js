import Intact from './intact';
import {isNullOrUndefined} from 'miss/src/utils';
import Vdt from 'vdt';

export default Intact.extend({
    defaults: {
        'a:tag': 'div',
        'a:transition': 'animate'
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
        console.log(arguments);
        console.log(this.parentDom && this.parentDom._reserve);
        if (this.parentDom && this.parentDom._reserve) {
            lastVNode = this.parentDom._reserve[nextVNode.key];
        }
        return this._super(lastVNode, nextVNode);
    },

    _create() {
        console.log('create', this.element);

        const element = this.element;
        if (element.mount) return;

        const mount = function(vNode, parentDom) {
            const instance = vNode.children.vdt.vNode.children;

            mount.done = function() {
                // element.mountCancelled = false;
                // element.mountDone = true;
                mount.cancelled = false;
                mount.isRunning = false;
            };

            mount.callback = function(e) {
                e && e.stopPropagation();
                removeClass(element, `${transition}-enter`);
                removeClass(element, `${transition}-enter-active`);
                unmount.done();
            };

            mount.cancelled = false;
            mount.isRunning = false;

            instance._performEnter(vNode, parentDom);
        };
        const unmount = function(vNode, parentDom) {
            // const instance = vNode.children;
            const instance = vNode.children.vdt.vNode.children;
            const transition = instance.get('a:transition');

            if (!parentDom._reserve) {
                parentDom._reserve = {};
            }
            parentDom._reserve[vNode.key] = instance.vdt.vNode;

            unmount.done = function() {
                if (!unmount.cancelled) {
                    parentDom.removeChild(element);
                }
                unmount.cancelled = false;
                unmount.isRunning = false;
                parentDom._reserve[vNode.key] = null;
            };

            unmount.callback = function(e) {
                e && e.stopPropagation();
                removeClass(element, `${transition}-leave`);
                removeClass(element, `${transition}-leave-active`);
                unmount.done();
            };
    
            unmount.cancelled = false;
            unmount.isRunning = false;

            instance._performLeave(vNode, parentDom);
        };

        element._mount = mount;
        element._unmount = unmount;
    },

    _performEnter(vNode, parentDom) {
        const element = this.element;
        const mount = element._mount;
        if (mount.cancelled) {
            TransitionEvents.off(element, mount.callback);
            mount.callback();
            return; 
        }
        const unmount = element._unmount;
        mount.isRunning = true;
        if (unmount.isRunning) {
            unmount.cancelled = true;
            unmount(vNode, parentDom);
        }
        this._enter(mount.callback);
    },

    _performLeave(vNode, parentDom) {
        const element = this.element;
        const unmount = element._unmount;
        if (unmount.cancelled) {
            TransitionEvents.off(element, unmount.callback);
            unmount.callback();
            // element._isunmountCancelled = true;
            return;
        }
        const mount = element._mount;
        unmount.isRunning = true;
        if (mount.isRunning) {
            mount.cancelled = true;
            mount(vNode, parentDom);
        }
        this._leave(unmount.callback);
    },

    _enter(done) {
        const transition = this.get('a:transition');
        const element = this.element;

        // console.log('aaaaa', element._isunmountCancelled);
        // if (!element._isunmountCancelled) {
            addClass(element, `${transition}-enter`);
        // }
        TransitionEvents.one(element, done);
        element.offsetWidth;
        // nextFrame(() => {
            addClass(element, `${transition}-enter-active`);
        // });
    },

    _leave(done) {
        const transition = this.get('a:transition');
        const element = this.element;
        addClass(element, `${transition}-leave`);
        TransitionEvents.one(element, done);
        element.offsetWidth;
        // nextFrame(() => {
            addClass(element, `${transition}-leave-active`);
        // });
    }
});

function mount(instance, vNode, parentDom) {
    const element = instance.element;
    
}

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
