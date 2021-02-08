import {
    createVNode, 
    createCommentVNode, 
    createUnescapeTextVNode,
    Types, 
    VNode,
    directClone
} from './vnode';
import {patch} from './vpatch';
import {render, removeElement} from './vdom';
import {MountedQueue, hooks, config} from './utils';
import {toString} from './tostring';
import {hydrateRoot, hydrate} from './hydration';

export {
    createVNode as h, 
    patch,
    render, 
    createCommentVNode as hc, 
    createUnescapeTextVNode as hu,
    removeElement as remove,
    MountedQueue,
    toString as renderString,
    hydrateRoot, 
    hydrate,
    Types,
    VNode, // for type check
    hooks,
    directClone as clone,
    config,
};
