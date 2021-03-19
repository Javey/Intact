import {LinkedEvent} from '../utils/types';
import {isFunction, isNull} from '../utils/utils';

export function linkEvent<T, E extends Event>(data: T, event: (data: T, event: Event) => void): LinkedEvent<T, E> | null {
    if (isFunction(event)) {
        return {data, event};
    }
    return null;
}

export function isLinkEvent(o: any): o is LinkedEvent<any, any> {
    return !isNull(o) && typeof o === 'object';
}

export function isSameLinkEvent(lastValue: any, nextValue: LinkedEvent<any, any>) {
    return (
        isLinkEvent(lastValue) &&
        lastValue.event === nextValue.event &&
        lastValue.data === nextValue.data
    );
}
