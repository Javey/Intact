import {LinkedEvent} from '../utils/types';
import {isFunction, isNull} from 'intact-shared';

export function linkEvent<T, E extends Event>(data: T, event: (data: T, event: E) => void): LinkedEvent<T, E>;
export function linkEvent<T, E extends Event>(data: T, event: any): null;
export function linkEvent<T, E extends Event>(data: T, event: (data: T, event: E) => void): LinkedEvent<T, E> | null {
    if (isFunction(event)) {
        return {data, event};
    }
    return null;
}

export function isLinkEvent(o: any): o is LinkedEvent<any> {
    return !isNull(o) && typeof o === 'object';
}

export function isSameLinkEvent(lastValue: any, nextValue: LinkedEvent<any, any>) {
    return (
        isLinkEvent(lastValue) &&
        lastValue.event === nextValue.event &&
        lastValue.data === nextValue.data
    );
}

export function wrapLinkEvent(nextValue: LinkedEvent<any>) {
    const ev = nextValue.event;

    return function(e: Event) {
        ev(nextValue.data, e);
    }
}
