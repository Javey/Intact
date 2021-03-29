// export const browser = {};
// if (typeof navigator !== 'undefined') {
    // const ua = navigator.userAgent.toLowerCase();
    // const index = ua.indexOf('msie ');
    // if (~index) {
        // browser.isIE = true;
        // const version = parseInt(ua.substring(index + 5, ua.indexOf('.', index)), 10);
        // browser.version = version;
        // browser.isIE8 = version === 8;
    // } else if (~ua.indexOf('trident/')) {
        // browser.isIE = true;
        // const rv = ua.indexOf('rv:');
        // browser.version = parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    // } else if (~ua.indexOf('edge')) {
        // browser.isEdge = true;
    // } else if (~ua.indexOf('safari')) {
        // if (~ua.indexOf('chrome')) {
            // browser.isChrome = true;
        // } else {
            // browser.isSafari = true;
        // }
    // }
// }

export function isNullOrUndefined(o: any): o is null | undefined {
    return o === null || o === undefined;
}

export const isArray = Array.isArray || function(arr: any): arr is Array<any> {
    return toString.call(arr) === '[object Array]';
};

export function isInvalid(o: any): o is null | boolean | undefined {
    return o === null || o === false || o === true || o === undefined;
}

export function isStringOrNumber(o: any): o is string | number {
    const type = typeof o;
    return type === 'string' || type === 'number';
}

export function isNull(o: any): o is null {
    return o === null;
}

export function isUndefined(o: any): o is undefined {
    return o === void 0;
}

export function isFunction(o: any): o is Function {
    return typeof o === 'function';
}

export function isNumber(o: any): o is number {
    return typeof o === 'number';
}

export function isString(o: any): o is string {
    return typeof o === 'string';
}

export function isObject(o: any): o is object {
    return o !== null && typeof o === 'object';
}

export const ERROR_MSG = 'a runtime error occured! Use Intact in development environment to find the error.';
export function throwError(message?: string) {
    if (!message) {
        message = ERROR_MSG;
    }
    throw new Error(`Intact Error: ${message}`);
}

export function isEventProp(propName: string) {
    return propName.substr(0, 3) === 'ev-';
}

const xlinkNS = "http://www.w3.org/1999/xlink";
const xmlNS = "http://www.w3.org/XML/1998/namespace";
export const namespaces: Record<string, string> = {
    'xlink:href': xlinkNS,
    'xlink:arcrole': xlinkNS,
    'xlink:actuate': xlinkNS,
    'xlink:show': xlinkNS,
    'xlink:role': xlinkNS,
    'xlink:title': xlinkNS,
    'xlink:type': xlinkNS,
    'xml:base': xmlNS,
    'xml:lang': xmlNS,
    'xml:space': xmlNS,
};

export function warn(message: string) {
    console.warn(message);
}

export const hasOwn = Object.prototype.hasOwnProperty;

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

export type changeTrace = {path: string, changes: [any, any]};
export function set<O extends object, K extends keyof O>(object: O, path: K, value: O[K]): changeTrace[];
export function set<O extends object, K extends string | number | symbol>(object: O, path: K extends keyof O ? never : K, value: any): changeTrace[];
export function set<O extends object>(object: O, path: string | number | symbol, value?: any): changeTrace[] {
    if (process.env.NODE_ENV !== 'production') {
        if (typeof path === 'symbol') {
            throwError("set() does not support Symbol");
        }
    }

    const changeTraces: changeTrace[] = [];

    if (hasOwn.call(object, path)) {
        changeTraces.push({path: path as string, changes: [value, object[path as keyof O]]});
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
        changeTraces.push({path: prefix, changes: [newValue, oldValue]});
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

