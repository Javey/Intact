import {isNull, isUndefined} from './helpers';
import {
    Reference,
    IntactDom,
    VNode, 
    Types,
    ChildrenTypes,
    ComponentConstructor,
    ComponentFunction,
    ComponentClass,
    TransitionElement,
} from './types';

export function replaceChild(parentDom: Element, newDom: Element, lastDom: Element) {
    parentDom.replaceChild(newDom, lastDom);
}

export function setTextContent(dom: Element, children: string) {
    dom.textContent = children;
}

export function removeChild(parentDom: Element, dom: IntactDom) {
    parentDom.removeChild(dom);
}

export function insertOrAppend(parentDom: Element, newNode: IntactDom, anchor: IntactDom | null) {
    if (isNull(anchor)) {
        parentDom.appendChild(newNode);
    } else {
        parentDom.insertBefore(newNode, anchor);
    }
}

export function normalizeEventName(name: string) {
    return name.substr(3);
}

export const EMPTY_OBJ: any = {};
if (process.env.NODE_ENV !== 'production') {
    Object.freeze(EMPTY_OBJ);
}

export const REFERENCE: Reference = {value: false};

export const Fragment: string = '$F';

export function removeVNodeDom(vNode: VNode, parentDom: Element) {
    do {
        const type = vNode.type;
        if (type & Types.HtmlElement) {
            const transition = vNode.transition;
            if (isUndefined(transition)) {
                removeChild(parentDom, vNode.dom!);
            } else {
                const dom = vNode.dom;
                transition.leave(dom as TransitionElement, () => removeChild(parentDom, dom!));
            }
            return;
        }

        const children = vNode.children;

        if (type & Types.ComponentClass) {
            vNode = (children as ComponentClass).$lastInput!;
        } else if (type & Types.ComponentFunction) {
            vNode = children as VNode;
        } else if (type & Types.Fragment) {
            if (vNode.childrenType === ChildrenTypes.HasVNodeChildren) {
                vNode = children as VNode;
            } else {
                for (let i = 0; i < (children as VNode[]).length; i++) {
                    removeVNodeDom((children as VNode[])[i], parentDom);
                }
                return;
            }
        }
    } while (vNode);
}

export function findDomFromVNode(vNode: VNode, startEdge: boolean) {
    let type: Types;
    
    while (vNode) {
        type = vNode.type;

        if (type & Types.HtmlElement) {
            return vNode.dom;
        }

        vNode = findChildVNode(vNode, startEdge, type);
    }

    return null;
}

function findChildVNode(vNode: VNode, startEdge: boolean, type: Types) {
    const children = vNode.children;

    if (type & Types.ComponentClass) {
        return (children as ComponentClass).$lastInput!;
    }

    if (type & Types.Fragment) {
        return vNode.childrenType === ChildrenTypes.HasVNodeChildren ?
            (children as VNode) :
            (children as VNode[])[startEdge ? 0 : (children as VNode[]).length - 1];
    }

    return children as VNode;
}

export function moveVNodeDom(vNode: VNode, parentDom: Element, anchor: IntactDom | null) {
    do {
        const type = vNode.type;

        if (type & Types.HtmlElement) {
            // TODO: move with transtion
            insertOrAppend(parentDom, vNode.dom!, anchor);
            return;
        }

        const children = vNode.children;

        if (type & Types.ComponentClass) {
            vNode = (children as ComponentClass).$lastInput!;
        } else if (type & Types.ComponentFunction) {
            vNode = children as VNode;
        } else if (type & Types.Fragment) {
            if (vNode.childrenType === ChildrenTypes.HasVNodeChildren) {
                vNode = children as VNode;
            } else {
                for (let i = 0; i < (children as VNode[]).length; i++) {
                    moveVNodeDom((children as VNode[])[i], parentDom, anchor);
                }
                return;
            }
        }
    } while (vNode);
}

export function getComponentName(tag: ComponentConstructor | ComponentFunction) {
    return tag.name || tag.displayName; // || tag.constructor.name || (tag.toString().match(/^function\s*([^\s(]+)/) || [])[1];
}

export function callAll(mountedQueue: Function[]) {
    for (let i = 0; i < mountedQueue.length; i++) {
        mountedQueue[i]();
    }
}

export const hasDocumentAvailable: boolean = typeof document !== 'undefined';
