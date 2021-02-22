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

// function VNode<P>(
    // type: Types,
    // tag: string,
    // props?: Props<P, Element>,
    // children?: NormalizedChildren,
    // className?: string | null,
    // key?: Key,
    // ref?: Ref<Element>
// ): VNodeElement<P>; 
// function VNode<P>(
    // type: Types,
    // tag: Component,
    // props?: Props<P, Component>,
    // children?: NormalizedChildren,
    // className?: string | null,
    // key?: Key,
    // ref?: Ref<Component>
// ): VNodeComponent<P>;
// function VNode<P>(
    // type: Types,
    // tag: string | Component,
    // props?: Props<P, ComponentOrElement>,
    // children?: NormalizedChildren,
    // className?: string | null,
    // key?: Key,
    // ref?: Ref<Element> | Ref<Component>
// ): VNode<P> {
    // return new VNode(type, tag, props, children, className, key, ref);  

// }
// export class VNode<P = any> implements IVNode<P> {
    // public dom: Element | null = null;
    // constructor(
        // type: Types,
        // tag: string | Component,
        // props?: Props<P> | null,
        // children?: NormalizedChildren,
        // className?: string | null,
        // key?: Key,
        // ref?: Ref<ComponentOrElement>
    // );
    // constructor(
        // public type: Types,
        // public tag: string | Component,
        // public props?: Props<P> | null,
        // public children?: NormalizedChildren,
        // public className?: string | null,
        // public key?: Key,
        // public ref?: Ref<ComponentOrElement>
    // ) { }
// }


// export function createVNode<P>(
    // tag: string,
    // props?: Props<P, Element> | null,
    // children?: Children,
    // className?: string | null,
    // key?: Key | null,
    // ref?: Ref<Element> | null,
// ): VNodeElement<P>;
// export function createVNode<P>(
    // tag: Component,
    // props?: Props<P, Component> | null,
    // children?: Children,
    // className?: string | null,
    // key?: Key | null,
    // ref?: Ref<Component> | null,
// ): VNodeComponent<P>;
// export function createVNode<P>(
    // tag: string | Component,
    // props?: Props<P, ComponentOrElement> | null,
    // children?: Children,
    // className?: string | null,
    // key?: Key | null,
    // ref?: Ref<Component> | Ref<Element> | null,
// ): VNode<P> {
    // let type;
    // if (!props) props = EMPTY_OBJ as P;
    // switch (typeof tag) {
        // case 'string':
            // switch (tag) {
                // case 'input':
                    // type = Types.InputElement;
                    // break;
                // case 'select':
                    // type = Types.SelectElement;
                    // break;
                // case 'textarea':
                    // type = Types.TextareaElement;
                    // break;
                // case 'svg':
                    // type = Types.SvgElement;
                    // break;
                // default:
                    // type = Types.HtmlComment;
                    // break;
            // }
            // break;
        // case 'function':
            // if (tag.prototype?.$init) {
                // type = Types.ComponentClass;
            // } else {
                // type = Types.ComponentFunction;
            // }
            // break;
        // default:
            // throw new Error(`Unknown vNode type: ${tag}`);
    // }

    // if (type & Types.Component) {
        // if (!isNullOrUndefined(children)) {
            // if (props === EMPTY_OBJ) props = {} as P;
            // props.children = normalizeChildren(children, false);
        // }
    // }
// }

// function normalizeChildren(vNodes: Children, shouldAddKey: boolean): NormalizedChildren {
    // if(isArray(vNodes)) {
    // }

    // return vNodes;
// }