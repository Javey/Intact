import {
    ComponentClass,
    Props,
    VNodeComponentClass,
    VNode,
    IntactDom,
    removeVNodeDom,
    createVNode
} from 'intact';
import {
    VNode as VueVNode,
    createApp,
    h,
    getCurrentInstance,
    KeepAlive,
    RendererElement,
    RendererNode,
    ComponentInternalInstance,
    SuspenseBoundary,
    cloneVNode,
    defineComponent,
    provide,
    createVNode as createVueVNode,
} from 'vue';
import type {Component} from './';
import { noop, hasDocumentAvailable } from 'intact-shared';

type PatchFn = (
    n1: VueVNode | null, // null means this is a mount
    n2: VueVNode,
    container: RendererElement,
    anchor?: RendererNode | null,
    parentComponent?: ComponentInternalInstance | null,
    parentSuspense?: SuspenseBoundary | null,
    isSVG?: boolean,
    slotScopeIds?: string[] | null,
    optimized?: boolean
) => void;

type UnmountFn = (
    vnode: VueVNode,
    parentComponent: ComponentInternalInstance | null,
    parentSuspense: SuspenseBoundary | null,
    doRemove?: boolean,
    optimized?: boolean
) => void;

// we must use this hack method to get patch function
let internals: {p: PatchFn, um: UnmountFn} = { p: noop, um: noop };
if (hasDocumentAvailable) {
    createApp({
        render() {
            return h(KeepAlive, null, h(function() {
                const instance = getCurrentInstance() as any;
                internals = instance.parent.ctx.renderer;
            }));
        }
    }).mount(document.createElement('div'));
}
const {p: patch, um: unmount} = internals;

export interface WrapperProps {
    vnode: VueVNode
}

export const INTACT_PARENT_KEY = '$intactParent' + Math.random();

const Provider = defineComponent({
    setup(props, { slots }) {
        provide(INTACT_PARENT_KEY, props.value);

        return () => props.vnode; 
    },
    props: {
        value: { required: true },
        vnode: { required: true },
    },
});

export class Wrapper implements ComponentClass<WrapperProps> {
    public $inited: boolean = true;
    public $lastInput: VNode = createVNode('div');

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
            removeVNodeDom(lastVNode, parentDom);
        } else if (!parentDom) {
            parentDom = document.createDocumentFragment() as any; 
        }
        const vnode = getVueVNode(vNode, this);
        patch(null, vnode, parentDom, anchor, getParent(this), null, this.$SVG);

        // add dom to the $lastInput for findDomFromVNode
        this.$lastInput.dom = vnode.el as IntactDom;
    }

    $update(
        lastVNode: VNodeComponentClass,
        vNode: VNodeComponentClass,
        parentDom: Element,
        anchor: IntactDom | null,
        // mountedQueue: Function[],
        // force: boolean
    ): void {
        const {providerVnode: lastVnode} = lastVNode.props!;
        const nextVnode = getVueVNode(vNode, this);
        patch(lastVnode, nextVnode, parentDom, anchor, getParent(this), null, this.$SVG);

        this.$lastInput.dom = nextVnode.el as IntactDom;
    }

    $unmount(
        vNode: VNodeComponentClass,
        nextVNode: VNodeComponentClass | null
    ): void  {
        unmount(vNode.props!.providerVnode, getParent(this), null, !!nextVNode);
    }
}

function getParent(instance: Wrapper) {
    const senior = instance.$senior as Component;
    let $senior = senior;

    do {
        const vueInstance = $senior.vueInstance;
        if (vueInstance) {
            // (vueInstance as any).fakeInstance = senior;
            return vueInstance;
        }
    } while ($senior = $senior.$senior as Component);

    // should not hit this
    /* istanbul ignore next */
    return null
}

function getVueVNode(vNode: VNode, instance: Wrapper) {
    const props = vNode.props!;
    let vnode = props.vnode;
    // if we are reusing the vNode, clone it
    let hasCloned = false;
    if (vnode.el) {
        vnode = cloneVNode(vnode);
        hasCloned = true;
    }
    
    let shouldAssign = true;
    for (let key in props) {
        if (key === 'vnode' || key === 'providerVnode') continue;
        // clone the vnode at first
        if (!hasCloned) {
            vnode = cloneVNode(vnode);
            hasCloned = true;
        }

        let _props = vnode.props;
        if (shouldAssign) {
            // props may be a EMPTY_OBJ, but we can not get its reference,
            // so we use a flag to handle it
            _props = vnode.props = {..._props};
            shouldAssign = false;
            // should change patchFlag to let Vue full diff props
            vnode.patchFlag |= 16;
        }
        const value = props[key];
        // is event
        if (key === 'className') {
            _props.class = value;
        // } else if (key === 'style') {
            // _props.style = {..._props.style, ...value};
        } else if (key.substr(0, 3) === 'ev-') {
            const name = key.substr(3);
            _props[`on` + name[0].toUpperCase() + name.substr(1)] = value;
        } else {
            _props[key] = value;
        }
    }

    const providerVnode = createVueVNode(Provider, { value: instance.$senior, vnode });
    vNode.props = {...props, vnode, providerVnode};

    // return h(Provider, { value: instance.$senior }, vnode);
    return providerVnode;
}
