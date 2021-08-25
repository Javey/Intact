import {
    Component as IntactComponent,
    Props,
    VNodeComponentClass,
    ComponentClass,
    isComponentClass,
    createVNode as h,
    createComponentVNode,
    mount,
    findDomFromVNode,
    Children,
    IntactDom,
} from 'intact';
import {
    Component as ReactComponent,
    createElement,
    createRef,
    RefObject,
    ReactNode,
} from 'react';

type IntactReactProps<P> = {
    children?: Children | ReactNode
    className?: string
} & P

export class Component<P = any> extends IntactComponent<P> implements ReactComponent {
    public context!: any;
    public state!: any;

    // public props: any;

    // React use prototype.isReactComponent to detect it's a ClassComponent or not
    public isReactComponent!: boolean;

    // React will check the props has been mutated or not,
    // but Intact will assign a copy props to this.props,
    // so we assign this.props to this.$props
    // and assign the original props to this.props
    // private $props!: Props<P, Component<P>>;

    private $elementRef!: RefObject<HTMLElement>;
    private $isReact!: boolean;

    constructor(props: P, context: any);
    constructor(
        props: Props<P, Component<P>> | null,
        $vNode: VNodeComponentClass,
        $SVG: boolean,
        $mountedQueue: Function[],
        $parent: ComponentClass | null
    );
    constructor(
        props: Props<P, Component<P>> | null,
        $vNode: VNodeComponentClass,
        $SVG?: boolean,
        $mountedQueue?: Function[],
        $parent?: ComponentClass | null
    ) {
        if (isComponentClass($vNode)) {
            super(props as Props<P, Component<P>>, $vNode, $SVG!, $mountedQueue!, $parent!);
            return;
        }

        // Intact component in React
        const mountedQueue: Function[] = [];
        super(props, $vNode, false, mountedQueue, null);

        // create $vNode
        this.$vNode = createComponentVNode(4, this.constructor as typeof Component, props) as unknown as VNodeComponentClass<this>;

        // this.$props = this.props;
        // this.props = props as any;

        this.$elementRef = createRef<HTMLElement>();
        this.$isReact = true;
    }

    setState() { }

    render() {
        if (!this.$mounted) {
            const vNode = this.$vNode;
            mount(vNode, null, null, false, null, []);

            // hack the createElement of React to create the real dom instead of the placeholder 'template'
            const element = findDomFromVNode(vNode, true) as IntactDom;
            const documentCreateElement = document.createElement;
            document.createElement = (type: string) => {
                document.createElement = documentCreateElement;
                return element as HTMLElement;
            };
        } 

        return createElement('template', {
            ref: this.$elementRef
        });
    }
} 

Component.prototype.isReactComponent = true;
