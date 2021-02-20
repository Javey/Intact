import {isFunction, isNull} from '../utils';
import {normalizeEventName} from '../common';

interface IEventData {
    dom: Node;
}

function getDelegatedEventObject(v: any): Record<string, any> {
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

const attachedEventCounts = getDelegatedEventObject(0);
const attachedEvents = getDelegatedEventObject(null);

export const delegatedEvents = getDelegatedEventObject(true);

function updateOrAddDelegatedEvent(name: string, dom: Element) {
    let eventsObject = (dom as any).$EV;

    if (!eventsObject) {
        eventsObject = (dom as any).$EV = getDelegatedEventObject(null);
    }
    if (!eventsObject[name]) {
        if (++attachedEventCounts[name] === 1) {
            attachedEvents[name] = attachEventToDocument(name);
        }
    }

    return eventsObject;
}

export function unmountDelegatedEvent(name: string, dom: Element) {
    const eventsObject = (dom as any).$EV;

    if (eventsObject && eventsObject[name]) {
        if (--attachedEventCounts[name] === 0) {
            document.removeEventListener(normalizeEventName(name), attachedEvents[name]);
        }
    }

    return eventsObject;
}

export function handleDelegatedEvent(
    name: string,
    lastEvent: Function,
    nextEvent: Function,
    dom: Element,
) {
    if (isFunction(nextEvent)) {
        updateOrAddDelegatedEvent(name, dom)[name] = nextEvent;
    } else {
        unmountDelegatedEvent(name, dom);
    }
}

function attachEventToDocument(name: string) {
    const attachedEvent = name === 'ev-click' || name === 'ev-dblclick' ? rootClickEvent(name) : rootEvent(name);

    document.addEventListener(normalizeEventName(name), attachedEvent);

    return attachedEvent;
}

function rootClickEvent(name: string) {
    return function(event: Event) {
        if ((event as MouseEvent).button !== 0) {
            event.stopPropagation();
            return;
        }
        dispatchEvents(event, true, name, extendEventProperites(event));
    }
}

function rootEvent(name: string) {
    return function(event: Event) {
        dispatchEvents(event, false, name, extendEventProperites(event));
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
    let dom: Node | null = getTargetNode(event);

    do {
        if (isClick && (dom as HTMLButtonElement).disabled) {
            return;
        }

        const eventsObject = (dom as any).$EV;

        if (eventsObject) {
            const currentEvent = eventsObject[name];

            if (currentEvent) {
                eventData.dom = dom!;
                currentEvent.event ? currentEvent.event(currentEvent.data, event) : currentEvent(event);
                if (event.cancelBubble) {
                    return;
                }
            }
        }
        dom = dom.parentNode;
    } while (!isNull(dom))
}

function getTargetNode(event: Event): Element {
    return isFunction(event.composedPath) ? event.composedPath()[0] as Element : event.target as Element;
}
