import {
    ComponentConstructor,
    ComponentClass, 
    Props,
    VNodeComponentClass,
    IntactDom,
    VNode,
    Children,
} from '../utils/types';
import {mount} from '../core/mount';
import {patch} from '../core/patch';
import {unmount} from '../core/unmount';
import {normalizeRoot} from '../core/vnode';
import {EMPTY_OBJ} from '../utils/common';
import {isNull, isFunction, isUndefined, get, set, isObject, isNullOrUndefined, isString} from '../utils/helpers';
import {componentInited, setProps} from '../utils/component';
import {Event} from './event';

// export type Template<T> = (this: T) => Children
export type Template = () => Children;
export type SetOptions = {
    slient: boolean
    // async: false
}

export abstract class Component<P = {}> extends Event implements ComponentClass<P> {
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
        super();

        if (process.env.NODE_ENV !== 'production') {
            // TODO
            // validateProps();
        }
        
        this.$template = (this.constructor as typeof Component).template as Template; 
        this.props = {...this.defaults(), ...props};

        if (isFunction(this.init)) {
            const ret = this.init(props);
            if (ret && ret.then) {
                (ret as Promise<any>).then(() => componentInited(this), err => {
                    if (process.env.NODE_ENV !== 'production') {
                        console.error('Unhandled promise rejection in init: ', err);
                    }
                    componentInited(this);
                });
                return;
            }
        }
        componentInited(this);
    }

    defaults(): P {
        return EMPTY_OBJ;
    }

    set<K extends keyof P>(key: K, value: P[K], options?: SetOptions): void;
    set(key: string, value: any, options?: SetOptions): void;
    set(data: Partial<P> & Record<string, any>, options?: SetOptions): void;
    set(key: string | Record<string, any>, value?: any, options?: SetOptions) {
        if (isObject(key)) {
            options = value as SetOptions;
        } else {
            key = {[key]: value};
        } 

        if (!isUndefined(options) && options.slient) {
            for (let propName in key as P) {
                set(this.props, propName, key[propName]);
            }
            return;
        }

        setProps(this, key, false);
    }

    get(): Props<P, ComponentClass<P>>;
    get<K extends keyof Props<P, ComponentClass<P>>>(key: K): Props<P, ComponentClass<P>>[K]; 
    get<K extends string>(key: K extends keyof Props<P, ComponentClass<P>> ? never : K): any;
    get(key?: any) {
        if (isUndefined(key)) return this.props;

        return get(this.props, key);
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
    protected init?(props: P | null): any;
    protected beforeMount?(lastVNode: VNodeComponentClass | null, nextVNode: VNodeComponentClass): void;
    protected mounted?(lastVNode: VNodeComponentClass | null, nextVNode: VNodeComponentClass): void;
    protected beforeUpdate?(lastVNode: VNodeComponentClass, nextVNode: VNodeComponentClass): void;
    protected updated?(lastVNode: VNodeComponentClass, nextVNode: VNodeComponentClass): void;
    protected beforeUnmount?(vNode: VNodeComponentClass, nextVNode: VNodeComponentClass | null): void;
    protected unmounted?(vNode: VNodeComponentClass, nextVNode: VNodeComponentClass | null): void;
}
