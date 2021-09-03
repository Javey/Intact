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
    provide,
    inject,
    useInstance,
    setInstance,
    callAll,
} from 'intact';
import {
    Component as ReactComponent,
    createElement,
    createRef,
    RefObject,
    ReactNode,
} from 'react';
import {normalizeProps, normalizeChildren} from './normalize';
import {precacheFiberNode, updateFiberProps} from './helpers';
import {functionalWrapper} from './functionalWrapper';
import {FakePromise, FakePromises} from './fakePromise';

type IntactReactProps<P> = {
    children?: Children | ReactNode
    className?: string
} & P

export * from 'intact';

const PROMISES = '_$IntactReactPromises';

export class Component<P = {}> extends IntactComponent<P> implements ReactComponent {
    static $cid = 'IntactReact';
    static normalize = normalizeChildren;
    static functionalWrapper = functionalWrapper;

    public context!: any;
    public state!: any;
    public props!: Readonly<P> & Readonly<{children?: ReactNode | undefined}>;

    // React use prototype.isReactComponent to detect it's a ClassComponent or not
    public isReactComponent!: boolean;

    public $promises!: FakePromises;
    private $parentPromises!: FakePromises | null;
    private $elementRef!: RefObject<HTMLElement>;
    private $isReact!: boolean;
    private $parentElement!: HTMLElement;

    constructor(props: Readonly<P> & Readonly<{children?: ReactNode | undefined}>, context: any);
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
        const parent = useInstance();
        // Intact component in React
        const mountedQueue: Function[] = parent ? parent.$mountedQueue : [];
        super(normalizedProps, $vNodeOrContext, false, mountedQueue, parent);

        this.$inited = true;

        // create $vNode
        this.$vNode = createComponentVNode(
            4,
            this.constructor as typeof Component,
            normalizedProps
        ) as unknown as VNodeComponentClass<this>;

        this.$elementRef = createRef<HTMLElement>();
        this.$isReact = true;
        this.$promises = new FakePromises();
        this.$parentPromises = inject(PROMISES, null);
        provide(PROMISES, this.$promises);
    }

    render() {
        return createElement('template', {
            ref: this.$elementRef
        });
    }

    componentDidMount() {
        const vNode = this.$vNode;
        const placeholder = this.$elementRef.current!
        const parentElement = this.$parentElement = placeholder.parentElement!;

        // React will assign a emptyObject which is frozen to refs on mountClassInstance
        // we have to re-assign it
        this.refs = {};

        this.$init(vNode.props as Props<P, this>);
        setInstance(this);
        vNode.children = this;
        this.$render(null, vNode, parentElement, placeholder.nextElementSibling, this.$mountedQueue);

        this.$done(() => {
            const element = findDomFromVNode(vNode, true) as Element;
            // parentElement.replaceChild(element, placeholder);
            parentElement.removeChild(placeholder);

            // replace some properties like React do
            const fiber = precacheFiberNode(element, placeholder);
            updateFiberProps(element, placeholder);
            fiber.stateNode = element;

            setInstance(null);
        });
    }

    componentDidUpdate() {
        const normalizedProps = normalizeProps(this.props, this.context) as Omit<P, 'children'> & {children?: Children};
        const vNode = createComponentVNode(
            4,
            this.constructor as typeof Component,
            normalizedProps,
        ) as unknown as VNodeComponentClass<this>;

        vNode.children = this;
        const lastVNode = this.$vNode;
        this.$vNode = vNode;

        this.$update(lastVNode, vNode, this.$parentElement, null, [], false); 
    }

    private $done(callback: () => void) {
        const done = () => {
            return FakePromise.all(this.$promises).then(callback);
        };

        const $parentPromises = this.$parentPromises;
        if ($parentPromises) {
            const promise = new FakePromise(resolve => {
                done().then(resolve);
            });
            $parentPromises.add(promise);
        } else {
            done().then(() => {
                callAll(this.$mountedQueue);
            });
        }
    }

    setState() { }
} 

Component.prototype.isReactComponent = true;
