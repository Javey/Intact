import {
    ComponentClass,
    Props,
    VNodeComponentClass,
    VNode,
    IntactDom,
    removeVNodeDom,
    createVNode,
    insertOrAppend,
    findDomFromVNode,
} from 'intact';
import Vue, {
    VNode as VueVNode,
} from 'vue';
import type {Component} from './';

export interface WrapperProps {
    vnode: VueVNode
}

type Patch = (oldVnode: VueVNode | null, vnode: VueVNode | null, hydrating: boolean, removeOnly: boolean) => Element;

const _textVNode = Vue.prototype._v('');
const VueVNode = _textVNode.constructor;
const patch = Vue.prototype.__patch__ as Patch;

export class Wrapper implements ComponentClass<WrapperProps> {
    public $inited: boolean = true;
    public $lastInput: VNode = createVNode('fake-div');

    constructor(
        public $props: Props<WrapperProps, ComponentClass<WrapperProps>>,
        public $vNode: VNodeComponentClass<ComponentClass<WrapperProps>>,
        public $SVG: boolean,
        public $mountedQueue: Function[],
        public $senior: ComponentClass | null,
    ) { }

    $init(props: WrapperProps | null): void { }

    $render(
        lastVNode: VNodeComponentClass | null,
        vNode: VNodeComponentClass,
        parentDom: Element,
        anchor: IntactDom | null,
        // mountedQueue: Function[]
    ): void {
        if (lastVNode) {
            anchor = findDomFromVNode(lastVNode, true)!.nextSibling as IntactDom;
            removeVNodeDom(lastVNode, parentDom);
        } else if (!parentDom) {
            parentDom = document.createDocumentFragment() as any; 
        }

        const vnode = getVueVNode(this, vNode);

        const dom = this.patch(null, vnode);
        insertOrAppend(parentDom, dom, anchor);
    }

    $update(
        lastVNode: VNodeComponentClass,
        vNode: VNodeComponentClass,
        parentDom: Element,
        anchor: IntactDom | null,
        // mountedQueue: Function[],
        // force: boolean
    ): void {
        // debugger;
        const {vnode: lastVnode} = lastVNode.props!;
        const nextVnode = getVueVNode(this, vNode);
        this.patch(lastVnode, nextVnode);
    }

    $unmount(
        vNode: VNodeComponentClass,
        nextVNode: VNodeComponentClass | null
    ): void  {
        // unmount(vNode.props!.vnode, getParent(this), null, !!nextVNode);
        patch(vNode.props!.vnode, null, false, false);
    }

    private patch(lastVnode: VueVNode | null, nextVnode: VueVNode) {
        const realNextVnode = nextVnode;
        if (lastVnode) {
            // fake a parent vnode to let vue patch the children
            const realLastVnode = lastVnode;
            lastVnode = new VueVNode('div', null, [realLastVnode], null, lastVnode.elm!.parentElement);
            lastVnode!.parent = realLastVnode.parent; 
            nextVnode = new VueVNode('div', null, [realNextVnode]);
            nextVnode.parent = realNextVnode.parent;
        }
        patch(lastVnode, nextVnode, false, false);
        const parent = nextVnode.parent!;
        const data = parent.data as any;
        if (data.pendingInsert && data.pendingInsert !== data.queue) {
            /**
             * Every time we call patch function, it will create a insertedQueue
             * and assign it to parent.data.pendingInsert. If the parent has multiple
             * Wrapper elements, the pendingInsert will be overwrite by next Wrapper.
             * So will should store the queue
             */
            const queue = data.queue || (data.queue = []);
            queue.push.apply(queue, data.pendingInsert);
            // maybe the pendingInsert has been overwrite
            data.pendingInsert = queue;
        }

        // add dom to the $lastInput for findDomFromVNode
        const lastInput = this.$lastInput;
        const dom = realNextVnode.elm as Element;
        lastInput.dom = dom;
        lastInput.type |= 8192 /* InUse */

        return dom;
    }
}

function getParentNode(instance: Wrapper) {
    let $senior = instance.$senior as Component;

    do {
        const $vnode = $senior.$vnode;
        if ($vnode) {
            return $vnode;
        }
    } while ($senior = $senior.$senior as Component);

    // should not hit this
    /* istanbul ignore next */
    return null
}

function getVueVNode(instance: Wrapper, vNode: VNode): VueVNode {
    const props = vNode.props!;
    let vnode = props.vnode;
    // if we are reusing the vNode, clone it
    let hasCloned = false;
    if (vnode.elm) {
        vnode = cloneVNode(vnode);
        hasCloned = true;
    }
    
    for (let key in props) {
        if (key === 'vnode') continue;
        // clone the vnode at first
        if (!hasCloned) {
            vnode = cloneVNode(vnode);
            hasCloned = true;
        }

        if (!vnode.data) {
            vnode.data = {};
        } else {
            vnode.data = {...vnode.data};
        }

        const data = vnode.data;
        const value = props[key];

        if (key === 'className') {
            data.staticClass = value;
            // should not delete the class, it is the dynamic classNames
            // delete data.class;
        } else if (key.substr(0, 3) === 'ev-') {
            if (!data.on) {
                data.on = {};
            } else {
                data.on = {...data.on};
            }
            data.on[key.substr(3)] = value;
        } else {
            if (!data.attrs) {
                data.attrs = {};
            } else {
                data.attrs = {...data.attrs};
            }
            data.attrs[key] = value;
        }
    }

    vNode.props = {...props, vnode};
    vnode.parent = getParentNode(instance);

    return vnode;
}

// copy from vue/src/core/vdom/vnode.js
function cloneVNode(vnode: VueVNode) {
    var cloned = new VueVNode(
        vnode.tag,
        // clone data
        vnode.data ? {...vnode.data} : vnode.data,
        // #7975
        // clone children array to avoid mutating original in case of cloning
        // a child.
        vnode.children && vnode.children.slice(),
        vnode.text,
        // vnode.elm,
        null,
        vnode.context,
        vnode.componentOptions,
        (vnode as any).asyncFactory
    );
    cloned.ns = vnode.ns;
    cloned.isStatic = vnode.isStatic;
    cloned.key = vnode.key;
    cloned.isComment = vnode.isComment;
    cloned.fnContext = (vnode as any).fnContext;
    cloned.fnOptions = (vnode as any).fnOptions;
    cloned.fnScopeId = (vnode as any).fnScopeId;
    cloned.asyncMeta = (vnode as any).asyncMeta;
    cloned.isCloned = true;
    return cloned
}
