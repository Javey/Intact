import Intact from 'intact/dist';
import {normalizeProps} from './normalize';
import createElement from './createElement';
import React from 'react';

const {isStringOrNumber, isArray, noop} = Intact.utils;
export {noop, isArray};

// wrap the functional component of intact
export default function functionalWrapper(Component) {
    function Ctor(props, context) {
        if (context) {
            // invoked by React
            const vNodes = Component(normalizeProps(props, context, {instance: context.__parent}), true);
            if (isArray(vNodes)) {
                return vNodes.map((vNode, index) => {
                    return normalizeIntactVNodeToReactVNode(vNode, index);
                });
            }
            return normalizeIntactVNodeToReactVNode(vNodes);
        } else {
            // invoked by Intact
            return Component(props);
        }
    }

    Ctor.contextTypes = {
        _context: noop,
        __parent: noop,
    };

    const ret = React.forwardRef((props, ref) => {
        if (ref) props = {...props, forwardRef: ref};
        return createElement(Ctor, props);
    });

    ret.$$cid = 'IntactFunction';
    ret.$$type = Ctor;

    return ret;
}

export function normalizeIntactVNodeToReactVNode(vNode, key) {
    if (isStringOrNumber(vNode)) {
        return vNode;
    } else if (vNode) {
        return createElement(
            vNode.tag,
            {key, ...vNode.props},
            vNode.props.children || vNode.children
        );
    }
}
