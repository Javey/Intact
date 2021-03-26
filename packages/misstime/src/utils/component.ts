import type {Component} from '../core/component';

export function componentInited(component: Component<any>) {
    component.$inited = true;
    // TODO
}
