import {VNode as VueVNode} from 'vue';
import {isNullOrUndefined, isStringOrNumber, isArray} from 'intact-shared';
import type {Component} from './';
import {createComponentVNode, VNode, Key, Blocks} from 'intact';
import {Wrapper} from './wrapper';

export type VNodeAtom = VNode | null | undefined | string | number;

export function normalize(vnode: VueVNode | null | undefined): VNodeAtom {
    if (isNullOrUndefined(vnode)) return vnode;
    if (isStringOrNumber(vnode)) return vnode;
    if (vnode.text !== undefined) {
        return vnode.text;
    }

    let vNode: VNode;
    if (isIntactComponent(vnode)) {
        const Ctor = vnode.componentOptions!.Ctor as unknown as typeof Component;
        const props = normalizeProps(vnode);
        vNode = createComponentVNode(4, Ctor, props, vnode.key as Key);
    } else {
        vNode = createComponentVNode(4, Wrapper, {vnode}, vnode.key as Key);
    }

    return vNode;
}

export function normalizeChildren(vnodes: VueVNode[]) {
    const loop = (vnodes: VueVNode[]): VNodeAtom[] | VNodeAtom => {
        if (isArray(vnodes)) {
            const ret: VNodeAtom[] = [];
            vnodes.forEach(vnode => {
                if (isArray(vnode)) {
                    ret.push(...loop(vnode) as VNodeAtom[]);
                } else {
                    ret.push(normalize(vnode));
                }
            });

            return ret;
        }

        return normalize(vnodes);
    };

    const ret = loop(vnodes);
    if (isArray(ret)) {
        const l = ret.length;
        return l === 0 ? undefined : l === 1 ? ret[0] : ret;
    }
    return ret;
}

function normalizeProps(vnode: VueVNode) {
    const {componentOptions, data} = vnode; 
    const attrs = data!.attrs;
    const propTypes = (componentOptions!.Ctor as typeof Component).typeDefs;
    const props: any = {};

    if (attrs) {
        for (let key in attrs) {
            if (~['staticClass', 'class', 'style', 'staticStyle'].indexOf(key)) continue;

            let value = attrs[key];
            if (propTypes) {
                const camelizedKey = camelize(key);
            }
            
            props[key] = value;
        }
    }

    normalizeClassName(vnode, props);
    normalizeSlots(vnode, props);

    return props;
}

function normalizeClassName(vnode: VueVNode, props: any) {
    const data = vnode.data;
    if (data) {
        if (data.staticClass) {
            props.className = data.staticClass;
        }
        if (data.class) {
            if (!props.className) {
                props.className = stringifyClass(data.class);
            } else {
                props.className += ' ' + stringifyClass(data.class);
            }
        }
    }
}

function normalizeSlots(vnode: VueVNode, props: any) {
    const slots = resolveSlots(vnode.componentOptions!.children); 
    const {default: _default, ...rest} = slots;

    if (_default) {
        props.children = normalizeChildren(_default);
    }

    let blocks: Blocks | null = null;
    if (rest) {
        blocks = {};
        for (const key in rest) {
            blocks[key] = function() {
                return normalizeChildren(rest[key]);
            }
        }
        props.$blocks = blocks;
    }
}

// copy from vue/src/core/instance/render-helpers/resolve-slots.js
function resolveSlots(children: VueVNode[] | undefined) {
    const slots: any = {}
    if (!children) {
        return slots;
    }
    const defaultSlot = [];
    for (let i = 0, l = children.length; i < l; i++) {
        const child = children[i];
        const data = child.data;
        // remove slot attribute if the node is resolved as a Vue slot node
        if (data && data.attrs && data.attrs.slot) {
            delete data.attrs.slot;
        }
        if (data && data.slot != null) {
            const name = data.slot;
            const slot = (slots[name] || (slots[name] = []));
            if (child.tag === 'template') {
                slot.push.apply(slot, child.children || []);
            } else {
                slot.push(child);
            }
        } else {
            (slots.default || (slots.default = [])).push(child);
        }
    }
    // ignore slots that contains only whitespace
    for (const name in slots) {
        if (slots[name].every(isWhitespace)) {
            delete slots[name];
        }
    }
    return slots;
}

function isIntactComponent(vnode: VueVNode) {
    const componentOptions = vnode.componentOptions;
    return componentOptions && 
        (componentOptions.Ctor as unknown as typeof Component).$cid === 'IntactVue';
}

function isWhitespace(node: VueVNode) {
    return (node.isComment && !(node as any).asyncFactory) || node.text === ' ';
}

function stringifyClass(className: string[] | Record<string, any> | string | null | undefined) {
    if (isNullOrUndefined(className)) return '';
    if (isArray(className)) {
        return stringifyArray(className);
    }
    if (typeof className === 'object') {
        return stringifyObject(className);
    }
    if (typeof className === 'string') {
        return className;
    }

    return '';
}

function stringifyArray(value: string[]) {
    let res = '';
    let stringified;
    for (let i = 0; i < value.length; i++) {
        if ((stringified = stringifyClass(value[i])) != null && stringified !== '') {
            if (res) res += ' ';
            res += stringified;
        }
    }

    return res;
}

function stringifyObject(value: Record<string, any>) {
    let res = '';
    for (let key in value) {
        if (value[key]) {
            if (res) res += ' ';
            res += key;
        }
    }

    return res;
}

function cached(fn: (str: string) => string) {
    const cache = Object.create(null);
    return function(str: string) {
        const hit = cache[str];
        return hit || (cache[str] = fn(str));
    };
}

/**
 * Camelize a hyphen-delimited string.
 */
const camelizeRE = /-(\w)/g
const camelize = cached((str) => {
    return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '');
});
