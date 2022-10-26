import {hooks, VNode as IntactVNode, ComponentClass} from 'intact';
import {RendererElement, ComponentInternalInstance, VNode} from 'vue';
import {Component as IntactVueComponent} from './index';

hooks.beforeInsert = function(vNode: IntactVNode, parent: ComponentClass | null) {
    const dom = vNode.dom!;
    let i;
    while (parent) {
        // find Intact Component which renders by Vue
        if (i = (parent as IntactVueComponent).vueInstance) {
            const vnode = i.vnode;
            setScopeId(dom, vnode, vnode.scopeId, (vnode as any).slotScopeIds, i.parent);
            break;
        }

        parent = parent.$senior;
    }
};

export function setScopeId(
    el: RendererElement,
    vnode: VNode,
    scopeId: string | null,
    slotScopeIds: string[] | null,
    parentComponent: ComponentInternalInstance | null
) {
    if (el.nodeType !== 1) return;

    if (scopeId) {
        hostSetScopeId(el, scopeId);
    }
    /* istanbul ignore next */
    if (slotScopeIds) {
        for (let i = 0; i < slotScopeIds.length; i++) {
            hostSetScopeId(el, slotScopeIds[i]);
        }
    }
    if (parentComponent) {
        let subTree = parentComponent.subTree;
        if (vnode === subTree) {
            const parentVNode = parentComponent.vnode;
            setScopeId(
                el,
                parentVNode,
                parentVNode.scopeId,
                // slotScopeIds is @internal
                (parentVNode as any).slotScopeIds,
                parentComponent.parent
            );
        }
    }
}

function hostSetScopeId(el: RendererElement, scopeId: string) {
    el.setAttribute(scopeId, '');
}
