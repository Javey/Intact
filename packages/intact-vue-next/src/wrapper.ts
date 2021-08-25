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
} from 'vue';
import type {Component} from './';

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
let internals: {p: PatchFn, um: UnmountFn};
createApp({
    render() {
        return h(KeepAlive, null, h(function() {
            const instance = getCurrentInstance() as any;
            internals = instance.parent.ctx.renderer;
        }));
    }
}).mount(document.createElement('div'));
const {p: patch, um: unmount} = internals!;

export interface WrapperProps {
    vnode: VueVNode
}

export class Wrapper implements ComponentClass<WrapperProps> {
    public $inited: boolean = true;
    public $lastInput: VNode = createVNode('div');

    constructor(
        public props: Props<WrapperProps, ComponentClass<WrapperProps>>,
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
        const {vnode} = vNode.props!;
        patch(null, vnode, parentDom, anchor, getParent(this), null, this.$SVG);

        // add dom to the $lastInput for findDomFromVNode
        this.$lastInput.dom = vnode.el;
    }

    $update(
        lastVNode: VNodeComponentClass,
        vNode: VNodeComponentClass,
        parentDom: Element,
        anchor: IntactDom | null,
        // mountedQueue: Function[],
        // force: boolean
    ): void {
        const {vnode: lastVnode} = lastVNode.props!;
        const {vnode: nextVnode} = vNode.props!;
        patch(lastVnode, nextVnode, parentDom, anchor, getParent(this), null, this.$SVG);

        this.$lastInput.dom = nextVnode.el;
    }

    $unmount(
        vNode: VNodeComponentClass,
        nextVNode: VNodeComponentClass | null
    ): void  {
        unmount(vNode.props!.vnode, getParent(this), null, !!nextVNode);
    }
}

function getParent(instance: Wrapper) {
    let $parent = instance.$parent as Component;

    do {
        const vueInstance = $parent.vueInstance;
        if (vueInstance) {
            return vueInstance;
        }
    } while ($parent = $parent.$parent as Component);

    // should not hit this
    /* istanbul ignore next */
    return null
}
