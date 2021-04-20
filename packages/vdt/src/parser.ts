import {
    Types,
    ASTNode,
    ASTJS,
    ASTHoist,
    ASTChild,
    ASTText,
    ASTBaseElement,
    ASTCommonElement,
    ASTComponent,
    ASTVdt,
    ASTBlock,
    ASTComment,
    ASTExpression,
    ASTAttribute,
    ASTString,
    ASTRootChild,
    SourceLocation,
    ASTElementChild,
    ASTElement,
    ASTExpressionChild,
    Directives,
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
    validateDirectiveValue,
    validateDirectiveIF,
    validateDirectiveModel,
    throwError,
    defaultOptions,
} from './helpers';

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

    public ast: ASTRootChild[];

    constructor(source: string, options?: Options) {
        this.source = trimRight(source);
        this.length = this.source.length;
        if (options) {
            this.options = {...defaultOptions, ...options};
        }

        this.ast = this.parse(true);
    }

    private parse(isRoot: true): ASTRootChild[];
    private parse(isRoot: false): ASTExpressionChild[];
    private parse(isRoot: boolean): ASTRootChild[] | ASTExpressionChild[] {
        const nodes: ASTRootChild[] = [];
        const braces: Braces = {count: 0};

        while (this.index < this.length && braces.count >= 0) {
            nodes.push(this.advance(braces, isRoot));
        }

        return nodes;
    }

    private advance(braces: Braces, isRoot: boolean): ASTRootChild {
        const ch = this.char();
        if (isRoot && this.isJSImport()) {
            return this.scanJSImport();
        } 
        if (ch !== '<') {
            return this.scanJS(braces, isRoot);
        } 
        return this.scanJSX();
    }

    private scanJSImport(): ASTHoist {
        const start = this.index;
        const loc = this.getLocation();

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

        return {type: Types.JSHoist, value: this.getValue(start), loc};
    }

    private scanJS(braces: Braces, isRoot: boolean): ASTJS {
        const start = this.index;
        const delimiters = this.options.delimiters;
        const loc = this.getLocation();

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

        return {type: Types.JS, value: this.getValue(start), loc};
    }

    private scanJSX(): ASTElement | ASTComment {
        this.expect('<');
        if (this.isExpect('!--')) {
            // is html comment
            return this.parseJSXComment();
        }
        return this.parseJSXElement();
    }

    private scanString(): ASTString {
        const start = this.index;
        const loc = this.getLocation();
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

        return {type: Types.JSXString, value: this.getValue(start), loc};
    }

    private parseJSXElement(): ASTElement {
        const flag = this.charCode();
        const loc = this.getLocation();
        let start = this.index;
        let node: ASTElement;
        let type: Types; 

        if (flag >= 65 && flag <= 90/* upper case */) {
            // is a component 
            type = Types.JSXComponent;
        } else if (this.charCode(this.index + 1) === 58/* : */){
            // is a directive
            start += 2;
            switch (flag) {
                case 116: // t
                    type = Types.JSXVdt;
                    break;
                case 98: // b
                    type = Types.JSXBlock;
                    break;
                default:
                    this.error('Unknown directive ' + String.fromCharCode(flag) + ':');
            }
            this.updateIndex(2);
        } else {
            // is an element
            type = Types.JSXCommonElement;
        }

        while (this.index < this.length) {
            if (!isJSXIdentifierPart(this.charCode())) {
                break;
            }
            this.updateIndex();
        }

        const value = this.getValue(start);
        const {attributes, directives, keyed, hasVRaw} = this.parseJSXAttribute(value, type);
        const children = this.parseJSXChildren(value, type, attributes, hasVRaw, loc);

        if (process.env.NODE_ENV !== 'production') {
            validateDirectiveIF(children, loc, this.source);
            const model = directives[Directives.Model];
            if (model) {
                validateDirectiveModel(value, type, attributes, model.loc, this.source);
            }
        }

        return {type, value, attributes, directives, children, keyed, loc} as ASTElement;
    }

    private parseJSXComment(): ASTComment {
        this.expect('!--');
        const start = this.index;
        const loc = this.getLocation();

        while (this.index < this.length) {
            if (this.isExpect('-->')) {
                break;
            } else if (this.charCode() === 10) {
                this.updateLine();
            }
            this.updateIndex();
        }

        const value = this.getValue(start);
        this.expect('-->');

        return {type: Types.JSXComment, value, loc};
    }

    private parseJSXAttribute(tag: string, type: Types): 
        {attributes: ASTElement['attributes'], directives: ASTElement['directives'], keyed: boolean, hasVRaw: boolean} 
    {
        const attributes: ASTElement['attributes'] = [];
        const directives: ASTElement['directives'] = {};
        let keyed = false;
        let hasVRaw = false;
        let value: ASTString | ASTExpression;

        while (this.index < this.length) {
            this.skipWhitespace();
            if (this.char() === '/' || this.char() === '>') {
                break;
            }

            const delimiters = this.options.delimiters;
            if (this.isExpect(delimiters[0])) {
                // support dynamic attributes
                attributes.push(this.parseJSXExpression());
                continue;
            }

            const loc = this.getLocation();
            const name = this.parseJSXAttributeName();

            if (!keyed && name === 'key') {
                keyed = true;
            }

            if (this.char() === '=') {
                this.updateIndex();
                value = this.parseJSXAttributeValue();
            } else {
                // treat no-value attribute as true
                value = {
                    type: Types.JSXExpression,
                    value: [{
                        type: Types.JS,
                        value: 'true',
                    }],
                    unescaped: false,
                    loc: this.getLocation(),
                } as ASTExpression;
            }

            const attr = {type: Types.JSXAttribute, name, value, loc} as ASTAttribute;
            if (directivesMap[name as Directives]) {
                if (process.env.NODE_ENV !== 'produdction') {
                    validateDirectiveValue(name, value.type, tag, type, this.source, value.loc);
                }
                if (name === Directives.Raw) {
                    hasVRaw = true;
                }

                directives[name as Directives] = attr;
            } else {
                attributes.push(attr);
            }
        }

        return {attributes, directives, keyed, hasVRaw};
    }

    private parseJSXAttributeName(): string {
        if (!isJSXIdentifierPart(this.charCode())) {
            this.error('Unexpected identifier ' + this.char());
        }

        const start = this.index;

        while (this.index < this.length) {
            var ch = this.charCode();
            if (!isJSXIdentifierPart(ch)) {
                break;
            }
            this.updateIndex();
        }
        
        return this.getValue(start);
    }

    // private parseJSXDirectiveIf(node: ASTTag, directive: ASTAttribute): void {
        // const name = directive.name;
        // if (name === 'v-else-if' || name === 'v-else') {
            // const emptyTextNodes: ASTChild[] = []; // persist empty text node, skip them if find v-else-if or v-else
            // const skipNodes = function() {
                // emptyTextNodes.forEach((item) => {
                    // item.type |= Types.Skip;
                // });
            // };

            // let prevNode: ASTChild | null = node;
            // while (prevNode = node.prev) {
                // const type = prevNode.type;
                // if (type & Types.JSXText && emptyRegexp.test((prevNode as ASTString).value)) {
                    // emptyTextNodes.push(prevNode);
                    // continue;
                // }
                // if (type & Types.JSXComment) continue; 
                // if (type & tagTypes) {
                    // const prevDirectives = (prevNode as ASTTag).directives;
                    // if (prevDirectives['v-if'] || prevDirectives['v-else-if']) {
                        // prevNode.next = node;
                        // node.type |= Types.Skip;
                        // skipNodes();
                    // }
                // }
                // break;
            // }

            // if (!(node.type & Types.Skip)) {
                // this.error(`${name} must be led with v-if or v-else-if`);
            // }
        // }
    // }

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

    private parseJSXChildren(tag: string, type: Types, attributes: ASTElement['attributes'], hasVRaw: boolean, loc: SourceLocation): ASTChild[] {
        let children: ASTChild[] = [];

        if (type === Types.JSXCommonElement && selfClosingTags[tag]) {
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
            if (textTags[tag]) {
                // if it is a text element, treat children as innerHTML attribute
                const attrLoc = this.getLocation();
                const children = this.parseJSXChildrenValue(tag, type, hasVRaw, true, loc);
                if (children.length) {
                    attributes.push({
                        type: Types.JSXAttribute,
                        name: 'innerHTML',
                        value: {
                            type: Types.JSXExpression,
                            value: children,
                            unescaped: false,
                            loc: attrLoc,
                        },
                        loc,
                    } as ASTAttribute);
                }
            } else {
                children = this.parseJSXChildrenValue(tag, type, hasVRaw, false, loc); 
            }
        }

        return children;
    }

    private parseJSXChildrenValue(tag: string, type: Types, hasVRaw: boolean, isTextTag: boolean, loc: SourceLocation): ASTElementChild[] {
        const children: ASTElementChild[] = [];
        let endTag = tag + '>';

        switch (type) {
            case Types.JSXBlock:
                endTag = '</b:' + endTag;
                break;
            case Types.JSXVdt:
                endTag = '</t:' + endTag;
                break;
            default:
                endTag = '</' + endTag;
                break;
        }

        if (hasVRaw) {
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
                children.push(this.parseJSXChild(endTag, isTextTag));
            }
        }
        this.parseJSXClosingTag(endTag, loc);

        return children;
    }

    private parseJSXChild(endTag: string, isTextTag: boolean): ASTElementChild {
        const delimiters = this.options.delimiters;
        let child: ASTChild;

        if (this.isExpect(delimiters[0])) {
            child = this.parseJSXExpression();
            this.skipWhitespaceBetweenTags(endTag, false);
        } else if (isTextTag) {
            child = this.scanJSXText([endTag, delimiters[0]]);
        } else if (this.isTagStart()) {
            child = this.parseJSXElement();
            this.skipWhitespaceBetweenTags(endTag);
        } else {
            child = this.scanJSXText([() => {
                return this.isExpect(endTag) || this.isTagStart();
            }, delimiters[0]]);
        }

        return child;
    }

    private parseJSXClosingTag(endTag: string, loc: SourceLocation) {
        this.expect('</', `Unclosed tag: ${endTag}`, loc);

        while (this.index < this.length) {
            if (!isJSXIdentifierPart(this.charCode())) {
                break;
            }
            this.updateIndex();
        }

        this.skipWhitespace();
        this.expect('>');
    }

    private scanJSXText(stopChars: (string | (() => boolean))[]): ASTText {
        const start = this.index;
        const l = stopChars.length;
        const loc = this.getLocation();
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

        return {type: Types.JSXText, value: this.getValue(start), loc};
    }

    private parseJSXExpression(): ASTExpression {
        const delimiters = this.options.delimiters;

        this.expect(delimiters[0]);
        this.skipWhitespaceAndJSComment();

        const loc = this.getLocation();
        
        let unescaped = false;
        let value: ASTExpression['value'];

        if (this.isExpect('=')) {
            // if the lead char is '=', then treat it as unescape string
            this.expect('=');
            this.skipWhitespace();
            unescaped = true;
        }

        if (this.isExpect(delimiters[1])) {
            value = [];
        } else {
            value = this.parse(false);
        }

        this.expect(delimiters[1], `Unclosed delimiter`, loc);

        return {type: Types.JSXExpression, value, unescaped, loc};
    }

    private getLocation(): SourceLocation {
        return {line: this.line, column: this.column};
    }

    private getValue(start: number): string {
        return this.source.slice(start, this.index);
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

    private error(msg: string, loc?: SourceLocation): never {
        throwError(msg, loc || ({line: this.line, column: this.column} as SourceLocation), this.source);
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

    private expect(str: string, msg?: string, loc?: SourceLocation): void {
        if (!this.isExpect(str)) {
            this.error(msg || 'Expect string ' + str, loc);
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
