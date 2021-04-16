import {
    Types,
    TypeTag,
    TypeString,
    TypeExpression,
    TypeChild,
    TypeAttributeValue,
    ASTNode,
    ASTChild,
    ASTTag,
    ASTString,
    ASTExpression,
    ASTAttribute,
    Options,
} from './types';
import {
    trimRight,
    selfClosingTags,
    textTags,
    isWhiteSpace,
    isJSIdentifierPart,
    isJSXIdentifierPart,
    isWhiteSpaceExceptLinebreak,
    directivesMap,
} from './helpers';
import {defaultOptions, tagTypes} from './common';

type Braces = {count: number};

const tagNameRegexp = /^<\w+:?\s*[\{\w\/>]/;
const emptyRegexp = /^\s*$/;

export class Parser {
    private index: number = 0;
    private line: number = 1;
    private column: number = 0;
    private source: string;
    private length: number;
    private options: Options = defaultOptions;

    public ast: ASTChild[];

    constructor(source: string, options?: Options) {
        this.source = trimRight(source);
        this.length = this.source.length;
        if (options) {
            this.options = {...defaultOptions, ...options};
        }

        this.ast = this.parse(true);
    }

    private parse(isRoot: boolean): ASTChild[] {
        const nodes: ASTChild[] = [];
        const braces: Braces = {count: 0};

        while (this.index < this.length && braces.count >= 0) {
            nodes.push(this.advance(braces, isRoot));
        }

        return nodes;
    }

    private advance(braces: Braces, isRoot: boolean): ASTChild {
        const ch = this.char();
        if (isRoot && this.isJSImport()) {
            return this.scanJSImport();
        } 
        if (ch !== '<') {
            return this.scanJS(braces, isRoot);
        } 
        return this.scanJSX();
    }

    private scanJSImport(): ASTString {
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

    private scanJS(braces: Braces, isRoot: boolean): ASTString {
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
                // skip tag(<div>) in quotes
                this.scanString();
            } else if (this.isTagStart()) {
                break;
            } else if (isRoot && this.isJSImport()) {
                break;
            } else {
                if (ch === '{') {
                    braces.count++;
                } else if (braces.count > 0 && ch === '}') {
                    braces.count--;
                } else if (this.isExpect(delimiters[1])) {
                    // for parse break
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

    private scanJSX(): ASTTag | ASTString {
        return this.parseJSXTag(null);
    }

    private scanString(): ASTString {
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

    private parseJSXTag(prevNode: ASTChild | null): ASTTag | ASTString {
        this.expect('<');

        const flag = this.charCode();
        let start = this.index;
        let node: ASTTag;

        if (flag >= 65 && flag <= 90/* upper case */) {
            // is a component 
            node = this.node(Types.JSXComponent);
        } else if (this.isExpect('!--')) {
            // is html comment
            return this.parseJSXComment();
        } else if (this.charCode(this.index + 1) === 58/* : */){
            // is a directive
            start += 2;
            switch (flag) {
                case 116: // t
                    node = this.node(Types.JSXVdt);
                    break;
                case 98: // b
                    node = this.node(Types.JSXBlock);
                    break;
                default:
                    this.error('Unknown directive ' + String.fromCharCode(flag) + ':');
            }
            this.updateIndex(2);
        } else {
            // is an element
            node = this.node(Types.JSXElement);
        }

        while (this.index < this.length) {
            if (!isJSXIdentifierPart(this.charCode())) {
                break;
            }
            this.updateIndex();
        }

        node!.prev = prevNode;

        this.setValue(node!, start);
        this.parseJSXAttribute(node!);
        this.parseJSXChildren(node!);

        return node!;
    }

    private parseJSXComment(): ASTString {
        this.expect('!--');
        const start = this.index;
        const node = this.node(Types.JSXComment);

        while (this.index < this.length) {
            if (this.isExpect('-->')) {
                break;
            } else if (this.charCode() === 10) {
                this.updateLine();
            }
            this.updateIndex();
        }

        this.setValue(node, start);
        this.expect('-->');

        return node;
    }

    private parseJSXAttribute(node: ASTTag): ASTTag {
        node.attributes = [];
        node.directives = {};

        while (this.index < this.length) {
            this.skipWhitespace();
            if (this.char() === '/' || this.char() === '>') {
                break;
            }

            const delimiters = this.options.delimiters;
            if (this.isExpect(delimiters[0])) {
                // support dynamic attributes
                node.attributes.push(this.parseJSXExpression());
                continue;
            }

            const attr = this.parseJSXAttributeName(node);
            const name = attr.name;

            if (name === 'v-raw') {
                if (!(node.type & Types.JSXElement)) {
                    this.error(`Only html elememt supports v-raw, got: ${node.value}`);
                }
                node.type |= Types.HasVRaw;
                continue;
            }
            if (name === 'key') {
                // set HasKey flag
                node.type |= Types.HasKey;
            }
            if (this.char() === '=') {
                this.updateIndex();
                attr.value = this.parseJSXAttributeValue();
            } else {
                // treat no-value attribute as true
                const attributeValue = this.node(Types.JSXExpression);
                const value = this.node(Types.JS);
                value.value = 'true';
                attributeValue.value = [value];
                attr.value = attributeValue;
            }
        }

        return node;
    }

    private parseJSXAttributeName(node: ASTTag): ASTAttribute {
        if (!isJSXIdentifierPart(this.charCode())) {
            this.error('Unexpected identifier ' + this.char());
        }

        const start = this.index;
        const attr: ASTAttribute = this.node(Types.JSXAttribute);

        while (this.index < this.length) {
            var ch = this.charCode();
            if (!isJSXIdentifierPart(ch)) {
                break;
            }
            this.updateIndex();
        }
        
        const name = attr.name = this.source.slice(start, this.index);

        if (directivesMap[name]) {
            attr.type = Types.JSXDirective;
            this.parseJSXDirectiveIf(node, attr);
            node.directives[name] = attr;
        } else {
            node.attributes.push(attr);
        }

        return attr;
    }

    private parseJSXDirectiveIf(node: ASTTag, directive: ASTAttribute): void {
        const name = directive.name;
        if (name === 'v-else-if' || name === 'v-else') {
            const emptyTextNodes: ASTChild[] = []; // persist empty text node, skip them if find v-else-if or v-else
            const skipNodes = function() {
                emptyTextNodes.forEach((item) => {
                    item.type |= Types.Skip;
                });
            };

            let prevNode: ASTChild | null = node;
            while (prevNode = node.prev) {
                const type = prevNode.type;
                if (type & Types.JSXText && emptyRegexp.test((prevNode as ASTString).value)) {
                    emptyTextNodes.push(prevNode);
                    continue;
                }
                if (type & Types.JSXComment) continue; 
                if (type & tagTypes) {
                    const prevDirectives = (prevNode as ASTTag).directives;
                    if (prevDirectives['v-if'] || prevDirectives['v-else-if']) {
                        prevNode.next = node;
                        node.type |= Types.Skip;
                        skipNodes();
                    }
                }
                break;
            }

            if (!(node.type & Types.Skip)) {
                this.error(`${name} must be led with v-if or v-else-if`);
            }
        }
    }

    private parseJSXAttributeValue(): ASTString | ASTExpression {
        const delimiters = this.options.delimiters;
        let value: ASTString | ASTExpression;
        if (this.isExpect(delimiters[0])) {
            value = this.parseJSXExpression();
        } else {
            const quote = this.char();
            if (quote !== '\'' && quote !== '"' && quote !== '`') {
                this.error('String value of attribute must start with a quote.');
            }
            value = this.scanString();
        }

        return value;
    }

    private parseJSXChildren(node: ASTTag): ASTTag {
        const value = node.value;

        node.children = [];

        if (node.type & Types.JSXElement && selfClosingTags[value]) {
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
                const attrValue = attr.value = this.node(Types.JSXExpression);
                const children = this.parseJSXChildrenValue(node);
                if (children.length) {
                    attrValue.value = children;
                    node.attributes.push(attr);
                }
            } else {
                node.children = this.parseJSXChildrenValue(node); 
            }
        }

        return node;
    }

    private parseJSXChildrenValue(node: ASTTag): ASTChild[] {
        const children: ASTChild[] = [];
        const type = node.type;
        let endTag = node.value + '>';
        let current: ASTChild | null = null;

        if (type & Types.JSXBlock) {
            endTag = '</b:' + endTag;
        } else if (type & Types.JSXVdt) {
            endTag = '</t:' + endTag;
        } else {
            endTag = '</' + endTag;
        }

        if (type & Types.HasVRaw) {
            while (this.index < this.length) {
                if (this.isExpect(endTag)) {
                    break;
                }
                children.push(this.scanJSXText([endTag]));
            }
        } else {
            this.skipWhitespaceBetweenTags(endTag);
            while (this.index < this.length) {
                if (this.isExpect(endTag)) {
                    break;
                }
                current = this.parseJSXChild(node, endTag, current);
                children.push(current);
            }
        }
        this.parseJSXClosingTag(endTag, node);

        // ignore skipped child
        return children.filter(child => !(child.type & Types.Skip));
    }

    private parseJSXChild(node: ASTTag, endTag: string, prev: ASTChild | null): ASTChild {
        const delimiters = this.options.delimiters;
        let child: ASTChild;

        if (this.isExpect(delimiters[0])) {
            child = this.parseJSXExpression();
            this.skipWhitespaceBetweenTags(endTag, false);
        } else if (textTags[node.value]) {
            child = this.scanJSXText([endTag, delimiters[0]]);
        } else if (this.isTagStart()) {
            child = this.parseJSXTag(prev);
            this.skipWhitespaceBetweenTags(endTag);
        } else {
            child = this.scanJSXText([() => {
                return this.isExpect(endTag) || this.isTagStart();
            }, delimiters[0]]);
        }

        child.prev = null;
        child.next = null;
        if (prev) {
            prev.next = child;
            child.prev = prev;
        }
        
        return child;
    }

    private parseJSXClosingTag(endTag: string, node: ASTChild) {
        this.expect('</', `Unclosed tag: ${endTag}`, node);

        while (this.index < this.length) {
            if (!isJSXIdentifierPart(this.charCode())) {
                break;
            }
            this.updateIndex();
        }

        this.skipWhitespace();
        this.expect('>');
    }

    private scanJSXText(stopChars: (string | (() => boolean))[]) {
        const start = this.index;
        const l = stopChars.length;
        const node = this.node(Types.JSXText);
        let i: number;
        let charCode: number;

        loop:
        while (this.index < this.length) {
            charCode = this.charCode();
            if (isWhiteSpace(charCode)) {
                if (charCode === 10) {
                    this.updateLine();
                }
            } else {
                for (i = 0; i < l; i++) {
                    const stopChar = stopChars[i];
                    if (
                        typeof stopChar === 'function' && stopChar() || 
                        this.isExpect(stopChar as string)
                    ) {
                        break loop;
                    }
                }
            }
            this.updateIndex();
        }

        return this.setValue(node, start);
    }

    private parseJSXExpression(): ASTExpression {
        const delimiters = this.options.delimiters;

        this.expect(delimiters[0]);
        this.skipWhitespaceAndJSComment();
        
        let node: ASTExpression;
        if (this.isExpect('=')) {
            // if the lead char is '=', then treat it as unescape string
            this.skipWhitespace();
            node = this.parseJSXUnescapeText();
        } else {
            node = this.node(Types.JSXExpression);
            if (this.isExpect(delimiters[1])) {
                node.value = [];
            } else {
                node.value = this.parseExpression();
            }
        }

        this.expect(delimiters[1], `Unclosed delimiter`, node);

        return node;
    }

    private parseJSXUnescapeText() {
        this.expect('=');
        const node = this.node(Types.JSXUnescapeText);
        node.value = this.parse(false);

        return node;
    }

    private parseExpression() {
        return this.parse(false);
    }

    private node(type: TypeString | Types.JSXString): ASTString;
    private node(type: TypeTag): ASTTag;
    private node(type: TypeExpression): ASTExpression;
    private node(type: Types.JSXAttribute | Types.JSXDirective): ASTAttribute;
    private node(type: Types): ASTNode {
        return {
            type,
            line: this.line,
            column: this.column,
            value: null,
            // prev: null,
            // next: null,
            // children: null,
            // attributes: null,
            // directives: null,
        };
    }

    private setValue<T extends ASTNode>(node: T, start: number): T {
        node.value = this.source.slice(start, this.index);
        return node;
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
        let start: number;
        do {
            start = this.index;
            this.skipWhitespace();
            this.skipJSComment();
        } while (start !== this.index);
    }

    private skipJSComment() {
        let start: number;
        do {
            start = this.index;
            if (this.char() === '/') {
                const ch = this.char(this.index + 1);
                if (ch === '/') {
                    this.updateIndex(2);
                    while (this.index < this.length) {
                        const code = this.charCode();
                        this.updateIndex();
                        if (code === 10) {
                            // is \n
                            this.updateLine();
                            break;
                        }
                    }
                } else if (ch === '*') {
                    this.updateIndex(2);
                    while (this.index < this.length) {
                        if (this.isExpect('*/')) {
                            this.updateIndex(2);
                            break;
                        } else if (this.charCode() === 10) {
                            this.updateLine();
                        }
                        this.updateIndex();
                    }
                }
            }
        } while (start !== this.index);
    }

    private getLastCharCode(): number {
        let start = this.index - 1;
        let _start: number;
        do {
            _start = start;
            while (start >= 0) {
                var code = this.charCode(start);
                if (!isWhiteSpaceExceptLinebreak(code)) {
                    break;
                }
                start--;
            }

            // only check multi-line comments '/* comment */'
            while (start >= 0) {
                if (this.char(start) === '/' && this.char(start - 1) === '*') {
                    start -= 2;
                    while (start >= 0) {
                        if (this.char(start) === '*' && this.char(start - 1) === '/') {
                            start -= 2;
                            break;
                        }
                        start--;
                    }
                }
                break;
            }
        } while (start !== _start);

        return this.charCode(start);

    }

    private isTagStart(index = this.index): boolean {
        return this.char(index) === '<' && 
            (
                this.isExpect('<!--', index) || 
                tagNameRegexp.test(this.source.slice(index))
            );
    }

    private expect(str: string, msg?: string, node?: ASTNode): void {
        if (!this.isExpect(str)) {
            this.error(msg || 'Expect string ' + str, node);
        }
        this.updateIndex(str.length);
    }

    private skipWhitespace(): void {
        while (this.index < this.length) {
            var code = this.charCode();
            if (!isWhiteSpace(code)) {
                break;
            } else if (code === 10) {
                // is \n
                this.updateLine();
            }
            this.updateIndex();
        }
    }

    private skipWhitespaceBetweenTags(endTag: string, skipBeforeDelimiter = true): void {
        const delimiters = this.options.delimiters;
        let start = this.index;
        while (start < this.length) {
            const code = this.charCode(start);
            if (isWhiteSpace(code)) {
                start++;
            } else if (
                this.isExpect(endTag, start) || 
                this.isTagStart(start) ||
                // skip whitespaces between tag starting and expression
                // but not skip before tag ending 
                (skipBeforeDelimiter && this.isExpect(delimiters[0], start))
            ) {
                this.skipWhitespace();
                break;
            } else {
                break;
            }
        }
    }
}
