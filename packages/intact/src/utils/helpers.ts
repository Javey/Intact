import {isObject, throwError} from 'intact-shared';

export function deepFreeze(object: any) {
    if (!isObject(object)) throwError('the static property "defaults" must be an object.');

    if (Object.isFrozen(object)) return object;

    for (const key in object) {
        const descriptor = Object.getOwnPropertyDescriptor(object, key);
        if (!descriptor) continue;
        if (descriptor.get) continue;

        const value = descriptor.value;
        if (isObject(value)) {
            deepFreeze(value);
        }
    }

    return Object.freeze(object);
}
