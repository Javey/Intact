import {isFunction, isNull} from '../utils';
import {normalizeEventName} from '../common';
import {LinkedEvent, MissTimeEventListener, MissTimeElement} from '../types';
import {isLinkEvent, isSameLinkEvent} from './linkEvent';

interface IEventData {
    dom: Node;
}

function getDelegatedEventObject<T>(v: T): Record<string, T> {
    return {
        'ev-click': v,
        'ev-dblclick': v,
        'ev-focusin': v,
        'ev-focusout': v,
        'ev-keydown': v,
        'ev-keypress': v,
        'ev-keyup': v,
        'ev-mousedown': v,
        'ev-mousemove': v,
        'ev-mouseup': v,
        'ev-touchend': v,
        'ev-touchmove': v,
        'ev-touchstart': v,
    };
}

const attachedEventCounts = getDelegatedEventObject<number>(0);
const attachedEvents = getDelegatedEventObject<EventListener | null>(null);

export const delegatedEvents = getDelegatedEventObject<boolean>(true);

function updateOrAddDelegatedEvent(name: string, dom: MissTimeElement) {
    let eventsObject = dom.$EV;

    if (!eventsObject) {
        eventsObject = dom.$EV = getDelegatedEventObject<MissTimeEventListener>(null);
    }
    if (!eventsObject[name]) {
        if (++attachedEventCounts[name] === 1) {
            attachedEvents[name] = attachEventToDocument(name);
        }
    }

    return eventsObject;
}

export function unmountDelegatedEvent(name: string, dom: MissTimeElement) {
    const eventsObject = dom.$EV;

    if (eventsObject && eventsObject[name]) {
        if (--attachedEventCounts[name] === 0) {
            document.removeEventListener(normalizeEventName(name), attachedEvents[name]!);
        }
    }

    return eventsObject;
}

export function handleDelegatedEvent(
    name: string,
    lastEvent: MissTimeEventListener,
    nextEvent: MissTimeEventListener,
    dom: MissTimeElement,
) {
    if (isFunction(nextEvent)) {
        updateOrAddDelegatedEvent(name, dom)[name] = nextEvent;
    } else if (isLinkEvent(nextEvent)) {
        if (isSameLinkEvent(lastEvent, nextEvent)) {
            return;
        }
        updateOrAddDelegatedEvent(name, dom)[name] = nextEvent;
    } else {
        unmountDelegatedEvent(name, dom);
    }
}

function attachEventToDocument(name: string) {
    const attachedEvent = // name === 'ev-click' || name === 'ev-dblclick' ?
        // rootClickEvent(name) :
        rootEvent(name);

    document.addEventListener(normalizeEventName(name), attachedEvent);

    return attachedEvent;
}

// function rootClickEvent(name: string) {
    // return function(event: Event) {
        // if ((event as MouseEvent).button !== 0) {
            // event.stopPropagation();
            // return;
        // }
        // dispatchEvents(event, true, name, extendEventProperites(event));
    // }
// }

function rootEvent(name: string) {
    const isClick = name === 'ev-click' || name === 'ev-dblclick';
    return function(event: Event) {
        dispatchEvents(event, isClick, name, extendEventProperites(event));
    }
}

function extendEventProperites(event: Event) {
    const eventData: IEventData = {
        dom: document
    };

    event.stopPropagation = stopPropagation;

    Object.defineProperty(event, 'currentTarget', {
        configurable: true,
        get() {
            return eventData.dom;
        }
    });

    return eventData;
}

function stopPropagation(this: Event) {
    this.cancelBubble = true;
    if (this.stopImmediatePropagation) {
        this.stopImmediatePropagation();
    }
}

function dispatchEvents(event: Event, isClick: boolean, name: string, eventData: IEventData) {
    let dom: MissTimeElement = getTargetNode(event);
    let count = attachedEventCounts[name];

    do {
        if (isClick && (dom as HTMLButtonElement).disabled) {
            return;
        }

        const eventsObject = dom.$EV;

        if (eventsObject) {
            const currentEvent = eventsObject[name];

            if (currentEvent) {
                eventData.dom = dom;
                (currentEvent as any).event ? 
                    (currentEvent as LinkedEvent<any, any>).event((currentEvent as LinkedEvent<any, any>).data, event) :
                    (currentEvent as EventListener)(event);
                if (--count === 0 || event.cancelBubble) {
                    return;
                }
            }
        }
        dom = dom.parentNode as MissTimeElement;
    } while (!isNull(dom))
}

function getTargetNode(event: Event): Element {
    return isFunction(event.composedPath) ? 
        event.composedPath()[0] as Element :
        /* istanbul ignore next */
        event.target as Element;
}