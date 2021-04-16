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
    DirectiveFor,
} from './types';
import {isASTString, isASTTag, getAttrName} from './common';
import {getTypeForVNodeElement, ChildrenTypes} from 'misstime';

const FUNCTION_HEAD = `
function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
`;

export class Visitor {
    private enterStringExpression: boolean = false;
    private hoist: string[] = [];
    private body: string[] = [];
    private pendingQueue: string[] = [];

    constructor(nodes: ASTChild[]) {
        this.visit(nodes, true);
    }

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

            this.visitChild(node);
        });

        // if (addWrapper) {
            // this.append(') } catch (e) { error(e) } }.call(this)');
        // }
    }

    private visitChild(node: ASTChild) {
        const type = node.type;
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

    private visitJSXElement(node: ASTTag) {
        if (node.value === 'template') {
            // <template> is a fake tag, we only need handle its children and itself directives
            this.visitJSXDirective(node, () => {
                this.visitJSXChildren(node.children);
            });
        } else {
            this.visitJSXDirective(node, () => {
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

    private visitJSXComponent(node: ASTTag) {

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

    private visitJSXDirective(node: ASTTag, body: () => void) {
        const directiveFor: DirectiveFor = {} as DirectiveFor;
        let directiveIf: ASTAttribute | null = null;

        const directives = node.directives;
        for (let key in directives) {
            const directive = directives[key];
            switch (directive.name) {
                case 'v-if':
                    directiveIf = directive;
                    break;
                case 'v-for':
                    directiveFor.data = directive.value;
                    break;
                case 'v-for-value':
                    directiveFor.value = directive.value as ASTString;
                    break;
                case 'v-for-key':
                    directiveFor.key = directive.value as ASTString;
                    break;
                default:
                    break;
            }
        }
        
        // handle v-for firstly
        if (directiveFor.data) {
            if (directiveIf) {
                this.visitJSXDirectiveFor(directiveFor, node, () => {
                    this.visitJSXDirectiveIf(directiveIf!, node, body);
                });
            } else {
                this.visitJSXDirectiveFor(directiveFor, node, body);
            }
        } else if (directiveIf) {
            this.visitJSXDirectiveIf(directiveIf, node, body);
        } else {
            body();
        }
    }

    private visitJSXDirectiveFor(directive: DirectiveFor, node: ASTTag, body: () => void) {
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

    private visitJSXDirectiveIf(directive: ASTAttribute, node: ASTTag, body: () => void) {
        let hasElse = false;
        let next: ASTChild | null = node;

        this.visitJSXAttributeValue(directive.value);
        this.append(' ? ');
        body();
        this.append(' : ');

        while (next = next.next) {
            if (!isASTTag(next)) break;

            const nextDirectives = next.directives;
            const vElseIf = nextDirectives['v-else-if'];

            if (vElseIf) {
                this.visitJSXAttributeValue(vElseIf.value);
                this.append(' ? ');
                this.visit(next);
                this.append(' : ');
                continue;
            }
            if (nextDirectives['v-else']) {
                this.visit(next);
                hasElse = true;
            }

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
            if (type & Types.JSXExpression) {
                // if has expression, then we can not detect children's type
                childrenType = ChildrenTypes.UnknownChildren;
            } else if (type & Types.JSXText) {
                childrenType = ChildrenTypes.HasTextChildren;
            } else {
                childrenType = ChildrenTypes.HasVNodeChildren;
            }
            this.visitChild(child);
        } else {
            this.append('[');
            childrenType = ChildrenTypes.HasKeyedChildren;
            nodes.forEach((child) => {
                const type = child.type;
                // FIXME: should detect JSXVdt & JSXBlock?
                // if (type & (Types.JSXExpression | Types.JSXVdt | Types.JSXBlock)) {
                if (type & Types.JSXExpression) {
                    childrenType = ChildrenTypes.UnknownChildren;
                }
                if (childrenType !== ChildrenTypes.UnknownChildren) {
                    if (type & Types.JSXText || (type & Types.HasKey) === 0) {
                        childrenType = ChildrenTypes.HasNonKeyedChildren;
                    }
                }

                this.visitChild(child);
                this.append(',');
            });

            this.append(']');
        }

        return childrenType;
    }

    private visitJSXElementWithoutDirective(node: ASTTag) {
        // TODO: createElementVNode methods
        const tag = node.value;
        this.append(`createElementVNode('${getTypeForVNodeElement(tag)}', ${tag}, `);

        const childrenType = this.visitJSXChildren(node.children);
        this.append(`, ${childrenType}, `);

        const {attributes} = this.visitJSXAttribute(node, true, true, true /* appendQueue */);

        this.append(', ');
        if (attributes.className) {
            this.visitJSXAttributeClassName(attributes.className);
        } else {
            this.appendQueue('null');
        }

        this.append(', ');
        if (attributes.key) {
            this.visitJSXAttributeValue(attributes.key);
        } else {
            this.append('null');
        }

        this.append(', ');
        if (attributes.ref) {
            this.visitJSXAttributeRef(attributes.ref);
        }

        this.append(')');
    }

    private visitJSXAttribute(node: ASTTag) {
        const attributes = node.attributes;
        if (!attributes.length) return null;
        
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
    
        const addition: {type?: string} = {};

        attributes.forEach(attr => {
            if (attr.type & Types.JSXExpression) {
                addAttribute();
                this.visitJSXAttributeValue(attr);
                return;
            } 

            const name = getAttrName((attr as ASTAttribute).name);
            switch (name) {
                case 'className':
                    addAttribute(name);
                    this.visitJSXAttributeClassName(attr.value);
                    break;
                case 'key':
                    addAttribute(name);
                    this.visitJSXAttributeValue(attr.value);
                    break;
                case 'ref':
                    addAttribute(name);
                    this.visitJSXAttributeRef(attr.value);
                    break;
                case 'type':
                    // save the type for v-model of input element
                    addAttribute(name);
                    this.visitJSXAttributeValue(attr.value);
                    // addition.type = this.last;
                    break;
            } 
        });
    }

    private append(code: string) {
        this.body.push(code);
    }

    private pending(code: string) {

    }
}
