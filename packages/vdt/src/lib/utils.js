/** 
 * @fileoverview utility methods
 * @author javey
 * @date 15-4-22
 */

import {
    isNullOrUndefined, isArray, indexOf, 
    selfClosingTags as SelfClosingTags,
    isEventProp
} from 'misstime/src/utils';

export {isNullOrUndefined, isArray, indexOf, SelfClosingTags, isEventProp};

let i = 0;
export const Type = { 
    JS: i++,
    JSImport: i++,

    JSXText: i++,
    JSXUnescapeText: i++,
    JSXElement: i++,
    JSXExpressionContainer: i++,
    JSXAttribute: i++,
    JSXEmptyExpression: i++,

    JSXWidget: i++,
    JSXVdt: i++,
    JSXBlock: i++,
    JSXComment: i++,

    JSXDirective: i++,
    JSXTemplate: i++,

    JSXString: i++,
};
export const TypeName = [];
for (let type in Type) {
    TypeName[Type[type]] = type;
}

// which children must be text
export const TextTags = {
    style: true,
    script: true,
    textarea: true
};

export const Directives = {
    'v-if': true,
    'v-else-if': true,
    'v-else': true,
    'v-for': true,
    'v-for-value': true,
    'v-for-key': true,
    'v-raw': true
};

export const Options = {
    autoReturn: true,
    onlySource: false,
    delimiters: ['{', '}'],
    // remove `with` statement
    noWith: false,
    // whether rendering on server or not
    server: false,
    // skip all whitespaces in template
    skipWhitespace: true,
    setModel: function(data, key, value, self) {
        data[key] = value;
        self.update();
    },
    getModel: function(data, key) {
        return data[key]; 
    },
    disableSplitText: false, // split text with <!---->
    sourceMap: false,
    indent: '    ', // code indent style
};

export const hasOwn = Object.prototype.hasOwnProperty;
export const noop = function() {};

function isArrayLike(value) {
    if (isNullOrUndefined(value)) return false;
    var length = value.length;
    return typeof length === 'number' && length > -1 && length % 1 === 0 && length <= 9007199254740991 && typeof value !== 'function';
}

export function each(obj, iter, thisArg) {
    if (isArrayLike(obj)) {
        for (var i = 0, l = obj.length; i < l; i++) {
            iter.call(thisArg, obj[i], i, obj);
        } 
    } else if (isObject(obj)) {
        for (var key in obj) {
            if (hasOwn.call(obj, key)) {
                iter.call(thisArg, obj[key], key, obj);
            }
        }
    }
}

export function isObject(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj; 
}

export function map(obj, iter, thisArgs) {
    var ret = [];
    each(obj, function(value, key, obj) {
        ret.push(iter.call(thisArgs, value, key, obj));
    });
    return ret;
}


export function className(obj) {
    if (isNullOrUndefined(obj)) return;
    if (typeof obj === 'string') return obj;
    var ret = [];
    for (var key in obj) {
        if (hasOwn.call(obj, key) && obj[key]) {
            ret.push(key);
        }
    }
    return ret.join(' ');
}

export function isWhiteSpace(charCode) {
    return (
        (charCode <= 160 && (charCode >= 9 && charCode <= 13) || 
            charCode == 32 || 
            charCode == 160
        ) ||
        charCode == 5760 || 
        charCode == 6158 ||
        (charCode >= 8192 && 
            (
                charCode <= 8202 || 
                charCode == 8232 ||
                charCode == 8233 || 
                charCode == 8239 || 
                charCode == 8287 || 
                charCode == 12288 || 
                charCode == 65279
            )
        )
    );
}

export function isWhiteSpaceExpectLinebreak(charCode) {
    return charCode !== 10 && // \n
        charCode !== 13 && // \r
        isWhiteSpace(charCode);
}

export function trimRight(str) {
    var index = str.length;

    while (index-- && isWhiteSpace(str.charCodeAt(index))) {}

    return str.slice(0, index + 1);
}

export function trimLeft(str) {
    var length = str.length, index = -1;

    while (index++ < length && isWhiteSpace(str.charCodeAt(index))) {}

    return str.slice(index);
}

export function setDelimiters(delimiters) {
    if (!isArray(delimiters)) {
        throw new Error('The parameter must be an array like ["{{", "}}"]');
    }
    Options.delimiters = delimiters;
}

export function getDelimiters() {
    return Options.delimiters;
}

export function configure(key, value) {
    if (typeof key === 'string') {
        if (value === undefined) {
            return Options[key];
        } else {
            Options[key] = value;
        }
    } else if (isObject(key)) {
        extend(Options, key);
    } 
    return Options;
}

export function isSelfClosingTag(tag) {
    return SelfClosingTags[tag];
}

export function isTextTag(tag) {
    return TextTags[tag];
}

export function isDirective(name) {
    return hasOwn.call(Directives, name);
}

export function isVModel(name) {
    return name === 'v-model' || name.substr(0, 8) === 'v-model:';
}

export function extend(...args) {
    var dest = args[0];
    var length = args.length;
    if (length > 1) {
        for (var i = 1; i < length; i++) {
            let source = args[i];
            if (source) {
                for (var key in source) {
                    if (hasOwn.call(source, key)) {
                        dest[key] = source[key];
                    }
                }
            }
        }
    }
    return dest;
}

export function setCheckboxModel(data, key, trueValue, falseValue, e, self) {
    var value = Options.getModel(data, key),
        checked = e.target.checked;
    if (isArray(value)) {
        value = value.slice(0);
        var index = indexOf(value, trueValue);
        if (checked) {
            if (!~index) {
                value.push(trueValue);
            }
        } else {
            if (~index) {
                value.splice(index, 1);
            }
        }
    } else {
        value = checked ? trueValue : falseValue;
    }
    Options.setModel(data, key, value, self);
}

export function detectCheckboxChecked(data, key, trueValue) {
    var value = Options.getModel(data, key);
    if (isArray(value)) {
        return indexOf(value, trueValue) > -1;
    } else {
        return value === trueValue;
    }
}

export function setSelectModel(data, key, e, self) {
    var target = e.target,
        multiple = target.multiple,
        value, i, opt,
        options = target.options;

    if (multiple) {
        value = [];
        for (i = 0; i < options.length; i++) {
            opt = options[i];
            if (opt.selected) {
                value.push(isNullOrUndefined(opt._value) ? opt.value : opt._value);
            }
        }
    } else {
        for (i = 0; i < options.length; i++) {
            opt = options[i];
            if (opt.selected) {
                value = isNullOrUndefined(opt._value) ? opt.value : opt._value;
                break;
            }
        }
    }
    Options.setModel(data, key, value, self);
}

export const slice = Array.prototype.slice;

// in ie8 console.log is an object
export const hasConsole = typeof console !== 'undefined' && typeof console.log === 'function';
export const error = hasConsole ? function(e) {console.error(e.stack);} : noop;
