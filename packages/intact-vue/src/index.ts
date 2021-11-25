import {
    Component as IntactComponent,
    Props,
    ComponentClass,
    VNodeComponentClass,
    mount,
    findDomFromVNode,
    IntactDom,
    VNode,
} from 'intact';
import Vue, {ComponentOptions} from 'vue';
import {normalize, isBoolean} from './normalize';
import {noop} from 'intact-shared';
export * from 'intact';

export class Component<P = {}, E = {}, B = {}> extends IntactComponent<P, E, B> implements Vue {
    // If cid does not exist, Vue will treat it as an async component 
    static cid = 'IntactVue';
    // Vue will read props from Constructor's options
    static options = {...(Vue as any).options, inheritAttrs: false};

    static $cid = 'IntactVue';
    static $doubleVNodes = false;

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
    static config: any;
    static version: any;

    public $isVue?: boolean;

    // Properties need by Vue
    private _vnode?: any;
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
            this._vnode = {};
            this.$options = props as ComponentOptions<Vue>;
            this.$options.render = h => {
                // debugger;
                this.$init(vNode.props as Props<P, this>);
                vNode.children = this;
                this.$render(null, vNode, null as any, null, []);
                // mount(vNode, null, null, false, null, [])

                const element = findDomFromVNode(vNode, false) as IntactDom;
                const nativeCreateComment = document.createComment;
                document.createComment = () => {
                    document.createComment = nativeCreateComment;
                    return element as Comment;
                };

                return h();
            };

            Vue.prototype._init.call(this, props);

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
            this._vnode.tag = 'div';

            return this;
        } else {
            super.$mount(lastVNode as any, nextVNode);
        }
    }
}

const prototype = Component.prototype as any;
prototype._render = Vue.prototype._render;
prototype._update = Vue.prototype._update;
prototype.__patch__ = Vue.prototype.__patch__;
// mock api
prototype.$on = noop;
