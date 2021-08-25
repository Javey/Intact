import {RendererElement, ComponentInternalInstance, VNode} from 'vue';

export function setScopeId(
    el: RendererElement,
    vnode: VNode,
    scopeId: string | null,
    slotScopeIds: string[] | null,
    parentComponent: ComponentInternalInstance | null
) {
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
