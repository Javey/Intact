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

/**
 * We must mount ref after all operations completed, because when we patch children,
 * one child will be mounted before being removed. e.g.
 * patchTest(
 *     h('div', null, [h('div'), h('div', {ref})]),
 *     h('div', null, [h('div', {ref})]),
 * );
 */
export function mountRef(
    ref: Ref<ComponentClass> | Ref<Element> | Ref<ComponentClass | Element> | null | undefined,
    value: any,
    mountedQueue: Function[]
) {
    if (ref) {
        /**
         * We mount ref before doing anything else, so we can get the correct ref anywhere.
         */
        mountedQueue.unshift(() => {
            if (isFunction(ref)) {
                ref(value);
            } else if (isRef(ref)) {
                ref.value = value;
            }
        });
    }
}

export function unmountRef(ref?: Ref<ComponentClass> | Ref<Element> | Ref<ComponentClass | Element> | null) {
    if (ref) {
        if (isFunction(ref)) {
            ref(null);
        } else if (isRef(ref)) {
            ref.value = null;
        }
    }
}
