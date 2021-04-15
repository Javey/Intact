import {
    VNodeElement,
    VNodeComponentClass,
    VNodeComponentFunction,
    VNodeTextElement,
    ComponentConstructor,
    ComponentFunction,
    VNode as IVNode, Component, Props, Ref, Key, Children, Types, NormalizedChildren,
    ChildrenTypes,
    ComponentClass,
    IntactDom,
    VNodeTag,
    VNodeProps,
    VNodeChildren,
    VNodeRef,
    TransitionHooks,
    TransitionPosition,
} from '../utils/types';
import {
    isNullOrUndefined,
    isArray,
    throwError,
    isInvalid,
    isStringOrNumber,
    isString,
    isUndefined,
} from 'intact-shared';
import {throwIfObjectIsNotVNode, validateVNodeElementChildren} from '../utils/validate';
import {Fragment} from '../utils/common';

export class VNode<T extends VNodeTag = VNodeTag> implements IVNode<T> {
    public dom: IntactDom | null = null;
    public type: Types;
    public tag: T;
    public childrenType: ChildrenTypes;
    public props?: VNodeProps<T> | null;
    public children?: VNodeChildren<T> | null;
    public className?: string | null;
    public key: Key | null;
    public ref: VNodeRef<T> | null;
    public isValidated?: boolean;
    public transition: TransitionHooks | null;
    public position: TransitionPosition | null;
    public newPosition: TransitionPosition | null;
    constructor(
        type: Types,
        tag: T,
        childrenType: ChildrenTypes,
        children?: VNodeChildren<T> | null,
        className?: string | null,
        props?: VNodeProps<T> | null, 
        key?: Key | null,
        ref?: VNodeRef<T> | null
    ) {
        if (process.env.NODE_ENV !== 'production') {
            this.isValidated = false;
        }
        this.type = type;
        this.tag = tag;
        this.childrenType = childrenType;
        this.children = children;
        this.className = className;
        this.props = props;
        this.key = key === undefined ? null : key;
        this.ref = ref === undefined ? null : ref;

        // for Transition
        this.transition = null;
        // FIXME: Is it necessary to initialize these properties to prevent V8 from de-optimization
        this.position = null;
        this.newPosition = null;
    }
}

export function createVNode<T extends VNodeTag>(
    tag: T,
    props?: VNodeProps<T> | null,
    children?: Children | null,
): VNode<T> {
    let type: Types;
    let isElement: boolean = false;
    switch (typeof tag) {
        case 'string':
            isElement = true;
            switch (tag) {
                case 'input':
                    type = Types.InputElement;
                    break;
                case 'select':
                    type = Types.SelectElement;
                    break;
                case 'textarea':
                    type = Types.TextareaElement;
                    break;
                case 'svg':
                    type = Types.SvgElement;
                    break;
                case Fragment:
                    type = Types.Fragment;
                    break;
                default:
                    type = Types.CommonElement;
                    break;
            }
            break;
        case 'function':
            if (tag.prototype && (tag.prototype as ComponentClass).$render) {
                type = Types.ComponentClass;
            } else {
                type = Types.ComponentFunction;
            }
            break;
        default:
            throwError(`createVNode expects to get a string or function, but get a type: "${JSON.stringify(tag)}"`);
    }

    let key: Key | null = null;
    let ref: VNodeRef<T> | null = null;
    let newProps: VNodeProps<T> | null = null;
    let className: string | null = null;

    if (!isNullOrUndefined(props)) {
        for (const prop in props) {
            if (isElement && prop === 'className') {
                className = props.className;
            } else if (prop === 'key') {
                key = props.key;
            } else if (prop === 'ref') {
                ref = props.ref;
            } else if (prop === 'children') {
                children = props.children;
            } else {
                if (isNullOrUndefined(newProps)) newProps = {} as any;
                newProps![prop] = props[prop];
            }
        }
    }

    if (isElement) {
        if (type! & Types.Fragment) {
            return createFragment(children, ChildrenTypes.UnknownChildren, key) as VNode<T>;
        }
        return createElementVNode(
            type!,
            tag as string,
            children,
            ChildrenTypes.UnknownChildren,
            className,
            newProps,
            key,
            ref as Ref<Element>
        ) as VNode<T>;
    }

    if (children || key || ref) {
        if (isNullOrUndefined(newProps)) newProps = {} as any;
        if (children) newProps!.children = children;
        if (key) newProps!.key = key;
        if (ref) newProps!.ref = ref;
    }

    return createComponentVNode(type!, tag as Component, newProps, key, ref as Ref<Element>) as VNode<T>;
}

export function createElementVNode(
    type: Types,
    tag: string,
    children?: Children | null,
    childrenType?: ChildrenTypes | null,
    className?: string | null,
    props?: Props<any, Element> | null,
    key?: Key | null,
    ref?: Ref<Element> | null,
): VNodeElement {
    if (process.env.NODE_ENV !== 'production') {
        if (type & Types.Component) {
            throwError('Creating Component vNodes using createVNode is not allowed. Use createComponentVNode method.');
        }
    }
    if (isNullOrUndefined(childrenType)) {
        childrenType = ChildrenTypes.HasInvalidChildren;
    }
    const vNode = new VNode(
        type,
        tag,
        childrenType, 
        children as NormalizedChildren,
        className,
        props,
        key,
        ref
    )

    if (childrenType === ChildrenTypes.UnknownChildren) {
        normalizeChildren(vNode, children);
    }

    if (process.env.NODE_ENV !== 'production') {
        validateVNodeElementChildren(vNode);
    }

    return vNode;
}

export function createTextVNode(text: string | number, key?: Key | null): VNodeTextElement {
    return new VNode(Types.Text, null, ChildrenTypes.HasInvalidChildren, text, null, null, key) as VNodeTextElement;
}

export function createVoidVNode() {
    return createTextVNode('', null);
}

export function createCommentVNode(comment: string, key?: Key | null): VNodeTextElement {
    return new VNode(Types.HtmlComment, null, ChildrenTypes.HasInvalidChildren, comment, null, null, key) as VNodeTextElement;
}

export function createComponentVNode<T extends ComponentFunction | ComponentConstructor>(
    type: Types,
    tag: T,
    props: VNodeProps<T> | null,
    key?: Key | null,
    ref?: VNodeRef<T> | null
): VNode<T> { 
    if (process.env.NODE_ENV !== 'production') {
        if (type & Types.Element) {
            throwError('Creating element vNodes using createComponentVNode is not allowed. Use createElementVNode method.');
        }
    }
   
    return new VNode(
        type,
        tag,
        ChildrenTypes.HasInvalidChildren,
        null,
        null,
        props,
        key,
        ref as any
    );
}

export function createFragment(children: Children, childrenType: ChildrenTypes, key?: Key | null): VNodeElement {
    const fragment = createElementVNode(Types.Fragment, Types.Fragment as any, children, childrenType, null, null, key, null);

    switch (fragment.childrenType) {
        case ChildrenTypes.HasInvalidChildren:
            fragment.children = createVoidVNode();
            fragment.childrenType = ChildrenTypes.HasVNodeChildren;
            break;
        case ChildrenTypes.HasTextChildren:
            fragment.children = [createTextVNode(children as string)];
            fragment.childrenType = ChildrenTypes.HasNonKeyedChildren;
            break;
        default:
            break;
    }

    return fragment;
}

export function directClone(vNode: VNode): VNode {
    const type = vNode.type & Types.ClearInUse;
    let props = vNode.props;

    if (type & Types.Component) {
        if (!isNullOrUndefined(props)) {
            const propsToClone = props;
            props = {};
            for (const key in propsToClone) {
                props[key] = propsToClone[key];
            }
        }
    }

    let newVNode: VNode;
    if ((type & Types.Fragment) === 0) {
        newVNode = new VNode(
            type,
            vNode.tag,
            vNode.childrenType,
            vNode.children,
            vNode.className,
            props,
            vNode.key,
            vNode.ref
        );
    } else {
        const childrenType = vNode.childrenType;
        newVNode = new VNode(
            type,
            vNode.tag,
            childrenType,
            childrenType === ChildrenTypes.HasVNodeChildren ?
                directClone(vNode.children as VNode) :
                (vNode.children as VNode[]).map(directClone),
            null,
            null,
            vNode.key,
            null
        );
    }

    newVNode.transition = vNode.transition;
    
    return newVNode;
}

export function normalizeChildren(vNode: VNode, children: Children) {
    let newChildren: any;
    let newChildrenType: ChildrenTypes = ChildrenTypes.HasInvalidChildren;

    if (isInvalid(children)) {
        newChildren = children; 
    } else if (isStringOrNumber(children)) {
        newChildrenType = ChildrenTypes.HasTextChildren; 
        newChildren = children;
    } else if (isArray(children)) {
        const len = children.length;
        const reference = {index: 0};
        for (let i = 0; i < len; i++) {
            let n = children[i];

            if (isInvalid(n) || isArray(n)) {
                newChildren = newChildren || children.slice(0, i);
                _normalizeVNodes(children, newChildren, i, reference);
                break;
            } else if (isStringOrNumber(n)) {
                newChildren = newChildren || children.slice(0, i);
                newChildren.push(applyKey(createTextVNode(n), reference));
            } else {
                if (process.env.NODE_ENV !== 'production') {
                    throwIfObjectIsNotVNode(n);
                }
                const key = n.key;
                const type = n.type;
                const needsCloning = (type & Types.InUseOrNormalized) > 0;
                const isNullOrUndefinedKey = isNullOrUndefined(key);
                const isPrefixed = (type & Types.PrefixedKey) > 0;

                if (needsCloning || isNullOrUndefinedKey || isPrefixed) {
                    newChildren = newChildren || children.slice(0, i);
                    if (needsCloning || isPrefixed) {
                        n = directClone(n);
                    }
                    if (isNullOrUndefinedKey || isPrefixed) {
                        applyKey(n, reference);
                    }
                    newChildren.push(n);
                } else if (newChildren) {
                    newChildren.push(n);
                }

                n.type |= Types.Normalized;
            }

            reference.index++;
        }

        newChildren = newChildren || children;
        if (newChildren.length === 0) {
            newChildrenType = ChildrenTypes.HasInvalidChildren;
        } else {
            newChildrenType = ChildrenTypes.HasKeyedChildren;
        }
    } else {
        if (process.env.NODE_ENV !== 'production') {
            throwIfObjectIsNotVNode(children);
        }
        newChildren = children;
        if (children.type & Types.InUseOrNormalized) {
            newChildren = directClone(children);
        }

        newChildren.type |= Types.Normalized;
        newChildrenType = ChildrenTypes.HasVNodeChildren;
    }

    vNode.children = newChildren;
    vNode.childrenType = newChildrenType;

    return vNode;
}

function applyKey(vNode: VNode, reference: {index: number}) {
    vNode.key = '$' + reference.index;
    vNode.type |= Types.PrefixedKey;

    return vNode;
}

function _normalizeVNodes(vNodes: any[], result: VNode[], index: number, reference: {index: number}) {
    for (const len = vNodes.length; index < len; index++) {
        let n = vNodes[index];

        if (!isInvalid(n)) {
            if (isArray(n)) {
                _normalizeVNodes(n, result, 0, reference);
                continue;
            } else {
                if (isStringOrNumber(n)) {
                    n = applyKey(createTextVNode(n), reference);
                } else {
                    if (process.env.NODE_ENV !== 'production') {
                        throwIfObjectIsNotVNode(n);
                    }
                    const type = n.type;
                    const isPrefixed = (type & Types.PrefixedKey) > 0;

                    if (type & Types.InUseOrNormalized || isPrefixed) {
                        n = directClone(n);
                    }

                    n.type |= n.Normalized;

                    if (isNullOrUndefined(n.key) || isPrefixed) {
                        applyKey(n, reference);
                    }
                }

                result.push(n);
            }
        }

        reference.index++;
    }
}

export function normalizeRoot(vNode: Children, parentVNode: VNode): VNode {
    let root: VNode;
    if (isInvalid(vNode)) {
        root = createVoidVNode();
    } else if (isStringOrNumber(vNode)) {
        root = createTextVNode(vNode, null);
    } else if (isArray(vNode)) {
        root = createFragment(vNode, ChildrenTypes.UnknownChildren, null);
    } else {
        root = (vNode as VNode).type & Types.InUse ? directClone(vNode) : vNode;
    }

    const transition = parentVNode.transition;
    if (!isNullOrUndefined(transition)) {
        if (process.env.NODE_ENV !== 'production') {
            const type = root.type;
            if (!(type & Types.Component || type & Types.Element)) {
                throwError(`Component inside <Transtion> must render a single elememt node.`);
            }
        }
        root.transition = transition;
    }

    return root;
}

