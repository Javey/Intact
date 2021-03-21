import {VNode, Types, ChildrenTypes, RefObject} from './utils/types';
import {mountRef} from './utils/ref';
import {isNullOrUndefined} from './utils/utils';
import {removeChild} from './utils/common';
import {delegatedEvents, unmountDelegatedEvent} from './events/delegation';

export function remove(vNode: VNode, parentDom: Element) {
    unmount(vNode);
    removeChild(parentDom, vNode.dom as Element);
}

export function unmount(vNode: VNode) {
    const type = vNode.type;
    const children = vNode.children;

    if (type & Types.Element) {
        const ref = vNode.ref as RefObject<Element>;
        const props = vNode.props;

        mountRef(ref, null);

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
        // TODO: remove component
        if (type & Types.ComponentClass) {
            
        }
    }
}

export function unmountAllChildren(children: VNode[]) {
    for (let i = 0, len = children.length; i < len; ++i) {
        unmount(children[i]);
    }
}

export function clearDom(dom: Element) {
    dom.textContent = '';
}

export function removeAllChildren(children: VNode[], dom: Element) {
    unmountAllChildren(children);

    clearDom(dom);
}
