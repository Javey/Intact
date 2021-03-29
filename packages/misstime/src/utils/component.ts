import type {Component} from '../components/component';
import {Props} from './types';
import {get, set, changeTrace} from './helpers';

export function componentInited(component: Component<any>) {
    component.$inited = true;
    // TODO
}

export function setProps(component: Component<any>, newProps: Props<any>, isReceive: boolean) {
    const props = component.props;
    const changeTracesGroup: changeTrace[][] = [];

    for (let propName in props) {
        const lastValue = get(props, propName);
        const nextValue = newProps[propName];

        if (lastValue !== nextValue) {
            changeTracesGroup.push(set(props, propName, nextValue));
        }
    }

    for (let i = 0; i < changeTracesGroup.length; i++) {
        const changeTraces = changeTracesGroup[i];
        // we should iterate from back to front to trigger event in order like a.b.c -> a.b -> a
        for (let j = changeTraces.length - 1; j > -1; j--) {
            const {path, changes} = changeTraces[j];

            if (isReceive) {
                // component.
            }
        }
    }
}

export function setProp(props: Props<any>, propName: string, nextValue: any) {
    const lastValue = get(props, propName); 

    if (lastValue !== nextValue) {
        const changeTraces = set(props, propName, nextValue); 
        console.log(changeTraces);
    }
}

export function patchProps(lastProps: Props<any>, nextProps: Props<any>) {
    
}
