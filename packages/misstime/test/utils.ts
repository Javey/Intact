import {Props, ComponentClass, VNodeComponent} from '../src/utils/types';
import {Component} from '../src/core/component';
import {createVNode as h} from '../src/core/vnode';

export function dispatchEvent(target: Element, eventName: string, options?: Object) {
    let event;
    if (document.createEvent) {
        event = document.createEvent('Event');
        event.initEvent(eventName, true, true);
    // } else if (document.createEventObject) {
        // event = document.createEventObject();
        // return target.fireEvent(`on${eventName}`, event);
    } else if (typeof CustomEvent !== 'undefined') {
        event = new CustomEvent(eventName);
    }
    if (event) {
        Object.assign(event, options);
        target.dispatchEvent(event);
    }
}

// export class MyComponent<P = {}> extends Component<P> {
    // static template = () => {
        // return h('div', null, 'test')
    // }
// }

