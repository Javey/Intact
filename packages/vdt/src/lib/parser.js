/**
 * @fileoverview parse jsx to ast
 * @author javey
 * @date 15-4-22
 */

import * as Utils from './utils';

const {Type, TypeName} = Utils;
const elementNameRegexp = /^<\w+:?\s*[\{\w\/>]/;
const emptyRegexp = /^\s*$/;
// const importRegexp = /^\s*\bimport\b/;

function isJSIdentifierPart(ch) {
    return (ch === 95) || ch === 36 ||  // _ (underscore) $
        (ch >= 65 && ch <= 90) ||         // A..Z
        (ch >= 97 && ch <= 122) ||        // a..z
        (ch >= 48 && ch <= 57);         // 0..9
}

function isJSXIdentifierPart(ch) {
    return (ch === 58) || (ch === 45) || ch === 46 || isJSIdentifierPart(ch);  // : - .
}

export default function Parser() {
    this.source = '';
    this.index = 0;
    this.length = 0;
}

Parser.prototype = {
    constructor: Parser,

    parse: function(source, options) {
        this.source = Utils.trimRight(source);
        this.index = 0;
        this.line = 1;
        this.column = 0;
        this.length = this.source.length;

        this.options = Utils.extend({}, Utils.configure(), options);

        return this._parseTemplate(true);
    },

    _parseTemplate: function(isRoot) {
        var elements = [],
            braces = {count: 0};
        while (this.index < this.length && braces.count >= 0) {
            elements.push(this._advance(braces, isRoot));
        }

        return elements;
    },

    _advance: function(braces, isRoot) {
        var ch = this._char();
        if (isRoot && this._isJSImport()) {
            return this._scanJSImport();
        } else if (ch !== '<') {
            return this._scanJS(braces, isRoot);
        } else {
            return this._scanJSX();
        }
    },

    _scanJS: function(braces, isRoot) {
        var start = this.index,
            tmp,
            Delimiters = this.options.delimiters,
            element = this._type(Type.JS);

        while (this.index < this.length) {
            this._skipJSComment();
            var ch = this._char();
            var tmp;
            if (
                ch === '\'' || ch === '"' || ch === '`' ||
                // is a RegExp, treat it as literal sting
                ch === '/' && 
                // is not /* and //, this is comment
                (tmp = this._char(this.index + 1)) && tmp !== '*' && tmp !== '/' && (
                    // is the first char
                    this.index === 0 || 
                    // is not </, this is a end tag
                    (tmp = this._char(this.index - 1)) && tmp !== '<' &&
                    // is not a sign of division
                    // FIXME: expect `if (a > 1) /test/`
                    (tmp = this._getLastCharCode()) && !isJSIdentifierPart(tmp) && tmp !== 41 // )
                )
            ) {
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

    _scanJSImport() {
        var start = this.index,
            element = this._type(Type.JSImport);

        this._updateIndex(7); // 'import '.length
        while (this.index < this.length) {
            var ch = this._char();
            if (ch === '\'' || ch === '"') {
                this._scanStringLiteral();
                let start;
                do {
                    start = this.index;
                    this._skipWhitespaceAndJSComment();
                    if (this._char() === ';') {
                        this._updateIndex();
                    }
                } while (start !== this.index);
                break;
            } else {
                this._updateIndex();
            }
        }

        element.value = this.source.slice(start, this.index);

        return element;
    },

    _scanStringLiteral: function() {
        var quote = this._char(),
            start = this.index,
            str = '',
            element = this._type(Type.StringLiteral);

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

    _scanJSX: function() {
        return this._parseJSXElement();
    },

    _scanJSXText: function(stopChars) {
        var start = this.index,
            l = stopChars.length,
            i,
            charCode,
            element = this._type(Type.JSXText);

        loop:
        while (this.index < this.length) {
            charCode = this._charCode();
            if (Utils.isWhiteSpace(charCode)) {
                if (charCode === 10) {
                    this._updateLine();
                }
            } else {
                for (i = 0; i < l; i++) {
                    if (typeof stopChars[i] === 'function' && stopChars[i].call(this) || 
                        this._isExpect(stopChars[i])
                    ) {
                        break loop;
                    }
                }
            }
            this._updateIndex();
        }

        element.value = this.source.slice(start, this.index);

        return element;
    },

    _scanJSXStringLiteral: function() {
        var quote = this._char();
        if (quote !== '\'' && quote !== '"' && quote !== '`') {
            this._error('String literal must starts with a qoute');
        }
        this._updateIndex();
        var token = this._scanJSXText([quote]);
        this._updateIndex();
        return token;
    },

    _parseJSXElement: function(prev) {
        this._expect('<');
        var start = this.index,
            ret = {},
            flag = this._charCode();

        if (flag >= 65 && flag <= 90/* upper case */) {
            // is a widget
            this._type(Type.JSXWidget, ret);
        } else if (this._isExpect('!--')) {
            // is html comment
            return this._parseJSXComment();
        } else if (this._charCode(this.index + 1) === 58/* : */){
            // is a directive
            start += 2;
            switch (flag) {
                case 116: // t
                    this._type(Type.JSXVdt, ret);
                    break;
                case 98: // b
                    this._type(Type.JSXBlock, ret);
                    break;
                default:
                    this._error('Unknown directive ' + String.fromCharCode(flag) + ':');
            }
            this._updateIndex(2);
        } else {
            // is an element
            this._type(Type.JSXElement, ret);
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

    _parseAttributeAndChildren: function(ret, prev) {
        ret.children = [];
        this._parseJSXAttribute(ret, prev);

        if (ret.type === Type.JSXElement && Utils.isSelfClosingTag(ret.value)) {
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
            if (Utils.isTextTag(ret.value)) {
                // if it is a text element, treat children as innerHTML attribute
                const attr = this._type(Type.JSXAttribute, {
                    name: 'innerHTML',
                    value: this._type(Type.JSXString)
                });
                const children = this._parseJSXChildren(ret, ret.hasVRaw);
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

    _parseJSXAttribute: function(ret, prev) {
        ret = Utils.extend(ret, {
            attributes: [],
            directives: {},
            hasVRaw: false,
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
                    attr.value = this._type(
                        Type.JSXExpressionContainer, 
                        {value: [this._type(
                            Type.JS,
                            {value: 'true'}
                        )]}
                    );
                }

                if (attr.type === Type.JSXAttribute) {
                    ret.attributes.push(attr);
                } else {
                    ret.directives[attr.name] = attr;
                }
            }
        }

        return ret;
    },

    _parseJSXAttributeName: function(ret, prev) {
        let start = this.index;
        let line = this.line;
        let column = this.column;
        let element;

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
        if (Utils.isDirective(name)) {
            element = this._type(Type.JSXDirective, {name: name});
            this._parseJSXAttributeVIf(ret, element, prev);
        } else {
            element = this._type(Type.JSXAttribute, {name: name});
        }
        element.line = line;
        element.column = column;

        return element;
    },

    _parseJSXAttributeVIf: function(ret, attr, prev) {
        const name = attr.name;
        if (name === 'v-else-if' || name === 'v-else') {
            let emptyTextNodes = []; // persist empty text node, skip them if find v-else-if or v-else
            let skipNodes = function() {
                Utils.each(emptyTextNodes, function(item) {
                    item.skip = true;
                });
                emptyTextNodes = [];
            };

            prev = {prev};
            while (prev = prev.prev) {
                if (prev.type === Type.JSXText && /^\s*$/.test(prev.value)) {
                    emptyTextNodes.push(prev);
                    continue;
                }
                const type = prev.type;
                if (type === Type.JSXComment) continue; 
                if (
                    type === Type.JSXElement ||
                    type === Type.JSXWidget ||
                    type === Type.JSXVdt ||
                    type === Type.JSXBlock
                ) {
                    const prevDirectives = prev.directives;
                    if (prevDirectives['v-if'] || prevDirectives['v-else-if']) {
                        prev.next = ret;
                        ret.skip = true;
                        skipNodes();
                    }
                }
                break;
            }

            if (!ret.skip) {
                this._error(`${name} must be led with v-if or v-else-if`);
            }
        }
    },

    _parseJSXAttributeValue: function() {
        var value,
            Delimiters = this.options.delimiters;
        if (this._isExpect(Delimiters[0])) {
            value = this._parseJSXExpressionContainer();
        } else {
            value = this._scanJSXStringLiteral();
        }
        return value;
    },

    _parseJSXExpressionContainer: function() {
        var expression,
            Delimiters = this.options.delimiters,
            element = this._type(Type.JSXExpressionContainer);

        this._expect(Delimiters[0]);
        this._skipWhitespaceAndJSComment();
        if (this._isExpect(Delimiters[1])) {
            expression = [this._parseJSXEmptyExpression()];
        } else if (this._isExpect('=')) {
            // if the lead char is '=', then treat it as unescape string
            this._skipWhitespace();
            expression = this._parseJSXUnescapeText();
            this._expect(Delimiters[1], `Unclosed delimiter`, expression);
            return expression;
        } else {
            expression = this._parseExpression();
        }
        this._expect(Delimiters[1], `Unclosed delimiter`, element);

        element.value = expression;

        return element;
    },

    _parseJSXEmptyExpression: function() {
        return this._type(Type.JSXEmptyExpression, {value: null});
    },

    _parseExpression: function() {
        return this._parseTemplate();
    },

    _parseJSXUnescapeText: function() {
        this._expect('=');
        return this._type(Type.JSXUnescapeText, {
            value: this._parseTemplate()
        });
    },

    _parseJSXChildren: function(element, hasVRaw) {
        var children = [],
            endTag = element.value + '>',
            current = null;

        switch (element.type) {
            case Type.JSXBlock:
                endTag = '</b:' + endTag;
                break;
            case Type.JSXVdt:
                endTag = '</t:' + endTag;
                break;
            case Type.JSXElement:
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
        const ret = [];
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (!child.skip) {
                ret.push(child);
            }
        }

        return ret;
    },

    _parseJSXChild: function(element, endTag, prev) {
        var ret,
            Delimiters = this.options.delimiters;

        if (this._isExpect(Delimiters[0])) {
            ret = this._parseJSXExpressionContainer();
            this._skipWhitespaceBetweenElements(endTag, false);
        } else if (Utils.isTextTag(element.value)) {
            ret = this._scanJSXText([endTag, Delimiters[0]]);
        } else if (this._isElementStart()) {
            ret = this._parseJSXElement(prev);
            this._skipWhitespaceBetweenElements(endTag);
        } else {
            ret = this._scanJSXText([function() {
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

    _parseJSXClosingElement: function(endTag, element) {
        this._expect('</', `Unclosed tag: ${endTag}`, element);

        while (this.index < this.length) {
            if (!isJSXIdentifierPart(this._charCode())) {
                break;
            }
            this._updateIndex();
        }

        this._skipWhitespace();
        this._expect('>');
    },

    _parseJSXComment: function() {
        this._expect('!--');
        var start = this.index,
            element = this._type(Type.JSXComment);

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

    _char: function(index = this.index) {
        return this.source.charAt(index);
    },

    _charCode: function(index = this.index) {
         return this.source.charCodeAt(index);
    },

    _skipWhitespaceBetweenElements: function(endTag, skipBeforeDelimiter = true) {
        if (!this.options.skipWhitespace) return;

        const Delimiters = this.options.delimiters;
        let start = this.index;
        while (start < this.length) {
            const code = this._charCode(start);
            if (Utils.isWhiteSpace(code)) {
                start++;
            } else if (
                this._isExpect(endTag, start) || 
                this._isElementStart(start) ||
                // skip whitespaces between after element starting and expression
                // but not skip before element ending 
                (skipBeforeDelimiter && this._isExpect(Delimiters[0], start))
            ) {
                this._skipWhitespace();
                break;
            } else {
                break;
            }
        }
    },

    _skipWhitespace: function() {
        while (this.index < this.length) {
            var code = this._charCode();
            if (!Utils.isWhiteSpace(code)) {
                break;
            } else if (code === 10) {
                // is \n
                this._updateLine();
            }
            this._updateIndex();
        }
    },

    _skipJSComment: function() {
        let start;
        do {
            start = this.index;
            if (this._char() === '/') {
                var ch = this._char(this.index + 1);
                if (ch === '/') {
                    this._updateIndex(2);
                    while (this.index < this.length) {
                        let code = this._charCode();
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

    _skipWhitespaceAndJSComment: function() {
        let start;
        do {
            start = this.index;
            this._skipWhitespace();
            this._skipJSComment();
        } while (start !== this.index);
    },

    _expect: function(str, msg, element) {
        if (!this._isExpect(str)) {
            this._error(msg || 'Expect string ' + str, element);
        }
        this._updateIndex(str.length);
    },

    _isExpect: function(str, index = this.index) {
        return this.source.slice(index, index + str.length) === str;
    },

    _isElementStart: function(index = this.index) {
        return this._char(index) === '<' && 
            (
                this._isExpect('<!--', index) || 
                elementNameRegexp.test(this.source.slice(index))
            );
    },

    _isJSImport: function() {
        return this._isExpect('import ');
    },

    _type: function(type, ret) {
        ret || (ret = {});
        ret.type = type;
        ret.typeName = TypeName[type];
        ret.line = this.line;
        ret.column = this.column;
        return ret;
    },

    _updateLine: function() {
        this.line++;
        // because we call _updateLine firstly then call _updateIndex
        // it will add column in _updateIndex
        // set it to -1 here
        this.column = -1;
    },

    _updateIndex: function(value) {
        value === undefined && (value = 1);
        var index = this.index;
        this.index = this.index + value;
        this.column = this.column + value;
        return index;
    },

    _error: function(msg, element) {
        const lines = this.source.split('\n');
        let {line, column} = element || this;
        column++;
        const error = new Error(
            `${msg} (${line}:${column})\n` +
            `> ${line} | ${lines[line - 1]}\n` +
            `  ${new Array(String(line).length + 1).join(' ')} | ${new Array(column).join(' ')}^`
        );
        error.line = line;
        error.column = column;
        error.source = this.source;

        throw error;
    },

    _getLastCharCode() {
        let start = this.index - 1;
        let _start;
        do {
            _start = start;
            while (start >= 0) {
                var code = this._charCode(start);
                if (!Utils.isWhiteSpaceExpectLinebreak(code)) {
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
