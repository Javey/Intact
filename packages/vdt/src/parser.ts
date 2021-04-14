import {trimRight, selfClosingTags, textTags} from './helpers';
import {
    Types,
    ASTNode,
    ASTElement,
    ASTAttribute,
    ASTDirective,
    ASTEmptyExpression,
    ASTExpressionContainer,
    // ASTUnescapeText,
    Options,
} from './types';
import {defaultOptions} from './common';

type Braces = {count: number};

const elementNameRegexp = /^<\w+:?\s*[\{\w\/>]/;
const emptyRegexp = /^\s*$/;

export class Parser {
    private source: string = '';
    private index: number = 0;
    private length: number = 0;
    private line: number = 1;
    private column: number = 0;
    private options: Options = defaultOptions;

    parse(source: string, options?: Options) {
        this.source = trimRight(source);
        this.index = 0;
        this.line = 1;
        this.column = 0;
        if (options) {
            this.options = {...defaultOptions, ...options};
        }

        return this.parseTemplate(true);
    }

    private parseTemplate(isRoot: boolean) {
        const nodes: ASTNode[] = [];
        const braces: Braces = {count: 0};

        while (this.index < this.length && braces.count >= 0) {
            nodes.push(this.advance(braces, isRoot));
        }

        return nodes;
    }

    private advance(braces: Braces, isRoot: boolean) {
        const ch = this.char();
        if (isRoot && this.isJSImport()) {
            return this.scanJSImport();
        } 
        if (ch !== '<') {
            return this.scanJS(braces, isRoot);
        } 
        return this.scanJSX();
    }

    private scanJSImport() {
        const start = this.index;
        const node = this.node(Types.JSImport);

        this.updateIndex(7); // 'import '.length
        while (this.index < this.length) {
            const ch = this.char();
            if (ch === '\'' || ch === '"') {
                this.scanString();
                let start: number;
                do {
                    start = this.index;
                    this.skipWhitespaceAndJSComment();
                    if (this.char() === ';') {
                        this.updateIndex();
                    }
                } while (start !== this.index);
                break;
            } else {
                this.updateIndex();
            }
        }

        return this.setValue(node, start);
    }

    private scanJS(braces: Braces, isRoot: boolean) {
        const start = this.index;
        const delimiters = this.options.delimiters;
        const node = this.node(Types.JS);

        while (this.index < this.length) {
            this.skipJSComment();
            const ch = this.char();
            let tmp;
            if (
                ch === '\'' || ch === '"' || ch === '`' ||
                // is a RegExp, treat it as literal sting
                ch === '/' && 
                // is not /* and //, this is comment
                (tmp = this.char(this.index + 1)) && tmp !== '*' && tmp !== '/' && (
                    // is the first char
                    this.index === 0 || 
                    // is not </, this is a end tag
                    (tmp = this.char(this.index - 1)) && tmp !== '<' &&
                    // is not a sign of division
                    // FIXME: expect `if (a > 1) /test/`
                    (tmp = this.getLastCharCode()) && !isJSIdentifierPart(tmp) && tmp !== 41 // )
                )
            ) {
                // skip element(<div>) in quotes
                this.scanString();
            } else if (this.isElementStart()) {
                break;
            } else if (isRoot && this.isJSImport()) {
                break;
            } else {
                if (ch === '{') {
                    braces.count++;
                } else if (braces.count > 0 && ch === '}') {
                    braces.count--;
                } else if (this.isExpect(delimiters[1])) {
                    // for parseTemplate break
                    braces.count--;
                    break;
                } else if (ch === '\n') {
                    this.updateLine();
                }
                this.updateIndex();
            }
        }

        return this.setValue(node, start);
    }

    private scanJSX() {
        return this.parseJSXElement(null);
    }

    private scanString() {
        const start = this.index;
        const node = this.node(Types.JSXString);
        let str = '';
        let quote = this.char();

        this.updateIndex();
        while (this.index < this.length) {
            const ch = this.char();
            if (ch.charCodeAt(0) === 10) {
                this.updateLine();
            } else {
                this.updateIndex();
            }

            if (ch === quote) {
                quote = '';
                break;
            } else if (ch === '\\') {
                str += this.char(this.updateIndex());
            } else {
                str += ch;
            }
        }
        if (quote !== '') {
            this.error('Unclosed quote');
        }

        return this.setValue(node, start);
    }

    private parseJSXElement(prevElement: ASTElement | null) {
        this.expect('<');

        const flag = this.charCode();
        let start = this.index;
        let element: ASTElement;

        if (flag >= 65 && flag <= 90/* upper case */) {
            // is a widget
            element = this.node(Types.JSXComponent);
        } else if (this.isExpect('!--')) {
            // is html comment
            return this.parseJSXComment();
        } else if (this.charCode(this.index + 1) === 58/* : */){
            // is a directive
            start += 2;
            switch (flag) {
                case 116: // t
                    element = this.node(Types.JSXVdt);
                    break;
                case 98: // b
                    element = this.node(Types.JSXBlock) as ASTElement;
                    break;
                default:
                    this.error('Unknown directive ' + String.fromCharCode(flag) + ':');
            }
            this.updateIndex(2);
        } else {
            // is an element
            element = this.node(Types.JSXElement);
        }

        while (this.index < this.length) {
            if (!isJSXIdentifierPart(this.charCode())) {
                break;
            }
            this.updateIndex();
        }

        this.setValue(element!, start);
        this.parseAttribute(element!, prevElement);
        return this.parseChildren(element!, prevElement);
    }

    private parseAttribute(element: ASTElement, prevElement: ASTElement | null) {
        element.attributes = [];
        element.directives = [];
        element.hasVRaw = false;

        while (this.index < this.length) {
            this.skipWhitespace();
            if (this.char() === '/' || this.char() === '>') {
                break;
            }

            const delimiters = this.options.delimiters;
            if (this.isExpect(delimiters[0])) {
                // support dynamic attributes
                element.attributes.push(this.parseJSXExpressionContainer());
                continue;
            }
        }
    }

    private parseChildren(element: ASTElement, prevElement: ASTElement | null) {
        const value = element.value;

        element.children = [];

        if (element.type === Types.JSXElement && selfClosingTags[value]) {
            // self closing tag
            if (this.char() === '/') {
                this.updateIndex();
            }
            this.expect('>');
        } else if (this.char() === '/') {
            // unknown self closing tag
            this.updateIndex();
            this.expect('>');
        } else {
            this.expect('>');
            if (textTags[value]) {
                // if it is a text element, treat children as innerHTML attribute
                const attr = this.node(Types.JSXAttribute);
                attr.name = 'innerHTML';
                attr.value = this.node(Types.JSXString);

                const children = this.parseJSXChildren(element, element.hasVRaw);
                if (children.length) {
                    attr.value.value = children;
                    element.attributes.push(attr);
                }
            } else {
                element.children = this.parseJSXChildren(element, element.hasVRaw); 
            }
        }

        return element;
    }

    private parseJSXExpressionContainer() {
        const delimiters = this.options.delimiters;
        const element = this.node(Types.JSXExpressionContainer);

        this.expect(delimiters[0]);
        this.skipWhitespaceAndJSComment();
        
        if (this.isExpect(delimiters[1])) {
            element.value = [this.parseJSXEmptyExpression()];
        } else if (this.isExpect('=')) {
            // if the lead char is '=', then treat it as unescape string
            this.skipWhitespace();
            const expression = this.parseJSXUnescapeText();
            this.expect(delimiters[1], `Unclosed delimiter`, expression);
            return expression;
        } else {
            element.value = this.parseExpression();
        }

        this.expect(delimiters[1], `Unclosed delimiter`, element);

        return element;
    }

    private parseJSXEmptyExpression() {
        return this.node(Types.JSXEmptyExpression);
    }

    private parseJSXUnescapeText() {
        this.expect('=');
        const node = this.node(Types.JSXUnescapeText);
        node.value = this.parseTemplate(false);

        return node;
    }

    private parseExpression() {
        return this.parseTemplate(false);
    }

    private node(type: Types.JSXAttribute): ASTAttribute
    private node(type: Types.JSXDirective): ASTDirective
    private node(type: Types.JSXExpressionContainer | Types.JSXUnescapeText): ASTExpressionContainer
    private node(type: Types.JSXEmptyExpression): ASTEmptyExpression
    private node(
        type: Types
            // Types.JSXElement |
            // Types.JSXVdt |
            // Types.JSXComponent | 
            // Types.JS | 
            // Types.JSXBlock | 
            // Types.JSXComment |
            // Types.JSXTemplate |
            // Types.JSXString
    ): ASTElement;
    private node(type: Types): ASTNode {
        return {
            type,
            line: this.line,
            column: this.column,
            value: null
        };
    }

    private setValue(element: ASTNode, start: number) {
        element.value = this.source.slice(start, this.index);
        return element;
    }

    private char(index = this.index) {
        return this.source.charAt(index);
    }

    private charCode(index = this.index) {
        return this.source.charCodeAt(index);
    }

    private isJSImport() {
        return this.isExpect('import ');
    }

    private isExpect(expect: string, index = this.index) {
        return this.source.slice(index, index + expect.length) === expect;
    }

    private updateIndex(index: number = 1) {
        const oldIndex = this.index;
        this.index = oldIndex + index;
        this.column += index;

        return oldIndex;
    }

    private updateLine() {
        this.line++;
        this.column = 0;
    }

    private error(msg: string, node?: ASTNode) {
        const lines = this.source.split('\n');
        let {line, column} = (node || this) as any;
        column++;
        const error = new Error(
            `${msg} (${line}:${column})\n` +
            `> ${line} | ${lines[line - 1]}\n` +
            `  ${new Array(String(line).length + 1).join(' ')} | ${new Array(column).join(' ')}^`
        );

        throw error;
    }

    private skipWhitespaceAndJSComment() {

    }

    private skipJSComment() {

    }

    private getLastCharCode() {

    }

    private isElementStart() {
        return true;
    }

    private expect(str: string, msg?: string, element?: ASTNode) {
        if (!this.isExpect(str)) {
            this.error(msg || 'Expect string ' + str, element);
        }
        this.updateIndex(str.length);
    }

    private skipWhitespace() {

    }
}

function isJSIdentifierPart(ch: number) {
    return (ch === 95) || ch === 36 ||  // _ (underscore) $
        (ch >= 65 && ch <= 90) ||         // A..Z
        (ch >= 97 && ch <= 122) ||        // a..z
        (ch >= 48 && ch <= 57);         // 0..9
}

function isJSXIdentifierPart(ch: number) {
    return (ch === 58) || (ch === 45) || ch === 46 || isJSIdentifierPart(ch);  // : - .
}
