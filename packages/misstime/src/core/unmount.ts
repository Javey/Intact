import {VNode, Types, ChildrenTypes, ComponentClass, VNodeComponentClass} from '../utils/types';
import {unmountRef} from '../utils/ref';
import {isNullOrUndefined} from 'intact-shared';
import {removeVNodeDom} from '../utils/common';
import {delegatedEvents, unmountDelegatedEvent} from '../events/delegation';

export function remove(vNode: VNode, parentDom: Element, reusing: boolean) {
    if (!reusing) {
        unmount(vNode);
    }
    removeVNodeDom(vNode, parentDom);
}

export function unmount(vNode: VNode) {
    const type = vNode.type;
    const children = vNode.children;

    if (type & Types.Element) {
        const props = vNode.props;

        unmountRef(vNode.ref);

        const childrenType = vNode.childrenType;

        if (!isNullOrUndefined(props)) {
            for (const prop in props) {
                if (delegatedEvents[prop]) {
                    unmountDelegatedEvent(prop, vNode.dom as Element);
                }
            }
        }

        if (childrenType & ChildrenTypes.MultipleChildren) {
            unmountAllChildren(children as VNode[]);
        } else if (childrenType === ChildrenTypes.HasVNodeChildren) {
            unmount(children as VNode);
        }
    } else if (children) {
        if (type & Types.ComponentClass) {
            unmountComponentClass(vNode as VNodeComponentClass, null);
        } else if (type & Types.ComponentFunction) {
            unmount(children as VNode);
        } else if (type & Types.Fragment) {
            if (vNode.childrenType & ChildrenTypes.MultipleChildren) {
                unmountAllChildren(children as VNode[]);
            }
        }
    }
}

export function unmountComponentClass(vNode: VNodeComponentClass, nextVNode: VNodeComponentClass | null) {
    vNode.children!.$unmount(vNode, nextVNode);
    unmountRef(vNode.ref);
}

export function unmountAllChildren(children: VNode[]) {
    for (let i = 0, len = children.length; i < len; ++i) {
        unmount(children[i]);
    }
}

export function clearDom(dom: Element) {
    dom.textContent = '';
}

export function removeAllChildren(children: VNode[], dom: Element, vNode: VNode, reusing: boolean) {
    if (!reusing) {
        unmountAllChildren(children);
    }

    if (vNode.type & Types.Fragment) {
        removeVNodeDom(vNode, dom);
    } else {
        clearDom(dom);
    }
}
