import {ComponentClass, RefObject, Ref, Component} from './types';
import {isFunction} from 'intact-shared';

export function isRef(o: any): o is RefObject<any> {
    return o.__is_ref; 
}

export function createRef<T = Element>(): RefObject<T> {
    return {
        value: null,
        __is_ref: true,
    }
}

export function mountRef(ref?: Ref<ComponentClass> | Ref<Element> | Ref<ComponentClass | Element> | null, value?: any) {
    if (ref) {
        if (isFunction(ref)) {
            ref(value);
        } else if (isRef(ref)) {
            ref.value = value;
        }
    }
}

export function unmountRef(ref?: Ref<ComponentClass> | Ref<Element> | Ref<ComponentClass | Element> | null) {
    mountRef(ref, null);
}
