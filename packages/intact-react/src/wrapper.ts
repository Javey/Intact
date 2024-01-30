import {
    ComponentClass,
    createVNode,
    VNode,
    VNodeComponentClass,
    Props,
    removeVNodeDom,
    IntactDom,
    TransitionHooks,
    findDomFromVNode,
} from 'intact';
import {ReactNode, ReactElement, Component as ReactComponent, createContext, createElement, cloneElement} from 'react';
import {unstable_renderSubtreeIntoContainer, render, findDOMNode} from 'react-dom';
import type {Component} from './';
import {FakePromise} from './fakePromise';
import {noop} from 'intact-shared';
import {listeningMarker, connectFiber} from './helpers';

export interface WrapperProps {
    vnode: ReactNode
}

type ChildNode = Node & {
    _mountPoint?: ContainerNode | null,
    _realElement?: Node | null,
    _deleted?: boolean
}

type ContainerNode = HTMLElement & {
    _isUpdate?: boolean
} 

export const Context = createContext<Component | null>(null);

export const containerComment = ' react-mount-point-unstable ';

export class Wrapper implements ComponentClass<WrapperProps> {
    public $inited: boolean = true;
    public $lastInput: VNode;
    private container = document.createComment(containerComment) as unknown as ContainerNode;
    private isEmptyReactComponent = false;

    constructor(
        public $props: Props<WrapperProps, ComponentClass<WrapperProps>>,
        public $vNode: VNodeComponentClass<ComponentClass<WrapperProps>>,
        public $SVG: boolean,
        public $mountedQueue: Function[],
        public $senior: ComponentClass | null,
    ) { 
        const fakeInput = this.$lastInput = createVNode('div');
        // fakeInput.transition = $vNode.transition;
        // fakeInput.transition = {
            // // only need leave hook to prevent Intact from removing the real dom,
            // // because it will be removed by React.
            // leave: noop
        // } as unknown as TransitionHooks;
    }

    $init(props: WrapperProps | null): void { }

    $render(
        lastVNode: VNodeComponentClass | null,
        vNode: VNodeComponentClass<Wrapper>,
        parentDom: Element,
        anchor: IntactDom | null,
        // mountedQueue: Function[]
    ): void {
        if (lastVNode) {
            removeVNodeDom(lastVNode, parentDom);
        }
        const container = this.container;
        /**
         * React will insert child before container, if container is a comment node.
         * So we should insert the container into the corresponding position
         */
        if (anchor) {
            parentDom.insertBefore(container, anchor);
        } else {
            parentDom.appendChild(container);
        }

        const parentComponent = getParent(this);
        rewriteParentElementApi(parentDom, !!parentComponent);

        // we should set dom before rendering the vNode
        // because the real element may not be inserted after rendering
        // and intact need the dom to insertBefore other elements
        // @unit test: insert react array elements before react element in Intact component. ksc-fe/kpc#869
        this.$lastInput.dom = container;

        this.render(vNode, parentDom, parentComponent);
    }

    $update(
        lastVNode: VNodeComponentClass<Wrapper>,
        vNode: VNodeComponentClass<Wrapper>,
        parentDom: Element,
        anchor: IntactDom | null,
        // mountedQueue: Function[],
        // force: boolean
    ): void {
        this.container._isUpdate = true;
        this.render(vNode, parentDom);
    }

    $unmount(
        vNode: VNodeComponentClass,
        nextVNode: VNodeComponentClass | null
    ): void {
        const container = this.container;
        container._isUpdate = false;
        /**
         * If we update intact component lead to this unmountion,
         * the dom will be removed by react immediately,
         * so we set a flag `hasRemoved` to indicate this case.
         * But maybe the wrapped element returns null, and react
         * will not remove the void text node that we created in render method.
         * So if it is in this case, we should remove the void text node manually.
         */
        const dom = this.$lastInput.dom!;
        let hasRemoved = false;
        render(null as any, container, () => {
            hasRemoved = true;
            if (this.isEmptyReactComponent) {
                container.parentNode!.removeChild(dom);
            }
        });
        if (hasRemoved) {
            this.$lastInput.dom = container;
        }
    }

    private render(
        vNode: VNodeComponentClass<Wrapper>,
        parentDom: Element,
        parentComponent: Component | null = getParent(this)
    ) {
        const parent = this.$senior as Component;
        const instance = this;
        const container = this.container;

        let vnode = getReactElement(vNode);
        /**
         * pass the $senior as value instead of parentComponent
         * because parentComponent is the the toplevel component and
         * not always equal to the $senior
         * e.g. <A><B><div><C /></div></B></A>
         */
        vnode = createElement(Context.Provider, {value: parent}, vnode);

        if (parentComponent) {
            // if the parent component has providers, pass them to subtree
            const providers = parentComponent.$reactProviders;
            providers.forEach((value, provider) => {
                vnode = createElement(provider, {value}, vnode); 
            });
        }

        this.isEmptyReactComponent = false;
        const promise = new FakePromise(resolve => {
            const callback = function(this: Element | ReactComponent) {
                /**
                 * add dom to the $lastInput for findDomFromVNode
                 * the real dom will be inserted before the container
                 * but the react component may return null,
                 * so we can't get the previousSibling
                 * 
                 * We will add the real element to the container
                 * by rewriting the parentNode.insertBefore api
                 *
                 * If we wrap an React component that returns Intact component directly
                 * e.g. <A><Context.Provider><B /><Context.Provider></A>
                 * the realElement will be the <template>
                 */
                let dom = (container as any)._realElement as IntactDom | null;
                if (
                    !dom ||
                    (dom as Element).tagName === 'TEMPLATE' &&
                    (dom as Element).getAttribute('data-intact-react') !== null
                ) {
                    // maybe this react component return null,
                    // we create a text as the dom
                    dom = document.createTextNode('');
                    parentDom.insertBefore(dom, container);
                    (dom as any)._isEmpty = true;
                }
                if ((dom as any)._isEmpty) {
                    instance.isEmptyReactComponent = true;
                }
                (dom as any)._mountPoint = container;
                instance.$lastInput.dom = dom;

                /**
                 * React find event props until the root fiber return null
                 * If we have event props outeside the root container, it will be ignored.
                 * So we must connect the fiber's return prop to outer element
                 * @UnitTest: outer react element should receive event
                 */
                const rootFiber = (container as any)._reactRootContainer._internalRoot.current;
                Object.defineProperty(rootFiber, 'return', {
                    get() {
                        return connectFiber && parentComponent ? (parentComponent as any)._reactInternals : null;
                    }
                });

                // console.log(rootContainer);
                // console.dir(container);
                // debugger;
                // getRootContainer(parentComponent);
                // Object.defineProperty((container as any)._reactRootContainer._internalRoot, 'containerInfo', {
                    // get() {
                        // return getRootContainer(parentComponent); 
                    // }
                // });

                resolve();
            } 

            if (!parentComponent) {
                render(vnode, container, callback);
            } else {
                unstable_renderSubtreeIntoContainer(
                    parentComponent,
                    vnode,
                    container,
                    callback
                );
            }
        });

        // if the promised has be resolved, it indicate that this render is sync.
        // Maybe we call update in intact directly, and it is not in React's render context
        if (!promise.resolved && parentComponent) {
            const promises = parentComponent.$promises;
            // FIXME: Is it appropriate to discard the promise directly?
            // Unit Test: render react component which will update in render phase
            if (!promises.done) {
                promises.add(promise);
            }
        }
    }
}

function getParent(instance: Wrapper): Component | null {
    let $senior = instance.$senior as Component;

    do {
        if (($senior as any)._reactInternals) {
            return $senior;
        }
    } while ($senior = $senior.$senior as Component);

    // should not hit this
    // maybe call static method to render react element, i.e. Dialog.info();
    /* istanbul ignore next */
    return null
}

function rewriteParentElementApi(parentElement: Element & {_hasRewrite?: boolean}, preventListener: boolean) {
    if (!parentElement._hasRewrite) {
        const removeChild = parentElement.removeChild;
        parentElement.removeChild = function(child: ChildNode, directly: boolean) {
            if (child.nodeType === 8 && child.nodeValue === containerComment) {
                removeChild.call(parentElement, child._realElement!);
                removeChild.call(parentElement, child);
                child._realElement = null;
                return;
            }
            const mountPoint = child._mountPoint;
            if (directly || !mountPoint || mountPoint._isUpdate) {
                removeChild.call(parentElement, child);
                return;
            }
            if (!child.parentNode) {
                // if the node has been removed, then remove the mount point
                removeChild.call(parentElement, child._mountPoint!);
                child._mountPoint = null;
                return;
            }
            if (child._deleted) {
                removeChild.call(parentElement, child._mountPoint!);
                removeChild.call(parentElement, child);
                child._mountPoint = null;
                return;
            }
            child._deleted = true;
            
            // if (child.parentNode) {
                // removeChild.call(parentElement, child);
                // const realElement = (child as any)._realElement
                // if (realElement) {
                    // (child as any)._realElement = null;
                    // realElement._mountPoint = null;
                // }
            // } else {
                // if (process.env.NODE_ENV !== 'production') {
                    // if (!child._mountPoint) {
                        // throw new Error('Cannot remove the node. Maybe it is a bug of intact-react.');
                    // }
                // }
                // // if the node has been removed, then remove the mount point
                // const container = child._mountPoint!;
                // removeChild.call(parentElement, container);
                // child._mountPoint = null;
                // (container as any)._realElement = null;
            // }
        } as any;

        const insertBefore = parentElement.insertBefore;
        parentElement.insertBefore = function(child: Node, beforeChild: ChildNode) {
            if (beforeChild.nodeType === 8 && beforeChild.nodeValue === containerComment) {
                // it's the wrapper container, we add the real element to it
                beforeChild._realElement = child;
            }
            insertBefore.call(parentElement, child, beforeChild);
        } as any;

        // let react don't add listeners to the root container
        if (preventListener) {
            (parentElement as any)[listeningMarker] = true;
        }
        parentElement._hasRewrite = true;
    }
}

function getReactElement(vNode: VNode): ReactElement {
    const props = vNode.props!;
    const vnode = props.vnode as ReactElement;
    // react vNode has been frozen, so we must clone it to change
    let _props: Record<string, any> | null = null;
    for (let key in props) {
        if (key === 'vnode') continue;
        if (!_props) _props = {};

        const value = props[key];
        if (key.substr(0, 3) === 'ev-') {
            _props[eventsMap[key as keyof typeof eventsMap]] = value;
        } else {
            _props[key] = value;
        }
    }

    return _props ? cloneElement(vnode, _props) : vnode;
}

const eventsMap = {
    'ev-click': 'onClick',
    'ev-contextmenu': 'onContextMenu',
    'ev-mouseenter': 'onMouseEnter',
    'ev-mouseleave': 'onMouseLeave',
    'ev-dragstart': 'onDragStart',
    'ev-dragover': 'onDragOver',
    'ev-dragend': 'onDragEnd',
};
