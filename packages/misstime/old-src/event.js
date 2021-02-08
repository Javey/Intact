import {
    SimpleMap, isNullOrUndefined, createObject, 
    doc as document, browser, isArray, config
} from './utils';

function preventDefault() {
    this.returnValue = false;
}

function stopPropagation() {
    this.cancelBubble = true;
    this.stopImmediatePropagation && this.stopImmediatePropagation();
}

let addEventListener;
let removeEventListener;
function fixEvent(fn) {
    if (!fn._$cb) {
        fn._$cb = (event) => {
            // for compatibility
            event._rawEvent = event

            event.stopPropagation = stopPropagation;
            if (!event.preventDefault) {
                event.preventDefault = preventDefault;
            }
            fn(event);
        }
    }
    return fn._$cb;
}
if ('addEventListener' in document) {
    addEventListener = function(dom, name, fn) {
        fn = fixEvent(fn);
        dom.addEventListener(name, fn, false);
    };

    removeEventListener = function(dom, name, fn) {
        dom.removeEventListener(name, fn._$cb || fn);
    };
} else {
    addEventListener = function(dom, name, fn) {
        fn = fixEvent(fn);
        dom.attachEvent(`on${name}`, fn);
    };

    removeEventListener = function(dom, name, fn) {
        dom.detachEvent(`on${name}`, fn._$cb || fn);
    };
}

const delegatedEvents = {};
const unDelegatesEvents = {
    'mouseenter': true,
    'mouseleave': true,
    'propertychange': true,
    'scroll': true,
    'wheel': true,
};

// change event can not be deletegated in IE8 
if (browser.isIE8) {
    unDelegatesEvents.change = true;
}

export function handleEvent(name, lastEvent, nextEvent, dom) {
    // debugger;
    if (name === 'blur') {
        name = 'focusout';
    } else if (name === 'focus') {
        name = 'focusin';
    } else if (browser.isIE8 && name === 'input') {
        name = 'propertychange';
    }

    if (!config.disableDelegate && !unDelegatesEvents[name]) {
        let delegatedRoots = delegatedEvents[name];

        if (nextEvent) {
            if (!delegatedRoots) {
                delegatedRoots = {items: new SimpleMap(), docEvent: null};
                delegatedRoots.docEvent = attachEventToDocument(name, delegatedRoots); 
                delegatedEvents[name] = delegatedRoots;
            }
            delegatedRoots.items.set(dom, nextEvent);
        } else if (delegatedRoots) {
            const items = delegatedRoots.items;
            if (items.delete(dom)) {
                if (items.size === 0) {
                    removeEventListener(document, name, delegatedRoots.docEvent);
                    delete delegatedEvents[name];
                }
            }
        }
    } else {
        if (lastEvent) {
            if (isArray(lastEvent)) {
                for (let i = 0; i < lastEvent.length; i++) {
                    if (lastEvent[i]) {
                        removeEventListener(dom, name, lastEvent[i]);
                    }
                }
            } else {
                removeEventListener(dom, name, lastEvent);
            }
        }
        if (nextEvent) {
            if (isArray(nextEvent)) {
                for (let i = 0; i < nextEvent.length; i++) {
                    if (nextEvent[i]) {
                        addEventListener(dom, name, nextEvent[i]);
                    }
                }
            } else {
                addEventListener(dom, name, nextEvent);
            }
        }
    }
}

function dispatchEvent(event, target, items, count, isClick, eventData) {
    // if event has cancelled bubble, return directly  
    // otherwise it is also triggered sometimes, e.g in React
    if (event.cancelBubble) {
        return;
    }

    const eventToTrigger = items.get(target);
    if (eventToTrigger) {
        count--;
        eventData.dom = target;
        // for fallback when Object.defineProperty is undefined
        event._currentTarget = target;
        if (isArray(eventToTrigger)) {
            for (let i = 0; i < eventToTrigger.length; i++) {
                const _eventToTrigger = eventToTrigger[i];
                if (_eventToTrigger) {
                    _eventToTrigger(event);
                }
            }
        } else {
            eventToTrigger(event);
        }
    }
    if (count > 0) {
        const parentDom = target.parentNode;
        if (isNullOrUndefined(parentDom) || (isClick && parentDom.nodeType === 1 && parentDom.disabled)) {
            return;
        }
        dispatchEvent(event, parentDom, items, count, isClick, eventData);
    }
}

function attachEventToDocument(name, delegatedRoots) {
    var docEvent = function(event) {
        const count = delegatedRoots.items.size;
        if (count > 0) {
            const eventData = {
                dom: document
            };
            try {
                Object.defineProperty(event, 'currentTarget', {
                    configurable: true,
                    get() {
                        return eventData.dom;
                    }
                });
            } catch (e) {
                // ie8
            }
            // nt._rawEvent = event
            dispatchEvent(
                event, 
                event.target, 
                delegatedRoots.items, 
                count, 
                event.type === 'click',
                eventData
            ); 
        }
    };
    addEventListener(document, name, docEvent);
    return docEvent;
}
