import {
    VNode,
    Types,
    VNodeElement,
    VNodeComponent,
    VNodeTextElement,
    ChildrenTypes, 
    NormalizedChildren, 
    Props,
    ComponentConstructor,
    IntactDom,
} from '../utils/types';
import {isNullOrUndefined, throwError, isFunction} from '../utils/helpers';
import {directClone} from './vnode';
import {mountProps} from '../utils/props';
import {mountRef} from '../utils/ref';
import {setTextContent, EMPTY_OBJ, insertOrAppend} from '../utils/common';
import {validateKeys} from '../utils/validate';

export function mount(vNode: VNode, parentDom: Element | null, isSVG: boolean, anchor: IntactDom | null, mountedQueue: Function[]): void {
    const type = (vNode.type |= Types.InUse);

    if (type & Types.Element) {
        mountElement(vNode as VNodeElement, parentDom, isSVG, anchor, mountedQueue);
    } else if (type & Types.ComponentClass) {
        mountComponentClass(null, vNode as VNodeComponent, parentDom!, isSVG, anchor, mountedQueue);
    } else if (type & Types.ComponentFunction) {

    } else if (type & Types.Text || type & Types.Void) {
        mountText(vNode as VNodeTextElement, parentDom, anchor);
    } else if (type & Types.Fragment) {
        mountFragment(vNode as VNodeElement, parentDom, isSVG, anchor, mountedQueue);
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

export function mountElement(vNode: VNodeElement, parentDom: Element | null, isSVG: boolean, anchor: IntactDom | null, mountedQueue: Function[]) {
    const {type, props, className, childrenType, tag} = vNode;

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
            mount(children as VNode, dom, childrenIsSVG, anchor, mountedQueue);
        } else if (
            childrenType === ChildrenTypes.HasKeyedChildren ||
            childrenType === ChildrenTypes.HasNonKeyedChildren
        ) {
            mountArrayChildren(children as VNode[], dom, childrenIsSVG, anchor, mountedQueue);
        }
    }

    if (!isNullOrUndefined(parentDom)) {
        insertOrAppend(parentDom, dom, anchor);
    }

    if (!isNullOrUndefined(props)) {
        mountProps(vNode, type, props, dom, isSVG);
    }

    mountRef(vNode.ref, dom);
}

export function mountComponentClass(
    lastVNode: VNodeComponent | null,
    vNode: VNodeComponent,
    parentDom: Element,
    isSVG: boolean,
    anchor: IntactDom | null,
    mountedQueue: Function[]
) {
    const instance = new vNode.tag(vNode.props);

    instance.$SVG = isSVG;
    // instance.$vNode = vNode;
    instance.$mountedQueue = mountedQueue;
   
    vNode.children = instance;

    instance.$render(lastVNode, vNode, parentDom, anchor);

    mountRef(vNode.ref, instance);

    if (isFunction(instance.mounted)) {
        mountedQueue.push(() => instance.mounted!(lastVNode, vNode));
    }
}

export function mountText(vNode: VNodeTextElement, parentDom: Element | null, anchor: IntactDom | null) {
    const dom = vNode.dom = document.createTextNode(vNode.children as string);

    if (!isNullOrUndefined(parentDom)) {
        insertOrAppend(parentDom, dom, anchor);
    }
}

export function mountFragment(vNode: VNodeElement, parentDom: Element | null, isSVG: boolean, anchor: IntactDom | null, mountedQueue: Function[]) {
    // let children = vNode.children;
    // let childrenType = vNode.childrenType;

    // if (childrenType & ChildrenTypes.MultipleChildren && (children as VNode[]).length === 0) {
        // childrenType = vNode.childrenType = ChildrenTypes.HasVNodeChildren;
        // children = vNode.children = createVNode();
    // }
    if (vNode.childrenType === ChildrenTypes.HasVNodeChildren) {
        mount(vNode.children as VNode, parentDom, isSVG, anchor, mountedQueue);
    } else {
        mountArrayChildren(vNode.children as VNode[], parentDom, isSVG, anchor, mountedQueue);
    }
}

export function mountComment(vNode: VNodeTextElement, parentDom: Element | null, anchor: IntactDom | null) {
    const dom = vNode.dom = document.createComment(vNode.children as string);

    if (!isNullOrUndefined(parentDom)) {
        insertOrAppend(parentDom, dom, anchor);
    }
}

export function mountArrayChildren(children: VNode[], dom: Element | null, isSVG: boolean, anchor: IntactDom | null, mountedQueue: Function[]) {
    for (let i = 0; i < children.length; i++) {
        let vNode = children[i];

        if (vNode.type & Types.InUse) {
            children[i] = vNode = directClone(vNode);
        }
        mount(vNode, dom, isSVG, anchor, mountedQueue);
    }
}

function documentCreateElement(tag: string, isSVG: boolean): Element {
    if (isSVG) {
        return document.createElementNS("http://www.w3.org/2000/svg", tag);
    }
    return document.createElement(tag);
}

// export function createComponentClassInstance(
    // lastVNode: VNodeComponent | null,
    // vNode: VNodeComponent,
    // Component: ComponentConstructor,
    // props: Props,
    // isSVG: boolean,
    // mountedQueue: Function[],
// ) {
// }
