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
    ASTElement,
    ASTElementChild,
    ASTExpressionChild,
    ASTAttributeTemplateValue,
    ASTAttributeValue,
    ASTDirectiveIf,
    Directives,
    DirectiveFor,
    Options,
} from './types';
import {getTypeForVNodeElement, ChildrenTypes, Types as VNodeTypes} from 'misstime';
import {isElementNode, getAttrName} from './helpers';
import {isArray} from 'intact-shared';

const FUNCTION_HEAD = `
function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
`;
const fakeLoc: SourceLocation = {line: 0, column: 0};

export class Visitor {
    private enterStringExpression: boolean = false;
    private hoist: string[] = [];
    private queue: string[] = [];
    private queueStack: string[][] = [this.queue];
    private current: string[] = this.queue;
    private line = 1;
    private column = 0;
    private indentLevel = 0;
    private spaces = '';
    private spacesStatck: string[] = [''];
    private expressionSpacesStack: string[] = [];

    constructor(nodes: ASTRootChild[]) {
        this.append(`function($props, $blocks) {`);
        this.indent();
        this.append(`$blocks || ($blocks = {});`);
        this.newline();
        this.append(`$props || ($props = {});`);
        this.append('\n');
        this.newline();

        this.visit(nodes, true);

        this.append(';');
        this.dedent();
        this.append('}');
    }

    getCode() {
        return this.queue.join('');
    }

    private visit(nodes: ASTRootChild[], isRoot: true): void;
    private visit(nodes: ASTElementChild[] | ASTExpressionChild[], isRoot: false): void;
    private visit(nodes: ASTChild[], isRoot: boolean) {
        const length = nodes.length;
        const lastIndex = length - 1;
        // let addWrapper = false;
        // let hasDestructuring = false;

        // if (!isRoot && !this.enterStringExpression) {
            // const node = nodes[0];
            // if (node && isASTString(node)) {
                // // special for ... syntax
                // const value = node.value;
                // if (value.substr(0, 3) === '...') {
                    // hasDestructuring = true;
                    // this.append('...');
                // }
            // }
            // this.append('function() { try { return ('); // ') } }')
            // addWrapper = true;
        // }

        this.expressionSpacesStack.push(this.spaces);
        const oldLength = this.spacesStatck.length;
        nodes.forEach((node, i) => {
            // if is root, add `return` keyword
            if (isRoot && i === lastIndex) {
                this.append('return ');
            }

            this.visitNode(node);
        });
        let newLength = this.spacesStatck.length;
        this.expressionSpacesStack.pop();
        while (newLength > oldLength) {
            this.popSpaces();
            newLength--;
        }

        // if (addWrapper) {
            // this.append(') } catch (e) { error(e) } }.call(this)');
        // }
    }

    private visitNode(node: ASTNode) {
        const type = node.type;
        switch (type) {
            case Types.JSXCommonElement:
                return this.visitJSXCommonElement(node as ASTCommonElement);
            case Types.JSXComponent:
                return this.visitJSXComponent(node as ASTComponent);
            // TODO: merge text and string
            case Types.JSXText:
                return this.visitJSXText(node as ASTText);
            case Types.JS:
                return this.visitJS(node as ASTJS);
            case Types.JSXExpression:
                return this.visit((node as ASTExpression).value, false);
            case Types.JSXString:
                return this.visitJSXString(node as ASTString);
            case Types.JSXBlock:
                return this.visitJSXBlock(node as ASTBlock);
        }

        // } else if (type & Types.JSXBlock) {
            // this.visitJSXBlock(node as ASTTag);
        // } else if (type & Types.JSImport) {
            // this.visitJSImport(node as ASTString);
        // } else if (type & Types.JSXUnescapeText) {
            // this.visitJSXUnescapeText(node as ASTExpression);
        // } else if (type & Types.JSXVdt) {
            // this.visitJSXVdt(node as ASTTag);
        // } else if (type & Types.JSXComment) {
            // this.visitJSXComment(node as ASTString);
        // } else {
            // this.append('null');
        // }
    }

    private visitJS(node: ASTJS): number {
        // this.append(this.enterStringExpression ? `(${node.value})` : node.value);
        const spaces = this.spaces;
        const stack = this.expressionSpacesStack;
        this.spaces = stack[stack.length - 1];

        const lines = node.value;
        const length = lines.length;
        for (let i = 0; i < length; i++) {
            const code = lines[i];
            this.append(code);
            if (i !== length - 1) {
                this.newline();
            }
        }

        this.spaces = spaces;
        this.pushSpaces(node.spaces);

        return node.spaces;
    }

    private visitJSImport(node: ASTString) {
        this.hoist.push(node.value);
    }

    private visitJSXCommonElement(node: ASTCommonElement) {
        if (node.value === 'template') {
            // <template> is a fake tag, we only need handle its children and directives
            this.visitJSXDirective(node, () => {
                this.visitJSXChildren(node.children);
            });
        } else {
            this.visitJSXDirective(node, () => {
                this.visitJSXCommonElementNode(node);
            });
        }
    }

    private visitJSXComponent(node: ASTComponent) {
        this.visitJSXDirective(node, () => {
            const {blocks, children} = this.getJSXBlocks(node);
            if (children.length) {
                node.attributes.push({
                    type: Types.JSXAttribute,
                    name: 'children',
                    value: children,
                    loc: fakeLoc,
                });
            }
            if (blocks.length) {
                node.attributes.push({
                    type: Types.JSXAttribute,
                    name: '_blocks',
                    value: blocks,
                    loc: fakeLoc,
                });
            }

            // TODO: createComponentVNode
            this.append(`$ccv(${node.value}`);

            this.pushQueue();
            this.append(', ');
            const {className, key, ref, hasProps} = this.visitJSXAttribute(node);

            if (hasProps) {
                this.flush(this.popQueue());
                this.pushQueue();
            }

            this.visitKeyAndRef(key, ref);
        });
    }

    private visitJSXText(node: ASTText) {
        this.visitString(node, false);
    }

    private visitJSXUnescapeText(node: ASTExpression) {

    }

    private visitJSXExpression(node: ASTExpression) {

    }

    private visitJSXBlock(node: ASTBlock) {

    }

    private visitJSXVdt(node: ASTVdt) {

    }

    private visitJSXComment(node: ASTComment) {

    }

    private visitJSXTemplate(node: ASTCommonElement) {

    }

    private visitJSXString(node: ASTString) {
        this.visitString(node, false);
    }

    private visitString(node: ASTText | ASTString, noQuotes: boolean) {
        let value = node.value.replace(/([\'\"\\])/g, '\\$1').replace(/[\r\n]/g, '\\n');
        if (!noQuotes) {
            value = `'${value}'`;
        }
        this.append(value);
    }

    private visitJSXDirective(node: ASTElement, body: () => void) {
        const directiveFor: DirectiveFor = {} as DirectiveFor;
        let directiveIf: ASTDirectiveIf | null = null;

        const directives = node.directives;
        for (const key in directives) {
            const directive = directives[key as Directives]!;
            switch (key) {
                case Directives.If:
                    directiveIf = directive as ASTDirectiveIf;
                    break;
                case Directives.For:
                    directiveFor.data = directive.value as ASTExpression;
                    break;
                case Directives.ForValue:
                    directiveFor.value = directive.value as ASTString;
                    break;
                case Directives.ForKey:
                    directiveFor.key = directive.value as ASTString;
                    break;
                default:
                    break;
            }
        }
        
        // handle v-for firstly
        if (directiveFor.data) {
            if (directiveIf) {
                this.visitJSXDirectiveFor(directiveFor, () => {
                    this.visitJSXDirectiveIf(directiveIf!, body);
                });
            } else {
                this.visitJSXDirectiveFor(directiveFor, body);
            }
        } else if (directiveIf) {
            this.visitJSXDirectiveIf(directiveIf, body);
        } else {
            body();
        }
    }

    private visitJSXDirectiveFor(directive: DirectiveFor, body: () => void) {
        // TODO: $map $this
        this.append('$map(');
        this.visitJSXAttributeValue(directive.data);
        this.append(', function(');
        if (directive.value) {
            this.visitJSXString(directive.value);
        } else {
            this.append('value');
        }
        this.append(', ');
        if (directive.key) {
            this.visitJSXString(directive.key);
        } else {
            this.append('key');
        }
        this.append(') {'); 
        this.indent();
        this.append('return ');
        body();
        this.append(';');
        this.dedent();
        this.append('}, $this)');
    }

    private visitJSXDirectiveIf(directive: ASTDirectiveIf, body: () => void) {
        const indentLevel = this.indentLevel;
        let hasElse = false;

        this.visitJSXAttributeValue(directive.value);
        this.append(' ?');
        this.indent();
        body();
        this.append(' :');
        this.newline();

        let next: ASTElement | null = directive.next;
        while (next) {
            const nextDirectives = next.directives;
            const elseIfDir = nextDirectives[Directives.ElseIf];
            if (elseIfDir) {
                this.visitJSXAttributeValue(elseIfDir.value);
                this.append(' ?');
                this.indent();
                this.visitNode(next);
                this.append(' :');
                this.newline();
                next = elseIfDir.next;
                continue;
            } 

            if (nextDirectives[Directives.Else]) {
                this.visitNode(next);
                hasElse = true;
            }
            break;
        }

        if (!hasElse) {
            this.append('undefined');
        }

        this.indentLevel = indentLevel;
    }

    private visitJSXChildren(nodes: ASTChild[]): ChildrenTypes {
        const length = nodes.length;
        if (!length) {
            this.append('null');
            return ChildrenTypes.HasInvalidChildren;
        }

        let childrenType: ChildrenTypes;
        if (length === 1) {
            const child = nodes[0];
            const type = child.type;
            // TODO: v-if v-for
            if (type === Types.JSXExpression) {
                // if has expression, then we can not detect children's type
                childrenType = ChildrenTypes.UnknownChildren;
            } else if (type === Types.JSXText) {
                childrenType = ChildrenTypes.HasTextChildren;
            } else {
                childrenType = ChildrenTypes.HasVNodeChildren;
                this.append('(');
                this.indent();
            }
            this.visitNode(child);
            if (childrenType === ChildrenTypes.HasVNodeChildren) {
                this.dedent();
                this.append(')');
            }
        } else {
            this.append('[');
            this.indent();

            childrenType = ChildrenTypes.HasKeyedChildren;
            const lastIndex = nodes.length - 1;
            nodes.forEach((child, index) => {
                const type = child.type;
                // FIXME: should detect JSXVdt & JSXBlock?
                // if (type & (Types.JSXExpression | Types.JSXVdt | Types.JSXBlock)) {
                if (type === Types.JSXExpression) {
                    childrenType = ChildrenTypes.UnknownChildren;
                }
                if (childrenType !== ChildrenTypes.UnknownChildren) {
                    if (type === Types.JSXText || !(child as ASTElement).keyed) {
                        childrenType = ChildrenTypes.HasNonKeyedChildren;
                    }
                }

                this.visitNode(child);
                if (index !== lastIndex) {
                    this.append(',');
                    this.newline();
                }
            });

            this.dedent();
            this.append(']');
        }

        return childrenType;
    }

    private visitJSXCommonElementNode(node: ASTCommonElement) {
        // TODO: createElementVNode methods
        const tag = node.value;
        this.append(`$cev(${getTypeForVNodeElement(tag)}, '${tag}'`);

        this.pushQueue();
        this.append(', ');
        const childrenType = this.visitJSXChildren(node.children);
        this.append(`, ${childrenType}`);
        if (childrenType !== ChildrenTypes.HasInvalidChildren) {
            this.flush(this.popQueue());
            this.pushQueue();
        }

        const propsQueue = this.pushQueue();
        this.append(', ');
        const {className, key, ref, hasProps} = this.visitJSXAttribute(node);
        this.popQueue();

        this.append(', ');
        if (className) {
            this.flush(this.popQueue());
            this.visitJSXAttributeClassName(className);
            this.pushQueue();
        } else {
            this.append('null')
        }

        this.flush(propsQueue);
        if (hasProps) {
            this.flush(this.popQueue());
            this.pushQueue();
        }

        this.visitKeyAndRef(key, ref);
    }

    private visitJSXAttribute(node: ASTElement): 
        {
            className: ASTAttributeTemplateValue | null,
            key: ASTAttributeTemplateValue | null,
            ref: ASTAttributeTemplateValue | null,
            hasProps: boolean,
        }
    {
        const attributes = node.attributes;
        let className: ASTAttributeTemplateValue | null = null;
        let key: ASTAttributeTemplateValue | null = null;
        let ref: ASTAttributeTemplateValue | null = null;

        if (!attributes.length) {
            this.append('null');
            return {className, key, ref, hasProps: false};
        }
        
        let isFirstAttr: boolean = true;
        const addAttribute = (name?: string) => {
            if (isFirstAttr) {
                this.append('{');
                this.indent();
                isFirstAttr = false;
            } else {
                this.append(', ');
                this.newline();
            }
            if (name) {
                this.append(`'${name}': `);
            }
        }
    
        const isCommonElement = node.type === Types.JSXCommonElement;
        const addition: {type?: ASTString} = {};

        attributes.forEach(attr => {
            if (attr.type === Types.JSXExpression) {
                addAttribute();
                this.visitJSXAttributeValue(attr);
                return;
            } 

            const name = getAttrName(attr.name);
            switch (name) {
                case 'className':
                    if (!isCommonElement) {
                        addAttribute(name);
                        this.visitJSXAttributeClassName(attr.value as ASTAttributeTemplateValue);
                    }
                    className = attr.value as ASTAttributeTemplateValue;
                    break;
                case 'key':
                    if (!isCommonElement) {
                        addAttribute(name);
                        this.visitJSXAttributeValue(attr.value as ASTAttributeTemplateValue);
                    }
                    key = attr.value as ASTAttributeTemplateValue;
                    break;
                case 'ref':
                    if (!isCommonElement) {
                        addAttribute(name);
                        this.visitJSXAttributeRef(attr.value as ASTAttributeTemplateValue);
                    }
                    ref = attr.value as ASTAttributeTemplateValue;
                    break;
                case 'type':
                    // save the type for v-model of input element
                    addAttribute(name);
                    this.visitJSXAttributeValue(attr.value);
                    addition.type = attr.value as ASTString;
                    break;
                default:
                    addAttribute(name);
                    this.visitJSXAttributeValue(attr.value);
                    break;
            } 
        });

        if (!isFirstAttr) {
            this.dedent();
            this.append('}');
        } else {
            this.append('null');
        }

        return {className, key, ref, hasProps: !isFirstAttr};
    }

    private visitJSXAttributeClassName(value: ASTAttributeTemplateValue) {
        if (value.type === Types.JSXExpression) {
            // TODO: $className
            this.append('$className(');
            this.visitJSXAttributeValue(value);
            this.append(')');
        } else {
            this.visitJSXAttributeValue(value);
        }
    }

    private visitJSXAttributeValue(value: ASTAttributeValue) {
        if (isArray(value)) {
            this.visitJSXChildren(value);
        } else {
            this.visitNode(value);
        }
    }

    private visitJSXAttributeRef(value: ASTAttributeTemplateValue) {
        if (value.type === Types.JSXString) {
            // TODO: $refs and extract ref
            this.append(`function(i) {$refs[`);
            this.visitJSXAttributeValue(value);
            this.append(`] = i}`);
        } else {
            this.visit(value.value, false);
        }
    }

    private getJSXBlocks(node: ASTComponent) {
        const blocks: ASTBlock[] = [];
        const children: ASTElementChild[] = [];
        node.children.forEach(child => {
            if (child.type === Types.JSXBlock) {
                blocks.push(child);
            } else {
                children.push(child);
            }
        });

        return {blocks, children};
    }

    private visitKeyAndRef(key: ASTAttributeTemplateValue | null, ref: ASTAttributeTemplateValue | null) {
        this.append(', ');
        if (key) {
            this.flush(this.popQueue());
            this.visitJSXAttributeValue(key);
            this.pushQueue();
        } else {
            this.append('null');
        }

        this.append(', ');
        if (ref) {
            this.flush(this.popQueue());
            this.visitJSXAttributeRef(ref);
            this.pushQueue();
        } else {
            this.append('null');
        }

        this.popQueue();
        this.append(')');
    }

    private append(code: string) {
        this.current.push(code);

        if (true /* sourceMap */) {
            // TODO 
        }
    }

    private pushQueue() {
        this.current = [];
        this.queueStack.push(this.current);

        return this.current;
    }

    private popQueue() {
        const stack = this.queueStack;
        const queue = stack.pop()!;
        this.current = stack[stack.length - 1];

        return queue;
    }

    private flush(queue: string[]) {
        for (let i = 0; i < queue.length; i++) {
            this.append(queue[i]);
        }
    }

    private indent() {
        this.indentLevel++;
        this.newline();
    }

    private dedent() {
        this.indentLevel--;
        this.newline();
    }

    private newline() {
        this.append('\n' + `    `.repeat(this.indentLevel) + this.spaces);
    }

    private pushSpaces(spaces: number) {
        if (spaces) {
            this.spaces += ' '.repeat(spaces); 
        }
        this.spacesStatck.push(this.spaces);
    }

    private popSpaces() {
        const stack = this.spacesStatck;
        stack.pop()!;
        this.spaces = stack[stack.length - 1];
    }
}
