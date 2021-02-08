const toString = Object.prototype.toString;

export const doc = typeof document === 'undefined' ? {} : document;

export const isArray = Array.isArray || function(arr) {
    return toString.call(arr) === '[object Array]';
};

export function isObject(o) {
    return typeof o === 'object' && o !== null;
}

export function isStringOrNumber(o) {
    const type = typeof o;
    return type === 'string' || type === 'number';
}

export function isNullOrUndefined(o) {
    return o === null || o === undefined;
}

export function isComponentInstance(o) {
    return o && typeof o.init === 'function';
}

export function isEventProp(propName) {
    return propName.substr(0, 3) === 'ev-';
}

export function isInvalid(o) {
    return isNullOrUndefined(o) || o === false || o === true;
}

export const indexOf = (function() {
    if (Array.prototype.indexOf) {
        return function(arr, value) {
            return arr.indexOf(value);
        };
    } else {
        return function(arr, value) {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] === value) {
                    return i;
                }
            }
            return -1;
        };
    }
})();

const nativeObject = Object.create;
export const createObject = (function() {
    if (nativeObject) {
        return function(obj) {
            return nativeObject(obj);
        };
    } else {
        return function(obj) {
            function Fn() {}
            Fn.prototype = obj;
            return new Fn();
        };
    }
})();

export const SimpleMap = typeof Map === 'function' ? Map : (function() {
    function SimpleMap() {
        this._keys = [];
        this._values = [];
        this.size = 0;
    }

    SimpleMap.prototype.set = function(key, value) {
        let index = indexOf(this._keys, key);
        if (!~index) {
            index = this._keys.push(key) - 1;
            this.size++;
        }
        this._values[index] = value;
        return this;
    };
    SimpleMap.prototype.get = function(key) {
        let index = indexOf(this._keys, key);
        if (!~index) return;
        return this._values[index];
    };
    SimpleMap.prototype.delete = function(key) {
        const index = indexOf(this._keys, key);
        if (!~index) return false;
        this._keys.splice(index, 1);
        this._values.splice(index, 1);
        this.size--;
        return true;
    };

    return SimpleMap;
})();

export const skipProps = {
    key: true,
    ref: true,
    children: true,
    className: true,
    checked: true,
    multiple: true,
    defaultValue: true,
    'v-model': true,
};

export function isSkipProp(prop) {
    // treat prop which start with '_' as private prop, so skip it
    return skipProps[prop] || prop[0] === '_';
}

export const booleanProps = {
    muted: true,
    scoped: true,
    loop: true,
    open: true,
    checked: true,
    default: true,
    capture: true,
    disabled: true,
    readOnly: true,
    required: true,
    autoplay: true,
    controls: true,
    seamless: true,
    reversed: true,
    allowfullscreen: true,
    noValidate: true,
    hidden: true,
    autofocus: true,
    selected: true,
    indeterminate: true,
    multiple: true,
};

export const strictProps = {
    volume: true,
    defaultChecked: true,
    value: true,
    htmlFor: true,
    scrollLeft: true,
    scrollTop: true,
};

export const selfClosingTags = {
    'area': true,
    'base': true,
    'br': true,
    'col': true,
    'command': true,
    'embed': true,
    'hr': true,
    'img': true,
    'input': true,
    'keygen': true,
    'link': true,
    'menuitem': true,
    'meta': true,
    'param': true,
    'source': true,
    'track': true,
    'wbr': true
};

export function MountedQueue() {
    this.queue = [];
    // if done is true, it indicate that this queue should be discarded
    this.done = false;
}
MountedQueue.prototype.push = function(fn) {
    this.queue.push(fn);
};
MountedQueue.prototype.unshift = function(fn) {
    this.queue.unshift(fn);
};
MountedQueue.prototype.trigger = function() {
    const queue = this.queue;
    let callback;
    while (callback = queue.shift()) {
        callback();
    }
    this.done = true;
};

export const browser = {};
if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent.toLowerCase();
    const index = ua.indexOf('msie ');
    if (~index) {
        browser.isIE = true;
        const version = parseInt(ua.substring(index + 5, ua.indexOf('.', index)), 10);
        browser.version = version;
        browser.isIE8 = version === 8;
    } else if (~ua.indexOf('trident/')) {
        browser.isIE = true;
        const rv = ua.indexOf('rv:');
        browser.version = parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    } else if (~ua.indexOf('edge')) {
        browser.isEdge = true;
    } else if (~ua.indexOf('safari')) {
        if (~ua.indexOf('chrome')) {
            browser.isChrome = true;
        } else {
            browser.isSafari = true;
        }
    }
}

export const setTextContent = browser.isIE8 ? function(dom, text) {
    dom.innerText = text;
} : function(dom, text) {
    dom.textContent = text;
};

export const svgNS = "http://www.w3.org/2000/svg";
export const xlinkNS = "http://www.w3.org/1999/xlink";
export const xmlNS = "http://www.w3.org/XML/1998/namespace";

export const namespaces = {
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

export const hooks = {
    beforeInsert: null
};

export const config = {
    disableDelegate: false, // for using in React/Vue, disable delegate the event
};
