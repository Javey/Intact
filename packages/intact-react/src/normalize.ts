import {createVNode as h} from 'intact';
import {ReactNode} from 'react';
import {isNullOrUndefined} from 'intact-shared';
import {Wrapper} from './wrapper';

export function normalize(vNode: ReactNode) {
    if (isNullOrUndefined(vNode)) return null;

    return h(Wrapper, {vnode: vNode});
}
