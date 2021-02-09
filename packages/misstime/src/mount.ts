import {VNode, Types, VNodeElement, VNodeComponent, ChildrenTypes, NormalizedChildren} from './types';
import {isNullOrUndefined} from './utils';
import {directClone} from './vnode';

export function mount(vNode: VNode, parentDom: Element | null, isSVG: boolean, mountedQueue: Function[]): void {
    const type = (vNode.type |= Types.InUse);

    if (type & Types.Element) {
        mountElement(vNode as VNodeElement, parentDom, isSVG, mountedQueue);
    }
}

function mountElement(vNode: VNodeElement, parentDom: Element | null, isSVG: boolean, mountedQueue: Function[]) {
    const {type, props, className, childrenType, tag} = vNode;

    isSVG = isSVG || (type && Types.SvgElement) > 0;
    const dom = documentCreateElement(tag, isSVG);

    vNode.dom = dom;

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
}

function mountArrayChildren(children: VNode[], dom: Element | null, isSVG: boolean, mountedQueue: Function[]) {
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

function setTextContent(dom: Element, children: string) {
    dom.textContent = children;
}
