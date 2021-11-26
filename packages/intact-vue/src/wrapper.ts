import {
    ComponentClass,
    Props,
    VNodeComponentClass,
    VNode,
    IntactDom,
    removeVNodeDom,
    createVNode
} from 'intact';
import Vue, {
    VNode as VueVNode,
} from 'vue';
import type {Component} from './';

export interface WrapperProps {
    vnode: VueVNode
}

const _textVNode = Vue.prototype._v('');
const VueVNode = _textVNode.constructor;
const patch = Vue.prototype.__patch__;

export class Wrapper implements ComponentClass<WrapperProps> {
    public $inited: boolean = true;
    public $lastInput: VNode = createVNode('div');

    constructor(
        public $props: Props<WrapperProps, ComponentClass<WrapperProps>>,
        public $vNode: VNodeComponentClass<ComponentClass<WrapperProps>>,
        public $SVG: boolean,
        public $mountedQueue: Function[],
        public $parent: ComponentClass | null,
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
            removeVNodeDom(lastVNode, parentDom);
        } else if (!parentDom) {
            parentDom = document.createDocumentFragment() as any; 
        }

        const vnode = getVueVNode(vNode);
        const dom = patch(null, vnode, false, false);
        parentDom.appendChild(dom);

        // add dom to the $lastInput for findDomFromVNode
        this.$lastInput.dom = dom;
    }

    $update(
        lastVNode: VNodeComponentClass,
        vNode: VNodeComponentClass,
        parentDom: Element,
        anchor: IntactDom | null,
        // mountedQueue: Function[],
        // force: boolean
    ): void {
        debugger;
        // const {vnode: lastVnode} = lastVNode.props!;
        // const nextVnode = getVueVNode(vNode);
        // patch(lastVnode, nextVnode, parentDom, anchor, getParent(this), null, this.$SVG);

        // this.$lastInput.dom = nextVnode.el;
    }

    $unmount(
        vNode: VNodeComponentClass,
        nextVNode: VNodeComponentClass | null
    ): void  {
        // unmount(vNode.props!.vnode, getParent(this), null, !!nextVNode);
    }
}

function getParent(instance: Wrapper) {
    let $parent = instance.$parent as Component;

    do {
        return $parent;
        // const vueInstance = $parent.vueInstance;
        // if (vueInstance) {
            // return vueInstance;
        // }
    } while ($parent = $parent.$parent as Component);

    // should not hit this
    /* istanbul ignore next */
    return null
}

function getVueVNode(vNode: VNode) {
    const props = vNode.props!;
    let vnode = props.vnode;
    // if we reuse the vNode, clone it
    if (vnode.el) {
        vnode = cloneVNode(vnode);
    }
    
    for (let key in props) {
        if (key === 'vnode') continue;
        if (!vnode.data) vnode.data = {};

        const data = vnode.data;
        const value = props[key];

        if (key === 'className') {
            data.staticClass = value;
            delete data.class;
        } else if (key.substr(0, 3) === 'ev-') {
            if (!data.on) data.on = {};
            data.on[key.substr(3)] = value;
        } else {
            if (!data.attrs) data.attrs = {};
            data.attrs[key] = value;
        }
    }

    vNode.props = {...props, vnode};

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
        vnode.elm,
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
