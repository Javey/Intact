import {isString, isNumber, isObject} from 'intact-shared';

type Fiber = any;

let internalInstanceKey: string;
let internalPropsKey: string;

export function precacheFiberNode(node: Element, placeholder: Element): Fiber {
    if (!internalInstanceKey) {
        const keys = Object.keys(placeholder);
        internalInstanceKey = keys[0]; 
        internalPropsKey = keys[1];
    }

    const fiber = (placeholder as any)[internalInstanceKey];
    (node as any)[internalInstanceKey] = fiber;

    return fiber;
}

export function updateFiberProps(node: Element, placeholder: Element) {
    (node as any)[internalPropsKey] = (placeholder as any)[internalPropsKey];
}

export let listeningMarker: string;

const bind = Function.prototype.bind;
Function.prototype.bind = function(...args: any[]) {
    const [obj, domEventName, eventSystemFlags, targetContainer, ...rest] = args;
    if (obj === null && isString(domEventName) && isNumber(eventSystemFlags) && targetContainer instanceof Element) {
        let isReactListening = false;
        if (!listeningMarker) {
            const keys = Object.keys(targetContainer);
            const key = keys.find(key => key.startsWith('_reactListening'));
            if (key) {
                listeningMarker = key;
                isReactListening = true;
            } else {
                isReactListening = false;
            }
        } else {
            isReactListening = (targetContainer as any)[listeningMarker];
        }

        if (isReactListening) {
            return bind.call(this, null, domEventName, eventSystemFlags | 2, targetContainer, ...rest);
        }
    }
    return bind.call(this, ...(args as [any]));
}

