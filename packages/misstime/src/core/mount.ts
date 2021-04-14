import {
    VNode,
    Types,
    VNodeElement,
    VNodeComponentClass,
    VNodeComponentFunction,
    VNodeTextElement,
    ChildrenTypes, 
    NormalizedChildren, 
    Props,
    ComponentConstructor,
    IntactDom,
    ComponentClass,
    TransitionElement
} from '../utils/types';
import {isNullOrUndefined, throwError, isFunction, isUndefined} from '../utils/helpers';
import {directClone, normalizeRoot} from './vnode';
import {mountProps} from '../utils/props';
import {mountRef} from '../utils/ref';
import {setTextContent, EMPTY_OBJ, insertOrAppend} from '../utils/common';
import {validateKeys, validateProps} from '../utils/validate';

export function mount(
    vNode: VNode,
    parentDom: Element | null,
    parentComponent: ComponentClass | null,
    isSVG: boolean,
    anchor: IntactDom | null,
    mountedQueue: Function[]
): void {
    const type = (vNode.type |= Types.InUse);

    if (type & Types.Element) {
        mountElement(vNode as VNodeElement, parentDom, parentComponent, isSVG, anchor, mountedQueue);
    } else if (type & Types.ComponentClass) {
        mountComponentClass(null, vNode as VNodeComponentClass, parentDom!, parentComponent, isSVG, anchor, mountedQueue);
    } else if (type & Types.ComponentFunction) {
        mountComponentFunction(vNode as VNodeComponentFunction, parentDom, parentComponent, isSVG, anchor, mountedQueue);
    } else if (type & Types.Text/*  || type & Types.Void */) {
        mountText(vNode as VNodeTextElement, parentDom, anchor);
    } else if (type & Types.Fragment) {
        mountFragment(vNode as VNodeElement, parentDom, parentComponent, isSVG, anchor, mountedQueue);
    } else if (type & Types.HtmlComment) {
        mountComment(vNode as VNodeTextElement, parentDom, anchor);
    } else if (process.env.NODE_ENV !== 'production') {
        if (typeof vNode === 'object') {
            throwError(
                `mount() received an object that's not a valid VNode, you should stringify it first, ` +
                `fix createVNode type or call normalizeChildren. Object: "${JSON.stringify(vNode)}".`
            );
        } else {
            throwError(`mount() expects a valid VNode, instead it received an object with the type "${typeof vNode}".`);
        }
    }
}

export function mountElement(
    vNode: VNodeElement,
    parentDom: Element | null,
    parentComponent: ComponentClass | null,
    isSVG: boolean,
    anchor: IntactDom | null,
    mountedQueue: Function[],
) {
    const {type, props, className, childrenType, tag, transition} = vNode;

    isSVG = isSVG || (type & Types.SvgElement) > 0;
    const dom = vNode.dom = documentCreateElement(tag, isSVG);

    if (!isNullOrUndefined(className) && className !== '') {
        if (isSVG) {
            dom.setAttribute('class', className);
        } else {
            dom.className = className;
        }
    }

    if (process.env.NODE_ENV !== 'production') {
        validateKeys(vNode);
    }

    let children = vNode.children;

    if (childrenType === ChildrenTypes.HasTextChildren) {
        setTextContent(dom, children as string);
    } else if (childrenType !== ChildrenTypes.HasInvalidChildren) {
        const childrenIsSVG = isSVG && tag !== 'foreignObject';

        if (childrenType === ChildrenTypes.HasVNodeChildren) {
            if ((children as VNode).type & Types.InUse) {
                vNode.children = children = directClone(children as VNode);
            }
            mount(children as VNode, dom, parentComponent, childrenIsSVG, null, mountedQueue);
        } else if (
            childrenType === ChildrenTypes.HasKeyedChildren ||
            childrenType === ChildrenTypes.HasNonKeyedChildren
        ) {
            mountArrayChildren(children as VNode[], dom, parentComponent, childrenIsSVG, null, mountedQueue);
        }
    }

    if (!isNullOrUndefined(parentDom)) {
        insertOrAppend(parentDom, dom, anchor);
    }

    if (!isNullOrUndefined(props)) {
        mountProps(vNode, type, props, dom, isSVG);
    }

    if (!isNullOrUndefined(transition)) {
        transition.beforeEnter(dom as TransitionElement); 
        mountedQueue.push(() => transition.enter(dom as TransitionElement));
    }

    mountRef(vNode.ref, dom);
}

export function mountComponentClass(
    lastVNode: VNodeComponentClass | null,
    vNode: VNodeComponentClass,
    parentDom: Element,
    parentComponent: ComponentClass | null,
    isSVG: boolean,
    anchor: IntactDom | null,
    mountedQueue: Function[]
) {
    if (process.env.NODE_ENV !== 'production') {
        validateProps(vNode);
    }

    const instance = new vNode.tag(vNode.props, mountedQueue);

    instance.$SVG = isSVG;
    instance.$vNode = vNode;
    // instance.$mountedQueue = mountedQueue;
    instance.$parent = parentComponent;
   
    vNode.children = instance;

    instance.$render(lastVNode, vNode, parentDom, anchor, mountedQueue);

    mountRef(vNode.ref, instance);

    // mountedQueue.push(() => instance.$mount(lastVNode, vNode))
}

export function mountComponentFunction(
    vNode: VNodeComponentFunction,
    parentDom: Element | null,
    parentComponent: ComponentClass | null,
    isSVG: boolean,
    anchor: IntactDom | null,
    mountedQueue: Function[]
) {
    if (process.env.NODE_ENV !== 'production') {
        validateProps(vNode);
    }
    mount((vNode.children = normalizeRoot(vNode.tag(vNode.props || EMPTY_OBJ), vNode)), parentDom, parentComponent, isSVG, anchor, mountedQueue);
}

export function mountText(vNode: VNodeTextElement, parentDom: Element | null, anchor: IntactDom | null) {
    const dom = vNode.dom = document.createTextNode(vNode.children as string);

    if (!isNullOrUndefined(parentDom)) {
        insertOrAppend(parentDom, dom, anchor);
    }
}

export function mountFragment(
    vNode: VNodeElement,
    parentDom: Element | null,
    parentComponent: ComponentClass | null,
    isSVG: boolean,
    anchor: IntactDom | null,
    mountedQueue: Function[]
) {
    // let children = vNode.children;
    // let childrenType = vNode.childrenType;

    // if (childrenType & ChildrenTypes.MultipleChildren && (children as VNode[]).length === 0) {
        // childrenType = vNode.childrenType = ChildrenTypes.HasVNodeChildren;
        // children = vNode.children = createVNode();
    // }
    if (vNode.childrenType === ChildrenTypes.HasVNodeChildren) {
        mount(vNode.children as VNode, parentDom, parentComponent, isSVG, anchor, mountedQueue);
    } else {
        mountArrayChildren(vNode.children as VNode[], parentDom, parentComponent, isSVG, anchor, mountedQueue);
    }
}

export function mountComment(vNode: VNodeTextElement, parentDom: Element | null, anchor: IntactDom | null) {
    const dom = vNode.dom = document.createComment(vNode.children as string);

    if (!isNullOrUndefined(parentDom)) {
        insertOrAppend(parentDom, dom, anchor);
    }
}

export function mountArrayChildren(
    children: VNode[],
    parentDom: Element | null,
    parentComponent: ComponentClass | null,
    isSVG: boolean, 
    anchor: IntactDom | null,
    mountedQueue: Function[]
) {
    for (let i = 0; i < children.length; i++) {
        let vNode = children[i];

        if (vNode.type & Types.InUse) {
            children[i] = vNode = directClone(vNode);
        }
        mount(vNode, parentDom, parentComponent, isSVG, anchor, mountedQueue);
    }
}

function documentCreateElement(tag: string, isSVG: boolean): Element {
    if (isSVG) {
        return document.createElementNS("http://www.w3.org/2000/svg", tag);
    }
    return document.createElement(tag);
}

// export function createComponentClassInstance(
    // lastVNode: VNodeComponentClass | null,
    // vNode: VNodeComponentClass,
    // Component: ComponentConstructor,
    // props: Props,
    // isSVG: boolean,
    // mountedQueue: Function[],
// ) {
// }
