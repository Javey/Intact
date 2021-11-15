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
    validateProps,
    Blocks,
} from 'intact';
import {
    Component as ReactComponent,
    createElement,
    createRef,
    RefObject,
    ReactNode,
    Ref as ReactRef,
    Provider,
    HTMLAttributes,
    ReactChild,
} from 'react';
import {normalizeProps, normalizeChildren} from './normalize';
import {precacheFiberNode, updateFiberProps} from './helpers';
import {functionalWrapper} from './functionalWrapper';
import {FakePromise, FakePromises} from './fakePromise';
import {Context} from './wrapper';

export * from 'intact';

type ValidReactNode = ReactChild | null | undefined;

type IntactReactProps<P, E, B> = Readonly<P> & Readonly<{
    children?: ReactNode | undefined 
    className?: string
    style?: string | Record<string, string | number>
}> & Readonly<{
    [K in keyof P as `onChange${Capitalize<string & K>}`]?:
        (oldValue: P[K], newValue: P[K]) => void
}> & Readonly<{
    [K in keyof E as `on${Capitalize<string & K>}`]?:
        (...args: any[] & E[K]) => void
}> & Readonly<{
    [K in keyof B as `slot${Capitalize<string & K>}`]?: 
        B[K] extends null ?
            ValidReactNode :
            (data: B[K]) => ValidReactNode
}> & Readonly<Omit<HTMLAttributes<any>, keyof P | keyof E | 'style'>>

const PROMISES = '_$IntactReactPromises';
const EMPTY_ARRAY: any[] = [];
if (process.env.NODE_ENV !== 'production') {
    Object.freeze(EMPTY_ARRAY);
}

export class Component<
    P = {},
    E = {},
    B = {},
> extends IntactComponent<P, E, B> implements ReactComponent {
    static $cid = 'IntactReact';
    static normalize = normalizeChildren;
    static functionalWrapper = functionalWrapper;
    static contextType = Context;
    // if the flag is true, it indicate the component returns 2 vNodes,
    // only support two, becasue kpc components don't return vNodes exceed 2.
    static $doubleVNodes = false;

    public context!: any;
    public state!: any;
    public props!: IntactReactProps<P, E, B>;

    // React use prototype.isReactComponent to detect it's a ClassComponent or not
    public isReactComponent!: boolean;

    public $promises!: FakePromises;
    public $reactProviders!: Map<Provider<any>, any>;
    private $parentPromises!: FakePromises | null;
    private $elementRef!: RefObject<HTMLElement>;
    private $elementAlternateRef!: RefObject<HTMLElement>;
    private $isReact!: boolean;
    private $parentElement!: HTMLElement;

    constructor(props: IntactReactProps<P, E, B>, context: any);
    constructor(
        props: Props<P, Component<P>> | null,
        $vNode: VNodeComponentClass,
        $SVG: boolean,
        $mountedQueue: Function[],
        $parent: Component | null
    );
    constructor(
        props: Props<P, Component<P>> | null,
        $vNodeOrContext: VNodeComponentClass | null,
        $SVG?: boolean,
        $mountedQueue?: Function[],
        $parent?: Component | null
    ) {
        if ($vNodeOrContext && isComponentClass($vNodeOrContext)) {
            // Intact component in intact
            super(props as Props<P, Component<P>>, $vNodeOrContext, $SVG!, $mountedQueue!, $parent!);
        } else {
            // Intact component in React
            const normalizedProps = normalizeProps(props);
            const parent = $vNodeOrContext as Component | null;
            const mountedQueue = getMountedQueue(parent);
            super(normalizedProps, null as any, false, mountedQueue, parent);

            this.$inited = true;

            // create $vNode
            this.$vNode = createComponentVNode(
                4,
                this.constructor as typeof Component,
                normalizedProps
            ) as unknown as VNodeComponentClass<this>;

            if (process.env.NODE_ENV !== 'production') {
                validateProps(this.$vNode);
            }

            this.$elementRef = createRef<HTMLElement>();
            if ((this.constructor as typeof Component).$doubleVNodes) {
                this.$elementAlternateRef = createRef<HTMLElement>();
            }
            this.$isReact = true;

            const promises = this.$promises = new FakePromises();
            this.$parentPromises = inject(PROMISES, null);
            provide(PROMISES, promises);
        }
    }

    render() {
        // save all Context.Proiver, because React will clear the value
        // on commit phase, and we cannot get it when we render react element
        // in Wrapper
        const providers = this.$reactProviders = new Map();
        let returnFiber = (this as any)._reactInternals;
        while (returnFiber = returnFiber.return) {
            const tag = returnFiber.tag;
            if (tag === 10) { // is ContextProiver
                const type = returnFiber.type;
                providers.set(type, type._context._currentValue);
            } else if (tag === 3) { // HostRoot
                /**
                 * React will update from root, if root has pendingContext, it will compare
                 * the last value and the current value to change `didPerformWorkStatckCursor`,
                 * if the cursor is true, all children will be updated
                 * @FIXME: Maybe we can use all Consumer to wrap the placeholder element
                 * 
                 * always let hasContextChanged return true to make React update the component,
                 * even if it props has not changed
                 * see unit test: `shuold update children when provider's children...`
                 * issue: https://github.com/ksc-fe/kpc/issues/533
                 **/
                const stateNode = returnFiber.stateNode;
                if (!stateNode.__intactReactDefinedProperty) {
                    let context: any;
                    Object.defineProperty(stateNode, 'pendingContext', {
                        get() {
                            return context || (returnFiber.context ? {...returnFiber.context} : Object.create(null));
                        },
                        set(v) {
                            context = v;
                        }
                    });
                    stateNode.__intactReactDefinedProperty = true;
                }
                break;
            }
        }

        const vNode = createTemplateVNode(this.$elementRef, '1');
        return (this.constructor as typeof Component).$doubleVNodes ?
            [vNode, createTemplateVNode(this.$elementAlternateRef, '2')] :
            vNode;
    }

    componentDidMount() {
        const vNode = this.$vNode;
        const placeholder = this.$elementRef.current!
        const parentElement = this.$parentElement = placeholder.parentElement!;

        // React will assign a emptyObject which is frozen to refs on mountClassInstance
        // we have to re-assign it
        this.refs = {};

        // we may call hooks in init lifecycle, so set instance here,
        // $init method will set it to null
        setInstance(this);
        this.$init(vNode.props as Props<P, this>);

        vNode.children = this;
        this.$render(null, vNode, parentElement, placeholder.nextElementSibling, this.$mountedQueue);

        this.$done(() => {
            handleElementOnMounted(
                parentElement,
                placeholder,
                findDomFromVNode(vNode, true) as HTMLElement
            );
            if ((this.constructor as typeof Component).$doubleVNodes) {
                handleElementOnMounted(
                    parentElement,
                    this.$elementAlternateRef.current!,
                    findDomFromVNode(vNode, false) as HTMLElement
                );
            }
        });
    }

    componentDidUpdate() {
        const normalizedProps = normalizeProps(this.props) as Omit<P, 'children'> & {children?: Children};
        const vNode = createComponentVNode(
            4,
            this.constructor as typeof Component,
            normalizedProps,
        ) as unknown as VNodeComponentClass<this>;

        if (process.env.NODE_ENV !== 'production') {
            validateProps(vNode);
        }

        vNode.children = this;
        const lastVNode = this.$vNode;
        this.$vNode = vNode;

        this.$promises.reset();
        const mountedQueue = this.$mountedQueue = getMountedQueue(this.$parent as Component);

        this.$update(lastVNode, vNode, this.$parentElement, null, mountedQueue, false); 

        this.$done(null);
    }

    componentWillUnmount() {
        this.$unmount(this.$vNode, null);
    }

    private $done(callback: (() => void) | null) {
        const done = () => {
            const p = FakePromise.all(this.$promises);
            if (callback) {
                return p.then(callback);
            }
            return p;
        };

        const $parentPromises = this.$parentPromises;
        if ($parentPromises && !$parentPromises.done) {
            $parentPromises.add(new FakePromise(resolve => {
                done().then(resolve);
            }));
        } else {
            done().then(() => {
                callAll(this.$mountedQueue);
            });
        }
    }

    setState() { }
} 

Component.prototype.isReactComponent = true;

function getMountedQueue(parent: Component | null): Function[] {
    if (parent) {
        const mountedQueue = parent.$mountedQueue!;
        const parentPromises = parent.$provides![PROMISES] as FakePromises;
        if (!parentPromises.done) {
            return parent.$mountedQueue!;
        }
    }
    return [];
}

function createTemplateVNode(ref: RefObject<HTMLElement>, key: string) {
    return createElement('template', {
        ref,
        key,
        'data-intact-react': '',
    });
}

function handleElementOnMounted(parentElement: HTMLElement, placeholder: HTMLElement, element: HTMLElement) {
    parentElement.removeChild(placeholder);

    // replace some properties like React do
    const fiber = precacheFiberNode(element, placeholder);
    updateFiberProps(element, placeholder);
    fiber.stateNode = element;
}
