import {
    VNode,
    createComponentVNode,
    TypeDefs,
    Key,
    TypePrimitive,
    TypeObject,
    Blocks
} from 'intact';
import {
    VNode as VueVNode,
    Comment,
    Fragment,
    VNodeNormalizedChildren,
    camelize,
    VNodeArrayChildren,
    isVNode,
    VNodeChild,
    vShow,
    isRef,
    Text,
} from 'vue';
import {Wrapper} from './wrapper';
import type {IntactComponentOptions} from './';
import {
    isArray,
    EMPTY_OBJ,
    hasOwn,
    isStringOrNumber,
    isInvalid,
    isFunction,
    isString
} from 'intact-shared';

type EventValue = Function | Function[]
type TypeDefValue = TypePrimitive | TypePrimitive[] | TypeObject
type VNodeChildAtom = Exclude<VNodeChild, VNodeArrayChildren | void>
export type VNodeAtom = VNode | null | undefined | string | number;

export function normalize(vnode: VNodeChildAtom | VNode): VNodeAtom {
    if (isInvalid(vnode)) return null;
    if (isStringOrNumber(vnode) || isIntactVNode(vnode)) return vnode;

    const type = vnode.type;
    let vNode: VNode;

    if (isIntactComponent(vnode)) {
        const props = normalizeProps(vnode);
        vNode = createComponentVNode(
            4,
            (type as IntactComponentOptions).Component,
            props,
            vnode.key as Key,
            props.ref
        );
    } else {
        // ignore comment vNode
        if (type === Comment) return null;
        if (type === Text) return vnode.children as string;
        // spread fragment
        // if (type === Fragment) {
            // return normalizeChildren(vnode.children as VNodeArrayChildren);
        // }

        vNode = createComponentVNode(4, Wrapper, {vnode}, vnode.key as Key);
    }

    // tell Vue that this is a read only object, and don't make it reactive
    (vNode as any).__v_isReadonly = true;

    return vNode;
}

export function isIntactComponent(vnode: VueVNode) {
    return !!(vnode.type as IntactComponentOptions).Component;
}

function isIntactVNode(vNode: any): vNode is VNode {
    return 'childrenType' in vNode;
}

export function normalizeChildren(vNodes: VNodeArrayChildren | VNodeChildAtom) {
    const loop = (vNodes: VNodeArrayChildren | VNodeChildAtom): VNodeAtom[] | VNodeAtom => {
        if (Array.isArray(vNodes)) {
            const ret: VNodeAtom[] = [];
            vNodes.forEach(vNode => {
                if (Array.isArray(vNode)) {
                    ret.push(...loop(vNode) as VNodeAtom[]);
                } else if (isVNode(vNode)) {
                    ret.push(normalize(vNode));
                }
            });
            return ret;
        }
        return normalize(vNodes);
    }
    const ret = loop(vNodes);
    if (Array.isArray(ret)) {
        const l = ret.length;
        return l === 0 ? undefined : l === 1 ? ret[0] : ret;
    }
    return ret;
}

export function normalizeProps(vnode: VueVNode) {
    const attrs = vnode.props;
    const slots = vnode.children;
    const Component = (vnode.type as IntactComponentOptions).Component;
    const props: any = {};
    const propTypes = Component.typeDefs;

    for (let key in attrs) {
        let value = attrs[key];
        switch (key) {
            case 'ref': break;
            case 'class':
                props.className = value;
                break;
            case 'modelValue':
                props.value = value;
                break;
            default:
                if (isOn(key)) {
                    normalizeEvents(props, key, value);
                    break;
                }
                if (propTypes) {
                    const camelizedKey = camelize(key);

                    if (hasOwn.call(propTypes, camelizedKey)) {
                        value = normalizeBoolean(propTypes, key, camelizedKey, value);
                        key = camelizedKey;
                    }
                }
                props[key] = value;
                break;
        }
    }

    normalizeSlots(slots, props);
    normalizeDirs(vnode.dirs, props);
    normalizeRef(vnode.ref, props);

    return props;
}

const onRE = /^on[^a-z]/;
const isOn = (key: string) => onRE.test(key);

function normalizeEvents(props: any, key: string, value: EventValue) {
    let name;
    let cb = value;
    const _isArray = isArray(value);
    const changeCallback = (propName: string) => (v: any) => {
        const modifiersKey = `${propName === 'value' ? 'model' : propName}Modifiers`;
        const {number, trim} = props[modifiersKey] || EMPTY_OBJ;
        if (trim) {
            v = String(v).trim();
        } else if (number) {
            v = Number(v);
        }
        if (_isArray) {
            (value as Function[]).forEach(value => value(v))
        } else {
            (value as Function)(v);
        }
    };

    if (key.startsWith('onUpdate:')) {
        let propName = camelize(key.substr(9));
        if (propName === 'modelValue') propName = 'value';
        name = `$model:${propName}`;
        cb = changeCallback(propName);
    } else {
        key = key.substring(2);
        if (key.startsWith('Change:')) {
            // onChange:name -> ev-$change:name
            name = `$change:${key.substring(7)}`;
        } else {
            // onClick -> ev-click
            // onChange -> ev-change
            if (key === 'Change') {
                name = 'change';
            } else if (key.startsWith('Change')) {
                // e.g. onChangeValue -> ev-$change:value
                // e.g. onChangePropName -> ev-$change:propName
                name = `$change:${key[6].toLowerCase() + key.substring(7)}`;
            } else {
                name = key[0].toLowerCase() + key.substring(1);
            }
        }
        if (_isArray) {
            cb = (...args: any[]) => {
                (value as Function[]).forEach(value => value(...args))
            }
        } 
    }

    props[`ev-${name}`] = cb;
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

function normalizeSlots(slots: VNodeNormalizedChildren, props: any) {
    if (!slots) return;

    // is array children
    if (isArray(slots)) {
        return props.children = normalizeChildren(slots);
    }

    // is string
    if (isStringOrNumber(slots)) {
        return props.children = slots;
    }

    // the default slot maybe a scope slot, but we can not detect
    // whether it is or not, so we try to normalize it as children and
    // then treat it as a default scope slot too.
    if (slots.default) {
        const slot = slots.default as () => VueVNode[];
        try {
            // Vue will detect whether the slot is invoked outside or not,
            // but it does not affetch anything in here,
            // so we keep the warning silent
            //
            // Vue will warn if we get property of undefined, we keep it silent
            // silentWarn();
            const validSlotContent = ensureValidVNode(slot());
            props.children = validSlotContent ? normalizeChildren(validSlotContent) : null;
            // resetWarn();
        } catch (e) {  }
    }

    let blocks: Blocks | null = null;
    for (const key in slots) {
        if (isInternalKey(key)) continue;
        const slot = slots[key] as (data: any) => VueVNode[];
        if (!blocks) blocks = {};
        blocks[key] = function(parent, data) {
            // if the content is invalid, use parent instead
            // this is the default behavior of Vue
            const validSlotContent = ensureValidVNode(slot(data));
            return validSlotContent ? normalizeChildren(validSlotContent) : parent();
        };
    }
    if (blocks) {
        props.$blocks = blocks;
    }
}

function ensureValidVNode(vnodes: VNodeArrayChildren){
    if (!isArray(vnodes)) vnodes = [vnodes];
    return vnodes.some(child => {
        if (!isVNode(child)) {
            return true;
        }
        if (child.type === Comment) {
            return false;
        }
        if (child.type === Fragment && !ensureValidVNode(child.children as VNodeArrayChildren)) {
            return false;
        }
        return true;
    }) ? vnodes : null;
}

const isInternalKey = (key: string) => key[0] === '_' || key === '$stable';

function normalizeDirs(dirs: VueVNode['dirs'], props: any) {
    if (!dirs) return;

    dirs.find(({dir, value}) => {
        // only handle v-show
        if (dir === vShow) {
            if (!value) {
                (props.style || (props.style = {})).display = 'none';
            }
            return true;
        }
    });
}

function normalizeRef(rawRef: VueVNode['ref'], props: any) {
    if (isFunction(rawRef)) props.ref = rawRef;
    else if (rawRef) {
        props.ref = (i: any) => {
            setRef(rawRef, i);
        }
    }
}

function setRef(rawRef: NonNullable<VueVNode['ref']>, value: any) {
    if (isArray(rawRef)) {
        rawRef.forEach((r, i) => setRef(r, value));
        return;
    }
    const {i: owner, r: ref} = rawRef;
    const refs = !Object.keys(owner.refs).length ? (owner.refs = {}) : owner.refs;
    if (isString(ref)) {
        refs[ref] = value;
    } else if (isRef(ref)) {
        ref.value = value;
    } else if (isFunction(ref)) {
        ref(value, refs);
    } else {
        console.warn('Invalid template ref type:', value, `(${typeof value})`);
    }
}
