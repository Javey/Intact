import {createVNode as h, VNode} from 'intact';
import {ReactNode} from 'react';
import {isNullOrUndefined, isArray} from 'intact-shared';
import {Wrapper} from './wrapper';

export type VNodeAtom = VNode | null | undefined | string | number;

export function normalize(vNode: ReactNode): VNodeAtom {
    if (isNullOrUndefined(vNode)) return null;

    return h(Wrapper, {vnode: vNode});
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

export function normalizeProps<P>(props: P, context: any) {
    if (!props) return null;

    const normalizedProps: P = {} as P;
    for (const key in props) {
        const value = props[key];
        if (key === 'children') {
            normalizedProps[key] = normalizeChildren(value) as unknown as P[typeof key];
        }
    }

    return normalizedProps;
}
