import {createVNode as h, VNode, Block, Blocks, createComponentVNode, Ref, Children} from 'intact';
import {ReactNode, ReactElement, Fragment, JSXElementConstructor} from 'react';
import {isNullOrUndefined, isArray, isStringOrNumber, isInvalid, isFunction} from 'intact-shared';
import {Wrapper} from './wrapper';
import type {Component} from './';

export type VNodeAtom = VNode | null | undefined | string | number;

export function normalize(vNode: ReactNode): VNodeAtom {
    if (isInvalid(vNode)) return null;
    if (isStringOrNumber(vNode)) return vNode;

    // maybe return by functional component, see unit test: `render intact functional component`
    if ((vNode as VNode).tag) {
        return vNode as VNode;
    }

    if (isIntactComponent(vNode)) {
        const props = normalizeProps(vNode.props);
        return createComponentVNode(
            4,
            vNode.type as unknown as typeof Component,
            props,
            vNode.key,
            (vNode as any).ref,
        );
    }

    return createComponentVNode(4, Wrapper, {vnode: vNode}, (vNode as any).key);
}

export function normalizeChildren(vNodes: ReactNode) {
    if (isArray(vNodes)) {
        const ret: VNodeAtom[] = [];
        vNodes.forEach(vNode => {
            if (isArray(vNode)) {
                ret.push(...normalizeChildren(vNode) as VNodeAtom[]);
            } else {
                ret.push(normalize(vNode));
            }
        }); 
        return ret;
    }
    return normalize(vNodes);
}

export function normalizeProps<P>(props: P): P {
    // if (!props) return null;

    let blocks: Blocks | null = null;
    const normalizedProps: P = {} as P;
    let tmp;
    for (const key in props) {
        const value = props[key];
        if (key === 'children') {
            normalizedProps[key] = normalizeChildren(value) as unknown as P[typeof key];
        } else if (tmp = getEventName(key)) {
            normalizedProps[tmp as keyof P] = value;
        } else if (key.startsWith('slot-')) {
            if (!blocks) blocks = (normalizedProps as any).$blocks = {};
            blocks[key.substring(5)] = normalizeBlock(value);
        } else if (key === 'forwardRef') {
            (normalizedProps as any).ref = value;
        } else {
            normalizedProps[key] = value;
        }
    }

    return normalizedProps;
}

function isIntactComponent(vNode: any): vNode is ReactElement<any, JSXElementConstructor<any>> {
    const type = vNode.type as typeof Component;
    return !!type.$cid;
}

function getEventName(propName: string) {
    const third = propName[2];
    if (!third) return;

    const first = propName[0];
    const second = propName[1];

    let tmp;
    if (first === 'o' && second === 'n') {
        if (third === '$') {
            // e.g. on$change-value
            return `ev-$${propName.substring(3).replace(/\-/g, ':')}`;
        } else if ((tmp = third.charCodeAt(0)) && tmp >= 65 && tmp <= 90) {
            // e.g. onClick
            return `ev-${third.toLowerCase()}${propName.substring(3).replace(/\-/g, ':')}`;
        }
    }
}

function normalizeBlock(block: Function | ReactNode): Block<any> {
    if (isFunction(block)) {
        return function(parent, ...args) {
            return normalizeChildren(block(...args));
        } 
    }
    return function() {
        return normalizeChildren(block); 
    }
}
