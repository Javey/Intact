import {
    ComponentConstructor,
    ComponentClass, 
    Props,
    VNodeComponent,
    IntactDom,
    VNode,
    Children,
} from '../utils/types';
import {mount} from './mount';
import {patch} from './patch';
import {unmount} from './unmount';
import {normalizeRoot} from './vnode';
import {EMPTY_OBJ} from '../utils/common';

export type Template<T extends Component> = (this: T) => Children

export abstract class Component<P = any> implements ComponentClass<P> {
    static template: Template<Component> | string;
    static propTypes?: Record<string, any>;
    static displayName?: string;

    public props: Props<P, ComponentClass>;
    public refs: Record<string, any> = {}; 

    // internal properties
    public $SVG: boolean = false;
    // public $input: VNodeComponent<P> | null = null;
    public $lastInput: VNode | null = null;
    public $mountedQueue: Function[] | null = null;

    // lifecyle states
    public $inited: boolean = false;
    public $rendered: boolean = false;
    public $mounted: boolean = false; 
    public $destroyed: boolean = false;

    // private properties
    private $template: Template<Component>;

    constructor(props: P) {
        this.props = props || EMPTY_OBJ as Props<P, ComponentClass>;
        this.$template = (this.constructor as typeof Component).template as Template<Component>;
    }

    $render(lastVNode: VNodeComponent, nextVNode: VNodeComponent<P>, parentDom: Element, anchor: IntactDom | null) {
        const vNode = this.$lastInput = normalizeRoot(this.$template());
        mount(vNode, parentDom, this.$SVG, anchor, this.$mountedQueue!);
    }

    $update(lastVNode: VNodeComponent, nextVNode: VNodeComponent<P>, parentDom: Element, anchor: IntactDom | null) {
        this.props = (nextVNode.props || EMPTY_OBJ) as Props<P, ComponentClass>;
        const vNode = normalizeRoot(this.$template());
        patch(this.$lastInput!, vNode, parentDom, this.$SVG, anchor, this.$mountedQueue!);
        this.$lastInput = vNode;
    }

    $destroy(vNode: VNodeComponent<P>, nextVNode: VNodeComponent | null, parentDom: Element) {
        unmount(this.$lastInput!); 
        // removeVNodeDom(this.$vNode!, parentDom);
    }

    // template(): Children {
        // return null;
    // }
}
