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

type Template<T extends Component> = (this: T) => Children

export abstract class Component<P = any> implements ComponentClass<P> {
    static propTypes?: Record<string, any>;
    static displayName?: string;

    public props: Props<P>;
    public refs: Record<string, any> = {}; 

    // internal properties
    public $SVG: boolean = false;
    // public $vNode: VNodeComponent<P> | null = null;
    public $mountedQueue: Function[] | null = null;

    // lifecyle states
    public $inited: boolean = false;
    public $rendered: boolean = false;
    public $mounted: boolean = false; 
    public $destroyed: boolean = false;

    // private properties
    private $vNode: VNode | null = null;

    public abstract template: () => Children | string;

    constructor(props: P) {
        this.props = props;
        // this.template = 
    }

    $render(lastVNode: VNodeComponent, nextVNode: VNodeComponent<P>, parentDom: Element, anchor: IntactDom | null) {
        const vNode = this.$vNode = normalizeRoot(this.template());
        mount(vNode, parentDom, this.$SVG, anchor, this.$mountedQueue!);
    }

    $update(lastVNode: VNodeComponent, nextVNode: VNodeComponent<P>, parentDom: Element, anchor: IntactDom | null) {
        const vNode = normalizeRoot(this.template());
        patch(this.$vNode!, vNode, parentDom, this.$SVG, anchor, this.$mountedQueue!);
        this.$vNode = vNode;
    }

    $destroy(vNode: VNodeComponent<P>, nextVNode: VNodeComponent | null, parentDom: Element) {
        unmount(this.$vNode!); 
        // removeVNodeDom(this.$vNode!, parentDom);
    }

    // template(): Children {
        // return null;
    // }
}
