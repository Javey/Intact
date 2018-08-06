(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Intact = factory());
}(this, (function () { 'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var toString$1 = Object.prototype.toString;

var doc = typeof document === 'undefined' ? {} : document;

var isArray = Array.isArray || function (arr) {
    return toString$1.call(arr) === '[object Array]';
};

function isObject$1(o) {
    return (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object' && o !== null;
}

function isStringOrNumber(o) {
    var type = typeof o === 'undefined' ? 'undefined' : _typeof(o);
    return type === 'string' || type === 'number';
}

function isNullOrUndefined(o) {
    return o === null || o === undefined;
}

function isComponentInstance(o) {
    return o && typeof o.init === 'function';
}

function isEventProp(propName) {
    return propName.substr(0, 3) === 'ev-';
}

function isInvalid(o) {
    return isNullOrUndefined(o) || o === false || o === true;
}

var indexOf = function () {
    if (Array.prototype.indexOf) {
        return function (arr, value) {
            return arr.indexOf(value);
        };
    } else {
        return function (arr, value) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] === value) {
                    return i;
                }
            }
            return -1;
        };
    }
}();

var nativeObject = Object.create;
var createObject = function () {
    if (nativeObject) {
        return function (obj) {
            return nativeObject(obj);
        };
    } else {
        return function (obj) {
            function Fn() {}
            Fn.prototype = obj;
            return new Fn();
        };
    }
}();

var SimpleMap = typeof Map === 'function' ? Map : function () {
    function SimpleMap() {
        this._keys = [];
        this._values = [];
        this.size = 0;
    }

    SimpleMap.prototype.set = function (key, value) {
        var index = indexOf(this._keys, key);
        if (!~index) {
            index = this._keys.push(key) - 1;
            this.size++;
        }
        this._values[index] = value;
        return this;
    };
    SimpleMap.prototype.get = function (key) {
        var index = indexOf(this._keys, key);
        if (!~index) return;
        return this._values[index];
    };
    SimpleMap.prototype.delete = function (key) {
        var index = indexOf(this._keys, key);
        if (!~index) return false;
        this._keys.splice(index, 1);
        this._values.splice(index, 1);
        this.size--;
        return true;
    };

    return SimpleMap;
}();

var skipProps = {
    key: true,
    ref: true,
    children: true,
    className: true,
    checked: true,
    multiple: true,
    defaultValue: true,
    'v-model': true
};

function isSkipProp(prop) {
    // treat prop which start with '_' as private prop, so skip it
    return skipProps[prop] || prop[0] === '_';
}

var booleanProps = {
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
    indeterminate: true
};

var strictProps = {
    volume: true,
    defaultChecked: true,
    value: true,
    htmlFor: true
};

var selfClosingTags = {
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

function MountedQueue() {
    this.queue = [];
}
MountedQueue.prototype.push = function (fn) {
    this.queue.push(fn);
};
MountedQueue.prototype.unshift = function (fn) {
    this.queue.unshift(fn);
};
MountedQueue.prototype.trigger = function () {
    var queue = this.queue;
    var callback = void 0;
    while (callback = queue.shift()) {
        callback();
    }
};

var browser = {};
if (typeof navigator !== 'undefined') {
    var ua = navigator.userAgent.toLowerCase();
    var index = ua.indexOf('msie ');
    if (~index) {
        browser.isIE = true;
        var version = parseInt(ua.substring(index + 5, ua.indexOf('.', index)), 10);
        browser.version = version;
        browser.isIE8 = version === 8;
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

var setTextContent = browser.isIE8 ? function (dom, text) {
    dom.innerText = text;
} : function (dom, text) {
    dom.textContent = text;
};

var svgNS = "http://www.w3.org/2000/svg";
var xlinkNS = "http://www.w3.org/1999/xlink";
var xmlNS = "http://www.w3.org/XML/1998/namespace";

var namespaces = {
    'xlink:href': xlinkNS,
    'xlink:arcrole': xlinkNS,
    'xlink:actuate': xlinkNS,
    'xlink:show': xlinkNS,
    'xlink:role': xlinkNS,
    'xlink:title': xlinkNS,
    'xlink:type': xlinkNS,
    'xml:base': xmlNS,
    'xml:lang': xmlNS,
    'xml:space': xmlNS
};

/** 
 * @fileoverview utility methods
 * @author javey
 * @date 15-4-22
 */

var i = 0;
var Type = {
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

    JSXDirective: i++
};
var TypeName = [];
for (var type in Type) {
    TypeName[Type[type]] = type;
}

// which children must be text
var TextTags = {
    style: true,
    script: true,
    textarea: true
};

var Directives = {
    'v-if': true,
    'v-else-if': true,
    'v-else': true,
    'v-for': true,
    'v-for-value': true,
    'v-for-key': true,
    'v-raw': true
};

var Options = {
    autoReturn: true,
    onlySource: false,
    delimiters: ['{', '}'],
    // remove `with` statement
    noWith: false,
    // whether rendering on server or not
    server: false,
    // skip all whitespaces in template
    skipWhitespace: true,
    setModel: function setModel(data, key, value, self) {
        data[key] = value;
        self.update();
    },
    getModel: function getModel(data, key) {
        return data[key];
    },
    disableSplitText: false // split text with <!---->
};

var hasOwn = Object.prototype.hasOwnProperty;
var noop = function noop() {};

function isArrayLike(value) {
    if (isNullOrUndefined(value)) return false;
    var length = value.length;
    return typeof length === 'number' && length > -1 && length % 1 === 0 && length <= 9007199254740991 && typeof value !== 'function';
}

function each(obj, iter, thisArg) {
    if (isArrayLike(obj)) {
        for (var i = 0, l = obj.length; i < l; i++) {
            iter.call(thisArg, obj[i], i, obj);
        }
    } else if (isObject$$1(obj)) {
        for (var key in obj) {
            if (hasOwn.call(obj, key)) {
                iter.call(thisArg, obj[key], key, obj);
            }
        }
    }
}

function isObject$$1(obj) {
    var type = typeof obj === 'undefined' ? 'undefined' : _typeof(obj);
    return type === 'function' || type === 'object' && !!obj;
}

function map(obj, iter, thisArgs) {
    var ret = [];
    each(obj, function (value, key, obj) {
        ret.push(iter.call(thisArgs, value, key, obj));
    });
    return ret;
}

function className(obj) {
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

function isWhiteSpace(charCode) {
    return charCode <= 160 && charCode >= 9 && charCode <= 13 || charCode == 32 || charCode == 160 || charCode == 5760 || charCode == 6158 || charCode >= 8192 && (charCode <= 8202 || charCode == 8232 || charCode == 8233 || charCode == 8239 || charCode == 8287 || charCode == 12288 || charCode == 65279);
}

function trimRight(str) {
    var index = str.length;

    while (index-- && isWhiteSpace(str.charCodeAt(index))) {}

    return str.slice(0, index + 1);
}

function trimLeft(str) {
    var length = str.length,
        index = -1;

    while (index++ < length && isWhiteSpace(str.charCodeAt(index))) {}

    return str.slice(index);
}

function setDelimiters(delimiters) {
    if (!isArray(delimiters)) {
        throw new Error('The parameter must be an array like ["{{", "}}"]');
    }
    Options.delimiters = delimiters;
}

function getDelimiters() {
    return Options.delimiters;
}

function configure(key, value) {
    if (typeof key === 'string') {
        if (value === undefined) {
            return Options[key];
        } else {
            Options[key] = value;
        }
    } else if (isObject$$1(key)) {
        extend(Options, key);
    }
    return Options;
}

function isSelfClosingTag(tag) {
    return selfClosingTags[tag];
}

function isTextTag(tag) {
    return TextTags[tag];
}

function isDirective(name) {
    return hasOwn.call(Directives, name);
}

function isVModel(name) {
    return name === 'v-model' || name.substr(0, 8) === 'v-model:';
}

function extend() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    var dest = args[0];
    var length = args.length;
    if (length > 1) {
        for (var i = 1; i < length; i++) {
            var source = args[i];
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

function setCheckboxModel(data, key, trueValue, falseValue, e, self) {
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

function detectCheckboxChecked(data, key, trueValue) {
    var value = Options.getModel(data, key);
    if (isArray(value)) {
        return indexOf(value, trueValue) > -1;
    } else {
        return value === trueValue;
    }
}

function setSelectModel(data, key, e, self) {
    var target = e.target,
        multiple = target.multiple,
        value,
        i,
        opt,
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

var error$2 = function () {
    var hasConsole = typeof console !== 'undefined';
    return hasConsole ? function (e) {
        console.error(e.stack);
    } : noop;
}();



var utils$1 = (Object.freeze || Object)({
	isNullOrUndefined: isNullOrUndefined,
	isArray: isArray,
	indexOf: indexOf,
	SelfClosingTags: selfClosingTags,
	isEventProp: isEventProp,
	Type: Type,
	TypeName: TypeName,
	TextTags: TextTags,
	Directives: Directives,
	Options: Options,
	hasOwn: hasOwn,
	noop: noop,
	each: each,
	isObject: isObject$$1,
	map: map,
	className: className,
	isWhiteSpace: isWhiteSpace,
	trimRight: trimRight,
	trimLeft: trimLeft,
	setDelimiters: setDelimiters,
	getDelimiters: getDelimiters,
	configure: configure,
	isSelfClosingTag: isSelfClosingTag,
	isTextTag: isTextTag,
	isDirective: isDirective,
	isVModel: isVModel,
	extend: extend,
	setCheckboxModel: setCheckboxModel,
	detectCheckboxChecked: detectCheckboxChecked,
	setSelectModel: setSelectModel,
	error: error$2
});

var toString$2 = Object.prototype.toString;

var doc$1 = typeof document === 'undefined' ? {} : document;

var isArray$1 = Array.isArray || function (arr) {
    return toString$2.call(arr) === '[object Array]';
};

function isObject$2(o) {
    return (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object' && o !== null;
}

function isStringOrNumber$1(o) {
    var type = typeof o === 'undefined' ? 'undefined' : _typeof(o);
    return type === 'string' || type === 'number';
}

function isNullOrUndefined$1(o) {
    return o === null || o === undefined;
}

function isComponentInstance$1(o) {
    return o && typeof o.init === 'function';
}

function isEventProp$1(propName) {
    return propName.substr(0, 3) === 'ev-';
}

function isInvalid$1(o) {
    return isNullOrUndefined$1(o) || o === false || o === true;
}

var indexOf$1 = function () {
    if (Array.prototype.indexOf) {
        return function (arr, value) {
            return arr.indexOf(value);
        };
    } else {
        return function (arr, value) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] === value) {
                    return i;
                }
            }
            return -1;
        };
    }
}();

var nativeObject$1 = Object.create;
var createObject$1 = function () {
    if (nativeObject$1) {
        return function (obj) {
            return nativeObject$1(obj);
        };
    } else {
        return function (obj) {
            function Fn() {}
            Fn.prototype = obj;
            return new Fn();
        };
    }
}();

var SimpleMap$1 = typeof Map === 'function' ? Map : function () {
    function SimpleMap() {
        this._keys = [];
        this._values = [];
        this.size = 0;
    }

    SimpleMap.prototype.set = function (key, value) {
        var index = indexOf$1(this._keys, key);
        if (!~index) {
            index = this._keys.push(key) - 1;
            this.size++;
        }
        this._values[index] = value;
        return this;
    };
    SimpleMap.prototype.get = function (key) {
        var index = indexOf$1(this._keys, key);
        if (!~index) return;
        return this._values[index];
    };
    SimpleMap.prototype.delete = function (key) {
        var index = indexOf$1(this._keys, key);
        if (!~index) return false;
        this._keys.splice(index, 1);
        this._values.splice(index, 1);
        this.size--;
        return true;
    };

    return SimpleMap;
}();

var skipProps$1 = {
    key: true,
    ref: true,
    children: true,
    className: true,
    checked: true,
    multiple: true,
    defaultValue: true,
    'v-model': true
};

function isSkipProp$1(prop) {
    // treat prop which start with '_' as private prop, so skip it
    return skipProps$1[prop] || prop[0] === '_';
}

var booleanProps$1 = {
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
    indeterminate: true
};

var strictProps$1 = {
    volume: true,
    defaultChecked: true,
    value: true,
    htmlFor: true
};

var selfClosingTags$1 = {
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

function MountedQueue$1() {
    this.queue = [];
}
MountedQueue$1.prototype.push = function (fn) {
    this.queue.push(fn);
};
MountedQueue$1.prototype.unshift = function (fn) {
    this.queue.unshift(fn);
};
MountedQueue$1.prototype.trigger = function () {
    var queue = this.queue;
    var callback = void 0;
    while (callback = queue.shift()) {
        callback();
    }
};

var browser$1 = {};
if (typeof navigator !== 'undefined') {
    var ua$1 = navigator.userAgent.toLowerCase();
    var index$1 = ua$1.indexOf('msie ');
    if (~index$1) {
        browser$1.isIE = true;
        var version$1 = parseInt(ua$1.substring(index$1 + 5, ua$1.indexOf('.', index$1)), 10);
        browser$1.version = version$1;
        browser$1.isIE8 = version$1 === 8;
    } else if (~ua$1.indexOf('edge')) {
        browser$1.isEdge = true;
    } else if (~ua$1.indexOf('safari')) {
        if (~ua$1.indexOf('chrome')) {
            browser$1.isChrome = true;
        } else {
            browser$1.isSafari = true;
        }
    }
}

var setTextContent$1 = browser$1.isIE8 ? function (dom, text) {
    dom.innerText = text;
} : function (dom, text) {
    dom.textContent = text;
};

var svgNS$1 = "http://www.w3.org/2000/svg";
var xlinkNS$1 = "http://www.w3.org/1999/xlink";
var xmlNS$1 = "http://www.w3.org/XML/1998/namespace";

var namespaces$1 = {
    'xlink:href': xlinkNS$1,
    'xlink:arcrole': xlinkNS$1,
    'xlink:actuate': xlinkNS$1,
    'xlink:show': xlinkNS$1,
    'xlink:role': xlinkNS$1,
    'xlink:title': xlinkNS$1,
    'xlink:type': xlinkNS$1,
    'xml:base': xmlNS$1,
    'xml:lang': xmlNS$1,
    'xml:space': xmlNS$1
};

/**
 * @fileoverview parse jsx to ast
 * @author javey
 * @date 15-4-22
 */

var Type$1 = Type;
var TypeName$1 = TypeName;

var elementNameRegexp = /^<\w+:?\s*[\{\w\/>]/;
// const importRegexp = /^\s*\bimport\b/;

function isJSXIdentifierPart(ch) {
    return ch === 58 || ch === 95 || ch === 45 || ch === 36 || ch === 46 || // : _ (underscore) - $ .
    ch >= 65 && ch <= 90 || // A..Z
    ch >= 97 && ch <= 122 || // a..z
    ch >= 48 && ch <= 57; // 0..9
}

function Parser() {
    this.source = '';
    this.index = 0;
    this.length = 0;
}

Parser.prototype = {
    constructor: Parser,

    parse: function parse(source, options) {
        this.source = trimRight(source);
        this.index = 0;
        this.line = 1;
        this.column = 1;
        this.length = this.source.length;

        this.options = extend({}, configure(), options);

        return this._parseTemplate(true);
    },

    _parseTemplate: function _parseTemplate(isRoot) {
        var elements = [],
            braces = { count: 0 };
        while (this.index < this.length && braces.count >= 0) {
            elements.push(this._advance(braces, isRoot));
        }

        return elements;
    },

    _advance: function _advance(braces, isRoot) {
        var ch = this._char();
        if (isRoot && this._isJSImport()) {
            return this._scanJSImport();
        } else if (ch !== '<') {
            return this._scanJS(braces, isRoot);
        } else {
            return this._scanJSX();
        }
    },

    _scanJS: function _scanJS(braces, isRoot) {
        var start = this.index,
            tmp,
            Delimiters = this.options.delimiters;

        while (this.index < this.length) {
            this._skipJSComment();
            var ch = this._char();
            if (ch === '\'' || ch === '"' || ch === '`') {
                // skip element(<div>) in quotes
                this._scanStringLiteral();
            } else if (this._isElementStart()) {
                break;
            } else if (isRoot && this._isJSImport()) {
                break;
            } else {
                if (ch === '{') {
                    braces.count++;
                } else if (braces.count > 0 && ch === '}') {
                    braces.count--;
                } else if (this._isExpect(Delimiters[1])) {
                    // for parseTemplate break
                    braces.count--;
                    break;
                } else if (ch === '\n') {
                    this._updateLine();
                }
                this._updateIndex();
            }
        }

        return this._type(Type$1.JS, {
            value: this.source.slice(start, this.index)
        });
    },

    _scanJSImport: function _scanJSImport() {
        var start = this.index;
        this._updateIndex(7); // 'import '.length
        while (this.index < this.length) {
            var ch = this._char();
            this._updateIndex();
            if ((ch === '\'' || ch === '"') && ((ch = this._char()) === ';' || ch === '\n')) {
                if (ch === '\n') {
                    this._updateLine();
                }
                this._updateIndex();
                break;
            }
        }

        return this._type(Type$1.JSImport, {
            value: this.source.slice(start, this.index)
        });
    },


    _scanStringLiteral: function _scanStringLiteral() {
        var quote = this._char(),
            start = this.index,
            str = '';
        this._updateIndex();

        while (this.index < this.length) {
            var ch = this._char();
            if (ch.charCodeAt(0) === 10) {
                this._updateLine();
            }
            this._updateIndex();

            if (ch === quote) {
                quote = '';
                break;
            } else if (ch === '\\') {
                str += this._char(this._updateIndex());
            } else {
                str += ch;
            }
        }
        if (quote !== '') {
            this._error('Unclosed quote');
        }

        return this._type(Type$1.StringLiteral, {
            value: this.source.slice(start, this.index)
        });
    },

    _scanJSX: function _scanJSX() {
        return this._parseJSXElement();
    },

    _scanJSXText: function _scanJSXText(stopChars) {
        var start = this.index,
            l = stopChars.length,
            i,
            charCode;

        loop: while (this.index < this.length) {
            charCode = this._charCode();
            if (isWhiteSpace(charCode)) {
                if (charCode === 10) {
                    this._updateLine();
                }
            } else {
                for (i = 0; i < l; i++) {
                    if (typeof stopChars[i] === 'function' && stopChars[i].call(this) || this._isExpect(stopChars[i])) {
                        break loop;
                    }
                }
            }
            this._updateIndex();
        }

        return this._type(Type$1.JSXText, {
            value: this.source.slice(start, this.index)
        });
    },

    _scanJSXStringLiteral: function _scanJSXStringLiteral() {
        var quote = this._char();
        if (quote !== '\'' && quote !== '"' && quote !== '`') {
            this._error('String literal must starts with a qoute');
        }
        this._updateIndex();
        var token = this._scanJSXText([quote]);
        this._updateIndex();
        return token;
    },

    _parseJSXElement: function _parseJSXElement(prev) {
        this._expect('<');
        var start = this.index,
            ret = {},
            flag = this._charCode(),

        // save the position to show error if unclosed tag
        position = { line: this.line, column: this.column };

        if (flag >= 65 && flag <= 90 /* upper case */) {
                // is a widget
                this._type(Type$1.JSXWidget, ret);
            } else if (this._isExpect('!--')) {
            // is html comment
            return this._parseJSXComment();
        } else if (this._charCode(this.index + 1) === 58 /* : */) {
                // is a directive
                start += 2;
                switch (flag) {
                    case 116:
                        // t
                        this._type(Type$1.JSXVdt, ret);
                        break;
                    case 98:
                        // b
                        this._type(Type$1.JSXBlock, ret);
                        break;
                    default:
                        this._error('Unknown directive ' + String.fromCharCode(flag) + ':');
                }
                this._updateIndex(2);
            } else {
            // is an element
            this._type(Type$1.JSXElement, ret);
        }

        while (this.index < this.length) {
            if (!isJSXIdentifierPart(this._charCode())) {
                break;
            }
            this._updateIndex();
        }

        ret.value = this.source.slice(start, this.index);

        return this._parseAttributeAndChildren(ret, prev, position);
    },

    _parseAttributeAndChildren: function _parseAttributeAndChildren(ret, prev, position) {
        ret.children = [];
        this._parseJSXAttribute(ret, prev);

        if (ret.type === Type$1.JSXElement && isSelfClosingTag(ret.value)) {
            // self closing tag
            if (this._char() === '/') {
                this._updateIndex();
            }
            this._expect('>');
        } else if (this._char() === '/') {
            // unknown self closing tag
            this._updateIndex();
            this._expect('>');
        } else {
            this._expect('>');
            ret.children = this._parseJSXChildren(ret, ret.hasVRaw, position);
        }

        return ret;
    },

    _parseJSXAttribute: function _parseJSXAttribute(ret, prev) {
        ret = extend(ret, {
            attributes: [],
            directives: {},
            hasVRaw: false
        });
        while (this.index < this.length) {
            this._skipWhitespace();
            if (this._char() === '/' || this._char() === '>') {
                break;
            } else {
                var Delimiters = this.options.delimiters;
                if (this._isExpect(Delimiters[0])) {
                    // support dynamic attributes
                    ret.attributes.push(this._parseJSXExpressionContainer());
                    continue;
                }

                var attr = this._parseJSXAttributeName(ret, prev);

                if (attr.name === 'v-raw') {
                    ret.hasVRaw = true;
                    continue;
                }
                if (this._char() === '=') {
                    this._updateIndex();
                    attr.value = this._parseJSXAttributeValue();
                } else {
                    // treat no-value attribute as true
                    attr.value = this._type(Type$1.JSXExpressionContainer, { value: [this._type(Type$1.JS, { value: 'true' })] });
                }

                if (attr.type === Type$1.JSXAttribute) {
                    ret.attributes.push(attr);
                } else {
                    ret.directives[attr.name] = attr;
                }
            }
        }

        return ret;
    },

    _parseJSXAttributeName: function _parseJSXAttributeName(ret, prev) {
        var start = this.index;
        if (!isJSXIdentifierPart(this._charCode())) {
            this._error('Unexpected identifier ' + this._char());
        }
        while (this.index < this.length) {
            var ch = this._charCode();
            if (!isJSXIdentifierPart(ch)) {
                break;
            }
            this._updateIndex();
        }

        var name = this.source.slice(start, this.index);
        if (isDirective(name)) {
            var attr = this._type(Type$1.JSXDirective, { name: name });
            this._parseJSXAttributeVIf(ret, attr, prev);

            return attr;
        }

        return this._type(Type$1.JSXAttribute, { name: name });
    },

    _parseJSXAttributeVIf: function _parseJSXAttributeVIf(ret, attr, prev) {
        var name = attr.name;
        if (name === 'v-else-if' || name === 'v-else') {
            var emptyTextNodes = []; // persist empty text node, skip them if find v-else-if or v-else
            var skipNodes = function skipNodes() {
                each(emptyTextNodes, function (item) {
                    item.skip = true;
                });
                emptyTextNodes = [];
            };

            prev = { prev: prev };
            while (prev = prev.prev) {
                if (prev.type === Type$1.JSXText && /^\s*$/.test(prev.value)) {
                    emptyTextNodes.push(prev);
                    continue;
                }
                var type = prev.type;
                if (type === Type$1.JSXComment) continue;
                if (type === Type$1.JSXElement || type === Type$1.JSXWidget || type === Type$1.JSXVdt || type === Type$1.JSXBlock) {
                    var prevDirectives = prev.directives;
                    if (prevDirectives['v-if'] || prevDirectives['v-else-if']) {
                        prev.next = ret;
                        ret.skip = true;
                        skipNodes();
                    }
                }
                break;
            }

            if (!ret.skip) {
                this._error(name + ' must be led with v-if or v-else-if');
            }
        }
    },

    _parseJSXAttributeValue: function _parseJSXAttributeValue() {
        var value,
            Delimiters = this.options.delimiters;
        if (this._isExpect(Delimiters[0])) {
            value = this._parseJSXExpressionContainer();
        } else {
            value = this._scanJSXStringLiteral();
        }
        return value;
    },

    _parseJSXExpressionContainer: function _parseJSXExpressionContainer() {
        var expression,
            Delimiters = this.options.delimiters;
        this._expect(Delimiters[0]);
        if (this._isExpect(Delimiters[1])) {
            expression = this._parseJSXEmptyExpression();
        } else if (this._isExpect('=')) {
            // if the lead char is '=', then treat it as unescape string
            expression = this._parseJSXUnescapeText();
            this._expect(Delimiters[1]);
            return expression;
        } else {
            expression = this._parseExpression();
        }
        this._expect(Delimiters[1]);

        return this._type(Type$1.JSXExpressionContainer, { value: expression });
    },

    _parseJSXEmptyExpression: function _parseJSXEmptyExpression() {
        return this._type(Type$1.JSXEmptyExpression, { value: null });
    },

    _parseExpression: function _parseExpression() {
        return this._parseTemplate();
    },

    _parseJSXUnescapeText: function _parseJSXUnescapeText() {
        this._expect('=');
        return this._type(Type$1.JSXUnescapeText, {
            value: this._parseTemplate()
        });
    },

    _parseJSXChildren: function _parseJSXChildren(element, hasVRaw, position) {
        var children = [],
            endTag = element.value + '>',
            current = null;

        switch (element.type) {
            case Type$1.JSXBlock:
                endTag = '</b:' + endTag;
                break;
            case Type$1.JSXVdt:
                endTag = '</t:' + endTag;
                break;
            case Type$1.JSXElement:
            default:
                endTag = '</' + endTag;
                break;
        }

        if (hasVRaw) {
            while (this.index < this.length) {
                if (this._isExpect(endTag)) {
                    break;
                }
                children.push(this._scanJSXText([endTag]));
            }
        } else {
            this._skipWhitespaceBetweenElements(endTag);
            while (this.index < this.length) {
                if (this._isExpect(endTag)) {
                    break;
                }
                current = this._parseJSXChild(element, endTag, current);
                children.push(current);
            }
        }
        this._parseJSXClosingElement(endTag, position);
        return children;
    },

    _parseJSXChild: function _parseJSXChild(element, endTag, prev) {
        var ret,
            Delimiters = this.options.delimiters;

        if (this._isExpect(Delimiters[0])) {
            ret = this._parseJSXExpressionContainer();
        } else if (isTextTag(element.value)) {
            ret = this._scanJSXText([endTag, Delimiters[0]]);
        } else if (this._isElementStart()) {
            ret = this._parseJSXElement(prev);
            this._skipWhitespaceBetweenElements(endTag);
        } else {
            ret = this._scanJSXText([function () {
                return this._isExpect(endTag) || this._isElementStart();
            }, Delimiters[0]]);
        }

        ret.prev = undefined;
        ret.next = undefined;
        if (prev) {
            prev.next = ret;
            ret.prev = prev;
        }

        return ret;
    },

    _parseJSXClosingElement: function _parseJSXClosingElement(endTag, position) {
        this._expect('</', 'Unclosed tag: ' + endTag, position);

        while (this.index < this.length) {
            if (!isJSXIdentifierPart(this._charCode())) {
                break;
            }
            this._updateIndex();
        }

        this._skipWhitespace();
        this._expect('>');
    },

    _parseJSXComment: function _parseJSXComment() {
        this._expect('!--');
        var start = this.index;
        while (this.index < this.length) {
            if (this._isExpect('-->')) {
                break;
            } else if (this._charCode() === 10) {
                this._updateLine();
            }
            this._updateIndex();
        }
        var ret = this._type(Type$1.JSXComment, {
            value: this.source.slice(start, this.index)
        });
        this._expect('-->');

        return ret;
    },

    _char: function _char() {
        var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.index;

        return this.source.charAt(index);
    },

    _charCode: function _charCode() {
        var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.index;

        return this.source.charCodeAt(index);
    },

    _skipWhitespaceBetweenElements: function _skipWhitespaceBetweenElements(endTag) {
        if (!this.options.skipWhitespace) return;

        var start = this.index;
        while (start < this.length) {
            var code = this._charCode(start);
            if (isWhiteSpace(code)) {
                start++;
            } else if (this._isExpect(endTag, start) || this._isElementStart(start)) {
                this._skipWhitespace();
                break;
            } else {
                break;
            }
        }
    },

    _skipWhitespace: function _skipWhitespace() {
        while (this.index < this.length) {
            var code = this._charCode();
            if (!isWhiteSpace(code)) {
                break;
            } else if (code === 10) {
                // is \n
                this._updateLine();
            }
            this._updateIndex();
        }
    },

    _skipJSComment: function _skipJSComment() {
        if (this._char() === '/') {
            var ch = this._char(this.index + 1);
            if (ch === '/') {
                this._updateIndex(2);
                while (this.index < this.length) {
                    if (this._charCode() === 10) {
                        // is \n
                        this._updateLine();
                        break;
                    }
                    this._updateIndex();
                }
            } else if (ch === '*') {
                this._updateIndex(2);
                while (this.index < this.length) {
                    if (this._isExpect('*/')) {
                        this._updateIndex(2);
                        break;
                    } else if (this._charCode() === 10) {
                        this._updateLine();
                    }
                    this._updateIndex();
                }
            }
        }
    },

    _expect: function _expect(str, msg, position) {
        if (!this._isExpect(str)) {
            this._error(msg || 'Expect string ' + str, position);
        }
        this._updateIndex(str.length);
    },

    _isExpect: function _isExpect(str) {
        var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.index;

        return this.source.slice(index, index + str.length) === str;
    },

    _isElementStart: function _isElementStart() {
        var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.index;

        return this._char(index) === '<' && (this._isExpect('<!--') || elementNameRegexp.test(this.source.slice(index)));
    },

    _isJSImport: function _isJSImport() {
        return this._isExpect('import ');
    },

    _type: function _type(type, ret) {
        ret || (ret = {});
        ret.type = type;
        ret.typeName = TypeName$1[type];
        ret.line = this.line;
        ret.column = this.column;
        return ret;
    },

    _updateLine: function _updateLine() {
        this.line++;
        this.column = 0;
    },

    _updateIndex: function _updateIndex(value) {
        value === undefined && (value = 1);
        var index = this.index;
        this.index = this.index + value;
        this.column = this.column + value;
        return index;
    },

    _error: function _error(msg, position) {
        var lines = this.source.split('\n');

        var _ref = position || this,
            line = _ref.line,
            column = _ref.column;

        var error$$1 = new Error(msg + ' At: {line: ' + line + ', column: ' + column + '}\n' + ('> ' + line + ' | ' + lines[line - 1] + '\n') + ('  ' + new Array(String(line).length + 1).join(' ') + ' | ' + new Array(column).join(' ') + '^'));
        error$$1.line = line;
        error$$1.column = column;
        error$$1.source = this.source;

        throw error$$1;
    }
};

/**
 * @fileoverview stringify ast of jsx to js
 * @author javey
 * @date 15-4-22
 */

var Type$2 = Type;
var TypeName$2 = TypeName;


var attrMap = function () {
    var map$$1 = {
        'class': 'className',
        'for': 'htmlFor'
    };
    return function (name) {
        return map$$1[name] || name;
    };
}();

var normalizeArgs = function normalizeArgs(args) {
    var l = args.length - 1;
    for (var i = l; i >= 0; i--) {
        if (args[i] !== 'null') {
            break;
        }
    }
    return (i === l ? args : args.slice(0, i + 1)).join(', ');
};

function Stringifier() {}

Stringifier.prototype = {
    constructor: Stringifier,

    stringify: function stringify(ast, autoReturn) {
        if (arguments.length === 1) {
            autoReturn = true;
        }
        this.autoReturn = !!autoReturn;
        this.enterStringExpression = false;
        this.head = ''; // save import syntax
        return this._visitJSXExpressionContainer(ast, true);
    },

    _visitJSXExpressionContainer: function _visitJSXExpressionContainer(ast, isRoot) {
        var str = '',
            length = ast.length,
            hasDestructuring = false;
        each(ast, function (element, i) {
            // if is root, add `return` keyword
            if (this.autoReturn && isRoot && i === length - 1) {
                str += 'return ';
            }
            var tmp = this._visit(element, isRoot);
            if (isRoot && element.type === Type$2.JSImport) {
                this.head += tmp;
            } else {
                str += tmp;
            }
        }, this);

        if (!isRoot && !this.enterStringExpression) {
            // special for ... syntaxt
            str = trimLeft(str);
            if (str[0] === '.' && str[1] === '.' && str[2] === '.') {
                hasDestructuring = true;
                str = str.substr(3);
            }
            // add [][0] for return /* comment */
            str = 'function() {try {return [' + str + '][0]} catch(e) {_e(e)}}.call($this)';
            // str = 'function() {try {return (' + str + ')} catch(e) {_e(e)}}.call($this)';
            if (hasDestructuring) {
                str = '...' + str;
            }
        }

        return str;
    },

    _visit: function _visit(element, isRoot) {
        element = element || {};
        switch (element.type) {
            case Type$2.JS:
            case Type$2.JSImport:
                return this._visitJS(element);
            case Type$2.JSXElement:
                return this._visitJSXElement(element);
            case Type$2.JSXText:
                return this._visitJSXText(element);
            case Type$2.JSXUnescapeText:
                return this._visitJSXUnescapeText(element);
            case Type$2.JSXExpressionContainer:
                return this._visitJSXExpressionContainer(element.value);
            case Type$2.JSXWidget:
                return this._visitJSXWidget(element);
            case Type$2.JSXBlock:
                return this._visitJSXBlock(element, true);
            case Type$2.JSXVdt:
                return this._visitJSXVdt(element, isRoot);
            case Type$2.JSXComment:
                return this._visitJSXComment(element);
            default:
                return 'null';
        }
    },

    _visitJS: function _visitJS(element) {
        return this.enterStringExpression ? '(' + element.value + ')' : element.value;
    },

    _visitJSXElement: function _visitJSXElement(element) {
        if (element.value === 'script' || element.value === 'style') {
            if (element.children.length) {
                element.attributes.push({
                    type: Type$2.JSXAttribute,
                    typeName: TypeName$2[Type$2.JSXAttribute],
                    name: 'innerHTML',
                    value: {
                        type: Type$2.JS,
                        typeName: TypeName$2[Type$2.JS],
                        value: this._visitJSXChildrenAsString(element.children)
                    }
                });
                element.children = [];
            }
        }

        var attributes = this._visitJSXAttribute(element, true, true);
        var ret = "h(" + normalizeArgs(["'" + element.value + "'", attributes.props, this._visitJSXChildren(element.children), attributes.className, attributes.key, attributes.ref]) + ')';

        return this._visitJSXDirective(element, ret);
    },

    _visitJSXChildren: function _visitJSXChildren(children) {
        var ret = [];
        each(children, function (child) {
            // ignore element which handled by directive
            if (child.skip) return;
            ret.push(this._visit(child));
        }, this);

        return ret.length > 1 ? '[' + ret.join(', ') + ']' : ret[0] || 'null';
    },

    _visitJSXDirective: function _visitJSXDirective(element, ret) {
        var directiveFor = {
            data: null,
            value: 'value',
            key: 'key'
        };
        each(element.directives, function (directive) {
            switch (directive.name) {
                case 'v-if':
                    ret = this._visitJSXDirectiveIf(directive, ret, element);
                    break;
                case 'v-for':
                    directiveFor.data = this._visitJSXAttributeValue(directive.value);
                    break;
                case 'v-for-value':
                    directiveFor.value = this._visitJSXText(directive.value, true);
                    break;
                case 'v-for-key':
                    directiveFor.key = this._visitJSXText(directive.value, true);
                    break;
                default:
                    break;
            }
        }, this);
        // if exists v-for
        if (directiveFor.data) {
            ret = this._visitJSXDirectiveFor(directiveFor, ret);
        }

        return ret;
    },

    _visitJSXDirectiveIf: function _visitJSXDirectiveIf(directive, ret, element) {
        var result = this._visitJSXAttributeValue(directive.value) + ' ? ' + ret + ' : ',
            hasElse = false,
            next = element;

        while (next = next.next) {
            var nextDirectives = next.directives;

            if (!nextDirectives) break;

            if (nextDirectives['v-else-if']) {
                result += this._visitJSXAttributeValue(nextDirectives['v-else-if'].value) + ' ? ' + this._visit(next) + ' : ';
            } else if (nextDirectives['v-else']) {
                result += this._visit(next);
                hasElse = true;
                break;
            }
        }
        if (!hasElse) result += 'undefined';

        return result;
    },

    _visitJSXDirectiveFor: function _visitJSXDirectiveFor(directive, ret) {
        return '_Vdt.utils.map(' + directive.data + ', function(' + directive.value + ', ' + directive.key + ') {\n' + 'return ' + ret + ';\n' + '}, this)';
    },

    _visitJSXChildrenAsString: function _visitJSXChildrenAsString(children) {
        var ret = [];
        this.enterStringExpression = true;
        each(children, function (child) {
            ret.push(this._visit(child));
        }, this);
        this.enterStringExpression = false;
        return ret.join('+');
    },

    _visitJSXAttribute: function _visitJSXAttribute(element, individualClassName, individualKeyAndRef) {
        var ret = [],
            events = {},

        // support bind multiple callbacks for the same event
        addEvent = function addEvent(name, value) {
            var v = events[name];
            if (v) {
                if (!isArray(v)) {
                    events[name] = [v];
                }
                events[name].push(value);
            } else {
                events[name] = value;
            }
        },
            attributes = element.attributes,
            className$$1,
            key,
            ref,
            type = 'text',
            models = [],
            addition = { trueValue: true, falseValue: false };
        each(attributes, function (attr) {
            if (attr.type === Type$2.JSXExpressionContainer) {
                return ret.push(this._visitJSXAttributeValue(attr));
            }
            var name = attrMap(attr.name),
                value = this._visitJSXAttributeValue(attr.value);
            if ((name === 'widget' || name === 'ref') && attr.value.type === Type$2.JSXText) {
                // for compatility v1.0
                // convert widget="a" to ref=(i) => widgets.a = i
                // convert ref="a" to ref=(i) => widgets.a = i. For Intact
                ref = 'function(i) {widgets[' + value + '] = i}';
                return;
            } else if (name === 'className') {
                // process className individually
                if (attr.value.type === Type$2.JSXExpressionContainer) {
                    // for class={ {active: true} }
                    value = '_className(' + value + ')';
                }
                if (individualClassName) {
                    className$$1 = value;
                    return;
                }
            } else if (name === 'key' && individualKeyAndRef) {
                key = value;
                return;
            } else if (name === 'ref' && individualKeyAndRef) {
                ref = value;
                return;
            } else if (isVModel(name)) {
                var _name$split = name.split(':'),
                    model = _name$split[1];

                if (model === 'value') name = 'v-model';
                if (!model) model = 'value';
                models.push({ name: model, value: value });
            } else if (name === 'v-model-true') {
                addition.trueValue = value;
                return;
            } else if (name === 'v-model-false') {
                addition.falseValue = value;
                return;
            } else if (name === 'type') {
                // save the type value for v-model of input element
                type = value;
            } else if (name === 'value') {
                addition.value = value;
            } else if (isEventProp(name)) {
                addEvent(name, value);
                return;
            }
            ret.push("'" + name + "': " + value);
        }, this);

        for (var i = 0; i < models.length; i++) {
            this._visitJSXAttributeModel(element, models[i], ret, type, addition, addEvent);
        }

        each(events, function (value, name) {
            ret.push('\'' + name + '\': ' + (isArray(value) ? '[' + value.join(',') + ']' : value));
        });

        return {
            props: ret.length ? '{' + ret.join(', ') + '}' : 'null',
            className: className$$1 || 'null',
            ref: ref || 'null',
            key: key || 'null'
        };
    },

    _visitJSXAttributeModel: function _visitJSXAttributeModel(element, model, ret, type, addition, addEvent) {
        var valueName = model.name,
            value = model.value,
            eventName = 'change';

        if (element.type === Type$2.JSXElement) {
            switch (element.value) {
                case 'input':
                    switch (type) {
                        case "'file'":
                            eventName = 'change';
                            break;
                        case "'radio'":
                        case "'checkbox'":
                            var trueValue = addition.trueValue,
                                falseValue = addition.falseValue,
                                inputValue = addition.value;
                            if (isNullOrUndefined(inputValue)) {
                                ret.push('checked: _getModel(self, ' + value + ') === ' + trueValue);
                                addEvent('ev-change', 'function(__e) {\n                                    _setModel(self, ' + value + ', __e.target.checked ? ' + trueValue + ' : ' + falseValue + ', $this);\n                                }');
                            } else {
                                if (type === "'radio'") {
                                    ret.push('checked: _getModel(self, ' + value + ') === ' + inputValue);
                                    addEvent('ev-change', 'function(__e) { \n                                        _setModel(self, ' + value + ', __e.target.checked ? ' + inputValue + ' : ' + falseValue + ', $this);\n                                    }');
                                } else {
                                    ret.push('checked: _detectCheckboxChecked(self, ' + value + ', ' + inputValue + ')');
                                    addEvent('ev-change', 'function(__e) { \n                                        _setCheckboxModel(self, ' + value + ', ' + inputValue + ', ' + falseValue + ', __e, $this);\n                                    }');
                                }
                            }
                            return;
                        default:
                            eventName = 'input';
                            break;
                    }
                    break;
                case 'select':
                    ret.push('value: _getModel(self, ' + value + ')');
                    addEvent('ev-change', 'function(__e) {\n                        _setSelectModel(self, ' + value + ', __e, $this);\n                    }');
                    return;
                case 'textarea':
                    eventName = 'input';
                    break;
                default:
                    break;
            }
            addEvent('ev-' + eventName, 'function(__e) { _setModel(self, ' + value + ', __e.target.value, $this) }');
        } else if (element.type === Type$2.JSXWidget) {
            addEvent('ev-$change:' + valueName, 'function(__c, __n) { _setModel(self, ' + value + ', __n, $this) }');
        }
        ret.push(valueName + ': _getModel(self, ' + value + ')');
    },

    _visitJSXAttributeValue: function _visitJSXAttributeValue(value) {
        return isArray(value) ? this._visitJSXChildren(value) : this._visit(value);
    },

    _visitJSXText: function _visitJSXText(element, noQuotes) {
        var ret = element.value.replace(/([\'\"\\])/g, '\\$1').replace(/[\r\n]/g, '\\n');
        if (!noQuotes) {
            ret = "'" + ret + "'";
        }
        return ret;
    },

    _visitJSXUnescapeText: function _visitJSXUnescapeText(element) {
        return 'hu(' + this._visitJSXExpressionContainer(element.value) + ')';
    },

    _visitJSXWidget: function _visitJSXWidget(element) {
        var _visitJSXBlocks = this._visitJSXBlocks(element, false),
            blocks = _visitJSXBlocks.blocks,
            children = _visitJSXBlocks.children,
            hasBlock = _visitJSXBlocks.hasBlock;

        element.attributes.push({ name: 'children', value: children });
        element.attributes.push({ name: '_context', value: {
                type: Type$2.JS,
                value: '$this'
            } });
        if (hasBlock) {
            element.attributes.push({ name: '_blocks', value: blocks });
        }

        var attributes = this._visitJSXAttribute(element, false, false);
        return this._visitJSXDirective(element, 'h(' + normalizeArgs([element.value, attributes.props, 'null', 'null', attributes.key, attributes.ref]) + ')');
    },

    _visitJSXBlock: function _visitJSXBlock(element, isAncestor) {
        return this._visitJSXDirective(element, '(_blocks["' + element.value + '"] = function(parent) {return ' + this._visitJSXChildren(element.children) + ';}) && (__blocks["' + element.value + '"] = function(parent) {\n' + 'return blocks["' + element.value + '"] ? blocks["' + element.value + '"].call($this, function() {\n' + 'return _blocks["' + element.value + '"].call($this, parent);\n' + '}) : _blocks["' + element.value + '"].call($this, parent);\n' + '})' + (isAncestor ? ' && __blocks["' + element.value + '"].call($this)' : ''));
    },

    _visitJSXBlocks: function _visitJSXBlocks(element, isRoot) {
        var blocks = [];
        var children = [];
        each(element.children, function (child) {
            if (child.type === Type$2.JSXBlock) {
                blocks.push(this._visitJSXBlock(child, false));
            } else {
                children.push(child);
            }
        }, this);

        var _blocks = {
            type: Type$2.JS,
            value: blocks.length ? ['function(blocks) {', '    var _blocks = {}, __blocks = extend({}, blocks);', '    return (' + blocks.join(' && ') + ', __blocks);', '}.call($this, ' + (isRoot ? 'blocks' : '{}') + ')'].join('\n') : isRoot ? 'blocks' : 'null'
        };

        return { blocks: _blocks, children: children.length ? children : null, hasBlock: blocks.length };
    },

    _visitJSXVdt: function _visitJSXVdt(element, isRoot) {
        var _visitJSXBlocks2 = this._visitJSXBlocks(element, isRoot),
            blocks = _visitJSXBlocks2.blocks,
            children = _visitJSXBlocks2.children;

        element.attributes.push({ name: 'children', value: children });
        var ret = ['(function() {', '    var _obj = ' + this._visitJSXAttribute(element, false, false).props + ';', '    if (_obj.hasOwnProperty("arguments")) {', '        extend(_obj, _obj.arguments === true ? obj : _obj.arguments);', '        delete _obj.arguments;', '    }', '    return ' + element.value + '.call($this, _obj, _Vdt, ' + this._visitJS(blocks) + ', ' + element.value + ')', '}).call($this)'].join('\n');

        return this._visitJSXDirective(element, ret);
    },

    _visitJSXComment: function _visitJSXComment(element) {
        return 'hc(' + this._visitJSXText(element) + ')';
    }
};

var Types$1 = {
    Text: 1,
    HtmlElement: 1 << 1,

    ComponentClass: 1 << 2,
    ComponentFunction: 1 << 3,
    ComponentInstance: 1 << 4,

    HtmlComment: 1 << 5,

    InputElement: 1 << 6,
    SelectElement: 1 << 7,
    TextareaElement: 1 << 8,
    SvgElement: 1 << 9,

    UnescapeText: 1 << 10 // for server side render unescape text
};
Types$1.FormElement = Types$1.InputElement | Types$1.SelectElement | Types$1.TextareaElement;
Types$1.Element = Types$1.HtmlElement | Types$1.FormElement | Types$1.SvgElement;
Types$1.ComponentClassOrInstance = Types$1.ComponentClass | Types$1.ComponentInstance;
Types$1.TextElement = Types$1.Text | Types$1.HtmlComment;

var EMPTY_OBJ = {};
if (process.env.NODE_ENV !== 'production' && !browser.isIE) {
    Object.freeze(EMPTY_OBJ);
}

function VNode(type, tag, props, children, className, key, ref) {
    this.type = type;
    this.tag = tag;
    this.props = props;
    this.children = children;
    this.key = key;
    this.ref = ref;
    this.className = className;
}

function createVNode(tag, props, children, className, key, ref) {
    var type = void 0;
    props || (props = EMPTY_OBJ);
    switch (typeof tag === 'undefined' ? 'undefined' : _typeof(tag)) {
        case 'string':
            if (tag === 'input') {
                type = Types$1.InputElement;
            } else if (tag === 'select') {
                type = Types$1.SelectElement;
            } else if (tag === 'textarea') {
                type = Types$1.TextareaElement;
            } else if (tag === 'svg') {
                type = Types$1.SvgElement;
            } else {
                type = Types$1.HtmlElement;
            }
            break;
        case 'function':
            if (tag.prototype.init) {
                type = Types$1.ComponentClass;
            } else {
                // return tag(props);
                type = Types$1.ComponentFunction;
            }
            break;
        case 'object':
            if (tag.init) {
                return createComponentInstanceVNode(tag);
            }
        default:
            throw new Error('unknown vNode type: ' + tag);
    }

    if (type & (Types$1.ComponentClass | Types$1.ComponentFunction)) {
        if (!isNullOrUndefined(children)) {
            if (props === EMPTY_OBJ) props = {};
            props.children = normalizeChildren(children, false);
            // props.children = children;
        } else if (!isNullOrUndefined(props.children)) {
            props.children = normalizeChildren(props.children, false);
        }
        if (type & Types$1.ComponentFunction) {
            if (key || ref) {
                if (props === EMPTY_OBJ) props = {};
                if (key) props.key = key;
                if (ref) props.ref = ref;
            }
            return tag(props);
        }
    } else if (!isNullOrUndefined(children)) {
        children = normalizeChildren(children, true);
    }

    return new VNode(type, tag, props, children, className || props.className, key || props.key, ref || props.ref);
}

function createCommentVNode(children) {
    return new VNode(Types$1.HtmlComment, null, EMPTY_OBJ, children);
}

function createUnescapeTextVNode(children) {
    return new VNode(Types$1.UnescapeText, null, EMPTY_OBJ, children);
}

function createTextVNode(text) {
    return new VNode(Types$1.Text, null, EMPTY_OBJ, text);
}



function createComponentInstanceVNode(instance) {
    var props = instance.props || EMPTY_OBJ;
    return new VNode(Types$1.ComponentInstance, instance.constructor, props, instance, null, props.key, props.ref);
}

function normalizeChildren(vNodes, isAddKey) {
    if (isArray(vNodes)) {
        var childNodes = addChild(vNodes, { index: 0 }, isAddKey);
        return childNodes.length ? childNodes : null;
    } else if (isComponentInstance(vNodes)) {
        return createComponentInstanceVNode(vNodes);
    } else if (vNodes.type && !isNullOrUndefined(vNodes.dom)) {
        return directClone(vNodes);
    }
    return vNodes;
}

function applyKey(vNode, reference, isAddKey) {
    if (!isAddKey) return vNode;
    // start with '.' means the vNode has been set key by index
    // we will reset the key when it comes back again
    if (isNullOrUndefined(vNode.key) || vNode.key[0] === '.') {
        vNode.key = '.$' + reference.index++;
    }
    // add a flag to indicate that we have handle the vNode
    // when it came back we should clone it
    vNode.$ = true;
    return vNode;
}

function addChild(vNodes, reference, isAddKey) {
    var newVNodes = void 0;
    for (var i = 0; i < vNodes.length; i++) {
        var n = vNodes[i];
        if (isNullOrUndefined(n)) {
            if (!newVNodes) {
                newVNodes = vNodes.slice(0, i);
            }
        } else if (isArray(n)) {
            if (!newVNodes) {
                newVNodes = vNodes.slice(0, i);
            }
            newVNodes = newVNodes.concat(addChild(n, reference, isAddKey));
        } else if (isStringOrNumber(n)) {
            if (!newVNodes) {
                newVNodes = vNodes.slice(0, i);
            }
            newVNodes.push(applyKey(createTextVNode(n), reference, isAddKey));
        } else if (isComponentInstance(n)) {
            if (!newVNodes) {
                newVNodes = vNodes.slice(0, i);
            }
            newVNodes.push(applyKey(createComponentInstanceVNode(n), reference, isAddKey));
        } else if (n.type) {
            if (!newVNodes) {
                newVNodes = vNodes.slice(0, i);
            }
            if (n.dom || n.$) {
                newVNodes.push(applyKey(directClone(n), reference, isAddKey));
            } else {
                newVNodes.push(applyKey(n, reference, isAddKey));
            }
        }
    }
    return newVNodes || vNodes;
}

function directClone(vNode) {
    var newVNode = void 0;
    var type = vNode.type;

    if (type & Types$1.ComponentClassOrInstance) {
        var props = void 0;
        var propsToClone = vNode.props;

        if (propsToClone === EMPTY_OBJ || isNullOrUndefined(propsToClone)) {
            props = EMPTY_OBJ;
        } else {
            props = {};
            for (var key in propsToClone) {
                props[key] = propsToClone[key];
            }
        }

        newVNode = new VNode(type, vNode.tag, props, vNode.children, null, vNode.key, vNode.ref);

        var newProps = newVNode.props;
        var newChildren = newProps.children;

        if (newChildren) {
            if (isArray(newChildren)) {
                var len = newChildren.length;
                if (len > 0) {
                    var tmpArray = [];

                    for (var i = 0; i < len; i++) {
                        var child = newChildren[i];
                        if (isStringOrNumber(child)) {
                            tmpArray.push(child);
                        } else if (!isInvalid(child) && child.type) {
                            tmpArray.push(directClone(child));
                        }
                    }
                    newProps.children = tmpArray;
                }
            } else if (newChildren.type) {
                newProps.children = directClone(newChildren);
            }
        }
    } else if (type & Types$1.Element) {
        var children = vNode.children;
        var _props = void 0;
        var _propsToClone = vNode.props;

        if (_propsToClone === EMPTY_OBJ || isNullOrUndefined(_propsToClone)) {
            _props = EMPTY_OBJ;
        } else {
            _props = {};
            for (var _key in _propsToClone) {
                _props[_key] = _propsToClone[_key];
            }
        }

        newVNode = new VNode(type, vNode.tag, vNode.props, children, vNode.className, vNode.key, vNode.ref);
    } else if (type & Types$1.Text) {
        newVNode = createTextVNode(vNode.children);
    } else if (type & Types$1.HtmlComment) {
        newVNode = createCommentVNode(vNode.children);
    }

    return newVNode;
}

var ALL_PROPS = ["altKey", "bubbles", "cancelable", "ctrlKey", "eventPhase", "metaKey", "relatedTarget", "shiftKey", "target", "timeStamp", "type", "view", "which"];
var KEY_PROPS = ["char", "charCode", "key", "keyCode"];
var MOUSE_PROPS = ["button", "buttons", "clientX", "clientY", "layerX", "layerY", "offsetX", "offsetY", "pageX", "pageY", "screenX", "screenY", "toElement"];

var rkeyEvent = /^key|input/;
var rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/;

function Event(e) {
    for (var i = 0; i < ALL_PROPS.length; i++) {
        var propKey = ALL_PROPS[i];
        this[propKey] = e[propKey];
    }

    if (!e.target) {
        this.target = e.srcElement;
    }

    this._rawEvent = e;
}
Event.prototype.preventDefault = function () {
    var e = this._rawEvent;
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }
};
Event.prototype.stopPropagation = function () {
    var e = this._rawEvent;
    e.cancelBubble = true;
    e.stopImmediatePropagation && e.stopImmediatePropagation();
};

function MouseEvent(e) {
    Event.call(this, e);
    for (var j = 0; j < MOUSE_PROPS.length; j++) {
        var mousePropKey = MOUSE_PROPS[j];
        this[mousePropKey] = e[mousePropKey];
    }
}
MouseEvent.prototype = createObject(Event.prototype);
MouseEvent.prototype.constructor = MouseEvent;

function KeyEvent(e) {
    Event.call(this, e);
    for (var j = 0; j < KEY_PROPS.length; j++) {
        var keyPropKey = KEY_PROPS[j];
        this[keyPropKey] = e[keyPropKey];
    }
}
KeyEvent.prototype = createObject(Event.prototype);
KeyEvent.prototype.constructor = KeyEvent;

function proxyEvent(e) {
    if (rkeyEvent.test(e.type)) {
        return new KeyEvent(e);
    } else if (rmouseEvent.test(e.type)) {
        return new MouseEvent(e);
    } else {
        return new Event(e);
    }
}

var addEventListener = void 0;
var removeEventListener = void 0;
if ('addEventListener' in doc) {
    addEventListener = function addEventListener(dom, name, fn) {
        dom.addEventListener(name, fn, false);
    };

    removeEventListener = function removeEventListener(dom, name, fn) {
        dom.removeEventListener(name, fn);
    };
} else {
    addEventListener = function addEventListener(dom, name, fn) {
        fn.cb = function (e) {
            e = proxyEvent(e);
            fn(e);
        };
        dom.attachEvent("on" + name, fn.cb);
    };

    removeEventListener = function removeEventListener(dom, name, fn) {
        dom.detachEvent("on" + name, fn.cb || fn);
    };
}

var delegatedEvents = {};
var unDelegatesEvents = {
    'mouseenter': true,
    'mouseleave': true,
    'propertychange': true,
    'scroll': true
};

// change event can not be deletegated in IE8 
if (browser.isIE8) {
    unDelegatesEvents.change = true;
}

function handleEvent(name, lastEvent, nextEvent, dom) {
    if (name === 'blur') {
        name = 'focusout';
    } else if (name === 'focus') {
        name = 'focusin';
    } else if (browser.isIE8 && name === 'input') {
        name = 'propertychange';
    }

    if (!unDelegatesEvents[name]) {
        var delegatedRoots = delegatedEvents[name];

        if (nextEvent) {
            if (!delegatedRoots) {
                delegatedRoots = { items: new SimpleMap(), docEvent: null };
                delegatedRoots.docEvent = attachEventToDocument(name, delegatedRoots);
                delegatedEvents[name] = delegatedRoots;
            }
            delegatedRoots.items.set(dom, nextEvent);
        } else if (delegatedRoots) {
            var items = delegatedRoots.items;
            if (items.delete(dom)) {
                if (items.size === 0) {
                    removeEventListener(doc, name, delegatedRoots.docEvent);
                    delete delegatedEvents[name];
                }
            }
        }
    } else {
        if (lastEvent) {
            removeEventListener(dom, name, lastEvent);
        }
        if (nextEvent) {
            addEventListener(dom, name, nextEvent);
        }
    }
}

function dispatchEvent(event, target, items, count, isClick) {
    var eventToTrigger = items.get(target);
    if (eventToTrigger) {
        count--;
        event.currentTarget = target;
        eventToTrigger(event);
        if (event._rawEvent.cancelBubble) {
            return;
        }
    }
    if (count > 0) {
        var parentDom = target.parentNode;
        if (isNullOrUndefined(parentDom) || isClick && parentDom.nodeType === 1 && parentDom.disabled) {
            return;
        }
        dispatchEvent(event, parentDom, items, count, isClick);
    }
}

function attachEventToDocument(name, delegatedRoots) {
    var docEvent = function docEvent(event) {
        var count = delegatedRoots.items.size;
        event || (event = window.event);
        if (count > 0) {
            event = proxyEvent(event);
            dispatchEvent(event, event.target, delegatedRoots.items, count, event.type === 'click');
        }
    };
    addEventListener(doc, name, docEvent);
    return docEvent;
}

function processSelect(vNode, dom, nextProps, isRender) {
    var multiple = nextProps.multiple;
    if (multiple !== dom.multiple) {
        dom.multiple = multiple;
    }
    var children = vNode.children;

    if (!isNullOrUndefined(children)) {
        var value = nextProps.value;
        if (isRender && isNullOrUndefined(value)) {
            value = nextProps.defaultValue;
        }

        var flag = { hasSelected: false };
        if (isArray(children)) {
            for (var i = 0; i < children.length; i++) {
                updateChildOptionGroup(children[i], value, flag);
            }
        } else {
            updateChildOptionGroup(children, value, flag);
        }
        if (!flag.hasSelected) {
            dom.value = '';
        }
    }
}

function updateChildOptionGroup(vNode, value, flag) {
    var tag = vNode.tag;

    if (tag === 'optgroup') {
        var children = vNode.children;

        if (isArray(children)) {
            for (var i = 0; i < children.length; i++) {
                updateChildOption(children[i], value, flag);
            }
        } else {
            updateChildOption(children, value, flag);
        }
    } else {
        updateChildOption(vNode, value, flag);
    }
}

function updateChildOption(vNode, value, flag) {
    // skip text and comment node
    if (vNode.type & Types$1.HtmlElement) {
        var props = vNode.props;
        var dom = vNode.dom;

        if (isArray(value) && indexOf(value, props.value) !== -1 || props.value === value) {
            dom.selected = true;
            if (!flag.hasSelected) flag.hasSelected = true;
        } else if (!isNullOrUndefined(value) || !isNullOrUndefined(props.selected)) {
            var selected = !!props.selected;
            if (!flag.hasSelected && selected) flag.hasSelected = true;
            dom.selected = selected;
        }
    }
}

function processInput(vNode, dom, nextProps) {
    var type = nextProps.type;
    var value = nextProps.value;
    var checked = nextProps.checked;
    var defaultValue = nextProps.defaultValue;
    var multiple = nextProps.multiple;
    var hasValue = !isNullOrUndefined(value);

    if (multiple && multiple !== dom.multiple) {
        dom.multiple = multiple;
    }
    if (!isNullOrUndefined(defaultValue) && !hasValue) {
        dom.defaultValue = defaultValue + '';
    }
    if (isCheckedType(type)) {
        if (hasValue) {
            dom.value = value;
        }
        if (!isNullOrUndefined(checked)) {
            dom.checked = checked;
        }
    } else {
        if (hasValue && dom.value !== value) {
            dom.value = value;
        } else if (!isNullOrUndefined(checked)) {
            dom.checked = checked;
        }
    }
}

function isCheckedType(type) {
    return type === 'checkbox' || type === 'radio';
}

function processTextarea(vNode, dom, nextProps, isRender) {
    var value = nextProps.value;
    var domValue = dom.value;

    if (isNullOrUndefined(value)) {
        if (isRender) {
            var defaultValue = nextProps.defaultValue;
            if (!isNullOrUndefined(defaultValue)) {
                if (defaultValue !== domValue) {
                    dom.value = defaultValue;
                }
            } else if (domValue !== '') {
                dom.value = '';
            }
        }
    } else {
        if (domValue !== value) {
            dom.value = value;
        }
    }
}

function processForm(vNode, dom, nextProps, isRender) {
    var type = vNode.type;
    if (type & Types$1.InputElement) {
        processInput(vNode, dom, nextProps, isRender);
    } else if (type & Types$1.TextareaElement) {
        processTextarea(vNode, dom, nextProps, isRender);
    } else if (type & Types$1.SelectElement) {
        processSelect(vNode, dom, nextProps, isRender);
    }
}

function render(vNode, parentDom, mountedQueue, parentVNode, isSVG) {
    if (isNullOrUndefined(vNode)) return;
    var isTrigger = true;
    if (mountedQueue) {
        isTrigger = false;
    } else {
        mountedQueue = new MountedQueue();
    }
    var dom = createElement(vNode, parentDom, mountedQueue, true /* isRender */, parentVNode, isSVG);
    if (isTrigger) {
        mountedQueue.trigger();
    }
    return dom;
}

function createElement(vNode, parentDom, mountedQueue, isRender, parentVNode, isSVG) {
    var type = vNode.type;
    if (type & Types$1.Element) {
        return createHtmlElement(vNode, parentDom, mountedQueue, isRender, parentVNode, isSVG);
    } else if (type & Types$1.Text) {
        return createTextElement(vNode, parentDom);
    } else if (type & Types$1.ComponentClassOrInstance) {
        return createComponentClassOrInstance(vNode, parentDom, mountedQueue, null, isRender, parentVNode, isSVG);
        // } else if (type & Types.ComponentFunction) {
        // return createComponentFunction(vNode, parentDom, mountedQueue, isNotAppendChild, isRender);
        // } else if (type & Types.ComponentInstance) {
        // return createComponentInstance(vNode, parentDom, mountedQueue);
    } else if (type & Types$1.HtmlComment) {
        return createCommentElement(vNode, parentDom);
    } else {
        throw new Error('unknown vnode type ' + type);
    }
}

function createHtmlElement(vNode, parentDom, mountedQueue, isRender, parentVNode, isSVG) {
    var type = vNode.type;

    isSVG = isSVG || (type & Types$1.SvgElement) > 0;

    var dom = documentCreateElement(vNode.tag, isSVG);
    var children = vNode.children;
    var props = vNode.props;
    var className = vNode.className;

    vNode.dom = dom;
    vNode.parentVNode = parentVNode;

    if (!isNullOrUndefined(children)) {
        createElements(children, dom, mountedQueue, isRender, vNode, isSVG === true && vNode.tag !== 'foreignObject');
    }

    if (!isNullOrUndefined(className)) {
        if (isSVG) {
            dom.setAttribute('class', className);
        } else {
            dom.className = className;
        }
    }

    // in IE8, the select value will be set to the first option's value forcely
    // when it is appended to parent dom. We change its value in processForm does not
    // work. So processForm after it has be appended to parent dom.
    var isFormElement = void 0;
    if (props !== EMPTY_OBJ) {
        isFormElement = (vNode.type & Types$1.FormElement) > 0;
        for (var prop in props) {
            patchProp(prop, null, props[prop], dom, isFormElement, isSVG);
        }
    }

    var ref = vNode.ref;
    if (!isNullOrUndefined(ref)) {
        createRef(dom, ref, mountedQueue);
    }

    if (parentDom) {
        appendChild(parentDom, dom);
    }

    if (isFormElement) {
        processForm(vNode, dom, props, true);
    }

    return dom;
}

function createTextElement(vNode, parentDom) {
    var dom = doc.createTextNode(vNode.children);
    vNode.dom = dom;

    if (parentDom) {
        parentDom.appendChild(dom);
    }

    return dom;
}

function createComponentClassOrInstance(vNode, parentDom, mountedQueue, lastVNode, isRender, parentVNode, isSVG) {
    var props = vNode.props;
    var instance = vNode.type & Types$1.ComponentClass ? new vNode.tag(props) : vNode.children;
    instance.parentDom = parentDom;
    instance.mountedQueue = mountedQueue;
    instance.isRender = isRender;
    instance.parentVNode = parentVNode;
    instance.isSVG = isSVG;
    instance.vNode = vNode;
    var dom = instance.init(lastVNode, vNode);
    var ref = vNode.ref;

    vNode.dom = dom;
    vNode.children = instance;
    vNode.parentVNode = parentVNode;

    if (parentDom) {
        appendChild(parentDom, dom);
        // parentDom.appendChild(dom);
    }

    if (typeof instance.mount === 'function') {
        mountedQueue.push(function () {
            return instance.mount(lastVNode, vNode);
        });
    }

    if (typeof ref === 'function') {
        ref(instance);
    }

    return dom;
}



function createCommentElement(vNode, parentDom) {
    var dom = doc.createComment(vNode.children);
    vNode.dom = dom;

    if (parentDom) {
        parentDom.appendChild(dom);
    }

    return dom;
}



function createElements(vNodes, parentDom, mountedQueue, isRender, parentVNode, isSVG) {
    if (isStringOrNumber(vNodes)) {
        setTextContent(parentDom, vNodes);
    } else if (isArray(vNodes)) {
        for (var i = 0; i < vNodes.length; i++) {
            createElement(vNodes[i], parentDom, mountedQueue, isRender, parentVNode, isSVG);
        }
    } else {
        createElement(vNodes, parentDom, mountedQueue, isRender, parentVNode, isSVG);
    }
}

function removeElements(vNodes, parentDom) {
    if (isNullOrUndefined(vNodes)) {
        return;
    } else if (isArray(vNodes)) {
        for (var i = 0; i < vNodes.length; i++) {
            removeElement(vNodes[i], parentDom);
        }
    } else {
        removeElement(vNodes, parentDom);
    }
}

function removeElement(vNode, parentDom, nextVNode) {
    var type = vNode.type;
    if (type & Types$1.Element) {
        return removeHtmlElement(vNode, parentDom);
    } else if (type & Types$1.TextElement) {
        return removeText(vNode, parentDom);
    } else if (type & Types$1.ComponentClassOrInstance) {
        return removeComponentClassOrInstance(vNode, parentDom, nextVNode);
    } else if (type & Types$1.ComponentFunction) {
        return removeComponentFunction(vNode, parentDom);
    }
}

function removeHtmlElement(vNode, parentDom) {
    var ref = vNode.ref;
    var props = vNode.props;
    var dom = vNode.dom;

    if (ref) {
        ref(null);
    }

    removeElements(vNode.children, null);

    // remove event
    for (var name in props) {
        var prop = props[name];
        if (!isNullOrUndefined(prop) && isEventProp(name)) {
            handleEvent(name.substr(3), prop, null, dom);
        }
    }

    if (parentDom) {
        parentDom.removeChild(dom);
    }
}

function removeText(vNode, parentDom) {
    if (parentDom) {
        parentDom.removeChild(vNode.dom);
    }
}

function removeComponentFunction(vNode, parentDom) {
    var ref = vNode.ref;
    if (ref) {
        ref(null);
    }
    removeElement(vNode.children, parentDom);
}

function removeComponentClassOrInstance(vNode, parentDom, nextVNode) {
    var instance = vNode.children;
    var ref = vNode.ref;

    if (typeof instance.destroy === 'function') {
        instance.destroy(vNode, nextVNode, parentDom);
    }

    if (ref) {
        ref(null);
    }

    // instance destroy method will remove everything
    // removeElements(vNode.props.children, null);

    if (parentDom) {
        removeChild(parentDom, vNode);
    }
}



function replaceChild(parentDom, lastVNode, nextVNode) {
    var lastDom = lastVNode.dom;
    var nextDom = nextVNode.dom;
    var parentNode = lastDom.parentNode;
    // maybe the lastDom has be moved
    if (!parentDom || parentNode !== parentDom) parentDom = parentNode;
    if (lastDom._unmount) {
        lastDom._unmount(lastVNode, parentDom);
        if (!nextDom.parentNode) {
            parentDom.appendChild(nextDom);
        }
    } else {
        parentDom.replaceChild(nextDom, lastDom);
    }
}

function removeChild(parentDom, vNode) {
    var dom = vNode.dom;
    if (dom._unmount) {
        dom._unmount(vNode, parentDom);
    } else {
        parentDom.removeChild(dom);
    }
}

function appendChild(parentDom, dom) {
    // in IE8, when a element has appendChild,
    // then its parentNode will be HTMLDocument object,
    // so check the tagName for this case
    if (!dom.parentNode || !dom.parentNode.tagName) {
        parentDom.appendChild(dom);
    }
}

function createRef(dom, ref, mountedQueue) {
    if (typeof ref === 'function') {
        // mountedQueue.push(() => ref(dom));
        // set ref immediately, because we have unset it before
        ref(dom);
    } else {
        throw new Error('ref must be a function, but got "' + JSON.stringify(ref) + '"');
    }
}

function documentCreateElement(tag, isSVG) {
    if (isSVG === true) {
        return doc.createElementNS(svgNS, tag);
    } else {
        return doc.createElement(tag);
    }
}

function patch(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG) {
    var isTrigger = true;
    if (mountedQueue) {
        isTrigger = false;
    } else {
        mountedQueue = new MountedQueue();
    }
    var dom = patchVNode(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
    if (isTrigger) {
        mountedQueue.trigger();
    }
    return dom;
}

function patchVNode(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG) {
    if (lastVNode !== nextVNode) {
        var nextType = nextVNode.type;
        var lastType = lastVNode.type;

        if (nextType & Types$1.Element) {
            if (lastType & Types$1.Element) {
                patchElement(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
            } else {
                replaceElement(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
            }
        } else if (nextType & Types$1.TextElement) {
            if (lastType === nextType) {
                patchText(lastVNode, nextVNode);
            } else {
                replaceElement(lastVNode, nextVNode, parentDom, mountedQueue, isSVG);
            }
        } else if (nextType & Types$1.ComponentClass) {
            if (lastType & Types$1.ComponentClass) {
                patchComponentClass(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
            } else {
                replaceElement(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
            }
            // } else if (nextType & Types.ComponentFunction) {
            // if (lastType & Types.ComponentFunction) {
            // patchComponentFunction(lastVNode, nextVNode, parentDom, mountedQueue);
            // } else {
            // replaceElement(lastVNode, nextVNode, parentDom, mountedQueue);
            // }
        } else if (nextType & Types$1.ComponentInstance) {
            if (lastType & Types$1.ComponentInstance) {
                patchComponentIntance(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
            } else {
                replaceElement(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
            }
        }
    }
    return nextVNode.dom;
}

function patchElement(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG) {
    var dom = lastVNode.dom;
    var lastProps = lastVNode.props;
    var nextProps = nextVNode.props;
    var lastChildren = lastVNode.children;
    var nextChildren = nextVNode.children;
    var lastClassName = lastVNode.className;
    var nextClassName = nextVNode.className;
    var nextType = nextVNode.type;

    nextVNode.dom = dom;
    nextVNode.parentVNode = parentVNode;

    isSVG = isSVG || (nextType & Types$1.SvgElement) > 0;

    if (lastVNode.tag !== nextVNode.tag || lastVNode.key !== nextVNode.key) {
        replaceElement(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
    } else {
        if (lastChildren !== nextChildren) {
            patchChildren(lastChildren, nextChildren, dom, mountedQueue, nextVNode, isSVG === true && nextVNode.tag !== 'foreignObject');
        }

        if (lastProps !== nextProps) {
            patchProps(lastVNode, nextVNode, isSVG);
        }

        if (lastClassName !== nextClassName) {
            if (isNullOrUndefined(nextClassName)) {
                dom.removeAttribute('class');
            } else {
                if (isSVG) {
                    dom.setAttribute('class', nextClassName);
                } else {
                    dom.className = nextClassName;
                }
            }
        }

        var lastRef = lastVNode.ref;
        var nextRef = nextVNode.ref;
        if (lastRef !== nextRef) {
            if (!isNullOrUndefined(lastRef)) {
                lastRef(null);
            }
            if (!isNullOrUndefined(nextRef)) {
                createRef(dom, nextRef, mountedQueue);
            }
        }
    }
}

function patchComponentClass(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG) {
    var lastTag = lastVNode.tag;
    var nextTag = nextVNode.tag;
    var dom = lastVNode.dom;

    var instance = void 0;
    var newDom = void 0;

    if (lastTag !== nextTag || lastVNode.key !== nextVNode.key) {
        // we should call this remove function in component's init method
        // because it should be destroyed until async component has rendered
        // removeComponentClassOrInstance(lastVNode, null, nextVNode);
        newDom = createComponentClassOrInstance(nextVNode, parentDom, mountedQueue, lastVNode, false, parentVNode, isSVG);
    } else {
        instance = lastVNode.children;
        instance.mountedQueue = mountedQueue;
        instance.isRender = false;
        instance.parentVNode = parentVNode;
        instance.vNode = nextVNode;
        instance.isSVG = isSVG;
        newDom = instance.update(lastVNode, nextVNode);
        nextVNode.dom = newDom;
        nextVNode.children = instance;
        nextVNode.parentVNode = parentVNode;

        // for intact.js, the dom will not be removed and
        // the component will not be destoryed, so the ref
        // function need be called in update method.
        var lastRef = lastVNode.ref;
        var nextRef = nextVNode.ref;
        if (lastRef !== nextRef) {
            if (!isNullOrUndefined(lastRef)) {
                lastRef(null);
            }
            if (!isNullOrUndefined(nextRef)) {
                nextRef(instance);
            }
        }
    }

    // perhaps the dom has be replaced
    if (dom !== newDom && dom.parentNode &&
    // when dom has be replaced, its parentNode maybe be fragment in IE8
    dom.parentNode.nodeName !== '#document-fragment') {
        replaceChild(parentDom, lastVNode, nextVNode);
    }
}

function patchComponentIntance(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG) {
    var lastInstance = lastVNode.children;
    var nextInstance = nextVNode.children;
    var dom = lastVNode.dom;

    var newDom = void 0;

    if (lastInstance !== nextInstance) {
        // removeComponentClassOrInstance(lastVNode, null, nextVNode);
        newDom = createComponentClassOrInstance(nextVNode, parentDom, mountedQueue, lastVNode, false, parentVNode, isSVG);
    } else {
        lastInstance.mountedQueue = mountedQueue;
        lastInstance.isRender = false;
        lastInstance.parentVNode = parentVNode;
        newDom = lastInstance.update(lastVNode, nextVNode);
        nextVNode.dom = newDom;
        nextVNode.parentVNode = parentVNode;

        var ref = nextVNode.ref;
        if (typeof ref === 'function') {
            ref(instance);
        }
    }

    if (dom !== newDom && dom.parentNode &&
    // when dom has be replaced, its parentNode maybe be fragment in IE8
    dom.parentNode.nodeName !== '#document-fragment') {
        replaceChild(parentDom, lastVNode, nextVNode);
    }
}

// function patchComponentFunction(lastVNode, nextVNode, parentDom, mountedQueue) {
// const lastTag = lastVNode.tag;
// const nextTag = nextVNode.tag;

// if (lastVNode.key !== nextVNode.key) {
// removeElements(lastVNode.children, parentDom);
// createComponentFunction(nextVNode, parentDom, mountedQueue);
// } else {
// nextVNode.dom = lastVNode.dom;
// createComponentFunctionVNode(nextVNode);
// patchChildren(lastVNode.children, nextVNode.children, parentDom, mountedQueue);
// }
// }

function patchChildren(lastChildren, nextChildren, parentDom, mountedQueue, parentVNode, isSVG) {
    if (isNullOrUndefined(lastChildren)) {
        if (!isNullOrUndefined(nextChildren)) {
            createElements(nextChildren, parentDom, mountedQueue, false, parentVNode, isSVG);
        }
    } else if (isNullOrUndefined(nextChildren)) {
        if (isStringOrNumber(lastChildren)) {
            setTextContent(parentDom, '');
        } else {
            removeElements(lastChildren, parentDom);
        }
    } else if (isStringOrNumber(nextChildren)) {
        if (isStringOrNumber(lastChildren)) {
            setTextContent(parentDom, nextChildren);
        } else {
            removeElements(lastChildren, parentDom);
            setTextContent(parentDom, nextChildren);
        }
    } else if (isArray(lastChildren)) {
        if (isArray(nextChildren)) {
            patchChildrenByKey(lastChildren, nextChildren, parentDom, mountedQueue, parentVNode, isSVG);
        } else {
            removeElements(lastChildren, parentDom);
            createElement(nextChildren, parentDom, mountedQueue, false, parentVNode, isSVG);
        }
    } else if (isArray(nextChildren)) {
        if (isStringOrNumber(lastChildren)) {
            setTextContent(parentDom, '');
        } else {
            removeElement(lastChildren, parentDom);
        }
        createElements(nextChildren, parentDom, mountedQueue, false, parentVNode, isSVG);
    } else if (isStringOrNumber(lastChildren)) {
        setTextContent(parentDom, '');
        createElement(nextChildren, parentDom, mountedQueue, false, parentVNode, isSVG);
    } else {
        patchVNode(lastChildren, nextChildren, parentDom, mountedQueue, parentVNode, isSVG);
    }
}

function patchChildrenByKey(a, b, dom, mountedQueue, parentVNode, isSVG) {
    var aLength = a.length;
    var bLength = b.length;
    var aEnd = aLength - 1;
    var bEnd = bLength - 1;
    var aStart = 0;
    var bStart = 0;
    var i = void 0;
    var j = void 0;
    var aNode = void 0;
    var bNode = void 0;
    var nextNode = void 0;
    var nextPos = void 0;
    var node = void 0;
    var aStartNode = a[aStart];
    var bStartNode = b[bStart];
    var aEndNode = a[aEnd];
    var bEndNode = b[bEnd];

    outer: while (true) {
        while (aStartNode.key === bStartNode.key) {
            patchVNode(aStartNode, bStartNode, dom, mountedQueue, parentVNode, isSVG);
            ++aStart;
            ++bStart;
            if (aStart > aEnd || bStart > bEnd) {
                break outer;
            }
            aStartNode = a[aStart];
            bStartNode = b[bStart];
        }
        while (aEndNode.key === bEndNode.key) {
            patchVNode(aEndNode, bEndNode, dom, mountedQueue, parentVNode, isSVG);
            --aEnd;
            --bEnd;
            if (aEnd < aStart || bEnd < bStart) {
                break outer;
            }
            aEndNode = a[aEnd];
            bEndNode = b[bEnd];
        }

        if (aEndNode.key === bStartNode.key) {
            patchVNode(aEndNode, bStartNode, dom, mountedQueue, parentVNode, isSVG);
            dom.insertBefore(bStartNode.dom, aStartNode.dom);
            --aEnd;
            ++bStart;
            aEndNode = a[aEnd];
            bStartNode = b[bStart];
            continue;
        }

        if (aStartNode.key === bEndNode.key) {
            patchVNode(aStartNode, bEndNode, dom, mountedQueue, parentVNode, isSVG);
            insertOrAppend(bEnd, bLength, bEndNode.dom, b, dom);
            ++aStart;
            --bEnd;
            aStartNode = a[aStart];
            bEndNode = b[bEnd];
            continue;
        }
        break;
    }

    if (aStart > aEnd) {
        while (bStart <= bEnd) {
            insertOrAppend(bEnd, bLength, createElement(b[bStart], null, mountedQueue, false, parentVNode, isSVG), b, dom, true /* detectParent: for animate, if the parentNode exists, then do nothing*/
            );
            ++bStart;
        }
    } else if (bStart > bEnd) {
        while (aStart <= aEnd) {
            removeElement(a[aStart], dom);
            ++aStart;
        }
    } else {
        aLength = aEnd - aStart + 1;
        bLength = bEnd - bStart + 1;
        var sources = new Array(bLength);
        for (i = 0; i < bLength; i++) {
            sources[i] = -1;
        }
        var moved = false;
        var pos = 0;
        var patched = 0;

        if (bLength <= 4 || aLength * bLength <= 16) {
            for (i = aStart; i <= aEnd; i++) {
                aNode = a[i];
                if (patched < bLength) {
                    for (j = bStart; j <= bEnd; j++) {
                        bNode = b[j];
                        if (aNode.key === bNode.key) {
                            sources[j - bStart] = i;
                            if (pos > j) {
                                moved = true;
                            } else {
                                pos = j;
                            }
                            patchVNode(aNode, bNode, dom, mountedQueue, parentVNode, isSVG);
                            ++patched;
                            a[i] = null;
                            break;
                        }
                    }
                }
            }
        } else {
            var keyIndex = {};
            for (i = bStart; i <= bEnd; i++) {
                keyIndex[b[i].key] = i;
            }
            for (i = aStart; i <= aEnd; i++) {
                aNode = a[i];
                if (patched < bLength) {
                    j = keyIndex[aNode.key];
                    if (j !== undefined) {
                        bNode = b[j];
                        sources[j - bStart] = i;
                        if (pos > j) {
                            moved = true;
                        } else {
                            pos = j;
                        }
                        patchVNode(aNode, bNode, dom, mountedQueue, parentVNode, isSVG);
                        ++patched;
                        a[i] = null;
                    }
                }
            }
        }
        if (aLength === a.length && patched === 0) {
            // removeAllChildren(dom, a);
            // children maybe have animation
            removeElements(a, dom);
            while (bStart < bLength) {
                createElement(b[bStart], dom, mountedQueue, false, parentVNode, isSVG);
                ++bStart;
            }
        } else {
            // some browsers, e.g. ie, must insert before remove for some element,
            // e.g. select/option, otherwise the selected property will be weird
            if (moved) {
                var seq = lisAlgorithm(sources);
                j = seq.length - 1;
                for (i = bLength - 1; i >= 0; i--) {
                    if (sources[i] === -1) {
                        pos = i + bStart;
                        insertOrAppend(pos, b.length, createElement(b[pos], null, mountedQueue, false, parentVNode, isSVG), b, dom);
                    } else {
                        if (j < 0 || i !== seq[j]) {
                            pos = i + bStart;
                            insertOrAppend(pos, b.length, b[pos].dom, b, dom);
                        } else {
                            --j;
                        }
                    }
                }
            } else if (patched !== bLength) {
                for (i = bLength - 1; i >= 0; i--) {
                    if (sources[i] === -1) {
                        pos = i + bStart;
                        insertOrAppend(pos, b.length, createElement(b[pos], null, mountedQueue, false, parentVNode, isSVG), b, dom, true);
                    }
                }
            }
            i = aLength - patched;
            while (i > 0) {
                aNode = a[aStart++];
                if (aNode !== null) {
                    removeElement(aNode, dom);
                    --i;
                }
            }
        }
    }
}

function lisAlgorithm(arr) {
    var p = arr.slice(0);
    var result = [0];
    var i = void 0;
    var j = void 0;
    var u = void 0;
    var v = void 0;
    var c = void 0;
    var len = arr.length;
    for (i = 0; i < len; i++) {
        var arrI = arr[i];
        if (arrI === -1) {
            continue;
        }
        j = result[result.length - 1];
        if (arr[j] < arrI) {
            p[i] = j;
            result.push(i);
            continue;
        }
        u = 0;
        v = result.length - 1;
        while (u < v) {
            c = (u + v) / 2 | 0;
            if (arr[result[c]] < arrI) {
                u = c + 1;
            } else {
                v = c;
            }
        }
        if (arrI < arr[result[u]]) {
            if (u > 0) {
                p[i] = result[u - 1];
            }
            result[u] = i;
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}

function insertOrAppend(pos, length, newDom, nodes, dom, detectParent) {
    var nextPos = pos + 1;
    // if (detectParent && newDom.parentNode) {
    // return;
    // } else
    if (nextPos < length) {
        dom.insertBefore(newDom, nodes[nextPos].dom);
    } else {
        dom.appendChild(newDom);
        // appendChild(dom, newDom);
    }
}

function replaceElement(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG) {
    removeElement(lastVNode, null, nextVNode);
    createElement(nextVNode, null, mountedQueue, false, parentVNode, isSVG);
    replaceChild(parentDom, lastVNode, nextVNode);
}

function patchText(lastVNode, nextVNode, parentDom) {
    var nextText = nextVNode.children;
    var dom = lastVNode.dom;
    nextVNode.dom = dom;
    if (lastVNode.children !== nextText) {
        dom.nodeValue = nextText;
    }
}

function patchProps(lastVNode, nextVNode, isSVG) {
    var lastProps = lastVNode.props;
    var nextProps = nextVNode.props;
    var dom = nextVNode.dom;
    var prop = void 0;
    if (nextProps !== EMPTY_OBJ) {
        var isFormElement = (nextVNode.type & Types$1.FormElement) > 0;
        for (prop in nextProps) {
            patchProp(prop, lastProps[prop], nextProps[prop], dom, isFormElement, isSVG);
        }
        if (isFormElement) {
            processForm(nextVNode, dom, nextProps, false);
        }
    }
    if (lastProps !== EMPTY_OBJ) {
        for (prop in lastProps) {
            if (!isSkipProp(prop) && isNullOrUndefined(nextProps[prop]) && !isNullOrUndefined(lastProps[prop])) {
                removeProp(prop, lastProps[prop], dom);
            }
        }
    }
}

function patchProp(prop, lastValue, nextValue, dom, isFormElement, isSVG) {
    if (lastValue !== nextValue) {
        if (isSkipProp(prop) || isFormElement && prop === 'value') {
            return;
        } else if (booleanProps[prop]) {
            dom[prop] = !!nextValue;
        } else if (strictProps[prop]) {
            var value = isNullOrUndefined(nextValue) ? '' : nextValue;
            // IE8 the value of option is equal to its text as default
            // so set it forcely
            if (dom[prop] !== value || browser.isIE8) {
                dom[prop] = value;
            }
            // add a private property _value for selecting an non-string value 
            if (prop === 'value') {
                dom._value = value;
            }
        } else if (isNullOrUndefined(nextValue)) {
            removeProp(prop, lastValue, dom);
        } else if (isEventProp(prop)) {
            handleEvent(prop.substr(3), lastValue, nextValue, dom);
        } else if (isObject$1(nextValue)) {
            patchPropByObject(prop, lastValue, nextValue, dom);
        } else if (prop === 'innerHTML') {
            dom.innerHTML = nextValue;
        } else {
            if (isSVG && namespaces[prop]) {
                dom.setAttributeNS(namespaces[prop], prop, nextValue);
            } else {
                dom.setAttribute(prop, nextValue);
            }
        }
    }
}

function removeProp(prop, lastValue, dom) {
    if (!isNullOrUndefined(lastValue)) {
        switch (prop) {
            case 'value':
                dom.value = '';
                return;
            case 'style':
                dom.removeAttribute('style');
                return;
            case 'attributes':
                for (var key in lastValue) {
                    dom.removeAttribute(key);
                }
                return;
            case 'dataset':
                removeDataset(lastValue, dom);
                return;
            case 'innerHTML':
                dom.innerHTML = '';
                return;
            default:
                break;
        }

        if (booleanProps[prop]) {
            dom[prop] = false;
        } else if (isEventProp(prop)) {
            handleEvent(prop.substr(3), lastValue, null, dom);
        } else if (isObject$1(lastValue)) {
            var domProp = dom[prop];
            try {
                dom[prop] = undefined;
                delete dom[prop];
            } catch (e) {
                for (var _key in lastValue) {
                    delete domProp[_key];
                }
            }
        } else {
            dom.removeAttribute(prop);
        }
    }
}

var removeDataset = browser.isIE || browser.isSafari ? function (lastValue, dom) {
    for (var key in lastValue) {
        dom.removeAttribute('data-' + kebabCase(key));
    }
} : function (lastValue, dom) {
    var domProp = dom.dataset;
    for (var key in lastValue) {
        delete domProp[key];
    }
};

function patchPropByObject(prop, lastValue, nextValue, dom) {
    if (lastValue && !isObject$1(lastValue) && !isNullOrUndefined(lastValue)) {
        removeProp(prop, lastValue, dom);
        lastValue = null;
    }
    switch (prop) {
        case 'attributes':
            return patchAttributes(lastValue, nextValue, dom);
        case 'style':
            return patchStyle(lastValue, nextValue, dom);
        case 'dataset':
            return patchDataset(prop, lastValue, nextValue, dom);
        default:
            return patchObject(prop, lastValue, nextValue, dom);
    }
}

var patchDataset = browser.isIE ? function patchDataset(prop, lastValue, nextValue, dom) {
    var hasRemoved = {};
    var key = void 0;
    var value = void 0;

    for (key in nextValue) {
        var dataKey = 'data-' + kebabCase(key);
        value = nextValue[key];
        if (isNullOrUndefined(value)) {
            dom.removeAttribute(dataKey);
            hasRemoved[key] = true;
        } else {
            dom.setAttribute(dataKey, value);
        }
    }

    if (!isNullOrUndefined(lastValue)) {
        for (key in lastValue) {
            if (isNullOrUndefined(nextValue[key]) && !hasRemoved[key]) {
                dom.removeAttribute('data-' + kebabCase(key));
            }
        }
    }
} : patchObject;

var _cache = {};
var uppercasePattern = /[A-Z]/g;
function kebabCase(word) {
    if (!_cache[word]) {
        _cache[word] = word.replace(uppercasePattern, function (item) {
            return '-' + item.toLowerCase();
        });
    }
    return _cache[word];
}

function patchObject(prop, lastValue, nextValue, dom) {
    var domProps = dom[prop];
    if (isNullOrUndefined(domProps)) {
        domProps = dom[prop] = {};
    }
    var key = void 0;
    var value = void 0;
    for (key in nextValue) {
        domProps[key] = nextValue[key];
    }
    if (!isNullOrUndefined(lastValue)) {
        for (key in lastValue) {
            if (isNullOrUndefined(nextValue[key])) {
                delete domProps[key];
            }
        }
    }
}

function patchAttributes(lastValue, nextValue, dom) {
    var hasRemoved = {};
    var key = void 0;
    var value = void 0;
    for (key in nextValue) {
        value = nextValue[key];
        if (isNullOrUndefined(value)) {
            dom.removeAttribute(key);
            hasRemoved[key] = true;
        } else {
            dom.setAttribute(key, value);
        }
    }
    if (!isNullOrUndefined(lastValue)) {
        for (key in lastValue) {
            if (isNullOrUndefined(nextValue[key]) && !hasRemoved[key]) {
                dom.removeAttribute(key);
            }
        }
    }
}

function patchStyle(lastValue, nextValue, dom) {
    var domStyle = dom.style;
    var hasRemoved = {};
    var key = void 0;
    var value = void 0;
    for (key in nextValue) {
        value = nextValue[key];
        if (isNullOrUndefined(value)) {
            domStyle[key] = '';
            hasRemoved[key] = true;
        } else {
            domStyle[key] = value;
        }
    }
    if (!isNullOrUndefined(lastValue)) {
        for (key in lastValue) {
            if (isNullOrUndefined(nextValue[key]) && !hasRemoved[key]) {
                domStyle[key] = '';
            }
        }
    }
}

function toString$3(vNode, parent, disableSplitText, firstChild) {
    var type = vNode.type;
    var tag = vNode.tag;
    var props = vNode.props;
    var children = vNode.children;

    var html = void 0;
    if (type & Types$1.ComponentClass) {
        var instance = new tag(props);
        html = instance.toString();
    } else if (type & Types$1.ComponentInstance) {
        html = vNode.children.toString();
    } else if (type & Types$1.Element) {
        var innerHTML = void 0;
        html = '<' + tag;

        if (!isNullOrUndefined(vNode.className)) {
            html += ' class="' + escapeText(vNode.className) + '"';
        }

        if (props !== EMPTY_OBJ) {
            for (var prop in props) {
                var value = props[prop];

                if (prop === 'innerHTML') {
                    innerHTML = value;
                } else if (prop === 'style') {
                    html += ' style="' + renderStylesToString(value) + '"';
                } else if (prop === 'children' || prop === 'className' || prop === 'key' || prop === 'ref') {
                    // ignore
                } else if (prop === 'defaultValue') {
                    if (isNullOrUndefined(props.value) && !isNullOrUndefined(value)) {
                        html += ' value="' + (isString$1(value) ? escapeText(value) : value) + '"';
                    }
                } else if (prop === 'defaultChecked') {
                    if (isNullOrUndefined(props.checked) && value === true) {
                        html += ' checked';
                    }
                } else if (prop === 'attributes') {
                    html += renderAttributesToString(value);
                } else if (prop === 'dataset') {
                    html += renderDatasetToString(value);
                } else if (tag === 'option' && prop === 'value') {
                    html += renderAttributeToString(prop, value);
                    if (parent && value === parent.props.value) {
                        html += ' selected';
                    }
                } else {
                    html += renderAttributeToString(prop, value);
                }
            }
        }

        if (selfClosingTags[tag]) {
            html += ' />';
        } else {
            html += '>';
            if (innerHTML) {
                html += innerHTML;
            } else if (!isNullOrUndefined(children)) {
                if (isString$1(children)) {
                    html += children === '' ? ' ' : escapeText(children);
                } else if (isNumber(children)) {
                    html += children;
                } else if (isArray(children)) {
                    var index = -1;
                    for (var i = 0; i < children.length; i++) {
                        var child = children[i];
                        if (isString$1(child)) {
                            html += child === '' ? ' ' : escapeText(child);
                        } else if (isNumber(child)) {
                            html += child;
                        } else if (!isNullOrUndefined(child)) {
                            if (!(child.type & Types$1.Text)) {
                                index = -1;
                            } else {
                                index++;
                            }
                            html += toString$3(child, vNode, disableSplitText, index === 0);
                        }
                    }
                } else {
                    html += toString$3(children, vNode, disableSplitText, true);
                }
            }

            html += '</' + tag + '>';
        }
    } else if (type & Types$1.Text) {
        html = (firstChild || disableSplitText ? '' : '<!---->') + (children === '' ? ' ' : escapeText(children));
    } else if (type & Types$1.HtmlComment) {
        html = '<!--' + children + '-->';
    } else if (type & Types$1.UnescapeText) {
        html = isNullOrUndefined(children) ? '' : children;
    } else {
        throw new Error('Unknown vNode: ' + vNode);
    }

    return html;
}

function escapeText(text) {
    var result = text;
    var escapeString = "";
    var start = 0;
    var i = void 0;
    for (i = 0; i < text.length; i++) {
        switch (text.charCodeAt(i)) {
            case 34:
                // "
                escapeString = "&quot;";
                break;
            case 39:
                // \
                escapeString = "&#039;";
                break;
            case 38:
                // &
                escapeString = "&amp;";
                break;
            case 60:
                // <
                escapeString = "&lt;";
                break;
            case 62:
                // >
                escapeString = "&gt;";
                break;
            default:
                continue;
        }
        if (start) {
            result += text.slice(start, i);
        } else {
            result = text.slice(start, i);
        }
        result += escapeString;
        start = i + 1;
    }
    if (start && i !== start) {
        return result + text.slice(start, i);
    }
    return result;
}

function isString$1(o) {
    return typeof o === 'string';
}

function isNumber(o) {
    return typeof o === 'number';
}

function renderStylesToString(styles) {
    if (isStringOrNumber(styles)) {
        return styles;
    } else {
        var renderedString = "";
        for (var styleName in styles) {
            var value = styles[styleName];

            if (isStringOrNumber(value)) {
                renderedString += kebabCase(styleName) + ':' + value + ';';
            }
        }
        return renderedString;
    }
}

function renderDatasetToString(dataset) {
    var renderedString = '';
    for (var key in dataset) {
        var dataKey = 'data-' + kebabCase(key);
        var value = dataset[key];
        if (isString$1(value)) {
            renderedString += ' ' + dataKey + '="' + escapeText(value) + '"';
        } else if (isNumber(value)) {
            renderedString += ' ' + dataKey + '="' + value + '"';
        } else if (value === true) {
            renderedString += ' ' + dataKey + '="true"';
        }
    }
    return renderedString;
}

function renderAttributesToString(attributes) {
    var renderedString = '';
    for (var key in attributes) {
        renderedString += renderAttributeToString(key, attributes[key]);
    }
    return renderedString;
}

function renderAttributeToString(key, value) {
    if (isString$1(value)) {
        return ' ' + key + '="' + escapeText(value) + '"';
    } else if (isNumber(value)) {
        return ' ' + key + '="' + value + '"';
    } else if (value === true) {
        return ' ' + key;
    } else {
        return '';
    }
}

function hydrateRoot(vNode, parentDom, mountedQueue) {
    if (!isNullOrUndefined(parentDom)) {
        var dom = parentDom.firstChild;
        if (isNullOrUndefined(dom)) {
            return render(vNode, parentDom, mountedQueue, null, false);
        }
        var newDom = hydrate(vNode, dom, mountedQueue, parentDom, null, false);
        dom = dom.nextSibling;
        // should only one entry
        while (dom) {
            var next = dom.nextSibling;
            parentDom.removeChild(dom);
            dom = next;
        }
        return newDom;
    }
    return null;
}

function hydrate(vNode, dom, mountedQueue, parentDom, parentVNode, isSVG) {
    if (dom !== null) {
        var isTrigger = true;
        if (mountedQueue) {
            isTrigger = false;
        } else {
            mountedQueue = new MountedQueue();
        }
        dom = hydrateElement(vNode, dom, mountedQueue, parentDom, parentVNode, isSVG);
        if (isTrigger) {
            mountedQueue.trigger();
        }
    }
    return dom;
}

function hydrateElement(vNode, dom, mountedQueue, parentDom, parentVNode, isSVG) {
    var type = vNode.type;

    if (type & Types$1.Element) {
        return hydrateHtmlElement(vNode, dom, mountedQueue, parentDom, parentVNode, isSVG);
    } else if (type & Types$1.Text) {
        return hydrateText(vNode, dom);
    } else if (type & Types$1.HtmlComment) {
        return hydrateComment(vNode, dom);
    } else if (type & Types$1.ComponentClassOrInstance) {
        return hydrateComponentClassOrInstance(vNode, dom, mountedQueue, parentDom, parentVNode, isSVG);
    }
}

function hydrateComponentClassOrInstance(vNode, dom, mountedQueue, parentDom, parentVNode, isSVG) {
    var props = vNode.props;
    var instance = vNode.type & Types$1.ComponentClass ? new vNode.tag(props) : vNode.children;
    instance.parentDom = parentDom;
    instance.mountedQueue = mountedQueue;
    instance.isRender = true;
    instance.parentVNode = parentVNode;
    instance.isSVG = isSVG;
    instance.vNode = vNode;
    var newDom = instance.hydrate(vNode, dom);

    vNode.dom = newDom;
    vNode.children = instance;
    vNode.parentVNode = parentVNode;

    if (typeof instance.mount === 'function') {
        mountedQueue.push(function () {
            return instance.mount(null, vNode);
        });
    }

    var ref = vNode.ref;
    if (typeof ref === 'function') {
        ref(instance);
    }

    if (dom !== newDom && dom.parentNode) {
        dom.parentNode.replaceChild(newDom, dom);
    }

    return dom;
}

function hydrateComment(vNode, dom) {
    if (dom.nodeType !== 8) {
        var newDom = createCommentElement(vNode, null);
        dom.parentNode.replaceChild(newDom, dom);
        return newDom;
    }
    var comment = vNode.children;
    if (dom.data !== comment) {
        dom.data = comment;
    }
    vNode.dom = dom;
    return dom;
}

function hydrateText(vNode, dom) {
    if (dom.nodeType !== 3) {
        var newDom = createTextElement(vNode, null);
        dom.parentNode.replaceChild(newDom, dom);

        return newDom;
    }

    var text = vNode.children;
    if (dom.nodeValue !== text) {
        dom.nodeValue = text;
    }
    vNode.dom = dom;

    return dom;
}

function hydrateHtmlElement(vNode, dom, mountedQueue, parentDom, parentVNode, isSVG) {
    var children = vNode.children;
    var props = vNode.props;
    var className = vNode.className;
    var type = vNode.type;
    var ref = vNode.ref;

    vNode.parentVNode = parentVNode;
    isSVG = isSVG || (type & Types$1.SvgElement) > 0;

    if (dom.nodeType !== 1 || dom.tagName.toLowerCase() !== vNode.tag) {
        warning('Server-side markup doesn\'t match client-side markup');
        var newDom = createElement(vNode, null, mountedQueue, parentDom, parentVNode, isSVG);
        dom.parentNode.replaceChild(newDom, dom);

        return newDom;
    }

    vNode.dom = dom;
    if (!isNullOrUndefined(children)) {
        hydrateChildren(children, dom, mountedQueue, vNode, isSVG);
    } else if (dom.firstChild !== null) {
        setTextContent(dom, '');
    }

    if (props !== EMPTY_OBJ) {
        var isFormElement = (type & Types$1.FormElement) > 0;
        for (var prop in props) {
            patchProp(prop, null, props[prop], dom, isFormElement, isSVG);
        }
        if (isFormElement) {
            processForm(vNode, dom, props, true);
        }
    }

    if (!isNullOrUndefined(className)) {
        if (isSVG) {
            dom.setAttribute('class', className);
        } else {
            dom.className = className;
        }
    } else if (dom.className !== '') {
        dom.removeAttribute('class');
    }

    if (ref) {
        createRef(dom, ref, mountedQueue);
    }

    return dom;
}

function hydrateChildren(children, parentDom, mountedQueue, parentVNode, isSVG) {
    normalizeChildren$1(parentDom);
    var dom = parentDom.firstChild;

    if (isStringOrNumber(children)) {
        if (dom !== null && dom.nodeType === 3) {
            if (dom.nodeValue !== children) {
                dom.nodeValue = children;
            }
        } else if (children === '') {
            parentDom.appendChild(document.createTextNode(''));
        } else {
            setTextContent(parentDom, children);
        }
        if (dom !== null) {
            dom = dom.nextSibling;
        }
    } else if (isArray(children)) {
        for (var i = 0; i < children.length; i++) {
            var child = children[i];

            if (!isNullOrUndefined(child)) {
                if (dom !== null) {
                    var nextSibling = dom.nextSibling;
                    hydrateElement(child, dom, mountedQueue, parentDom, parentVNode, isSVG);
                    dom = nextSibling;
                } else {
                    createElement(child, parentDom, mountedQueue, true, parentVNode, isSVG);
                }
            }
        }
    } else {
        if (dom !== null) {
            hydrateElement(children, dom, mountedQueue, parentDom, parentVNode, isSVG);
            dom = dom.nextSibling;
        } else {
            createElement(children, parentDom, mountedQueue, true, parentVNode, isSVG);
        }
    }

    // clear any other DOM nodes, there should be on a single entry for the root
    while (dom) {
        var _nextSibling = dom.nextSibling;
        parentDom.removeChild(dom);
        dom = _nextSibling;
    }
}

function normalizeChildren$1(parentDom) {
    var dom = parentDom.firstChild;

    while (dom) {
        if (dom.nodeType === 8 && dom.data === '') {
            var lastDom = dom.previousSibling;
            parentDom.removeChild(dom);
            dom = lastDom || parentDom.firstChild;
        } else {
            dom = dom.nextSibling;
        }
    }
}

var warning = (typeof console === 'undefined' ? 'undefined' : _typeof(console)) === 'object' ? function (message) {
    console.warn(message);
} : function () {};



var miss = (Object.freeze || Object)({
	h: createVNode,
	patch: patch,
	render: render,
	hc: createCommentVNode,
	hu: createUnescapeTextVNode,
	remove: removeElement,
	MountedQueue: MountedQueue,
	renderString: toString$3,
	hydrateRoot: hydrateRoot,
	hydrate: hydrate,
	Types: Types$1
});

var parser = new Parser();
var stringifier = new Stringifier();

function Vdt$1(source, options) {
    if (!(this instanceof Vdt$1)) return new Vdt$1(source, options);

    this.template = compile(source, options);
    this.data = null;
    this.vNode = null;
    this.node = null;
    this.widgets = {};
    this.blocks = {};
}
Vdt$1.prototype = {
    constructor: Vdt$1,

    render: function render$$1(data, parentDom, queue, parentVNode, isSVG, blocks) {
        this.renderVNode(data, blocks);
        this.node = render(this.vNode, parentDom, queue, parentVNode, isSVG);

        return this.node;
    },
    renderVNode: function renderVNode(data, blocks) {
        if (data !== undefined) {
            this.data = data;
        }
        // if (blocks !== undefined) {
        this.blocks = blocks;
        // }
        this.vNode = this.template(this.data, Vdt$1, this.blocks, this.template) || createCommentVNode('empty');

        return this.vNode;
    },
    renderString: function renderString$$1(data, blocks) {
        this.data = data;
        var vNode = this.template(data, Vdt$1, blocks, this.template) || createCommentVNode('empty');

        return toString$3(vNode, null, Vdt$1.configure().disableSplitText);
    },
    update: function update(data, parentDom, queue, parentVNode, isSVG, blocks) {
        var oldVNode = this.vNode;
        this.renderVNode(data, blocks);
        this.node = patch(oldVNode, this.vNode, parentDom, queue, parentVNode, isSVG);

        return this.node;
    },
    hydrate: function hydrate$$1(data, dom, queue, parentDom, parentVNode, isSVG, blocks) {
        this.renderVNode(data, blocks);
        hydrate(this.vNode, dom, queue, parentDom, parentVNode, isSVG);
        this.node = this.vNode.dom;

        return this.node;
    },
    destroy: function destroy() {
        removeElement(this.vNode);
    }
};

function compile(source, options) {
    var templateFn;

    // backward compatibility v0.2.2
    if (options === true || options === false) {
        options = { autoReturn: options };
    }

    options = extend({}, configure(), options);

    switch (typeof source === 'undefined' ? 'undefined' : _typeof(source)) {
        case 'string':
            var ast = parser.parse(source, options),
                hscript = stringifier.stringify(ast, options.autoReturn);

            hscript = ['_Vdt || (_Vdt = Vdt);', 'obj || (obj = {});', 'blocks || (blocks = {});', 'var h = _Vdt.miss.h, hc = _Vdt.miss.hc, hu = _Vdt.miss.hu, widgets = this && this.widgets || {}, _blocks = {}, __blocks = {},', '__u = _Vdt.utils, extend = __u.extend, _e = __u.error, _className = __u.className,', '__o = __u.Options, _getModel = __o.getModel, _setModel = __o.setModel,', '_setCheckboxModel = __u.setCheckboxModel, _detectCheckboxChecked = __u.detectCheckboxChecked,', '_setSelectModel = __u.setSelectModel,', (options.server ? 'require = function(file) { return _Vdt.require(file, "' + options.filename.replace(/\\/g, '\\\\') + '") }, ' : '') + 'self = this.data, $this = this, scope = obj, Animate = self && self.Animate, parent = ($callee || {})._super', options.noWith ? hscript : ['with (obj) {', hscript, '}'].join('\n')].join('\n');
            templateFn = options.onlySource ? function () {} : new Function('obj', '_Vdt', 'blocks', '$callee', hscript);
            templateFn.source = 'function(obj, _Vdt, blocks, $callee) {\n' + hscript + '\n}';
            templateFn.head = stringifier.head;
            break;
        case 'function':
            templateFn = source;
            break;
        default:
            throw new Error('Expect a string or function');
    }

    return templateFn;
}

Vdt$1.parser = parser;
Vdt$1.stringifier = stringifier;
Vdt$1.miss = miss;
Vdt$1.compile = compile;
Vdt$1.utils = utils$1;
Vdt$1.setDelimiters = setDelimiters;
Vdt$1.getDelimiters = getDelimiters;
Vdt$1.configure = configure;

// for compatibility v1.0
Vdt$1.virtualDom = miss;

var inBrowser = typeof window !== 'undefined';
var UA = inBrowser && window.navigator.userAgent.toLowerCase();
var isIOS = UA && /iphone|ipad|ipod|ios/.test(UA);

if (!(Object.setPrototypeOf || {}.__proto__)) {
    // ie <= 10 exists getPrototypeOf but not setPrototypeOf
    var nativeGetPrototypeOf = Object.getPrototypeOf;

    if (typeof nativeGetPrototypeOf !== 'function') {
        Object.getPrototypeOf = function (object) {
            // May break if the constructor has been tampered with
            return object.__proto__ || object.constructor.prototype;
        };
    } else {
        Object.getPrototypeOf = function (object) {
            // in ie <= 10 __proto__ is not supported
            // getPrototypeOf will return a native function
            // but babel will set __proto__ prototyp to target
            // so we get __proto__ in this case
            return object.__proto__ || nativeGetPrototypeOf.call(Object, object);
        };
    }

    // fix that if ie <= 10 babel can't inherit class static methods
    Object.setPrototypeOf = function (O, proto) {
        extend(O, proto);
        O.__proto__ = proto;
    };
}
var getPrototypeOf = Object.getPrototypeOf;
/**
 * inherit
 * @param Parent
 * @param prototype
 * @returns {Function}
 */
var isSupportGetDescriptor = function () {
    var a = {};
    try {
        Object.getOwnPropertyDescriptor(a, 'a');
    } catch (e) {
        return false;
    }
    return true;
}();
function setPrototype(Parent, Child, name, value) {
    var prototype = Child.prototype;
    var tmp = void 0;
    if (isSupportGetDescriptor && (tmp = Object.getOwnPropertyDescriptor(Parent.prototype, name)) && tmp.get) {
        Object.defineProperty(prototype, name, {
            get: function get$$1() {
                return value;
            },

            enumerable: true,
            configurable: true
        });
    } else {
        prototype[name] = value;
    }
}
function inherit(Parent, prototype) {
    var Child = function Child() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return Parent.apply(this, args);
    };

    Child.prototype = create(Parent.prototype);
    // for ie 8 which does not support getPrototypeOf
    Child.prototype.__proto__ = Parent.prototype;
    each(prototype, function (proto, name) {
        if (name === 'displayName') {
            Child.displayName = proto;
        }
        if (name === 'template') {
            if (isString(proto)) {
                proto = Vdt$1.compile(proto);
                prototype.template = proto;
            }
            var _super = Parent.template;
            if (!_super || _super === templateDecorator) {
                _super = Parent.prototype.template;
            }
            proto._super = _super;
            Child.template = undefined;
            return setPrototype(Parent, Child, 'template', proto);
        } else if (!isFunction(proto)) {
            Child.prototype[name] = proto;
            return;
        }
        var fn = function () {
            var _super = function _super() {
                for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                    args[_key2] = arguments[_key2];
                }

                return Parent.prototype[name].apply(this, args);
            },
                _superApply = function _superApply(args) {
                return Parent.prototype[name].apply(this, args);
            };
            return function () {
                var self = this || {},
                    __super = self._super,
                    __superApply = self._superApply,
                    returnValue = void 0;

                self._super = _super;
                self._superApply = _superApply;

                for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                    args[_key3] = arguments[_key3];
                }

                returnValue = proto.apply(this, args);

                self._super = __super;
                self._superApply = __superApply;

                return returnValue;
            };
        }();
        setPrototype(Parent, Child, name, fn);
    });
    Child.prototype.constructor = Child;

    for (var key in Parent) {
        if (!hasOwn.call(Child, key)) {
            Child[key] = Parent[key];
        }
    }

    Child.__super = Parent.prototype;

    return Child;
}

function templateDecorator(options) {
    return function (target, name, descriptor) {
        var template = target.template;
        if (isString(template)) {
            template = Vdt$1.compile(template, options);
        }
        var Parent = getPrototypeOf(target);
        var _super = void 0;
        if (typeof Parent === 'function') {
            // is define by static
            _super = Parent.template;
            if (!_super || _super === templateDecorator) {
                _super = Parent.prototype.template;
            }
        } else {
            // is define by prototype
            _super = Parent.constructor.template;
            if (!_super || _super === templateDecorator) {
                _super = Parent.template;
            }
        }
        template._super = _super;

        if (typeof target === 'function') {
            // for: static template = ''
            target.template = template;
            return template;
        } else {
            // for: get template() { }
            descriptor.get = function () {
                return template;
            };
            // remove static template. Maybe it inherited from parent
            target.constructor.template = undefined;
        }
    };
}

var nativeCreate = Object.create;
var create = nativeCreate ? nativeCreate : function (object) {
    var fn = function fn() {};
    fn.prototype = object;
    return new fn();
};

function isFunction(obj) {
    return typeof obj === 'function';
}

function isString(s) {
    return typeof s === 'string';
}

function result(obj, property, fallback) {
    var value = isNullOrUndefined$1(obj) ? undefined : obj[property];
    if (value === undefined) {
        value = fallback;
    }
    return isFunction(value) ? value.call(obj) : value;
}

var executeBound = function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = create(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (isObject$$1(result)) return result;
    return self;
};
var nativeBind = Function.prototype.bind;
function bind(func, context) {
    for (var _len4 = arguments.length, args = Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
        args[_key4 - 2] = arguments[_key4];
    }

    if (nativeBind && func.bind === nativeBind) {
        return nativeBind.call.apply(nativeBind, [func, context].concat(args));
    }
    if (!isFunction(func)) throw new TypeError('Bind must be called on a function');
    var bound = function bound() {
        for (var _len5 = arguments.length, args1 = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
            args1[_key5] = arguments[_key5];
        }

        return executeBound(func, bound, context, this, [].concat(args, args1));
    };
    return bound;
}

var toString = Object.prototype.toString;
// Internal recursive comparison function for `isEqual`.
var eq = function eq(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (isNullOrUndefined$1(a) || isNullOrUndefined$1(b)) return a === b;
    // Compare `[[Class]]` names.
    var className$$1 = toString.call(a);
    if (className$$1 !== toString.call(b)) return false;
    switch (className$$1) {
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

    var areArrays = className$$1 === '[object Array]';
    if (!areArrays) {
        if ((typeof a === 'undefined' ? 'undefined' : _typeof(a)) != 'object' || (typeof b === 'undefined' ? 'undefined' : _typeof(b)) != 'object') return false;

        // Objects with different constructors are not equivalent, but `Object`s or `Array`s
        // from different frames are.
        var aCtor = a.constructor,
            bCtor = b.constructor;
        if (aCtor !== bCtor && !(isFunction(aCtor) && aCtor instanceof aCtor && isFunction(bCtor) && bCtor instanceof bCtor) && 'constructor' in a && 'constructor' in b) {
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
        var aKeys = keys(a),
            key;
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

function isEqual(a, b) {
    return eq(a, b);
}

var idCounter = 0;
function uniqueId(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
}

var keys = Object.keys || function (obj) {
    var ret = [];
    each(obj, function (value, key) {
        return ret.push(key);
    });
    return ret;
};

function values(obj) {
    var ret = [];
    each(obj, function (value) {
        return ret.push(value);
    });
    return ret;
}

var pathMap = {};
var reLeadingDot = /^\./;
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
var reEscapeChar = /\\(\\)?/g;
var reIsUint = /^(?:0|[1-9]\d*)$/;
function castPath(path) {
    if (typeof path !== 'string') return path;
    if (pathMap[path]) return pathMap[path];

    var ret = [];
    if (reLeadingDot.test(path)) {
        result.push('');
    }
    path.replace(rePropName, function (match, number, quote, string) {
        ret.push(quote ? path.replace(reEscapeChar, '$1') : number || match);
    });
    pathMap[path] = ret;

    return ret;
}
function isIndex(value) {
    return (typeof value === 'number' || reIsUint.test(value)) && value > -1 && value % 1 === 0;
}
function get$$1(object, path, defaultValue) {
    if (hasOwn.call(object, path)) return object[path];
    path = castPath(path);

    var index = 0,
        length = path.length;

    while (!isNullOrUndefined$1(object) && index < length) {
        object = object[path[index++]];
    }

    return index && index === length && object !== undefined ? object : defaultValue;
}
function set$$1(object, path, value) {
    if (hasOwn.call(object, path)) {
        object[path] = value;
        return object;
    }

    path = castPath(path);

    var index = -1,
        length = path.length,
        lastIndex = length - 1,
        nested = object;
    while (!isNullOrUndefined$1(nested) && ++index < length) {
        var key = path[index],
            newValue = value;
        if (index !== lastIndex) {
            var objValue = nested[key];
            newValue = isObject$$1(objValue) ? objValue : isIndex(path[index + 1]) ? [] : {};
        }
        nested[key] = newValue;
        nested = nested[key];
    }

    return object;
}

// in ie8 console.log is an object
var hasConsole = typeof console !== 'undefined' && typeof console.log === 'function';
var warn = hasConsole ? function () {
    console.warn.apply(console, arguments);
} : noop;
var error$1 = hasConsole ? function () {
    console.error.apply(console, arguments);
} : noop;

function isNative(Ctor) {
    return typeof Ctor === 'function' && /native code/.test(Ctor.toString());
}
var nextTick = function () {
    if (typeof Promise !== 'undefined' && isNative(Promise)) {
        var p = Promise.resolve();
        return function (callback) {
            p.then(callback).catch(function (err) {
                return error$1(err);
            });
            // description in vue
            if (isIOS) setTimeout(noop);
        };
    } else if (typeof MutationObserver !== 'undefined' && (isNative(MutationObserver) ||
    // PhantomJS and iOS 7.x
    MutationObserver.toString() === '[object MutationObserverConstructor]')) {
        var callbacks = [];
        var nextTickHandler = function nextTickHandler() {
            var _callbacks = callbacks.slice(0);
            callbacks.length = 0;
            for (var _i = 0; _i < _callbacks.length; _i++) {
                _callbacks[_i]();
            }
        };
        var node = document.createTextNode('');
        new MutationObserver(nextTickHandler).observe(node, {
            characterData: true
        });
        var i = 1;
        return function (callback) {
            callbacks.push(callback);
            i = (i + 1) % 2;
            node.data = String(i);
        };
    } else {
        return function (callback) {
            setTimeout(callback, 0);
        };
    }
}();
function NextTick(eachCallback) {
    var _this = this;

    this.callback = null;
    this.eachCallback = eachCallback;
    nextTick(function () {
        return _this.callback();
    });
}
NextTick.prototype.fire = function (callback, data) {
    this.callback = callback;
    if (this.eachCallback) {
        this.eachCallback(data);
    }
};

var wontBind = ['constructor', 'template', 'defaults'];

var getOwnPropertyNames = typeof Object.getOwnPropertyNames !== 'function' ? keys : Object.getOwnPropertyNames;

function autobind(prototype, context, Intact, bound) {
    if (!prototype) return;
    if (prototype === Intact.prototype) return;

    var toBind = getOwnPropertyNames(prototype);
    each(toBind, function (method) {
        var fn = prototype[method];
        if (fn === undefined) {
            // warn(`Autobind: '${method}' method not found in class.`);
            return;
        }

        if (~indexOf$1(wontBind, method) || bound[method] || typeof fn !== 'function') {
            return;
        }

        context[method] = bind(fn, context);
        bound[method] = true;
    });

    // bind super method
    autobind(getPrototypeOf(prototype), context, Intact, bound);
}



var utils = (Object.freeze || Object)({
	extend: extend,
	isArray: isArray,
	each: each,
	isObject: isObject$$1,
	hasOwn: hasOwn,
	isNullOrUndefined: isNullOrUndefined$1,
	noop: noop,
	inBrowser: inBrowser,
	UA: UA,
	isIOS: isIOS,
	getPrototypeOf: getPrototypeOf,
	inherit: inherit,
	templateDecorator: templateDecorator,
	create: create,
	isFunction: isFunction,
	isString: isString,
	result: result,
	bind: bind,
	isEqual: isEqual,
	uniqueId: uniqueId,
	keys: keys,
	values: values,
	castPath: castPath,
	get: get$$1,
	set: set$$1,
	warn: warn,
	error: error$1,
	NextTick: NextTick,
	autobind: autobind
});

function Intact$2(props) {
    var template = this.constructor.template;
    // Intact.template is a decorator
    if (!template || template === templateDecorator) {
        template = this.template;
    }
    if (!template) {
        throw new Error('Can not instantiate when template does not exist.');
    }

    // for debug
    this.displayName = this.displayName;

    // autobind this for methods
    // in ie 8 we must get prototype through constructor first time
    autobind(this.constructor.prototype, this, Intact$2, {});

    for (var i = 0; i < Intact$2._constructors.length; i++) {
        Intact$2._constructors[i].call(this, props);
    }

    this.vdt = Vdt$1(template);

    // for string ref
    this.refs = this.vdt.widgets || {};

    // for compatibility v1.0
    this.widgets = this.refs;
    this._widget = this.props.widget || uniqueId('widget');

    this.uniqueId = this._widget;
}

Intact$2._constructors = [];

// ES7 Decorator for template
if (Object.defineProperty) {
    Object.defineProperty(Intact$2, 'template', {
        configurable: false,
        enumerable: false,
        value: templateDecorator,
        writable: true
    });
}

/**
 * 验证属性合法性，参考vue实现
 * 这种实现方式，使用起来很简单，无需引入额外的模块
 * 但是也无法验证复杂的数据结构（需要自己实现验证函数）
 */
function validateProps(props, propTypes) {
    if (!props || !propTypes) return;

    for (var prop in propTypes) {
        var value = props[prop];
        var expectedType = propTypes[prop];
        if (!isPlainObject(expectedType)) {
            expectedType = { type: expectedType };
        }

        if (isNullOrUndefined$1(value)) {
            if (expectedType.required) {
                error$1('Missing required prop: "' + prop + '".');
                return;
            } else {
                continue;
            }
        }

        var type = expectedType.type;
        if (type) {
            if (!isArray(type)) {
                type = [type];
            }

            for (var i = 0; i < type.length; i++) {
                var _assertType = assertType(value, type[i]),
                    _expectedType = _assertType.expectedType,
                    valid = _assertType.valid;

                if (!valid) {
                    error$1('Invalid type of prop "' + prop + '". Expected ' + _expectedType + ', got ' + toRawType(value) + '.');
                    return;
                }
            }
        }

        var validator = expectedType.validator;
        if (validator) {
            var result$$1 = validator(value);
            if (result$$1 === false) {
                error$1('Invalid prop "' + prop + '": custom validator check failed.');
                return;
            } else if (result$$1 !== true) {
                error$1('Invalid prop "' + prop + '": ' + result$$1);
                return;
            }
        }
    }
}

var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/;
function assertType(value, type) {
    var valid = void 0;
    var expectedType = getType(type);

    if (simpleCheckRE.test(expectedType)) {
        var t = typeof value === 'undefined' ? 'undefined' : _typeof(value);
        valid = t === expectedType.toLowerCase();

        // for primitive wrapper objects
        if (!valid && t === 'object') {
            valid = value instanceof type;
        }
    } else if (expectedType === 'Object') {
        valid = isPlainObject(value);
    } else if (expectedType === 'Array') {
        valid = isArray(value);
    } else {
        valid = value instanceof type;
    }

    return { valid: valid, expectedType: expectedType };
}

function getType(fn) {
    var match = fn && fn.toString().match(/^\s*function (\w+)/);
    return match ? match[1] : '';
}

var toString$4 = Object.prototype.toString;
function toRawType(value) {
    return toString$4.call(value).slice(8, -1);
}

function isPlainObject(value) {
    return toString$4.call(value) === '[object Object]';
}

Intact$2._constructors.push(function (props) {
    this.props = extend({}, result(this, 'defaults'), props);

    if (process.env.NODE_ENV !== 'production') {
        validateProps(props, this.constructor.propTypes);
    }

    // for compatibility v1.0
    this.attributes = this.props;
});

// function name conflict with utils.get
Intact$2.prototype.get = function _get(key, defaultValue) {
    if (key === undefined) return this.props;

    return get$$1(this.props, key, defaultValue);
};

Intact$2.prototype.set = function _set(key, val, options) {
    var _this = this;

    if (isNullOrUndefined$1(key)) return this;

    if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
        options = val;
    } else {
        var obj = {};
        obj[key] = val;
        key = obj;
    }
    options = extend({
        silent: false,
        update: true,
        async: false,
        _fromPatchProps: false
    }, options);
    // 兼容老版本
    if (hasOwn.call(options, 'global')) {
        options.update = options.global;
    }

    var props = this.props;

    var changes = [];

    if (!options.silent) {
        changes = setProps(key, props);
    } else {
        // 如果静默更新，则直接赋值
        for (var prop in key) {
            set$$1(props, prop, key[prop]);
        }
    }

    if (changes.length) {
        var changeKeys = [];
        for (var i = 0; i < changes.length; i++) {
            var _changes$i = changes[i],
                _prop = _changes$i[0],
                values$$1 = _changes$i[1];

            changeKeys.push(_prop);

            if (options._fromPatchProps) {
                // trigger a $receive event to show that we received a different prop
                this.trigger('$receive:' + _prop, this, values$$1[1], values$$1[0]);
                // 存在如下情况
                // 当prop为value通过v-model进行双向绑定时，receive事件有可能会修正该value
                // 而修正的过程中，触发了change事件，会去修改绑定的属性
                // 但是下面触发的change事件，又会将绑定的属性置为未修正的值
                // 这会导致死循坏
                // 所以这里将values[1]设为修正后的值，避免死循坏发生
                values$$1[1] = this.get(_prop);
            }

            // trigger `change*` events
            this.trigger('$change:' + _prop, this, values$$1[1], values$$1[0]);
        }

        this.trigger('$change', this, changeKeys);

        if (options.update && this._startRender) {
            if (options.async) {
                if (!this._$nextTick) {
                    this._$nextTick = new NextTick(function (data) {
                        // 将每次改变的属性放入数组
                        this.args.push(data);
                    });
                    this._$nextTick.args = [];
                }

                var self = this;
                this._$nextTick.fire(function () {
                    // 合并执行更新后，触发所有$changed事件
                    var args = this.args;
                    var changes = [];
                    for (var _i = 0; _i < args.length; _i++) {
                        changes = changes.concat(args[_i]);
                    }
                    self._$nextTick = null;
                    triggerChange(self, changes);
                }, changes);
            } else {
                triggerChange(this, changes);
            }
        } else if (this.mountedQueue && this._startRender) {
            // 如果是父组件导致子组件更新，此时存在mountedQueue
            // 则在组件数更新完毕，触发$changed事件
            this.mountedQueue.push(function () {
                triggerChangedEvent(_this, changes);
            });
        }
    }

    return this;
};

function triggerChange(o, changes) {
    o.update();
    triggerChangedEvent(o, changes);
}

function triggerChangedEvent(o, changes) {
    var changeKeys = [];
    for (var i = 0; i < changes.length; i++) {
        var _changes$i2 = changes[i],
            prop = _changes$i2[0],
            values$$1 = _changes$i2[1];

        changeKeys.push(prop);

        o.trigger('$changed:' + prop, o, values$$1[1], values$$1[0]);
    }
    o.trigger('$changed', o, changeKeys);
}

function setProps(newProps, props) {
    var propsPathTree = {};
    var changes = {};
    var changesWithoutNextValue = [];
    for (var prop in newProps) {
        var nextValue = newProps[prop];
        var lastValue = get$$1(props, prop);

        if (!isEqual(lastValue, nextValue)) {
            var tree = propsPathTree;
            changes[prop] = [lastValue, nextValue];

            if (!hasOwn.call(props, prop)) {
                // a.b.c => ['a', 'b', 'c']
                var paths = castPath(prop);
                var length = paths.length;
                for (var i = 0; i < length; i++) {
                    var name = paths[i];
                    if (!tree[name]) {
                        if (i < length - 1) {
                            tree[name] = {};
                            var path = paths.slice(0, i + 1).join('.');
                            changes[path] = [get$$1(props, path)];
                            changesWithoutNextValue.push(path);
                        } else {
                            tree[name] = null;
                        }
                    }
                    tree = tree[name];
                }
                // tree = {a: {b: {c: {}}}}
                // changes = {'a.b.c': [v1, v2], 'a': [v1], 'a.b': [v1]}
            } else {
                tree[prop] = null;
            }
        }

        // 即使相等，也要重新复制，因为有可能引用地址变更
        set$$1(props, prop, nextValue);
    }

    for (var _i2 = 0; _i2 < changesWithoutNextValue.length; _i2++) {
        var _path2 = changesWithoutNextValue[_i2];
        changes[_path2].push(get$$1(props, _path2));
    }

    return getChanges(propsPathTree, changes);
}

// 深度优先遍历，得到正确的事件触发顺序
function getChanges(tree, data, path) {
    var changes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

    for (var key in tree) {
        var _path = path === undefined ? key : path + '.' + key;
        if (tree[key]) {
            getChanges(tree[key], data, _path, changes);
        }
        changes.push([_path, data[_path]]);
    }

    return changes;
}

Intact$2._constructors.push(function (props) {
    var _this = this;

    this._events = {};
    this._keptEvents = {}; // save the events that do not off when destroyed

    // bind events
    each(props, function (value, key) {
        if (isEventProp$1(key)) {
            if (isArray(value)) {
                for (var i = 0; i < value.length; i++) {
                    if (value[i]) {
                        _this.on(key.substr(3), value[i]);
                    }
                }
            } else if (value) {
                _this.on(key.substr(3), value);
            }
        }
    });
});

Intact$2.prototype.on = function (name, callback, options) {
    (this._events[name] || (this._events[name] = [])).push(callback);

    // save the kept event
    if (options && options.keep) {
        (this._keptEvents[name] || (this._keptEvents[name] = [])).push(callback);
    }

    return this;
};

Intact$2.prototype.one = function (name, callback) {
    var _this2 = this;

    var fn = function fn() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        callback.apply(_this2, args);
        _this2.off(name, fn);
    };
    this.on(name, fn);

    return this;
};

Intact$2.prototype.off = function (name, callback) {
    if (name === undefined) {
        this._events = extend({}, this._keptEvents);
        return this;
    }

    var callbacks = this._events[name];
    if (!callbacks) return this;

    if (callback === undefined) {
        delete this._events[name];
        return this;
    }

    for (var cb, i = 0; i < callbacks.length; i++) {
        cb = callbacks[i];
        if (cb === callback) {
            callbacks.splice(i, 1);
            // i--;
            break;
        }
    }

    return this;
};

Intact$2.prototype.trigger = function (name) {
    var callbacks = this._events[name];

    if (callbacks) {
        callbacks = callbacks.slice();

        for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            args[_key2 - 1] = arguments[_key2];
        }

        for (var i = 0, l = callbacks.length; i < l; i++) {
            callbacks[i].apply(this, args);
        }
    }

    return this;
};

var Types$2 = {
    Text: 1,
    HtmlElement: 1 << 1,

    ComponentClass: 1 << 2,
    ComponentFunction: 1 << 3,
    ComponentInstance: 1 << 4,

    HtmlComment: 1 << 5,

    InputElement: 1 << 6,
    SelectElement: 1 << 7,
    TextareaElement: 1 << 8,
    SvgElement: 1 << 9,

    UnescapeText: 1 << 10 // for server side render unescape text
};
Types$2.FormElement = Types$2.InputElement | Types$2.SelectElement | Types$2.TextareaElement;
Types$2.Element = Types$2.HtmlElement | Types$2.FormElement | Types$2.SvgElement;
Types$2.ComponentClassOrInstance = Types$2.ComponentClass | Types$2.ComponentInstance;
Types$2.TextElement = Types$2.Text | Types$2.HtmlComment;

var EMPTY_OBJ$1 = {};
if (process.env.NODE_ENV !== 'production' && !browser$1.isIE) {
    Object.freeze(EMPTY_OBJ$1);
}

function VNode$1(type, tag, props, children, className, key, ref) {
    this.type = type;
    this.tag = tag;
    this.props = props;
    this.children = children;
    this.key = key;
    this.ref = ref;
    this.className = className;
}

function createVNode$1(tag, props, children, className, key, ref) {
    var type = void 0;
    props || (props = EMPTY_OBJ$1);
    switch (typeof tag === 'undefined' ? 'undefined' : _typeof(tag)) {
        case 'string':
            if (tag === 'input') {
                type = Types$2.InputElement;
            } else if (tag === 'select') {
                type = Types$2.SelectElement;
            } else if (tag === 'textarea') {
                type = Types$2.TextareaElement;
            } else if (tag === 'svg') {
                type = Types$2.SvgElement;
            } else {
                type = Types$2.HtmlElement;
            }
            break;
        case 'function':
            if (tag.prototype.init) {
                type = Types$2.ComponentClass;
            } else {
                // return tag(props);
                type = Types$2.ComponentFunction;
            }
            break;
        case 'object':
            if (tag.init) {
                return createComponentInstanceVNode$1(tag);
            }
        default:
            throw new Error('unknown vNode type: ' + tag);
    }

    if (type & (Types$2.ComponentClass | Types$2.ComponentFunction)) {
        if (!isNullOrUndefined$1(children)) {
            if (props === EMPTY_OBJ$1) props = {};
            props.children = normalizeChildren$2(children, false);
            // props.children = children;
        } else if (!isNullOrUndefined$1(props.children)) {
            props.children = normalizeChildren$2(props.children, false);
        }
        if (type & Types$2.ComponentFunction) {
            if (key || ref) {
                if (props === EMPTY_OBJ$1) props = {};
                if (key) props.key = key;
                if (ref) props.ref = ref;
            }
            return tag(props);
        }
    } else if (!isNullOrUndefined$1(children)) {
        children = normalizeChildren$2(children, true);
    }

    return new VNode$1(type, tag, props, children, className || props.className, key || props.key, ref || props.ref);
}

function createCommentVNode$1(children) {
    return new VNode$1(Types$2.HtmlComment, null, EMPTY_OBJ$1, children);
}



function createTextVNode$1(text) {
    return new VNode$1(Types$2.Text, null, EMPTY_OBJ$1, text);
}



function createComponentInstanceVNode$1(instance) {
    var props = instance.props || EMPTY_OBJ$1;
    return new VNode$1(Types$2.ComponentInstance, instance.constructor, props, instance, null, props.key, props.ref);
}

function normalizeChildren$2(vNodes, isAddKey) {
    if (isArray$1(vNodes)) {
        var childNodes = addChild$1(vNodes, { index: 0 }, isAddKey);
        return childNodes.length ? childNodes : null;
    } else if (isComponentInstance$1(vNodes)) {
        return createComponentInstanceVNode$1(vNodes);
    } else if (vNodes.type && !isNullOrUndefined$1(vNodes.dom)) {
        return directClone$1(vNodes);
    }
    return vNodes;
}

function applyKey$1(vNode, reference, isAddKey) {
    if (!isAddKey) return vNode;
    // start with '.' means the vNode has been set key by index
    // we will reset the key when it comes back again
    if (isNullOrUndefined$1(vNode.key) || vNode.key[0] === '.') {
        vNode.key = '.$' + reference.index++;
    }
    // add a flag to indicate that we have handle the vNode
    // when it came back we should clone it
    vNode.$ = true;
    return vNode;
}

function addChild$1(vNodes, reference, isAddKey) {
    var newVNodes = void 0;
    for (var i = 0; i < vNodes.length; i++) {
        var n = vNodes[i];
        if (isNullOrUndefined$1(n)) {
            if (!newVNodes) {
                newVNodes = vNodes.slice(0, i);
            }
        } else if (isArray$1(n)) {
            if (!newVNodes) {
                newVNodes = vNodes.slice(0, i);
            }
            newVNodes = newVNodes.concat(addChild$1(n, reference, isAddKey));
        } else if (isStringOrNumber$1(n)) {
            if (!newVNodes) {
                newVNodes = vNodes.slice(0, i);
            }
            newVNodes.push(applyKey$1(createTextVNode$1(n), reference, isAddKey));
        } else if (isComponentInstance$1(n)) {
            if (!newVNodes) {
                newVNodes = vNodes.slice(0, i);
            }
            newVNodes.push(applyKey$1(createComponentInstanceVNode$1(n), reference, isAddKey));
        } else if (n.type) {
            if (!newVNodes) {
                newVNodes = vNodes.slice(0, i);
            }
            if (n.dom || n.$) {
                newVNodes.push(applyKey$1(directClone$1(n), reference, isAddKey));
            } else {
                newVNodes.push(applyKey$1(n, reference, isAddKey));
            }
        }
    }
    return newVNodes || vNodes;
}

function directClone$1(vNode) {
    var newVNode = void 0;
    var type = vNode.type;

    if (type & Types$2.ComponentClassOrInstance) {
        var props = void 0;
        var propsToClone = vNode.props;

        if (propsToClone === EMPTY_OBJ$1 || isNullOrUndefined$1(propsToClone)) {
            props = EMPTY_OBJ$1;
        } else {
            props = {};
            for (var key in propsToClone) {
                props[key] = propsToClone[key];
            }
        }

        newVNode = new VNode$1(type, vNode.tag, props, vNode.children, null, vNode.key, vNode.ref);

        var newProps = newVNode.props;
        var newChildren = newProps.children;

        if (newChildren) {
            if (isArray$1(newChildren)) {
                var len = newChildren.length;
                if (len > 0) {
                    var tmpArray = [];

                    for (var i = 0; i < len; i++) {
                        var child = newChildren[i];
                        if (isStringOrNumber$1(child)) {
                            tmpArray.push(child);
                        } else if (!isInvalid$1(child) && child.type) {
                            tmpArray.push(directClone$1(child));
                        }
                    }
                    newProps.children = tmpArray;
                }
            } else if (newChildren.type) {
                newProps.children = directClone$1(newChildren);
            }
        }
    } else if (type & Types$2.Element) {
        var children = vNode.children;
        var _props = void 0;
        var _propsToClone = vNode.props;

        if (_propsToClone === EMPTY_OBJ$1 || isNullOrUndefined$1(_propsToClone)) {
            _props = EMPTY_OBJ$1;
        } else {
            _props = {};
            for (var _key in _propsToClone) {
                _props[_key] = _propsToClone[_key];
            }
        }

        newVNode = new VNode$1(type, vNode.tag, vNode.props, children, vNode.className, vNode.key, vNode.ref);
    } else if (type & Types$2.Text) {
        newVNode = createTextVNode$1(vNode.children);
    } else if (type & Types$2.HtmlComment) {
        newVNode = createCommentVNode$1(vNode.children);
    }

    return newVNode;
}

var ALL_PROPS$1 = ["altKey", "bubbles", "cancelable", "ctrlKey", "eventPhase", "metaKey", "relatedTarget", "shiftKey", "target", "timeStamp", "type", "view", "which"];
var KEY_PROPS$1 = ["char", "charCode", "key", "keyCode"];
var MOUSE_PROPS$1 = ["button", "buttons", "clientX", "clientY", "layerX", "layerY", "offsetX", "offsetY", "pageX", "pageY", "screenX", "screenY", "toElement"];

var rkeyEvent$1 = /^key|input/;
var rmouseEvent$1 = /^(?:mouse|pointer|contextmenu)|click/;

function Event$1(e) {
    for (var i = 0; i < ALL_PROPS$1.length; i++) {
        var propKey = ALL_PROPS$1[i];
        this[propKey] = e[propKey];
    }

    if (!e.target) {
        this.target = e.srcElement;
    }

    this._rawEvent = e;
}
Event$1.prototype.preventDefault = function () {
    var e = this._rawEvent;
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }
};
Event$1.prototype.stopPropagation = function () {
    var e = this._rawEvent;
    e.cancelBubble = true;
    e.stopImmediatePropagation && e.stopImmediatePropagation();
};

function MouseEvent$1(e) {
    Event$1.call(this, e);
    for (var j = 0; j < MOUSE_PROPS$1.length; j++) {
        var mousePropKey = MOUSE_PROPS$1[j];
        this[mousePropKey] = e[mousePropKey];
    }
}
MouseEvent$1.prototype = createObject$1(Event$1.prototype);
MouseEvent$1.prototype.constructor = MouseEvent$1;

function KeyEvent$1(e) {
    Event$1.call(this, e);
    for (var j = 0; j < KEY_PROPS$1.length; j++) {
        var keyPropKey = KEY_PROPS$1[j];
        this[keyPropKey] = e[keyPropKey];
    }
}
KeyEvent$1.prototype = createObject$1(Event$1.prototype);
KeyEvent$1.prototype.constructor = KeyEvent$1;

function proxyEvent$1(e) {
    if (rkeyEvent$1.test(e.type)) {
        return new KeyEvent$1(e);
    } else if (rmouseEvent$1.test(e.type)) {
        return new MouseEvent$1(e);
    } else {
        return new Event$1(e);
    }
}

var addEventListener$1 = void 0;
var removeEventListener$1 = void 0;
if ('addEventListener' in doc$1) {
    addEventListener$1 = function addEventListener(dom, name, fn) {
        dom.addEventListener(name, fn, false);
    };

    removeEventListener$1 = function removeEventListener(dom, name, fn) {
        dom.removeEventListener(name, fn);
    };
} else {
    addEventListener$1 = function addEventListener(dom, name, fn) {
        fn.cb = function (e) {
            e = proxyEvent$1(e);
            fn(e);
        };
        dom.attachEvent("on" + name, fn.cb);
    };

    removeEventListener$1 = function removeEventListener(dom, name, fn) {
        dom.detachEvent("on" + name, fn.cb || fn);
    };
}

var delegatedEvents$1 = {};
var unDelegatesEvents$1 = {
    'mouseenter': true,
    'mouseleave': true,
    'propertychange': true,
    'scroll': true
};

// change event can not be deletegated in IE8 
if (browser$1.isIE8) {
    unDelegatesEvents$1.change = true;
}

function handleEvent$1(name, lastEvent, nextEvent, dom) {
    if (name === 'blur') {
        name = 'focusout';
    } else if (name === 'focus') {
        name = 'focusin';
    } else if (browser$1.isIE8 && name === 'input') {
        name = 'propertychange';
    }

    if (!unDelegatesEvents$1[name]) {
        var delegatedRoots = delegatedEvents$1[name];

        if (nextEvent) {
            if (!delegatedRoots) {
                delegatedRoots = { items: new SimpleMap$1(), docEvent: null };
                delegatedRoots.docEvent = attachEventToDocument$1(name, delegatedRoots);
                delegatedEvents$1[name] = delegatedRoots;
            }
            delegatedRoots.items.set(dom, nextEvent);
        } else if (delegatedRoots) {
            var items = delegatedRoots.items;
            if (items.delete(dom)) {
                if (items.size === 0) {
                    removeEventListener$1(doc$1, name, delegatedRoots.docEvent);
                    delete delegatedEvents$1[name];
                }
            }
        }
    } else {
        if (lastEvent) {
            removeEventListener$1(dom, name, lastEvent);
        }
        if (nextEvent) {
            addEventListener$1(dom, name, nextEvent);
        }
    }
}

function dispatchEvent$1(event, target, items, count, isClick) {
    var eventToTrigger = items.get(target);
    if (eventToTrigger) {
        count--;
        event.currentTarget = target;
        eventToTrigger(event);
        if (event._rawEvent.cancelBubble) {
            return;
        }
    }
    if (count > 0) {
        var parentDom = target.parentNode;
        if (isNullOrUndefined$1(parentDom) || isClick && parentDom.nodeType === 1 && parentDom.disabled) {
            return;
        }
        dispatchEvent$1(event, parentDom, items, count, isClick);
    }
}

function attachEventToDocument$1(name, delegatedRoots) {
    var docEvent = function docEvent(event) {
        var count = delegatedRoots.items.size;
        event || (event = window.event);
        if (count > 0) {
            event = proxyEvent$1(event);
            dispatchEvent$1(event, event.target, delegatedRoots.items, count, event.type === 'click');
        }
    };
    addEventListener$1(doc$1, name, docEvent);
    return docEvent;
}

function processSelect$1(vNode, dom, nextProps, isRender) {
    var multiple = nextProps.multiple;
    if (multiple !== dom.multiple) {
        dom.multiple = multiple;
    }
    var children = vNode.children;

    if (!isNullOrUndefined$1(children)) {
        var value = nextProps.value;
        if (isRender && isNullOrUndefined$1(value)) {
            value = nextProps.defaultValue;
        }

        var flag = { hasSelected: false };
        if (isArray$1(children)) {
            for (var i = 0; i < children.length; i++) {
                updateChildOptionGroup$1(children[i], value, flag);
            }
        } else {
            updateChildOptionGroup$1(children, value, flag);
        }
        if (!flag.hasSelected) {
            dom.value = '';
        }
    }
}

function updateChildOptionGroup$1(vNode, value, flag) {
    var tag = vNode.tag;

    if (tag === 'optgroup') {
        var children = vNode.children;

        if (isArray$1(children)) {
            for (var i = 0; i < children.length; i++) {
                updateChildOption$1(children[i], value, flag);
            }
        } else {
            updateChildOption$1(children, value, flag);
        }
    } else {
        updateChildOption$1(vNode, value, flag);
    }
}

function updateChildOption$1(vNode, value, flag) {
    // skip text and comment node
    if (vNode.type & Types$2.HtmlElement) {
        var props = vNode.props;
        var dom = vNode.dom;

        if (isArray$1(value) && indexOf$1(value, props.value) !== -1 || props.value === value) {
            dom.selected = true;
            if (!flag.hasSelected) flag.hasSelected = true;
        } else if (!isNullOrUndefined$1(value) || !isNullOrUndefined$1(props.selected)) {
            var selected = !!props.selected;
            if (!flag.hasSelected && selected) flag.hasSelected = true;
            dom.selected = selected;
        }
    }
}

function processInput$1(vNode, dom, nextProps) {
    var type = nextProps.type;
    var value = nextProps.value;
    var checked = nextProps.checked;
    var defaultValue = nextProps.defaultValue;
    var multiple = nextProps.multiple;
    var hasValue = !isNullOrUndefined$1(value);

    if (multiple && multiple !== dom.multiple) {
        dom.multiple = multiple;
    }
    if (!isNullOrUndefined$1(defaultValue) && !hasValue) {
        dom.defaultValue = defaultValue + '';
    }
    if (isCheckedType$1(type)) {
        if (hasValue) {
            dom.value = value;
        }
        if (!isNullOrUndefined$1(checked)) {
            dom.checked = checked;
        }
    } else {
        if (hasValue && dom.value !== value) {
            dom.value = value;
        } else if (!isNullOrUndefined$1(checked)) {
            dom.checked = checked;
        }
    }
}

function isCheckedType$1(type) {
    return type === 'checkbox' || type === 'radio';
}

function processTextarea$1(vNode, dom, nextProps, isRender) {
    var value = nextProps.value;
    var domValue = dom.value;

    if (isNullOrUndefined$1(value)) {
        if (isRender) {
            var defaultValue = nextProps.defaultValue;
            if (!isNullOrUndefined$1(defaultValue)) {
                if (defaultValue !== domValue) {
                    dom.value = defaultValue;
                }
            } else if (domValue !== '') {
                dom.value = '';
            }
        }
    } else {
        if (domValue !== value) {
            dom.value = value;
        }
    }
}

function processForm$1(vNode, dom, nextProps, isRender) {
    var type = vNode.type;
    if (type & Types$2.InputElement) {
        processInput$1(vNode, dom, nextProps, isRender);
    } else if (type & Types$2.TextareaElement) {
        processTextarea$1(vNode, dom, nextProps, isRender);
    } else if (type & Types$2.SelectElement) {
        processSelect$1(vNode, dom, nextProps, isRender);
    }
}

function render$1(vNode, parentDom, mountedQueue, parentVNode, isSVG) {
    if (isNullOrUndefined$1(vNode)) return;
    var isTrigger = true;
    if (mountedQueue) {
        isTrigger = false;
    } else {
        mountedQueue = new MountedQueue$1();
    }
    var dom = createElement$1(vNode, parentDom, mountedQueue, true /* isRender */, parentVNode, isSVG);
    if (isTrigger) {
        mountedQueue.trigger();
    }
    return dom;
}

function createElement$1(vNode, parentDom, mountedQueue, isRender, parentVNode, isSVG) {
    var type = vNode.type;
    if (type & Types$2.Element) {
        return createHtmlElement$1(vNode, parentDom, mountedQueue, isRender, parentVNode, isSVG);
    } else if (type & Types$2.Text) {
        return createTextElement$1(vNode, parentDom);
    } else if (type & Types$2.ComponentClassOrInstance) {
        return createComponentClassOrInstance$1(vNode, parentDom, mountedQueue, null, isRender, parentVNode, isSVG);
        // } else if (type & Types.ComponentFunction) {
        // return createComponentFunction(vNode, parentDom, mountedQueue, isNotAppendChild, isRender);
        // } else if (type & Types.ComponentInstance) {
        // return createComponentInstance(vNode, parentDom, mountedQueue);
    } else if (type & Types$2.HtmlComment) {
        return createCommentElement$1(vNode, parentDom);
    } else {
        throw new Error('unknown vnode type ' + type);
    }
}

function createHtmlElement$1(vNode, parentDom, mountedQueue, isRender, parentVNode, isSVG) {
    var type = vNode.type;

    isSVG = isSVG || (type & Types$2.SvgElement) > 0;

    var dom = documentCreateElement$1(vNode.tag, isSVG);
    var children = vNode.children;
    var props = vNode.props;
    var className = vNode.className;

    vNode.dom = dom;
    vNode.parentVNode = parentVNode;

    if (!isNullOrUndefined$1(children)) {
        createElements$1(children, dom, mountedQueue, isRender, vNode, isSVG === true && vNode.tag !== 'foreignObject');
    }

    if (!isNullOrUndefined$1(className)) {
        if (isSVG) {
            dom.setAttribute('class', className);
        } else {
            dom.className = className;
        }
    }

    // in IE8, the select value will be set to the first option's value forcely
    // when it is appended to parent dom. We change its value in processForm does not
    // work. So processForm after it has be appended to parent dom.
    var isFormElement = void 0;
    if (props !== EMPTY_OBJ$1) {
        isFormElement = (vNode.type & Types$2.FormElement) > 0;
        for (var prop in props) {
            patchProp$1(prop, null, props[prop], dom, isFormElement, isSVG);
        }
    }

    var ref = vNode.ref;
    if (!isNullOrUndefined$1(ref)) {
        createRef$1(dom, ref, mountedQueue);
    }

    if (parentDom) {
        appendChild$1(parentDom, dom);
    }

    if (isFormElement) {
        processForm$1(vNode, dom, props, true);
    }

    return dom;
}

function createTextElement$1(vNode, parentDom) {
    var dom = doc$1.createTextNode(vNode.children);
    vNode.dom = dom;

    if (parentDom) {
        parentDom.appendChild(dom);
    }

    return dom;
}

function createComponentClassOrInstance$1(vNode, parentDom, mountedQueue, lastVNode, isRender, parentVNode, isSVG) {
    var props = vNode.props;
    var instance = vNode.type & Types$2.ComponentClass ? new vNode.tag(props) : vNode.children;
    instance.parentDom = parentDom;
    instance.mountedQueue = mountedQueue;
    instance.isRender = isRender;
    instance.parentVNode = parentVNode;
    instance.isSVG = isSVG;
    instance.vNode = vNode;
    var dom = instance.init(lastVNode, vNode);
    var ref = vNode.ref;

    vNode.dom = dom;
    vNode.children = instance;
    vNode.parentVNode = parentVNode;

    if (parentDom) {
        appendChild$1(parentDom, dom);
        // parentDom.appendChild(dom);
    }

    if (typeof instance.mount === 'function') {
        mountedQueue.push(function () {
            return instance.mount(lastVNode, vNode);
        });
    }

    if (typeof ref === 'function') {
        ref(instance);
    }

    return dom;
}



function createCommentElement$1(vNode, parentDom) {
    var dom = doc$1.createComment(vNode.children);
    vNode.dom = dom;

    if (parentDom) {
        parentDom.appendChild(dom);
    }

    return dom;
}



function createElements$1(vNodes, parentDom, mountedQueue, isRender, parentVNode, isSVG) {
    if (isStringOrNumber$1(vNodes)) {
        setTextContent$1(parentDom, vNodes);
    } else if (isArray$1(vNodes)) {
        for (var i = 0; i < vNodes.length; i++) {
            createElement$1(vNodes[i], parentDom, mountedQueue, isRender, parentVNode, isSVG);
        }
    } else {
        createElement$1(vNodes, parentDom, mountedQueue, isRender, parentVNode, isSVG);
    }
}

function removeElements$1(vNodes, parentDom) {
    if (isNullOrUndefined$1(vNodes)) {
        return;
    } else if (isArray$1(vNodes)) {
        for (var i = 0; i < vNodes.length; i++) {
            removeElement$1(vNodes[i], parentDom);
        }
    } else {
        removeElement$1(vNodes, parentDom);
    }
}

function removeElement$1(vNode, parentDom, nextVNode) {
    var type = vNode.type;
    if (type & Types$2.Element) {
        return removeHtmlElement$1(vNode, parentDom);
    } else if (type & Types$2.TextElement) {
        return removeText$1(vNode, parentDom);
    } else if (type & Types$2.ComponentClassOrInstance) {
        return removeComponentClassOrInstance$1(vNode, parentDom, nextVNode);
    } else if (type & Types$2.ComponentFunction) {
        return removeComponentFunction$1(vNode, parentDom);
    }
}

function removeHtmlElement$1(vNode, parentDom) {
    var ref = vNode.ref;
    var props = vNode.props;
    var dom = vNode.dom;

    if (ref) {
        ref(null);
    }

    removeElements$1(vNode.children, null);

    // remove event
    for (var name in props) {
        var prop = props[name];
        if (!isNullOrUndefined$1(prop) && isEventProp$1(name)) {
            handleEvent$1(name.substr(3), prop, null, dom);
        }
    }

    if (parentDom) {
        parentDom.removeChild(dom);
    }
}

function removeText$1(vNode, parentDom) {
    if (parentDom) {
        parentDom.removeChild(vNode.dom);
    }
}

function removeComponentFunction$1(vNode, parentDom) {
    var ref = vNode.ref;
    if (ref) {
        ref(null);
    }
    removeElement$1(vNode.children, parentDom);
}

function removeComponentClassOrInstance$1(vNode, parentDom, nextVNode) {
    var instance = vNode.children;
    var ref = vNode.ref;

    if (typeof instance.destroy === 'function') {
        instance.destroy(vNode, nextVNode, parentDom);
    }

    if (ref) {
        ref(null);
    }

    // instance destroy method will remove everything
    // removeElements(vNode.props.children, null);

    if (parentDom) {
        removeChild$1(parentDom, vNode);
    }
}



function replaceChild$1(parentDom, lastVNode, nextVNode) {
    var lastDom = lastVNode.dom;
    var nextDom = nextVNode.dom;
    var parentNode = lastDom.parentNode;
    // maybe the lastDom has be moved
    if (!parentDom || parentNode !== parentDom) parentDom = parentNode;
    if (lastDom._unmount) {
        lastDom._unmount(lastVNode, parentDom);
        if (!nextDom.parentNode) {
            if (parentDom.lastChild === lastDom) {
                parentDom.appendChild(nextDom);
            } else {
                parentDom.insertBefore(nextDom, lastDom.nextSibling);
            }
        }
    } else {
        parentDom.replaceChild(nextDom, lastDom);
    }
}

function removeChild$1(parentDom, vNode) {
    var dom = vNode.dom;
    if (dom._unmount) {
        dom._unmount(vNode, parentDom);
    } else {
        parentDom.removeChild(dom);
    }
}

function appendChild$1(parentDom, dom) {
    // in IE8, when a element has appendChild,
    // then its parentNode will be HTMLDocument object,
    // so check the tagName for this case
    if (!dom.parentNode || !dom.parentNode.tagName) {
        parentDom.appendChild(dom);
    }
}

function createRef$1(dom, ref, mountedQueue) {
    if (typeof ref === 'function') {
        // mountedQueue.push(() => ref(dom));
        // set ref immediately, because we have unset it before
        ref(dom);
    } else {
        throw new Error('ref must be a function, but got "' + JSON.stringify(ref) + '"');
    }
}

function documentCreateElement$1(tag, isSVG) {
    if (isSVG === true) {
        return doc$1.createElementNS(svgNS$1, tag);
    } else {
        return doc$1.createElement(tag);
    }
}

function patchVNode$1(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG) {
    if (lastVNode !== nextVNode) {
        var nextType = nextVNode.type;
        var lastType = lastVNode.type;

        if (nextType & Types$2.Element) {
            if (lastType & Types$2.Element) {
                patchElement$1(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
            } else {
                replaceElement$1(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
            }
        } else if (nextType & Types$2.TextElement) {
            if (lastType === nextType) {
                patchText$1(lastVNode, nextVNode);
            } else {
                replaceElement$1(lastVNode, nextVNode, parentDom, mountedQueue, isSVG);
            }
        } else if (nextType & Types$2.ComponentClass) {
            if (lastType & Types$2.ComponentClass) {
                patchComponentClass$1(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
            } else {
                replaceElement$1(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
            }
            // } else if (nextType & Types.ComponentFunction) {
            // if (lastType & Types.ComponentFunction) {
            // patchComponentFunction(lastVNode, nextVNode, parentDom, mountedQueue);
            // } else {
            // replaceElement(lastVNode, nextVNode, parentDom, mountedQueue);
            // }
        } else if (nextType & Types$2.ComponentInstance) {
            if (lastType & Types$2.ComponentInstance) {
                patchComponentIntance$1(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
            } else {
                replaceElement$1(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
            }
        }
    }
    return nextVNode.dom;
}

function patchElement$1(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG) {
    var dom = lastVNode.dom;
    var lastProps = lastVNode.props;
    var nextProps = nextVNode.props;
    var lastChildren = lastVNode.children;
    var nextChildren = nextVNode.children;
    var lastClassName = lastVNode.className;
    var nextClassName = nextVNode.className;
    var nextType = nextVNode.type;

    nextVNode.dom = dom;
    nextVNode.parentVNode = parentVNode;

    isSVG = isSVG || (nextType & Types$2.SvgElement) > 0;

    if (lastVNode.tag !== nextVNode.tag || lastVNode.key !== nextVNode.key) {
        replaceElement$1(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
    } else {
        if (lastChildren !== nextChildren) {
            patchChildren$1(lastChildren, nextChildren, dom, mountedQueue, nextVNode, isSVG === true && nextVNode.tag !== 'foreignObject');
        }

        if (lastProps !== nextProps) {
            patchProps$2(lastVNode, nextVNode, isSVG);
        }

        if (lastClassName !== nextClassName) {
            if (isNullOrUndefined$1(nextClassName)) {
                dom.removeAttribute('class');
            } else {
                if (isSVG) {
                    dom.setAttribute('class', nextClassName);
                } else {
                    dom.className = nextClassName;
                }
            }
        }

        var lastRef = lastVNode.ref;
        var nextRef = nextVNode.ref;
        if (lastRef !== nextRef) {
            if (!isNullOrUndefined$1(lastRef)) {
                lastRef(null);
            }
            if (!isNullOrUndefined$1(nextRef)) {
                createRef$1(dom, nextRef, mountedQueue);
            }
        }
    }
}

function patchComponentClass$1(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG) {
    var lastTag = lastVNode.tag;
    var nextTag = nextVNode.tag;
    var dom = lastVNode.dom;

    var instance = void 0;
    var newDom = void 0;

    if (lastTag !== nextTag || lastVNode.key !== nextVNode.key) {
        // we should call this remove function in component's init method
        // because it should be destroyed until async component has rendered
        // removeComponentClassOrInstance(lastVNode, null, nextVNode);
        newDom = createComponentClassOrInstance$1(nextVNode, parentDom, mountedQueue, lastVNode, false, parentVNode, isSVG);
    } else {
        instance = lastVNode.children;
        instance.mountedQueue = mountedQueue;
        instance.isRender = false;
        instance.parentVNode = parentVNode;
        instance.vNode = nextVNode;
        instance.isSVG = isSVG;
        newDom = instance.update(lastVNode, nextVNode);
        nextVNode.dom = newDom;
        nextVNode.children = instance;
        nextVNode.parentVNode = parentVNode;

        // for intact.js, the dom will not be removed and
        // the component will not be destoryed, so the ref
        // function need be called in update method.
        var lastRef = lastVNode.ref;
        var nextRef = nextVNode.ref;
        if (lastRef !== nextRef) {
            if (!isNullOrUndefined$1(lastRef)) {
                lastRef(null);
            }
            if (!isNullOrUndefined$1(nextRef)) {
                nextRef(instance);
            }
        }
    }

    // perhaps the dom has be replaced
    if (dom !== newDom && dom.parentNode &&
    // when dom has be replaced, its parentNode maybe be fragment in IE8
    dom.parentNode.nodeName !== '#document-fragment') {
        replaceChild$1(parentDom, lastVNode, nextVNode);
    }
}

function patchComponentIntance$1(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG) {
    var lastInstance = lastVNode.children;
    var nextInstance = nextVNode.children;
    var dom = lastVNode.dom;

    var newDom = void 0;

    if (lastInstance !== nextInstance) {
        // removeComponentClassOrInstance(lastVNode, null, nextVNode);
        newDom = createComponentClassOrInstance$1(nextVNode, parentDom, mountedQueue, lastVNode, false, parentVNode, isSVG);
    } else {
        lastInstance.mountedQueue = mountedQueue;
        lastInstance.isRender = false;
        lastInstance.parentVNode = parentVNode;
        newDom = lastInstance.update(lastVNode, nextVNode);
        nextVNode.dom = newDom;
        nextVNode.parentVNode = parentVNode;

        var ref = nextVNode.ref;
        if (typeof ref === 'function') {
            ref(instance);
        }
    }

    if (dom !== newDom && dom.parentNode &&
    // when dom has be replaced, its parentNode maybe be fragment in IE8
    dom.parentNode.nodeName !== '#document-fragment') {
        replaceChild$1(parentDom, lastVNode, nextVNode);
    }
}

// function patchComponentFunction(lastVNode, nextVNode, parentDom, mountedQueue) {
// const lastTag = lastVNode.tag;
// const nextTag = nextVNode.tag;

// if (lastVNode.key !== nextVNode.key) {
// removeElements(lastVNode.children, parentDom);
// createComponentFunction(nextVNode, parentDom, mountedQueue);
// } else {
// nextVNode.dom = lastVNode.dom;
// createComponentFunctionVNode(nextVNode);
// patchChildren(lastVNode.children, nextVNode.children, parentDom, mountedQueue);
// }
// }

function patchChildren$1(lastChildren, nextChildren, parentDom, mountedQueue, parentVNode, isSVG) {
    if (isNullOrUndefined$1(lastChildren)) {
        if (!isNullOrUndefined$1(nextChildren)) {
            createElements$1(nextChildren, parentDom, mountedQueue, false, parentVNode, isSVG);
        }
    } else if (isNullOrUndefined$1(nextChildren)) {
        if (isStringOrNumber$1(lastChildren)) {
            setTextContent$1(parentDom, '');
        } else {
            removeElements$1(lastChildren, parentDom);
        }
    } else if (isStringOrNumber$1(nextChildren)) {
        if (isStringOrNumber$1(lastChildren)) {
            setTextContent$1(parentDom, nextChildren);
        } else {
            removeElements$1(lastChildren, parentDom);
            setTextContent$1(parentDom, nextChildren);
        }
    } else if (isArray$1(lastChildren)) {
        if (isArray$1(nextChildren)) {
            patchChildrenByKey$1(lastChildren, nextChildren, parentDom, mountedQueue, parentVNode, isSVG);
        } else {
            removeElements$1(lastChildren, parentDom);
            createElement$1(nextChildren, parentDom, mountedQueue, false, parentVNode, isSVG);
        }
    } else if (isArray$1(nextChildren)) {
        if (isStringOrNumber$1(lastChildren)) {
            setTextContent$1(parentDom, '');
        } else {
            removeElement$1(lastChildren, parentDom);
        }
        createElements$1(nextChildren, parentDom, mountedQueue, false, parentVNode, isSVG);
    } else if (isStringOrNumber$1(lastChildren)) {
        setTextContent$1(parentDom, '');
        createElement$1(nextChildren, parentDom, mountedQueue, false, parentVNode, isSVG);
    } else {
        patchVNode$1(lastChildren, nextChildren, parentDom, mountedQueue, parentVNode, isSVG);
    }
}

function patchChildrenByKey$1(a, b, dom, mountedQueue, parentVNode, isSVG) {
    var aLength = a.length;
    var bLength = b.length;
    var aEnd = aLength - 1;
    var bEnd = bLength - 1;
    var aStart = 0;
    var bStart = 0;
    var i = void 0;
    var j = void 0;
    var aNode = void 0;
    var bNode = void 0;
    var nextNode = void 0;
    var nextPos = void 0;
    var node = void 0;
    var aStartNode = a[aStart];
    var bStartNode = b[bStart];
    var aEndNode = a[aEnd];
    var bEndNode = b[bEnd];

    outer: while (true) {
        while (aStartNode.key === bStartNode.key) {
            patchVNode$1(aStartNode, bStartNode, dom, mountedQueue, parentVNode, isSVG);
            ++aStart;
            ++bStart;
            if (aStart > aEnd || bStart > bEnd) {
                break outer;
            }
            aStartNode = a[aStart];
            bStartNode = b[bStart];
        }
        while (aEndNode.key === bEndNode.key) {
            patchVNode$1(aEndNode, bEndNode, dom, mountedQueue, parentVNode, isSVG);
            --aEnd;
            --bEnd;
            if (aEnd < aStart || bEnd < bStart) {
                break outer;
            }
            aEndNode = a[aEnd];
            bEndNode = b[bEnd];
        }

        if (aEndNode.key === bStartNode.key) {
            patchVNode$1(aEndNode, bStartNode, dom, mountedQueue, parentVNode, isSVG);
            dom.insertBefore(bStartNode.dom, aStartNode.dom);
            --aEnd;
            ++bStart;
            aEndNode = a[aEnd];
            bStartNode = b[bStart];
            continue;
        }

        if (aStartNode.key === bEndNode.key) {
            patchVNode$1(aStartNode, bEndNode, dom, mountedQueue, parentVNode, isSVG);
            insertOrAppend$1(bEnd, bLength, bEndNode.dom, b, dom);
            ++aStart;
            --bEnd;
            aStartNode = a[aStart];
            bEndNode = b[bEnd];
            continue;
        }
        break;
    }

    if (aStart > aEnd) {
        while (bStart <= bEnd) {
            insertOrAppend$1(bEnd, bLength, createElement$1(b[bStart], null, mountedQueue, false, parentVNode, isSVG), b, dom, true /* detectParent: for animate, if the parentNode exists, then do nothing*/
            );
            ++bStart;
        }
    } else if (bStart > bEnd) {
        while (aStart <= aEnd) {
            removeElement$1(a[aStart], dom);
            ++aStart;
        }
    } else {
        aLength = aEnd - aStart + 1;
        bLength = bEnd - bStart + 1;
        var sources = new Array(bLength);
        for (i = 0; i < bLength; i++) {
            sources[i] = -1;
        }
        var moved = false;
        var pos = 0;
        var patched = 0;

        if (bLength <= 4 || aLength * bLength <= 16) {
            for (i = aStart; i <= aEnd; i++) {
                aNode = a[i];
                if (patched < bLength) {
                    for (j = bStart; j <= bEnd; j++) {
                        bNode = b[j];
                        if (aNode.key === bNode.key) {
                            sources[j - bStart] = i;
                            if (pos > j) {
                                moved = true;
                            } else {
                                pos = j;
                            }
                            patchVNode$1(aNode, bNode, dom, mountedQueue, parentVNode, isSVG);
                            ++patched;
                            a[i] = null;
                            break;
                        }
                    }
                }
            }
        } else {
            var keyIndex = {};
            for (i = bStart; i <= bEnd; i++) {
                keyIndex[b[i].key] = i;
            }
            for (i = aStart; i <= aEnd; i++) {
                aNode = a[i];
                if (patched < bLength) {
                    j = keyIndex[aNode.key];
                    if (j !== undefined) {
                        bNode = b[j];
                        sources[j - bStart] = i;
                        if (pos > j) {
                            moved = true;
                        } else {
                            pos = j;
                        }
                        patchVNode$1(aNode, bNode, dom, mountedQueue, parentVNode, isSVG);
                        ++patched;
                        a[i] = null;
                    }
                }
            }
        }
        if (aLength === a.length && patched === 0) {
            // removeAllChildren(dom, a);
            // children maybe have animation
            removeElements$1(a, dom);
            while (bStart < bLength) {
                createElement$1(b[bStart], dom, mountedQueue, false, parentVNode, isSVG);
                ++bStart;
            }
        } else {
            // some browsers, e.g. ie, must insert before remove for some element,
            // e.g. select/option, otherwise the selected property will be weird
            if (moved) {
                var seq = lisAlgorithm$1(sources);
                j = seq.length - 1;
                for (i = bLength - 1; i >= 0; i--) {
                    if (sources[i] === -1) {
                        pos = i + bStart;
                        insertOrAppend$1(pos, b.length, createElement$1(b[pos], null, mountedQueue, false, parentVNode, isSVG), b, dom);
                    } else {
                        if (j < 0 || i !== seq[j]) {
                            pos = i + bStart;
                            insertOrAppend$1(pos, b.length, b[pos].dom, b, dom);
                        } else {
                            --j;
                        }
                    }
                }
            } else if (patched !== bLength) {
                for (i = bLength - 1; i >= 0; i--) {
                    if (sources[i] === -1) {
                        pos = i + bStart;
                        insertOrAppend$1(pos, b.length, createElement$1(b[pos], null, mountedQueue, false, parentVNode, isSVG), b, dom, true);
                    }
                }
            }
            i = aLength - patched;
            while (i > 0) {
                aNode = a[aStart++];
                if (aNode !== null) {
                    removeElement$1(aNode, dom);
                    --i;
                }
            }
        }
    }
}

function lisAlgorithm$1(arr) {
    var p = arr.slice(0);
    var result = [0];
    var i = void 0;
    var j = void 0;
    var u = void 0;
    var v = void 0;
    var c = void 0;
    var len = arr.length;
    for (i = 0; i < len; i++) {
        var arrI = arr[i];
        if (arrI === -1) {
            continue;
        }
        j = result[result.length - 1];
        if (arr[j] < arrI) {
            p[i] = j;
            result.push(i);
            continue;
        }
        u = 0;
        v = result.length - 1;
        while (u < v) {
            c = (u + v) / 2 | 0;
            if (arr[result[c]] < arrI) {
                u = c + 1;
            } else {
                v = c;
            }
        }
        if (arrI < arr[result[u]]) {
            if (u > 0) {
                p[i] = result[u - 1];
            }
            result[u] = i;
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}

function insertOrAppend$1(pos, length, newDom, nodes, dom, detectParent) {
    var nextPos = pos + 1;
    // if (detectParent && newDom.parentNode) {
    // return;
    // } else
    if (nextPos < length) {
        dom.insertBefore(newDom, nodes[nextPos].dom);
    } else {
        dom.appendChild(newDom);
        // appendChild(dom, newDom);
    }
}

function replaceElement$1(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG) {
    removeElement$1(lastVNode, null, nextVNode);
    createElement$1(nextVNode, null, mountedQueue, false, parentVNode, isSVG);
    replaceChild$1(parentDom, lastVNode, nextVNode);
}

function patchText$1(lastVNode, nextVNode, parentDom) {
    var nextText = nextVNode.children;
    var dom = lastVNode.dom;
    nextVNode.dom = dom;
    if (lastVNode.children !== nextText) {
        dom.nodeValue = nextText;
    }
}

function patchProps$2(lastVNode, nextVNode, isSVG) {
    var lastProps = lastVNode.props;
    var nextProps = nextVNode.props;
    var dom = nextVNode.dom;
    var prop = void 0;
    if (nextProps !== EMPTY_OBJ$1) {
        var isFormElement = (nextVNode.type & Types$2.FormElement) > 0;
        for (prop in nextProps) {
            patchProp$1(prop, lastProps[prop], nextProps[prop], dom, isFormElement, isSVG);
        }
        if (isFormElement) {
            processForm$1(nextVNode, dom, nextProps, false);
        }
    }
    if (lastProps !== EMPTY_OBJ$1) {
        for (prop in lastProps) {
            if (!isSkipProp$1(prop) && isNullOrUndefined$1(nextProps[prop]) && !isNullOrUndefined$1(lastProps[prop])) {
                removeProp$1(prop, lastProps[prop], dom);
            }
        }
    }
}

function patchProp$1(prop, lastValue, nextValue, dom, isFormElement, isSVG) {
    if (lastValue !== nextValue) {
        if (isSkipProp$1(prop) || isFormElement && prop === 'value') {
            return;
        } else if (booleanProps$1[prop]) {
            dom[prop] = !!nextValue;
        } else if (strictProps$1[prop]) {
            var value = isNullOrUndefined$1(nextValue) ? '' : nextValue;
            // IE8 the value of option is equal to its text as default
            // so set it forcely
            if (dom[prop] !== value || browser$1.isIE8) {
                dom[prop] = value;
            }
            // add a private property _value for selecting an non-string value 
            if (prop === 'value') {
                dom._value = value;
            }
        } else if (isNullOrUndefined$1(nextValue)) {
            removeProp$1(prop, lastValue, dom);
        } else if (isEventProp$1(prop)) {
            handleEvent$1(prop.substr(3), lastValue, nextValue, dom);
        } else if (isObject$2(nextValue)) {
            patchPropByObject$1(prop, lastValue, nextValue, dom);
        } else if (prop === 'innerHTML') {
            dom.innerHTML = nextValue;
        } else {
            if (isSVG && namespaces$1[prop]) {
                dom.setAttributeNS(namespaces$1[prop], prop, nextValue);
            } else {
                dom.setAttribute(prop, nextValue);
            }
        }
    }
}

function removeProp$1(prop, lastValue, dom) {
    if (!isNullOrUndefined$1(lastValue)) {
        switch (prop) {
            case 'value':
                dom.value = '';
                return;
            case 'style':
                dom.removeAttribute('style');
                return;
            case 'attributes':
                for (var key in lastValue) {
                    dom.removeAttribute(key);
                }
                return;
            case 'dataset':
                removeDataset$1(lastValue, dom);
                return;
            case 'innerHTML':
                dom.innerHTML = '';
                return;
            default:
                break;
        }

        if (booleanProps$1[prop]) {
            dom[prop] = false;
        } else if (isEventProp$1(prop)) {
            handleEvent$1(prop.substr(3), lastValue, null, dom);
        } else if (isObject$2(lastValue)) {
            var domProp = dom[prop];
            try {
                dom[prop] = undefined;
                delete dom[prop];
            } catch (e) {
                for (var _key in lastValue) {
                    delete domProp[_key];
                }
            }
        } else {
            dom.removeAttribute(prop);
        }
    }
}

var removeDataset$1 = browser$1.isIE || browser$1.isSafari ? function (lastValue, dom) {
    for (var key in lastValue) {
        dom.removeAttribute('data-' + kebabCase$1(key));
    }
} : function (lastValue, dom) {
    var domProp = dom.dataset;
    for (var key in lastValue) {
        delete domProp[key];
    }
};

function patchPropByObject$1(prop, lastValue, nextValue, dom) {
    if (lastValue && !isObject$2(lastValue) && !isNullOrUndefined$1(lastValue)) {
        removeProp$1(prop, lastValue, dom);
        lastValue = null;
    }
    switch (prop) {
        case 'attributes':
            return patchAttributes$1(lastValue, nextValue, dom);
        case 'style':
            return patchStyle$1(lastValue, nextValue, dom);
        case 'dataset':
            return patchDataset$1(prop, lastValue, nextValue, dom);
        default:
            return patchObject$1(prop, lastValue, nextValue, dom);
    }
}

var patchDataset$1 = browser$1.isIE ? function patchDataset(prop, lastValue, nextValue, dom) {
    var hasRemoved = {};
    var key = void 0;
    var value = void 0;

    for (key in nextValue) {
        var dataKey = 'data-' + kebabCase$1(key);
        value = nextValue[key];
        if (isNullOrUndefined$1(value)) {
            dom.removeAttribute(dataKey);
            hasRemoved[key] = true;
        } else {
            dom.setAttribute(dataKey, value);
        }
    }

    if (!isNullOrUndefined$1(lastValue)) {
        for (key in lastValue) {
            if (isNullOrUndefined$1(nextValue[key]) && !hasRemoved[key]) {
                dom.removeAttribute('data-' + kebabCase$1(key));
            }
        }
    }
} : patchObject$1;

var _cache$1 = {};
var uppercasePattern$1 = /[A-Z]/g;
function kebabCase$1(word) {
    if (!_cache$1[word]) {
        _cache$1[word] = word.replace(uppercasePattern$1, function (item) {
            return '-' + item.toLowerCase();
        });
    }
    return _cache$1[word];
}

function patchObject$1(prop, lastValue, nextValue, dom) {
    var domProps = dom[prop];
    if (isNullOrUndefined$1(domProps)) {
        domProps = dom[prop] = {};
    }
    var key = void 0;
    var value = void 0;
    for (key in nextValue) {
        domProps[key] = nextValue[key];
    }
    if (!isNullOrUndefined$1(lastValue)) {
        for (key in lastValue) {
            if (isNullOrUndefined$1(nextValue[key])) {
                delete domProps[key];
            }
        }
    }
}

function patchAttributes$1(lastValue, nextValue, dom) {
    var hasRemoved = {};
    var key = void 0;
    var value = void 0;
    for (key in nextValue) {
        value = nextValue[key];
        if (isNullOrUndefined$1(value)) {
            dom.removeAttribute(key);
            hasRemoved[key] = true;
        } else {
            dom.setAttribute(key, value);
        }
    }
    if (!isNullOrUndefined$1(lastValue)) {
        for (key in lastValue) {
            if (isNullOrUndefined$1(nextValue[key]) && !hasRemoved[key]) {
                dom.removeAttribute(key);
            }
        }
    }
}

function patchStyle$1(lastValue, nextValue, dom) {
    var domStyle = dom.style;
    var hasRemoved = {};
    var key = void 0;
    var value = void 0;
    for (key in nextValue) {
        value = nextValue[key];
        if (isNullOrUndefined$1(value)) {
            domStyle[key] = '';
            hasRemoved[key] = true;
        } else {
            domStyle[key] = value;
        }
    }
    if (!isNullOrUndefined$1(lastValue)) {
        for (key in lastValue) {
            if (isNullOrUndefined$1(nextValue[key]) && !hasRemoved[key]) {
                domStyle[key] = '';
            }
        }
    }
}

function toString$5(vNode, parent, disableSplitText, firstChild) {
    var type = vNode.type;
    var tag = vNode.tag;
    var props = vNode.props;
    var children = vNode.children;

    var html = void 0;
    if (type & Types$2.ComponentClass) {
        var instance = new tag(props);
        html = instance.toString();
    } else if (type & Types$2.ComponentInstance) {
        html = vNode.children.toString();
    } else if (type & Types$2.Element) {
        var innerHTML = void 0;
        html = '<' + tag;

        if (!isNullOrUndefined$1(vNode.className)) {
            html += ' class="' + escapeText$1(vNode.className) + '"';
        }

        if (props !== EMPTY_OBJ$1) {
            for (var prop in props) {
                var value = props[prop];

                if (prop === 'innerHTML') {
                    innerHTML = value;
                } else if (prop === 'style') {
                    html += ' style="' + renderStylesToString$1(value) + '"';
                } else if (prop === 'children' || prop === 'className' || prop === 'key' || prop === 'ref') {
                    // ignore
                } else if (prop === 'defaultValue') {
                    if (isNullOrUndefined$1(props.value) && !isNullOrUndefined$1(value)) {
                        html += ' value="' + (isString$2(value) ? escapeText$1(value) : value) + '"';
                    }
                } else if (prop === 'defaultChecked') {
                    if (isNullOrUndefined$1(props.checked) && value === true) {
                        html += ' checked';
                    }
                } else if (prop === 'attributes') {
                    html += renderAttributesToString$1(value);
                } else if (prop === 'dataset') {
                    html += renderDatasetToString$1(value);
                } else if (tag === 'option' && prop === 'value') {
                    html += renderAttributeToString$1(prop, value);
                    if (parent && value === parent.props.value) {
                        html += ' selected';
                    }
                } else {
                    html += renderAttributeToString$1(prop, value);
                }
            }
        }

        if (selfClosingTags$1[tag]) {
            html += ' />';
        } else {
            html += '>';
            if (innerHTML) {
                html += innerHTML;
            } else if (!isNullOrUndefined$1(children)) {
                if (isString$2(children)) {
                    html += children === '' ? ' ' : escapeText$1(children);
                } else if (isNumber$1(children)) {
                    html += children;
                } else if (isArray$1(children)) {
                    var index = -1;
                    for (var i = 0; i < children.length; i++) {
                        var child = children[i];
                        if (isString$2(child)) {
                            html += child === '' ? ' ' : escapeText$1(child);
                        } else if (isNumber$1(child)) {
                            html += child;
                        } else if (!isNullOrUndefined$1(child)) {
                            if (!(child.type & Types$2.Text)) {
                                index = -1;
                            } else {
                                index++;
                            }
                            html += toString$5(child, vNode, disableSplitText, index === 0);
                        }
                    }
                } else {
                    html += toString$5(children, vNode, disableSplitText, true);
                }
            }

            html += '</' + tag + '>';
        }
    } else if (type & Types$2.Text) {
        html = (firstChild || disableSplitText ? '' : '<!---->') + (children === '' ? ' ' : escapeText$1(children));
    } else if (type & Types$2.HtmlComment) {
        html = '<!--' + children + '-->';
    } else if (type & Types$2.UnescapeText) {
        html = isNullOrUndefined$1(children) ? '' : children;
    } else {
        throw new Error('Unknown vNode: ' + vNode);
    }

    return html;
}

function escapeText$1(text) {
    var result = text;
    var escapeString = "";
    var start = 0;
    var i = void 0;
    for (i = 0; i < text.length; i++) {
        switch (text.charCodeAt(i)) {
            case 34:
                // "
                escapeString = "&quot;";
                break;
            case 39:
                // \
                escapeString = "&#039;";
                break;
            case 38:
                // &
                escapeString = "&amp;";
                break;
            case 60:
                // <
                escapeString = "&lt;";
                break;
            case 62:
                // >
                escapeString = "&gt;";
                break;
            default:
                continue;
        }
        if (start) {
            result += text.slice(start, i);
        } else {
            result = text.slice(start, i);
        }
        result += escapeString;
        start = i + 1;
    }
    if (start && i !== start) {
        return result + text.slice(start, i);
    }
    return result;
}

function isString$2(o) {
    return typeof o === 'string';
}

function isNumber$1(o) {
    return typeof o === 'number';
}

function renderStylesToString$1(styles) {
    if (isStringOrNumber$1(styles)) {
        return styles;
    } else {
        var renderedString = "";
        for (var styleName in styles) {
            var value = styles[styleName];

            if (isStringOrNumber$1(value)) {
                renderedString += kebabCase$1(styleName) + ':' + value + ';';
            }
        }
        return renderedString;
    }
}

function renderDatasetToString$1(dataset) {
    var renderedString = '';
    for (var key in dataset) {
        var dataKey = 'data-' + kebabCase$1(key);
        var value = dataset[key];
        if (isString$2(value)) {
            renderedString += ' ' + dataKey + '="' + escapeText$1(value) + '"';
        } else if (isNumber$1(value)) {
            renderedString += ' ' + dataKey + '="' + value + '"';
        } else if (value === true) {
            renderedString += ' ' + dataKey + '="true"';
        }
    }
    return renderedString;
}

function renderAttributesToString$1(attributes) {
    var renderedString = '';
    for (var key in attributes) {
        renderedString += renderAttributeToString$1(key, attributes[key]);
    }
    return renderedString;
}

function renderAttributeToString$1(key, value) {
    if (isString$2(value)) {
        return ' ' + key + '="' + escapeText$1(value) + '"';
    } else if (isNumber$1(value)) {
        return ' ' + key + '="' + value + '"';
    } else if (value === true) {
        return ' ' + key;
    } else {
        return '';
    }
}

function hydrateRoot$1(vNode, parentDom, mountedQueue) {
    if (!isNullOrUndefined$1(parentDom)) {
        var dom = parentDom.firstChild;
        if (isNullOrUndefined$1(dom)) {
            return render$1(vNode, parentDom, mountedQueue, null, false);
        }
        var newDom = hydrate$1(vNode, dom, mountedQueue, parentDom, null, false);
        dom = dom.nextSibling;
        // should only one entry
        while (dom) {
            var next = dom.nextSibling;
            parentDom.removeChild(dom);
            dom = next;
        }
        return newDom;
    }
    return null;
}

function hydrate$1(vNode, dom, mountedQueue, parentDom, parentVNode, isSVG) {
    if (dom !== null) {
        var isTrigger = true;
        if (mountedQueue) {
            isTrigger = false;
        } else {
            mountedQueue = new MountedQueue$1();
        }
        dom = hydrateElement$1(vNode, dom, mountedQueue, parentDom, parentVNode, isSVG);
        if (isTrigger) {
            mountedQueue.trigger();
        }
    }
    return dom;
}

function hydrateElement$1(vNode, dom, mountedQueue, parentDom, parentVNode, isSVG) {
    var type = vNode.type;

    if (type & Types$2.Element) {
        return hydrateHtmlElement$1(vNode, dom, mountedQueue, parentDom, parentVNode, isSVG);
    } else if (type & Types$2.Text) {
        return hydrateText$1(vNode, dom);
    } else if (type & Types$2.HtmlComment) {
        return hydrateComment$1(vNode, dom);
    } else if (type & Types$2.ComponentClassOrInstance) {
        return hydrateComponentClassOrInstance$1(vNode, dom, mountedQueue, parentDom, parentVNode, isSVG);
    }
}

function hydrateComponentClassOrInstance$1(vNode, dom, mountedQueue, parentDom, parentVNode, isSVG) {
    var props = vNode.props;
    var instance = vNode.type & Types$2.ComponentClass ? new vNode.tag(props) : vNode.children;
    instance.parentDom = parentDom;
    instance.mountedQueue = mountedQueue;
    instance.isRender = true;
    instance.parentVNode = parentVNode;
    instance.isSVG = isSVG;
    instance.vNode = vNode;
    var newDom = instance.hydrate(vNode, dom);

    vNode.dom = newDom;
    vNode.children = instance;
    vNode.parentVNode = parentVNode;

    if (typeof instance.mount === 'function') {
        mountedQueue.push(function () {
            return instance.mount(null, vNode);
        });
    }

    var ref = vNode.ref;
    if (typeof ref === 'function') {
        ref(instance);
    }

    if (dom !== newDom && dom.parentNode) {
        dom.parentNode.replaceChild(newDom, dom);
    }

    return dom;
}

function hydrateComment$1(vNode, dom) {
    if (dom.nodeType !== 8) {
        var newDom = createCommentElement$1(vNode, null);
        dom.parentNode.replaceChild(newDom, dom);
        return newDom;
    }
    var comment = vNode.children;
    if (dom.data !== comment) {
        dom.data = comment;
    }
    vNode.dom = dom;
    return dom;
}

function hydrateText$1(vNode, dom) {
    if (dom.nodeType !== 3) {
        var newDom = createTextElement$1(vNode, null);
        dom.parentNode.replaceChild(newDom, dom);

        return newDom;
    }

    var text = vNode.children;
    if (dom.nodeValue !== text) {
        dom.nodeValue = text;
    }
    vNode.dom = dom;

    return dom;
}

function hydrateHtmlElement$1(vNode, dom, mountedQueue, parentDom, parentVNode, isSVG) {
    var children = vNode.children;
    var props = vNode.props;
    var className = vNode.className;
    var type = vNode.type;
    var ref = vNode.ref;

    vNode.parentVNode = parentVNode;
    isSVG = isSVG || (type & Types$2.SvgElement) > 0;

    if (dom.nodeType !== 1 || dom.tagName.toLowerCase() !== vNode.tag) {
        warning$1('Server-side markup doesn\'t match client-side markup');
        var newDom = createElement$1(vNode, null, mountedQueue, parentDom, parentVNode, isSVG);
        dom.parentNode.replaceChild(newDom, dom);

        return newDom;
    }

    vNode.dom = dom;
    if (!isNullOrUndefined$1(children)) {
        hydrateChildren$1(children, dom, mountedQueue, vNode, isSVG);
    } else if (dom.firstChild !== null) {
        setTextContent$1(dom, '');
    }

    if (props !== EMPTY_OBJ$1) {
        var isFormElement = (type & Types$2.FormElement) > 0;
        for (var prop in props) {
            patchProp$1(prop, null, props[prop], dom, isFormElement, isSVG);
        }
        if (isFormElement) {
            processForm$1(vNode, dom, props, true);
        }
    }

    if (!isNullOrUndefined$1(className)) {
        if (isSVG) {
            dom.setAttribute('class', className);
        } else {
            dom.className = className;
        }
    } else if (dom.className !== '') {
        dom.removeAttribute('class');
    }

    if (ref) {
        createRef$1(dom, ref, mountedQueue);
    }

    return dom;
}

function hydrateChildren$1(children, parentDom, mountedQueue, parentVNode, isSVG) {
    normalizeChildren$3(parentDom);
    var dom = parentDom.firstChild;

    if (isStringOrNumber$1(children)) {
        if (dom !== null && dom.nodeType === 3) {
            if (dom.nodeValue !== children) {
                dom.nodeValue = children;
            }
        } else if (children === '') {
            parentDom.appendChild(document.createTextNode(''));
        } else {
            setTextContent$1(parentDom, children);
        }
        if (dom !== null) {
            dom = dom.nextSibling;
        }
    } else if (isArray$1(children)) {
        for (var i = 0; i < children.length; i++) {
            var child = children[i];

            if (!isNullOrUndefined$1(child)) {
                if (dom !== null) {
                    var nextSibling = dom.nextSibling;
                    hydrateElement$1(child, dom, mountedQueue, parentDom, parentVNode, isSVG);
                    dom = nextSibling;
                } else {
                    createElement$1(child, parentDom, mountedQueue, true, parentVNode, isSVG);
                }
            }
        }
    } else {
        if (dom !== null) {
            hydrateElement$1(children, dom, mountedQueue, parentDom, parentVNode, isSVG);
            dom = dom.nextSibling;
        } else {
            createElement$1(children, parentDom, mountedQueue, true, parentVNode, isSVG);
        }
    }

    // clear any other DOM nodes, there should be on a single entry for the root
    while (dom) {
        var _nextSibling = dom.nextSibling;
        parentDom.removeChild(dom);
        dom = _nextSibling;
    }
}

function normalizeChildren$3(parentDom) {
    var dom = parentDom.firstChild;

    while (dom) {
        if (dom.nodeType === 8 && dom.data === '') {
            var lastDom = dom.previousSibling;
            parentDom.removeChild(dom);
            dom = lastDom || parentDom.firstChild;
        } else {
            dom = dom.nextSibling;
        }
    }
}

var warning$1 = (typeof console === 'undefined' ? 'undefined' : _typeof(console)) === 'object' ? function (message) {
    console.warn(message);
} : function () {};

Intact$2._constructors.push(function (props) {
    var _this = this;

    // lifecycle states
    this.inited = false;
    this.rendered = false;
    this.mounted = false;
    this.destroyed = false;

    // if the flag is false, any set operation will not lead to update 
    this._startRender = false;

    this._updateCount = 0;
    this._pendingUpdate = null;

    this.mountedQueue = null;

    var inited = function inited() {
        _this.inited = true;

        // trigger $receive event when initialize component
        each(props, function (value, key) {
            _this.trigger('$receive:' + key, _this, value);
        });
        _this.trigger('$inited', _this);
    };
    var ret = this._init();

    if (ret && ret.then) {
        ret.then(inited, function (err) {
            error$1('Unhandled promise rejection in _init: ', err);
            inited();
        });
    } else {
        inited();
    }
});

Intact$2.prototype._init = noop;
Intact$2.prototype._create = noop;
Intact$2.prototype._mount = noop;
Intact$2.prototype._beforeUpdate = noop;
Intact$2.prototype._update = noop;
Intact$2.prototype._destroy = noop;

Intact$2.prototype.init = function (lastVNode, nextVNode) {
    this._lastVNode = lastVNode;
    if (!this.inited) {
        return initAsyncComponnet(this, lastVNode, nextVNode);
    }
    return initSyncComponent(this, lastVNode, nextVNode);
};

Intact$2.prototype.mount = function (lastVNode, nextVNode) {
    // 异步组件，直接返回
    if (!this.inited) return;
    this.mounted = true;
    this.trigger('$mounted', this);
    this._mount(lastVNode, nextVNode);
};

Intact$2.prototype.update = function (lastVNode, nextVNode, fromPending) {
    // 如果该组件已被销毁，则不更新
    // 组件的销毁顺序是从自下而上逐步销毁的，对于子组件，即使将要销毁也要更新
    // 只有父组件被销毁了才不去更新，父组件的更新是没有vNode参数
    if (!lastVNode && !nextVNode && this.destroyed) {
        return lastVNode ? lastVNode.dom : undefined;
    }

    // 如果还没有渲染，则等待结束再去更新
    if (!this.rendered) {
        this._pendingUpdate = function (lastVNode, nextVNode) {
            this.update(lastVNode, nextVNode, true);
        };
        return lastVNode ? lastVNode.dom : undefined;
    }

    if (!nextVNode && !fromPending && this._updateCount === 0) {
        // 如果直接调用update方法，则要清除mountedQueue
        // 如果在render的过程中，又触发了update，则此时
        // 不能清空
        this.mountedQueue = null;
    }

    // 如果不存在nextVNode，则为直接调用update方法更新自己
    // 否则则是父组件触发的子组件更新，此时需要更新一些状态
    // 有一种情况，在父组件初次渲染时，子组件渲染过程中，
    // 又触发了父组件的数据变更，此时父组件渲染完成执行_pendingUpdate
    // 是没有lastVNode的
    if (nextVNode && lastVNode) {
        patchProps$1(this, lastVNode.props, nextVNode.props);
    }

    ++this._updateCount;
    if (this._updateCount > 1) {
        return this.element;
    }
    if (this._updateCount === 1) {
        return updateComponent(this, lastVNode, nextVNode);
    }
};

Intact$2.prototype.destroy = function (lastVNode, nextVNode, parentDom) {
    if (this.destroyed) {
        return warn('destroyed multiple times');
    }

    var vdt = this.vdt;

    // 异步组件，可能还没有渲染
    if (!this.rendered) {
        // 异步组件，只有开始渲染时才销毁上一个组件
        // 如果没有渲染当前异步组件就被销毁了，则要
        // 在这里销毁上一个组件
        var _lastVNode = this._lastVNode;
        if (_lastVNode && !_lastVNode.children.destroyed) {
            removeComponentClassOrInstance$1(_lastVNode, null, lastVNode);
        }
    } else if (!nextVNode || !(nextVNode.type & Types$2.ComponentClassOrInstance) || nextVNode.key !== lastVNode.key) {
        vdt.destroy();
    }

    // 如果存在nextVNode，并且nextVNode也是一个组件类型，
    // 并且，它俩的key相等，则不去destroy，而是在下一个组件init时
    // 复用上一个dom，然后destroy上一个元素
    this._destroy(lastVNode, nextVNode);
    this.destroyed = true;
    this.trigger('$destroyed', this);
    this.off();
};

Intact$2.prototype._initMountedQueue = function () {
    this.mountedQueue = new MountedQueue$1();
};

Intact$2.prototype._triggerMountedQueue = function () {
    this.mountedQueue.trigger();
};

function initSyncComponent(o, lastVNode, nextVNode) {
    var vdt = o.vdt;

    o._startRender = true;
    // 如果key不相同，则不复用dom，直接返回新dom来替换
    if (lastVNode && lastVNode.key === nextVNode.key) {
        // destroy the last component
        if (!lastVNode.children.destroyed) {
            removeComponentClassOrInstance$1(lastVNode, null, nextVNode);
        }

        // make the dom not be replaced, but update the last one
        vdt.vNode = lastVNode.children.vdt.vNode;
        o.element = vdt.update(o, o.parentDom, o.mountedQueue, nextVNode, o.isSVG, o.get('_blocks'));
    } else {
        if (lastVNode) {
            removeComponentClassOrInstance$1(lastVNode, null, nextVNode);
        }
        o.element = vdt.render(o, o.parentDom, o.mountedQueue, nextVNode, o.isSVG, o.get('_blocks'));
    }
    o.rendered = true;
    if (o._pendingUpdate) {
        o._pendingUpdate(lastVNode, nextVNode);
        o._pendingUpdate = null;
    }
    o.trigger('$rendered', o);
    o._create(lastVNode, nextVNode);

    return o.element;
}

function initAsyncComponnet(o, lastVNode, nextVNode) {
    var vdt = o.vdt;
    var placeholder = void 0;

    if (lastVNode) {
        placeholder = lastVNode.dom;
        var lastInstance = lastVNode.children;
        vdt.vNode = lastInstance.vdt.vNode;
        // 如果上一个组件是异步组件，并且也还没渲染完成，则直接destroy掉
        // 让它不再渲染了
        if (!lastInstance.inited) {
            removeComponentClassOrInstance$1(lastVNode, null, nextVNode);
        }
    } else {
        var vNode = createCommentVNode$1('!');
        placeholder = render$1(vNode);
        vdt.vNode = vNode;
    }

    // 组件销毁事件也会解绑，所以这里无需判断组件是否销毁了
    o.one('$inited', function () {
        var element = o.init(lastVNode, nextVNode);
        var dom = nextVNode.dom;
        // 存在一种情况，组件的返回的元素是一个组件，他们指向同一个dom
        // 但是当嵌套组件的dom变更时，父组件的vNode却没有变
        // 所以这里强制保持一致
        nextVNode.dom = element;
        if (!lastVNode || lastVNode.key !== nextVNode.key) {
            dom.parentNode.replaceChild(element, dom);
        }
        o._triggerMountedQueue();
        o.mount(lastVNode, nextVNode);
    });

    vdt.node = placeholder;

    return placeholder;
}

function updateComponent(o, lastVNode, nextVNode) {
    o._beforeUpdate(lastVNode, nextVNode);
    // 直接调用update方法，保持parentVNode不变
    o.element = o.vdt.update(o, o.parentDom, o.mountedQueue, nextVNode || o.vNode, o.isSVG, o.get('_blocks'));
    // 让整个更新完成，才去触发_update生命周期函数
    if (o.mountedQueue) {
        o.mountedQueue.push(function () {
            o._update(lastVNode, nextVNode);
        });
    } else {
        o._update(lastVNode, nextVNode);
    }
    if (--o._updateCount > 0) {
        // 如果更新完成，发现还有更新，则是在更新过程中又触发了更新
        // 此时直接将_updateCount置为1，因为所有数据都已更新，只做最后一次模板更新即可
        // --o._updateCount会将该值设为0，所以这里设为1
        o._updateCount = 1;
        return updateComponent(o, lastVNode, nextVNode);
    }

    // 组件模板可能根据情况返回不同的dom，这种情况下，当组件自身更新(即：直接调用update)
    // 组件的dom可能变更了，但是当前组件的vNode的dom属性却不会变更，此后该dom如果被v-if
    // 指令删除，会报错
    // 所以这里要强制更新
    var vNode = o.vNode;
    if (vNode) {
        // 有可能直接new组件，所以这里判断vNode是否存在
        var lastDom = vNode.dom;
        var nextDom = o.element;
        if (lastDom !== nextDom) {
            vNode.dom = nextDom;
            var parentVNode = vNode.parentVNode;
            // 需要递归判断父组件是不是也指向同一个元素
            while (parentVNode && parentVNode.type & Types$2.ComponentClassOrInstance && parentVNode.dom === lastDom) {
                parentVNode.dom = nextDom;
                parentVNode = parentVNode.parentVNode;
            }
        }
    }

    return o.element;
}

function patchProps$1(o, lastProps, nextProps) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : { update: false, _fromPatchProps: true };

    lastProps = lastProps || EMPTY_OBJ$1;
    nextProps = nextProps || EMPTY_OBJ$1;
    var lastValue = void 0;
    var nextValue = void 0;

    if (lastProps !== nextProps) {
        // 需要先处理事件，因为prop变更可能触发相应的事件
        var lastPropsWithoutEvents = void 0;
        var nextPropsWithoutEvents = void 0;

        // 如果该属性只存在lastProps中，则是事件就解绑；
        // 是属性就加入lastPropsWithoutEvents对象，待会儿再处理
        var handlePropOnlyInLastProps = function handlePropOnlyInLastProps(prop) {
            var lastValue = lastProps[prop];

            if (isEventProp$1(prop)) {
                // 解绑上一个属性中的事件
                removeEvents(o, prop, lastValue);
            } else {
                if (!lastPropsWithoutEvents) {
                    lastPropsWithoutEvents = {};
                }
                lastPropsWithoutEvents[prop] = lastValue;
            }
        };

        if (nextProps !== EMPTY_OBJ$1) {
            if (process.env.NODE_ENV !== 'production') {
                validateProps(nextProps, o.constructor.propTypes);
            }

            for (var prop in nextProps) {
                nextValue = nextProps[prop];

                if (isEventProp$1(prop)) {
                    lastValue = lastProps[prop];
                    if (lastValue === nextValue) continue;

                    patchEventProps(o, prop, lastValue, nextValue);
                } else {
                    if (!nextPropsWithoutEvents) {
                        nextPropsWithoutEvents = {};
                    }
                    nextPropsWithoutEvents[prop] = nextValue;
                }
            }

            if (lastProps !== EMPTY_OBJ$1) {
                for (var _prop in lastProps) {
                    if (!hasOwn.call(nextProps, _prop)) {
                        handlePropOnlyInLastProps(_prop);
                    }
                }
            }

            if (nextPropsWithoutEvents) {
                o.set(nextPropsWithoutEvents, options);
            }
        } else {
            for (var _prop2 in lastProps) {
                handlePropOnlyInLastProps(_prop2);
            }
        }

        // 将不存在nextProps中，但存在lastProps中的属性，统统置为默认值
        var defaults = result(o, 'defaults') || EMPTY_OBJ$1;
        if (lastPropsWithoutEvents) {
            for (var _prop3 in lastPropsWithoutEvents) {
                o.set(_prop3, defaults[_prop3], options);
            }
        }
    }
}

function patchEventProps(o, prop, lastValue, nextValue) {
    o.set(prop, nextValue, { silent: true });
    var eventName = prop.substr(3);

    if (isArray(nextValue)) {
        if (isArray(lastValue)) {
            // 由于实际应用中，nextValue和lastValue一般长度相等，
            // 而且顺序也不会变化，极有可能仅仅只是改变了数组中
            // 的一项或几项，所以可以一一对比处理
            var nextLength = nextValue.length;
            var lastLength = lastValue.length;
            var i = 0;
            var l = Math.min(nextLength, lastLength);
            for (; i < l; i++) {
                var _lastValue = lastValue[i];
                var _nextValue = nextValue[i];
                if (_lastValue !== _nextValue) {
                    if (_nextValue) {
                        o.on(eventName, _nextValue);
                    }
                    if (_lastValue) {
                        o.off(eventName, _lastValue);
                    }
                }
            }
            if (i < nextLength) {
                // 如果nextValue > lastValue
                // 则绑定剩下的事件函数
                for (; i < nextLength; i++) {
                    var _nextValue2 = nextValue[i];
                    if (_nextValue2) {
                        o.on(eventName, _nextValue2);
                    }
                }
            } else if (i < lastLength) {
                // 如果nextValue < lastValue
                // 则解绑剩下的事件函数
                for (; i < lastLength; i++) {
                    var _lastValue2 = lastValue[i];
                    if (_lastValue2) {
                        o.off(eventName, _lastValue2);
                    }
                }
            }
        } else if (lastValue) {
            var found = false;
            for (var _i = 0; _i < nextValue.length; _i++) {
                var _nextValue3 = nextValue[_i];
                if (_nextValue3) {
                    if (_nextValue3 !== lastValue) {
                        o.on(eventName, _nextValue3);
                    } else {
                        found = true;
                    }
                }
            }
            // 如果上一个事件函数不在下一个数组中，则解绑
            if (!found) {
                o.off(eventName, lastValue);
            }
        } else {
            for (var _i2 = 0; _i2 < nextValue.length; _i2++) {
                var _nextValue4 = nextValue[_i2];
                if (_nextValue4) {
                    o.on(eventName, _nextValue4);
                }
            }
        }
    } else if (nextValue) {
        if (isArray(lastValue)) {
            var _found = false;
            for (var _i3 = 0; _i3 < lastValue.length; _i3++) {
                var _lastValue3 = lastValue[_i3];
                if (_lastValue3) {
                    if (_lastValue3 !== nextValue) {
                        o.off(eventName, _lastValue3);
                    } else {
                        _found = true;
                    }
                }
            }
            // 如果下一个事件函数不在上一个数组中，则绑定
            if (!_found) {
                o.on(eventName, nextValue);
            }
        } else if (lastValue) {
            o.off(eventName, lastValue);
            o.on(eventName, nextValue);
        } else {
            o.on(eventName, nextValue);
        }
    } else {
        removeEvents(o, prop, lastValue);
    }
}

function removeEvents(o, prop, value) {
    var eventName = void 0;
    if (isArray(value)) {
        eventName = prop.substr(3);
        for (var i = 0; i < value.length; i++) {
            var v = value[i];
            if (v) {
                o.off(eventName, v);
            }
        }
    } else if (value) {
        eventName = prop.substr(3);
        o.off(eventName, value);
    }
    o.set(prop, undefined, { silent: true });
}

Intact$2.prototype.hydrate = function (vNode, dom) {
    var _this = this;

    var vdt = this.vdt;
    if (!this.inited) {
        this.one('$inited', function () {
            var element = _this.hydrate(vNode, dom);
            if (dom !== element) {
                vNode.dom = element;
            }
            _this._triggerMountedQueue();
            _this.mount(null, vNode);
        });

        return dom;
    }

    this._startRender = true;
    this.element = vdt.hydrate(this, dom, this.mountedQueue, this.parentDom, vNode, this.isSVG, this.get('_blocks'));
    this.rendered = true;
    this.trigger('$rendered', this);
    this._create(null, vNode);

    return this.element;
};

Intact$2.prototype.toString = function () {
    return this.vdt.renderString(this, this.get('_blocks'));
};

/**
 * @brief 继承某个组件
 *
 * @param prototype
 */
Intact$2.extend = function () {
    var prototype = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (_typeof(this.prototype.defaults) === 'object' && _typeof(prototype.defaults) === 'object') {
        prototype.defaults = extend({}, this.prototype.defaults, prototype.defaults);
    }
    return inherit(this, prototype);
};

/**
 * 挂载组件到dom中
 * @param Component {Intact} Intact类或子类
 * @param node {Node} html节点
 */
Intact$2.mount = function (Component, node) {
    if (!node) throw new Error('expect a parent dom to mount Component, but got ' + node);
    var vNode = createVNode$1(Component);
    var mountedQueue = new MountedQueue$1();
    render$1(vNode, node, mountedQueue);
    var instance = vNode.children;
    // 如果不是异步组件，则触发mount事件，否则
    // 交给组件的init方法，等异步处理完成后触发
    if (instance.inited) {
        mountedQueue.trigger();
    }
    return instance;
};

Intact$2.hydrate = function (Component, node) {
    if (!node) throw new Error('expect a parent dom to hydrate Component, but got ' + node);
    var vNode = createVNode$1(Component);
    hydrateRoot$1(vNode, node);
    return vNode.children;
};

function addClass(element, className) {
    if (className) {
        if (element.classList) {
            element.classList.add(className);
        } else if (!hasClass(element, className)) {
            element.className += ' ' + className;
        }
    }
    return element;
}

function hasClass(element, className) {
    if (element.classList) {
        return !!className && element.className.contains(className);
    }
    return (' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1;
}

function removeClass(element, className) {
    if (className) {
        if (element.classList) {
            element.classList.remove(className);
        } else if (hasClass(element, className)) {
            element.className = element.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)', 'g'), '$1').replace(/\s+/g, ' ') // multiple spaces to one
            .replace(/^\s*|\s*$/g, ''); // trim the ends
        }
    }
}

var EVENT_NAME_MAP = {
    transitionend: {
        'transition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'mozTransitionEnd',
        'OTransition': 'oTransitionEnd',
        'msTransition': 'MSTransitionEnd'
    },

    animationend: {
        'animation': 'animationend',
        'WebkitAnimation': 'webkitAnimationEnd',
        'MozAnimation': 'mozAnimationEnd',
        'OAnimation': 'oAnimationEnd',
        'msAnimation': 'MSAnimationEnd'
    }
};

var endEvents = [];
var transitionProp = 'transition';
var animationProp = 'animation';

function detectEvents() {
    var testEl = document.createElement('div');
    var style = testEl.style;

    // On some platforms, in particular some releases of Android 4.x,
    // the un-prefixed "animation" and "transition" properties are defined on the
    // style object but the events that fire will still be prefixed, so we need
    // to check if the un-prefixed events are useable, and if not remove them
    // from the map
    if (!('AnimationEvent' in window)) {
        delete EVENT_NAME_MAP.animationend.animation;
    }

    if (!('TransitionEvent' in window)) {
        delete EVENT_NAME_MAP.transitionend.transition;
    }

    for (var baseEventName in EVENT_NAME_MAP) {
        var baseEvents = EVENT_NAME_MAP[baseEventName];
        for (var styleName in baseEvents) {
            if (styleName in style) {
                endEvents.push(baseEvents[styleName]);
                if (baseEventName === 'transitionend') {
                    transitionProp = styleName;
                } else {
                    animationProp = styleName;
                }
                break;
            }
        }
    }
}

function getAnimateType(element, className) {
    if (className) addClass(element, className);
    var style = window.getComputedStyle(element);
    var transitionDurations = style[transitionProp + 'Duration'].split(', ');
    var animationDurations = style[animationProp + 'Duration'].split(', ');
    var transitionDuration = getDuration(transitionDurations);
    var animationDuration = getDuration(animationDurations);
    if (className) removeClass(element, className);
    return transitionDuration > animationDuration ? 'transition' : 'animation';
}

function getDuration(durations) {
    return Math.max.apply(null, durations.map(function (d) {
        return d.slice(0, -1) * 1000;
    }));
}

function addEventListener$2(node, eventName, eventListener) {
    node.addEventListener(eventName, eventListener, false);
}

function removeEventListener$2(node, eventName, eventListener) {
    node.removeEventListener(eventName, eventListener, false);
}

var TransitionEvents = {
    on: function on(node, eventListener) {
        if (endEvents.length === 0) {
            // If CSS transitions are not supported, trigger an "end animation"
            // event immediately.
            window.setTimeout(eventListener, 0);
            return;
        }
        endEvents.forEach(function (endEvent) {
            addEventListener$2(node, endEvent, eventListener);
        });
    },

    off: function off(node, eventListener) {
        if (endEvents.length === 0) {
            return;
        }
        endEvents.forEach(function (endEvent) {
            removeEventListener$2(node, endEvent, eventListener);
        });
    },

    one: function one(node, eventListener) {
        var listener = function listener() {
            eventListener.apply(this, arguments);
            TransitionEvents.off(node, listener);
        };
        TransitionEvents.on(node, listener);
    }
};

var raf = void 0;
function nextFrame(fn) {
    raf(function () {
        return raf(fn);
    });
}

if (inBrowser) {
    raf = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : setTimeout;

    detectEvents();
}

var CSSMatrix = typeof WebKitCSSMatrix !== 'undefined' ? WebKitCSSMatrix : function (transform) {
    this.m42 = 0;
    this.m41 = 0;
    var type = transform.slice(0, transform.indexOf('('));
    var parts = void 0;
    if (type === 'matrix3d') {
        parts = transform.slice(9, -1).split(',');
        this.m41 = parseFloat(parts[12]);
        this.m42 = parseFloat(parts[13]);
    } else if (type === 'matrix') {
        parts = transform.slice(7, -1).split(',');
        this.m41 = parseFloat(parts[4]);
        this.m42 = parseFloat(parts[5]);
    }
};

var prototype = {
    defaults: function defaults() {
        return {
            'a:tag': 'div',
            'a:transition': 'animate',
            'a:appear': false,
            'a:mode': 'both', // out-in | in-out | both
            'a:disabled': false, // 只做动画管理者，自己不进行动画
            'a:move': true, // 是否执行move动画
            'a:css': true, // 是否使用css动画，如果自定义动画函数，可以将它置为false
            'a:delayDestroy': true // 是否动画完成才destroy子元素
        };
    },
    template: function template() {
        var h = Vdt$1.miss.h;
        var self = this.data;
        var tagName = self.get('a:tag');
        var props = {};
        var _props = self.get();

        for (var key in _props) {
            if (key !== 'ref' && key !== 'key' && (key[0] !== 'a' || key[1] !== ':') && key.substr(0, 5) !== 'ev-a:') {
                props[key] = _props[key];
            }
        }

        return h(tagName, props, self.get('children'));
    },
    _init: function _init() {
        if (!endEvents.length) {
            // 如果不支持css动画，则关闭css
            this.set({
                'a:css': false,
                'a:move': false
            }, { silent: true });
        }

        this.mountChildren = [];
        this.unmountChildren = [];
        this.updateChildren = [];
        this.children = [];
        this._enteringAmount = 0;
        this._leavingAmount = 0;
    }
};

function checkMode(o) {
    var mountChildren = [];
    var updateChildren = [];
    var unmountChildren = [];

    var children = o.children = o.children.filter(function (instance) {
        if (instance._delayEnter) {
            instance._delayEnter = false;
            mountChildren.push(instance);

            return false;
        } else if (instance._delayLeave) {
            instance._delayLeave = false;
            unmountChildren.push(instance);

            return true;
        } else if (instance._leaving !== false) {
            updateChildren.push(instance);

            return true;
        }

        return false;
    });

    o._beforeUpdate();

    mountChildren.forEach(function (instance) {
        instance.element.style.display = '';
        instance.position = null;
    });

    o.mountChildren = mountChildren;
    o.updateChildren = updateChildren;
    o.unmountChildren = unmountChildren;
    o.children = children.concat(mountChildren);

    o._update(null, null, true);
}

prototype.init = inBrowser ? function (lastVNode, nextVNode) {
    var parentDom = this.parentVNode && this.parentVNode.dom || this.parentDom;
    if (parentDom && parentDom._reserve) {
        lastVNode = parentDom._reserve[nextVNode.key];
    }

    return this._super(lastVNode, nextVNode);
} : function () {
    return this._superApply(arguments);
};

prototype.destroy = function (lastVNode, nextVNode, parentDom) {
    // 1: 不存在parentDom，有两种情况：
    //      1): 父元素也要被销毁，此时: !parentDom && lastVNode && !nextVNode
    //      2): 该元素将被替换，此时：!parentDom && lastVNode && nextVNode
    //      对于1)，既然父元素要销毁，那本身也要直接销毁
    //      对于2)，本身必须待动画结束方能销毁
    // 2: 如果该元素已经动画完成，直接销毁
    // 3: 如果直接调用destroy方法，则直接销毁，此时：!lastVNode && !nextVNode && !parentDom
    // 4: 如果不是延迟destroy子元素，则立即销毁
    if (!this.get('a:delayDestroy') || !parentDom && !nextVNode && this.parentVNode.dom !== this.element ||
    // this.get('a:disabled') || 
    this._leaving === false) {
        this._super(lastVNode, nextVNode, parentDom);
    }
};

function leave(o) {
    if (o.get('a:disabled')) return;

    var element = o.element;
    var vNode = o.vNode;
    var parentDom = o.parentDom;
    // vNode都会被添加key，当只有一个子元素时，vNode.key === undefined
    // 这种情况，我们也当成有key处理，此时key为undefined
    if (!parentDom._reserve) {
        parentDom._reserve = {};
    }
    parentDom._reserve[vNode.key] = vNode;

    o._leaving = true;

    if (o._entering) {
        TransitionEvents.off(element, o._enterEnd);
        o._enterEnd();
    }

    addLeaveEndCallback(o);

    // 为了保持动画连贯，我们立即添加leaveActiveClass
    // 但如果当前元素还没有来得及做enter动画，就被删除
    // 则leaveActiveClass和leaveClass都放到下一帧添加
    // 否则leaveClass和enterClass一样就不会有动画效果
    if (o._triggeredEnter && o.get('a:css')) {
        addClass(element, o.leaveActiveClass);
    }

    // TransitionEvents.on(element, o._leaveEnd);
    nextFrame(function () {
        // 1. 如果leave动画还没得及执行，就enter了，此时啥也不做
        if (o._unmountCancelled) return;
        // 存在一种情况，当一个enter动画在完成的瞬间，
        // 这个元素被删除了，由于前面保持动画的连贯性
        // 添加了leaveActiveClass，则会导致绑定的leaveEnd
        // 立即执行，所以这里放到下一帧来绑定
        TransitionEvents.on(element, o._leaveEnd);
        triggerLeave(o);
    });

    // 存在一种情况，相同的dom，同时被子组件和父组件管理的情况
    // 所以unmount后，将其置为空函数，以免再次unmount
    element._unmount = noop;

    o.trigger('a:leaveStart', element);
}

function triggerLeave(o) {
    o._triggeredLeave = true;
    if (o._leaving === false) {
        return;
    }

    var element = o.element;
    if (o.get('a:css')) {
        addClass(element, o.leaveActiveClass);
        addClass(element, o.leaveClass);
    }

    o.trigger('a:leave', element, o._leaveEnd);
}

function addLeaveEndCallback(o) {
    var element = o.element,
        parentDom = o.parentDom,
        vNode = o.vNode;


    o._leaveEnd = function (e) {
        if (e && e.target !== element) return;

        if (o.get('a:css') && !o.get('a:disabled')) {
            e && e.stopPropagation && e.stopPropagation();
            removeClass(element, o.leaveClass);
            removeClass(element, o.leaveActiveClass);
        }
        if (o._triggeredLeave) {
            var s = element.style;
            s.position = s.top = s.left = s.transform = s.WebkitTransform = '';
        }

        o._leaving = false;
        delete parentDom._reserve[vNode.key];
        TransitionEvents.off(element, o._leaveEnd);

        var parentInstance = o.parentInstance;
        if (parentInstance) {
            if (--parentInstance._leavingAmount === 0 && parentInstance.get('a:mode') === 'out-in') {
                checkMode(parentInstance);
            }
        }

        o.trigger('a:leaveEnd', element);
        if (!o._unmountCancelled) {
            parentDom.removeChild(element);
            if (o.get('a:delayDestroy')) {
                o.destroy(vNode, null, parentDom);
            }
        }
    };
}

prototype._mount = function (lastVNode, vNode) {
    this.isAppear = detectIsAppear(this);

    this.on('$change:a:transition', initClassName);
    initClassName(this);

    // 一个动画元素被删除后，会被保存
    // 如果在删除的过程中，又添加了，则要清除上一个动画状态
    // 将这种情况记录下来
    if (this._lastVNode && this._lastVNode !== lastVNode) {
        var lastInstance = this._lastVNode.children;
        if (lastInstance._leaving) {
            this.lastInstance = lastInstance;
        }
    }

    this.parentInstance = getParentAnimate(this);

    addEnterEndCallback(this);
    addUnmountCallback(this, vNode);

    if (this.parentInstance) {
        // 如果存在父动画组件，则使用父级进行管理
        // 统一做动画
        animateList(this);
    } else if (this.isAppear || !this.isRender) {
        // 否则单个元素自己动画
        enter(this);
    }
};

function enter(o) {
    if (o.get('a:disabled')) return;

    o._entering = true;

    var element = o.element;
    var enterClass = o.enterClass;
    var enterActiveClass = o.enterActiveClass;
    var isCss = o.get('a:css');

    // getAnimateType将添加enter-active className，在firefox下将导致动画提前执行
    // 我们应该先于添加`enter` className去调用该函数
    var isTransition = false;
    if (isCss && getAnimateType(element, enterActiveClass) !== 'animation') {
        isTransition = true;
    }

    // 如果这个元素是上一个删除的元素，则从当前状态回到原始状态
    if (o.lastInstance) {
        o.lastInstance._unmountCancelled = true;
        o.lastInstance._leaveEnd();

        if (isCss) {
            if (o.lastInstance._triggeredLeave) {
                // addClass(element, enterActiveClass);
                // 保持连贯，添加leaveActiveClass
                addClass(element, o.leaveActiveClass);
            } else {
                // 如果上一个元素还没来得及做动画，则当做新元素处理
                addClass(element, enterClass);
            }
        }
    } else if (isCss) {
        addClass(element, enterClass);
    }
    TransitionEvents.on(element, o._enterEnd);

    o.trigger(o.enterEventName + 'Start', element);

    if (isTransition) {
        nextFrame(function () {
            return triggerEnter(o);
        });
    } else {
        // 对于animation动画，同步添加enterActiveClass，避免闪动
        triggerEnter(o);
    }
}

function triggerEnter(o) {
    var element = o.element;

    o._triggeredEnter = true;

    if (o.get('a:css')) {
        if (o._entering === false) {
            return removeClass(element, o.enterActiveClass);
        }
        addClass(element, o.enterActiveClass);
        removeClass(element, o.enterClass);
        removeClass(element, o.leaveActiveClass);
    }

    o.trigger(o.enterEventName, element, o._enterEnd);
}

function detectIsAppear(o) {
    var isAppear = false;
    if (o.isRender) {
        var parent = void 0;
        if (o.get('a:appear') && (o.parentDom || (parent = o.parentVNode) && parent.type & Types.ComponentClassOrInstance && !parent.children.isRender)) {
            isAppear = true;
        }
    }

    return isAppear;
}

function initClassName(o, newValue, oldValue) {
    var transition = o.get('a:transition');
    var element = o.element,
        isAppear = o.isAppear;


    var enterClass = void 0;
    var enterActiveClass = void 0;

    if (isAppear) {
        enterClass = transition + '-appear';
        enterActiveClass = transition + '-appear-active';
    } else {
        enterClass = transition + '-enter';
        enterActiveClass = transition + '-enter-active';
    }

    o.isAppear = isAppear;
    o.enterClass = enterClass;
    o.enterActiveClass = enterActiveClass;
    o.leaveClass = transition + '-leave';
    o.leaveActiveClass = transition + '-leave-active';
    o.moveClass = transition + '-move';
    o.enterEventName = isAppear ? 'a:appear' : 'a:enter';

    if (oldValue) {
        element.className = element.className.replace(new RegExp('\\b(' + oldValue + '(?=\\-(appear|enter|leave|move)))', 'g'), newValue);
    }
}

function addEnterEndCallback(o) {
    var element = o.element,
        parentInstance = o.parentInstance;


    o._enterEnd = function (e) {
        if (e && e.target !== element) return;

        if (o.get('a:css') && !o.get('a:disabled')) {
            e && e.stopPropagation && e.stopPropagation();
            removeClass(element, o.enterClass);
            removeClass(element, o.enterActiveClass);
        }

        TransitionEvents.off(element, o._enterEnd);
        o._entering = false;

        if (parentInstance) {
            if (--parentInstance._enteringAmount === 0 && parentInstance.get('a:mode') === 'in-out') {
                nextFrame(function () {
                    checkMode(parentInstance);
                });
            }
        }

        o.trigger(o.enterEventName + 'End', element);
    };
}

function addUnmountCallback(o, vNode) {
    var element = o.element,
        parentInstance = o.parentInstance;


    element._unmount = function (nouse, parentDom) {
        // 如果该元素是延迟mount的元素，则直接删除
        if (o._delayEnter) {
            parentDom.removeChild(element);
            o.destroy(vNode);
            parentInstance._enteringAmount--;

            return;
        }

        var isNotAnimate = !o.get('a:css') && !hasJsTransition(o) || o.get('a:disabled');

        o.vNode = vNode;
        o.parentDom = parentDom;

        if (parentInstance && !isNotAnimate) {
            parentInstance._leavingAmount++;
            if (parentInstance.get('a:mode') === 'in-out') {
                parentInstance.updateChildren.push(o);
                o._delayLeave = true;
            } else {
                parentInstance.unmountChildren.push(o);
            }
            parentInstance.children.push(o);
        } else if (isNotAnimate) {
            parentDom.removeChild(element);
            o.destroy(vNode);
        } else {
            leave(o);
        }
    };
}

function animateList(o) {
    var element = o.element,
        isAppear = o.isAppear,
        parentInstance = o.parentInstance;


    if (isAppear || !o.isRender) {
        if (o.lastInstance && o.lastInstance._delayLeave) {
            parentInstance.updateChildren.push(o);
        } else {
            parentInstance._enteringAmount++;
            // 如果没有unmount的元素，则直接enter
            if (parentInstance._leavingAmount > 0 && parentInstance.get('a:mode') === 'out-in') {
                o._delayEnter = true;
                element.style.display = 'none';
            } else {
                parentInstance.mountChildren.push(o);
            }
        }
    }

    parentInstance.children.push(o);
}

function getParentAnimate(o) {
    // 根节点为Animate，不存在parentVNode
    if (!o.parentVNode) return;

    // o.parentVNode是animate的tag，所以要拿o.parentVNode.parentVNode
    var parentVNode = o.parentVNode.parentVNode;
    if (parentVNode) {
        var parentInstance = parentVNode.children;
        if (parentInstance instanceof o.constructor) {
            return parentInstance;
        }
    }
}

function hasJsTransition(o) {
    var events = o._events;

    for (var key in events) {
        if (key[0] === 'a' && key[1] === ':') {
            if (events[key].length) {
                return true;
            }
        }
    }

    return false;
}

prototype._beforeUpdate = function (lastVNode, vNode) {
    // 更新之前，这里的children不包含本次更新mount进来的元素
    var children = this.children;
    var reservedChildren = [];
    var isMove = this.get('a:move');

    for (var i = 0; i < children.length; i++) {
        var instance = children[i];
        if (!instance._leaving && isMove) {
            instance.position = getPosition(instance);
        }
        if (instance._delayLeave) {
            reservedChildren.push(instance);
            this.updateChildren.push(instance);
        }
    }

    this.children = reservedChildren;
};

prototype._update = function (lastVNode, vNode, isFromCheckMode) {
    var parentInstance = void 0;
    if (!this.get('a:disabled')) {
        parentInstance = this.parentInstance;
        if (parentInstance) {
            parentInstance.updateChildren.push(this);
            parentInstance.children.push(this);
        }
    }

    // 更新之后，这里的children包括当前mount/update/unmount的元素
    var children = this.children;
    // 不存在children，则表示没有子动画元素要管理，直接返回
    if (!children.length) return;

    var mountChildren = this.mountChildren;
    var unmountChildren = this.unmountChildren;
    var updateChildren = this.updateChildren;
    var isMove = this.get('a:move');

    // 如果是in-out模式，但是没有元素enter，则直接leave
    if (!isFromCheckMode && this._enteringAmount === 0 && parentInstance && parentInstance.get('a:mode') === 'in-out') {
        for (var i = 0; i < updateChildren.length; i++) {
            var instance = updateChildren[i];
            if (instance._delayLeave) {
                unmountChildren.push(instance);
                updateChildren.splice(i, 1);
                instance._delayLeave = false;
                i--;
            }
        }
    }

    // 进行mount元素的进入动画
    // 因为存在moving元素被unmount又被mount的情况
    // 所以最先处理
    if (isMove) {
        mountChildren.forEach(function (instance) {
            // 如果当前元素是从上一个unmount的元素来的，
            // 则要初始化最新位置，因为beforeUpdate中
            // 不包括当前mount元素的位置初始化
            // 这样才能保持位置的连贯性
            if (instance.lastInstance) {
                instance.position = getPosition(instance);
            }
        });
    }
    mountChildren.forEach(function (instance) {
        return enter(instance);
    });

    // 先将之前的动画清空
    // 只有既在move又在enter的unmount元素才清空动画
    // 这种情况保持不了连贯性
    if (isMove) {
        unmountChildren.forEach(function (instance) {
            if (instance._moving) {
                instance._moveEnd();
                if (instance._entering) {
                    instance._enterEnd();
                }
            }
        });

        // 对于更新的元素，如果正在move，则将位置清空，以便确定最终位置
        updateChildren.forEach(function (instance) {
            if (instance._moving) {
                var s = instance.element.style;
                s.left = s.top = '';
            }
        });

        // 将要删除的元素，设为absolute，以便确定其它元素最终位置
        unmountChildren.forEach(function (instance) {
            instance.element.style.position = 'absolute';
        });

        // 获取所有元素的新位置
        children.forEach(function (instance) {
            instance.newPosition = getPosition(instance);
        });

        // 分别判断元素是否需要移动，并保持当前位置不变
        // unmount的元素，从当前位置直接leave，不要move了
        unmountChildren.forEach(function (instance) {
            return initMove(instance, true);
        });
        updateChildren.forEach(function (instance) {
            return initMove(instance);
        });
        mountChildren.forEach(function (instance) {
            return initMove(instance);
        });

        // 对于animation动画，enterEnd了entering元素
        // 需要re-layout，来触发move动画
        document.body.offsetWidth;

        // 如果元素需要移动，则进行move动画
        children.forEach(function (instance) {
            if (instance._needMove) {
                if (!instance._moving) {
                    move(instance);
                } else {
                    // 如果已经在移动了，那直接改变translate，保持动画连贯
                    triggerMove(instance);
                }
            }
        });
    }

    // unmount元素做leave动画
    unmountChildren.forEach(function (instance) {
        return leave(instance);
    });

    this.mountChildren = [];
    this.updateChildren = [];
    this.unmountChildren = [];
};

function initMove(o, isUnmount) {
    var element = o.element,
        oldPosition = o.position,
        newPosition = o.newPosition;


    o.position = newPosition;

    // 对于新mount的元素，不进行move判断
    if (!oldPosition) return;

    var dx = oldPosition.left - newPosition.left;
    var dy = oldPosition.top - newPosition.top;
    var oDx = o.dx;
    var oDy = o.dy;

    o.dx = dx;
    o.dy = dy;

    if (dx || dy || oDx || oDy) {
        // 对于move中的元素，需要将它重新回到0
        var s = element.style;
        if (isUnmount) {
            s.left = oldPosition.left + 'px';
            s.top = oldPosition.top + 'px';
            o._needMove = false;
        } else {
            // 如果当前元素正在enter，而且是animation动画，则要enterEnd
            // 否则无法move
            if (o._entering && getAnimateType(element) !== 'transition') {
                o._enterEnd();
            }
            o._needMove = true;
            s.position = 'relative';
            s.left = dx + 'px';
            s.top = dy + 'px';
        }
    } else {
        o._needMove = false;
    }
}

function move(o) {
    if (o.get('a:disabled')) return;

    o._moving = true;

    var element = o.element;
    var s = element.style;

    addClass(element, o.moveClass);

    o._moveEnd = function (e) {
        e && e.stopPropagation();
        if (!e || /transform$/.test(e.propertyName)) {
            TransitionEvents.off(element, o._moveEnd);
            removeClass(element, o.moveClass);
            s.position = s.left = s.top = s.transform = s.WebkitTransform = '';
            o.dx = o.dy = 0;
            o._moving = false;
        }
    };
    TransitionEvents.on(element, o._moveEnd);

    triggerMove(o);
    // nextFrame(() => o._triggerMove());
}

function triggerMove(o) {
    var s = o.element.style;
    s.transform = s.WebkitTransform = 'translate(' + (0 - o.dx) + 'px, ' + (0 - o.dy) + 'px)';
}

function getPosition(o) {
    var element = o.element;
    var style = getComputedStyle(element);
    var transform = style.transform || style.WebkitTransform;

    if (transform === 'none') {
        return {
            top: element.offsetTop,
            left: element.offsetLeft
        };
    }

    // const transform = element.style.transform;
    var matrix = new CSSMatrix(transform);
    return {
        top: element.offsetTop + matrix.m42,
        left: element.offsetLeft + matrix.m41
    };
}

var Animate = Intact$2.extend(prototype);

Intact$2.prototype.Animate = Animate;
Intact$2.Animate = Animate;
Intact$2.Vdt = Vdt$1;
Intact$2.utils = utils;
Vdt$1.configure({
    getModel: function getModel(self, key) {
        return self.get(key);
    },
    setModel: function setModel(self, key, value) {
        // self.set(key, value, {async: true});
        self.set(key, value);
    }
});

return Intact$2;

})));
