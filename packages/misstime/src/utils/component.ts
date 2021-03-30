import type {Component} from '../components/component';
import {Props, VNodeComponentClass, ChangeTrace} from './types';
import {get, set, isNull, isEventProp, isUndefined, isNullOrUndefined, hasOwn} from './helpers';
import {normalizeEventName, EMPTY_OBJ} from './common';

export function componentInited(component: Component<any>, triggerReceiveEvents: Function | null) {
    component.$inited = true;

    if (!isNull(triggerReceiveEvents)) {
        triggerReceiveEvents();
    }
}

export function mountProps(component: Component<any>, nextProps: Props<any>) {
    if (process.env.NODE_ENV !== 'production') {
        // TODO
        // validateProps();
    }
    
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

    const changeTraces: ChangeTrace[] = [];

    if (lastProps !== nextProps) {
        const props = component.props;
        if (nextProps !== EMPTY_OBJ) {
            if (process.env.NODE_ENV !== 'production') {
                // TODO
                // validateProps();
            }

            for (const prop in nextProps) {
                const lastValue = lastProps[prop];
                const nextValue = nextProps[prop];

                if (lastValue !== nextValue) {
                    patchProp(component, props, prop, lastValue, isUndefined(nextValue) ? defaultProps[prop] : nextValue, changeTraces);
                }
            }             
        }

        if (lastProps !== EMPTY_OBJ) {
            for (const prop in lastProps) {
                if (!hasOwn.call(nextProps, prop)) {
                    patchProp(component, props, prop, lastProps[prop], defaultProps[prop], null);
                }
            }
        }
    }

    triggerReceiveEvents(component, changeTraces);
}

export function patchProp(component: Component<any>, props: Props<any>, prop: string, lastValue: any, nextValue: any, changeTraces: ChangeTrace[] | null) {
    if (isEventProp(prop)) {
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

    for (let propName in props) {
        const lastValue = get(props, propName);
        const nextValue = newProps[propName];

        if (lastValue !== nextValue) {
            changeTracesGroup.push(set(props, propName, nextValue));
        }
    }

    const changesLength = changeTracesGroup.length;
    if (changesLength > 0) {
        // step 1: trigger $change events
        for (let i = 0; i < changesLength; i++) {
            const changeTraces = changeTracesGroup[i];
            // we should iterate from back to front to trigger event in order like a.b.c -> a.b -> a
            for (let j = changeTraces.length - 1; j > -1; j--) {
                const {path, newValue, oldValue} = changeTraces[j];

                component.trigger(`$change:${path}`, newValue, oldValue);
            }
        }

        // step 2: update component
        // component.$update();

        // step 3: trigger $changed events
        for (let i = 0; i < changesLength; i++) {
            const changeTraces = changeTracesGroup[i];
            // we should iterate from back to front to trigger event in order like a.b.c -> a.b -> a
            for (let j = changeTraces.length - 1; j > -1; j--) {
                const {path, newValue, oldValue} = changeTraces[j];

                component.trigger(`$changed:${path}`, newValue, oldValue);
            }
        }
    }
}

function triggerReceiveEvents(component: Component<any>, changeTraces: ChangeTrace[]) {
    for (let i = 0; i < changeTraces.length; i++) {
        const {path, newValue, oldValue} = changeTraces[i];
        component.trigger(`$receive:${path}`, newValue, oldValue);
    }
}

export function DEV_callMethod(component: Component<any>, method: Function, lastVNode: VNodeComponentClass, nextVNode: VNodeComponentClass) {
    component.$blockAddEvent = true;
    method.call(component, lastVNode, nextVNode);
    component.$blockAddEvent = false;
}
