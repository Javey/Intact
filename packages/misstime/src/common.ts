import {isNull} from './utils';

export function replaceChild(parentDom: Element, newDom: Element, lastDom: Element) {
    parentDom.replaceChild(newDom, lastDom);
}

export function setTextContent(dom: Element, children: string) {
    dom.textContent = children;
}

export function removeChild(parentDom: Element, dom: Element) {
    parentDom.removeChild(dom);
}

export function insertOrAppend(parentDom: Element, newNode: Element | Text, nextNode: Element | Text | null) {
    if (isNull(nextNode)) {
        parentDom.appendChild(newNode);
    } else {
        parentDom.insertBefore(newNode, nextNode);
    }
}

export function normalizeEventName(name: string) {
    return name.substr(3);
}
