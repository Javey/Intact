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
} from './types';
import {getTypeForVNodeElement, ChildrenTypes, Types as VNodeTypes} from 'misstime';
import {isElementNode, getAttrName} from './helpers';
import {isArray} from 'intact-shared';

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
        // return this.hoist.join('') + this.queue.join('');
        return this.getModuleCode();
    }

    getModuleCode() {
        return [
            `import {xxx} from 'Vdt';\n`,
            this.hoist.join(''),
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

            this.visitNode(node, isRoot);
        });
        let newLength = this.spacesStatck.length;
        this.expressionSpacesStack.pop();
        while (newLength > oldLength) {
            this.popSpaces();
            newLength--;
        }
    }

    private visitNode(node: ASTNode, isRoot: boolean) {
        const type = node.type;
        switch (type) {
            case Types.JSXCommonElement:
            case Types.JSXComponent:
            case Types.JSXBlock:
            case Types.JSXVdt:
                return this.visitJSXElement(node as ASTElement, isRoot);
            case Types.JSXText:
            case Types.JSXString:
                return this.visitString(node as ASTString | ASTText, false);
            case Types.JS:
                return this.visitJS(node as ASTJS);
            case Types.JSXExpression:
                return this.visitJSXExpression(node as ASTExpression);
            case Types.JSHoist:
                return this.visitJSHoist(node as ASTHoist);
            case Types.JSXComment:
                return this.visitJSXComment(node as ASTComment);
            case Types.JSXUnescapeText:
                return this.visitJSXUnescapeText(node as ASTUnescapeText);
        }
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

    private visitJSHoist(node: ASTHoist) {
        this.hoist.push(node.value);
    }

    private visitJSXElement(node: ASTElement, isRoot: boolean) {
        this.visitJSXDirective(node, () => {
            switch (node.type) {
                case Types.JSXCommonElement:
                    if (node.value === 'template') {
                        // <template> is a fake tag, we only need handle its children and directives
                        this.visitJSXChildren(node.children);
                    } else {
                        this.visitJSXCommonElement(node);
                    }
                    break;
                case Types.JSXComponent:
                    this.visitJSXComponent(node);
                    break;
                case Types.JSXBlock:
                    this.visitJSXBlock(node, true);
                    break;
                case Types.JSXVdt:
                    this.visitJSXVdt(node, isRoot);
                    break;
            }
        });
    }

    private visitJSXCommonElement(node: ASTCommonElement) {
        // TODO: createElementVNode methods
        const tag = node.value;
        this.append(`$ce(${getTypeForVNodeElement(tag)}, '${tag}'`);

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

        // TODO: createComponentVNode
        this.append(`$cc(${node.value}`);

        this.pushQueue();
        this.append(', ');
        const {className, key, ref, hasProps} = this.visitJSXAttribute(node);

        if (hasProps) {
            this.flush(this.popQueue());
            this.pushQueue();
        }

        this.visitKeyAndRef(key, ref);
    }

    private visitJSXExpression(node: ASTExpression) {
        this.visit(node.value, false);
    }

    private visitJSXUnescapeText(node: ASTUnescapeText) {
        this.append('$cu(');
        this.visit(node.value, false);
        this.append(')');
    }

    private visitJSXBlock(node: ASTBlock, shouldCall: boolean) {
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
        this.append(`return _$blocks['${name}'].appy($this, [$noop].concat(args));`);
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
    }

    private visitJSXVdt(node: ASTVdt, isRoot: boolean) {
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
    }

    private visitJSXComment(node: ASTComment) {
        // TODO: createCommentVNode
        this.append('$ccv(');
        this.visitString(node, false);
        this.append(')');
    }

    private visitString(node: ASTText | ASTString | ASTComment, noQuotes: boolean) {
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
                this.visitNode(next, false);
                this.append(' :');
                this.newline();
                next = elseIfDir.next;
                continue;
            } 

            if (nextDirectives[Directives.Else]) {
                this.visitNode(next, false);
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
            this.visitNode(child, false);
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

                this.visitNode(child, false);
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
            this.visitNode(value, false);
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

    private visitJSXAttributeModel(node: ASTElement, {name, value}: Model, modelMeta: ModelMeta, addAttribute: (name?: string) => void) {
        let setModelFnName = '$setModel';
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
            addAttribute(`$model:${name}`);
            this.visitJSXAttributeValue(value);

            switch (node.value) {
                case 'input':
                    const type = modelMeta.type;
                    if (type) {
                        switch (type.value) {
                            case 'radio':
                                handleRadioOrCheckbox('$this.get(', ') === ', modelMeta.value);
                                setModelFnName = '$setRadioModel';
                                break;
                            case 'checkbox':
                                handleRadioOrCheckbox('$isChecked($this.get(', '), ', modelMeta.trueValue);
                                this.append(')');

                                setModelFnName = '$setCheckboxModel';
                                break;
                        }
                    }
                case 'select':
                    setModelFnName = '$setSelectModel';
                    break;
            }

            addAttribute(`ev-$model:${name}`);
            this.append(`$linkEvent($this, ${setModelFnName})`);
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
        // TODO: $extend
        this.append(`var _$blocks = {}, __$blocks = $extend({}, $blocks);`);
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
