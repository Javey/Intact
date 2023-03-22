import {isFunction} from 'intact-shared';
import {IntactElement} from '../utils/types';

type EventData = [string, EventListener];

export function attachEvent(dom: IntactElement, eventName: string, handler?: EventListener) {
    const previousKey = `$${eventName}`;
    const previousArgs = (dom as any)[previousKey] as EventData;

    if (previousArgs) {
        dom.removeEventListener(previousArgs[0], previousArgs[1]);
        dom[previousKey] = null;
    }

    if (isFunction(handler)) {
        dom.addEventListener(eventName, handler);
        dom[previousKey] = [eventName, handler] as EventData;
    }
}

export function attachModelEvent(dom: IntactElement, eventName: string, handler?: EventListener) {
    const previousKey = `$$model:${eventName}`;
    const previousEvent = (dom as any)[previousKey] as EventListener;

    if (previousEvent) {
        dom.removeEventListener(eventName, previousEvent);
        dom[previousKey] = null;
    }

    if (isFunction(handler)) {
        dom.addEventListener(eventName, handler);
        dom[previousKey] =  handler;
    }
}