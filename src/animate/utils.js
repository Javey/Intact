import {inBrowser} from '../utils';

export function addClass(element, className) {
    if (className) {
        if (element.classList) {
            element.classList.add(className);
        } else if (!hasClass(element, className)) {
            element.className += ` ${className}`;
        }
    }
    return element;
}

export function hasClass(element, className) {
    if (element.classList) {
        return !!className && element.className.contains(className);
    }
    return (` ${element.className} `).indexOf(` ${className} `) > -1;
}

export function removeClass(element, className) {
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

const EVENT_NAME_MAP = {
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

export const endEvents = [];
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

export function getAnimateType(element, className) {
    if (className) addClass(element, className);
    const style = window.getComputedStyle(element);
    const transitionDurations = style[`${transitionProp}Duration`].split(', ');
    const animationDurations = style[`${animationProp}Duration`].split(', ');
    const transitionDuration = getDuration(transitionDurations);
    const animationDuration = getDuration(animationDurations);
    if (className) removeClass(element, className);
    return transitionDuration > animationDuration ? 'transition' : 'animation';
}

export function getDuration(durations) {
    return Math.max.apply(null, durations.map(d => d.slice(0, -1) * 1000));
}

export function addEventListener(node, eventName, eventListener) {
    node.addEventListener(eventName, eventListener, false);
}

export function removeEventListener(node, eventName, eventListener) {
    node.removeEventListener(eventName, eventListener, false);
}

export const TransitionEvents = {
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
    const _fn = () => {
        if (_fn.cancelled) return;
        fn();
    };
    raf(() => raf(_fn));
    return () => {
        _fn.cancelled = true;
    };
}

if (inBrowser) {
    raf = window.requestAnimationFrame ? 
        window.requestAnimationFrame.bind(window) : setTimeout;

    detectEvents();
}

export const CSSMatrix = typeof WebKitCSSMatrix !== 'undefined' ? 
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
