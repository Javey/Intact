import {hasOwn, isString, isNullOrUndefined, isObject, throwError, isArray} from './helpers';

export type ChangeTrace = {path: string, newValue: any, oldValue: any};

export function get<O extends object, K extends keyof O>(object: O, path: K): O[K];
export function get<O extends object, K extends string | number | symbol>(object: O, path: K extends keyof O ? never : K): any;
export function get(object: object, path: string | number | symbol) {
    if (hasOwn.call(object, path) || !isString(path)) return object[path as keyof object];

    const pathArray = castPath(path as string);
    const length = pathArray.length;
    let index = 0;

    while (!isNullOrUndefined(object) && index < length) {
        object = object[pathArray[index++] as keyof object] as object;
    }

    return (index && index === length) ? object : undefined;
}

export function set<O extends object, K extends keyof O>(object: O, path: K, value: O[K]): ChangeTrace[];
export function set<O extends object, K extends string | number | symbol>(object: O, path: K extends keyof O ? never : K, value: any): ChangeTrace[];
export function set<O extends object>(object: O, path: string | number | symbol, value?: any): ChangeTrace[] {
    if (process.env.NODE_ENV !== 'production') {
        if (typeof path === 'symbol') {
            throwError("set() does not support Symbol");
        }
    }

    const changeTraces: ChangeTrace[] = [];

    if (hasOwn.call(object, path)) {
        changeTraces.push({path: path as string, newValue: value,  oldValue: object[path as keyof O]});
        object[path as keyof O] = value;
        return changeTraces;
    }

    const pathArray = castPath(path as string);
    const length = pathArray.length;
    const lastIndex = length - 1;
    let index = -1;
    let nested: any = object;
    let prefix = '';

    while (!isNullOrUndefined(nested) && ++index < length) {
        const key = pathArray[index];
        let oldValue = nested[key];
        let newValue = value;

        if (index !== lastIndex) {
            // data is immutable, clone it before modifing it
            newValue = isObject(oldValue) ? clone(oldValue) : reIsIndex.test(pathArray[index + 1]) ? [] : {};
        } else {
        }
        nested[key] = newValue;
        nested = nested[key];

        prefix += key;
        changeTraces.push({path: prefix, newValue, oldValue});
        prefix += '.';
    }

    return changeTraces;
}

const castPathCache: Record<string, string[]> = {};
const rePropName = /[^\.\[\]]+/g;
const reIsIndex = /^(?:0|[1-9]\d*)$/;
function castPath(path: string) {
    if (process.env.NODE_ENV !== 'production') {
        if (/^[\.\[\]]*$/.test(path)) {
            throwError('Encountered invalid path: ' + path);
        }
    }

    if (castPathCache[path]) return castPathCache[path];

    return (castPathCache[path] = path.match(rePropName) as string[]);
}

function clone(object: object) {
    if (process.env.NODE_ENV !== 'production') {
        if (!isObject(object)) {
            throwError('Encounterd invalid object: ' + JSON.stringify(object));
        }
    }

    if (isArray(object)) {
        return object.slice();
    }

    return {...object};
}

export function deepFreeze(object: any) {
    if (!isObject(object)) throwError('static property defaults must be an object.');

    for (const key in object) {
        const prop = object[key as keyof typeof object];

        if (isObject(prop)) {
            deepFreeze(prop);
        }
    }

    return Object.freeze(object);
}
