import {ComponentClass, RefObject, NonNullableRefObject, Ref} from './types';
import {isFunction, isUndefined} from 'intact-shared';

export function isRef(o: any): o is RefObject<any> {
    return o.__is_ref; 
}

export function createRef<T = Element>(): RefObject<T>;
export function createRef<T = Element>(defaultValue: T): NonNullableRefObject<T>;
export function createRef<T = Element>(defaultValue?: T): RefObject<T> {
    return {
        value: isUndefined(defaultValue) ? null : defaultValue,
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
