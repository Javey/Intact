import {normalizeProps} from './normalize';
import {ComponentFunction, NormalizedChildren, VNodeComponentClass, Props} from 'intact';
import {createElement, ForwardedRef, FunctionComponent, forwardRef, ReactElement, Fragment, ReactNode, PropsWithChildren} from 'react';
import {isArray} from 'intact-shared';

export type ComponentFunctionForIntact<P = {}> = Pick<ComponentFunction, 'displayName' | 'typeDefs'> & {
     (props: Props<P, any>, isReact?: boolean): VNodeComponentClass | VNodeComponentClass[] 
}

export function functionalWrapper<P = {}>(Component: ComponentFunctionForIntact<P>) {
    function Ctor(props: P, context?: any): ReactElement<any, any> {
        if (context) {
            // invoked by React
            const vNodes = Component(normalizeProps(props, context), true);
            if (isArray(vNodes)) {
                return createElement(Fragment, null, vNodes.map((vNode, index) => {
                    return normalizeIntactVNodeToReactVNode(vNode, index);
                }));
            }
            return normalizeIntactVNodeToReactVNode(vNodes, 0)!;
        } else {
            // invoked by Intact
            return Component(props) as unknown as ReactElement;
        }
    }

    const element = forwardRef<{}, P & {forwardRef?: ForwardedRef<any>, children?: ReactNode | null}>((props, ref) => {
        if (ref) props = {...props, forwardRef: ref};
        return createElement<P>(Ctor, props);
    });

    (element as any)._$type = Ctor;

    return element;
}

export function normalizeIntactVNodeToReactVNode(vNode: VNodeComponentClass | null, key: number) {
    // if (isStringOrNumber(vNode)) {
        // return vNode;
    // } else if (vNode) {
    if (vNode) {
        const props = vNode.props;
        return createElement(
            vNode.tag as any,
            props ? {key, ...props} : {key},
        );
    }

    return null
}