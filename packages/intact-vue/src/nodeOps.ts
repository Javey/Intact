import {IntactDom} from 'intact';

type FragmentWithMeta = DocumentFragment & {
    _intactVueLegacyFirst: Node 
    _intactVueLegacySecond: Node 
} 

export function addMeta(element: FragmentWithMeta, first: Node, second: Node) {
    element._intactVueLegacyFirst = first;
    element._intactVueLegacySecond = second;
}

export function rewriteDomApi(element: FragmentWithMeta) {
    const {_intactVueLegacyFirst: first, _intactVueLegacySecond: second} = element;

    const parentNode = first.parentNode!;
    Object.defineProperty(element, 'parentNode', {
        value: parentNode,
    });

    Object.defineProperty(element, 'nextSibling', {
        get() {
            return second.nextSibling;
        }
    });

    rewriteParentApi(parentNode);
}

function rewriteParentApi(parentNode: Node & {_intactVueLegacyRewrote?: boolean}) {
    if (parentNode._intactVueLegacyRewrote) return;

    const removeChild = parentNode.removeChild;
    parentNode.removeChild = function<T extends Node>(child: T) {
        if (isFragmentWithMeta(child)) {
            removeChild.call(this, child._intactVueLegacyFirst);
            return removeChild.call(this, child._intactVueLegacySecond) as T;
        }
        return removeChild.call(this, child) as T; 
    };

    const insertBefore = parentNode.insertBefore;
    parentNode.insertBefore = function<T extends Node>(newChild: T, refChild: Node | null): T {
        if (refChild && isFragmentWithMeta(refChild)) {
            return insertBefore.call(this, newChild, refChild._intactVueLegacyFirst) as T;
        }
        return insertBefore.call(this, newChild, refChild) as T;
    }

    parentNode._intactVueLegacyRewrote = true;
}

function isFragmentWithMeta(node: Node): node is FragmentWithMeta {
    return '_intactVueLegacyFirst' in node; 
}
