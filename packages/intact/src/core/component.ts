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
    throwError,
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

export function useInstance() {
    return currentInstance;
}

export function setInstance(instance: Component<any> | null) {
    currentInstance = instance;
}

type NoInfer<T> = [T][T extends any ? 0 : never];

export abstract class Component<P extends {} = {}> extends Event<P> implements ComponentClass<P> {
    static readonly template: Template | string;
    static readonly defaults: () => object = () => ({});
    static readonly typeDefs?: TypeDefs<any>;
    static readonly displayName?: string;

    public refs: Record<string, any> = {}; 

    public $props: Props<P, this>;
    public $SVG: boolean = false;
    public $vNode: VNodeComponentClass<this>;
    public $parent: Component<any> | null;
    public $mountedQueue: Function[];

    // internal properties
    // public $SVG: boolean = false;
    // public $vNode: VNodeComponentClass<this> | null = null;
    public $lastInput: VNode | null = null;
    // public $mountedQueue: Function[] | null = null;
    public $blockRender: boolean = false;
    public $queue: Function[] | null = null;
    // public $parent: Component<any> | null = null;
    public $provides: Record<InjectionKey, any> | null = null;

    // lifecyle states
    public $inited: boolean = false;
    public $rendered: boolean = false;
    public $mounted: boolean = false; 
    public $unmounted: boolean = false;

    // public properties
    public $template: Template;

    // should trigger recieve events on initializing or not
    private triggerReceiveEvents: Function | null = null;

    constructor(
        props: Props<P, Component<P>> | null | undefined,
        $vNode: VNodeComponentClass,
        $SVG: boolean,
        $mountedQueue: Function[],
        $parent: ComponentClass | null,
    ) {
        super();

        currentInstance = this;

        this.$vNode = $vNode as VNodeComponentClass<this>;
        this.$SVG = $SVG;
        this.$mountedQueue = $mountedQueue;
        this.$parent = $parent as Component<any>;

        const constructor = this.constructor as typeof Component;
        const template = constructor.template;
        if (isFunction(template)) {
            this.$template = template as Template;
        } else {
            this.$template = compile(template);
        }

        this.$props = constructor.defaults() as P;

        if ($parent !== null) {
            this.$provides = ($parent as Component<any>).$provides;
        }

        if (!isNullOrUndefined(props)) {
            // should mount props in contructor, because we may get props on hooks
            // that initialize in constructor.
            this.triggerReceiveEvents = mountProps(this, props); 
        }

        // if (isFunction(this.init)) {
            // const ret = this.init(props);
            // if (ret && ret.then) {
                // (ret as Promise<any>).then(() => componentInited(this, triggerReceiveEvents), err => {
                    // if (process.env.NODE_ENV !== 'production') {
                        // console.error('Unhandled promise rejection in init: ', err);
                    // }
                    // componentInited(this, triggerReceiveEvents);
                // });
            // } else {
                // componentInited(this, triggerReceiveEvents);
            // }
        // } else {
            // componentInited(this, triggerReceiveEvents);
        // }
    }

    $init(props: Props<P, this> | null) {
        // if (isFunction(this.init)) {
            const triggerReceiveEvents = this.triggerReceiveEvents;

            if (isFunction(this.init)) {
                const ret = this.init(props);
                if (ret && ret.then) {
                    (ret as Promise<any>).then(() => componentInited(this, triggerReceiveEvents), err => {
                        if (process.env.NODE_ENV !== 'production') {
                            console.error('Unhandled promise rejection in init: ', err);
                        }
                        componentInited(this, triggerReceiveEvents);
                    });
                } else {
                    componentInited(this, triggerReceiveEvents);
                }
            } else {
                componentInited(this, triggerReceiveEvents);
            }
        // } else {
            // if it does not exist init method, it is unnecessary to trigger $receive events
            // @MODIFY: maybe init in constructor
            // if (!isNull(props)) {
                // const defaults = this.props;
                // for (const key in props) {
                    // const value = props[key];
                    // if (!isUndefined(value)) {
                        // defaults[key] = value;
                    // }
                // }
            // }
            // componentInited(this, null);
        // }

        currentInstance = null;
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
        /* istanbul ignore next */
        if (process.env.NODE_ENV !== 'production') {
            if (this.$unmounted) {
                throwError(
                    'You are unmounting a component that has already been unmounted. ' + 
                    'Maybe this is a bug of Intact or it has crashed, open an issue please.'
                );
            }
        }

        this.trigger('$beforeUnmount', vNode, nextVNode);
        if (isFunction(this.beforeUnmount)) {
            this.beforeUnmount(vNode, nextVNode);
        }

        // if (isNull(nextVNode)) {
            // if nextVNode exists, we will unmount it on $render
            unmount(this.$lastInput!, null);
        // }
        
        this.$unmounted = true;
        this.trigger('$unmounted', vNode, nextVNode);
        this.off();
        if (isFunction(this.unmounted)) {
            this.unmounted(vNode, nextVNode);
        }
    }

    // lifecycle methods
    init?(props: Props<P, Component<P>> | null | undefined): any;
    beforeMount?(lastVNode: VNodeComponentClass | null, nextVNode: VNodeComponentClass): void;
    mounted?(lastVNode: VNodeComponentClass | null, nextVNode: VNodeComponentClass): void;
    beforeUpdate?(lastVNode: VNodeComponentClass, nextVNode: VNodeComponentClass): void;
    updated?(lastVNode: VNodeComponentClass, nextVNode: VNodeComponentClass): void;
    beforeUnmount?(vNode: VNodeComponentClass, nextVNode: VNodeComponentClass | null): void;
    unmounted?(vNode: VNodeComponentClass, nextVNode: VNodeComponentClass | null): void;

    set<K extends keyof P>(key: K, value: P[K], options?: SetOptions): void;
    set<T, K extends keyof T = keyof T>(key: K, value: T[K], options?: SetOptions): void;
    set<T = void>(key: string, value: NoInfer<T>, options?: SetOptions): void;
    set<K extends keyof P>(data: Pick<P, K>, options?: SetOptions): void;
    set<T = void>(data: Partial<P> & NoInfer<T>, options?: SetOptions): void;
    set<T = void>(data: NoInfer<T>, options?: SetOptions): void;
    set(key: any, value?: any, options?: SetOptions) {
        if (isObject(key)) {
            options = value as SetOptions;
        } else {
            key = {[key]: value};
        } 

        if (!isUndefined(options) && options.silent) {
            for (let propName in key as P) {
                set(this.$props, propName, key[propName]);
            }
            return;
        }

        setProps(this, key);
    }

    get(): Props<P, ComponentClass<P>>;
    get<K extends keyof Props<P, ComponentClass<P>>>(key: K): Props<P, ComponentClass<P>>[K]; 
    get<V = void>(key: V extends void ? never : string): V;
    get(key?: any) {
        if (isUndefined(key)) return this.$props;

        return get(this.$props, key);
    }

    forceUpdate(callback?: Function) {
        if (this.$unmounted) return;
        forceUpdate(this, callback);
    }

    trigger(name: string, ...args: any[]) {
        // call event on props firstly
        const propEvent = (this.$props as any)[`ev-${name}`];
        if (isFunction(propEvent) && !this.$unmounted) {
            propEvent(...args); 
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
}
