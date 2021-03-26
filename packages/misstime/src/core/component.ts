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

// export type Template<T> = (this: T) => Children
export type Template = () => Children;

export abstract class Component<P = {}> implements ComponentClass<P> {
    static readonly template: Template | string;
    static readonly propTypes?: Record<string, any>;
    static readonly displayName?: string;

    public props: Props<P, ComponentClass<P>>;
    public refs: Record<string, any> = {}; 

    // internal properties
    public $SVG: boolean = false;
    public $lastInput: VNode | null = null;
    public $mountedQueue: Function[] | null = null;

    // lifecyle states
    public $inited: boolean = false;
    public $rendered: boolean = false;
    public $mounted: boolean = false; 
    public $unmounted: boolean = false;

    // private properties
    private $template: Template;

    constructor(props: P) {
        this.props = props || EMPTY_OBJ;
        this.$template = (this.constructor as typeof Component).template as Template; 
    }

    $render(lastVNode: VNodeComponentClass | null, nextVNode: VNodeComponentClass, parentDom: Element, anchor: IntactDom | null) {
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

    $mount(lastVNode: VNodeComponentClass, nextVNode: VNodeComponentClass) {
        this.$mounted = true;
    }

    $update(lastVNode: VNodeComponentClass, nextVNode: VNodeComponentClass, parentDom: Element, anchor: IntactDom | null) {
        this.props = nextVNode.props || EMPTY_OBJ;
        const vNode = normalizeRoot(this.$template());
        patch(this.$lastInput!, vNode, parentDom, this.$SVG, anchor, this.$mountedQueue!);
        this.$lastInput = vNode;
    }

    $unmount(vNode: VNodeComponentClass, nextVNode: VNodeComponentClass | null) {
        unmount(this.$lastInput!); 
        this.$unmounted = true;
    }
}
