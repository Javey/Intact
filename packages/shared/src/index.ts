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

export function error(message: string) {
    console.error(message);
}

export const hasOwn = Object.prototype.hasOwnProperty;
