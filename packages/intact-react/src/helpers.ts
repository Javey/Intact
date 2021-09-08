type Fiber = any;

let internalInstanceKey: string;
let internalPropsKey: string;
let listeningMarker: string;

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
