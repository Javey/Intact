import {
    ComponentConstructor,
    ComponentClass, 
    Props,
    VNodeComponentClass,
    IntactDom,
    VNode,
    Children,
} from '../utils/types';
import {mount} from './mount';
import {patch} from './patch';
import {unmount} from './unmount';
import {normalizeRoot} from './vnode';
import {EMPTY_OBJ} from '../utils/common';
import {isNull, isFunction} from '../utils/helpers';
import {componentInited} from '../utils/component';

// export type Template<T> = (this: T) => Children
export type Template = () => Children;

export abstract class Component<P = {}> implements ComponentClass<P> {
    static readonly template: Template | string;
    static readonly propTypes?: Record<string, any>;
    static readonly displayName?: string;

    public props: Props<P, ComponentClass<P>>;
    public refs: Record<string, any> = {}; 

    // internal properties
    public $SVG: boolean = false;
    public $lastInput: VNode | null = null;
    public $mountedQueue: Function[] | null = null;

    // lifecyle states
    public $inited: boolean = false;
    public $rendered: boolean = false;
    public $mounted: boolean = false; 
    public $unmounted: boolean = false;

    // private properties
    private $template: Template;

    constructor(props: P | null) {
        if (process.env.NODE_ENV !== 'production') {
            // TODO
            // validateProps();
        }
        
        this.$template = (this.constructor as typeof Component).template as Template; 
        this.props = {...this.defaults(), ...props};

        this.initialize(props);
    }

    defaults(): P {
        return EMPTY_OBJ;
    }

    protected initialize(props: P | null) {
        if (isFunction(this.init))  {
            const ret = this.init(props);
            if (ret && ret.then) {
                (ret as Promise<any>).then(() => componentInited(this), err => {
                    if (process.env.NODE_ENV !== 'production') {
                        console.error('Unhandled promise rejection in init: ', err);
                    }
                    componentInited(this);
                });
            } else {
                componentInited(this);
            }
        } else {
            componentInited(this);
        }
    } 


    $render(lastVNode: VNodeComponentClass | null, nextVNode: VNodeComponentClass, parentDom: Element, anchor: IntactDom | null) {
        if (isFunction(this.beforeMount)) {
            this.beforeMount(lastVNode, nextVNode);
        }

        const vNode = this.$lastInput = normalizeRoot(this.$template());

        // reuse the dom even if they are different
        let lastInput: VNode | null = null;
        if (!isNull(lastVNode) && (lastInput = lastVNode.children!.$lastInput)) {
            patch(lastInput, vNode, parentDom, this.$SVG, anchor, this.$mountedQueue!);
        } else {
            mount(vNode, parentDom, this.$SVG, anchor, this.$mountedQueue!);
        }

        this.$rendered = true;

        // if (isFunction(this.beforeMount)) {
            // this.beforeMount(lastVNode, nextVNode);
        // }
    }

    $mount(lastVNode: VNodeComponentClass | null, nextVNode: VNodeComponentClass) {
        this.$mounted = true;

        if (isFunction(this.mounted)) {
            this.mounted(lastVNode, nextVNode);
        }
    }

    $update(lastVNode: VNodeComponentClass, nextVNode: VNodeComponentClass, parentDom: Element, anchor: IntactDom | null) {
        if (isFunction(this.beforeUpdate)) {
            this.beforeUpdate(lastVNode, nextVNode);
        }

        this.props = nextVNode.props || EMPTY_OBJ;
        const vNode = normalizeRoot(this.$template());
        patch(this.$lastInput!, vNode, parentDom, this.$SVG, anchor, this.$mountedQueue!);
        this.$lastInput = vNode;

        if(isFunction(this.updated)) {
            this.$mountedQueue!.push(() => {
                this.updated!(lastVNode, nextVNode);
            });
        }
    }

    $unmount(vNode: VNodeComponentClass, nextVNode: VNodeComponentClass | null) {
        if (isFunction(this.beforeUnmount)) {
            this.beforeUnmount(vNode, nextVNode);
        }

        unmount(this.$lastInput!); 
        this.$unmounted = true;

        if (isFunction(this.unmounted)) {
            this.unmounted(vNode, nextVNode);
        }
    }

    // lifecycle methods
    init?(props: P | null): any;
    // created?(lastVNode: VNodeComponentClass | null, nextVNode: VNodeComponentClass): void;
    beforeMount?(lastVNode: VNodeComponentClass | null, nextVNode: VNodeComponentClass): void;
    mounted?(lastVNode: VNodeComponentClass | null, nextVNode: VNodeComponentClass): void;
    beforeUpdate?(lastVNode: VNodeComponentClass, nextVNode: VNodeComponentClass): void;
    updated?(lastVNode: VNodeComponentClass, nextVNode: VNodeComponentClass): void;
    beforeUnmount?(vNode: VNodeComponentClass, nextVNode: VNodeComponentClass | null): void;
    unmounted?(vNode: VNodeComponentClass, nextVNode: VNodeComponentClass | null): void;
}
