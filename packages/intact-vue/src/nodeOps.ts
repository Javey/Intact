import {IntactDom} from 'intact';

type FragmentWithMeta = DocumentFragment & {
    _first: Node 
    _second: Node 
} 

export function addMeta(element: FragmentWithMeta, first: Node, second: Node) {
    element._first = first;
    element._second = second;
}

export function rewriteDomApi(element: FragmentWithMeta) {
    const {_first: first, _second: second} = element;

    const parentNode = first.parentNode!;
    Object.defineProperty(element, 'parentNode', {
        value: parentNode,
    });

    Object.defineProperty(element, 'nextSibling', {
        get() {
            return second.nextSibling;
        }
    });

    const removeChild = parentNode.removeChild;
    parentNode.removeChild = function<T extends Node>(child: T) {
        if (child === (element as Node)) {
            removeChild.call(this, first);
            removeChild.call(this, second);
            return first as unknown as T;
        }
        return removeChild.call(this, child) as T; 
    };

    const insertBefore = parentNode.insertBefore;
    parentNode.insertBefore = function<T extends Node>(newChild: T, refChild: Node | null): T {
        if (refChild === (element as Node)) {
            return insertBefore.call(this, newChild, first) as T;
        }
        return insertBefore.call(this, newChild, refChild) as T;
    }
}
