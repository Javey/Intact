import {Component, RefObject, Ref} from './types';
import {isFunction} from './utils';

export function isRef(o: any): o is RefObject<any> {
    return o.__is_ref; 
}

export function createRef<T = Element>(): RefObject<T> {
    return {
        value: null,
        __is_ref: true,
    }
}

export function mountRef(ref?: Ref<Component> | Ref<Element> | null, value?: any) {
    if (ref) {
        if (isFunction(ref)) {
            ref(value);
        } else if (isRef(ref)) {
            ref.value = value;
        }
    }
}

export function unmountRef(ref?: Ref | null) {
    mountRef(ref, null);
}
