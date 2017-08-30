import {extend, isArray, each, isObject, hasOwn, noop} from 'vdt/src/lib/utils';
import {isNullOrUndefined} from 'misstime/src/utils';

export {extend, isArray, each, isObject, hasOwn, isNullOrUndefined, noop};

export const inBrowser = typeof window !== 'undefined';
export const UA = inBrowser && window.navigator.userAgent.toLowerCase();
export const isIOS = UA && /iphone|ipad|ipod|ios/.test(UA);

/**
 * inherit
 * @param Parent
 * @param prototype
 * @returns {Function}
 */
export function inherit(Parent, prototype) {
    let Child = function(...args) {
        return Parent.apply(this, args);
    };

    Child.prototype = create(Parent.prototype);
    each(prototype, function(proto, name) {
        if (name === 'displayName') {
            Child.displayName = proto;
        }
        if (!isFunction(proto) || name === 'template') {
            Child.prototype[name] = proto;
            return;
        }
        Child.prototype[name] = (() => {
            let _super = function(...args) {
                    return Parent.prototype[name].apply(this, args);
                }, 
                _superApply = function(args) {
                    return Parent.prototype[name].apply(this, args);
                };
            return function(...args) {
                let self = this || {},
                    __super = self._super,
                    __superApply = self._superApply,
                    returnValue;

                self._super = _super;
                self._superApply = _superApply;

                returnValue = proto.apply(this, args);

                self._super = __super;
                self._superApply = __superApply;

                return returnValue;
            };
        })();
    });
    Child.prototype.constructor = Child;

    extend(Child, Parent);
    Child.__super = Parent.prototype;

    return Child;
}

const nativeGetPrototypeOf = Object.getPrototypeOf;
export const getParentTemplate = isNative(nativeGetPrototypeOf) ?
    function(instance) {
        return nativeGetPrototypeOf(instance.constructor.prototype).template; 
    } :
    function(instance) {
        const c = instance.constructor;
        if (c.__super) {
            // is inherit by Intact.extend()
            return c.__super.template;
        } else if (c.prototype.__proto__) {
            // has __proto__
            return c.prototype.__proto__.template; 
        } else {
            return null;
        }
    };

let nativeCreate = Object.create;
export const create = nativeCreate ? nativeCreate : function(object) {
    let fn = () => {};
    fn.prototype = object;
    return new fn();
};

export function isFunction(obj) {
    return typeof obj === 'function';
}

export function isString(s) {
    return typeof s === 'string';
}

export function result(obj, property, fallback) {
    let value = isNullOrUndefined(obj) ? undefined : obj[property];
    if (value === undefined) {
        value = fallback;
    }
    return isFunction(value) ? value.call(obj) : value;
}

let executeBound = (sourceFunc, boundFunc, context, callingContext, args) => {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    let self = create(sourceFunc.prototype);
    let result = sourceFunc.apply(self, args);
    if (isObject(result)) return result;
    return self;
};
let nativeBind = Function.prototype.bind;
export function bind(func, context, ...args) {
    if (nativeBind && func.bind === nativeBind) {
        return nativeBind.call(func, context, ...args);
    }
    if (!isFunction(func)) throw new TypeError('Bind must be called on a function');
    let bound = function(...args1) {
        return executeBound(func, bound, context, this, [...args, ...args1]);
    };
    return bound;
}

let toString = Object.prototype.toString;
// Internal recursive comparison function for `isEqual`.
var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (isNullOrUndefined(a) || isNullOrUndefined(b)) return a === b;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
        // Strings, numbers, regular expressions, dates, and booleans are compared by value.
        case '[object RegExp]':
        // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
        case '[object String]':
            // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
            // equivalent to `new String("5")`.
            return '' + a === '' + b;
        case '[object Number]':
            // `NaN`s are equivalent, but non-reflexive.
            // Object(NaN) is equivalent to NaN
            if (+a !== +a) return +b !== +b;
            // An `egal` comparison is performed for other numeric values.
            return +a === 0 ? 1 / +a === 1 / b : +a === +b;
        case '[object Date]':
        case '[object Boolean]':
            // Coerce dates and booleans to numeric primitive values. Dates are compared by their
            // millisecond representations. Note that invalid dates with millisecond representations
            // of `NaN` are not equivalent.
            return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
        if (typeof a != 'object' || typeof b != 'object') return false;

        // Objects with different constructors are not equivalent, but `Object`s or `Array`s
        // from different frames are.
        var aCtor = a.constructor, bCtor = b.constructor;
        if (aCtor !== bCtor && 
            !(
                isFunction(aCtor) && 
                aCtor instanceof aCtor &&
                isFunction(bCtor) && 
                bCtor instanceof bCtor
            ) && 
            ('constructor' in a && 'constructor' in b)
        ) {
            return false;
        }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
        // Linear search. Performance is inversely proportional to the number of
        // unique nested structures.
        if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
        // Compare array lengths to determine if a deep comparison is necessary.
        length = a.length;
        if (length !== b.length) return false;
        // Deep compare the contents, ignoring non-numeric properties.
        while (length--) {
            if (!eq(a[length], b[length], aStack, bStack)) return false;
        }
    } else {
        // Deep compare objects.
        var aKeys = keys(a), key;
        length = aKeys.length;
        // Ensure that both objects contain the same number of properties before comparing deep equality.
        if (keys(b).length !== length) return false;
        while (length--) {
            // Deep compare each member
            key = aKeys[length];
            if (!(hasOwn.call(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
        }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
};

export function isEqual(a, b) {
    return eq(a, b);
}

let idCounter = 0;
export function uniqueId(prefix) {
    let id = ++idCounter + '';
    return prefix ? prefix + id : id;
}

export let keys = Object.keys || function(obj) {
    var ret = [];
    each(obj, (value, key) => ret.push(key));
    return ret;
};

export function values(obj) {
    var ret = [];
    each(obj, (value) => ret.push(value));
    return ret;
}

let pathMap = {},
    reLeadingDot = /^\./,
    rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
    reEscapeChar = /\\(\\)?/g,
    reIsUint = /^(?:0|[1-9]\d*)$/;
export function castPath(path) {
    if (typeof path !== 'string') return path;
    if (pathMap[path]) return pathMap[path];

    let ret = [];
    if (reLeadingDot.test(path)) {
        result.push('');
    }
    path.replace(rePropName, function(match, number, quote, string) {
       ret.push(quote ? path.replace(reEscapeChar, '$1') : (number || match));
    });
    pathMap[path] = ret;

    return ret;
}
function isIndex(value) {
    return (typeof value === 'number' || reIsUint.test(value)) &&
        value > -1 && value % 1 === 0;
}
export function get(object, path, defaultValue) {
    if (hasOwn.call(object, path)) return object[path];
    path = castPath(path);

    var index = 0,
        length = path.length;

    while (!isNullOrUndefined(object) && index < length) {
        object = object[path[index++]];
    }

    return (index && index === length) ? object : defaultValue;
}
export function set(object, path, value) {
    if (hasOwn.call(object, path)) {
        object[path] = value;
        return object;
    }

    path = castPath(path);

    var index = -1,
        length = path.length,
        lastIndex = length - 1,
        nested = object;
    while (!isNullOrUndefined(nested) && ++index < length) {
        var key = path[index],
            newValue = value;
        if (index !== lastIndex) {
            var objValue = nested[key];
            newValue = isObject(objValue) ? objValue : (isIndex(path[index + 1]) ? [] : {});
        }
        nested[key] = newValue;
        nested = nested[key];
    }

    return object;
}

function isNative(Ctor) {
    return typeof Ctor === 'function' && /native code/.test(Ctor.toString());
}
const nextTick = (() => {
    if (typeof Promise !== 'undefined' && isNative(Promise)) {
        const p = Promise.resolve();
        return (callback) => {
            p.then(callback).catch(err => console.error(err));
            // description in vue
            if (isIOS) setTimeout(noop);
        };
    } else if (typeof MutationObserver !== 'undefined' && ( 
        isNative(MutationObserver) ||
        // PhantomJS and iOS 7.x
        MutationObserver.toString() === '[object MutationObserverConstructor]'
    )) {
        const callbacks = [];
        const nextTickHandler = () => {
            const _callbacks = callbacks.slice(0);
            callbacks.length = 0;
            for (let i = 0; i < _callbacks.length; i++) {
                _callbacks[i]();
            }
        };
        const node = document.createTextNode('');
        new MutationObserver(nextTickHandler).observe(node, {
            characterData: true
        });
        let i = 1;
        return (callback) => {
            callbacks.push(callback);
            i = (i + 1) % 2;
            node.data = String(i);
        };
    } else {
        return (callback) => {
            setTimeout(callback, 0);
        };
    }
})();
export function NextTick(eachCallback) {
    this.callback = null;
    this.eachCallback = eachCallback;
    nextTick(() => this.callback());
}
NextTick.prototype.fire = function(callback, data) {
    this.callback = callback; 
    if (this.eachCallback) {
        this.eachCallback(data);
    }
};
