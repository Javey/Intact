import type {Component} from '../core/component';
import {
    Props,
    VNodeComponentClass,
    IntactDom,
    VNode, 
    patch,
    mount,
    normalizeRoot,
    createCommentVNode,
    findDomFromVNode,
    callAll,
    unmountComponentClass,
} from 'misstime';
import {
    isNull,
    isFunction,
    isUndefined,
    hasOwn,
    EMPTY_OBJ,
    isEventProp,
    get,
    set,
    ChangeTrace
} from 'intact-shared';
import {LifecycleEvents} from '../utils/types';

export type InternalLifecycleTrigger<
    K extends keyof LifecycleEvents<T>,
    T extends Component<any, any>
> = (name: K, ...args: Parameters<LifecycleEvents<T>[K]>) => void;

export const nextTick = typeof Promise !== 'undefined' ? 
    (callback: Function) => Promise.resolve().then(() => callback()) :
    /* istanbul ignore next */
    (callback: Function) => window.setTimeout(callback, 0);
let microTaskPending = false;

type ComponentTree = {component: Component<any>, next: ComponentTree | null};

const QUEUE_MAP: Map<Component<any>, ComponentTree>= new Map();

export function renderSyncComponnet<P>(
    component: Component<P>,
    lastVNode: VNodeComponentClass<Component<P>> | null,
    nextVNode: VNodeComponentClass<Component<P>>,
    parentDom: Element,
    anchor: IntactDom | null,
    mountedQueue: Function[]
) {
    component.$blockRender = true;

    (component.trigger as Function as InternalLifecycleTrigger<'$beforeMount', Component<P>>)('$beforeMount', lastVNode, nextVNode);
    if (isFunction(component.beforeMount)) {
        component.beforeMount(lastVNode, nextVNode);
    }

    component.$blockRender = false;

    const vNode = normalizeRoot(component.$template(EMPTY_OBJ, component.get('$blocks')), nextVNode);
    // reuse the dom even if they are different
    let lastInput: VNode | null = null;
    if (!isNull(lastVNode) && (lastInput = lastVNode.children!.$lastInput)) {
        // if (lastVNode !== nextVNode) {
            // we will set nextVNode to lastVNode on render async component, exclude this case
            // unmountComponentClass(lastVNode, nextVNode);
        // }
        patch(lastInput, vNode, parentDom, component, component.$SVG, anchor, mountedQueue, true);
    } else {
        mount(vNode, parentDom, component, component.$SVG, anchor, mountedQueue);
    }
    component.$lastInput = vNode;

    mountedQueue.push(() => {
        callAllQueue(component, '$pendingQueue');
        component.$mount(lastVNode, nextVNode);
    });

    component.$rendered = true;
}

export function renderAsyncComponent<P>(
    component: Component<P>,
    lastVNode: VNodeComponentClass<Component<P>> | null,
    nextVNode: VNodeComponentClass<Component<P>>,
    parentDom: Element,
    anchor: IntactDom | null,
    mountedQueue: Function[]
) {
    if (isNull(lastVNode)) {
        // set nextVNode to lastVNode to let renderSyncComponent to patch
        lastVNode = nextVNode;
        const vNode = component.$lastInput = createCommentVNode('async');
        mount(vNode, parentDom, component, component.$SVG, anchor, mountedQueue);
    }

    (component.on as Function)('$inited', () => {
        mountedQueue = component.$mountedQueue = [];
        renderSyncComponnet(component, lastVNode, nextVNode, parentDom, anchor, mountedQueue);
        // call queue before mountedQueue, because queue are callbacks set in init
        callAllQueue(component, '$pendingQueue');
        callAll(mountedQueue);
    });
}

export function updateSyncComponent<P>(
    component: Component<P>,
    lastVNode: VNodeComponentClass<Component<P>>,
    nextVNode: VNodeComponentClass<Component<P>>,
    parentDom: Element, 
    anchor: IntactDom | null,
    mountedQueue: Function[],
    force: boolean,
) {
    component.$blockRender = true;
    if (!force) {
        patchProps(component, lastVNode.props, nextVNode.props, (component.constructor as typeof Component).defaults());
    }

    (component.trigger as Function as InternalLifecycleTrigger<'$beforeUpdate', Component<P>>)('$beforeUpdate', lastVNode, nextVNode);
    if (isFunction(component.beforeUpdate)) {
        if (process.env.NODE_ENV !== 'production') {
            DEV_callMethod(component, component.beforeUpdate, lastVNode, nextVNode);
        } else {
            /* istanbul ignore next */
            component.beforeUpdate(lastVNode, nextVNode);
        }
    }
    component.$blockRender = false;

    const vNode = normalizeRoot(component.$template(EMPTY_OBJ, component.get('$blocks')), nextVNode);
    patch(component.$lastInput!, vNode, parentDom, component, component.$SVG, anchor, mountedQueue, false);
    component.$lastInput = vNode;

    mountedQueue.push(() => {
        (component.trigger as Function as InternalLifecycleTrigger<'$updated', Component<P>>)('$updated', lastVNode, nextVNode);
    });
    if(isFunction(component.updated)) {
        mountedQueue!.push(() => {
            if (process.env.NODE_ENV !== 'production') {
                DEV_callMethod(component, component.updated!, lastVNode, nextVNode);
            } else {
                /* istanbul ignore next */
                component.updated!(lastVNode, nextVNode);
            }
        });
    }
}

export function updateAsyncComponent<P>(
    component: Component<P>,
    lastVNode: VNodeComponentClass<Component<P>>,
    nextVNode: VNodeComponentClass<Component<P>>,
    parentDom: Element, 
    anchor: IntactDom | null,
    mountedQueue: Function[],
    force: boolean,
) {
    (component.on as Function)('$inited', () => {
        mountedQueue = component.$mountedQueue = [];
        updateSyncComponent(component, lastVNode, nextVNode, parentDom, anchor, mountedQueue, force);
        callAll(mountedQueue);
    });
}

export function componentInited<P>(component: Component<P>, triggerReceiveEvents: Function | null) {
    triggerReceiveEvents && triggerReceiveEvents();

    component.$inited = true;
    (component.trigger as Function as InternalLifecycleTrigger<'$inited', Component<P>>)('$inited');
}

export function mountProps<P>(component: Component<P>, nextProps: P) {
    const props = component.$props;
    const changeTraces: ChangeTrace[] = [];
    for (let prop in nextProps) {
        const nextValue = nextProps[prop];
        if (isUndefined(nextValue)) continue;

        patchProp(component, props, prop, props[prop], nextValue, changeTraces);
    } 

    // a callback to trigger $receive events
    return () => triggerReceiveEvents(component, changeTraces, true);
}

export function patchProps<P>(component: Component<P>, lastProps: P, nextProps: P, defaultProps: Partial<P>) {
    lastProps || (lastProps = EMPTY_OBJ);
    nextProps || (nextProps = EMPTY_OBJ);

    if (lastProps !== nextProps) {
        const changeTraces: ChangeTrace[] = [];
        const props = component.$props;

        if (nextProps !== EMPTY_OBJ) {
            for (const prop in nextProps) {
                // const lastValue = rollbackToDefault(prop, lastProps[prop as keyof typeof lastProps], defaultProps);
                const lastValue = props[prop]; // use actual props instead of
                const nextValue = rollbackToDefault(prop, nextProps[prop], defaultProps);

                patchProp(component, props, prop, lastValue, nextValue, changeTraces);
            }             
        }

        if (lastProps !== EMPTY_OBJ) {
            for (const prop in lastProps) {
                if (!isUndefined(lastProps[prop]) && !hasOwn.call(nextProps, prop)) {
                    patchProp(component, props, prop, props[prop], defaultProps[prop], changeTraces);
                }
            }
        }

        triggerReceiveEvents(component, changeTraces, false);
    }
}

export function patchProp<P>(component: Component<P>, props: P, prop: keyof P, lastValue: any, nextValue: any, changeTraces: ChangeTrace[]) {
    if (lastValue === nextValue) return;

    props[prop] = nextValue;
    if (!isEventProp(prop as string)) {
        changeTraces.push({path: prop as string, newValue: nextValue, oldValue: lastValue});
    }
}

export function setProps<P>(component: Component<P>, newProps: P) {
    const props = component.$props;
    const changeTracesGroup: ChangeTrace[][] = [];

    for (let propName in newProps) {
        const lastValue = get(props, propName);
        const nextValue = newProps[propName];

        if (lastValue !== nextValue) {
            changeTracesGroup.push(set(props, propName as any, nextValue));
        }
    }

    const changesLength = changeTracesGroup.length;
    if (changesLength > 0) {
        // trigger $change events
        for (let i = 0; i < changesLength; i++) {
            const changeTraces = changeTracesGroup[i];
            // we should iterate from back to front to trigger event in order like a.b.c -> a.b -> a
            for (let j = changeTraces.length - 1; j > -1; j--) {
                const {path, newValue, oldValue} = changeTraces[j];

                callModelEvent(component, path, newValue);
                (component.trigger as Function)(`$change:${path}`, newValue, oldValue);
            }
        }

        component.forceUpdate(() => {
            // trigger $changed events
            for (let i = 0; i < changesLength; i++) {
                const changeTraces = changeTracesGroup[i];
                // we should iterate from back to front to trigger event in order like a.b.c -> a.b -> a
                for (let j = changeTraces.length - 1; j > -1; j--) {
                    const {path, newValue, oldValue} = changeTraces[j];

                    (component.trigger as Function)(`$changed:${path}`, newValue, oldValue);
                }
            }
        });
    }
}

function callModelEvent<P>(component: Component<P>, path: string, newValue: any) {
    const modelEvent = (component.$props as any)[`ev-$model:${path}`];
    if (modelEvent) {
        modelEvent(newValue);
    }
}

export function forceUpdate<P>(component: Component<P>, callback?: Function) {
    if (!component.$inited) {
        if (isFunction(callback)) {
            (component.$pendingQueue || (component.$pendingQueue = [])).push(callback);
        }
    } else if (component.$blockRender) {
        // component is before rendering or updating
        if (isFunction(callback)) {
            // append pendingQueue firstly to make the changed event order correct.
            // @see unit test: set prop multiple times 
            const pendingQueue = component.$pendingQueue;
            const mountedQueue = component.$mountedQueue;
            if (pendingQueue) {
                mountedQueue.push(...pendingQueue);
                component.$pendingQueue = null;
            }
            mountedQueue.push(callback);
        }
    } else {
        if (!QUEUE_MAP.has(component)) {
            QUEUE_MAP.set(component, {component, next: null});
        }
        // if (QUEUE.indexOf(component) === -1) {
            // QUEUE.push(component);
        // }
        if (!microTaskPending) {
            microTaskPending = true;
            nextTick(rerender);
        }

        if (isFunction(callback)) {
            (component.$queue || (component.$queue = [])).push(callback);
        }
    }
}

function triggerReceiveEvents<P>(component: Component<P>, changeTraces: ChangeTrace[], init: boolean) {
    for (let i = 0; i < changeTraces.length; i++) {
        const {path, newValue, oldValue} = changeTraces[i];
        (component.trigger as Function)(`$receive:${path}`, newValue, oldValue, init);
    }
}

function rerender() {
    microTaskPending = false;
    const trees = getRerenderTrees();

    let tree: ComponentTree | undefined = undefined;
    while (tree = trees.shift()) {
        const component = tree.component;
        if (!component.$unmounted) {
            const mountedQueue: Function[] = component.$mountedQueue = [];
            const vNode = component.$vNode;
            component.$update(
                vNode, 
                vNode,
                (findDomFromVNode(component.$lastInput!, true) as Element).parentNode as Element,
                null,
                mountedQueue,
                true,
            );
            callAll(mountedQueue); 
            callQueueDepthFirst(tree);
        }
    }
}

/**
 * Remove the unnecessary components if we find that
 * their parents is already in the QUEUE_MAP. The parent
 * component will update its children, so we remove
 * all the children components.
 */
function getRerenderTrees() {
    const trees: ComponentTree[] = [];

    QUEUE_MAP.forEach((tree, component) => {
        let senior: Component | null = component;
        while (senior = senior.$senior) {
            const seniorTree = QUEUE_MAP.get(senior);
            if (!isUndefined(seniorTree)) {
                seniorTree.next = tree;
                return;
            }
        }

        trees.push(tree);
    });

    QUEUE_MAP.clear();

    return trees;
}

function callQueueDepthFirst(tree: ComponentTree) {
    const loop = (tree: ComponentTree | null) => {
        if (!tree) return;

        loop(tree.next);

        callAllQueue(tree.component, '$queue');
    };

    loop(tree);
}

function callAllQueue(component: Component<any>, queueName: '$queue' | '$pendingQueue') {
    const queue = component[queueName];
    if (queue) {
        for (let i = 0; i < queue.length; i++) {
            queue[i].call(component);
        }
        component[queueName] = null;
    }
}

function rollbackToDefault(prop: string, value: any, defaultProps: any) {
    return isUndefined(value) ? defaultProps[prop] : value;
}

export function DEV_callMethod(component: Component<any>, method: Function, lastVNode: VNodeComponentClass, nextVNode: VNodeComponentClass) {
    component.$blockAddEvent = true;
    method.call(component, lastVNode, nextVNode);
    component.$blockAddEvent = false;
}
