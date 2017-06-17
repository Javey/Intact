'use strict';

var slice = Array.prototype.slice;

var index$2 = iterativelyWalk;

function iterativelyWalk(nodes, cb) {
    if (!('length' in nodes)) {
        nodes = [nodes];
    }

    nodes = slice.call(nodes);

    while (nodes.length) {
        var node = nodes.shift(),
            ret = cb(node);

        if (ret) {
            return ret;
        }

        if (node.childNodes && node.childNodes.length) {
            nodes = slice.call(node.childNodes).concat(nodes);
        }
    }
}

var domComment = Comment;

function Comment(data, owner) {
    if (!(this instanceof Comment)) {
        return new Comment(data, owner);
    }

    this.data = data;
    this.nodeValue = data;
    this.length = data.length;
    this.ownerDocument = owner || null;
}

Comment.prototype.nodeType = 8;
Comment.prototype.nodeName = "#comment";

Comment.prototype.toString = function _Comment_toString() {
    return "[object Comment]";
};

var domText = DOMText;

function DOMText(value, owner) {
    if (!(this instanceof DOMText)) {
        return new DOMText(value);
    }

    this.data = value || "";
    this.length = this.data.length;
    this.ownerDocument = owner || null;
}

DOMText.prototype.type = "DOMTextNode";
DOMText.prototype.nodeType = 3;
DOMText.prototype.nodeName = "#text";

DOMText.prototype.toString = function _Text_toString() {
    return this.data;
};

DOMText.prototype.replaceData = function replaceData(index, length, value) {
    var current = this.data;
    var left = current.substring(0, index);
    var right = current.substring(index + length, current.length);
    this.data = left + value + right;
    this.length = this.data.length;
};

var dispatchEvent_1 = dispatchEvent;

function dispatchEvent(ev) {
    var elem = this;
    var type = ev.type;

    if (!ev.target) {
        ev.target = elem;
    }

    if (!elem.listeners) {
        elem.listeners = {};
    }

    var listeners = elem.listeners[type];

    if (listeners) {
        return listeners.forEach(function (listener) {
            ev.currentTarget = elem;
            if (typeof listener === 'function') {
                listener(ev);
            } else {
                listener.handleEvent(ev);
            }
        });
    }

    if (elem.parentNode) {
        elem.parentNode.dispatchEvent(ev);
    }
}

var addEventListener_1 = addEventListener;

function addEventListener(type, listener) {
    var elem = this;

    if (!elem.listeners) {
        elem.listeners = {};
    }

    if (!elem.listeners[type]) {
        elem.listeners[type] = [];
    }

    if (elem.listeners[type].indexOf(listener) === -1) {
        elem.listeners[type].push(listener);
    }
}

var removeEventListener_1 = removeEventListener;

function removeEventListener(type, listener) {
    var elem = this;

    if (!elem.listeners) {
        return;
    }

    if (!elem.listeners[type]) {
        return;
    }

    var list = elem.listeners[type];
    var index = list.indexOf(listener);
    if (index !== -1) {
        list.splice(index, 1);
    }
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var serialize = serializeNode;

var voidElements = ["area", "base", "br", "col", "embed", "hr", "img", "input", "keygen", "link", "menuitem", "meta", "param", "source", "track", "wbr"];

function serializeNode(node) {
    switch (node.nodeType) {
        case 3:
            return escapeText(node.data);
        case 8:
            return "<!--" + node.data + "-->";
        default:
            return serializeElement(node);
    }
}

function serializeElement(elem) {
    var strings = [];

    var tagname = elem.tagName;

    if (elem.namespaceURI === "http://www.w3.org/1999/xhtml") {
        tagname = tagname.toLowerCase();
    }

    strings.push("<" + tagname + properties(elem) + datasetify(elem));

    if (voidElements.indexOf(tagname) > -1) {
        strings.push(" />");
    } else {
        strings.push(">");

        if (elem.childNodes.length) {
            strings.push.apply(strings, elem.childNodes.map(serializeNode));
        } else if (elem.textContent || elem.innerText) {
            strings.push(escapeText(elem.textContent || elem.innerText));
        } else if (elem.innerHTML) {
            strings.push(elem.innerHTML);
        }

        strings.push("</" + tagname + ">");
    }

    return strings.join("");
}

function isProperty(elem, key) {
    var type = _typeof(elem[key]);

    if (key === "style" && (type === "object" && Object.keys(elem.style).length > 0 || type === "string" && elem.style)) {
        return true;
    }

    return elem.hasOwnProperty(key) && (type === "string" || type === "boolean" && elem[key] || type === "number") && key !== "nodeName" && key !== "className" && key !== "tagName" && key !== "textContent" && key !== "innerText" && key !== "namespaceURI" && key !== "innerHTML";
}

function stylify(styles) {
    if (typeof styles === 'string') return styles;
    var attr = "";
    Object.keys(styles).forEach(function (key) {
        var value = styles[key];
        key = key.replace(/[A-Z]/g, function (c) {
            return "-" + c.toLowerCase();
        });
        attr += key + ":" + value + ";";
    });
    return attr;
}

function datasetify(elem) {
    var ds = elem.dataset;
    var props = [];

    for (var key in ds) {
        props.push({ name: "data-" + key, value: ds[key] });
    }

    return props.length ? stringify(props) : "";
}

function stringify(list) {
    var attributes = [];
    list.forEach(function (tuple) {
        var name = tuple.name;
        var value = tuple.value;

        if (name === "style") {
            value = stylify(value);
        }

        attributes.push(name + "=" + "\"" + escapeAttributeValue(value) + "\"");
    });

    return attributes.length ? " " + attributes.join(" ") : "";
}

function properties(elem) {
    var props = [];
    for (var key in elem) {
        if (isProperty(elem, key)) {
            props.push({ name: key, value: elem[key] });
        }
    }

    for (var ns in elem._attributes) {
        for (var attribute in elem._attributes[ns]) {
            var prop = elem._attributes[ns][attribute];
            var name = (prop.prefix ? prop.prefix + ":" : "") + attribute;
            props.push({ name: name, value: prop.value });
        }
    }

    if (elem.className) {
        props.push({ name: "class", value: elem.className });
    }

    return props.length ? stringify(props) : "";
}

function escapeText(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttributeValue(str) {
    return escapeText(str).replace(/"/g, "&quot;");
}

var htmlns = "http://www.w3.org/1999/xhtml";

var domElement = DOMElement;

function DOMElement(tagName, owner, namespace) {
    if (!(this instanceof DOMElement)) {
        return new DOMElement(tagName);
    }

    var ns = namespace === undefined ? htmlns : namespace || null;

    this.tagName = ns === htmlns ? String(tagName).toUpperCase() : tagName;
    this.nodeName = this.tagName;
    this.className = "";
    this.dataset = {};
    this.childNodes = [];
    this.parentNode = null;
    this.style = {};
    this.ownerDocument = owner || null;
    this.namespaceURI = ns;
    this._attributes = {};

    if (this.tagName === 'INPUT') {
        this.type = 'text';
    }
}

DOMElement.prototype.type = "DOMElement";
DOMElement.prototype.nodeType = 1;

DOMElement.prototype.appendChild = function _Element_appendChild(child) {
    if (child.parentNode) {
        child.parentNode.removeChild(child);
    }

    this.childNodes.push(child);
    child.parentNode = this;

    return child;
};

DOMElement.prototype.replaceChild = function _Element_replaceChild(elem, needle) {
    // TODO: Throw NotFoundError if needle.parentNode !== this

    if (elem.parentNode) {
        elem.parentNode.removeChild(elem);
    }

    var index = this.childNodes.indexOf(needle);

    needle.parentNode = null;
    this.childNodes[index] = elem;
    elem.parentNode = this;

    return needle;
};

DOMElement.prototype.removeChild = function _Element_removeChild(elem) {
    // TODO: Throw NotFoundError if elem.parentNode !== this

    var index = this.childNodes.indexOf(elem);
    this.childNodes.splice(index, 1);

    elem.parentNode = null;
    return elem;
};

DOMElement.prototype.insertBefore = function _Element_insertBefore(elem, needle) {
    // TODO: Throw NotFoundError if referenceElement is a dom node
    // and parentNode !== this

    if (elem.parentNode) {
        elem.parentNode.removeChild(elem);
    }

    var index = needle === null || needle === undefined ? -1 : this.childNodes.indexOf(needle);

    if (index > -1) {
        this.childNodes.splice(index, 0, elem);
    } else {
        this.childNodes.push(elem);
    }

    elem.parentNode = this;
    return elem;
};

DOMElement.prototype.setAttributeNS = function _Element_setAttributeNS(namespace, name, value) {
    var prefix = null;
    var localName = name;
    var colonPosition = name.indexOf(":");
    if (colonPosition > -1) {
        prefix = name.substr(0, colonPosition);
        localName = name.substr(colonPosition + 1);
    }
    if (this.tagName === 'INPUT' && name === 'type') {
        this.type = value;
    } else {
        var attributes = this._attributes[namespace] || (this._attributes[namespace] = {});
        attributes[localName] = { value: value, prefix: prefix };
    }
};

DOMElement.prototype.getAttributeNS = function _Element_getAttributeNS(namespace, name) {
    var attributes = this._attributes[namespace];
    var value = attributes && attributes[name] && attributes[name].value;
    if (this.tagName === 'INPUT' && name === 'type') {
        return this.type;
    }
    if (typeof value !== "string") {
        return null;
    }
    return value;
};

DOMElement.prototype.removeAttributeNS = function _Element_removeAttributeNS(namespace, name) {
    var attributes = this._attributes[namespace];
    if (attributes) {
        delete attributes[name];
    }
};

DOMElement.prototype.hasAttributeNS = function _Element_hasAttributeNS(namespace, name) {
    var attributes = this._attributes[namespace];
    return !!attributes && name in attributes;
};

DOMElement.prototype.setAttribute = function _Element_setAttribute(name, value) {
    return this.setAttributeNS(null, name, value);
};

DOMElement.prototype.getAttribute = function _Element_getAttribute(name) {
    return this.getAttributeNS(null, name);
};

DOMElement.prototype.removeAttribute = function _Element_removeAttribute(name) {
    return this.removeAttributeNS(null, name);
};

DOMElement.prototype.hasAttribute = function _Element_hasAttribute(name) {
    return this.hasAttributeNS(null, name);
};

DOMElement.prototype.removeEventListener = removeEventListener_1;
DOMElement.prototype.addEventListener = addEventListener_1;
DOMElement.prototype.dispatchEvent = dispatchEvent_1;

// Un-implemented
DOMElement.prototype.focus = function _Element_focus() {
    return void 0;
};

DOMElement.prototype.toString = function _Element_toString() {
    return serialize(this);
};

DOMElement.prototype.getElementsByClassName = function _Element_getElementsByClassName(classNames) {
    var classes = classNames.split(" ");
    var elems = [];

    index$2(this, function (node) {
        if (node.nodeType === 1) {
            var nodeClassName = node.className || "";
            var nodeClasses = nodeClassName.split(" ");

            if (classes.every(function (item) {
                return nodeClasses.indexOf(item) !== -1;
            })) {
                elems.push(node);
            }
        }
    });

    return elems;
};

DOMElement.prototype.getElementsByTagName = function _Element_getElementsByTagName(tagName) {
    tagName = tagName.toLowerCase();
    var elems = [];

    index$2(this.childNodes, function (node) {
        if (node.nodeType === 1 && (tagName === '*' || node.tagName.toLowerCase() === tagName)) {
            elems.push(node);
        }
    });

    return elems;
};

DOMElement.prototype.contains = function _Element_contains(element) {
    return index$2(this, function (node) {
        return element === node;
    }) || false;
};

var domFragment = DocumentFragment;

function DocumentFragment(owner) {
    if (!(this instanceof DocumentFragment)) {
        return new DocumentFragment();
    }

    this.childNodes = [];
    this.parentNode = null;
    this.ownerDocument = owner || null;
}

DocumentFragment.prototype.type = "DocumentFragment";
DocumentFragment.prototype.nodeType = 11;
DocumentFragment.prototype.nodeName = "#document-fragment";

DocumentFragment.prototype.appendChild = domElement.prototype.appendChild;
DocumentFragment.prototype.replaceChild = domElement.prototype.replaceChild;
DocumentFragment.prototype.removeChild = domElement.prototype.removeChild;

DocumentFragment.prototype.toString = function _DocumentFragment_toString() {
    return this.childNodes.map(function (node) {
        return String(node);
    }).join("");
};

var event = Event;

function Event(family) {}

Event.prototype.initEvent = function _Event_initEvent(type, bubbles, cancelable) {
    this.type = type;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
};

Event.prototype.preventDefault = function _Event_preventDefault() {};

var document$1 = Document;

function Document() {
    if (!(this instanceof Document)) {
        return new Document();
    }

    this.head = this.createElement("head");
    this.body = this.createElement("body");
    this.documentElement = this.createElement("html");
    this.documentElement.appendChild(this.head);
    this.documentElement.appendChild(this.body);
    this.childNodes = [this.documentElement];
    this.nodeType = 9;
}

var proto = Document.prototype;
proto.createTextNode = function createTextNode(value) {
    return new domText(value, this);
};

proto.createElementNS = function createElementNS(namespace, tagName) {
    var ns = namespace === null ? null : String(namespace);
    return new domElement(tagName, this, ns);
};

proto.createElement = function createElement(tagName) {
    return new domElement(tagName, this);
};

proto.createDocumentFragment = function createDocumentFragment() {
    return new domFragment(this);
};

proto.createEvent = function createEvent(family) {
    return new event(family);
};

proto.createComment = function createComment(data) {
    return new domComment(data, this);
};

proto.getElementById = function getElementById(id) {
    id = String(id);

    var result = index$2(this.childNodes, function (node) {
        if (String(node.id) === id) {
            return node;
        }
    });

    return result || null;
};

proto.getElementsByClassName = domElement.prototype.getElementsByClassName;
proto.getElementsByTagName = domElement.prototype.getElementsByTagName;
proto.contains = domElement.prototype.contains;

proto.removeEventListener = removeEventListener_1;
proto.addEventListener = addEventListener_1;
proto.dispatchEvent = dispatchEvent_1;

var index$1 = new document$1();

var toString$1 = Object.prototype.toString;

var doc = typeof document === 'undefined' ? index$1 : document;

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
    defaultValue: true
};

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
    novalidate: true,
    hidden: true,
    autoFocus: true,
    selected: true
};

var strictProps = {
    volume: true,
    defaultChecked: true,
    value: true
};

function MountedQueue() {
    this.queue = [];
}
MountedQueue.prototype.push = function (fn) {
    this.queue.push(fn);
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
    var ua = navigator.userAgent;
    var index = ua.indexOf('MSIE ');
    if (~index) {
        browser.isIE = true;
        var version = parseInt(ua.substring(index + 5, ua.indexOf('.', index)), 10);
        browser.version = version;
        browser.isIE8 = version === 8;
    }
}

var setTextContent = browser.isIE8 ? function (dom, text) {
    dom.innerText = text;
} : function (dom, text) {
    dom.textContent = text;
};

/** 
 * @fileoverview utility methods
 * @author javey
 * @date 15-4-22
 */

var i = 0;var Type = { JS: i++,
    JSXText: i++,
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

var SelfClosingTags = {
    'area': true,
    'base': true,
    'br': true,
    'col': true,
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
    'v-for-key': true
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
    skipWhitespace: false,
    setModel: function setModel(data, key, value) {

        // return function(e) {
        data[key] = value; //typeof e === 'boolean' ? e : e.target.value;
        // };
    },
    getModel: function getModel(data, key) {
        return data[key];
    }
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

function configure(options) {
    if (options !== undefined) {
        extend(Options, options);
    }
    return Options;
}

function isSelfClosingTag(tag) {
    return SelfClosingTags[tag];
}

function isTextTag(tag) {
    return TextTags[tag];
}

function isDirective(name) {
    return hasOwn.call(Directives, name);
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

function setCheckboxModel(data, key, trueValue, falseValue, e) {
    var value = Options.getModel(data, key),
        checked = e.target.checked;
    if (isArray(value)) {
        value = value.slice(0);
        if (checked) {
            value.push(trueValue);
        } else {
            var index = indexOf(value, trueValue);
            if (~index) {
                value.splice(index, 1);
            }
        }
    } else {
        value = checked ? trueValue : falseValue;
    }
    Options.setModel(data, key, value);
}

function detectCheckboxChecked(data, key, trueValue) {
    var value = Options.getModel(data, key);
    if (isArray(value)) {
        return indexOf(value, trueValue) > -1;
    } else {
        return value === trueValue;
    }
}

function setSelectModel(data, key, e) {
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
    Options.setModel(data, key, value);
}

var error$1 = function () {
    var hasConsole = typeof console !== 'undefined';
    return hasConsole ? function (e) {
        console.error(e);
    } : noop;
}();



var utils = Object.freeze({
	isNullOrUndefined: isNullOrUndefined,
	isArray: isArray,
	indexOf: indexOf,
	Type: Type,
	TypeName: TypeName,
	SelfClosingTags: SelfClosingTags,
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
	extend: extend,
	setCheckboxModel: setCheckboxModel,
	detectCheckboxChecked: detectCheckboxChecked,
	setSelectModel: setSelectModel,
	error: error$1
});

/**
 * inherit
 * @param Parent
 * @param prototype
 * @returns {Function}
 */
function inherit(Parent, prototype) {
    var Child = function Child() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return Parent.apply(this, args);
    };

    Child.prototype = create(Parent.prototype);
    each(prototype, function (proto, name) {
        if (name === 'displayName') {
            Child.displayName = proto;
        }
        if (!isFunction(proto) || name === 'template') {
            Child.prototype[name] = proto;
            return;
        }
        Child.prototype[name] = function () {
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
    });
    Child.__super = Parent.prototype;
    Child.prototype.constructor = Child;

    extend(Child, Parent);

    return Child;
}

var nativeCreate = Object.create;
function create(object) {
    if (nativeCreate) {
        return nativeCreate(object);
    } else {
        var fn = function fn() {};
        fn.prototype = object;
        return new fn();
    }
}

function isFunction(obj) {
    return typeof obj === 'function';
}

function result(obj, property, fallback) {
    var value = isNullOrUndefined(obj) ? undefined : obj[property];
    if (value === undefined) {
        value = fallback;
    }
    return isFunction(value) ? value.call(obj) : value;
}



var toString = Object.prototype.toString;
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

    while (!isNullOrUndefined(object) && index < length) {
        object = object[path[index++]];
    }

    return index && index === length ? object : defaultValue;
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

/**
 * @fileoverview parse jsx to ast
 * @author javey
 * @date 15-4-22
 */

var Type$1 = Type;
var TypeName$1 = TypeName;

var elementNameRegexp = /^<\w+:?\s*[\w\/>]/;

function isJSXIdentifierPart(ch) {
    return ch === 58 || ch === 95 || ch === 45 || ch === 36 || // : and _ (underscore) and - $
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

        return this._parseTemplate();
    },

    _parseTemplate: function _parseTemplate() {
        var elements = [],
            braces = { count: 0 };
        while (this.index < this.length && braces.count >= 0) {
            elements.push(this._advance(braces));
        }

        return elements;
    },

    _advance: function _advance(braces) {
        var ch = this._char();
        if (ch !== '<') {
            return this._scanJS(braces);
        } else {
            return this._scanJSX();
        }
    },

    _scanJS: function _scanJS(braces) {
        var start = this.index,
            Delimiters = this.options.delimiters;

        while (this.index < this.length) {
            var ch = this._char();
            if (ch === '\'' || ch === '"') {
                // skip element(<div>) in quotes
                this._scanStringLiteral();
            } else if (this._isElementStart()) {
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
        if (quote !== '\'' && quote !== '"') {
            this._error('String literal must starts with a qoute');
        }
        this._updateIndex();
        var token = this._scanJSXText([quote]);
        this._updateIndex();
        return token;
    },

    _parseJSXElement: function _parseJSXElement() {
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

        return this._parseAttributeAndChildren(ret);
    },

    _parseAttributeAndChildren: function _parseAttributeAndChildren(ret) {
        var attrs = this._parseJSXAttribute();
        extend(ret, {
            attributes: attrs.attributes,
            directives: attrs.directives,
            children: []
        });
        if (!ret.directives.length) delete ret.directives;

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
            ret.children = this._parseJSXChildren(ret);
        }

        return ret;
    },

    _parseJSXAttribute: function _parseJSXAttribute() {
        var ret = {
            attributes: [],
            directives: []
        };
        while (this.index < this.length) {
            this._skipWhitespace();
            if (this._char() === '/' || this._char() === '>') {
                break;
            } else {
                var attr = this._parseJSXAttributeName();
                if (this._char() === '=') {
                    this._updateIndex();
                    attr.value = this._parseJSXAttributeValue();
                }
                ret[attr.type === Type$1.JSXAttribute ? 'attributes' : 'directives'].push(attr);
            }
        }

        return ret;
    },

    _parseJSXAttributeName: function _parseJSXAttributeName() {
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
            return this._type(Type$1.JSXDirective, { name: name });
        }

        return this._type(Type$1.JSXAttribute, { name: name });
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

    _parseJSXChildren: function _parseJSXChildren(element) {
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

        this._skipWhitespaceBetweenElements(endTag);
        while (this.index < this.length) {
            if (this._isExpect(endTag)) {
                break;
            }
            current = this._parseJSXChild(element, endTag, current);
            children.push(current);
        }
        this._parseJSXClosingElement();
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
            ret = this._parseJSXElement();
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

    _parseJSXClosingElement: function _parseJSXClosingElement() {
        this._expect('</');

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

    _expect: function _expect(str) {
        if (!this._isExpect(str)) {
            this._error('expect string ' + str);
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

    _error: function _error(msg) {
        throw new Error(msg + ' At: {line: ' + this.line + ', column: ' + this.column + '} Near: "' + this.source.slice(this.index - 10, this.index + 20) + '"');
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
        return this._visitJSXExpressionContainer(ast, true);
    },

    _visitJSXExpressionContainer: function _visitJSXExpressionContainer(ast, isRoot) {
        var str = '',
            length = ast.length;
        each(ast, function (element, i) {
            // if is root, add `return` keyword
            if (this.autoReturn && isRoot && i === length - 1) {
                str += 'return ' + this._visit(element, isRoot);
            } else {
                str += this._visit(element, isRoot);
            }
        }, this);

        if (!isRoot && !this.enterStringExpression) {
            // add [][0] for return /* comment */
            str = 'function() {try {return [' + str + '][0]} catch(e) {_e(e)}}.call(this)';
            // str = 'function() {try {return (' + str + ')} catch(e) {_e(e)}}.call(this)';
        }

        return str;
    },

    _visit: function _visit(element, isRoot) {
        element = element || {};
        switch (element.type) {
            case Type$2.JS:
                return this._visitJS(element, isRoot);
            case Type$2.JSXElement:
                return this._visitJSX(element);
            case Type$2.JSXText:
                return this._visitJSXText(element);
            case Type$2.JSXExpressionContainer:
                return this._visitJSXExpressionContainer(element.value);
            case Type$2.JSXWidget:
                return this._visitJSXWidget(element);
            case Type$2.JSXBlock:
                return this._visitJSXBlock(element);
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

    _visitJSX: function _visitJSX(element) {
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

        return this._visitJSXDirective(element, this._visitJSXElement(element));
    },

    _visitJSXElement: function _visitJSXElement(element) {
        var attributes = this._visitJSXAttribute(element, true, true);
        return "h(" + normalizeArgs(["'" + element.value + "'", attributes.props, this._visitJSXChildren(element.children), attributes.className, attributes.key, attributes.ref]) + ')';
    },

    _visitJSXChildren: function _visitJSXChildren(children) {
        var ret = [];
        each(children, function (child) {
            // if this.element has be handled return directly
            if (child._skip) return;
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
                case 'v-else-if':
                case 'v-else':
                    if (element._skip) break;
                    throw new Error(directive.name + ' must be led with v-if. At: {line: ' + element.line + ', column: ' + element.column + '}');
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
            next = element,
            emptyTextNodes = [],
            // persist empty text node, skip them if find v-else-if or v-else
        skipNodes = function skipNodes() {
            each(emptyTextNodes, function (item) {
                item._skip = true;
            });
            emptyTextNodes = [];
        };
        while (next = next.next) {
            if (next.type === Type.JSXText) {
                if (!/^\s*$/.test(next.value)) break;
                // is not the last text node, mark as handled
                else emptyTextNodes.push(next);
            } else if (next.type === Type.JSXElement || next.type === Type.JSXWidget) {
                if (!next.directives || !next.directives.length) break;
                var isContinue = false;
                for (var i = 0, l = next.directives.length; i < l; i++) {
                    var dire = next.directives[i],
                        name = dire.name;
                    if (name === 'v-else-if') {
                        // mark this element as handled
                        next._skip = true;
                        result += this._visitJSXAttributeValue(dire.value) + ' ? ' + this._visit(next) + ' : ';
                        isContinue = true;
                        // mark text node before as handled
                        skipNodes();
                        break;
                    } else if (name === 'v-else') {
                        // mark this element as handled
                        next._skip = true;
                        result += this._visit(next);
                        hasElse = true;
                        // mark text node before as handled
                        skipNodes();
                        break;
                    }
                }
                if (!isContinue) break;
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
            attributes = element.attributes,
            className$$1,
            key,
            ref,
            type = 'text',
            hasModel = false,
            addition = { trueValue: true, falseValue: false };
        each(attributes, function (attr) {
            var name = attrMap(attr.name),
                value = this._visitJSXAttributeValue(attr.value);
            if (name === 'widget' && attr.value.type === Type$2.JSXText) {
                // for compatility v1.0
                // convert widget="a" to ref=(i) => widgets.a = i
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
            } else if (name === 'v-model') {
                hasModel = value;
                return;
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
            }
            ret.push("'" + name + "': " + value);
        }, this);

        if (hasModel) {
            this._visitJSXAttributeModel(element, hasModel, ret, type, addition);
        }

        return {
            props: ret.length ? '{' + ret.join(', ') + '}' : 'null',
            className: className$$1 || 'null',
            ref: ref || 'null',
            key: key || 'null'
        };
    },

    _visitJSXAttributeModel: function _visitJSXAttributeModel(element, value, ret, type, addition) {
        var valueName = 'value',
            eventName = 'change';
        if (element.type === Type$2.JSXElement) {
            switch (element.value) {
                case 'input':
                    valueName = 'value';
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
                                ret.push('\'ev-change\': function(__e) {\n                                    _setModel(self, ' + value + ', __e.target.checked ? ' + trueValue + ' : ' + falseValue + ');\n                                }');
                            } else {
                                if (type === "'radio'") {
                                    ret.push('checked: _getModel(self, ' + value + ') === ' + inputValue);
                                    ret.push('\'ev-change\': function(__e) { \n                                        _setModel(self, ' + value + ', __e.target.checked ? ' + inputValue + ' : ' + falseValue + ');\n                                    }');
                                } else {
                                    ret.push('checked: _detectCheckboxChecked(self, ' + value + ', ' + inputValue + ')');
                                    ret.push('\'ev-change\': function(__e) { \n                                        _setCheckboxModel(self, ' + value + ', ' + inputValue + ', ' + falseValue + ', __e);\n                                    }');
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
                    ret.push('\'ev-change\': function(__e) {\n                        _setSelectModel(self, ' + value + ', __e);\n                    }');
                    return;
                default:
                    break;
            }
            ret.push(valueName + ': _getModel(self, ' + value + ')');
            ret.push('\'ev-' + eventName + '\': function(__e) { _setModel(self, ' + value + ', __e.target.value) }');
        } else if (element.type === Type$2.JSXWidget) {
            ret.push('value: _getModel(self, ' + value + ')');
            ret.push('\'ev-$change:value\': function(__c, __n) { _setModel(self, ' + value + ', __n) }');
        }
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

    _visitJSXWidget: function _visitJSXWidget(element) {
        if (element.children.length) {
            element.attributes.push({ name: 'children', value: element.children });
        }
        var attributes = this._visitJSXAttribute(element, false, false);
        return this._visitJSXDirective(element, 'h(' + normalizeArgs([element.value, attributes.props, 'null', 'null', attributes.key, attributes.ref]) + ')');
    },

    _visitJSXBlock: function _visitJSXBlock(element, isAncestor) {
        arguments.length === 1 && (isAncestor = true);

        return '(_blocks.' + element.value + ' = function(parent) {return ' + this._visitJSXChildren(element.children) + ';}) && (__blocks.' + element.value + ' = function(parent) {\n' + 'var self = this;\n' + 'return blocks.' + element.value + ' ? blocks.' + element.value + '.call(this, function() {\n' + 'return _blocks.' + element.value + '.call(self, parent);\n' + '}) : _blocks.' + element.value + '.call(this, parent);\n' + '})' + (isAncestor ? ' && __blocks.' + element.value + '.call(this)' : '');
    },

    _visitJSXVdt: function _visitJSXVdt(element, isRoot) {
        var ret = ['(function(blocks) {', 'var _blocks = {}, __blocks = extend({}, blocks), _obj = ' + this._visitJSXAttribute(element, false, false).props + ' || {};', 'if (_obj.hasOwnProperty("arguments")) { extend(_obj, _obj.arguments === null ? obj : _obj.arguments); delete _obj.arguments; }', 'return ' + element.value + '.call(this, _obj, _Vdt, '].join('\n'),
            blocks = [];

        each(element.children, function (child) {
            if (child.type === Type$2.JSXBlock) {
                blocks.push(this._visitJSXBlock(child, false));
            }
        }, this);

        ret += (blocks.length ? blocks.join(' && ') + ' && __blocks)' : '__blocks)') + '}).call(this, ' + (isRoot ? 'blocks)' : '{})');

        return ret;
    },

    _visitJSXComment: function _visitJSXComment(element) {
        return 'hc(' + this._visitJSXText(element) + ')';
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
    TextareaElement: 1 << 8
};
Types.FormElement = Types.InputElement | Types.SelectElement | Types.TextareaElement;
Types.Element = Types.HtmlElement | Types.FormElement;
Types.ComponentClassOrInstance = Types.ComponentClass | Types.ComponentInstance;
Types.TextElement = Types.Text | Types.HtmlComment;

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
                type = Types.InputElement;
            } else if (tag === 'select') {
                type = Types.SelectElement;
            } else if (tag === 'textarea') {
                type = Types.TextareaElement;
            } else {
                type = Types.HtmlElement;
            }
            break;
        case 'function':
            if (tag.prototype.init) {
                type = Types.ComponentClass;
            } else {
                return tag(props);
                // type = Types.ComponentFunction;
            }
            break;
        case 'object':
            if (tag.init) {
                return createComponentInstanceVNode(tag);
            }
        default:
            throw new Error('unknown vNode type: ' + tag);
    }

    if (props.children) {
        props.children = normalizeChildren(props.children);
    }

    return new VNode(type, tag, props, normalizeChildren(children), className || props.className, key || props.key, ref || props.ref);
}

function createCommentVNode(children) {
    return new VNode(Types.HtmlComment, null, EMPTY_OBJ, children);
}

function createTextVNode(text) {
    return new VNode(Types.Text, null, EMPTY_OBJ, text);
}



function createComponentInstanceVNode(instance) {
    var props = instance.props || EMPTY_OBJ;
    return new VNode(Types.ComponentInstance, instance.constructor, props, instance, null, props.key, props.ref);
}

function normalizeChildren(vNodes) {
    if (isArray(vNodes)) {
        var childNodes = addChild(vNodes, { index: 0 });
        return childNodes.length ? childNodes : null;
    } else if (isComponentInstance(vNodes)) {
        return createComponentInstanceVNode(vNodes);
    }
    return vNodes;
}

function applyKey(vNode, reference) {
    if (isNullOrUndefined(vNode.key)) {
        vNode.key = '.$' + reference.index++;
    }
    return vNode;
}

function addChild(vNodes, reference) {
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
            newVNodes = newVNodes.concat(addChild(n, reference));
        } else if (isStringOrNumber(n)) {
            if (!newVNodes) {
                newVNodes = vNodes.slice(0, i);
            }
            newVNodes.push(applyKey(createTextVNode(n), reference));
        } else if (isComponentInstance(n)) {
            if (!newVNodes) {
                newVNodes = vNodes.slice(0, i);
            }
            newVNodes.push(applyKey(createComponentInstanceVNode(n), reference));
        } else if (n.type) {
            if (!newVNodes) {
                newVNodes = vNodes.slice(0, i);
            }
            newVNodes.push(applyKey(n, reference));
        }
    }
    return newVNodes || vNodes;
}

var ALL_PROPS = ["altKey", "bubbles", "cancelable", "ctrlKey", "eventPhase", "metaKey", "relatedTarget", "shiftKey", "target", "timeStamp", "type", "view", "which"];
var KEY_PROPS = ["char", "charCode", "key", "keyCode"];
var MOUSE_PROPS = ["button", "buttons", "clientX", "clientY", "layerX", "layerY", "offsetX", "offsetY", "pageX", "pageY", "screenX", "screenY", "toElement"];

var rkeyEvent = /^key|input/;
var rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/;

function Event$2(e) {
    for (var i = 0; i < ALL_PROPS.length; i++) {
        var propKey = ALL_PROPS[i];
        this[propKey] = e[propKey];
    }

    if (!e.target) {
        this.target = e.srcElement;
    }

    this._rawEvent = e;
}
Event$2.prototype.preventDefault = function () {
    var e = this._rawEvent;
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }
};
Event$2.prototype.stopPropagation = function () {
    var e = this._rawEvent;
    e.cancelBubble = true;
    e.stopImmediatePropagation && e.stopImmediatePropagation();
};

function MouseEvent(e) {
    Event$2.call(this, e);
    for (var j = 0; j < MOUSE_PROPS.length; j++) {
        var mousePropKey = MOUSE_PROPS[j];
        this[mousePropKey] = e[mousePropKey];
    }
}
MouseEvent.prototype = createObject(Event$2.prototype);
MouseEvent.prototype.constructor = MouseEvent;

function KeyEvent(e) {
    Event$2.call(this, e);
    for (var j = 0; j < KEY_PROPS.length; j++) {
        var keyPropKey = KEY_PROPS[j];
        this[keyPropKey] = e[keyPropKey];
    }
}
KeyEvent.prototype = createObject(Event$2.prototype);
KeyEvent.prototype.constructor = KeyEvent;

function proxyEvent(e) {
    if (rkeyEvent.test(e.type)) {
        return new KeyEvent(e);
    } else if (rmouseEvent.test(e.type)) {
        return new MouseEvent(e);
    } else {
        return new Event$2(e);
    }
}

var addEventListener$2 = void 0;
var removeEventListener$2 = void 0;
if ('addEventListener' in doc) {
    addEventListener$2 = function addEventListener(name, fn) {
        doc.addEventListener(name, fn, false);
    };

    removeEventListener$2 = function removeEventListener(name, fn) {
        doc.removeEventListener(name, fn);
    };
} else {
    addEventListener$2 = function addEventListener(name, fn) {
        doc.attachEvent("on" + name, fn);
    };

    removeEventListener$2 = function removeEventListener(name, fn) {
        doc.detachEvent("on" + name, fn);
    };
}

var delegatedEvents = {};

function handleEvent(name, lastEvent, nextEvent, dom) {
    if (name === 'blur') {
        name = 'focusout';
    } else if (name === 'focus') {
        name = 'focusin';
    }

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
                removeEventListener$2(name, delegatedRoots.docEvent);
                delete delegatedRoots[name];
            }
        }
    }
}

function dispatchEvent$2(event, target, items, count, isClick) {
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
        dispatchEvent$2(event, parentDom, items, count, isClick);
    }
}

function attachEventToDocument(name, delegatedRoots) {
    var docEvent = function docEvent(event) {
        var count = delegatedRoots.items.size;
        event || (event = window.event);
        if (count > 0) {
            event = proxyEvent(event);
            dispatchEvent$2(event, event.target, delegatedRoots.items, count, event.type === 'click');
        }
    };
    addEventListener$2(name, docEvent);
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

function render(vNode, parentDom, mountedQueue, parentVNode) {
    if (isNullOrUndefined(vNode)) return;
    var isTrigger = true;
    if (mountedQueue) {
        isTrigger = false;
    } else {
        mountedQueue = new MountedQueue();
    }
    var dom = createElement(vNode, parentDom, mountedQueue, true /* isRender */, parentVNode);
    if (isTrigger) {
        mountedQueue.trigger();
    }
    return dom;
}

function createElement(vNode, parentDom, mountedQueue, isRender, parentVNode) {
    var type = vNode.type;
    if (type & Types.Element) {
        return createHtmlElement(vNode, parentDom, mountedQueue, isRender, parentVNode);
    } else if (type & Types.Text) {
        return createTextElement(vNode, parentDom);
    } else if (type & Types.ComponentClassOrInstance) {
        return createComponentClassOrInstance(vNode, parentDom, mountedQueue, null, isRender, parentVNode);
        // } else if (type & Types.ComponentFunction) {
        // return createComponentFunction(vNode, parentDom, mountedQueue, isNotAppendChild, isRender);
        // } else if (type & Types.ComponentInstance) {
        // return createComponentInstance(vNode, parentDom, mountedQueue);
    } else if (type & Types.HtmlComment) {
        return createCommentElement(vNode, parentDom);
    } else {
        throw new Error('unknown vnode type ' + type);
    }
}

function createHtmlElement(vNode, parentDom, mountedQueue, isRender, parentVNode) {
    var dom = doc.createElement(vNode.tag);
    var children = vNode.children;
    var ref = vNode.ref;
    var props = vNode.props;
    var className = vNode.className;

    vNode.dom = dom;

    if (!isNullOrUndefined(children)) {
        createElements(children, dom, mountedQueue, isRender, vNode);
    }

    if (!isNullOrUndefined(className)) {
        dom.className = className;
    }

    if (props !== EMPTY_OBJ) {
        var isFormElement = (vNode.type & Types.FormElement) > 0;
        for (var prop in props) {
            patchProp(prop, null, props[prop], dom, isFormElement);
        }
        if (isFormElement) {
            processForm(vNode, dom, props, true);
        }
    }

    if (!isNullOrUndefined(ref)) {
        createRef(dom, ref, mountedQueue);
    }

    if (parentDom && !dom.parentNode) {
        parentDom.appendChild(dom);
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

function createComponentClassOrInstance(vNode, parentDom, mountedQueue, lastVNode, isRender, parentVNode) {
    var props = vNode.props;
    var instance = vNode.type & Types.ComponentClass ? new vNode.tag(props) : vNode.children;
    instance.parentDom = parentDom;
    instance.mountedQueue = mountedQueue;
    instance.isRender = isRender;
    instance.parentVNode = parentVNode;
    var dom = instance.init(lastVNode, vNode);
    var ref = vNode.ref;

    vNode.dom = dom;
    vNode.children = instance;

    if (parentDom) {
        appendChild(parentDom, vNode);
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



function createElements(vNodes, parentDom, mountedQueue, isRender, parentVNode) {
    if (isStringOrNumber(vNodes)) {
        setTextContent(parentDom, vNodes);
    } else if (isArray(vNodes)) {
        for (var i = 0; i < vNodes.length; i++) {
            createElement(vNodes[i], parentDom, mountedQueue, isRender, parentVNode);
        }
    } else {
        createElement(vNodes, parentDom, mountedQueue, isRender, parentVNode);
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

function removeElement(vNode, parentDom) {
    var type = vNode.type;
    if (type & Types.Element) {
        return removeHtmlElement(vNode, parentDom);
    } else if (type & Types.TextElement) {
        return removeText(vNode, parentDom);
    } else if (type & Types.ComponentClassOrInstance) {
        return removeComponentClassOrInstance(vNode, parentDom);
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
            handleEvent(name.substr(0, 3), prop, null, dom);
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
        instance.destroy(vNode, nextVNode);
    }

    if (ref) {
        ref(null);
    }

    // instance destroy method will remove everything
    // removeElements(vNode.props.children, null);

    if (parentDom) {
        // if (typeof instance.unmount === 'function') {
        // if (!instance.unmount(vNode, nextVNode, parentDom)) {
        // parentDom.removeChild(vNode.dom); 
        // }
        // } else {
        // parentDom.removeChild(vNode.dom); 
        removeChild(parentDom, vNode);
        // }
        // parentDom.removeChild(vNode.dom);
    }
}



function replaceChild(parentDom, lastVNode, nextVNode) {
    var lastDom = lastVNode.dom;
    var nextDom = nextVNode.dom;
    if (!parentDom) parentDom = lastDom.parentNode;
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

function appendChild(parentDom, vNode) {
    var dom = vNode.dom;
    // for animation the dom will not be moved
    if (!dom.parentNode) {
        parentDom.appendChild(dom);
    }
    // if (dom._mount) {
    // dom._mount(vNode, parentDom);
    // }
}

function createRef(dom, ref, mountedQueue) {
    if (typeof ref === 'function') {
        mountedQueue.push(function () {
            return ref(dom);
        });
    } else {
        throw new Error('ref must be a function, but got "' + JSON.stringify(ref) + '"');
    }
}

function patch(lastVNode, nextVNode, parentDom, parentVNode) {
    var mountedQueue = new MountedQueue();
    var dom = patchVNode(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode);
    mountedQueue.trigger();
    return dom;
}

function patchVNode(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode) {
    if (lastVNode !== nextVNode) {
        var nextType = nextVNode.type;
        var lastType = lastVNode.type;

        if (nextType & Types.Element) {
            if (lastType & Types.Element) {
                patchElement(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode);
            } else {
                replaceElement(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode);
            }
        } else if (nextType & Types.TextElement) {
            if (lastType & Types.TextElement) {
                patchText(lastVNode, nextVNode);
            } else {
                replaceElement(lastVNode, nextVNode, parentDom, mountedQueue);
            }
        } else if (nextType & Types.ComponentClass) {
            if (lastType & Types.ComponentClass) {
                patchComponentClass(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode);
            } else {
                replaceElement(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode);
            }
            // } else if (nextType & Types.ComponentFunction) {
            // if (lastType & Types.ComponentFunction) {
            // patchComponentFunction(lastVNode, nextVNode, parentDom, mountedQueue);
            // } else {
            // replaceElement(lastVNode, nextVNode, parentDom, mountedQueue);
            // }
        } else if (nextType & Types.ComponentInstance) {
            if (lastType & Types.ComponentInstance) {
                patchComponentIntance(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode);
            } else {
                replaceElement(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode);
            }
        }
    }
    return nextVNode.dom;
}

function patchElement(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode) {
    var dom = lastVNode.dom;
    var lastProps = lastVNode.props;
    var nextProps = nextVNode.props;
    var lastChildren = lastVNode.children;
    var nextChildren = nextVNode.children;
    var nextRef = nextVNode.ref;
    var lastClassName = lastVNode.className;
    var nextClassName = nextVNode.className;

    nextVNode.dom = dom;

    if (lastVNode.tag !== nextVNode.tag) {
        replaceElement(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode);
    } else {
        if (lastChildren !== nextChildren) {
            patchChildren(lastChildren, nextChildren, dom, mountedQueue, nextVNode);
        }

        if (lastProps !== nextProps) {
            patchProps(lastVNode, nextVNode);
        }

        if (lastClassName !== nextClassName) {
            if (isNullOrUndefined(nextClassName)) {
                dom.removeAttribute('class');
            } else {
                dom.className = nextClassName;
            }
        }

        if (!isNullOrUndefined(nextRef) && lastVNode.ref !== nextRef) {
            createRef(dom, nextRef, mountedQueue);
        }
    }
}

function patchComponentClass(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode) {
    var lastTag = lastVNode.tag;
    var nextTag = nextVNode.tag;
    var dom = lastVNode.dom;

    var instance = void 0;
    var newDom = void 0;

    if (lastTag !== nextTag || lastVNode.key !== nextVNode.key) {
        // we should call this function in component's init method
        // because it should be destroyed before async component has rendered
        // removeComponentClassOrInstance(lastVNode, null, nextVNode);
        newDom = createComponentClassOrInstance(nextVNode, parentDom, mountedQueue, lastVNode, false, parentVNode);
    } else {
        instance = lastVNode.children;
        newDom = instance.update(lastVNode, nextVNode);
        nextVNode.dom = newDom;
        nextVNode.children = instance;
    }

    // perhaps the dom has be replaced
    if (dom !== newDom && dom.parentNode) {
        replaceChild(parentDom, lastVNode, nextVNode);
    }
}

function patchComponentIntance(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode) {
    var lastInstance = lastVNode.children;
    var nextInstance = nextVNode.children;
    var dom = lastVNode.dom;

    var newDom = void 0;

    if (lastInstance !== nextInstance) {
        // removeComponentClassOrInstance(lastVNode, null, nextVNode);
        newDom = createComponentClassOrInstance(nextVNode, parentDom, mountedQueue, lastVNode, false, parentVNode);
    } else {
        newDom = lastInstance.update(lastVNode, nextVNode);
        nextVNode.dom = newDom;
    }

    if (dom !== newDom && dom.parentNode) {
        replaceChild(parentDom, lastVNode, nextVNode);
    }
}

function patchChildren(lastChildren, nextChildren, parentDom, mountedQueue, parentVNode) {
    if (isNullOrUndefined(lastChildren)) {
        if (!isNullOrUndefined(nextChildren)) {
            createElements(nextChildren, parentDom, mountedQueue, false, parentVNode);
        }
    } else if (isNullOrUndefined(nextChildren)) {
        removeElements(lastChildren, parentDom);
    } else if (isStringOrNumber(nextChildren)) {
        if (isStringOrNumber(lastChildren)) {
            parentDom.firstChild.nodeValue = nextChildren;
        } else {
            removeElements(lastChildren, parentDom);
            setTextContent(parentDom, nextChildren);
        }
    } else if (isArray(lastChildren)) {
        if (isArray(nextChildren)) {
            patchChildrenByKey(lastChildren, nextChildren, parentDom, mountedQueue, parentVNode);
        } else {
            removeElements(lastChildren, parentDom);
            createElement(nextChildren, parentDom, mountedQueue, false, parentVNode);
        }
    } else if (isArray(nextChildren)) {
        removeElement(lastChildren, parentDom);
        createElements(nextChildren, parentDom, mountedQueue, false, parentVNode);
    } else if (isStringOrNumber(lastChildren)) {
        setTextContent(parentDom, '');
        createElement(nextChildren, parentDom, mountedQueue, false, parentVNode);
    } else {
        patchVNode(lastChildren, nextChildren, parentDom, mountedQueue, parentVNode);
    }
}

function patchChildrenByKey(a, b, dom, mountedQueue, parentVNode) {
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
            patchVNode(aStartNode, bStartNode, dom, mountedQueue, parentVNode);
            ++aStart;
            ++bStart;
            if (aStart > aEnd || bStart > bEnd) {
                break outer;
            }
            aStartNode = a[aStart];
            bStartNode = b[bStart];
        }
        while (aEndNode.key === bEndNode.key) {
            patchVNode(aEndNode, bEndNode, dom, mountedQueue, parentVNode);
            --aEnd;
            --bEnd;
            if (aEnd < aStart || bEnd < bStart) {
                break outer;
            }
            aEndNode = a[aEnd];
            bEndNode = b[bEnd];
        }

        if (aEndNode.key === bStartNode.key) {
            patchVNode(aEndNode, bStartNode, dom, mountedQueue, parentVNode);
            dom.insertBefore(bStartNode.dom, aStartNode.dom);
            --aEnd;
            ++bStart;
            aEndNode = a[aEnd];
            bStartNode = b[bStart];
            continue;
        }

        if (aStartNode.key === bEndNode.key) {
            patchVNode(aStartNode, bEndNode, dom, mountedQueue, parentVNode);
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
            insertOrAppend(bEnd, bLength, createElement(b[bStart], null, mountedQueue, false, parentVNode), b, dom);
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
                            patchVNode(aNode, bNode, dom, mountedQueue, parentVNode);
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
                        patchVNode(aNode, bNode, dom, mountedQueue, parentVNode);
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
                createElement(b[bStart], dom, mountedQueue, false, parentVNode);
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
                        insertOrAppend(pos, b.length, createElement(b[pos], null, mountedQueue, false, parentVNode), b, dom);
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
                        insertOrAppend(pos, b.length, createElement(b[pos], null, mountedQueue, false, parentVNode), b, dom);
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

function insertOrAppend(pos, length, newDom, nodes, dom) {
    var nextPos = pos + 1;
    if (nextPos < length) {
        dom.insertBefore(newDom, nodes[nextPos].dom);
    } else {
        appendChild(dom, newDom);
    }
}

function replaceElement(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode) {
    removeElement(lastVNode, null);
    createElement(nextVNode, null, mountedQueue, false, parentVNode);
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

function patchProps(lastVNode, nextVNode) {
    var lastProps = lastVNode.props;
    var nextProps = nextVNode.props;
    var dom = nextVNode.dom;
    var prop = void 0;
    if (nextProps !== EMPTY_OBJ) {
        var isFormElement = (nextVNode.type & Types.FormElement) > 0;
        for (prop in nextProps) {
            patchProp(prop, lastProps[prop], nextProps[prop], dom, isFormElement);
        }
        if (isFormElement) {
            processForm(nextVNode, dom, nextProps, false);
        }
    }
    if (lastProps !== EMPTY_OBJ) {
        for (prop in lastProps) {
            if (!(prop in nextProps)) {
                removeProp(prop, lastProps[prop], dom);
            }
        }
    }
}

function patchProp(prop, lastValue, nextValue, dom, isFormElement) {
    if (lastValue !== nextValue) {
        if (skipProps[prop] || isFormElement && prop === 'value') {
            return;
        } else if (booleanProps[prop]) {
            dom[prop] = !!nextValue;
        } else if (strictProps[prop]) {
            var value = isNullOrUndefined(nextValue) ? '' : nextValue;
            if (dom[prop] !== value) {
                dom[prop] = value;
            }
            // add a private property _value for select an object
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
            dom.setAttribute(prop, nextValue);
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

var removeDataset = browser.isIE ? function (lastValue, dom) {
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
function kebabCase(word) {
    if (!_cache[word]) {
        _cache[word] = word.replace(/[A-Z]/g, function (item) {
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



var miss = Object.freeze({
	h: createVNode,
	patch: patch,
	render: render,
	hc: createCommentVNode,
	remove: removeElement,
	MountedQueue: MountedQueue
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
}
Vdt$1.prototype = {
    constructor: Vdt$1,

    render: function render$$1(data, parentDom, queue, parentVNode) {
        this.renderVNode(data);
        this.node = render(this.vNode, parentDom, queue, parentVNode);

        return this.node;
    },
    renderVNode: function renderVNode(data) {
        if (data !== undefined) {
            this.data = data;
        }
        this.vNode = this.template(this.data, Vdt$1);

        return this.vNode;
    },
    renderString: function renderString(data) {
        var node = this.render(data);

        return node.outerHTML || node.toString();
    },
    update: function update(data, parentDom, parentVNode) {
        var oldVNode = this.vNode;
        this.renderVNode(data);
        this.node = patch(oldVNode, this.vNode, parentDom, parentVNode);

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

            hscript = ['_Vdt || (_Vdt = Vdt);', 'obj || (obj = {});', 'blocks || (blocks = {});', 'var h = _Vdt.miss.h, hc = _Vdt.miss.hc, widgets = this && this.widgets || {}, _blocks = {}, __blocks = {},', '__u = _Vdt.utils, extend = __u.extend, _e = __u.error, _className = __u.className,', '__o = __u.Options, _getModel = __o.getModel, _setModel = __o.setModel,', '_setCheckboxModel = __u.setCheckboxModel, _detectCheckboxChecked = __u.detectCheckboxChecked,', '_setSelectModel = __u.setSelectModel,', (options.server ? 'require = function(file) { return _Vdt.require(file, "' + options.filename.replace(/\\/g, '\\\\') + '") }, ' : '') + 'self = this.data, scope = obj;', options.noWith ? hscript : ['with (obj) {', hscript, '}'].join('\n')].join('\n');
            templateFn = options.onlySource ? function () {} : new Function('obj', '_Vdt', 'blocks', hscript);
            templateFn.source = 'function(obj, _Vdt, blocks) {\n' + hscript + '\n}';
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
Vdt$1.utils = utils;
Vdt$1.setDelimiters = setDelimiters;
Vdt$1.getDelimiters = getDelimiters;
Vdt$1.configure = configure;

// for compatibility v1.0
Vdt$1.virtualDom = miss;

function Intact$1(props) {
    var _this = this;

    if (!this.template) {
        throw new Error('Can not instantiate when this.template does not exist.');
    }

    props = extend({}, result(this, 'defaults'), props);

    this._events = {};
    this.props = {};
    this.vdt = Vdt$1(this.template);
    this.set(props, { silent: true });

    // for compatibility v1.0
    this.widgets = this.vdt.widgets || {};
    this._widget = this.props.widget || uniqueId('widget');
    this.attributes = this.props;

    this.uniqueId = this._widget;

    this.inited = false;
    this.rendered = false;
    this.mounted = false;
    this.destroyed = false;

    // if the flag is false, every set operation will not lead to update 
    this._startRender = false;

    // for debug
    this.displayName = this.displayName;

    this.addEvents();

    this._updateCount = 0;

    var inited = function inited() {
        _this.inited = true;
        // 为了兼容之前change事件必update的用法
        // this.on('change', () => this.update());
        _this.trigger('$inited', _this);
    };
    var ret = this._init();
    if (ret && ret.then) {
        ret.then(inited);
    } else {
        inited();
    }
}

Intact$1.prototype = {
    constructor: Intact$1,

    addEvents: function addEvents() {
        var _this2 = this;

        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

        each(props, function (value, key) {
            if (isEventProp(key) && isFunction(value)) {
                _this2.on(key.substr(3), value);
            }
        });
    },
    _init: function _init(props) {},
    _create: function _create(lastVNode, nextVNode) {},
    _mount: function _mount(lastVNode, nextVNode) {},
    _beforeUpdate: function _beforeUpdate(lastVNode, nextVNode) {},
    _update: function _update(lastVNode, nextVNode) {},
    _destroy: function _destroy(lastVNode, nextVNode) {},
    _unmount: function _unmount(lastVNode, nextVNode, parentDom) {
        return true;
    },
    init: function init(lastVNode, nextVNode) {
        var _this3 = this;

        var vdt = this.vdt;
        this._lastVNode = lastVNode;
        if (!this.inited) {
            // 支持异步组件
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
                var vNode = createCommentVNode('');
                placeholder = render(vNode);
                vdt.vNode = vNode;
            }
            this.one('$inited', function () {
                var element = _this3.init(lastVNode, nextVNode);
                var dom = nextVNode.dom;
                if (!lastVNode || lastVNode.key !== nextVNode.key) {
                    nextVNode.dom = element;
                    dom.parentNode.replaceChild(element, dom);
                    _this3._triggerMountedQueue();
                }
                _this3.mount(lastVNode, nextVNode);
            });
            vdt.node = placeholder;
            return placeholder;
        }

        this._startRender = true;
        // 如果key不相同，则不复用dom，直接返回新dom来替换
        if (lastVNode && lastVNode.key === nextVNode.key) {
            // destroy the last component
            if (!lastVNode.children.destroyed) {
                removeComponentClassOrInstance(lastVNode, null, nextVNode);
            }

            // make the dom not be replaced, but update the last one
            vdt.vNode = lastVNode.children.vdt.vNode;
            this.element = vdt.update(this, this.parentDom, nextVNode);
        } else {
            if (lastVNode) {
                removeComponentClassOrInstance(lastVNode, null, nextVNode);
            }
            this.element = vdt.render(this, this.parentDom, this.mountedQueue, nextVNode);
        }
        this.rendered = true;
        if (this._pendingUpdate) {
            this._pendingUpdate();
            this._pendingUpdate = null;
        }
        this.trigger('$rendered', this);
        this._create(lastVNode, nextVNode);

        return this.element;
    },
    mount: function mount(lastVNode, nextVNode) {
        // 异步组件，直接返回
        if (!this.inited) return;
        this.mounted = true;
        this.trigger('$mounted', this);
        this._mount(lastVNode, nextVNode);
    },
    update: function update(lastVNode, nextVNode) {
        // 如果该组件已被销毁，则不更新
        if (this.destroyed) {
            return lastVNode ? lastVNode.dom : undefined;
        }
        // 如果还没有渲染，则等待结束再去更新
        if (!this.rendered) {
            this._pendingUpdate = function () {
                this.update(lastVNode, nextVNode);
            };
            return lastVNode ? lastVNode.dom : undefined;
        }

        ++this._updateCount;
        if (this._updateCount > 1) return this.element;
        if (this._updateCount === 1) return this.__update(lastVNode, nextVNode);
    },
    __update: function __update(lastVNode, nextVNode) {
        // 如果不存在nextVNode，则为直接调用update方法更新自己
        // 否则则是父组件触发的子组件更新，此时需要更新一些状态
        if (nextVNode) {
            this._patchProps(lastVNode.props, nextVNode.props);
        }

        this._beforeUpdate(lastVNode, nextVNode);
        this.element = this.vdt.update(this);
        this._update(lastVNode, nextVNode);

        if (--this._updateCount > 0) {
            // 如果更新完成，发现还有更新，则是在更新过程中又触发了更新
            // 此时直接将_updateCount置为1，因为所有数据都已更新，只做最后一次模板更新即可
            // --this._updateCount会将该值设为0，所以这里设为1
            this._updateCount = 1;
            return this.__update();
        }

        return this.element;
    },
    _patchProps: function _patchProps(lastProps, nextProps) {
        lastProps = lastProps || EMPTY_OBJ;
        nextProps = nextProps || EMPTY_OBJ;
        var lastValue = void 0;
        var nextValue = void 0;
        if (lastProps !== nextProps) {
            // 需要先处理事件，因为prop变更可能触发相应的事件
            var lastPropsWithoutEvents = void 0;
            var nextPropsWithoutEvents = void 0;
            if (nextProps !== EMPTY_OBJ) {
                for (var prop in nextProps) {
                    nextValue = nextProps[prop];
                    if (isEventProp(prop)) {
                        this.set(prop, nextValue, { silent: true });
                        lastValue = lastProps[prop];
                        if (isFunction(nextValue)) {
                            // 更换事件监听函数
                            var eventName = prop.substr(3);
                            if (isFunction(lastValue)) {
                                this.off(eventName, lastValue);
                            }
                            this.on(eventName, nextValue);
                        } else if (isFunction(lastValue)) {
                            // 解绑事件监听函数
                            this.off(prop.substr(3), lastValue);
                        }
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
                            lastValue = lastProps[_prop];
                            if (isEventProp(_prop) && isFunction(lastValue)) {
                                this.set(_prop, undefined, { silent: true });
                                // 如果是事件，则要解绑事件
                                this.off(_prop.substr(3), lastValue);
                            } else {
                                if (!lastPropsWithoutEvents) {
                                    lastPropsWithoutEvents = {};
                                }
                                lastPropsWithoutEvents[_prop] = lastValue;
                            }
                        }
                    }
                }

                if (nextPropsWithoutEvents) {
                    this.set(nextPropsWithoutEvents, { update: false });
                }
            } else {
                for (var _prop2 in lastProps) {
                    lastValue = lastProps[_prop2];
                    if (isEventProp(_prop2) && isFunction(lastValue)) {
                        this.set(_prop2, undefined, { silent: true });
                        // 如果是事件，则要解绑事件
                        this.off(_prop2.substr(3), lastValue);
                    } else {
                        if (!lastPropsWithoutEvents) {
                            lastPropsWithoutEvents = {};
                        }
                        lastPropsWithoutEvents[_prop2] = lastValue;
                    }
                }
            }

            // 将不存在nextProps中，但存在lastProps中的属性，统统置为空
            if (lastPropsWithoutEvents) {
                for (var _prop3 in lastPropsWithoutEvents) {
                    this.set(_prop3, undefined, { update: false });
                }
            }
        }
    },
    destroy: function destroy(lastVNode, nextVNode) {
        if (this.destroyed) {
            return console.warn('destroyed multiple times');
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
        } else if (!nextVNode || nextVNode.key !== lastVNode.key) {
            vdt.destroy();
        }
        this._destroy(lastVNode, nextVNode);
        this.off();
        this.destroyed = true;
    },
    unmount: function unmount(lastVNode, nextVNode, parentDom) {
        return this._unmount(lastVNode, nextVNode, parentDom);
    },


    get: function _get(key, defaultValue) {
        if (key === undefined) return this.props;

        return get$$1(this.props, key, defaultValue);
    },

    set: function _set(key, val, options) {
        var _this4 = this;

        if (isNullOrUndefined(key)) return this;

        var isSetByObject = false;
        if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
            options = val;
            isSetByObject = true;
        }
        options = extend({
            silent: false,
            update: true,
            async: false
        }, options);
        // 兼容老版本
        if (hasOwn.call(options, 'global')) {
            options.update = options.global;
        }

        var props = this.props;
        var changes = {};

        var hasChanged = false;

        // 前面做了undefined的判断，这里不可能为undefined了
        if (isSetByObject) {
            if (!options.silent) {
                for (var prop in key) {
                    var nextValue = key[prop];
                    var lastValue = props[prop];
                    if (!isEqual(lastValue, nextValue)) {
                        changes[prop] = [lastValue, nextValue];
                        hasChanged = true;
                    }
                    // 即使相等，也要重新复制，因为有可能引用地址变更
                    props[prop] = nextValue;
                }
            } else {
                // 如果静默更新，则直接赋值
                extend(props, key);
            }
        } else {
            if (!options.silent) {
                var _lastValue2 = get$$1(props, key);
                if (!isEqual(_lastValue2, val)) {
                    if (!hasOwn.call(props, key)) {
                        changes[key] = [_lastValue2, val];
                        var path = castPath(key);
                        // 如果是像'a.b.c'这样设置属性，而该属性不存在
                        // 依次触发change:a.b.c、change:a.b、change:a这样的事件
                        // 先不设置props，去取老值
                        var _props = [];
                        for (var i = path.length - 1; i > 0; i--) {
                            var _prop4 = path.slice(0, i).join('.');
                            var _lastValue = get$$1(props, _prop4);
                            changes[_prop4] = [_lastValue];
                            _props.push(_prop4);
                        }
                        // 设置props后，去取新值
                        // 对于引用数据类型，新老值可能一样
                        set$$1(props, key, val);
                        for (var _i = 0; _i < _props.length; _i++) {
                            var _prop5 = _props[_i];
                            changes[_prop5].push(get$$1(props, _prop5));
                        }
                    } else {
                        // 否则，只触发change:a.b.c
                        changes[key] = [_lastValue2, val];
                        set$$1(props, key, val);
                    }

                    hasChanged = true;
                } else {
                    set$$1(props, key, val);
                }
            } else {
                set$$1(props, key, val);
            }
        }

        if (hasChanged) {
            // trigger `change*` events
            for (var _prop6 in changes) {
                var values$$1 = changes[_prop6];
                this.trigger('$change:' + _prop6, this, values$$1[1], values$$1[0]);
            }
            var changeKeys = keys(changes);
            // 之前存在触发change就会调用update的用法，这里传入true做兼容
            // 如果第三个参数为true，则不update
            this.trigger('$change', this, changeKeys);

            if (options.update && this._startRender) {
                clearTimeout(this._asyncUpdate);
                var triggerChange = function triggerChange() {
                    _this4.update();
                    for (var _prop7 in changes) {
                        var _values = changes[_prop7];
                        _this4.trigger('$changed:' + _prop7, _this4, _values[1], _values[0]);
                    }
                    _this4.trigger('$changed', _this4, changeKeys);
                };
                if (options.async) {
                    this._asyncUpdate = setTimeout(triggerChange);
                } else {
                    triggerChange();
                }
            }
        }

        return this;
    },

    on: function on(name, callback) {
        (this._events[name] || (this._events[name] = [])).push(callback);

        return this;
    },
    one: function one(name, callback) {
        var _this5 = this;

        var fn = function fn() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            callback.apply(_this5, args);
            _this5.off(name, fn);
        };
        this.on(name, fn);

        return this;
    },
    off: function off(name, callback) {
        if (name === undefined) {
            this._events = {};
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
                i--;
            }
        }

        return this;
    },
    trigger: function trigger(name) {
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
    },
    _initMountedQueue: function _initMountedQueue() {
        this.mountedQueue = new Vdt$1.miss.MountedQueue();
    },
    _triggerMountedQueue: function _triggerMountedQueue() {
        this.mountedQueue.trigger();
    }
};

/**
 * @brief 继承某个组件
 *
 * @param prototype
 */
Intact$1.extend = function () {
    var prototype = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    prototype.defaults = extend({}, this.prototype.defaults, prototype.defaults);
    return inherit(this, prototype);
};

/**
 * 挂载组件到dom中
 * @param Component {Intact} Intact类或子类
 * @param node {Node} html节点
 */
Intact$1.mount = function (Component, node) {
    if (!Component || !(Component.prototype instanceof Intact$1 || Component === Intact$1)) {
        throw new Error('expect for a class component');
    }
    var c = new Component();
    c.parentDom = node;
    // c._initMountedQueue();
    var dom = void 0;
    if (c.inited) {
        dom = c.init();
        // node.appendChild(dom);
        c.mount();
    } else {
        c.one('$inited', function () {
            dom = c.init();
            // node.appendChild(dom);
            c.mount();
        });
    }
    return c;
};

var A = Intact$1.extend({
    defaults: {
        'a:tag': 'div',
        'a:transition': 'animate',
        'a:appear': false
    },

    template: function template() {
        var h = Vdt$1.miss.h;
        var data = this.data;
        var tagName = data.get('a:tag');
        var props = {};
        var _props = data.get();
        for (var key in data.get()) {
            if (key[0] !== 'a' || key[1] !== ':') {
                props[key] = _props[key];
            }
        }
        return h(tagName, props, data.get('children'));
    },
    init: function init(lastVNode, nextVNode) {
        var parentDom = this.parentDom;
        if (parentDom && parentDom._reserve) {
            lastVNode = parentDom._reserve[nextVNode.key];
        }
        return this._super(lastVNode, nextVNode);
    },
    _mount: function _mount(lastVNode, vNode) {
        var _this = this;

        var isAppear = false;
        if (this.isRender) {
            var parent = void 0;
            if (this.get('a:appear') && (this.parentDom || (parent = this.parentVNode) && parent.type & Types.ComponentClassOrInstance && !parent.children.isRender)) {
                isAppear = true;
            }
        }

        var transition = this.get('a:transition');
        var element = this.element;

        var enterClass = void 0;
        var enterActiveClass = void 0;
        if (isAppear) {
            enterClass = transition + '-appear';
            enterActiveClass = transition + '-appear-active';
        } else {
            enterClass = transition + '-enter';
            enterActiveClass = transition + '-enter-active';
        }

        this._enterEnd = function (e) {
            e && e.stopPropagation();
            removeClass(element, enterClass);
            removeClass(element, enterActiveClass);
            _this._entering = false;
            TransitionEvents.off(element, _this._enterEnd);
        };

        if (this._lastVNode) {
            var lastInstance = this._lastVNode.children;
            if (lastInstance._leaving) {
                TransitionEvents.off(element, lastInstance._leaveEnd);
                lastInstance._unmountCancelled = true;
                lastInstance._leaveEnd();
            }
        }

        if (isAppear || !this.isRender) {
            this._entering = true;
            this._enter(this._enterEnd, enterClass, enterActiveClass);
        }

        element._unmount = function (nouse, parentDom) {
            _this._unmount(lastVNode, vNode, parentDom);
        };
    },
    _unmount: function _unmount(lastVNode, vNode, parentDom) {
        var _this2 = this;

        var element = this.element;
        var transition = this.get('a:transition');

        if (!parentDom._reserve) {
            parentDom._reserve = {};
        }
        parentDom._reserve[vNode.key] = vNode;

        this._leaving = true;

        if (this._entering) {
            TransitionEvents.off(element, this._enterEnd);
            this._enterEnd();
        }

        this._leaveEnd = function (e) {
            e && e.stopPropagation();
            removeClass(element, transition + '-leave');
            removeClass(element, transition + '-leave-active');
            if (!_this2._unmountCancelled) {
                parentDom.removeChild(element);
            }
            _this2._leaving = false;
            delete parentDom._reserve[vNode.key];
            TransitionEvents.off(element, _this2._leaveEnd);
        };

        this._leave(this._leaveEnd);
    },
    _enter: function _enter(done, enterClass, enterActiveClass) {
        var element = this.element;

        addClass(element, enterClass);
        TransitionEvents.on(element, done);
        // element.offsetWidth;
        nextFrame(function () {
            addClass(element, enterActiveClass);
        });
    },
    _leave: function _leave(done) {
        var transition = this.get('a:transition');
        var element = this.element;
        addClass(element, transition + '-leave');
        TransitionEvents.on(element, done);
        // element.offsetWidth;
        nextFrame(function () {
            addClass(element, transition + '-leave-active');
        });
    }
});

var raf = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : setTimeout;
function nextFrame(fn) {
    raf(function () {
        return raf(fn);
    });
}

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
                break;
            }
        }
    }
}

detectEvents();

function addEventListener$3(node, eventName, eventListener) {
    node.addEventListener(eventName, eventListener, false);
}

function removeEventListener$3(node, eventName, eventListener) {
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
            addEventListener$3(node, endEvent, eventListener);
        });
    },

    off: function off(node, eventListener) {
        if (endEvents.length === 0) {
            return;
        }
        endEvents.forEach(function (endEvent) {
            removeEventListener$3(node, endEvent, eventListener);
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

// import Animate from './animate';
Intact$1.prototype.Animate = A;
// Intact.Animate = Animate;
Intact$1.Animate = A;
Intact$1.Vdt = Vdt$1;
Vdt$1.configure({
    getModel: function getModel(self, key) {
        return self.get(key);
    },
    setModel: function setModel(self, key, value) {
        // self.set(key, value, {async: true});
        self.set(key, value);
    }
});

module.exports = Intact$1;
