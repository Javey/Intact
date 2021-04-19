// import {
    // Types,
    // TypeTag,
    // TypeString,
    // TypeExpression,
    // TypeChild,
    // TypeAttributeValue,
    // ASTNode,
    // ASTChild,
    // ASTTag,
    // ASTString,
    // ASTExpression,
    // ASTAttribute,
    // DirectiveFor,
// } from './types';
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
    Directives,
    DirectiveFor,
    Options,
} from './types';

import {getTypeForVNodeElement, ChildrenTypes} from 'misstime';
import {isElementNode, getAttrName} from './helpers';

const FUNCTION_HEAD = `
function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
`;

export class Visitor {
    private enterStringExpression: boolean = false;
    private hoist: string[] = [];
    private queue: string[] = [];
    private pendingQueue: string[] = [];
    private current: string[] = this.queue;

    constructor(nodes: ASTRootChild[]) {
        this.visit(nodes, true);
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

        nodes.forEach((node, i) => {
            // if is root, add `return` keyword
            if (isRoot && i === lastIndex) {
                this.append('return ');
            }

            this.visitChild(node, nodes, i);
        });

        // if (addWrapper) {
            // this.append(') } catch (e) { error(e) } }.call(this)');
        // }
    }

    private visitChild(node: ASTChild, children: ASTChild[], index: number) {
        const type = node.type;
        switch (type) {
            case Types.JSXCommonElement:
                return this.visitJSXCommonElement(node as ASTCommonElement, children, index);
            case Types.JSXComponent:
                return this.visitJSXComponent(node as ASTComponent);
        }

        if (type & Types.JSXElement) {
            this.visitJSXElement(node as ASTTag);
        } else if (type & Types.JSXComponent) {
            this.visitJSXComponent(node as ASTTag);
        } else if (type & Types.JSXExpression) {
            this.visitJSXExpression(node as ASTExpression);
        } else if (type & Types.JSXText) {
            this.visitJSXText(node as ASTTag, false);
        } else if (type & Types.JSXBlock) {
            this.visitJSXBlock(node as ASTTag);
        } else if (type & Types.JSXString) {
            this.visitJSXString(node as ASTString);
        } else if (type & Types.JS) {
            this.visitJS(node as ASTString);
        } else if (type & Types.JSImport) {
            this.visitJSImport(node as ASTString);
        } else if (type & Types.JSXUnescapeText) {
            this.visitJSXUnescapeText(node as ASTExpression);
        } else if (type & Types.JSXVdt) {
            this.visitJSXVdt(node as ASTTag);
        } else if (type & Types.JSXComment) {
            this.visitJSXComment(node as ASTString);
        } else {
            this.append('null');
        }
    }

    private visitJS(node: ASTString) {
        this.append(this.enterStringExpression ? `(${node.value})` : node.value);
    }

    private visitJSImport(node: ASTString) {
        this.hoist.push(node.value);
    }

    private visitJSXCommonElement(node: ASTCommonElement, children: ASTChild[], index: number) {
        if (node.value === 'template') {
            // <template> is a fake tag, we only need handle its children and directives
            this.visitJSXDirective(node, children, index, () => {
                this.visitJSXChildren(node.children);
            });
        } else {
            this.visitJSXDirective(node, children, index, () => {
                this.visitJSXElementWithoutDirective(node);
            });
        }
    }

    private visitJSXText(node: ASTString, noQuotes: boolean) {

    }

    private visitJSXUnescapeText(node: ASTExpression) {

    }

    private visitJSXExpression(node: ASTExpression) {

    }

    private visitJSXComponent(node: ASTComponent) {

    }

    private visitJSXBlock(node: ASTTag) {

    }

    private visitJSXVdt(node: ASTTag) {

    }

    private visitJSXComment(node: ASTString) {

    }

    private visitJSXTemplate(node: ASTTag) {

    }

    private visitJSXString(node: ASTString) {

    }

    private visitJSXDirective(node: ASTElement, children: ASTChild[], index: number, body: () => void) {
        const directiveFor: DirectiveFor = {} as DirectiveFor;
        let directiveIf: ASTAttribute | null = null;

        const directives = node.directives;
        for (let key in directives) {
            const directive = directives[key];
            switch (directive.name) {
                case Directives.If:
                    directiveIf = directive;
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
                    this.visitJSXDirectiveIf(directiveIf!, node, children, index, body);
                });
            } else {
                this.visitJSXDirectiveFor(directiveFor, body);
            }
        } else if (directiveIf) {
            this.visitJSXDirectiveIf(directiveIf, node, children, index, body);
        } else {
            body();
        }
    }

    private visitJSXDirectiveFor(directive: DirectiveFor, body: () => void) {
        // TODO: $map method
        this.append('$map(');
        this.visitJSXAttributeValue(directive.data);
        this.append(', function(');
        if (directive.value) {
            this.visitJSXText(directive.value, true);
        } else {
            this.append('value');
        }
        this.append(', ');
        if (directive.key) {
            this.visitJSXText(directive.key, true);
        } else {
            this.append('key');
        }
        this.append(') { return');
        body();
        this.append('; }, this)');
    }

    private visitJSXDirectiveIf(directive: ASTAttribute, node: ASTElement, children: ASTChild[], index: number, body: () => void) {
        let hasElse = false;

        this.visitJSXAttributeValue(directive.value);
        this.append(' ? ');
        body();
        this.append(' : ');

        for (let next: ASTChild | undefined = children[++index]; next; next = children[++index]) {
            if (next.type === Types.JSXComment) continue;
            if (!isElementNode(next)) break;

            const nextDirectives = next.directives;
            const elseIf = nextDirectives[Directives.ElseIf];

            if (elseIf) {
                this.visitJSXAttributeValue(elseIf.value);
                this.append(' ? ');
                this.visitChild(next, children, index);
                this.append(' : ');
            } else if (nextDirectives[Directives.Else]) {
                this.visitChild(next, children, index);
                hasElse = true;
            }

            // remove this node
            children.splice(index, 1);
            index--;

            break;
        }
        
        if (!hasElse) this.append('undefined');
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
            if (type === Types.JSXExpression) {
                // if has expression, then we can not detect children's type
                childrenType = ChildrenTypes.UnknownChildren;
            } else if (type === Types.JSXText) {
                childrenType = ChildrenTypes.HasTextChildren;
            } else {
                childrenType = ChildrenTypes.HasVNodeChildren;
            }
            this.visitChild(child, nodes, 0);
        } else {
            this.append('[');
            childrenType = ChildrenTypes.HasKeyedChildren;
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

                this.visitChild(child, nodes, index);
                this.append(',');
            });

            this.append(']');
        }

        return childrenType;
    }

    private visitJSXElementWithoutDirective(node: ASTCommonElement) {
        // TODO: createElementVNode methods
        const tag = node.value;
        this.append(`createElementVNode('${getTypeForVNodeElement(tag)}', ${tag}, `);

        const childrenType = this.visitJSXChildren(node.children);
        this.append(`, ${childrenType}, `);

        this.usePending();
        const {className, key, ref} = this.visitJSXAttribute(node);
        this.useAppend();

        if (className) {
            this.visitJSXAttributeClassName(className!);
        } else {
            this.append('null')
        }
        this.append(', ');
        this.flush();

        this.append(', ');
        if (key) {
            this.visitJSXAttributeValue(key!);
        } else {
            this.append('null');
        }

        this.append(', ');
        if (ref) {
            this.visitJSXAttributeRef(ref!);
        } else {
            this.append('null');
        }

        this.append(')');
    }

    private visitJSXAttribute(node: ASTElement) {
        const attributes = node.attributes;
        let className: ASTString | ASTExpression | null = null;
        let key: ASTString | ASTExpression | null = null;
        let ref: ASTString | ASTExpression | null = null;

        if (!attributes.length) {
            this.append('null');
            return {className, key, ref};
        }
        
        let isFirstAttr: boolean = true;
        const addAttribute = (name?: string) => {
            if (isFirstAttr) {
                this.append('{');
                isFirstAttr = false;
            } else {
                this.append(', ');
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
                        this.visitJSXAttributeClassName(attr.value);
                    }
                    className = attr.value;
                    break;
                case 'key':
                    if (!isCommonElement) {
                        addAttribute(name);
                        this.visitJSXAttributeValue(attr.value);
                    }
                    key = attr.value;
                    break;
                case 'ref':
                    if (!isCommonElement) {
                        addAttribute(name);
                        this.visitJSXAttributeRef(attr.value);
                    }
                    ref = attr.value;
                    break;
                case 'type':
                    // save the type for v-model of input element
                    addAttribute(name);
                    this.visitJSXAttributeValue(attr.value);
                    addition.type = attr.value as ASTString;
                    break;
            } 
        });

        return {className, key, ref};
    }

    private visitJSXAttributeClassName(value: ASTString | ASTExpression) {
        if (value.type & Types.JSXExpression) {
            // TODO: $className
            this.append('$className(');
            this.visitJSXAttributeValue(value);
            this.append(')');
        } else {
            this.visitJSXAttributeValue(value);
        }
    }

    private visitJSXAttributeValue(value: ASTString | ASTExpression) {
        if (value.type === Types.JSXString) {
            this.append(value.value);
        } else {
            this.visit(value.value, false);
        }
    }

    private visitJSXAttributeRef(value: ASTString | ASTExpression) {
        if (value.type === Types.JSXString) {
            // TODO: $refs
            this.append(`function(i) {$refs[`);
            this.visitJSXAttributeValue(value);
            this.append(`] = i}`);
        } else {
            this.visit(value.value, false);
        }
    }

    private append(code: string) {
        this.current.push(code);
    }

    private usePending() {
        this.current = this.pendingQueue;
    }

    private useAppend() {
        this.current = this.queue;
    }

    private flush() {
        let code;
        this.useAppend();
        while (code = this.pendingQueue.shift()) {
            this.append(code);
        }
    }
}
