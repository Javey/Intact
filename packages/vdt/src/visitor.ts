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
    ASTAttributeTemplateNoneValue,
    ASTAttributeValue,
    ASTDirectiveIf,
    ASTUnescapeText,
    ASTStrings,
    Directives,
    DirectiveFor,
    Options,
    ChildrenFlags,
} from './types';
import {getTypeForVNodeElement, ChildrenTypes, Types as VNodeTypes} from 'misstime';
import {
    isElementNode, 
    getAttrName, 
    computeChildrenFlagForVIf,
    computeChildrenFlagForChildren,
    childrenFlagToChildrenType,
    helpersMap,
} from './helpers';
import {isArray, isUndefined} from 'intact-shared';

type ModelMeta = {
    type?: ASTString
    trueValue?: ASTAttributeTemplateNoneValue
    falseValue?: ASTAttributeTemplateNoneValue
    value?: ASTAttributeTemplateNoneValue
}
type Model = {
    name: string
    value: ASTAttributeTemplateNoneValue
}
type DirectiveCallback = (hasFor: boolean) => ChildrenFlags
type Helpers = keyof typeof helpersMap

const fakeLoc: SourceLocation = {line: 0, column: 0};
const numberRegExp = /^\d+$/;

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
    private helpers: {[key in Helpers]?: true} = {};
    private declares: Record<string, string[] | string> = {};
    private functionHead: string[];
    private tmpIndex = 0;
    private hoistDeclares: [string, string[]][] = [];

    constructor(nodes: ASTRootChild[]) {
        this.functionHead = this.pushQueue();
        this.append(`function($props, $blocks) {`);
        this.indent();
        this.append(`$blocks || ($blocks = {});`);
        this.newline();
        this.append(`$props || ($props = {});`);
        this.newline();
        this.append('var $this = this;');
        this.popQueue();

        this.newline();
        this.visit(nodes, true);

        this.append(';');
        this.dedent();
        this.append('};');
    }

    getCode() {
        const helpers: string[] = [];
        for (let key in this.helpers) {
            helpers.push(`var ${key} = Vdt.${helpersMap[key as Helpers]};\n`);
        }

        return [
            this.hoist.join(''),
            `var Vdt = _$vdt;\n`,
            helpers.join(''),
            this.getHositDeclares(),
            `\nreturn `,
            this.functionHead.join(''),
            this.getDelares(),
            this.queue.join(''),
        ].join('');
    }

    getModuleCode() {
        const helpers = this.pushQueue();
        const keys = Object.keys(this.helpers);
        const length = keys.length;
        if (length) {
            helpers.push(`import {`);
            this.indent();
            for (let i = 0; i < length; i++) {
                const key = keys[i];
                helpers.push(`${helpersMap[key as Helpers]} as ${key},`);
                if (i !== length - 1) {
                    this.newline();
                }
            }
            this.dedent();
            this.append(`} from 'vdt';\n`);
        }
        this.popQueue();

        return [
            helpers.join(''),
            this.hoist.join(''),
            this.getHositDeclares(),
            '\nexport default ',
            this.functionHead.join(''),
            this.getDelares(),
            this.queue.join(''),
        ].join('');
    }

    private getDelares() {
        const declares = this.pushQueue();
        this.indent();
        for (let key in this.declares) {
            const declare = this.declares[key];
            this.append(`var ${key} = `);
            this.append(isArray(declare) ? declare.join('') : declare);
            this.append(';');
            this.newline();
        }
        this.indentLevel--;
        this.popQueue();

        return declares.join('');
    }

    private getHositDeclares() {
        const declares = [];
        const hoistDeclares = this.hoistDeclares;
        for (let i = 0; i < hoistDeclares.length; i++) {
            const [key, code] = hoistDeclares[i];
            declares.push(`var ${key} = ${code.join('')};\n`);
        }
        return declares.join('');
    }

    private visit(nodes: ASTRootChild[], isRoot: true): void;
    private visit(nodes: ASTElementChild[] | ASTExpressionChild[], isRoot: false): void;
    private visit(nodes: ASTChild[], isRoot: boolean) {
        const length = nodes.length;
        const lastIndex = length - 1;

        this.expressionSpacesStack.push(this.spaces);
        const oldLength = this.spacesStatck.length;
        for (let i = 0; i < nodes.length; i++) {
            // if is root, add `return` keyword
            if (isRoot && i === lastIndex) {
                this.append('return ');
            }

            this.visitNode(nodes[i], isRoot, true);
        }
        let newLength = this.spacesStatck.length;
        this.expressionSpacesStack.pop();
        while (newLength > oldLength) {
            this.popSpaces();
            newLength--;
        }
    }

    private visitNode(node: ASTNode, isRoot: boolean, textToVNode: boolean): ChildrenFlags | undefined {
        const type = node.type;
        switch (type) {
            case Types.JSXCommonElement:
            case Types.JSXComponent:
            case Types.JSXBlock:
            case Types.JSXVdt:
                return this.visitJSXElement(node as ASTElement, isRoot, textToVNode);
            case Types.JSXText:
                return this.visitJSXText(node as ASTText, textToVNode);
            case Types.JSXString:
                this.visitString(node as ASTString | ASTText, false);
                return;
            case Types.JS:
                this.visitJS(node as ASTJS);
                return;
            case Types.JSXExpression:
                return this.visitJSXExpression(node as ASTExpression);
            case Types.JSHoist:
                this.visitJSHoist(node as ASTHoist);
                return;
            case Types.JSXComment:
                return this.visitJSXComment(node as ASTComment);
            case Types.JSXUnescapeText:
                return this.visitJSXUnescapeText(node as ASTUnescapeText);
            case Types.JSXStrings:
                this.visitStrings(node as ASTStrings);
                return;
            case Types.JSXNone:
                this.append('true');
                return;
        }
    }

    private visitJS(node: ASTJS) {
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
    }

    private visitJSHoist(node: ASTHoist) {
        this.hoist.push(node.value);
    }

    private visitJSXElement(node: ASTElement, isRoot: boolean, textToVNode: boolean): ChildrenFlags {
        return this.visitJSXDirective(node, hasFor => {
            switch (node.type) {
                case Types.JSXCommonElement:
                    if (node.value === 'template') {
                        // <template> is a fake tag, we only need handle its children and directives
                        return this.visitJSXChildren(node.children, hasFor ? true : textToVNode);
                    }
                    return this.visitJSXCommonElement(node);
                case Types.JSXComponent:
                    return this.visitJSXComponent(node);
                case Types.JSXBlock:
                    return this.visitJSXBlock(node, true);
                case Types.JSXVdt:
                    return this.visitJSXVdt(node, isRoot);
            }
        });
    }

    private visitJSXCommonElement(node: ASTCommonElement): ChildrenFlags {
        const tag = node.value;
        this.addHelper('_$ce');
        this.append(`_$ce(${getTypeForVNodeElement(tag)}, '${tag}'`);

        this.pushQueue();
        this.append(', ');
        const childrenFlag = this.visitJSXChildren(node.children);
        this.append(`, ${childrenFlagToChildrenType(childrenFlag)}`);
        if (childrenFlag !== ChildrenFlags.HasInvalidChildren) {
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

        return this.visitProps(hasProps, key, ref, false);
    }

    private visitJSXComponent(node: ASTComponent): ChildrenFlags {
        const blocks = this.getJSXBlocksAndSetChildren(node);
        if (blocks.length) {
            node.attributes.push({
                type: Types.JSXAttribute,
                name: '$blocks',
                value: blocks,
                loc: fakeLoc,
            });
        }

        this.addHelper('_$cc');
        this.append(`_$cc(${node.value}`);

        this.pushQueue();
        this.append(', ');
        const {className, key, ref, hasProps} = this.visitJSXAttribute(node);

        return this.visitProps(hasProps, key, ref, true);
    }

    private visitJSXExpression(node: ASTExpression): ChildrenFlags {
        const value = node.value;
        if (!value.length) {
            this.append('null');
            return ChildrenFlags.HasInvalidChildren;
        } else {
            this.visit(value, false);
            return ChildrenFlags.UnknownChildren;
        }
    }

    private visitJSXText(node: ASTText, textToVNode: boolean): ChildrenFlags {
        if (textToVNode) {
            this.addHelper('_$ct');
            this.append('_$ct(');
            this.visitString(node, false);
            this.append(')');
            return ChildrenFlags.HasNonKeyedVNodeChildren;
        }

        this.visitString(node, false);
        return ChildrenFlags.HasTextChildren;
    }

    private visitStrings(node: ASTStrings) {
        const value = node.value;
        const lastIndex = value.length - 1;
        for (let i = 0; i <= lastIndex; i++) {
            this.visitNode(value[i], false, false);
            if (i !== lastIndex) {
                this.append(' + ');
            }
        }
    }

    private visitJSXUnescapeText(node: ASTUnescapeText): ChildrenFlags {
        this.addHelper('_$cu');
        this.append('_$cu(');
        this.visit(node.value, false);
        this.append(')');

        return ChildrenFlags.HasNonKeyedVNodeChildren;
    }

    private visitJSXBlock(node: ASTBlock, shouldCall: boolean): ChildrenFlags {
        const {params, args} = this.getJSXBlocksAttribute(node);
        const name = node.value;

        if (shouldCall) {
            this.addDeclare('_$blocks', '{}');
            this.addDeclare('__$blocks', '{}');
        }

        this.append('(');
        this.indent();
        this.append(`(_$blocks['${name}'] = function($super`);
        if (args) {
            this.append(', ')
            this.visitString(args, true);
        }
        this.append(') {');
        this.indent();
        this.append('return ');
        this.visitJSXChildren(node.children);
        this.append(';');
        this.dedent();
        this.append(`}),`);
        this.newline();
        this.append(`(__$blocks['${name}'] = function($super, data) {`);
        this.indent();
        this.append(`var block = $blocks['${name}'];`);
        this.newline();
        this.append(`var callBlock = function() {`);
        this.indent();
        this.append(`return _$blocks['${name}'].call($this, $super, data);`);
        this.dedent();
        this.append('};');
        this.newline();
        this.append(`return block ?`);
        this.indent();
        this.append(`block.call($this, callBlock, data) :`);
        this.newline();
        this.append(`callBlock();`);
        this.indentLevel--;
        this.dedent();
        this.append('})');

        // if it is in ancestor, we should call this block
        if (shouldCall) {
            this.append(',');
            this.newline();
            this.addHelper('_$no');
            if (params) {
                this.append(`__$blocks['${name}'](_$no, `);
                this.visitJSXAttributeValue(params);
                this.append(')');
            } else {
                this.append(`__$blocks['${name}'](_$no)`);
            }
        }
        this.dedent();
        this.append(')');

        return ChildrenFlags.UnknownChildren;
    }

    private visitJSXVdt(node: ASTVdt, isRoot: boolean): ChildrenFlags {
        const name = node.value;
        const blocks = this.getJSXBlocksAndSetChildren(node);
        
        this.append(`${name}.call($this, `);
        this.visitJSXAttribute(node);
        this.append(`, `);
        if (blocks.length) {
            this.visitJSXBlocks(blocks, isRoot);
        } else {
            this.append(isRoot ? '$blocks' : 'null');
        }
        this.append(')');

        return ChildrenFlags.UnknownChildren;
    }

    private visitJSXComment(node: ASTComment): ChildrenFlags {
        this.addHelper('_$ccv');
        this.append('_$ccv(');
        this.visitString(node, false);
        this.append(')');

        return ChildrenFlags.HasNonKeyedVNodeChildren;
    }

    private visitString(node: ASTText | ASTString | ASTComment, noQuotes: boolean) {
        let value = node.value.replace(/([\'\"\\])/g, '\\$1').replace(/[\r\n]/g, '\\n');
        if (!noQuotes) {
            value = `'${value}'`;
        }
        this.append(value);
    }

    private visitJSXDirective(node: ASTElement, body: DirectiveCallback): ChildrenFlags {
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
                return this.visitJSXDirectiveFor(directiveFor, () => {
                    return this.visitJSXDirectiveIf(directiveIf!, () => body(true));
                });
            } else {
                return this.visitJSXDirectiveFor(directiveFor, () => body(true));
            }
        } else if (directiveIf) {
            return this.visitJSXDirectiveIf(directiveIf, () => body(false));
        } else {
            return body(false);
        }
    }

    private visitJSXDirectiveFor(directive: DirectiveFor, body: () => ChildrenFlags): ChildrenFlags {
        this.addHelper('_$ma');
        this.append('_$ma(');
        this.visitJSXAttributeValue(directive.data);
        this.append(', function(');
        if (directive.value) {
            this.visitString(directive.value, true);
        } else {
            this.append('$value');
        }
        this.append(', ');
        if (directive.key) {
            this.visitString(directive.key, true);
        } else {
            this.append('$key');
        }
        this.append(') {'); 
        this.indent();
        this.append('return ');
        const childrenFlag = body();
        this.append(';');
        this.dedent();
        this.append('}, $this)');

        if (childrenFlag & ChildrenFlags.KeydChildren) {
            return ChildrenFlags.HasKeyedChildren;
        } else if (childrenFlag === ChildrenFlags.UnknownChildren) {
            return childrenFlag;
        }
        return ChildrenFlags.HasNonKeyedChildren;
    }

    private visitJSXDirectiveIf(directive: ASTDirectiveIf, body: () => ChildrenFlags): ChildrenFlags {
        const indentLevel = this.indentLevel;
        let hasElse = false;

        this.visitJSXAttributeValue(directive.value);
        this.append(' ?');
        this.indent();
        let childrenFlag = body();
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
                childrenFlag = computeChildrenFlagForVIf(childrenFlag, this.visitNode(next, false, false)!);
                this.append(' :');
                this.newline();
                next = elseIfDir.next;
                continue;
            } else {
                // should be Directives.Else
                childrenFlag = computeChildrenFlagForVIf(childrenFlag, this.visitNode(next, false, false)!);
                hasElse = true;
            } 

            break;
        }

        if (!hasElse) {
            this.append('undefined');
            childrenFlag = computeChildrenFlagForVIf(childrenFlag, ChildrenFlags.HasInvalidChildren);
        }

        this.indentLevel = indentLevel;

        return childrenFlag;
    }

    private visitJSXChildren(nodes: ASTChild[], textToVNode?: boolean): ChildrenFlags {
        const length = nodes.length;
        if (!length) {
            this.append('null');
            return ChildrenFlags.HasInvalidChildren;
        }

        let childrenFlag: ChildrenFlags | null = null;

        if (length === 1) {
            const child = nodes[0]
            let hasIndent = false;
            if (isElementNode(child)) {
                hasIndent = true;
                this.append('(');
                this.indent();
            }
            childrenFlag = this.visitNode(child, false, isUndefined(textToVNode) ? false : textToVNode)!;
            if (hasIndent) {
                this.dedent();
                this.append(')');
            }
        } else {
            this.append('[');
            this.indent();

            const lastIndex = nodes.length - 1;
            for (let i = 0; i < nodes.length; i++) {
                const child = nodes[i];
                const type = child.type;
                const flag = this.visitNode(child, false, true);
                childrenFlag = computeChildrenFlagForChildren(childrenFlag, flag!);
                if (i !== lastIndex) {
                    this.append(',');
                    this.newline();
                }

            }

            this.dedent();
            this.append(']');

            if (childrenFlag === ChildrenFlags.HasKeyedVNodeChildren) {
                childrenFlag = ChildrenFlags.HasKeyedChildren;
            } else if (childrenFlag === ChildrenFlags.HasNonKeyedVNodeChildren) {
                childrenFlag = ChildrenFlags.HasNonKeyedChildren;
            }
        }

        return childrenFlag!;
    }

    private visitJSXAttribute(node: ASTElement): 
        {
            className: ASTAttributeTemplateNoneValue | null,
            key: ASTAttributeTemplateNoneValue | null,
            ref: ASTAttributeTemplateNoneValue | null,
            hasProps: boolean,
        }
    {
        const attributes = node.attributes;
        let className: ASTAttributeTemplateNoneValue | null = null;
        let key: ASTAttributeTemplateNoneValue | null = null;
        let ref: ASTAttributeTemplateNoneValue | null = null;

        if (!attributes.length) {
            this.append('null');
            return {className, key, ref, hasProps: false};
        }
        
        // use a queue to save props, so we can extract it when there isn't dynamic prop
        const propsQueue = this.pushQueue();
        const isCommonElement = node.type === Types.JSXCommonElement;
        const modelMeta: ModelMeta = {};
        const models: Model[] = [];
        const hasDynamicProp = this.hasDynamicProp(attributes, isCommonElement);
        let indentLevel = this.indentLevel;
        if (!hasDynamicProp) {
            this.indentLevel = 0;
        }

        let isFirstAttr: boolean = true;
        const addAttribute = (name?: string) => {
            if (isFirstAttr) {
                this.append('{');
                this.indent();
                isFirstAttr = false;
            } else {
                this.append(',');
                this.newline();
            }
            if (name) {
                this.append(`'${name}': `);
            }
        }

        for (let i = 0; i < attributes.length; i++) {
            const attr = attributes[i];
            if (attr.type === Types.JSXExpression) {
                addAttribute();
                this.visitJSXAttributeValue(attr);
                continue;
            } 

            const name = getAttrName(attr.name);
            const value = attr.value as ASTAttributeTemplateNoneValue;
            switch (name) {
                case 'className':
                    if (!isCommonElement) {
                        addAttribute(name);
                        this.visitJSXAttributeClassName(value);
                    }
                    className = value;
                    continue;
                case 'key':
                    if (!isCommonElement) {
                        addAttribute(name);
                        this.visitJSXAttributeValue(value);
                    }
                    key = value;
                    continue;
                case 'ref':
                    if (!isCommonElement) {
                        addAttribute(name);
                        this.visitJSXAttributeRef(value, true);
                    }
                    ref = value;
                    continue;
                case '$blocks':
                    addAttribute(name);
                    this.visitJSXBlocks(value as any as ASTBlock[], false);
                    continue;
                case 'type':
                    // save the type for v-model of input element
                    addAttribute(name);
                    this.visitJSXAttributeValue(value);
                    modelMeta.type = value as ASTString;
                    continue;
                case 'value':
                    addAttribute(name);
                    this.visitJSXAttributeValue(value);
                    modelMeta.value = value;
                    break;
                case 'v-model-true':
                    addAttribute('trueValue');
                    this.visitJSXAttributeValue(value);
                    modelMeta.trueValue = value;
                    break;
                case 'v-model-false':
                    addAttribute('falseValue');
                    this.visitJSXAttributeValue(value);
                    modelMeta.falseValue = value;
                    break;
                default:
                    if (name === 'v-model') {
                        models.push({name: 'value', value});
                        continue;
                    } else if (name.substr(0, 8) === 'v-model:') {
                        models.push({name: name.substr(8), value});
                        continue;
                    } else {
                        addAttribute(name);
                        this.visitJSXAttributeValue(value);
                    }
                    break;
            } 
        }

        for (let i = 0; i < models.length; i++) {
            this.visitJSXAttributeModel(node, models[i], modelMeta, addAttribute);
        }

        if (!isFirstAttr) {
            this.dedent();
            this.append('}');
        } else {
            this.append('null');
        }

        this.indentLevel = indentLevel;
        this.popQueue();

        if (isFirstAttr || hasDynamicProp) {
            this.flush(propsQueue);
        } else {
            this.append(this.addHoistDeclare(propsQueue));
        }

        return {className, key, ref, hasProps: !isFirstAttr};
    }

    private hasDynamicProp(attributes: ASTBaseElement['attributes'], isCommonElement: boolean) {
        for (let i = 0; i < attributes.length; i++) {
            const attr = attributes[i];
            if (attr.type === Types.JSXExpression) {
                return true;
            }
            const name = attr.name;
            switch (name) {
                case 'class':
                case 'className':
                case 'key':
                    if (isCommonElement) continue;
                    break;
                case 'ref':
                    if (!isCommonElement) return true;
                    break;
                case '$blocks':
                case 'children':
                    return true;
                default:
                    if (name === 'v-model' || name.substr(0, 8) === 'v-model:') {
                        return true;
                    }
                    const value = attr.value as ASTAttributeTemplateValue;
                    if (value.type === Types.JSXExpression) {
                        // if value is number / true / false, treat it as static value
                        let tmp: any = value.value;
                        const length = tmp.length;
                        if (!length) return false; // is an empty expresion, it will be generated to null
                        if (
                            length === 1 &&
                            (tmp = tmp[0], tmp.type === Types.JS) &&
                            (tmp = tmp.value, tmp.length === 1)
                        ) {
                            const jsValue = tmp[0];
                            switch (jsValue) {
                                case 'true':
                                case 'false':
                                case 'null':
                                case 'undefined':
                                    continue;
                                default:
                                    if (numberRegExp.test(jsValue)) continue;
                                    break;
                            }
                        }
                        return true;
                    }
                    if (value.type === Types.JSXStrings) {
                        const values = value.value;
                        for (let i = 0; i < values.length; i++) {
                            if (values[i].type === Types.JSXExpression) {
                                return true;
                            }
                        }
                    }
                    break;
            }
        }
        return false;
    }

    private visitJSXAttributeClassName(value: ASTAttributeTemplateNoneValue) {
        if (value.type === Types.JSXExpression) {
            this.addHelper('_$cn');
            this.append('_$cn(');
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
            this.visitNode(value, false, false);
        }
    }

    private visitJSXAttributeRef(value: ASTAttributeTemplateNoneValue, isComponent: boolean) {
        if (value.type === Types.JSXString) {
            this.addDeclare('_$refs', 'this.refs');
            // if it is a component, the ref will use twice, so we extract it as variable
            let indentLevel: number;
            let refQueue: string[];
            if (isComponent) {
                refQueue = this.pushQueue();
                indentLevel = this.indentLevel;
                this.indentLevel = 0;
            }
            this.append(`function(i) {_$refs[`);
            this.visitJSXAttributeValue(value);
            this.append(`] = i}`);
            if (isComponent) {
                this.indentLevel = indentLevel!;
                this.popQueue();
                this.append(this.addDeclare(`_$ref_${value.value}`, refQueue!));
            }
        } else {
            this.visit(value.value, false);
        }
    }

    private visitJSXAttributeModel(
        node: ASTElement,
        {name, value}: Model,
        modelMeta: ModelMeta,
        addAttribute: (name?: string) => void
    ) {
        let shouldSetValue = true;
        const handleRadioOrCheckbox = (
            head: string,
            middle: string,
            tail: ASTAttributeTemplateNoneValue | undefined,
            defaultValue: string
        ) => {
            shouldSetValue = false;

            addAttribute('checked');
            this.append(head);
            this.visitJSXAttributeValue(value);
            this.append(middle);
            if (tail) {
                this.visitJSXAttributeValue(tail);
            } else {
                this.append(defaultValue);
            }
        };

        if (node.type === Types.JSXCommonElement) {
            let setModelFnName: Helpers = '_$stm';
            let eventName = 'change';

            addAttribute(`$model:${name}`);
            this.visitJSXAttributeValue(value);

            switch (node.value) {
                case 'input':
                    const type = modelMeta.type;
                    if (type) {
                        switch (type.value) {
                            case 'radio':
                                handleRadioOrCheckbox('$this.get(', ') === ', modelMeta.value, "'on'");
                                setModelFnName = '_$srm';
                                break;
                            case 'checkbox':
                                this.addHelper('_$isc');
                                handleRadioOrCheckbox('_$isc($this.get(', '), ', modelMeta.trueValue, 'true');
                                this.append(')');

                                setModelFnName = '_$scm';
                                break;
                            // case 'number':
                                // TODO: shoud cast to number
                            default:
                                eventName = 'input';
                                break;
                        }
                    } else {
                        eventName = 'input';
                    }
                    break;
                case 'select':
                    setModelFnName = '_$ssm';
                    break;
                default:
                    eventName = 'input';
                    break;
            }

            addAttribute(`ev-$model:${eventName}`);
            this.addHelper('_$le');
            this.addHelper(setModelFnName);
            this.append(`_$le($this, ${setModelFnName})`);
        } else {
            // is a component
            addAttribute(`ev-$model:${name}`);
            this.append(`function($v) {`);
            this.indent();
            this.append(`$this.set(`);
            this.visitJSXAttributeValue(value);
            this.append(', $v);');
            this.dedent();
            this.append('}');
        }

        if (shouldSetValue) {
            addAttribute(name);
            this.append('$this.get('),
            this.visitJSXAttributeValue(value);
            this.append(')');
        }
    }

    private visitJSXBlocks(blocks: ASTBlock[], isRoot: boolean) {
        this.addHelper('_$ex');
        this.addHelper('_$em');
        this.append('function($blocks) {');
        this.indent();
        this.append(`var _$blocks = {}, __$blocks = _$ex({}, $blocks);`);
        this.newline();
        this.append('return (');

        this.indent();
        for (let i = 0; i < blocks.length; i++) {
            this.visitJSXBlock(blocks[i], false);
            this.append(',');
            this.newline();
        }
        this.append('__$blocks');
        this.dedent();
        this.append(');');

        this.dedent();
        this.append(`}.call($this, ${isRoot ? '$blocks' : '_$em'})`);
    }

    private getJSXBlocksAndSetChildren(node: ASTComponent | ASTVdt) {
        const blocks: ASTBlock[] = [];
        const children: ASTElementChild[] = [];
        const nodeChildren = node.children;

        for (let i = 0; i < nodeChildren.length; i++) {
            const child = nodeChildren[i];
            if (child.type === Types.JSXBlock) {
                blocks.push(child);
            } else {
                children.push(child);
            }

        }

        if (children.length) {
            node.attributes.push({
                type: Types.JSXAttribute,
                name: 'children',
                value: children,
                loc: fakeLoc,
            });
        }

        return blocks;
    }

    private getJSXBlocksAttribute(node: ASTBlock) {
        const ret: {args: ASTString | null, params: ASTExpression | null} = {args: null, params: null};
        const attributes = node.attributes as ASTAttribute[];

        for (let i = 0; i < attributes.length; i++) {
            const attr = attributes[i];
            switch (attr.name) {
                case 'args':
                    ret.args = attr.value as ASTString;
                    break;
                case 'params':
                    ret.params = attr.value as ASTExpression;
                    break;
                /* istanbul ignore next */
                default:
                    break;
            }

        }

        return ret;
    }

    private visitProps(
        hasProps: boolean,
        key: ASTAttributeTemplateNoneValue | null,
        ref: ASTAttributeTemplateNoneValue | null,
        isComponent: boolean,
    ): ChildrenFlags {
        let childrenFlag: ChildrenFlags = ChildrenFlags.HasNonKeyedVNodeChildren;

        if (hasProps) {
            this.flush(this.popQueue());
            this.pushQueue();
        }

        this.append(', ');
        if (key) {
            this.flush(this.popQueue());
            this.visitJSXAttributeValue(key);
            this.pushQueue();

            childrenFlag = ChildrenFlags.HasKeyedVNodeChildren;
        } else {
            this.append('null');
        }

        this.append(', ');
        if (ref) {
            this.flush(this.popQueue());
            this.visitJSXAttributeRef(ref, isComponent);
            this.pushQueue();
        } else {
            this.append('null');
        }

        this.popQueue();
        this.append(')');

        return childrenFlag;
    }

    private append(code: string) {
        this.current.push(code);

        // if (true [> sourceMap <]) {
            // TODO 
        // }
    }

    private addHelper(helper: Helpers) {
        this.helpers[helper] = true;
    }

    private addHoistDeclare(code: string[]) {
        const key = `_$tmp${this.tmpIndex++}`;
        this.hoistDeclares.push([key, code]);
        return key;
    }

    private addDeclare(key: string, code: string[] | string) {
        this.declares[key] = code;
        return key;
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
