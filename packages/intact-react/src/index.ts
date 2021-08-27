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
import {normalizeProps} from './normalize';

type IntactReactProps<P> = {
    children?: Children | ReactNode
    className?: string
} & P

export class Component<P = any> extends IntactComponent<P> implements ReactComponent {
    public context!: any;
    public state!: any;
    public props!: Readonly<P> & Readonly<{children?: ReactNode | undefined}>;

    // React use prototype.isReactComponent to detect it's a ClassComponent or not
    public isReactComponent!: boolean;

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
        $vNodeOrContext: VNodeComponentClass,
        $SVG?: boolean,
        $mountedQueue?: Function[],
        $parent?: ComponentClass | null
    ) {
        if (isComponentClass($vNodeOrContext)) {
            super(props as Props<P, Component<P>>, $vNodeOrContext, $SVG!, $mountedQueue!, $parent!);
            return;
        }

        const normalizedProps = normalizeProps(props, $vNodeOrContext);
        // Intact component in React
        const mountedQueue: Function[] = [];
        super(normalizedProps, $vNodeOrContext, false, mountedQueue, null);

        // create $vNode
        this.$vNode = createComponentVNode(
            4,
            this.constructor as typeof Component,
            normalizedProps
        ) as unknown as VNodeComponentClass<this>;

        this.$elementRef = createRef<HTMLElement>();
        this.$isReact = true;
    }

    render() {
        if (!this.$mounted) {
            const vNode = this.$vNode;
            // mount(vNode, null, null, false, null, []);
            this.$init({} as any);
            vNode.children = this;
            const flags = (this as any)._reactInternals.flags;
            (this as any)._reactInternals.flags = flags & ~2;
            this.$render(null, vNode, null as any, null, []);
            (this as any)._reactInternals.flags = flags;


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

    componentDidMount() {
        return;
        const vNode = this.$vNode;
        // mount(vNode, null, null, false, null, []);
        this.$init({} as any);
        vNode.children = this;
        this.$render(null, vNode, null as any, null, []);

        // hack the createElement of React to create the real dom instead of the placeholder 'template'
        const element = findDomFromVNode(vNode, true) as IntactDom;
        console.log(element.outerHTML);
        // const documentCreateElement = document.createElement;
        // document.createElement = (type: string) => {
            // document.createElement = documentCreateElement;
            // return element as HTMLElement;
        // };
    }

    setState() { }
} 

Component.prototype.isReactComponent = true;
