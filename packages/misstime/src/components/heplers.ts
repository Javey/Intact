import {isNull, isNullOrUndefined, isString} from '../utils/helpers';
import {hasDocumentAvailable} from '../utils/common';

export enum AnimateType {
    Transition = 0,
    Animation,
}

export type AnimationInfo = {
    type: AnimateType,
    timeout: number,
    propCount: number
}

export let addClass: (dom: Element, className: string) => void;
export let removeClass: (dom: Element, className: string) => void;
let raf: (fn: () => void) => void;
const endEvents: string[] = [];
let transitionProp = 'transition';
let animationProp = 'animation';
if (hasDocumentAvailable) {
    raf = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        (window as any).mozRequestAnimationFrame ||
        (window as any).msRequestAnimationFrame ||
        window.setTimeout;

    const testEl = document.createElement('div');

    // set handle class function
    if (testEl.classList) {
        addClass = (dom: Element, className: string) => dom.classList.add(className);
        removeClass = (dom: Element, className: string) => dom.classList.remove(className);
    } else {
        const hasClass = (dom: Element, className: string) => ` ${dom.className} `.indexOf(` ${className} `) > -1;
        addClass = (dom: Element, className: string) => !hasClass(dom, className) && (dom.className += ' ' + className);
        removeClass = (dom: Element, className: string) => {
            if (hasClass(dom, className)) {
                dom.className = dom.className
                    .replace(new RegExp(`(^|\\s)${className}(?:\\s|$)`, 'g'), '$1')
                    .replace(/\s+/g, ' ') // multiple spaces to one
                    .replace(/^\s*|\s*$/g, ''); // trim the ends
            }
        } 
    }

    const EVENT_NAME_MAP: any = {
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

    const style = testEl.style;

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

export const TransitionEvents = {
    on: function(dom: Element, eventListener: EventListener) {
        if (endEvents.length === 0) {
            // If CSS transitions are not supported, trigger an "end animation"
            // event immediately.
            window.setTimeout(eventListener, 0);
            return;
        }
        endEvents.forEach(function(endEvent) {
            dom.addEventListener(endEvent, eventListener, false);
        });
    },

    off: function(dom: Element, eventListener: EventListener) {
        if (endEvents.length === 0) {
            return;
        }
        endEvents.forEach(function(endEvent) {
            dom.removeEventListener(endEvent, eventListener, false);
        });
    },

    // one: function(node, eventListener) {
        // let listener = function() {
            // eventListener.apply(this, arguments);
            // TransitionEvents.off(node, listener);
        // };
        // TransitionEvents.on(node, listener);
    // }
};

export function className(obj?: Record<string | number, any> | null | string) {
    if (isNullOrUndefined(obj)) {
        return;
    } 
    if (isString(obj)) return obj;

    const ret = [];
    for (let key in obj) {
        if (obj[key]) {
            ret.push(key);
        }
    }

    return ret.join(' ');
}

export function nextFrame(fn: () => void) {
    raf!(() => raf!(fn));
}

// @reference Vue
export function whenAnimationEnds(dom: Element, cb: () => void) {
    const {timeout, propCount} = getAnimationInfo(dom);
    let ended = 0;
    const onEnd = (e: Event) => {
        if (e.target === dom && ++ended >= propCount) {
            end();
        }
    };
    const end = () => {
        TransitionEvents.off(dom, onEnd);
        clearTimeout(timer); 
        cb();
    };
    const timer = setTimeout(() => {
        if (ended < propCount) {
            end();
        }
    }, timeout + 1);

    TransitionEvents.on(dom, onEnd);
}

export function getAnimationInfo(dom: Element): AnimationInfo {
    const styles: any = window.getComputedStyle(dom);
    const getStyleProperties = (key: string) => (styles[key] || '').split(', ');
    const transitionDelays = getStyleProperties(transitionProp + 'Delay');
    const transitionDurations = getStyleProperties(transitionProp + 'Duration');
    const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
    const animationDelays = getStyleProperties(animationProp + 'Delay');
    const animationDurations = getStyleProperties(animationProp + 'Duration');
    const animationTimeout = getTimeout(animationDelays, animationDurations);

    const type = transitionTimeout > animationTimeout ? AnimateType.Transition : AnimateType.Animation;
    const timeout = Math.max(transitionTimeout, animationTimeout);
    const propCount = type === AnimateType.Transition ? transitionDurations.length : animationDurations.length;

    return {type, timeout, propCount};
}

function getTimeout(delays: string[], durations: string[]) {
    const l = delays.length;
    return Math.max.apply(null, durations.map((d, i) => toMs(d) + toMs(delays[i % l])));
}

function toMs(s: string) {
    return (s.slice(0, -1) as unknown as number) * 1000;
}
