import {VNode as IntactVNode, ComponentClass} from 'intact';
import {Component as IntactVueComponent} from './index';
import { isNullOrUndefined } from 'intact-shared';
import {VNode as VueVNode} from 'vue';

export function beforeInsert(vNode: IntactVNode, parent: ComponentClass | null | undefined) {
    while (parent = parent?.$senior) {
        if ((parent as IntactVueComponent).$isVue) {
            const vnode = (parent as IntactVueComponent).$vnode;
            setScopeId(vNode.dom as HTMLElement, vnode);
        }
    }
};

export function setScopeId(el: HTMLElement, vnode: VueVNode) {
    let i;
    if (!isNullOrUndefined(i = (vnode as any).fnScopeId)) {
        hostSetScopeId(el, i);
    } else {
        let ancestor = vnode;
        while (ancestor) {
            if (!isNullOrUndefined(i = ancestor.context) && !isNullOrUndefined(i = (i.$options as any)._scopeId)) {
                hostSetScopeId(el, i);
            }
            ancestor = ancestor.parent!;
        }
    }
}

function hostSetScopeId(el: HTMLElement, scopeId: string) {
    el.setAttribute(scopeId, '');
}
