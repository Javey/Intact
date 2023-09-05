import {normalizeProps, VNodeAtom} from './normalize';
import {h, VNode as VueVNode, VNodeProps} from 'vue';
import {ComponentFunction, NormalizedChildren, VNode, VNodeComponentClass} from 'intact';
import {isStringOrNumber} from 'intact-shared';

export type ComponentFunctionForVue = ComponentFunction & {
     (props: any, isVue?: boolean): NormalizedChildren 
}

export const cid = 'IntactVueFunctional';

export function functionalWrapper(Component: ComponentFunctionForVue) {
    function Ctor(props: any, context?: any) {
        if (context) {
            // invoked by Vue
            const {forwardRef, ...rest} = props;
            const _props = normalizeProps({
                props: rest,
                children: context.slots,
                type: {
                    Component,
                },
                // ref: forwardRef,
            } as unknown as VueVNode);

            if (forwardRef) {
                _props.ref = forwardRef;
            }

            // functional component of intact must return VNodeComponentClass
            const vNode = Component(_props, true /* is in vue */) as VNodeComponentClass | VNodeComponentClass[];
            if (Array.isArray(vNode)) {
                return vNode.map((vNode) => toVueVNode(vNode));
            }
            return toVueVNode(vNode);
        } else {
            // invoked by Intact
            return Component(props);
        }
    }

    Ctor.displayName = Component.displayName || Component.name;
    Ctor.$cid = cid;

    return Ctor;
}

function toVueVNode(vNode: VNodeComponentClass | null) {
    // if (isStringOrNumber(vNode)) return vNode;
    if (vNode) {
        const props = vNode.props;
        const ref = vNode.ref as unknown as VNodeProps['ref'];
        const vnode = h(
            vNode.tag as any,
            // because Vue will normalize some styles, but the props of vNode in Intact
            // is immutable, we must clone it here.
            props ? (ref ? {...props, ref} : {...props}) : null 
        );

        vNode.ref = null;

        return vnode;
    }
}
