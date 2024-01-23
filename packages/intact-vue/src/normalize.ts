import {default as Vue, VNode as VueVNode, VNodeData} from 'vue';
import {isNullOrUndefined, isStringOrNumber, isArray, hasOwn} from 'intact-shared';
import type {Component} from './';
import {
    createComponentVNode,
    VNode,
    Key,
    TypeDefs,
    TypePrimitive,
    TypeObject,
    Blocks,
    directClone,
    Types,
} from 'intact';
import {Wrapper} from './wrapper';
import type {VueVNodeWithSlots} from './functionalWrapper';
import { beforeInsert } from './scoped';

export type VNodeAtom = VNode | null | undefined | string | number;
type TypeDefValue = TypePrimitive | TypePrimitive[] | TypeObject
type EventValue = Function | Function[]
type VueVNodeAtom = VueVNode | null | undefined | string | number | boolean;
type VueScopedSlotReturnValue = VueVNodeAtom | VueVNodeAtom[] | VueScopedSlotReturnValue[];

const _testData = {};
const _vm = new Vue({data: _testData});
const __ob__ = (_testData as any).__ob__;

export function normalize(vnode: VueVNodeAtom | VNode): VNodeAtom {
    if (isNullOrUndefined(vnode) || isStringOrNumber(vnode)) return vnode;
    if (isBoolean(vnode)) return String(vnode);
    if (isIntactVNode(vnode)) {
        if (vnode.type & Types.InUse) {
            return directClone(vnode);
        }
        return vnode;
    }
    if (vnode.text !== undefined) {
        return vnode.text;
    }

    let vNode: VNode;
    if (isIntactComponent(vnode)) {
        const Ctor = vnode.componentOptions!.Ctor as unknown as typeof Component;
        const props = normalizeProps(vnode);
        vNode = createComponentVNode(Types.ComponentClass, Ctor, props, vnode.key as Key, props.ref);
        vNode.hooks = { beforeInsert };
    } else {
        vNode = createComponentVNode(Types.ComponentClass, Wrapper, {vnode}, vnode.key as Key);
    }

    // let vue don't observe it when it is used as property, ksc-fe/kpc#500
    // we can not use `vNode._isVue = true`, because it will affect vue-devtools. ksc-fe/kpc#512
    (vNode as any).__ob__ = __ob__;

    return vNode;
}

export function normalizeChildren(vnodes: VueScopedSlotReturnValue) {
    const loop = (vnodes: VueScopedSlotReturnValue): VNodeAtom[] | VNodeAtom => {
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

export function normalizeProps(vnode: VueVNode) {
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
                if (hasOwn.call(propTypes, camelizedKey)) {
                    value = normalizeBoolean(propTypes, key, camelizedKey, value);
                    key = camelizedKey;
                }
            }
            
            props[key] = value;
        }
    }

    normalizeClassName(data, props);
    normalizeStyle(data, props);
    normalizeSlots(vnode, componentOptions!.children, data!.scopedSlots, props);
    normalizeEvents(componentOptions!.listeners as Record<string, EventValue>, props);
    normalizeRef(data!, vnode.context!.$refs, props);
    normalizeKey(data!, vnode, props);
    normalizeDirs(data!.directives, props);

    return props;
}

function normalizeClassName(data: VueVNode['data'] & ({_staticClass?: string, _class?: any} | undefined), props: any) {
    if (data) {
        const staticClass = data.staticClass || data._staticClass;
        if (staticClass) {
            props.className = staticClass;
            // Vue will merge class with parent class, so we assign it to
            // _staticClass and delete the original staticClass to prevent from merging.
            // So that we can use _staticClass instead when it comes here again
            data._staticClass = staticClass;
            delete data.staticClass;
        }
        const className = data.class || data._class;
        if (className) {
            if (!props.className) {
                props.className = stringifyClass(className);
            } else {
                props.className += ' ' + stringifyClass(className);
            }
            data._class = className;
            delete data.class;
        }
    }
}

function normalizeStyle(data: VueVNode['data'] & ({_style?: any, _staticStyle?: any} | undefined), props: any) {
    let result;
    if (data) {
        const style = data.style || data._style;
        if (style) {
            result = getStyleBinding(style);
            data._style = style;
            delete data.style;
        }
        const staticStyle = data.staticStyle || data._staticStyle;
        if (staticStyle) {
            result = {...staticStyle, ...style};
            data._staticStyle = staticStyle;
            delete data.staticStyle;
        }
    }

    if (result) {
        props.style = result;
    }
}

function normalizeBoolean(
    propTypes: TypeDefs<Record<string, TypeDefValue>>,
    key: string,
    camelizedKey: string,
    value: any
) {
    let tmp;
    if (
        (
            // value is Boolean
            (tmp = propTypes[camelizedKey]) === Boolean ||
            tmp && (
                // value contains Boolean
                isArray(tmp) && tmp.indexOf(Boolean) > -1 ||
                (tmp = (tmp as TypeObject).type) && (
                    // value.type is Boolean
                    tmp === Boolean ||
                    // value.type contains Boolean
                    isArray(tmp) && tmp.indexOf(Boolean) > -1
                )
            )
        ) &&
        (value === '' || value === key)
    ) {
        value = true;
    }

    return value;
}

function normalizeEvents(listeners: Record<string, EventValue> | undefined, props: any) {
    if (listeners) {
        for (let key in listeners) {
            let name;
            const value = listeners[key];
            const cb = isArray(value) ?
                (v: any) => {
                    (value as Function[]).forEach(value => value(v));
                } :
                value;

            if (key === 'input') {
                // is a v-model directive of vue
                name = `$model:value`;
            } else if (key.startsWith('update:')) {
                // delegate update:prop(sync modifier) to $change:prop.
                // propName has been camelized by Vue, don't do it again
                // key = `$change:${camelize(key.substr(7))}`;
                const propName = key.substring(7);
                // if (name.indexOf('-') > -1) continue;
                name= `$model:${propName}`;
            } else {
                if (key.startsWith('change:')) {
                    name = `$change:${camelize(key.substring(7))}`;
                } else {
                    if (key === 'change') {
                        name = key;
                    } else if (key.startsWith('change')) {
                        // e.g. @changeValue -> ev-$change:value
                        // e.g. @changePropName -> ev-$change:propName
                        // e.g. @change-prop-name -> ev-$change:propName
                        name = `$change:${lowerFirst(camelize(key.substring(6)))}`;
                    } else {
                        name = camelize(key);
                    }
                }
            }

            props[`ev-${name}`] = cb;
        }
    }
}

function normalizeSlots(vnode: VueVNodeWithSlots, children: VueVNode[] | undefined, scopedSlots: VNodeData['scopedSlots'], props: any) {
    const slots = vnode.$slots || resolveSlots(children); 

    let blocks: Blocks | null = null;
    for (const key in slots) {
        const slot = slots[key];
        if (key === 'default') {
            props.children = normalizeChildren(slot);
            continue;
        }
        if (!blocks) blocks = {};
        blocks[key] = function() {
            return normalizeChildren(slot);
        }
    }

    if (scopedSlots) {
        for (const key in scopedSlots) {
            const slot = scopedSlots[key]!;
            if (!blocks) blocks = {};
            blocks[key] = function(parent, data: any) {
                return normalizeChildren(slot(data));
            }
        }
    }

    if (blocks) {
        props.$blocks = blocks;
    }
}

function normalizeRef(data: VNodeData, refs: Vue['$refs'], props: any) {
    const ref = data.ref;
    if (ref) {
        props.ref = function(i: any, isRemove: boolean) {
            const value = refs[ref];
            if (!isRemove) {
                if (data.refInFor) {
                    if (!isArray(value)) {
                        refs[ref] = [i];
                    } else if (value.indexOf(i) < 0) {
                        value.push(i);
                    }
                } else {
                    refs[ref] = i;
                }
            } else {
                if (isArray(value)) {
                    var index = value.indexOf(i);
                    if (~index) {
                        value.splice(index, 1);
                    }
                } else {
                    refs[ref] = undefined;
                }
            }  
        }
        props.ref.key = ref;
    }
}

function normalizeDirs(dirs: VNodeData['directives'], props: any) {
    if (!dirs) return;

    dirs.find(dir => {
        if (dir.name === 'show' && !dir.value) {
            (props.style || (props.style = {})).display = 'none';
            return true;
        }
    });
}

function normalizeKey(data: VNodeData, vnode: VueVNode, props: any) {
    if (!isNullOrUndefined(data.key)) {
        props.key = data.key;
    } else if (!isNullOrUndefined(vnode.key)) {
        props.key = vnode.key;
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

function isIntactVNode(vNode: any): vNode is VNode {
    return 'type' in vNode;
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

function cached(fn: (str: string) => any) {
    const cache = Object.create(null);
    return function(str: string) {
        return cache[str] || (cache[str] = fn(str));
    };
}

/**
 * Camelize a hyphen-delimited string.
 */
const camelizeRE = /-(\w)/g
const camelize = cached((str) => {
    return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '');
});

const lowerFirst = cached((str: string) => {
    return str.charAt(0).toLowerCase() + str.slice(1);
});

export function isBoolean(o: any): o is boolean {
    return o === true || o === false;
}

function getStyleBinding(style: NonNullable<VNodeData['style']>) {
    if (isArray(style)) {
        return toObject(style);
    }
    if (typeof style === 'string') {
        return parseStyleText(style);
    }

    return style;
}

function toObject(arr: object[]) {
    const res = {};
    for (let i = 0; i < arr.length; i++) {
        if (arr[i]) {
            Object.assign(res, arr[i]);
        }
    }

    return res;
}

const listDelimiter = /;(?![^(]*\))/g;
const propertyDelimiter = /:(.+)/;
const parseStyleText = cached((cssText: string) => {
    const res: Record<string, string> = {};
    cssText.split(listDelimiter).forEach(function (item) {
        if (item) {
            var tmp = item.split(propertyDelimiter);
            tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
        }
    });

    return res;
});
