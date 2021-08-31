import Intact from 'intact/dist';
import React from 'react';
import Wrapper from './Wrapper';
import createElement from './createElement';

const {h, VNode, Types} = Intact.Vdt.miss;
const {isFunction, isArray, isStringOrNumber, set, get} = Intact.utils;

export function normalize(vNode, parentRef) {
    if (vNode == null) return vNode;
    // if a element has one child which is string or number
    // intact will set text content directly to update its children
    // this will lead to that the parent of placholder wich return
    // by Wrapper missing because of it has been removed, 
    // so we should convert string or number child
    // to VNode to let intact update it one by one
    if (isStringOrNumber(vNode)) {
        return new VNode(Types.Text, null, null, vNode);
    }
    // maybe return by functional component
    if (vNode instanceof VNode) {
        // update parentRef
        if (isFunction(vNode.tag)) {
            vNode.props._parentRef = parentRef;
        }
        return vNode;
    }
    // normalizde the firsthand intact component to let intact access its children
    let tmp;
    if ((tmp = vNode.type) && (tmp = tmp.$$cid) && (tmp === 'IntactReact' || tmp === 'IntactFunction')) {
        return h(
            vNode.type,
            normalizeProps(
                {...vNode.props, _parentRef: parentRef}, 
                {_context: vNode._owner && vNode._owner.stateNode},
                parentRef,
                vNode.key
            ),
            null,
            null,
            vNode.key,
            normalizeRef(vNode.ref)
        );
    }

    if (vNode.type === React.Fragment) {
        return normalizeChildren(vNode.props.children, parentRef);
    }

    // only wrap the react host element
    return h(Wrapper, {reactVNode: vNode, _parentRef: parentRef}, null, vNode.props.className, vNode.key);
}

export function normalizeChildren(vNodes, parentRef = {}) {
    if (isArray(vNodes)) {
        const ret = [];
        vNodes.forEach(vNode => {
            if (isArray(vNode)) {
                ret.push(...normalizeChildren(vNode, parentRef));
            } else {
                ret.push(normalize(vNode, parentRef));
            }
        });
        return ret;
    }
    return normalize(vNodes, parentRef);
}

export function normalizeProps(props, context, parentRef, key) {
    if (!props) return;

    const _props = {};
    const _blocks = _props._blocks = {};
    let tmp;
    for (let key in props) {
        if (key === 'children') {
            _props.children = normalizeChildren(props.children, parentRef);
        } else if ((tmp = getEventName(key))){
            _props[tmp] = props[key];
        } else if (key.substring(0, 2) === 'b-') {
            // is a block
            _blocks[key.substring(2)] = normalizeBlock(props[key]); 
        } else if (key === 'forwardRef') {
            _props.ref = props[key];
        } else {
            _props[key] = props[key];
        }
    }

    _props._context = normalizeContext(context);
    if (key != null) {
        _props.key = key;
    }

    return _props;
}

export function normalizeRef(ref) {
    return typeof ref === 'object' && ref !== null ? (i) => {ref.current = i} : ref;
}

export function normalizeContext(context) {
    const _context = context._context;
    return {
        data: {
            get(name) {
                if (name != null) {
                    return get(_context.state || {}, name);
                } else {
                    return _context.state || {};
                }
            },

            set(name, value) {
                const state = {..._context.state};
                set(state, name, value);
                _context.setState(state);
            }
        }
    }
}

export function normalizeBlock(block) {
    if (isFunction(block)) {
        return function(parent, ...args) {
            return normalizeChildren(block.apply(this, args), {instance: this.data});
        }
    } else {
        return function() {
            return normalizeChildren(block, {instance: this.data});
        }
    }
}

export function getEventName(propName) {
    const [first, second, third] = propName;
    if (!third) return;
    let tmp;
    if (first === 'o' && second === 'n') {
        if (third === '$') {
            // e.g. on$change-value
            return `ev-$${propName.substring(3).replace(/\-/g, ':')}`;
        } else if ((tmp = third.charCodeAt(0)) && tmp >= 65 && tmp <= 90) {
            // e.g. onClick
            return `ev-${propName.substring(2).toLowerCase().replace(/\-/g, ':')}`;
        }
    }
}
