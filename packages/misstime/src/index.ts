export * from './utils/types';
export {
    getTypeForVNodeElement,
    createVNode,
    createElementVNode,
    createComponentVNode,
    createUnknownComponentVNode,
    createTextVNode,
    createCommentVNode,
    createUnescapeTextVNode,
    normalizeRoot,
    normalizeChildren,
    createFragment,
    createVoidVNode,
} from './core/vnode';
export {linkEvent} from './events/linkEvent';
export {render} from './core/render';
export {patch} from './core/patch';
export {mount} from './core/mount';
export {unmount} from './core/unmount';
export {findDomFromVNode, callAll} from './utils/common';
