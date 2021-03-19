import {
    VNode,
    Types,
    VNodeElement,
    VNodeComponent,
    ChildrenTypes, 
    NormalizedChildren, 
    Props,
    ComponentConstructor,
} from './utils/types';
import {isNullOrUndefined, throwError, isFunction} from './utils/utils';
import {directClone} from './vnode';
import {mountProps} from './utils/props';
import {mountRef} from './utils/ref';
import {setTextContent, EMPTY_OBJ} from './utils/common';

export function mount(vNode: VNode, parentDom: Element | null, isSVG: boolean, mountedQueue: Function[]): void {
    const type = (vNode.type |= Types.InUse);

    if (type & Types.Element) {
        mountElement(vNode as VNodeElement, parentDom, isSVG, mountedQueue);
    } else if (type & Types.ComponentClass) {
        mountComponentClass(null, vNode as VNodeComponent, parentDom!, isSVG, mountedQueue);
    } else if (type & Types.ComponentFunction) {

    } else if (type & Types.Text) {
        mountText(vNode as VNodeElement, parentDom);
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

export function mountElement(vNode: VNodeElement, parentDom: Element | null, isSVG: boolean, mountedQueue: Function[]) {
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
        // TODO
        // validateKeys(vNode);
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
            mount(children as VNode, dom, childrenIsSVG, mountedQueue);
        } else if (
            childrenType === ChildrenTypes.HasKeyedChildren ||
            childrenType === ChildrenTypes.HasNonKeyedChildren
        ) {
            mountArrayChildren(children as VNode[], dom, childrenIsSVG, mountedQueue);
        }
    }

    if (!isNullOrUndefined(parentDom)) {
        parentDom.appendChild(dom);
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
    mountedQueue: Function[]
) {
    const instance = new vNode.tag(vNode.props);

    instance.$SVG = isSVG;
    instance.$vNode = vNode;
    instance.$mountedQueue = mountedQueue;
   
    vNode.children = instance;

    instance.$render(lastVNode, vNode, parentDom);

    mountRef(vNode.ref, instance);

    if (isFunction(instance.mounted)) {
        mountedQueue.push(() => instance.mounted!(lastVNode, vNode));
    }
}

export function mountText(vNode: VNodeElement, parentDom: Element | null) {
    const dom = vNode.dom = document.createTextNode(vNode.children as string);

    if (!isNullOrUndefined(parentDom)) {
        parentDom.appendChild(dom);
    }
}

export function mountArrayChildren(children: VNode[], dom: Element | null, isSVG: boolean, mountedQueue: Function[]) {
    for (let i = 0; i < children.length; i++) {
        let vNode = children[i];

        if (vNode.type & Types.InUse) {
            children[i] = vNode = directClone(vNode);
        }
        mount(vNode, dom, isSVG, mountedQueue);
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
