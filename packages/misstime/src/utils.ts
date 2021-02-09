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

