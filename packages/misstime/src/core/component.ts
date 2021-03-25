import {
    ComponentConstructor,
    ComponentClass, 
    Props,
    VNodeComponentClass,
    IntactDom,
    VNode,
    Children,
} from '../utils/types';
import {mount} from './mount';
import {patch} from './patch';
import {unmount} from './unmount';
import {normalizeRoot} from './vnode';
import {EMPTY_OBJ} from '../utils/common';
import {isNull} from '../utils/helpers';

export type Template<T extends Component> = (this: T) => Children

export abstract class Component<P = any> implements ComponentClass<P> {
    static template: Template<Component> | string;
    static propTypes?: Record<string, any>;
    static displayName?: string;

    public props: Props<P, ComponentClass>;
    public refs: Record<string, any> = {}; 

    // internal properties
    public $SVG: boolean = false;
    public $lastInput: VNode | null = null;
    public $mountedQueue: Function[] | null = null;

    // lifecyle states
    public $inited: boolean = false;
    public $rendered: boolean = false;
    public $mounted: boolean = false; 
    public $unmouted: boolean = false;

    // private properties
    private $template: Template<Component>;

    constructor(props: P) {
        this.props = props || EMPTY_OBJ as Props<P, ComponentClass>;
        this.$template = (this.constructor as typeof Component).template as Template<Component>;
    }

    $render(lastVNode: VNodeComponentClass | null, nextVNode: VNodeComponentClass<P>, parentDom: Element, anchor: IntactDom | null) {
        const vNode = this.$lastInput = normalizeRoot(this.$template());

        // reuse the dom even if they are different
        let lastInput: VNode | null = null;
        if (!isNull(lastVNode) && (lastInput = lastVNode.children!.$lastInput)) {
            patch(lastInput, vNode, parentDom, this.$SVG, anchor, this.$mountedQueue!);
        } else {
            mount(vNode, parentDom, this.$SVG, anchor, this.$mountedQueue!);
        }

        this.$rendered = true;
    }

    $mount(lastVNode: VNodeComponentClass, nextVNode: VNodeComponentClass<P>) {
        this.$mounted = true;
    }

    $update(lastVNode: VNodeComponentClass, nextVNode: VNodeComponentClass<P>, parentDom: Element, anchor: IntactDom | null) {
        this.props = (nextVNode.props || EMPTY_OBJ) as Props<P, ComponentClass>;
        const vNode = normalizeRoot(this.$template());
        patch(this.$lastInput!, vNode, parentDom, this.$SVG, anchor, this.$mountedQueue!);
        this.$lastInput = vNode;
    }

    $unmount(vNode: VNodeComponentClass<P>, nextVNode: VNodeComponentClass | null) {
        unmount(this.$lastInput!); 
        this.$unmouted = true;
    }
}
