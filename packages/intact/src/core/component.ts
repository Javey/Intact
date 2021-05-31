import { 
    ComponentClass, 
    Props,
    VNodeComponentClass,
    IntactDom,
    VNode,
    TypeDefs,
    unmount,
} from 'misstime';
import {SetOptions, InjectionKey} from '../utils/types';
import {
    isNull,
    isFunction,
    isUndefined,
    isObject,
    EMPTY_OBJ,
    get,
    set,
    isNullOrUndefined,
} from 'intact-shared';
import {deepFreeze} from '../utils/helpers';
import {
    componentInited, 
    setProps,
    mountProps,
    forceUpdate,
    renderSyncComponnet,
    renderAsyncComponent,
    updateSyncComponent,
    updateAsyncComponent,
} from '../utils/componentUtils';
import {Event} from './event';
import {Template, compile} from 'vdt';
import {watch, WatchOptions} from './watch';

export let currentInstance: Component<any> | null = null;

export function getCurrentInstance() {
    return currentInstance;
}

export abstract class Component<P extends {} = {}> extends Event<P> implements ComponentClass<P> {
    static readonly template: Template | string;
    static readonly defaults = EMPTY_OBJ;
    static readonly typeDefs?: TypeDefs<any>;
    static readonly displayName?: string;

    public props: Props<P, this>;
    public refs: Record<string, any> = {}; 

    // internal properties
    public $SVG: boolean = false;
    public $vNode: VNodeComponentClass<this> | null = null;
    public $lastInput: VNode | null = null;
    public $mountedQueue: Function[] | null = null;
    public $blockRender: boolean = false;
    public $queue: Function[] | null = null;
    public $parent: Component<any> | null = null;
    public $provides: Record<InjectionKey, any> | null = null;

    // lifecyle states
    public $inited: boolean = false;
    public $rendered: boolean = false;
    public $mounted: boolean = false; 
    public $unmounted: boolean = false;

    // private properties
    public $template: Template;

    constructor() {
        super();

        const constructor = this.constructor as typeof Component;
        const template = constructor.template;
        if (isFunction(template)) {
            this.$template = template as Template;
        } else {
            this.$template = compile(template);
        }

        const defaults = constructor.defaults;
        const props = this.props = {} as P;
        if (defaults) {
            for (const key in defaults) {
                const descriptor = Object.getOwnPropertyDescriptor(defaults, key);
                if (descriptor) {
                    if (process.env.NODE_ENV !== 'production') {
                        // maybe frozen
                        if (!descriptor.get) {
                            descriptor.writable = true;
                        }
                    }
                    Object.defineProperty(props, key, descriptor);
                }
            }
        }

        if (process.env.NODE_ENV !== 'production') {
            deepFreeze(defaults);
        }
    }

    set<K extends keyof P>(key: K, value: P[K], options?: SetOptions): void;
    set<K extends string>(key: Exclude<K, keyof P>, value: any, options?: SetOptions): void;
    set<U extends Partial<P>>(data: U, options?: SetOptions): void;
    set<K extends keyof P>(data: Pick<P, K>, options?: SetOptions): void;
    set(key: any, value?: any, options?: SetOptions) {
        if (isObject(key)) {
            options = value as SetOptions;
        } else {
            key = {[key]: value};
        } 

        if (!isUndefined(options) && options.silent) {
            for (let propName in key as P) {
                set(this.props, propName, key[propName]);
            }
            return;
        }

        setProps(this, key);
    }

    get(): Props<P, ComponentClass<P>>;
    get<K extends keyof Props<P, ComponentClass<P>>>(key: K): Props<P, ComponentClass<P>>[K]; 
    get<K extends string>(key: K): any;
    get(key?: any) {
        if (isUndefined(key)) return this.props;

        return get(this.props, key);
    }

    forceUpdate(callback?: Function) {
        if (this.$unmounted) return;
        forceUpdate(this, callback);
    }

    trigger(name: string, ...args: any[]) {
        // call event on props firstly
        const propEvent = (this.props as any)[`ev-${name}`];
        if (isFunction(propEvent) && !this.$unmounted) {
            propEvent.apply(this, args); 
        }

        super.trigger(name, args);
    }


    watch<K extends keyof Props<P, this>>(
        key: K, 
        callback: (newValue: Props<P, this>[K], oldValue: Props<P, this>[K] | undefined) => void,
        options?: WatchOptions 
    ) {
        watch(key, callback, options, this);
    }

    // compute<T>(getter: () => T) {
        // if ((getter as any)._result) return (getter as any)._result;
        
        // const oldGet = this.get;
        // this.get = (...args: any[]) => {
            // oldGet.call(this, ...args);
        // }
        // const result = getter.call(this);
        // (getter as any)._result = result;
        // return result;
    // }

    $init(props: P | null) {
        const parent = this.$parent;
        if (parent !== null) {
            this.$provides = parent.$provides;
        }

        if (isFunction(this.init)) {
            currentInstance = this;
            let triggerReceiveEvents: Function | null = null;
            if (!isNull(props)) {
                triggerReceiveEvents = mountProps(this, props); 
            }

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
            triggerReceiveEvents && triggerReceiveEvents();
            currentInstance = null;
        } else {
            // if it does not exist init method, it is unnecessary to trigger $receive events
            if (!isNull(props)) {
                const defaults = this.props;
                for (const key in props) {
                    const value = props[key];
                    if (!isUndefined(value)) {
                        defaults[key] = value;
                    }
                }
            }
            componentInited(this);
        }
    }

    $render(
        lastVNode: VNodeComponentClass | null,
        nextVNode: VNodeComponentClass,
        parentDom: Element,
        anchor: IntactDom | null,
        mountedQueue: Function[]
    ) {
        if (this.$inited) {
            renderSyncComponnet(this, lastVNode, nextVNode, parentDom, anchor, mountedQueue);
        } else {
            renderAsyncComponent(this, lastVNode, nextVNode, parentDom, anchor, mountedQueue);
        }
    }

    $mount(lastVNode: VNodeComponentClass | null, nextVNode: VNodeComponentClass) {
        this.$mounted = true;

        this.trigger('$mounted', lastVNode, nextVNode);
        if (isFunction(this.mounted)) {
            this.mounted(lastVNode, nextVNode);
        }
    }

    $update(
        lastVNode: VNodeComponentClass,
        nextVNode: VNodeComponentClass,
        parentDom: Element, 
        anchor: IntactDom | null,
        mountedQueue: Function[],
        force: boolean,
    ) {
        if (this.$inited) {
            updateSyncComponent(this, lastVNode, nextVNode, parentDom, anchor, mountedQueue, force);
        } else {
            updateAsyncComponent(this, lastVNode, nextVNode, parentDom, anchor, mountedQueue, force);
        }
    }

    $unmount(vNode: VNodeComponentClass, nextVNode: VNodeComponentClass | null) {
        this.trigger('$beforeUnmount', vNode, nextVNode);
        if (isFunction(this.beforeUnmount)) {
            this.beforeUnmount(vNode, nextVNode);
        }

        unmount(this.$lastInput!); 
        this.$unmounted = true;
        this.trigger('$unmounted', vNode, nextVNode);
        this.off();
        if (isFunction(this.unmounted)) {
            this.unmounted(vNode, nextVNode);
        }
    }

    // lifecycle methods
    init?(props: P | null): any;
    beforeMount?(lastVNode: VNodeComponentClass | null, nextVNode: VNodeComponentClass): void;
    mounted?(lastVNode: VNodeComponentClass | null, nextVNode: VNodeComponentClass): void;
    beforeUpdate?(lastVNode: VNodeComponentClass, nextVNode: VNodeComponentClass): void;
    updated?(lastVNode: VNodeComponentClass, nextVNode: VNodeComponentClass): void;
    beforeUnmount?(vNode: VNodeComponentClass, nextVNode: VNodeComponentClass | null): void;
    unmounted?(vNode: VNodeComponentClass, nextVNode: VNodeComponentClass | null): void;
}
