import {ComponentFunction, NormalizedChildren, VNodeComponentClass} from 'intact';
import {CreateElement, VNode as VueVNode, FunctionalComponentOptions, RenderContext} from 'vue';
import {normalizeProps} from './normalize';
import {isArray, isNullOrUndefined, EMPTY_OBJ} from 'intact-shared';
import type {Component} from './';

export type ComponentFunctionForVue<P> = ComponentFunction & {
    (props: P, isVue?: boolean): NormalizedChildren
}

export type VueVNodeWithSlots = VueVNode & {$slots?: any}

export function functionalWrapper<T extends {}>(Component: ComponentFunctionForVue<T>) {
    function Ctor(props: T) {
        return Component(props);
    }

    Ctor.options = {
        functional: true,
        render(h: CreateElement, props: any) {
            const _props = normalizeProps({
                componentOptions: {
                    Ctor: Component,
                    listeners: props.listeners,
                },
                data: props.data,
                $slots: props.slots(),
                context: props.parent,
            } as unknown as VueVNodeWithSlots);

            // functional component of intact must return VNodeComponentClass
            const vNode = Component(_props, true) as VNodeComponentClass | VNodeComponentClass[];

            if (isArray(vNode)) {
                return vNode.map(vNode => toVueVNode(h, vNode, props));
            }
            return toVueVNode(h, vNode, props);
        }
    };

    Ctor.cid = 'IntactFunctionalComponent';

    return Ctor as unknown as FunctionalComponentOptions<T>;
}

function toVueVNode(h: CreateElement, vNode: VNodeComponentClass, props: any) {
    const attrs: any = {};
    const __props: any = {attrs};
    const vNodeProps = vNode.props || EMPTY_OBJ;
    for (const key in vNodeProps) {
        if (~['children', '_context', 'className', 'style', 'ref', 'key'].indexOf(key)) continue;
        attrs[key] = vNodeProps[key];
    }
    if (vNode.ref) {
        __props.ref = props.data.ref;
    }
    if (vNodeProps.className) {
        __props.staticClass = vNodeProps.className;
    }
    if (vNodeProps.style) {
        __props.staticStyle = vNodeProps.style;
    }
    if (!isNullOrUndefined(vNode.key)) {
        __props.key = vNode.key;
    }
    let children = vNodeProps.children;
    if (children && !isArray(children)) {
        children = [children];
    }

    return h(
        vNode.tag as typeof Component,
        __props,
        children
    );
}
