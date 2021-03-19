import {Props, ComponentClass, VNodeComponent} from '../src/utils/types';

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

export class Component<P = {}> implements ComponentClass<P> {
    public props: Props<P>;
    public $SVG: boolean = false;
    public $vNode: VNodeComponent<P> | null = null;
    public $mountedQueue: Function[] | null = null;

    private dom: Element | null = null;

    constructor(props: P) {
        this.props = props;
    }
    $render(lastVNode: VNodeComponent, nextVNode: VNodeComponent, parentDom: Element) {
        this.dom = document.createElement('div');
        parentDom.appendChild(this.dom);
    }
    $update() {
        this.dom!.innerHTML = 'update';
    }
    $destroy() {

    }
}

