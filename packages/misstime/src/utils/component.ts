import type {Component} from '../core/component';
import {Props, VNodeComponentClass, ChangeTrace, IntactDom, VNode, ComponentConstructor} from './types';
import {get, set, isNull, isFunction, isEventProp, isUndefined, isNullOrUndefined, hasOwn} from './helpers';
import {normalizeEventName, EMPTY_OBJ, findDomFromVNode, callAll, getComponentName} from './common';
import {normalizeRoot, createCommentVNode} from '../core/vnode';
import {patch} from '../core/patch';
import {mount} from '../core/mount';
import {unmount} from '../core/unmount';
import {validateProps} from '../utils/validate';

export const nextTick = typeof Promise !== 'undefined' ? 
    (callback: Function) => Promise.resolve().then(() => callback()) :
    /* istanbul ignore next */
    (callback: Function) => window.setTimeout(callback, 0);
let microTaskPending = false;

const QUEUE: Component<any>[] = [];

export function renderSyncComponnet(
    component: Component<any>,
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

    const vNode = normalizeRoot(component.$template(), nextVNode);
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

export function renderAsyncComponent(
    component: Component<any>,
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

export function updateSyncComponent(
    component: Component<any>,
    lastVNode: VNodeComponentClass,
    nextVNode: VNodeComponentClass,
    parentDom: Element, 
    anchor: IntactDom | null,
    mountedQueue: Function[],
    force: boolean,
) {
    component.$blockRender = true;
    if (!force) {
        patchProps(component, lastVNode.props, nextVNode.props, component.$defaults);
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

    const vNode = normalizeRoot(component.$template(), nextVNode);
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

export function updateAsyncComponent(
    component: Component<any>,
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

export function componentInited(component: Component<any>, triggerReceiveEvents: Function | null) {
    component.$inited = true;

    if (!isNull(triggerReceiveEvents)) {
        triggerReceiveEvents();
    }

    component.trigger('$inited');
}

export function mountProps(component: Component<any>, nextProps: Props<any>) {
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

export function patchProps(component: Component<any>, lastProps: Props<any>, nextProps: Props<any>, defaultProps: Partial<Props<any>>) {
    lastProps || (lastProps = EMPTY_OBJ);
    nextProps || (nextProps = EMPTY_OBJ);

    if (lastProps !== nextProps) {
        const changeTraces: ChangeTrace[] = [];
        const props = component.props;

        if (nextProps !== EMPTY_OBJ) {
            for (const prop in nextProps) {
                const lastValue = rollbackToDefault(prop, lastProps[prop], defaultProps);
                const nextValue = rollbackToDefault(prop, nextProps[prop], defaultProps);

                if (lastValue !== nextValue) {
                    patchProp(component, props, prop, lastValue, nextValue, changeTraces);
                }
            }             
        }

        if (lastProps !== EMPTY_OBJ) {
            for (const prop in lastProps) {
                if (!isUndefined(lastProps[prop]) && !hasOwn.call(nextProps, prop)) {
                    patchProp(component, props, prop, lastProps[prop], defaultProps[prop], null);
                }
            }
        }

        triggerReceiveEvents(component, changeTraces);
    }
}

export function patchProp(component: Component<any>, props: Props<any>, prop: string, lastValue: any, nextValue: any, changeTraces: ChangeTrace[] | null) {
    if (isEventProp(prop)) {
        prop = normalizeEventName(prop);
        if (!isNullOrUndefined(lastValue)) {
            component.off(prop, lastValue);
        }
        if (!isNullOrUndefined(nextValue)) {
            component.on(prop, nextValue);
        }
    } else {
        props[prop] = nextValue;
        if (!isNull(changeTraces)) {
            changeTraces.push({path: prop, newValue: nextValue, oldValue: lastValue});
        }
    }
}

export function setProps(component: Component<any>, newProps: Props<any>) {
    const props = component.props;
    const changeTracesGroup: ChangeTrace[][] = [];

    for (let propName in newProps) {
        const lastValue = get(props, propName);
        const nextValue = newProps[propName];

        if (lastValue !== nextValue) {
            changeTracesGroup.push(set(props, propName, nextValue));
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

export function forceUpdate(component: Component<any>, callback?: Function) {
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

function triggerReceiveEvents(component: Component<any>, changeTraces: ChangeTrace[]) {
    for (let i = 0; i < changeTraces.length; i++) {
        const {path, newValue, oldValue} = changeTraces[i];
        component.trigger(`$receive:${path}`, newValue, oldValue);
    }
}

function rerender() {
    let component: Component<any> | undefined = undefined;
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
