import {ComponentClass, createVNode, VNode, VNodeComponentClass, Props, removeVNodeDom, IntactDom, TransitionHooks} from 'intact';
import {ReactNode, ReactElement, Component as ReactComponent, createContext, createElement, cloneElement} from 'react';
import {unstable_renderSubtreeIntoContainer, render, findDOMNode} from 'react-dom';
import type {Component} from './';
import {FakePromise} from './fakePromise';
import {noop} from 'intact-shared';

export interface WrapperProps {
    vnode: ReactNode
}

export const Context = createContext<Component | null>(null);

const containerComment = ' react-mount-point-unstable ';

export class Wrapper implements ComponentClass<WrapperProps> {
    public $inited: boolean = true;
    public $lastInput: VNode;
    private container = document.createComment(containerComment) as unknown as HTMLElement;
    private isEmptyReactComponent = false;

    constructor(
        public $props: Props<WrapperProps, ComponentClass<WrapperProps>>,
        public $vNode: VNodeComponentClass<ComponentClass<WrapperProps>>,
        public $SVG: boolean,
        public $mountedQueue: Function[],
        public $parent: ComponentClass | null,
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

        rewriteParentElementApi(parentDom);

        this.render(vNode, parentDom);
    }

    $update(
        lastVNode: VNodeComponentClass<Wrapper>,
        vNode: VNodeComponentClass<Wrapper>,
        parentDom: Element,
        anchor: IntactDom | null,
        // mountedQueue: Function[],
        // force: boolean
    ): void {
        this.render(vNode, parentDom);
    }

    $unmount(
        vNode: VNodeComponentClass,
        nextVNode: VNodeComponentClass | null
    ): void {
        const container = this.container;
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

    private render(vNode: VNodeComponentClass<Wrapper>, parentDom: Element) {
        const parent = this.$parent as Component;
        const parentComponent = getParent(this)!;
        const instance = this;
        const container = this.container;

        let vnode = getReactElement(vNode);
        /**
         * pass the $parent as value instead of parentComponent
         * because parentComponent is the the toplevel component and
         * not always equal to the $parent 
         * e.g. <A><B><div><C /></div></B></A>
         */
        vnode = createElement(Context.Provider, {value: parent}, vnode);

        // if the parent component has providers, pass them to subtree
        const providers = parentComponent.$reactProviders;
        providers.forEach((value, provider) => {
            vnode = createElement(provider, {value}, vnode); 
        });

        this.isEmptyReactComponent = false;
        const promise = new FakePromise(resolve => {
            unstable_renderSubtreeIntoContainer(
                parentComponent,
                vnode,
                container,
                function(this: Element | ReactComponent) {
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

                    resolve();
                } 
            );
        });

        // parent.$promises.value.push(promise);
        parentComponent.$promises.value.push(promise);
    }
}

function getParent(instance: Wrapper): Component | null {
    let $parent = instance.$parent as Component;

    do {
        if (($parent as any)._reactInternals) {
            return $parent;
        }
    } while ($parent = $parent.$parent as Component);

    // should not hit this
    /* istanbul ignore next */
    return null
}

function rewriteParentElementApi(parentElement: Element & {_hasRewrite?: boolean}) {
    if (!parentElement._hasRewrite) {
        const removeChild = parentElement.removeChild;
        parentElement.removeChild = function(child: Node & {_mountPoint: Node | null}) {
            if (child.parentNode) {
                removeChild.call(parentElement, child);
                const realElement = (child as any)._realElement
                if (realElement) {
                    (child as any)._realElement = null;
                    realElement._mountPoint = null;
                }
            } else {
                /* istanbul ignore next */
                if (process.env.NODE_ENV !== 'production') {
                    if (!child._mountPoint) {
                        throw new Error('Cannot remove the node. Maybe it is a bug of intact-react.');
                    }
                }
                // if the node has been removed, then remove the mount point
                const container = child._mountPoint!;
                removeChild.call(parentElement, container);
                child._mountPoint = null;
                (container as any)._realElement = null;
            }
        } as any;

        const insertBefore = parentElement.insertBefore;
        parentElement.insertBefore = function(child: Node, beforeChild: Node & {_realElement?: Node}) {
            if (beforeChild.nodeType === 8 && beforeChild.nodeValue === containerComment) {
                // it's the wrapper container, we add the real element to it
                beforeChild._realElement = child;
            }
            insertBefore.call(parentElement, child, beforeChild);
        } as any;

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
};
