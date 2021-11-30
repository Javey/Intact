import {
    Component as IntactComponent,
    Props,
    ComponentClass,
    VNodeComponentClass,
    findDomFromVNode,
    IntactDom,
    VNode,
} from 'intact';
import Vue, {ComponentOptions, VNode as VueVNode} from 'vue';
import {normalize, normalizeChildren, isBoolean} from './normalize';
import {noop} from 'intact-shared';
import {functionalWrapper} from './functionalWrapper';
export * from 'intact';

export class Component<P = {}, E = {}, B = {}> extends IntactComponent<P, E, B> implements Vue {
    // If cid does not exist, Vue will treat it as an async component 
    static cid = 'IntactVue';
    // Vue will read props from Constructor's options
    static options = {...(Vue as any).options, inheritAttrs: false};
    // Need by devtools
    static config = Vue.config;

    static $cid = 'IntactVue';
    static $doubleVNodes = false;
    static normalize = normalizeChildren;
    static functionalWrapper = functionalWrapper;

    // hack for VueConstructor
    static extend: any;
    static nextTick: any;
    static set: any;
    static delete: any;
    static directive: any;
    static filter: any;
    static component: any;
    static use: any;
    static mixin: any;
    static compile: any;
    static observable: any;
    static util: any;
    static version: any;

    public $isVue?: boolean;

    // Properties need by Vue
    private _vnode?: VueVNode;
    public $el!: Element;
    public $options!: ComponentOptions<Vue>;
    public $root!: Vue;
    // hack for Vue interface
    public $parent: any;
    public $children!: Vue[];
    public $refs!: any;
    public $slots!: any;
    public $scopedSlots!: any;
    public $isServer!: any;
    public $data!: any;
    // private $props: any;
    public $ssrContext: any;
    public $vnode: any;
    public $attrs: any;
    public $listeners: any;
    // hack methods
    public $forceUpdate: any;
    public $destroy: any;
    public $set: any;
    public $delete: any;
    public $watch: any;
    public $on: any;
    public $once: any;
    public $off: any;
    public $emit: any;
    public $nextTick: any;
    public $createElement: any;
    // private properties on vue
    private _isMounted: any;

    constructor(
        options: any,
        $vNode?: VNodeComponentClass,
        $SVG?: boolean,
        $mountedQueue?: Function[],
        $parent?: ComponentClass | null
    );
    constructor(
        props: Props<P, Component<P>> | null | undefined,
        $vNode: VNodeComponentClass,
        $SVG: boolean,
        $mountedQueue: Function[],
        $parent: ComponentClass | null
    );
    constructor(
        props: Props<P, Component<P>> | null | undefined | ComponentOptions<Vue>,
        $vNode: VNodeComponentClass,
        $SVG: boolean,
        $mountedQueue: Function[],
        $parent: ComponentClass | null
    ) {
        const vnode = props && (props as any)._parentVnode;
        if (vnode) {
            const vNode = normalize(vnode) as VNodeComponentClass<this>;
            super(vNode.props as P, vNode, $SVG, [], $parent || null);

            this.$isVue = true;
            this._vnode = {} as VueVNode;

            this.$options = props as ComponentOptions<Vue>;
            (props as ComponentOptions<Vue>).render = h => {
                // debugger;
                const subTree = h();
                const isDoubleVNodes = (this.constructor as typeof Component).$doubleVNodes;
                subTree.data = {
                    hook: {
                        prepatch: (oldVnode: VueVNode, vnode: VueVNode) => {
                            const vNode = normalize(this.$vnode) as VNodeComponentClass<this>;
                            const lastVNode = this.$vNode;
                            this.$update(lastVNode, vNode, this.$el.parentElement!, null, [], false, true);
                            vNode.children = this;

                            // element may have chagned
                            // only check if the component returns only one vNode
                            if (!isDoubleVNodes) {
                                const element = findDomFromVNode(vNode, true) as IntactDom;
                                if (oldVnode.elm !== element) {
                                    this.$vnode.elm = vnode.elm = oldVnode.elm = element;
                                    // set scope id
                                    // _setScopeId(element);
                                }
                            }
                        }
                    }
                };

                if (!this._isMounted) {
                    const nativeCreateComment = document.createComment;
                    document.createComment = () => {
                        this.$init(vNode.props as Props<P, this>);
                        vNode.children = this;
                        this.$render(null, vNode, null as any, null, []);

                        let element = findDomFromVNode(vNode, true) as any;
                        if (isDoubleVNodes) {
                            const second = findDomFromVNode(vNode, false) as IntactDom;
                            const container = document.createDocumentFragment();
                            container.appendChild(element);
                            container.appendChild(second);
                            element = container;
                        }

                        document.createComment = nativeCreateComment;

                        return element as Comment;
                    };
                } else {
                    // We have make it patchable in $mounted,
                    // set its tag as 'div' to make them to be same vnodes
                    subTree.tag = 'div';
                }

                return subTree;
            };

            Vue.prototype._init.call(this, props);

            // force Vue update Intact component
            (this.$options as any)._renderChildren = true;

            // disable async component 
            this.$inited = true;
        } else {
            super(props as P, $vNode, $SVG, $mountedQueue, $parent);
        }
    }

    $mount(el: Element | undefined, hydrating: boolean): this;
    $mount(lastVNode: VNodeComponentClass<this> | null, nextVNode: VNodeComponentClass<this>): void;
    $mount(
        lastVNode: VNodeComponentClass<this> | null | Element | undefined,
        nextVNode: VNodeComponentClass<this> | boolean,
    ) {
        if (isBoolean(nextVNode)) {
            // called by Vue
            // this.$render(null, this.$vNode, null as any, null, this.$mountedQueue); 
            // this.$el = this.$lastInput!.dom;
            Vue.prototype.$mount.call(this, lastVNode, nextVNode);
            // make it patchable to add native events and setScopeId
            this._vnode!.tag = 'div';

            return this;
        } else {
            super.$mount(lastVNode as any, nextVNode);
        }
    }

    $update(
        lastVNode: VNodeComponentClass<this>,
        nextVNode: VNodeComponentClass<this>,
        parentDom: Element, 
        anchor: IntactDom | null,
        mountedQueue: Function[],
        force: boolean,
        fromPrepatch?: boolean,
    ) {
        if (this.$isVue && !fromPrepatch) {
            const subTree = this.$createElement();
            subTree.tag = 'div';
            subTree.data = this._vnode!.data;
            Vue.prototype._update.call(this, subTree, false); 
        } else {
            super.$update(lastVNode, nextVNode, parentDom, anchor, mountedQueue, force);
        }
    }
}

const prototype = Component.prototype as any;
const vuePrototype = Vue.prototype;
prototype._render = vuePrototype._render;
prototype._update = vuePrototype._update;
prototype.__patch__ = vuePrototype.__patch__;
prototype.$forceUpdate = vuePrototype.$forceUpdate;
prototype.$destroy = vuePrototype.$destroy;
// mock api
prototype.$on = noop;
prototype.$off = noop;

