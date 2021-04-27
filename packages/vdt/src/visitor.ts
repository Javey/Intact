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
    ASTUnescapeText,
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
    trueValue?: ASTAttributeTemplateValue
    falseValue?: ASTAttributeTemplateValue
    value?: ASTAttributeTemplateValue
}
type Model = {
    name: string
    value: ASTAttributeTemplateValue
}
type DirectiveCallback = (hasFor: boolean) => ChildrenFlags
type Helpers = keyof typeof helpersMap

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
    private helpers: {[key in Helpers]?: true} = {};
    private declares: Record<string, string[]> = {};

    constructor(nodes: ASTRootChild[]) {
        this.append(`function($props, $blocks) {`);
        this.indent();
        this.append(`$blocks || ($blocks = {});`);
        this.newline();
        this.append(`$props || ($props = {});`);
        this.newline();
        this.append('var $this = this;');
        this.append('\n');
        this.newline();

        this.visit(nodes, true);

        this.append(';');
        this.dedent();
        this.append('};');
    }

    getCode() {
        let helpers: string[] = [];
        for (let key in this.helpers) {
            helpers.push(`var ${key} = Vdt.${helpersMap[key as Helpers]};`);
        }
        return [
            `var Vdt = _Vdt;\n`,
            this.hoist.join(''),
            helpers.join('\n'),
            '\n\n',
            `return `,
            this.queue.join(''),
        ].join('');
        // return this.getModuleCode();
    }

    getModuleCode() {
        return [
            `import Vdt from 'Vdt';\n`,
            this.hoist.join(''),
            '\n',
            'export default ',
            this.queue.join(''),
        ].join('');
    }

    private visit(nodes: ASTRootChild[], isRoot: true): void;
    private visit(nodes: ASTElementChild[] | ASTExpressionChild[], isRoot: false): void;
    private visit(nodes: ASTChild[], isRoot: boolean) {
        const length = nodes.length;
        const lastIndex = length - 1;

        this.expressionSpacesStack.push(this.spaces);
        const oldLength = this.spacesStatck.length;
        nodes.forEach((node, i) => {
            // if is root, add `return` keyword
            if (isRoot && i === lastIndex) {
                this.append('return ');
            }

            this.visitNode(node, isRoot, true);
        });
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
                default:
                    return ChildrenFlags.UnknownChildren;
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
        if (hasProps) {
            this.flush(this.popQueue());
            this.pushQueue();
        }

        return this.visitKeyAndRef(key, ref);
    }

    private visitJSXComponent(node: ASTComponent) {
        const blocks = this.getJSXBlocksAndSetChildren(node);
        if (blocks.length) {
            node.attributes.push({
                type: Types.JSXAttribute,
                name: 'blocks',
                value: blocks,
                loc: fakeLoc,
            });
        }

        this.addHelper('_$cc');
        this.append(`_$cc(${node.value}`);

        this.pushQueue();
        this.append(', ');
        const {className, key, ref, hasProps} = this.visitJSXAttribute(node);

        if (hasProps) {
            this.flush(this.popQueue());
            this.pushQueue();
        }

        return this.visitKeyAndRef(key, ref);
    }

    private visitJSXExpression(node: ASTExpression): ChildrenFlags {
        this.visit(node.value, false);
        return ChildrenFlags.UnknownChildren;
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

    private visitJSXUnescapeText(node: ASTUnescapeText): ChildrenFlags {
        this.addHelper('_$cu');
        this.append('_$cu(');
        this.visit(node.value, false);
        this.append(')');

        return ChildrenFlags.HasNonKeyedVNodeChildren;
    }

    private visitJSXBlock(node: ASTBlock, shouldCall: boolean): ChildrenFlags {
        const {params, args} = this.getJSXBlocksAttribute(node);
        const name = node.value

        // TODO: define tmp variables
        this.append(`(_$blocks['${name}'] = function(parent`);
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
        this.append(`(__$blocks['${name}'] = function() {`);
        this.indent();
        this.append(`var args = arguments;`);
        this.newline();
        this.append(`var block = $blocks['${name}'];`);
        this.newline();
        this.append(`var callBlock = function() {`);
        this.indent();
        this.addHelper('_$no');
        this.append(`return _$blocks['${name}'].appy($this, [_$no].concat(args));`);
        this.dedent();
        this.append('};');
        this.newline();
        this.append(`return block ?`);
        this.indent();
        this.append(`block.apply($this, [callBlock].concat(args)) :`);
        this.newline();
        this.append(`callBlock();`);
        this.indentLevel--;
        this.dedent();
        this.append('})');

        // if it is in ancestor, we should call this block
        if (shouldCall) {
            this.append(',');
            this.newline();
            if (params) {
                this.append(`__$blocks['${name}'].apply($this, `);
                this.visitJSXAttributeValue(params);
                this.append(')');
            } else {
                this.append(`__$blocks['${name}']()`);
            }
        }

        return ChildrenFlags.UnknownChildren;
    }

    private visitJSXVdt(node: ASTVdt, isRoot: boolean): ChildrenFlags {
        const name = node.value;
        const blocks = this.getJSXBlocksAndSetChildren(node);
        
        this.append(`(function() {`);
        this.indent();
        this.append(`var props = `);
        this.visitJSXAttribute(node);
        this.append(';');
        this.newline();
        this.append(`return ${name}.call($this, props, `);
        if (blocks.length) {
            this.visitJSXBlocks(blocks, isRoot);
        } else {
            this.append(isRoot ? '$blocks' : 'null');
        }
        this.append(');');
        this.dedent();
        this.append(`}).call($this)`);

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
            this.append('value');
        }
        this.append(', ');
        if (directive.key) {
            this.visitString(directive.key, true);
        } else {
            this.append('key');
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
            } 

            if (nextDirectives[Directives.Else]) {
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

        let childrenFlag: ChildrenFlags;

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
            nodes.forEach((child, index) => {
                const type = child.type;
                const flag = this.visitNode(child, false, true);
                childrenFlag = computeChildrenFlagForChildren(childrenFlag, flag!);
                if (index !== lastIndex) {
                    this.append(',');
                    this.newline();
                }
            });

            this.dedent();
            this.append(']');

            if (childrenFlag! === ChildrenFlags.HasKeyedVNodeChildren) {
                childrenFlag = ChildrenFlags.HasKeyedChildren;
            } else if (childrenFlag! === ChildrenFlags.HasNonKeyedVNodeChildren) {
                childrenFlag = ChildrenFlags.HasNonKeyedChildren;
            }
        }

        return childrenFlag!;
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
        const modelMeta: ModelMeta = {};
        const models: Model[] = [];

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
                        this.visitJSXAttributeValue(attr.value);
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
                    modelMeta.type = attr.value as ASTString;
                    break;
                case 'blocks':
                    addAttribute(name);
                    this.visitJSXBlocks(attr.value as ASTBlock[], false);
                    break;
                case 'type':
                    // save the type for v-model of input element
                    addAttribute(name);
                    this.visitJSXAttributeValue(attr.value);
                    modelMeta.type = attr.value as ASTString;
                    break;
                case 'value':
                    addAttribute(name);
                    this.visitJSXAttributeValue(attr.value);
                    modelMeta.value = attr.value as ASTAttributeTemplateValue;
                    break;
                case 'v-model-true':
                    addAttribute('trueValue');
                    this.visitJSXAttributeValue(attr.value);
                    modelMeta.trueValue = attr.value as ASTAttributeTemplateValue;
                    break;
                case 'v-model-false':
                    addAttribute('falseValue');
                    this.visitJSXAttributeValue(attr.value);
                    modelMeta.falseValue = attr.value as ASTAttributeTemplateValue;
                    break;
                default:
                    if (name === 'v-model') {
                        models.push({name: 'value', value: attr.value as ASTAttributeTemplateValue});
                    } else if (name.substr(0, 8) === 'v-model:') {
                        models.push({name: name.substr(8), value: attr.value as ASTAttributeTemplateValue});
                    } else {
                        addAttribute(name);
                        this.visitJSXAttributeValue(attr.value);
                    }
                    break;
            } 
        });

        for (let i = 0; i < models.length; i++) {
            this.visitJSXAttributeModel(node, models[i], modelMeta, addAttribute);
        }

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

    private visitJSXAttributeRef(value: ASTAttributeTemplateValue) {
        if (value.type === Types.JSXString) {
            // TODO: $refs and extract ref
            this.append(`function(i) {_$refs[`);
            this.visitJSXAttributeValue(value);
            this.append(`] = i}`);
        } else {
            this.visit(value.value, false);
        }
    }

    private visitJSXAttributeModel(node: ASTElement, {name, value}: Model, modelMeta: ModelMeta, addAttribute: (name?: string) => void) {
        let setModelFnName: Helpers = '_$sm';
        let shouldSetValue = true;
        const handleRadioOrCheckbox = (head: string, middle: string, tail?: ASTAttributeTemplateValue) => {
            shouldSetValue = false;

            addAttribute('checked');
            this.append(head);
            this.visitJSXAttributeValue(value);
            this.append(middle);
            if (tail) {
                this.visitJSXAttributeValue(tail);
            } else {
                this.append('true');
            }
        };

        if (node.type === Types.JSXCommonElement) {
            let eventName = 'change';

            addAttribute(`$model:${name}`);
            this.visitJSXAttributeValue(value);

            switch (node.value) {
                case 'input':
                    const type = modelMeta.type;
                    if (type) {
                        switch (type.value) {
                            case 'radio':
                                handleRadioOrCheckbox('$this.get(', ') === ', modelMeta.value);
                                setModelFnName = '_$srm';
                                break;
                            case 'checkbox':
                                this.addHelper('_$ic');
                                handleRadioOrCheckbox('_$ic($this.get(', '), ', modelMeta.trueValue);
                                this.append(')');

                                setModelFnName = '_$scm';
                                break;
                            default:
                                eventName = 'input';
                                break;
                        }
                    }
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
        this.append('function($blocks) {');
        this.indent();
        this.append(`var _$blocks = {}, __$blocks = $ex({}, $blocks);`);
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
        this.append(`}.call($this, ${isRoot ? '$blocks' : '{}'})`);
    }

    private getJSXBlocksAndSetChildren(node: ASTComponent | ASTVdt) {
        const blocks: ASTBlock[] = [];
        const children: ASTElementChild[] = [];

        node.children.forEach(child => {
            if (child.type === Types.JSXBlock) {
                blocks.push(child);
            } else {
                children.push(child);
            }
        });

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

        (node.attributes as ASTAttribute[]).forEach(attr => {
            switch (attr.name) {
                case 'args':
                    ret.args = attr.value as ASTString;
                    break;
                case 'params':
                    ret.params = attr.value as ASTExpression;
                    break;
                default:
                    break;
            }
        });

        return ret;
    }

    private visitKeyAndRef(key: ASTAttributeTemplateValue | null, ref: ASTAttributeTemplateValue | null): ChildrenFlags {
        let childrenFlag: ChildrenFlags = ChildrenFlags.HasNonKeyedVNodeChildren;

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
            this.visitJSXAttributeRef(ref);
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
