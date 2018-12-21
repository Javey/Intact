import '../src/utils';
import 'core-js/es5';

if (!(Object.setPrototypeOf || {}.__proto__)) {
    // ie <= 10 exists getPrototypeOf but not setPrototypeOf
    let nativeGetPrototypeOf = Object.getPrototypeOf;

    if (typeof nativeGetPrototypeOf !== 'function') {
        Object.getPrototypeOf = function(object) {
            // May break if the constructor has been tampered with
            return object.__proto__ || object.constructor.prototype;;
        }
    } else {
        Object.getPrototypeOf = function(object) {
            // in ie <= 10 __proto__ is not supported
            // getPrototypeOf will return a native function
            // but babel will set __proto__ prototyp to target
            // so we get __proto__ in this case
            return object.__proto__ || nativeGetPrototypeOf.call(Object, object);
        }
    }
    
    // fix that if ie <= 10 babel can't inherit class static methods
    Object.setPrototypeOf = function(O, proto) {
        Object.assign(O, proto);
        O.__proto__ = proto;
    }
}
