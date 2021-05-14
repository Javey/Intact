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
    callAll
} from 'misstime';
import {ChangeTrace} from './types';
import {get, set} from './helpers';
import {isNull, isFunction, isUndefined, hasOwn, EMPTY_OBJ, isEventProp} from 'intact-shared';

export const nextTick = typeof Promise !== 'undefined' ? 
    (callback: Function) => Promise.resolve().then(() => callback()) :
    /* istanbul ignore next */
    (callback: Function) => window.setTimeout(callback, 0);
let microTaskPending = false;

const QUEUE: Component<any>[] = [];

export function renderSyncComponnet<P>(
    component: Component<P>,
    lastVNode: VNodeComponentClass | null,
    nextVNode: VNodeComponentClass,
    parentDom: Element,
    anchor: IntactDom | null,
    mountedQueue: Function[]
) {
    component.$blockRender = true;
    if (isFunction(component.beforeMount)) {
        component.beforeMount(lastVNode, nextVNode);
    }
    component.$blockRender = false;

    const vNode = normalizeRoot(component.$template(EMPTY_OBJ, component.get('$blocks')), nextVNode);
    // reuse the dom even if they are different
    let lastInput: VNode | null = null;
    if (!isNull(lastVNode) && (lastInput = lastVNode.children!.$lastInput)) {
        patch(lastInput, vNode, parentDom, component, component.$SVG, anchor, mountedQueue);
    } else {
        mount(vNode, parentDom, component, component.$SVG, anchor, mountedQueue);
    }
    component.$lastInput = vNode;

    mountedQueue.push(() => {
        component.$mount(lastVNode, nextVNode);
        callAllQueue(component);
    });

    component.$rendered = true;
}

export function renderAsyncComponent<P>(
    component: Component<P>,
    lastVNode: VNodeComponentClass | null,
    nextVNode: VNodeComponentClass,
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

    component.on('$inited', () => {
        mountedQueue = [];
        renderSyncComponnet(component, lastVNode, nextVNode, parentDom, anchor, mountedQueue);
        callAll(mountedQueue);
    });
}

export function updateSyncComponent<P>(
    component: Component<P>,
    lastVNode: VNodeComponentClass,
    nextVNode: VNodeComponentClass,
    parentDom: Element, 
    anchor: IntactDom | null,
    mountedQueue: Function[],
    force: boolean,
) {
    component.$blockRender = true;
    if (!force) {
        patchProps(component, lastVNode.props, nextVNode.props, (component.constructor as typeof Component).defaults);
    }
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
    patch(component.$lastInput!, vNode, parentDom, component, component.$SVG, anchor, mountedQueue);
    component.$lastInput = vNode;

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
    lastVNode: VNodeComponentClass,
    nextVNode: VNodeComponentClass,
    parentDom: Element, 
    anchor: IntactDom | null,
    mountedQueue: Function[],
    force: boolean,
) {
    component.on('$inited', () => {
        mountedQueue = [];
        updateSyncComponent(component, lastVNode, nextVNode, parentDom, anchor, mountedQueue, force);
        callAll(mountedQueue);
    });
}

export function componentInited<P>(component: Component<P>, triggerReceiveEvents: Function | null) {
    component.$inited = true;

    if (!isNull(triggerReceiveEvents)) {
        triggerReceiveEvents();
    }

    component.trigger('$inited');
}

export function mountProps<P>(component: Component<P>, nextProps: P) {
    const props = component.props;
    const changeTraces: ChangeTrace[] = [];
    for (let prop in nextProps) {
        const nextValue = nextProps[prop];
        if (isUndefined(nextValue)) continue;

        const lastValue = props[prop];
        if (lastValue !== nextValue) {
            patchProp(component, props, prop, lastValue, nextValue, changeTraces);
        }
    } 

    // a callback to trigger $receive events
    return () => triggerReceiveEvents(component, changeTraces);
}

export function patchProps<P>(component: Component<P>, lastProps: P, nextProps: P, defaultProps: Partial<P>) {
    lastProps || (lastProps = EMPTY_OBJ);
    nextProps || (nextProps = EMPTY_OBJ);

    if (lastProps !== nextProps) {
        const changeTraces: ChangeTrace[] = [];
        const props = component.props;

        if (nextProps !== EMPTY_OBJ) {
            for (const prop in nextProps) {
                const lastValue = rollbackToDefault(prop, lastProps[prop as keyof typeof lastProps], defaultProps);
                const nextValue = rollbackToDefault(prop, nextProps[prop as keyof typeof nextProps], defaultProps);

                if (lastValue !== nextValue) {
                    patchProp(component, props, prop, lastValue, nextValue, changeTraces);
                }
            }             
        }

        if (lastProps !== EMPTY_OBJ) {
            for (const prop in lastProps) {
                if (!isUndefined(lastProps[prop as keyof typeof lastProps]) && !hasOwn.call(nextProps, prop)) {
                    patchProp(component, props, prop, lastProps[prop as keyof typeof lastProps], defaultProps[prop as keyof typeof defaultProps], null);
                }
            }
        }

        triggerReceiveEvents(component, changeTraces);
    }
}

export function patchProp<P>(component: Component<P>, props: P, prop: keyof P, lastValue: any, nextValue: any, changeTraces: ChangeTrace[] | null) {
    props[prop] = nextValue;
    if (!isEventProp(prop as string) && !isNull(changeTraces)) {
        changeTraces.push({path: prop as string, newValue: nextValue, oldValue: lastValue});
    }
}

export function setProps<P>(component: Component<P>, newProps: P) {
    const props = component.props;
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
                component.trigger(`$change:${path}`, newValue, oldValue);
            }
        }

        component.forceUpdate(() => {
            // trigger $changed events
            for (let i = 0; i < changesLength; i++) {
                const changeTraces = changeTracesGroup[i];
                // we should iterate from back to front to trigger event in order like a.b.c -> a.b -> a
                for (let j = changeTraces.length - 1; j > -1; j--) {
                    const {path, newValue, oldValue} = changeTraces[j];

                    component.trigger(`$changed:${path}`, newValue, oldValue);
                }
            }
        });
    }
}

function callModelEvent<P>(component: Component<P>, path: string, newValue: any) {
    const modelEvent = (component.props as any)[`ev-$model:${path}`];
    if (modelEvent) {
        modelEvent(newValue);
    }
}

export function forceUpdate<P>(component: Component<P>, callback?: Function) {
    if (!component.$inited) {
        if (isFunction(callback)) {
            (component.$queue || (component.$queue = [])).push(callback);
        }
    } else if (component.$blockRender) {
        // component is before rendering or updating
        if (isFunction(callback)) {
            component.$mountedQueue.push(callback);
        }
    } else {
        // TODO: if QUEUE.length === 0, update immediately
        if (QUEUE.indexOf(component) === -1) {
            QUEUE.push(component);
        }
        if (!microTaskPending) {
            microTaskPending = true;
            nextTick(rerender);
        }

        if (isFunction(callback)) {
            (component.$queue || (component.$queue = [])).push(callback);
        }
    }
}

function triggerReceiveEvents<P>(component: Component<P>, changeTraces: ChangeTrace[]) {
    for (let i = 0; i < changeTraces.length; i++) {
        const {path, newValue, oldValue} = changeTraces[i];
        component.trigger(`$receive:${path}`, newValue, oldValue);
    }
}

function rerender() {
    let component: Component | undefined = undefined;
    microTaskPending = false;

    while (component = QUEUE.shift()) {
        if (!component.$unmounted) {
            const mountedQueue: Function[] = [];
            const vNode = component.$vNode!;
            component.$update(
                vNode, 
                vNode,
                (findDomFromVNode(component.$lastInput!, true) as Element).parentNode as Element,
                null,
                mountedQueue,
                true,
            );
            callAll(mountedQueue); 
            callAllQueue(component);
        }
    }
}

function callAllQueue(component: Component<any>) {
    const queue = component.$queue;
    if (queue) {
        for (let i = 0; i < queue.length; i++) {
            queue[i].call(component);
        }
        component.$queue = null;
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
