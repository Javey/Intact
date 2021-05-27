import {isObject, throwError} from 'intact-shared';

export function deepFreeze(object: any) {
    if (!isObject(object)) throwError('the static property "defaults" must be an object.');

    if (Object.isFrozen(object)) return object;

    for (const key in object) {
        const prop = object[key as keyof typeof object];

        if (isObject(prop)) {
            deepFreeze(prop);
        }
    }

    return Object.freeze(object);
}
