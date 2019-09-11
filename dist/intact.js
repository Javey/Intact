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
    indeterminate: true,
    multiple: true
};

var strictProps = {
    volume: true,
    defaultChecked: true,
    value: true,
    htmlFor: true,
    scrollLeft: true,
    scrollTop: true
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
    // if done is true, it indicate that this queue should be discarded
    this.done = false;
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
    this.done = true;
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
    } else if (~ua.indexOf('trident/')) {
        browser.isIE = true;
        var rv = ua.indexOf('rv:');
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

var hooks = {
    beforeInsert: null
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

    JSXDirective: i++,
    JSXTemplate: i++,

    JSXString: i++
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
    disableSplitText: false, // split text with <!---->
    sourceMap: false,
    indent: '    ' // code indent style
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

function isWhiteSpaceExpectLinebreak(charCode) {
    return charCode !== 10 && // \n
    charCode !== 13 && // \r
    isWhiteSpace(charCode);
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

var slice = Array.prototype.slice;

// in ie8 console.log is an object
var hasConsole = typeof console !== 'undefined' && typeof console.log === 'function';
var error$2 = hasConsole ? function (e) {
    console.error(e.stack);
} : noop;



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
	isWhiteSpaceExpectLinebreak: isWhiteSpaceExpectLinebreak,
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
	slice: slice,
	hasConsole: hasConsole,
	error: error$2
});

/**
 * @fileoverview parse jsx to ast
 * @author javey
 * @date 15-4-22
 */

var Type$1 = Type;
var TypeName$1 = TypeName;

var elementNameRegexp = /^<\w+:?\s*[\{\w\/>]/;
// const importRegexp = /^\s*\bimport\b/;

function isJSIdentifierPart(ch) {
    return ch === 95 || ch === 36 || // _ (underscore) $
    ch >= 65 && ch <= 90 || // A..Z
    ch >= 97 && ch <= 122 || // a..z
    ch >= 48 && ch <= 57; // 0..9
}

function isJSXIdentifierPart(ch) {
    return ch === 58 || ch === 45 || ch === 46 || isJSIdentifierPart(ch); // : - .
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
        this.column = 0;
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
            Delimiters = this.options.delimiters,
            element = this._type(Type$1.JS);

        while (this.index < this.length) {
            this._skipJSComment();
            var ch = this._char();
            var tmp;
            if (ch === '\'' || ch === '"' || ch === '`' ||
            // is a RegExp, treat it as literal sting
            ch === '/' && (
            // is not /* and //, this is comment
            tmp = this._char(this.index + 1)) && tmp !== '*' && tmp !== '/' && (
            // is the first char
            this.index === 0 ||
            // is not </, this is a end tag
            (tmp = this._char(this.index - 1)) && tmp !== '<' && (
            // is not a sign of division
            // FIXME: expect `if (a > 1) /test/`
            tmp = this._getLastCharCode()) && !isJSIdentifierPart(tmp) && tmp !== 41 // )
            )) {
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

        element.value = this.source.slice(start, this.index);

        return element;
    },

    _scanJSImport: function _scanJSImport() {
        var start = this.index,
            element = this._type(Type$1.JSImport);

        this._updateIndex(7); // 'import '.length
        while (this.index < this.length) {
            var ch = this._char();
            if (ch === '\'' || ch === '"') {
                this._scanStringLiteral();
                var _start2 = void 0;
                do {
                    _start2 = this.index;
                    this._skipWhitespaceAndJSComment();
                    if (this._char() === ';') {
                        this._updateIndex();
                    }
                } while (_start2 !== this.index);
                break;
            } else {
                this._updateIndex();
            }
        }

        element.value = this.source.slice(start, this.index);

        return element;
    },


    _scanStringLiteral: function _scanStringLiteral() {
        var quote = this._char(),
            start = this.index,
            str = '',
            element = this._type(Type$1.StringLiteral);

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

        element.value = this.source.slice(start, this.index);

        return element;
    },

    _scanJSX: function _scanJSX() {
        return this._parseJSXElement();
    },

    _scanJSXText: function _scanJSXText(stopChars) {
        var start = this.index,
            l = stopChars.length,
            i,
            charCode,
            element = this._type(Type$1.JSXText);

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

        element.value = this.source.slice(start, this.index);

        return element;
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
            flag = this._charCode();

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

        return this._parseAttributeAndChildren(ret, prev);
    },

    _parseAttributeAndChildren: function _parseAttributeAndChildren(ret, prev) {
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
            if (isTextTag(ret.value)) {
                // if it is a text element, treat children as innerHTML attribute
                var attr = this._type(Type$1.JSXAttribute, {
                    name: 'innerHTML',
                    value: this._type(Type$1.JSXString)
                });
                var children = this._parseJSXChildren(ret, ret.hasVRaw);
                if (children.length) {
                    attr.value.value = children;
                    ret.attributes.push(attr);
                }
            } else {
                ret.children = this._parseJSXChildren(ret, ret.hasVRaw);
            }
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
        var line = this.line;
        var column = this.column;
        var element = void 0;

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
            element = this._type(Type$1.JSXDirective, { name: name });
            this._parseJSXAttributeVIf(ret, element, prev);
        } else {
            element = this._type(Type$1.JSXAttribute, { name: name });
        }
        element.line = line;
        element.column = column;

        return element;
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
            Delimiters = this.options.delimiters,
            element = this._type(Type$1.JSXExpressionContainer);

        this._expect(Delimiters[0]);
        this._skipWhitespaceAndJSComment();
        if (this._isExpect(Delimiters[1])) {
            expression = [this._parseJSXEmptyExpression()];
        } else if (this._isExpect('=')) {
            // if the lead char is '=', then treat it as unescape string
            this._skipWhitespace();
            expression = this._parseJSXUnescapeText();
            this._expect(Delimiters[1], 'Unclosed delimiter', expression);
            return expression;
        } else {
            expression = this._parseExpression();
        }
        this._expect(Delimiters[1], 'Unclosed delimiter', element);

        element.value = expression;

        return element;
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

    _parseJSXChildren: function _parseJSXChildren(element, hasVRaw) {
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
        this._parseJSXClosingElement(endTag, element);

        // ignore skipped child
        var ret = [];
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (!child.skip) {
                ret.push(child);
            }
        }

        return ret;
    },

    _parseJSXChild: function _parseJSXChild(element, endTag, prev) {
        var ret,
            Delimiters = this.options.delimiters;

        if (this._isExpect(Delimiters[0])) {
            ret = this._parseJSXExpressionContainer();
            this._skipWhitespaceBetweenElements(endTag, false);
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

    _parseJSXClosingElement: function _parseJSXClosingElement(endTag, element) {
        this._expect('</', 'Unclosed tag: ' + endTag, element);

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
        var start = this.index,
            element = this._type(Type$1.JSXComment);

        while (this.index < this.length) {
            if (this._isExpect('-->')) {
                break;
            } else if (this._charCode() === 10) {
                this._updateLine();
            }
            this._updateIndex();
        }
        element.value = this.source.slice(start, this.index);
        this._expect('-->');

        return element;
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
        var skipBeforeDelimiter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        if (!this.options.skipWhitespace) return;

        var Delimiters = this.options.delimiters;
        var start = this.index;
        while (start < this.length) {
            var code = this._charCode(start);
            if (isWhiteSpace(code)) {
                start++;
            } else if (this._isExpect(endTag, start) || this._isElementStart(start) ||
            // skip whitespaces between after element starting and expression
            // but not skip before element ending 
            skipBeforeDelimiter && this._isExpect(Delimiters[0], start)) {
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
        var start = void 0;
        do {
            start = this.index;
            if (this._char() === '/') {
                var ch = this._char(this.index + 1);
                if (ch === '/') {
                    this._updateIndex(2);
                    while (this.index < this.length) {
                        var code = this._charCode();
                        this._updateIndex();
                        if (code === 10) {
                            // is \n
                            this._updateLine();
                            break;
                        }
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
        } while (start !== this.index);
    },

    _skipWhitespaceAndJSComment: function _skipWhitespaceAndJSComment() {
        var start = void 0;
        do {
            start = this.index;
            this._skipWhitespace();
            this._skipJSComment();
        } while (start !== this.index);
    },

    _expect: function _expect(str, msg, element) {
        if (!this._isExpect(str)) {
            this._error(msg || 'Expect string ' + str, element);
        }
        this._updateIndex(str.length);
    },

    _isExpect: function _isExpect(str) {
        var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.index;

        return this.source.slice(index, index + str.length) === str;
    },

    _isElementStart: function _isElementStart() {
        var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.index;

        return this._char(index) === '<' && (this._isExpect('<!--', index) || elementNameRegexp.test(this.source.slice(index)));
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
        // because we call _updateLine firstly then call _updateIndex
        // it will add column in _updateIndex
        // set it to -1 here
        this.column = -1;
    },

    _updateIndex: function _updateIndex(value) {
        value === undefined && (value = 1);
        var index = this.index;
        this.index = this.index + value;
        this.column = this.column + value;
        return index;
    },

    _error: function _error(msg, element) {
        var lines = this.source.split('\n');

        var _ref = element || this,
            line = _ref.line,
            column = _ref.column;

        column++;
        var error$$1 = new Error(msg + ' (' + line + ':' + column + ')\n' + ('> ' + line + ' | ' + lines[line - 1] + '\n') + ('  ' + new Array(String(line).length + 1).join(' ') + ' | ' + new Array(column).join(' ') + '^'));
        error$$1.line = line;
        error$$1.column = column;
        error$$1.source = this.source;

        throw error$$1;
    },

    _getLastCharCode: function _getLastCharCode() {
        var start = this.index - 1;
        var _start = void 0;
        do {
            _start = start;
            while (start >= 0) {
                var code = this._charCode(start);
                if (!isWhiteSpaceExpectLinebreak(code)) {
                    break;
                }
                start--;
            }

            // only check multi-line comments '/* comment */'
            while (start >= 0) {
                if (this._char(start) === '/' && this._char(start - 1) === '*') {
                    start -= 2;
                    while (start >= 0) {
                        if (this._char(start) === '*' && this._char(start - 1) === '/') {
                            start -= 2;
                            break;
                        }
                        start--;
                    }
                }
                break;
            }
        } while (start !== _start);

        return this._charCode(start);
    }
};

/**
 * @fileoverview stringify ast of jsx to js
 * @author javey
 * @date 15-4-22
 */

var Type$2 = Type;


var attrMap = function () {
    var map$$1 = {
        'class': 'className',
        'for': 'htmlFor'
    };
    return function (name) {
        return map$$1[name] || name;
    };
}();

function Stringifier() {}

Stringifier.prototype = {
    constructor: Stringifier,

    stringify: function stringify(ast, options) {
        this._init(options);

        this._start(ast);

        return this.buffer.join('');
    },

    /**
     * @brief for unit test to get body
     *
     * @param ast
     * @param options
     */
    body: function body(ast, options) {
        this._init(options);

        this._visitJSXExpressionContainer(ast, true);

        return this.buffer.join('');
    },
    _init: function _init(options) {
        this.options = extend({}, configure(), options);

        this.enterStringExpression = false;
        this.head = ''; // save import syntax

        this.indent = 0;

        this.buffer = [];
        this.queue = [];
        this.mappings = [];

        this.line = 1;
        this.column = 0;
    },
    _start: function _start(ast) {
        var _this = this;

        this._append('function(obj, _Vdt, blocks, $callee) {\n');
        this._indent();
        var params = ['_Vdt || (_Vdt = Vdt);', 'obj || (obj = {});', 'blocks || (blocks = {});', 'var h = _Vdt.miss.h, hc = _Vdt.miss.hc, hu = _Vdt.miss.hu, widgets = this && this.widgets || {}, _blocks = {}, __blocks = {},', '    __u = _Vdt.utils, extend = __u.extend, _e = __u.error, _className = __u.className, __slice = __u.slice, __noop = __u.noop,', '    __m = __u.map, __o = __u.Options, _getModel = __o.getModel, _setModel = __o.setModel,', '    _setCheckboxModel = __u.setCheckboxModel, _detectCheckboxChecked = __u.detectCheckboxChecked,', '    _setSelectModel = __u.setSelectModel,', this.options.server ? '    require = function(file) { return _Vdt.require(file, "' + this.options.filename.replace(/\\/g, '\\\\') + '    ") }, ' : undefined, '    self = this.data, $this = this, scope = obj, Animate = self && self.Animate, parent = ($callee || {})._super;'];

        each(params, function (code) {
            if (code) {
                _this._append(code);
                _this._append('\n');
            }
        });

        this._append('\n');

        if (!this.options.noWith) {
            this._append('with (obj) {\n');
            this._indent();
            this._visitJSXExpressionContainer(ast, true);
            this._append('\n');
            this._dedent();
            this._append('}\n');
        } else {
            this._visitJSXExpressionContainer(ast, true);
            this._append('\n');
        }
        this._dedent();
        this._append('}');
    },


    _visitJSXExpressionContainer: function _visitJSXExpressionContainer(ast, isRoot) {
        var length = ast.length;
        var addWrapper = false;
        var hasDestructuring = false;

        if (!isRoot && !this.enterStringExpression) {
            var element = ast[0];
            if (element && element.type === Type$2.JS) {
                // special for ... syntaxt
                var value = element.value;
                if (value[0] === '.' && value[1] === '.' && value[2] === '.') {
                    hasDestructuring = true;
                    element.value = value.substr(3);
                    this._append('...');
                }
            }

            this._append('function() {try {return (');
            addWrapper = true;
        }

        each(ast, function (element, i) {
            // if is root, add `return` keyword
            if (this.options.autoReturn && isRoot && i === length - 1) {
                this._append('return ');
            }

            this._visit(element, isRoot);
        }, this);

        if (addWrapper) {
            this._append(')} catch(e) {_e(e)}}.call($this)');
        }
    },

    _visit: function _visit(element, isRoot) {
        element = element || {};
        switch (element.type) {
            case Type$2.JS:
                return this._visitJS(element);
            case Type$2.JSImport:
                return this._visitJSImport(element);
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
            case Type$2.JSXTemplate:
                return this._visitJSXTemplate(element);
            case Type$2.JSXString:
                return this._visitJSXString(element);
            default:
                return this._append('null');
        }
    },

    _visitJS: function _visitJS(element) {
        var ret = this.enterStringExpression ? '(' + element.value + ')' : element.value;

        this._append(ret, element);
    },

    _visitJSImport: function _visitJSImport(element) {
        this.head += element.value;
    },


    _visitJSXElement: function _visitJSXElement(element) {
        var _this2 = this;

        if (element.value === 'template') {
            // <template> is a fake tag, we only need handle its children and itself directives
            this._visitJSXDirective(element, function () {
                _this2._visitJSXChildren(element.children);
            });
        } else {
            this._visitJSXDirective(element, function () {
                _this2.__visitJSXElement(element);
            });
        }
    },

    __visitJSXElement: function __visitJSXElement(element) {
        this._append('h(\'' + element.value + '\'', element);

        this._appendQueue(', ');

        var _visitJSXAttribute = this._visitJSXAttribute(element, true, true, true /* appendQueue */),
            attributes = _visitJSXAttribute.attributes;

        this._appendQueue(', ');
        this._visitJSXChildren(element.children, true /* appendQueue */);

        this._appendQueue(', ');
        if (attributes.className) {
            this._visitJSXAttributeClassName(attributes.className);
        } else {
            this._appendQueue('null');
        }

        this._appendQueue(', ');
        if (attributes.key) {
            this._visitJSXAttributeValue(attributes.key);
        } else {
            this._appendQueue('null');
        }

        this._appendQueue(', ');
        if (attributes.ref) {
            this._visitJSXAttributeRef(attributes.ref);
        }

        this._clearQueue();
        this._append(')');
    },


    _visitJSXChildren: function _visitJSXChildren(children, appendQueue) {
        var length = children.length;
        if (!length) {
            if (appendQueue) {
                this._appendQueue('null');
            } else {
                this._append('null');
            }
        }
        if (length > 1) {
            this._append('[\n');
            this._indent();
        }
        each(children, function (child, index) {
            this._visit(child);
            if (index !== length - 1) {
                this._append(',\n');
            }
        }, this);
        if (length > 1) {
            this._append('\n');
            this._dedent();
            this._append(']');
        }
    },

    _visitJSXDirective: function _visitJSXDirective(element, body) {
        var _this3 = this;

        var directiveFor = {};
        var directiveIf = void 0;

        each(element.directives, function (directive) {
            switch (directive.name) {
                case 'v-if':
                    directiveIf = directive;
                    break;
                case 'v-for':
                    directiveFor.data = directive.value;
                    break;
                case 'v-for-value':
                    directiveFor.value = directive.value;
                    break;
                case 'v-for-key':
                    directiveFor.key = directive.value;
                    break;
                default:
                    break;
            }
        }, this);

        // handle v-for firstly
        if (directiveFor.data) {
            if (directiveIf) {
                this._visitJSXDirectiveFor(directiveFor, element, function () {
                    _this3._visitJSXDirectiveIf(directiveIf, element, body);
                });
            } else {
                this._visitJSXDirectiveFor(directiveFor, element, body);
            }
        } else if (directiveIf) {
            this._visitJSXDirectiveIf(directiveIf, element, body);
        } else {
            body();
        }
    },

    _visitJSXDirectiveIf: function _visitJSXDirectiveIf(directive, element, body) {
        var hasElse = false,
            next = element,
            indent = this.indent;

        this._visitJSXAttributeValue(directive.value);
        this._append(' ?\n');
        this._indent();
        body();
        this._append(' :\n');

        while (next = next.next) {
            var nextDirectives = next.directives;

            if (!nextDirectives) break;

            var velseif = nextDirectives['v-else-if'];
            if (velseif) {
                this._visitJSXAttributeValue(velseif.value);
                this._append(' ?\n');
                this._indent();
                this._visit(next);
                this._append(' :\n');
                continue;
            }
            if (nextDirectives['v-else']) {
                this._visit(next);
                hasElse = true;
            }

            break;
        }

        if (!hasElse) this._append('undefined');

        this.indent = indent;
    },

    _visitJSXDirectiveFor: function _visitJSXDirectiveFor(directive, element, body) {
        this._append('__m(');
        this._visitJSXAttributeValue(directive.data);
        this._append(', function(');
        if (directive.value) {
            this._visitJSXText(directive.value, true);
        } else {
            this._append('value');
        }
        this._append(', ');
        if (directive.key) {
            this._visitJSXText(directive.key, true);
        } else {
            this._append('key');
        }
        this._append(') {\n');
        this._indent();
        this._append('return ');
        body();
        this._append(';\n');
        this._dedent();
        this._append('}, $this)');
    },

    _visitJSXString: function _visitJSXString(element) {
        this.enterStringExpression = true;
        var length = element.value.length;
        each(element.value, function (child, i) {
            this._visit(child);
            if (i !== length - 1) {
                this._append(' + ');
            }
        }, this);
        this.enterStringExpression = false;
    },

    _visitJSXAttribute: function _visitJSXAttribute(element, individualClassName, individualKeyAndRef, appendQueue) {
        var _this4 = this;

        var set = {},
            events = {},

        // support bind multiple callbacks for the same event
        addEvent = function addEvent(name, attr) {
            var v = events[name];
            if (!v) {
                events[name] = [];
            }
            events[name].push(attr);
        },
            attributes = element.attributes,
            models = [],
            addition = {},
            isFirst;

        var addAttribute = function addAttribute(name, attr) {
            if (isFirst === undefined) {
                _this4._append('{\n');
                _this4._indent();
                isFirst = true;
            }
            if (!isFirst) {
                _this4._append(',\n');
            }
            if (name) {
                _this4._append('\'' + name + '\': ', attr);
            }
            isFirst = false;
        };

        each(attributes, function (attr) {
            if (attr.type === Type$2.JSXExpressionContainer) {
                addAttribute();
                this._visitJSXAttributeValue(attr);
                return;
            }

            var name = attrMap(attr.name);

            if (name === 'className') {
                if (!individualClassName) {
                    addAttribute(name, attr);
                    this._visitJSXAttributeClassName(attr.value);
                }
            } else if (name === 'key') {
                if (!individualKeyAndRef) {
                    addAttribute(name, attr);
                    this._visitJSXAttributeValue(attr.value);
                }
            } else if (name === 'widget' || name === 'ref') {
                if (!individualClassName) {
                    addAttribute('ref', attr);
                    this._visitJSXAttributeRef(attr.value);
                }
            } else if (isVModel(name)) {
                var _name$split = name.split(':'),
                    model = _name$split[1];

                if (model === 'value') name = 'v-model';
                if (!model) model = 'value';

                models.push({ name: model, value: attr.value, attr: attr });
            } else if (name === 'v-model-true') {
                addition.trueValue = attr.value;
            } else if (name === 'v-model-false') {
                addition.falseValue = attr.value;
            } else if (name === 'type') {
                // save the type for v-model of input element
                addAttribute('type', attr);
                this._visitJSXAttributeValue(attr.value);
                addition.type = this.last;
            } else if (name === 'value') {
                addAttribute('value', attr);
                this._visitJSXAttributeValue(attr.value);
                addition.value = attr.value;
            } else if (isEventProp(name)) {
                addEvent(name, attr);
            } else if (name === '_blocks') {
                addAttribute('_blocks');
                this._visitJSXBlocks(attr.value, false);
            } else {
                addAttribute(name, attr);
                this._visitJSXAttributeValue(attr.value);
            }

            // for get property directly 
            set[name] = attr.value;
        }, this);

        for (var i = 0; i < models.length; i++) {
            this._visitJSXAttributeModel(element, models[i], addition, addEvent, addAttribute);
        }

        each(events, function (events, name) {
            addAttribute(name, events[0]);

            var length = events.length;
            if (length > 1) {
                _this4._append('[\n');
                _this4._indent();
            }
            for (var _i = 0; _i < length; _i++) {
                var event = events[_i];
                if (typeof event === 'function') {
                    event();
                } else {
                    _this4._visitJSXAttributeValue(event.value);
                }
                if (_i !== length - 1) {
                    _this4._append(',\n');
                }
            }
            if (length > 1) {
                _this4._append('\n');
                _this4._dedent();
                _this4._append(']');
            }
        });

        if (isFirst !== undefined) {
            this._append('\n');
            this._dedent();
            this._append('}');
        } else {
            if (appendQueue) {
                this._appendQueue('null');
            } else {
                this._append('null');
            }
        }

        return { attributes: set, hasProps: isFirst !== undefined };
    },

    _visitJSXAttributeClassName: function _visitJSXAttributeClassName(value) {
        if (value.type === Type$2.JSXExpressionContainer) {
            // for class={ {active: true} }
            this._append('_className(');
            this._visitJSXAttributeValue(value);
            this._append(')');
        } else {
            this._visitJSXAttributeValue(value);
        }
    },
    _visitJSXAttributeRef: function _visitJSXAttributeRef(value) {
        if (value.type === Type$2.JSXText) {
            // for compatility v1.0
            // convert widget="a" to ref=(i) => widgets.a = i
            // convert ref="a" to ref=(i) => widgets.a = i. For Intact
            this._append('function(i) {widgets[');
            this._visitJSXAttributeValue(value);
            this._append('] = i}');
        } else {
            this._visitJSXAttributeValue(value);
        }
    },


    _visitJSXAttributeModel: function _visitJSXAttributeModel(element, model, addition, addEvent, addAttribute) {
        var _this5 = this;

        var valueName = model.name,
            value = model.value,
            eventName = 'change';

        var append = function append() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            for (var i = 0; i < args.length; i++) {
                if (i % 2) {
                    _this5._visitJSXAttributeValue(args[i]);
                } else {
                    _this5._append(args[i]);
                }
            }
        };

        if (element.type === Type$2.JSXElement) {
            switch (element.value) {
                case 'input':
                    switch (addition.type) {
                        case "'file'":
                            eventName = 'change';
                            break;
                        case "'radio'":
                        case "'checkbox'":
                            addAttribute('checked', model.attr);
                            var trueValue = addition.trueValue || { type: Type$2.JS, value: 'true' },
                                falseValue = addition.falseValue || { type: Type$2.JS, value: 'false' },
                                inputValue = addition.value;
                            if (isNullOrUndefined(inputValue)) {
                                append('_getModel(self, ', value, ') === ', trueValue);
                                addEvent('ev-change', function () {
                                    append('function(__e) {_setModel(self, ', value, ', __e.target.checked ? ', trueValue, ' : ', falseValue, ', $this);}');
                                });
                            } else {
                                if (addition.type === "'radio'") {
                                    append('_getModel(self, ', value, ') === ', inputValue);
                                    addEvent('ev-change', function () {
                                        append('function(__e) {_setModel(self, ', value, ', __e.target.checked ? ', inputValue, ' : ', falseValue, ', $this);}');
                                    });
                                } else {
                                    append('_detectCheckboxChecked(self, ', value, ', ', inputValue, ')');
                                    addEvent('ev-change', function () {
                                        append('function(__e) {_setCheckboxModel(self, ', value, ', ', inputValue, ', ', falseValue, ', __e, $this);}');
                                    });
                                }
                            }
                            return;
                        default:
                            eventName = 'input';
                            break;
                    }
                    break;
                case 'select':
                    addAttribute('value', model.attr);
                    append('_getModel(self, ', value, ')');
                    addEvent('ev-change', function () {
                        append('function(__e) {_setSelectModel(self, ', value, ', __e, $this);}');
                    });
                    return;
                case 'textarea':
                    eventName = 'input';
                    break;
                default:
                    break;
            }
            addEvent('ev-' + eventName, function () {
                append('function(__e) { _setModel(self, ', value, ', __e.target.value, $this) }');
            });
        } else if (element.type === Type$2.JSXWidget) {
            addEvent('ev-$change:' + valueName, function () {
                append('function(__c, __n) { _setModel(self, ', value, ', __n, $this) }');
            });
        }
        addAttribute(valueName, model.attr);
        append('_getModel(self, ', value, ')');
    },

    _visitJSXAttributeValue: function _visitJSXAttributeValue(value) {
        isArray(value) ? this._visitJSXChildren(value) : this._visit(value, false);
    },

    _visitJSXText: function _visitJSXText(element, noQuotes) {
        var ret = element.value.replace(/([\'\"\\])/g, '\\$1').replace(/[\r\n]/g, '\\n');
        if (!noQuotes) {
            ret = "'" + ret + "'";
        }

        this._append(ret, element);
    },

    _visitJSXUnescapeText: function _visitJSXUnescapeText(element) {
        this._append('hu(', element);
        this._visitJSXExpressionContainer(element.value);
        this._append(')');
    },

    _visitJSXWidget: function _visitJSXWidget(element) {
        var _this6 = this;

        this._visitJSXDirective(element, function () {
            _this6.__visitJSXWidget(element);
        });
    },


    __visitJSXWidget: function __visitJSXWidget(element) {
        var _getJSXBlocks = this._getJSXBlocks(element),
            blocks = _getJSXBlocks.blocks,
            children = _getJSXBlocks.children;

        if (children.length) {
            element.attributes.push({ name: 'children', value: children });
        }
        element.attributes.push({ name: '_context', value: {
                type: Type$2.JS,
                value: '$this'
            } });
        if (blocks.length) {
            element.attributes.push({ name: '_blocks', value: blocks });
        }

        this._append('h(' + element.value + ', ', element);
        this._visitJSXAttribute(element, false, false);
        this._append(')');
    },

    _visitJSXBlock: function _visitJSXBlock(element, isAncestor) {
        var _this7 = this;

        this._visitJSXDirective(element, function () {
            _this7.__visitJSXBlock(element, isAncestor);
        });
    },

    __visitJSXBlock: function __visitJSXBlock(element, isAncestor) {
        var _getJSXBlockAttribute = this._getJSXBlockAttribute(element),
            params = _getJSXBlockAttribute.params,
            args = _getJSXBlockAttribute.args;

        var name = element.value;

        this._append('(_blocks[\'' + name + '\'] = function(parent', element);
        if (params) {
            this._append(', ');
            this._visitJSXText(params, true);
        }
        this._append(') {\n');
        this._indent();
        this._append('return ');
        this._visitJSXChildren(element.children);
        this._append(';\n');
        this._dedent();
        this._append('}) && (__blocks[\'' + name + '\'] = function(parent) {\n');
        this._indent();
        this._append('var args = arguments;\n');
        this._append('return blocks[\'' + name + '\'] ? blocks[\'' + name + '\'].apply($this, [function() {\n');
        this._indent();
        this._append('return _blocks[\'' + name + '\'].apply($this, args);\n');
        this._dedent();
        this._append('}].concat(__slice.call(args, 1))) : _blocks[\'' + name + '\'].apply($this, args);\n');
        this._dedent();
        this._append('})');
        if (isAncestor) {
            this._append(' && __blocks[\'' + name + '\'].apply($this, ');
            if (args) {
                this._append('[__noop].concat(');
                this._visitJSXAttributeValue(args);
                this._append(')');
            } else {
                this._append('[__noop]');
            }
            this._append(')');
        }
    },


    _getJSXBlockAttribute: function _getJSXBlockAttribute(element) {
        var ret = {};

        each(element.attributes, function (attr) {
            var name = attr.name;
            var value = void 0;
            switch (name) {
                case 'args':
                    ret.args = attr.value;
                    break;
                case 'params':
                    ret.params = attr.value;
                    break;
                default:
                    return;
            }
        }, this);

        return ret;
    },

    _getJSXBlocks: function _getJSXBlocks(element) {
        var blocks = [];
        var children = [];

        each(element.children, function (child) {
            if (child.type === Type$2.JSXBlock) {
                blocks.push(child);
            } else {
                children.push(child);
            }
        }, this);

        return { blocks: blocks, children: children };
    },

    _visitJSXBlocks: function _visitJSXBlocks(blocks, isRoot) {
        var length = blocks.length;
        if (!length) return this._append(isRoot ? 'blocks' : 'null');

        this._append('function(blocks) {\n');
        this._indent();
        this._append('var _blocks = {}, __blocks = extend({}, blocks);\n');
        this._append('return (');

        for (var i = 0; i < length; i++) {
            this._visitJSXBlock(blocks[i], false);
            if (i !== length - 1) {
                this._append(' && ');
            }
        }
        this._append(', __blocks);\n');
        this._dedent();
        this._append('}.call($this, ' + (isRoot ? 'blocks' : '{}') + ')');
    },


    _visitJSXVdt: function _visitJSXVdt(element, isRoot) {
        var _this8 = this;

        this._visitJSXDirective(element, function () {
            _this8.__visitJSXVdt(element, isRoot);
        });
    },

    __visitJSXVdt: function __visitJSXVdt(element, isRoot) {
        var name = element.value;

        var _getJSXBlocks2 = this._getJSXBlocks(element),
            blocks = _getJSXBlocks2.blocks,
            children = _getJSXBlocks2.children;

        if (children.length) {
            element.attributes.push({ name: 'children', value: children });
        }

        this._append('(function() {\n', element);
        this._indent();
        this._append('var _obj = ');

        var _visitJSXAttribute2 = this._visitJSXAttribute(element, false, false),
            attributes = _visitJSXAttribute2.attributes;

        this._append(';\n');
        if (attributes.hasOwnProperty('arguments')) {
            this._append('extend(_obj, _obj.arguments === true ? obj : _obj.arguments);\n');
            this._append('delete _obj.arguments;\n');
        }
        this._append('return ' + name + '.call($this, _obj, _Vdt, ');
        this._visitJSXBlocks(blocks, isRoot);
        this._append(', ' + name + ')\n');
        this._dedent();
        this._append('}).call($this)');
    },


    _visitJSXComment: function _visitJSXComment(element) {
        this._append('hc(');
        this._visitJSXText(element);
        this._append(')');
    },

    _addMapping: function _addMapping(element) {
        this.mappings.push({
            generated: {
                line: this.line,
                column: this.column
            },
            original: element && element.line !== undefined ? {
                line: element.line,
                column: element.column
            } : undefined
        });
    },
    _append: function _append(code, element) {
        var buffer = this.buffer;
        var _options = this.options,
            sourceMap = _options.sourceMap,
            indent = _options.indent;


        this._flushQueue();
        if (sourceMap) {
            this._addMapping(element);
        }

        // add indent if the last line ends with \n
        if (indent && this.indent && this.last && this.last[this.last.length - 1] === '\n' && code[0] !== '\n') {
            buffer.push(new Array(this.indent + 1).join(indent));
            this.column += indent.length * this.indent;
        }

        this.last = code;

        buffer.push(code);

        if (sourceMap) {
            for (var i = 0; i < code.length; i++) {
                if (code[i] === '\n') {
                    this.line++;
                    this.column = 0;
                } else {
                    this.column++;
                }
            }
        }
    },
    _appendQueue: function _appendQueue(code, element) {
        this.queue.push([code, element]);
    },
    _flushQueue: function _flushQueue() {
        var queue = this.queue;
        var item = void 0;
        while (item = queue.shift()) {
            this._append(item[0], item[1]);
        }
    },
    _clearQueue: function _clearQueue() {
        this.queue = [];
    },
    _indent: function _indent() {
        this.indent++;
    },
    _dedent: function _dedent() {
        this.indent--;
    }
};

var Types = {
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
Types.FormElement = Types.InputElement | Types.SelectElement | Types.TextareaElement;
Types.Element = Types.HtmlElement | Types.FormElement | Types.SvgElement;
Types.ComponentClassOrInstance = Types.ComponentClass | Types.ComponentInstance;
Types.TextElement = Types.Text | Types.HtmlComment;

var EMPTY_OBJ = {};
if ('development' !== 'production' && !browser.isIE) {
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
                type = Types.InputElement;
            } else if (tag === 'select') {
                type = Types.SelectElement;
            } else if (tag === 'textarea') {
                type = Types.TextareaElement;
            } else if (tag === 'svg') {
                type = Types.SvgElement;
            } else {
                type = Types.HtmlElement;
            }
            break;
        case 'function':
            if (tag.prototype.init) {
                type = Types.ComponentClass;
            } else {
                // return tag(props);
                type = Types.ComponentFunction;
            }
            break;
        case 'object':
            if (tag.init) {
                return createComponentInstanceVNode(tag);
            }
        default:
            throw new Error('unknown vNode type: ' + tag);
    }

    if (type & (Types.ComponentClass | Types.ComponentFunction)) {
        if (!isNullOrUndefined(children)) {
            if (props === EMPTY_OBJ) props = {};
            props.children = normalizeChildren(children, false);
        } else if (!isNullOrUndefined(props.children)) {
            props.children = normalizeChildren(props.children, false);
        }
        if (type & Types.ComponentFunction) {
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

function createCommentVNode(children, key) {
    return new VNode(Types.HtmlComment, null, EMPTY_OBJ, children, null, key);
}

function createUnescapeTextVNode(children) {
    return new VNode(Types.UnescapeText, null, EMPTY_OBJ, children);
}

function createTextVNode(text, key) {
    return new VNode(Types.Text, null, EMPTY_OBJ, text, null, key);
}



function createComponentInstanceVNode(instance) {
    var props = instance.props || EMPTY_OBJ;
    return new VNode(Types.ComponentInstance, instance.constructor, props, instance, null, props.key, props.ref);
}

function normalizeChildren(vNodes, isAddKey) {
    if (isArray(vNodes)) {
        var childNodes = addChild(vNodes, { index: 0 }, isAddKey);
        return childNodes.length ? childNodes : null;
    } else if (isComponentInstance(vNodes)) {
        return createComponentInstanceVNode(vNodes);
    } else if (vNodes.type && isAddKey) {
        if (!isNullOrUndefined(vNodes.dom) || vNodes.$) {
            return directClone(vNodes);
        }

        // add a flag to indicate that we have handle the vNode
        // when it came back we should clone it
        vNodes.$ = true;
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
            if (isAddKey && (n.dom || n.$)) {
                newVNodes.push(applyKey(directClone(n), reference, isAddKey));
            } else {
                newVNodes.push(applyKey(n, reference, isAddKey));
            }
        }
    }
    return newVNodes || vNodes;
}

function directClone(vNode, extraProps) {
    var newVNode = void 0;
    var type = vNode.type;

    if (type & (Types.ComponentClassOrInstance | Types.Element)) {
        // maybe we does not shadow copy props
        var props = vNode.props || EMPTY_OBJ;
        if (extraProps) {
            // if exist extraProps, shadow copy
            var _props = {};
            for (var key in props) {
                _props[key] = props[key];
            }
            for (var _key in extraProps) {
                _props[_key] = extraProps[_key];
            }
            var children = extraProps.children;
            if (children) {
                _props.children = normalizeChildren(children, false);
            }

            newVNode = new VNode(type, vNode.tag, _props, vNode.children, _props.className || vNode.className, _props.key || vNode.key, _props.ref || vNode.ref);
        } else {
            newVNode = new VNode(type, vNode.tag, props, vNode.children, vNode.className, vNode.key, vNode.ref);
        }
    } else if (type & Types.Text) {
        newVNode = createTextVNode(vNode.children, vNode.key);
    } else if (type & Types.HtmlComment) {
        newVNode = createCommentVNode(vNode.children, vNode.key);
    }

    return newVNode;
}

function preventDefault() {
    this.returnValue = false;
}

function stopPropagation() {
    this.cancelBubble = true;
    this.stopImmediatePropagation && this.stopImmediatePropagation();
}

var addEventListener = void 0;
var removeEventListener = void 0;
function fixEvent(fn) {
    return function (event) {
        // for compatibility
        event._rawEvent = event;

        event.stopPropagation = stopPropagation;
        if (!event.preventDefault) {
            event.preventDefault = preventDefault;
        }
        fn(event);
    };
}
if ('addEventListener' in doc) {
    addEventListener = function addEventListener(dom, name, fn) {
        fn._$cb = fixEvent(fn);
        dom.addEventListener(name, fn._$cb, false);
    };

    removeEventListener = function removeEventListener(dom, name, fn) {
        dom.removeEventListener(name, fn._$cb || fn);
    };
} else {
    addEventListener = function addEventListener(dom, name, fn) {
        fn._$cb = fixEvent(fn);
        dom.attachEvent('on' + name, fn._$cb);
    };

    removeEventListener = function removeEventListener(dom, name, fn) {
        dom.detachEvent('on' + name, fn._$cb || fn);
    };
}

var delegatedEvents = {};
var unDelegatesEvents = {
    'mouseenter': true,
    'mouseleave': true,
    'propertychange': true,
    'scroll': true,
    'wheel': true
};

// change event can not be deletegated in IE8 
if (browser.isIE8) {
    unDelegatesEvents.change = true;
}

function handleEvent(name, lastEvent, nextEvent, dom) {
    // debugger;
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
            if (isArray(lastEvent)) {
                for (var i = 0; i < lastEvent.length; i++) {
                    if (lastEvent[i]) {
                        removeEventListener(dom, name, lastEvent[i]);
                    }
                }
            } else {
                removeEventListener(dom, name, lastEvent);
            }
        }
        if (nextEvent) {
            if (isArray(nextEvent)) {
                for (var _i = 0; _i < nextEvent.length; _i++) {
                    if (nextEvent[_i]) {
                        addEventListener(dom, name, nextEvent[_i]);
                    }
                }
            } else {
                addEventListener(dom, name, nextEvent);
            }
        }
    }
}

function dispatchEvent(event, target, items, count, isClick, eventData) {
    // if event has cancelled bubble, return directly  
    // otherwise it is also triggered sometimes, e.g in React
    if (event.cancelBubble) {
        return;
    }

    var eventToTrigger = items.get(target);
    if (eventToTrigger) {
        count--;
        eventData.dom = target;
        // for fallback when Object.defineProperty is undefined
        event._currentTarget = target;
        if (isArray(eventToTrigger)) {
            for (var i = 0; i < eventToTrigger.length; i++) {
                var _eventToTrigger = eventToTrigger[i];
                if (_eventToTrigger) {
                    _eventToTrigger(event);
                }
            }
        } else {
            eventToTrigger(event);
        }
    }
    if (count > 0) {
        var parentDom = target.parentNode;
        if (isNullOrUndefined(parentDom) || isClick && parentDom.nodeType === 1 && parentDom.disabled) {
            return;
        }
        dispatchEvent(event, parentDom, items, count, isClick, eventData);
    }
}

function attachEventToDocument(name, delegatedRoots) {
    var docEvent = function docEvent(event) {
        var count = delegatedRoots.items.size;
        if (count > 0) {
            var eventData = {
                dom: doc
            };
            try {
                Object.defineProperty(event, 'currentTarget', {
                    configurable: true,
                    get: function get() {
                        return eventData.dom;
                    }
                });
            } catch (e) {}
            // ie8

            // nt._rawEvent = event
            dispatchEvent(event, event.target, delegatedRoots.items, count, event.type === 'click', eventData);
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
    if (vNode.type & Types.HtmlElement) {
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
    if (type & Types.InputElement) {
        processInput(vNode, dom, nextProps, isRender);
    } else if (type & Types.TextareaElement) {
        processTextarea(vNode, dom, nextProps, isRender);
    } else if (type & Types.SelectElement) {
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
    if (type & Types.Element) {
        return createHtmlElement(vNode, parentDom, mountedQueue, isRender, parentVNode, isSVG);
    } else if (type & Types.Text) {
        return createTextElement(vNode, parentDom);
    } else if (type & Types.ComponentClassOrInstance) {
        return createComponentClassOrInstance(vNode, parentDom, mountedQueue, null, isRender, parentVNode, isSVG);
        // } else if (type & Types.ComponentFunction) {
        // return createComponentFunction(vNode, parentDom, mountedQueue, isNotAppendChild, isRender);
        // } else if (type & Types.ComponentInstance) {
        // return createComponentInstance(vNode, parentDom, mountedQueue);
    } else if (type & Types.HtmlComment) {
        return createCommentElement(vNode, parentDom);
    } else {
        throw new Error('expect a vNode but got ' + vNode);
    }
}

function createHtmlElement(vNode, parentDom, mountedQueue, isRender, parentVNode, isSVG) {
    var type = vNode.type;

    isSVG = isSVG || (type & Types.SvgElement) > 0;

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

    if (hooks.beforeInsert) {
        hooks.beforeInsert(vNode);
    }

    // in IE8, the select value will be set to the first option's value forcely
    // when it is appended to parent dom. We change its value in processForm does not
    // work. So processForm after it has be appended to parent dom.
    if (parentDom) {
        appendChild(parentDom, dom);
    }
    if (props !== EMPTY_OBJ) {
        patchProps(null, vNode, isSVG, true);
    }

    var ref = vNode.ref;
    if (!isNullOrUndefined(ref)) {
        createRef(dom, ref, mountedQueue);
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

function createOrHydrateComponentClassOrInstance(vNode, parentDom, mountedQueue, lastVNode, isRender, parentVNode, isSVG, createDom) {
    var props = vNode.props;
    var instance = vNode.type & Types.ComponentClass ? new vNode.tag(props) : vNode.children;
    instance.parentDom = parentDom;
    instance.mountedQueue = mountedQueue;
    instance.isRender = isRender;
    instance.parentVNode = parentVNode;
    instance.isSVG = isSVG;
    instance.vNode = vNode;
    vNode.children = instance;
    vNode.parentVNode = parentVNode;

    var dom = createDom(instance);
    var ref = vNode.ref;

    vNode.dom = dom;

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

function createComponentClassOrInstance(vNode, parentDom, mountedQueue, lastVNode, isRender, parentVNode, isSVG) {
    return createOrHydrateComponentClassOrInstance(vNode, parentDom, mountedQueue, lastVNode, isRender, parentVNode, isSVG, function (instance) {
        var dom = instance.init(lastVNode, vNode);
        if (parentDom) {
            appendChild(parentDom, dom);
        }

        return dom;
    });
}

// export function createComponentFunction(vNode, parentDom, mountedQueue) {
// const props = vNode.props;
// const ref = vNode.ref;

// createComponentFunctionVNode(vNode);

// let children = vNode.children;
// let dom;
// // support ComponentFunction return an array for macro usage
// if (isArray(children)) {
// dom = [];
// for (let i = 0; i < children.length; i++) {
// dom.push(createElement(children[i], parentDom, mountedQueue));
// }
// } else {
// dom = createElement(vNode.children, parentDom, mountedQueue);
// }
// vNode.dom = dom;

// // if (parentDom) {
// // parentDom.appendChild(dom);
// // }

// if (ref) {
// createRef(dom, ref, mountedQueue);
// }

// return dom;
// }

function createCommentElement(vNode, parentDom) {
    var dom = doc.createComment(vNode.children);
    vNode.dom = dom;

    if (parentDom) {
        parentDom.appendChild(dom);
    }

    return dom;
}

// export function createComponentFunctionVNode(vNode) {
// let result = vNode.tag(vNode.props);
// if (isStringOrNumber(result)) {
// result = createTextVNode(result);
// } else if ('development' !== 'production') {
// if (isArray(result)) {
// throw new Error(`ComponentFunction ${vNode.tag.name} returned a invalid vNode`);
// }
// }

// vNode.children = result;

// return vNode;
// }

function createElements(vNodes, parentDom, mountedQueue, isRender, parentVNode, isSVG) {
    if (isStringOrNumber(vNodes)) {
        setTextContent(parentDom, vNodes);
    } else if (isArray(vNodes)) {
        var cloned = false;
        for (var i = 0; i < vNodes.length; i++) {
            var child = vNodes[i];
            if (child.dom) {
                if (!cloned) {
                    parentVNode.children = vNodes = vNodes.slice(0);
                    cloned = true;
                }
                vNodes[i] = child = directClone(child);
            }
            createElement(child, parentDom, mountedQueue, isRender, parentVNode, isSVG);
        }
    } else {
        if (vNodes.dom) {
            parentVNode.children = vNodes = directClone(vNodes);
        }
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
    if (type & Types.Element) {
        return removeHtmlElement(vNode, parentDom);
    } else if (type & Types.TextElement) {
        return removeText(vNode, parentDom);
    } else if (type & Types.ComponentClassOrInstance) {
        return removeComponentClassOrInstance(vNode, parentDom, nextVNode);
    } else if (type & Types.ComponentFunction) {
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
        instance._isRemoveDirectly = !!parentDom;
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
    var nextType = nextVNode.type;
    var lastType = lastVNode.type;

    if (nextType & Types.Element) {
        if (lastType & Types.Element) {
            patchElement(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
        } else {
            replaceElement(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
        }
    } else if (nextType & Types.TextElement) {
        if (lastType === nextType) {
            patchText(lastVNode, nextVNode);
        } else {
            replaceElement(lastVNode, nextVNode, parentDom, mountedQueue, isSVG);
        }
    } else if (nextType & Types.ComponentClass) {
        if (lastType & Types.ComponentClass) {
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
    } else if (nextType & Types.ComponentInstance) {
        if (lastType & Types.ComponentInstance) {
            patchComponentIntance(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
        } else {
            replaceElement(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
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

    isSVG = isSVG || (nextType & Types.SvgElement) > 0;

    if (lastVNode.tag !== nextVNode.tag || lastVNode.key !== nextVNode.key) {
        replaceElement(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
    } else {
        if (lastChildren !== nextChildren) {
            patchChildren(lastChildren, nextChildren, dom, mountedQueue, nextVNode, isSVG === true && nextVNode.tag !== 'foreignObject');
        }

        if (lastProps !== nextProps) {
            patchProps(lastVNode, nextVNode, isSVG, false);
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
        if (instance.mounted) {
            instance.isRender = false;
        }
        instance.parentVNode = parentVNode;
        instance.vNode = nextVNode;
        instance.isSVG = isSVG;
        nextVNode.children = instance;
        nextVNode.parentVNode = parentVNode;
        newDom = instance.update(lastVNode, nextVNode);
        nextVNode.dom = newDom;

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
        if (lastInstance.mounted) {
            lastInstance.isRender = false;
        }
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

function patchProps(lastVNode, nextVNode, isSVG, isRender) {
    var lastProps = lastVNode && lastVNode.props || EMPTY_OBJ;
    var nextProps = nextVNode.props;
    var dom = nextVNode.dom;
    var prop = void 0;

    var isInputOrTextArea = (nextVNode.type & (Types.InputElement | Types.TextareaElement)) > 0;
    if (nextProps !== EMPTY_OBJ) {
        var isFormElement = (nextVNode.type & Types.FormElement) > 0;
        for (prop in nextProps) {
            patchProp(prop, lastProps[prop], nextProps[prop], dom, isFormElement, isSVG, isInputOrTextArea);
        }
        if (isFormElement) {
            processForm(nextVNode, dom, nextProps, isRender);
        }
    }
    if (lastProps !== EMPTY_OBJ) {
        for (prop in lastProps) {
            if (!isSkipProp(prop) && isNullOrUndefined(nextProps[prop]) && !isNullOrUndefined(lastProps[prop])) {
                removeProp(prop, lastProps[prop], dom, isInputOrTextArea);
            }
        }
    }
}

function patchProp(prop, lastValue, nextValue, dom, isFormElement, isSVG, isInputOrTextArea) {
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
            removeProp(prop, lastValue, dom, isInputOrTextArea);
        } else if (isEventProp(prop)) {
            handleEvent(prop.substr(3), lastValue, nextValue, dom);
        } else if (isObject$1(nextValue)) {
            patchPropByObject(prop, lastValue, nextValue, dom, isInputOrTextArea);
        } else if (prop === 'innerHTML') {
            dom.innerHTML = nextValue;
        } else {
            if (isSVG && namespaces[prop]) {
                dom.setAttributeNS(namespaces[prop], prop, nextValue);
            } else {
                // https://github.com/Javey/Intact/issues/19
                // IE 10/11 set placeholder will trigger input event
                if (isInputOrTextArea && browser.isIE && (browser.version === 10 || browser.version === 11) && prop === 'placeholder') {
                    ignoreInputEvent(dom);
                    if (nextValue !== '') {
                        addFocusEvent(dom);
                    } else {
                        removeFocusEvent(dom);
                    }
                }
                dom.setAttribute(prop, nextValue);
            }
        }
    }
}

function ignoreInputEvent(dom) {
    if (!dom.__ignoreInputEvent) {
        var cb = function cb(e) {
            e.stopImmediatePropagation();
            delete dom.__ignoreInputEvent;
            dom.removeEventListener('input', cb);
        };
        dom.addEventListener('input', cb);
        dom.__ignoreInputEvent = true;
    }
}

function addFocusEvent(dom) {
    if (!dom.__addFocusEvent) {
        var ignore = false;
        var inputCb = function inputCb(e) {
            if (ignore) e.stopImmediatePropagation();
            ignore = false;
        };
        var focusCb = function focusCb() {
            ignore = true;
            // if we call input.focus(), the input event will not
            // be called, so we reset it next tick
            setTimeout(function () {
                ignore = false;
            });
        };
        dom.addEventListener('input', inputCb);
        dom.addEventListener('focusin', focusCb);
        dom.addEventListener('focusout', focusCb);
        dom.__addFocusEvent = {
            focusCb: focusCb, inputCb: inputCb
        };
    }
}

function removeFocusEvent(dom) {
    var cbs = dom.__addFocusEvent;
    if (cbs) {
        dom.addEventListener('input', cbs.inputCb);
        dom.addEventListener('focusin', cbs.focusCb);
        dom.addEventListener('focusout', cbs.focusCb);
        delete dom.__addFocusEvent;
    }
}

function removeProp(prop, lastValue, dom, isInputOrTextArea) {
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
            if (isInputOrTextArea && browser.isIE && (browser.version === 10 || browser.version === 11) && prop === 'placeholder') {
                removeFocusEvent(dom);
            }
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

function patchPropByObject(prop, lastValue, nextValue, dom, isInputOrTextArea) {
    if (lastValue && !isObject$1(lastValue) && !isNullOrUndefined(lastValue)) {
        removeProp(prop, lastValue, dom, isInputOrTextArea);
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

function toString$2(vNode, parent, disableSplitText, firstChild) {
    var type = vNode.type;
    var tag = vNode.tag;
    var props = vNode.props;
    var children = vNode.children;
    vNode.parentVNode = parent;

    var html = void 0;
    if (type & Types.ComponentClass) {
        var instance = new tag(props);
        instance.parentVNode = parent;
        instance.vNode = vNode;
        vNode.children = instance;
        html = instance.toString();
    } else if (type & Types.ComponentInstance) {
        children.parentVNode = parent;
        children.vNode = vNode;
        html = children.toString();
    } else if (type & Types.Element) {
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
                            if (!(child.type & Types.Text)) {
                                index = -1;
                            } else {
                                index++;
                            }
                            html += toString$2(child, vNode, disableSplitText, index === 0);
                        }
                    }
                } else {
                    html += toString$2(children, vNode, disableSplitText, true);
                }
            }

            html += '</' + tag + '>';
        }
    } else if (type & Types.Text) {
        html = (firstChild || disableSplitText ? '' : '<!---->') + (children === '' ? ' ' : escapeText(children));
    } else if (type & Types.HtmlComment) {
        html = '<!--' + children + '-->';
    } else if (type & Types.UnescapeText) {
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

    if (type & Types.Element) {
        return hydrateHtmlElement(vNode, dom, mountedQueue, parentDom, parentVNode, isSVG);
    } else if (type & Types.Text) {
        return hydrateText(vNode, dom);
    } else if (type & Types.HtmlComment) {
        return hydrateComment(vNode, dom);
    } else if (type & Types.ComponentClassOrInstance) {
        return hydrateComponentClassOrInstance(vNode, dom, mountedQueue, parentDom, parentVNode, isSVG);
    }
}

function hydrateComponentClassOrInstance(vNode, dom, mountedQueue, parentDom, parentVNode, isSVG) {
    return createOrHydrateComponentClassOrInstance(vNode, parentDom, mountedQueue, null, true, parentVNode, isSVG, function (instance) {
        var newDom = instance.hydrate(vNode, dom);
        if (dom !== newDom && dom.parentNode) {
            dom.parentNode.replaceChild(newDom, dom);
        }

        return newDom;
    });
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
    isSVG = isSVG || (type & Types.SvgElement) > 0;

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
        var isFormElement = (type & Types.FormElement) > 0;
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
	renderString: toString$2,
	hydrateRoot: hydrateRoot,
	hydrate: hydrate,
	Types: Types,
	VNode: VNode,
	hooks: hooks,
	clone: directClone
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
        this.renderVNode(data, blocks, parentVNode);
        this.node = render(this.vNode, parentDom, queue, parentVNode, isSVG);

        return this.node;
    },
    renderVNode: function renderVNode(data, blocks, parentVNode) {
        if (data !== undefined) {
            this.data = data;
        }
        this.blocks = blocks;
        var vNode = this.vNode = this.template(this.data, Vdt$1, this.blocks, this.template) || createCommentVNode('empty');
        // for Animate we need this key
        if (vNode.key === undefined && parentVNode) {
            vNode.key = parentVNode.key;
        }

        return vNode;
    },
    renderString: function renderString$$1(data, blocks, parent) {
        this.data = data;
        var vNode = this.template(data, Vdt$1, blocks, this.template) || createCommentVNode('empty');

        return toString$2(vNode, parent, Vdt$1.configure().disableSplitText);
    },
    update: function update(data, parentDom, queue, parentVNode, isSVG, blocks) {
        var oldVNode = this.vNode;
        this.renderVNode(data, blocks, parentVNode);
        this.node = patch(oldVNode, this.vNode, parentDom, queue, parentVNode, isSVG);

        return this.node;
    },
    hydrate: function hydrate$$1(data, dom, queue, parentDom, parentVNode, isSVG, blocks) {
        this.renderVNode(data, blocks, parentVNode);
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
                hscript = stringifier.stringify(ast, options);

            if (options.onlySource) {
                templateFn = function templateFn() {};
            } else {
                var buffer = stringifier.buffer;
                templateFn = new Function('obj', '_Vdt', 'blocks', '$callee', buffer.slice(1, buffer.length - 1).join(''));
            }
            templateFn.source = hscript;
            templateFn.head = stringifier.head;
            templateFn.mappings = stringifier.mappings;
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
Vdt$1.miss = extend({}, miss);
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

var getPrototypeOf = Object.getPrototypeOf;
if (!(Object.setPrototypeOf || {}.__proto__)) {
    // ie <= 10 exists getPrototypeOf but not setPrototypeOf
    var nativeGetPrototypeOf = Object.getPrototypeOf;

    if (typeof nativeGetPrototypeOf !== 'function') {
        getPrototypeOf = function getPrototypeOf(object) {
            // May break if the constructor has been tampered with
            return object.__proto__ || object.constructor.prototype;
        };
    } else {
        getPrototypeOf = function getPrototypeOf(object) {
            // in ie <= 10 __proto__ is not supported
            // getPrototypeOf will return a native function
            // but babel will set __proto__ prototyp to target
            // so we get __proto__ in this case
            return object.__proto__ || nativeGetPrototypeOf.call(Object, object);
        };
    }

    // fix that if ie <= 10 babel can't inherit class static methods
    // Object.setPrototypeOf = function(O, proto) {
    //     extend(O, proto);
    //     O.__proto__ = proto;
    // }
}

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
    var value = isNullOrUndefined(obj) ? undefined : obj[property];
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
var reEvent = /Event/;
// Internal recursive comparison function for `isEqual`.
var eq = function eq(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (isNullOrUndefined(a) || isNullOrUndefined(b)) return a === b;
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

        // Event
        if (reEvent.test(className$$1)) return a === b;

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

// @reference https://github.com/lodash/lodash/blob/master/.internal/stringToPath.js
var charCodeOfDot = '.'.charCodeAt(0);
var reEscapeChar = /\\(\\)?/g;
var rePropName = RegExp(
// Match anything that isn't a dot or bracket.
'[^.[\\]]+' + '|' +
// Or match property names within brackets.
'\\[(?:' +
// Match a non-string expression.
'([^"\'].*)' + '|' +
// Or match strings (supports escaping characters).
'(["\'])((?:(?!\\2)[^\\\\]|\\\\.)*?)\\2' + ')\\]' + '|' +
// Or match "" as the space between consecutive dots or empty brackets.
'(?=(?:\\.|\\[\\])(?:\\.|\\[\\]|$))', 'g');
var pathMap = {};
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
function castPath(path) {
    if (typeof path !== 'string') return path;
    if (pathMap[path]) return pathMap[path];

    var result = [];
    if (path.charCodeAt(0) === charCodeOfDot) {
        result.push('');
    }
    path.replace(rePropName, function (match, expression, quote, subString) {
        var key = match;
        if (quote) {
            key = subString.replace(reEscapeChar, '$1');
        } else if (expression) {
            key = expression;
        }
        result.push(key);
    });
    pathMap[path] = result;
    return result;
}
function isIndex(value) {
    return (typeof value === 'number' || reIsUint.test(value)) && value > -1 && value % 1 === 0;
}
function get$$1(object, path, defaultValue) {
    if (hasOwn.call(object, path)) return object[path];
    path = castPath(path);

    var index = 0,
        length = path.length;

    while (!isNullOrUndefined(object) && index < length) {
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
    while (!isNullOrUndefined(nested) && ++index < length) {
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

        if (~indexOf(wontBind, method) || bound[method] || typeof fn !== 'function') {
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
	isNullOrUndefined: isNullOrUndefined,
	noop: noop,
	isStringOrNumber: isStringOrNumber,
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

/**
 * 验证属性合法性，参考vue实现
 * 这种实现方式，使用起来很简单，无需引入额外的模块
 * 但是也无法验证复杂的数据结构（需要自己实现验证函数）
 */
function validateProps(props, propTypes) {
    var componentName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '<anonymous>';

    if (!props || !propTypes) return;

    for (var prop in propTypes) {
        var value = props[prop];
        var expectedType = propTypes[prop];
        if (!isPlainObject(expectedType)) {
            expectedType = { type: expectedType };
        }

        if (isNullOrUndefined(value)) {
            var required = expectedType.required;
            if (isFunction(required)) {
                required = required(props);
            }
            if (required) {
                error$1('Missing required prop on component "' + componentName + '": "' + prop + '".');
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

            var _valid = false;
            var _isStringOrNumber = false;
            var expectedTypes = [];

            for (var i = 0; i < type.length; i++) {
                var _assertType = assertType(value, type[i]),
                    _expectedType = _assertType.expectedType,
                    valid = _assertType.valid,
                    isStringOrNumber$$1 = _assertType.isStringOrNumber;

                expectedTypes.push(_expectedType || '');
                _isStringOrNumber = isStringOrNumber$$1;
                if (valid) {
                    _valid = valid;
                    break;
                }
            }

            if (!_valid) {
                error$1('Invalid type of prop "' + prop + '" on component "' + componentName + '". ' + ('Expected ' + expectedTypes.join(', ') + ', but got ') + (toRawType(value, _isStringOrNumber) + '.'));
                return;
            }
        }

        var validator = expectedType.validator;
        if (validator) {
            var result$$1 = validator(value);
            if (result$$1 === false) {
                error$1('Invalid prop "' + prop + '" on component "' + componentName + '": custom validator check failed.');
                return;
            } else if (result$$1 !== true) {
                error$1('Invalid prop "' + prop + '" on component "' + componentName + '": ' + result$$1);
                return;
            }
        }
    }
}

var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/;
function assertType(value, type) {
    var valid = void 0;

    var _type = typeof type === 'undefined' ? 'undefined' : _typeof(type);
    if (_type === 'number') {
        return { valid: type === value, expectedType: type, isStringOrNumber: true };
    } else if (_type === 'string') {
        return { valid: type === value, expectedType: '"' + type + '"', isStringOrNumber: true };
    }

    var expectedType = getType(type);

    if (simpleCheckRE.test(expectedType)) {
        var t = typeof value === 'undefined' ? 'undefined' : _typeof(value);
        valid = t === expectedType.toLowerCase();

        if (valid && t === 'number' && value !== value) {
            // for NaN
            valid = false;
        } else if (!valid && t === 'object') {
            // for primitive wrapper objects
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

var toString$3 = Object.prototype.toString;
function toRawType(value, isStringOrNumber$$1) {
    if (isStringOrNumber$$1) {
        var _type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
        if (_type === 'string') {
            return '"' + value + '"';
        }
        return value;
    }
    if (value !== value) return 'NaN';
    return toString$3.call(value).slice(8, -1);
}

function isPlainObject(value) {
    return toString$3.call(value) === '[object Object]';
}

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

    this.vdt = Vdt$1(template);

    // for string ref
    this.refs = this.vdt.widgets || {};
    // for compatibility v1.0
    this.widgets = this.refs;

    this.props = extend({}, result(this, 'defaults'));

    this.uniqueId = this.props.widget || uniqueId('widget');

    // for compatibility v1.0
    this.attributes = this.props;
    this._widget = this.uniqueId;

    this._events = {};
    this._keptEvents = {}; // save the events that do not off when destroyed

    // lifecycle states
    this.inited = false;
    this.rendered = false;
    this.mounted = false;
    this.destroyed = false;

    // if the flag is false, any set operation will not lead to update 
    this._startRender = false;

    this._updateCount = 0;
    this._pendingUpdate = null;
    this._pendingChangedEvents = [];

    this.mountedQueue = null;

    this._constructor(props);
}

Intact$2.prototype._constructor = function (props) {
    var _this = this;

    {
        validateProps(props, this.constructor.propTypes, this.displayName || this.constructor.name);
    }

    extend(this.props, props);

    // bind events
    each(props, function (value, key) {
        if (isEventProp(key)) {
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

    var inited = function inited() {
        _this.inited = true;

        // trigger $receive event when initialize component
        var keys$$1 = [];
        each(props, function (value, key) {
            _this.trigger('$receive:' + key, _this, value);
            keys$$1.push(key);
        });
        if (keys$$1.length) {
            _this.trigger('$receive', _this, keys$$1);
        }
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
};

// for intact compatibility layer to inherit it
Intact$2.template = templateDecorator;

Intact$2.prototype.defaults = noop;

// function name conflict with utils.get
Intact$2.prototype.get = function _get(key, defaultValue) {
    if (key === undefined) return this.props;

    return get$$1(this.props, key, defaultValue);
};

Intact$2.prototype.set = function _set(key, val, options) {
    var _this = this;

    if (isNullOrUndefined(key)) return this;

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
                // 如果修正后，前后值相等，则不去触发change事件
                if (values$$1[1] === values$$1[0]) {
                    changes.splice(i, 1);
                    i--;
                    continue;
                }
            }

            changeKeys.push(_prop);
            // trigger `change*` events
            this.trigger('$change:' + _prop, this, values$$1[1], values$$1[0]);
        }

        if (!changeKeys.length) return;

        if (options._fromPatchProps) {
            this.trigger('$receive', this, changeKeys);
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
            // 则在组件树更新完毕，触发$changed事件
            // 现将该事件暂存起来，待子组件更新完毕在加入mountedQueue
            // 以保证子组件的事件优先于父组件执行
            this._pendingChangedEvents.push(function () {
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

var reWithDot = /\./;
function setProps(newProps, props) {
    var propsPathTree = {};
    var changes = {};
    var changesWithoutNextValue = [];
    for (var prop in newProps) {
        var nextValue = newProps[prop];
        var lastValue = get$$1(props, prop);

        if (!isEqual(lastValue, nextValue)) {
            var tree = propsPathTree;

            if (!hasOwn.call(props, prop)) {
                // a.b.c => ['a', 'b', 'c']
                var paths = castPath(prop);
                var length = paths.length;
                var path = '';
                for (var i = 0; i < length; i++) {
                    var name = paths[i];
                    if (reWithDot.test(name)) {
                        name = '["' + name + '"]';
                    } else {
                        name = path ? '.' + name : name;
                    }
                    path = '' + path + name;
                    if (!tree[name]) {
                        if (i < length - 1) {
                            tree[name] = {};
                            changes[path] = [get$$1(props, path)];
                            changesWithoutNextValue.push(path);
                        } else {
                            changes[path] = [lastValue, nextValue];
                            tree[name] = null;
                        }
                    }
                    tree = tree[name];
                }
                // tree = {a: {b: {c: {}}}}
                // changes = {'a.b.c': [v1, v2], 'a': [v1], 'a.b': [v1]}
            } else {
                if (reWithDot.test(prop)) {
                    prop = '["' + prop + '"]';
                }
                changes[prop] = [lastValue, nextValue];
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
function getChanges(tree, data) {
    var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    var changes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

    for (var key in tree) {
        // let _path = reWithDot.test(key) ?
        // `${path}["${key}"]` :
        // path ?
        // `${path}.${key}` :
        // key;
        var _path = path + key;
        if (tree[key]) {
            getChanges(tree[key], data, _path, changes);
        }
        changes.push([_path, data[_path]]);
    }

    return changes;
}

Intact$2.prototype.on = function (name, callback) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    // the event which write in template must insert before which add in self component
    (this._events[name] || (this._events[name] = []))[options.unshift ? 'unshift' : 'push'](callback);

    // save the kept event
    if (options.keep) {
        (this._keptEvents[name] || (this._keptEvents[name] = [])).push(callback);
    }

    return this;
};

Intact$2.prototype.one = function (name, callback) {
    var _this = this;

    var fn = function fn() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        callback.apply(_this, args);
        _this.off(name, fn);
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

Intact$2.prototype._init = noop;
Intact$2.prototype._beforeCreate = noop;
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

    // mountedQueue在一次更新周期里，只能使用使用，根据done字段判断
    // 在同一更新周期里，共用该对象，否则置为null，让misstime自己去重新初始化
    if (this.mountedQueue && this.mountedQueue.done) {
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
            removeComponentClassOrInstance(_lastVNode, null, lastVNode);
        }
    } else if (!nextVNode || !(nextVNode.type & Types.ComponentClassOrInstance) || nextVNode.key !== lastVNode.key) {
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
    this.mountedQueue = new MountedQueue();
};

Intact$2.prototype._triggerMountedQueue = function () {
    this.mountedQueue.trigger();
};

function initSyncComponent(o, lastVNode, nextVNode) {
    o._beforeCreate(lastVNode, nextVNode);

    var vdt = o.vdt;
    o._startRender = true;
    // 如果key不相同，则不复用dom，直接返回新dom来替换
    if (lastVNode && lastVNode.key === nextVNode.key) {
        // destroy the last component
        if (!lastVNode.children.destroyed) {
            removeComponentClassOrInstance(lastVNode, null, nextVNode);
        }

        // make the dom not be replaced, but update the last one
        vdt.vNode = lastVNode.children.vdt.vNode;
        o.element = vdt.update(o, o.parentDom, o.mountedQueue, nextVNode, o.isSVG, o.get('_blocks'));
    } else {
        if (lastVNode) {
            removeComponentClassOrInstance(lastVNode, null, nextVNode);
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
            removeComponentClassOrInstance(lastVNode, null, nextVNode);
        }
    } else {
        var vNode = createCommentVNode('!');
        placeholder = render(vNode);
        vdt.vNode = vNode;
    }

    // 组件销毁事件也会解绑，所以这里无需判断组件是否销毁了
    o.one('$inited', function () {
        // 异步组件进入了新的更新周期，需要初始化mountedQueue
        o._initMountedQueue();
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
        // 加入$changed事件队列
        var events = o._pendingChangedEvents;
        for (var i = 0; i < events.length; i++) {
            o.mountedQueue.push(events[i]);
        }
        o._pendingChangedEvents = [];
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
            while (parentVNode && parentVNode.type & Types.ComponentClassOrInstance && parentVNode.dom === lastDom) {
                parentVNode.dom = nextDom;
                parentVNode = parentVNode.parentVNode;
            }
        }
    }

    return o.element;
}

function patchProps$1(o, lastProps, nextProps) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : { update: false, _fromPatchProps: true };

    lastProps = lastProps || EMPTY_OBJ;
    nextProps = nextProps || EMPTY_OBJ;
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

            if (isEventProp(prop)) {
                // 解绑上一个属性中的事件
                removeEvents(o, prop, lastValue);
            } else {
                if (!lastPropsWithoutEvents) {
                    lastPropsWithoutEvents = {};
                }
                lastPropsWithoutEvents[prop] = lastValue;
            }
        };

        if (nextProps !== EMPTY_OBJ) {
            {
                validateProps(nextProps, o.constructor.propTypes, o.displayName || o.constructor.name);
            }

            for (var prop in nextProps) {
                nextValue = nextProps[prop];

                if (isEventProp(prop)) {
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

            if (lastProps !== EMPTY_OBJ) {
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
        var defaults = result(o, 'defaults') || EMPTY_OBJ;
        if (lastPropsWithoutEvents) {
            for (var _prop3 in lastPropsWithoutEvents) {
                o.set(_prop3, defaults[_prop3], options);
            }
        }
    }
}

/**
 * @brief diff事件属性，属性值可以是空、函数、数组，为了保证事件属性执行顺序优先于
 * 组件内部绑定的同名事件，这里采用unshift倒着处理
 *
 * @param o
 * @param prop
 * @param lastValue
 * @param nextValue
 *
 * @return 
 */
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
            var i = void 0;
            var l = Math.min(nextLength, lastLength);
            if (l < nextLength) {
                // 如果nextValue > lastValue
                // 则绑定剩下的事件函数
                for (i = nextLength - 1; i >= l; i--) {
                    var _nextValue = nextValue[i];
                    if (_nextValue) {
                        o.on(eventName, _nextValue, { unshift: true });
                    }
                }
            } else if (l < lastLength) {
                // 如果nextValue < lastValue
                // 则解绑剩下的事件函数
                for (i = lastLength - 1; i >= l; i--) {
                    var _lastValue = lastValue[i];
                    if (_lastValue) {
                        o.off(eventName, _lastValue);
                    }
                }
            }
            for (i = l - 1; i >= 0; i--) {
                var _lastValue2 = lastValue[i];
                var _nextValue2 = nextValue[i];
                // 因为要保证顺序不变，所以即使相同，也要重新unshift到前面
                // if (_lastValue !== _nextValue) {
                if (_lastValue2) {
                    o.off(eventName, _lastValue2);
                }
                if (_nextValue2) {
                    o.on(eventName, _nextValue2, { unshift: true });
                }
                // }
            }
        } else if (lastValue) {
            o.off(eventName, lastValue);
            for (var _i = nextValue.length - 1; _i >= 0; _i--) {
                var _nextValue3 = nextValue[_i];
                if (_nextValue3) {
                    o.on(eventName, _nextValue3, { unshift: true });
                }
            }
        } else {
            for (var _i2 = nextValue.length - 1; _i2 >= 0; _i2--) {
                var _nextValue4 = nextValue[_i2];
                if (_nextValue4) {
                    o.on(eventName, _nextValue4, { unshift: true });
                }
            }
        }
    } else if (nextValue) {
        if (isArray(lastValue)) {
            var found = false;
            for (var _i3 = 0; _i3 < lastValue.length; _i3++) {
                var _lastValue3 = lastValue[_i3];
                if (_lastValue3) {
                    if (_lastValue3 !== nextValue) {
                        o.off(eventName, _lastValue3);
                    } else {
                        found = true;
                    }
                }
            }
            // 如果下一个事件函数不在上一个数组中，则绑定
            if (!found) {
                o.on(eventName, nextValue, { unshift: true });
            }
        } else if (lastValue) {
            o.off(eventName, lastValue);
            o.on(eventName, nextValue, { unshift: true });
        } else {
            o.on(eventName, nextValue, { unshift: true });
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

    this._beforeCreate(null, vNode);
    this._startRender = true;
    this.element = vdt.hydrate(this, dom, this.mountedQueue, this.parentDom, vNode, this.isSVG, this.get('_blocks'));
    this.rendered = true;
    this.trigger('$rendered', this);
    this._create(null, vNode);

    return this.element;
};

Intact$2.prototype.toString = function () {
    this._beforeCreate(null, this.vNode);
    return this.vdt.renderString(this, this.get('_blocks'), this.vNode);
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
    var vNode = createVNode(Component);
    var mountedQueue = new MountedQueue();
    render(vNode, node, mountedQueue);
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
    var vNode = createVNode(Component);
    hydrateRoot(vNode, node);
    return vNode.children;
};

// for type check
Intact$2.VNode = VNode;

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

function addEventListener$1(node, eventName, eventListener) {
    node.addEventListener(eventName, eventListener, false);
}

function removeEventListener$1(node, eventName, eventListener) {
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
            addEventListener$1(node, endEvent, eventListener);
        });
    },

    off: function off(node, eventListener) {
        if (endEvents.length === 0) {
            return;
        }
        endEvents.forEach(function (endEvent) {
            removeEventListener$1(node, endEvent, eventListener);
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
    var _fn = function _fn() {
        if (_fn.cancelled) return;
        fn();
    };
    raf(function () {
        return raf(_fn);
    });
    return function () {
        _fn.cancelled = true;
    };
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

var h = Vdt$1.miss.h;
var _Vdt$utils = Vdt$1.utils;
var c = _Vdt$utils.className;
var e$1 = _Vdt$utils.extend;


var prototype = {
    defaults: function defaults$$1() {
        return {
            'a:continuity': true, // 是否保持连贯性
            'a:tag': 'div',
            'a:transition': 'animate',
            'a:appear': false,
            'a:mode': 'both', // out-in | in-out | both
            'a:disabled': false, // 只做动画管理者，自己不进行动画
            'a:move': true, // 是否执行move动画
            'a:css': true, // 是否使用css动画，如果自定义动画函数，可以将它置为false
            'a:delayDestroy': true, // 是否动画完成才destroy子元素
            'a:show': true // 是否应用展示、隐藏动画
        };
    },
    template: function template() {
        var _e;

        var self = this.data;
        var tagName = self.get('a:tag');
        var props = {};
        var _props = self.get();
        var _staticClass = self._staticClass;

        for (var key in _props) {
            if (key !== 'ref' && key !== 'key' && (key[0] !== 'a' || key[1] !== ':') && key.substr(0, 5) !== 'ev-a:') {
                props[key] = _props[key];
            }
        }
        var oClassName = props.className;
        props.className = c(e$1((_e = {}, _e[oClassName] = oClassName, _e), _staticClass)) || undefined;

        if (self._isRenderString) {
            var show = self.get('a:show');
            if (!show) {
                var oStyle = props.style;
                if (!oStyle) {
                    props.style = { display: 'none' };
                } else {
                    var type = typeof oStyle === 'undefined' ? 'undefined' : _typeof(oStyle);
                    if (type === 'string') {
                        props.style = oStyle + 'display: none;';
                    } else if (type === 'object' && oStyle) {
                        props.style.display = 'none';
                    }
                }
            }
        }

        return h(tagName, props, self.get('children'));
    },
    _init: function _init() {
        var _this = this;

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

        // convert show to Boolean
        this.on('$receive:a:show', function (c, v) {
            _this.set('a:show', !!v, { silent: true });
        });

        this._staticClass = {};
    },
    _addClass: function _addClass(className) {
        this._staticClass[className] = true;
        addClass(this.element, className);
    },
    _removeClass: function _removeClass(className) {
        delete this._staticClass[className];
        removeClass(this.element, className);
    },
    toString: function toString() {
        this._isRenderString = true;
        var ret = this._super();
        this._isRenderString = false;

        return ret;
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

prototype.destroy = function (lastVNode, nextVNode, parentDom, _directly) {
    // 1: 不存在parentDom，有两种情况：
    //      1): 父元素也要被销毁，此时: !parentDom && lastVNode && !nextVNode
    //      2): 该元素将被替换，此时：!parentDom && lastVNode && nextVNode
    //      对于1)，既然父元素要销毁，那本身也要直接销毁
    //      对于2)，本身必须待动画结束方能销毁
    // 2: 如果该元素已经动画完成，直接销毁
    // 3: 如果直接调用destroy方法，则直接销毁，此时：!lastVNode && !nextVNode && !parentDom
    // 4: 如果不是延迟destroy子元素，则立即销毁
    // 5: 如果是禁止动画的元素，且该元素是组件直接返回的动画元素，则直接销毁
    if (!this.get('a:delayDestroy') || !parentDom && !nextVNode && !isRemoveDirectly(this) || this._leaving === false || _directly) {
        this._super(lastVNode, nextVNode, parentDom);
    }
};

function isRemoveDirectly(instance) {
    var parentVNode = instance.parentVNode;
    while (parentVNode && parentVNode.type & Types.ComponentClassOrInstance) {
        var i = parentVNode.children;
        if (i._isRemoveDirectly) {
            return instance.element === i.element;
        }
        parentVNode = parentVNode.parentVNode;
    }
    return false;
}

function leave(o) {
    // maybe a a:show animation is leaving
    if (o._leaving) return;

    var element = o.element;

    if (element.style.display === 'none') return o.leaveEndCallback(true);

    var isCss = o.get('a:css');
    var continuity = o.get('a:continuity');
    var disabled = o.get('a:disabled');

    var endDirectly = false;
    if (o._entering) {
        if (continuity && !o._triggeredEnter) {
            endDirectly = true;
            o._cancelEnterNextFrame();
        }
        o._enterEnd(null, true);
    }

    if (disabled) return o.leaveEndCallback();

    var vNode = o.vNode;
    var parentDom = o._parentDom;
    // vNode都会被添加key，当只有一个子元素时，vNode.key === undefined
    // 这种情况，我们也当成有key处理，此时key为undefined
    if (!parentDom._reserve) {
        parentDom._reserve = {};
    }
    parentDom._reserve[vNode.key] = vNode;

    o._leaving = true;

    initLeaveEndCallback(o);

    // 为了保持动画连贯，我们立即添加leaveActiveClass
    // 但如果当前元素还没有来得及做enter动画，就被删除
    // 则leaveActiveClass和leaveClass都放到下一帧添加
    // 否则leaveClass和enterClass一样就不会有动画效果
    if (continuity && !endDirectly && isCss) {
        o._addClass(o.leaveActiveClass);
    }

    o.trigger('a:leaveStart', element);

    if (!endDirectly) {
        // TransitionEvents.on(element, o._leaveEnd);
        // triggerLeave(o);
        o._cancelLeaveNextFrame = nextFrame(function () {
            // 存在一种情况，当一个enter动画在完成的瞬间，
            // 这个元素被删除了，由于前面保持动画的连贯性
            // 添加了leaveActiveClass，则会导致绑定的leaveEnd
            // 立即执行，所以这里放到下一帧来绑定
            TransitionEvents.on(element, o._leaveEnd);
            triggerLeave(o);
        });
    } else {
        o._leaveEnd();
    }
}

function triggerLeave(o) {
    if (o._leaving === false) return;

    o._triggeredLeave = true;

    var element = o.element;
    if (o.get('a:css')) {
        o._addClass(o.leaveActiveClass);
        o._addClass(o.leaveClass);
    }

    o.trigger('a:leave', element, o._leaveEnd);
}

function initLeaveEndCallback(o) {
    var element = o.element,
        _parentDom = o._parentDom,
        vNode = o.vNode;

    var isCss = o.get('a:css');
    var disabled = o.get('a:disabled');

    o._leaveEnd = function (e, isCancel) {
        if (e && e.target !== element) return;

        TransitionEvents.off(element, o._leaveEnd);

        if (isCss && !disabled) {
            e && e.stopPropagation && e.stopPropagation();
            o._removeClass(o.leaveClass);
            o._removeClass(o.leaveActiveClass);
        }
        if (o._triggeredLeave) {
            var s = element.style;
            s.position = s.top = s.left = s.transform = s.WebkitTransform = '';
        }

        o._leaving = false;
        o._triggeredLeave = false;
        delete _parentDom._reserve[vNode.key];

        var parentInstance = o.parentInstance;
        if (parentInstance) {
            if (--parentInstance._leavingAmount === 0 && parentInstance.get('a:mode') === 'out-in') {
                checkMode(parentInstance);
            }
        }

        o.trigger('a:leaveEnd', element, isCancel);
        if (!isCancel) {
            o.leaveEndCallback(true);
        }
    };
}

prototype._mount = function (lastVNode, vNode) {
    this.isAppear = detectIsAppear(this);
    this._parentDom = this.parentVNode && this.parentVNode.dom || this.parentDom;

    this.on('$change:a:transition', initClassName);
    initClassName(this);

    // for show/hide animation
    initAShow(this);

    // 一个动画元素被删除后，会被保存
    // 如果在删除的过程中，又添加了，则要清除上一个动画状态
    // 将这种情况记录下来
    if (this._lastVNode && this._lastVNode !== lastVNode) {
        var lastInstance = this._lastVNode.children;
        if (lastInstance._leaving) {
            this.lastInstance = lastInstance;
        } else {
            lastInstance._cancelLeaveNextFrame();
        }
    }

    this.parentInstance = getParentAnimate(this);

    initUnmountCallback(this, vNode);

    startEnterAnimate(this);
};

function initAShow(o) {
    var element = o.element;
    var display = element.style.display;
    var originDisplay = display === 'none' ? '' : display;
    if (!o.get('a:show')) {
        element.style.display = 'none';
    }

    // o.on('$change:a:disabled', (c, v) => {
    // if (v) {
    // const lastInstance = o.lastInstance;
    // if (lastInstance && lastInstance._leaving === true) {
    // lastInstance._leaveEnd();
    // }
    // }
    // });

    o.on('$changed:a:show', function (c, v) {
        // 如果是appear动画，则在show/hide改为enter动画
        if (o.isAppear) {
            o.isAppear = false;
            initClassName(o);
        }
        if (v) {
            // 如果在leaveEnd事件中，又触发了enter
            // 此时_leaving为false，如果不清空lastInstance
            // 将会在enter中再次触发leaveEnd
            var lastInstance = o.lastInstance;
            if (lastInstance && lastInstance._leaving === false) {
                o.leaveEndCallback = noop;
                o.lastInstance = null;
            }
            element.style.display = originDisplay;
            startEnterAnimate(o);
        } else {
            o.lastInstance = o;
            o.leaveEndCallback = function () {
                element.style.display = 'none';
                o.lastInstance = null;
            };
            unmountCallback(o);
        }
    });
}

function startEnterAnimate(o) {
    if (o.parentInstance) {
        // 如果存在父动画组件，则使用父级进行管理
        // 统一做动画
        animateList(o);
    } else if (o.isAppear || !o.isRender) {
        // 否则单个元素自己动画
        enter(o);
    }
}

function enter(o) {
    if (!o.get('a:show') || o._entering) return;

    var element = o.element;
    var isCss = o.get('a:css');
    var enterStart = o.get('a:enterStart');
    var continuity = o.get('a:continuity');
    var disabled = o.get('a:disabled');

    // getAnimateType将添加enter-active className，在firefox下将导致动画提前执行
    // 我们应该先于添加`enter` className去调用该函数
    var isTransition = false;
    if (isCss && getAnimateType(element, o.enterActiveClass) !== 'animation') {
        isTransition = true;
    }

    var endDirectly = false;
    // 如果这个元素是上一个删除的元素，则从当前状态回到原始状态
    if (o.lastInstance) {
        endDirectly = continuity && !o.lastInstance._triggeredLeave;

        o.lastInstance._cancelLeaveNextFrame();
        o.lastInstance._leaveEnd(null, true);

        // 保持连贯，添加leaveActiveClass
        if (continuity && !endDirectly && isCss && !disabled) {
            o._addClass(o.enterActiveClass);
        }
    }

    if (disabled) return;

    initEnterEndCallback(o);

    function start() {
        o._entering = true;

        o.trigger(o.enterEventName + 'Start', element);

        if (!endDirectly) {
            if (isCss) {
                o._addClass(o.enterClass);
            }

            TransitionEvents.on(element, o._enterEnd);

            if (isTransition) {
                o._cancelEnterNextFrame = nextFrame(function () {
                    return triggerEnter(o);
                });
            } else {
                // 对于animation动画，同步添加enterActiveClass，避免闪动
                triggerEnter(o);
            }
        } else {
            o._enterEnd();
        }
    }

    // 要保持leave的过程中，enter动画的连贯，enterStart中必须不能操作dom导致重绘
    // 但是往往enterStart中会重绘，一种解决思路是：
    // 将leaveEnd放在enterStart之后执行，但如果enterStart依赖元素的初始状态，而非
    // leave的中间状态，此时会导致enterStart中dom操作不符合预期
    // 另种一种思路是：
    // 不去保证拥有enterStart函数的动画的连贯性，此时我们会从enter动画初始状态进行动画
    // 这里采取第二种思路
    var i = void 0;
    if (enterStart && (i = enterStart(element)) && i.then) {
        i.then(function () {
            if (o.destroyed || !o.get('a:show')) return;
            start();
        });
    } else {
        start();
    }
}

function triggerEnter(o) {
    var element = o.element;

    if (o.get('a:css')) {
        // if (o._entering === false) {
        // return o._removeClass(o.enterActiveClass);
        // }
        o._addClass(o.enterActiveClass);
        o._removeClass(o.enterClass);
    }

    o._triggeredEnter = true;

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

    // o.isAppear = isAppear;
    o.enterClass = enterClass;
    o.enterActiveClass = enterActiveClass;
    o.leaveClass = transition + '-leave';
    o.leaveActiveClass = transition + '-leave-active';
    o.moveClass = transition + '-move';
    o.enterEventName = isAppear ? 'a:appear' : 'a:enter';

    if (oldValue) {
        element.className = element.className.replace(new RegExp('\\b(' + oldValue + '(?=\\-(appear|enter|leave|move)))', 'g'), newValue);
        var staticClass = {};
        var index = oldValue.length;
        for (var key in this._staticClass) {
            staticClass[newValue + key.substring(index)] = true;
        }
        this._staticClass = staticClass;
    }
}

function initEnterEndCallback(o) {
    var element = o.element,
        parentInstance = o.parentInstance;

    var isCss = o.get('a:css');
    var disabled = o.get('a:disabled');

    o._enterEnd = function (e, isCancel) {
        if (e && e.target !== element) return;

        TransitionEvents.off(element, o._enterEnd);

        if (isCss && !disabled) {
            e && e.stopPropagation && e.stopPropagation();
            o._removeClass(o.enterClass);
            o._removeClass(o.enterActiveClass);
        }

        o._entering = false;
        o._triggeredEnter = false;

        if (parentInstance) {
            if (--parentInstance._enteringAmount === 0 && parentInstance.get('a:mode') === 'in-out') {
                nextFrame(function () {
                    checkMode(parentInstance);
                });
            }
        }

        o.trigger(o.enterEventName + 'End', element, isCancel);
    };
}

function initUnmountCallback(o, vNode) {
    var element = o.element;


    element._unmount = function (nouse, parentDom) {
        o.vNode = vNode;
        o._parentDom = parentDom;
        o.leaveEndCallback = function (isLeaveEnd) {
            parentDom.removeChild(element);
            if (!o.destroyed) {
                o.destroy(vNode, null, parentDom, true);
            }
        };
        unmountCallback(o);

        // 存在一种情况，相同的dom，同时被子组件和父组件管理的情况
        // 所以unmount后，将其置为空函数，以免再次unmount
        element._unmount = noop;
    };
}

function unmountCallback(o) {
    var parentInstance = o.parentInstance;

    // 如果该元素是延迟mount的元素，则直接删除

    if (o._delayEnter) {
        o.leaveEndCallback();
        parentInstance._enteringAmount--;

        return;
    }

    var isNotAnimate = !o.get('a:css') && !hasJsTransition(o);

    if (parentInstance && !isNotAnimate) {
        parentInstance._leavingAmount++;
        if (parentInstance.get('a:mode') === 'in-out') {
            parentInstance.updateChildren.push(o);
            o._delayLeave = true;
        } else {
            // add a flag to indicate that this child will leave but we maybe call
            // _beforeUpdate twice before _update, so let _beforeUpdate reserve it
            // ksc-fe/kpc#238 
            o._needLeave = true;
            parentInstance.unmountChildren.push(o);
        }
        parentInstance.children.push(o);
    } else if (isNotAnimate) {
        o.leaveEndCallback();
    } else {
        leave(o);
    }
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
        } else if (instance._needLeave) {
            // when we call _beforeUpdate twice before _update
            // the unmount children will miss
            // so we add a flag for the children and reserve it
            // ksc-fe/kpc#238
            reservedChildren.push(instance);
        }
    }

    this.children = reservedChildren;
};

prototype._update = function (lastVNode, vNode, isFromCheckMode) {
    var parentInstance = void 0;
    if (!this.get('a:disabled')) {
        parentInstance = this.parentInstance;
        if (parentInstance) {
            if (!this._needLeave) {
                parentInstance.updateChildren.push(this);
            }
            // when we call _beforeUpdate twice then call _update twice
            // this instance may exist in childaren
            // so we don't push it, but we need update position of it
            // ksc-fe/kpc#238
            var _children = parentInstance.children;
            var index = _children.indexOf(this);
            if (!~index) {
                _children.push(this);
            } else {
                this._needUpdatePosition = true;
            }
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
        // if the _needUpdatePosition is true, see bellow for detail, update the position
        updateChildren.forEach(function (instance) {
            if (!instance._leaving && instance._needUpdatePosition) {
                instance.position = getPosition(instance);
            }
            instance._needUpdatePosition = false;
        });

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
            instance._needLeave = false;
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
        // for call _beforeUpdate twice before _update, ksc-fe/kpc#238
        children.splice(children.indexOf(instance), 1);
        leave(instance);
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

    o._addClass(o.moveClass);

    o._moveEnd = function (e) {
        e && e.stopPropagation();
        if (!e || /transform$/.test(e.propertyName)) {
            TransitionEvents.off(element, o._moveEnd);
            o._removeClass(o.moveClass);
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
