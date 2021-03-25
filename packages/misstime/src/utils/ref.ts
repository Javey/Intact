import {ComponentClass, RefObject, Ref} from './types';
import {isFunction} from './helpers';

export function isRef(o: any): o is RefObject<any> {
    return o.__is_ref; 
}

export function createRef<T = Element>(): RefObject<T> {
    return {
        value: null,
        __is_ref: true,
    }
}

export function mountRef(ref?: Ref<ComponentClass> | Ref<Element> | null, value?: any) {
    if (ref) {
        if (isFunction(ref)) {
            ref(value);
        } else if (isRef(ref)) {
            ref.value = value;
        }
    }
}

export function unmountRef(ref?: Ref<ComponentClass> | Ref<Element> | null) {
    mountRef(ref, null);
}
