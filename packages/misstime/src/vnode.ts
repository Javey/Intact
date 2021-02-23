import {
    VNodeElement,
    VNodeComponent,
    VNodeTextElement,
    VNode as IVNode, Component, Props, Ref, Key, Children, Types, NormalizedChildren,
    ChildrenTypes,
} from './types';
import {
    isNullOrUndefined,
    isArray,
    throwError,
    isInvalid,
    isStringOrNumber,
    isString,
} from './utils';
import {throwIfObjectIsNotVNode, validateVNodeElementChildren} from './validate';

export class VNode<P> implements IVNode<P> {
    public dom: Element | Text | null = null;
    constructor(
        public type: Types,
        public tag: string | Component | null,
        public childrenType: ChildrenTypes,
        public children?: NormalizedChildren,
        public className?: string | null,
        public props?: Props<P, Component>  | Props<P, Element> | null,
        public key?: Key | null,
        public ref?: Ref<Component> | Ref<Element> | null
    ) {}
}

export function createVNode<P extends Record<string, any>>(
    tag: string | Component,
    props?: Props<P, Component | Element> | null,
    children?: Children | null,
): VNode<P> {
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
                default:
                    type = Types.CommonElement;
                    break;
            }
            break;
        case 'function':
            type = Types.Component;
            break;
        default:
            throwError(`createVNode expects to get a string or function, but get a type: "${JSON.stringify(tag)}"`);
    }

    let key: Key | null = null;
    let ref: Ref<Component | Element> | null = null;
    let newProps: Props<any, Component | Element> | null = null;
    let className: string | null = null;

    if (!isNullOrUndefined(props)) {
        for (const prop in props) {
            if (isElement && prop === 'className') {
                className = props.className!;
            } else if (prop === 'key') {
                key = props.key!;
            } else if (prop === 'ref') {
                ref = props.ref!;
            } else if (prop === 'children') {
                children = props.children;
            } else {
                if (isNullOrUndefined(newProps)) newProps = {};
                newProps[prop] = props[prop];
            }
        }
    }

    if (isElement) {
        return createElementVNode(
            type!,
            tag as string,
            children,
            ChildrenTypes.UnknownChildren,
            className,
            newProps,
            key,
            ref as Ref<Element>
        );
    }

    if (children || key || ref) {
        if (isNullOrUndefined(newProps)) newProps = {};
        if (children) newProps.children = children;
        if (key) newProps.key = key;
        if (ref) newProps.ref = ref;
    }
    return createComponentVNode(tag as Component, newProps, key, ref as Ref<Component>);
}

export function createElementVNode<P>(
    type: Types,
    tag: string,
    children?: Children | null,
    childrenType?: ChildrenTypes | null,
    className?: string | null,
    props?: Props<P, Element> | null,
    key?: Key | null,
    ref?: Ref<Element> | null,
): VNodeElement<P> {
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
    ) as VNodeElement<P>;

    if (childrenType === ChildrenTypes.UnknownChildren) {
        normalizeChildren(vNode, children);
    }

    if (process.env.NODE_ENV !== 'production') {
        validateVNodeElementChildren(vNode);
    }

    return vNode;
}

export function createTextVNode(text: string | number, key?: Key | null): VNodeTextElement<null> {
    return new VNode(Types.Text, null, ChildrenTypes.HasInvalidChildren, text, null, null, key) as VNodeTextElement<null>;
}

export function createComponentVNode<P>(
    tag: Component,
    props?: Props<P, Component> | null,
    key?: Key | null,
    ref?: Ref<Component> | null,
): VNodeComponent<P> {
    // if (process.env.NODE_ENV !== 'production') {
        // if (type & Types.Element) {
            // throwError('Creating element vNodes using createCommentVNode is not allowed. Use createElementVNode method.');
        // }
    // }
   
    let type: Types;
    if (tag.prototype && tag.prototype.$init) {
        type = Types.ComponentClass;
    } else {
        type = Types.ComponentFunction;
    }

    return new VNode(
        type,
        tag,
        ChildrenTypes.HasInvalidChildren,
        null,
        null,
        props,
        key,
        ref
    ) as VNodeComponent<P>;
}

export function directClone(vNode: VNode<any>): VNode<any> {
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

    return new VNode(
        type,
        vNode.tag,
        vNode.childrenType,
        vNode.children,
        vNode.className,
        props,
        vNode.key,
        vNode.ref
    );
}

function normalizeChildren(vNode: VNode<any>, children: Children) {
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

function applyKey(vNode: VNode<any>, reference: {index: number}) {
    vNode.key = '$' + reference.index;
    vNode.type |= Types.PrefixedKey;

    return vNode;
}

function _normalizeVNodes(vNodes: any[], result: VNode<any>[], index: number, reference: {index: number}) {
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
