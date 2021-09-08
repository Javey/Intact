import {ComponentClass, createVNode, VNode, VNodeComponentClass, Props, removeVNodeDom, IntactDom, TransitionHooks} from 'intact';
import {ReactNode, ReactElement, Component as ReactComponent, createContext, createElement} from 'react';
import {unstable_renderSubtreeIntoContainer, render, findDOMNode} from 'react-dom';
import type {Component} from './';
import {FakePromise} from './fakePromise';
import {noop} from 'intact-shared';

export interface WrapperProps {
    vnode: ReactNode
}

export const Context = createContext<Component | null>(null);

export class Wrapper implements ComponentClass<WrapperProps> {
    public $inited: boolean = true;
    public $lastInput: VNode;
    private container = document.createComment(' react-mount-point-unstable ') as unknown as HTMLElement;

    constructor(
        public $props: Props<WrapperProps, ComponentClass<WrapperProps>>,
        public $vNode: VNodeComponentClass<ComponentClass<WrapperProps>>,
        public $SVG: boolean,
        public $mountedQueue: Function[],
        public $parent: ComponentClass | null,
    ) { 
        const fakeInput = this.$lastInput = createVNode('div');
        fakeInput.transition = $vNode.transition;
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
        // React will insert child before container, if container is a comment node.
        // So we should insert the container into the corresponding position
        if (anchor) {
            parentDom.insertBefore(container, anchor);
        } else {
            parentDom.appendChild(container);
        }

        rewriteParentElementApi(parentDom);

        this.render(vNode);
    }

    $update(
        lastVNode: VNodeComponentClass<Wrapper>,
        vNode: VNodeComponentClass<Wrapper>,
        parentDom: Element,
        anchor: IntactDom | null,
        // mountedQueue: Function[],
        // force: boolean
    ): void {
        this.render(vNode);
    }

    $unmount(
        vNode: VNodeComponentClass,
        nextVNode: VNodeComponentClass | null
    ): void {
        const container = this.container;
        render(null as any, container, () => {
            // if (!nextVNode) {
                // // if does not exits nextVNode, then Intact only unmount this component
                // // but not remove the dom
                // // so we should not remove the container 
                // const lastInput = this.$lastInput;
                // lastInput.dom = container;
                // lastInput.transition = null;
                // return;
            // }
            // container.parentElement!.removeChild(container);
        });
    }

    private render(vNode: VNodeComponentClass<Wrapper>) {
        const parent = this.$parent as Component;
        const parentComponent = getParent(this)!;
        const instance = this;
        const container = this.container;

        let vnode = vNode.props!.vnode as ReactElement;
        // pass the $parent as value instead of parentComponent
        // because parentComponent is the the toplevel component and
        // not always equal to the $parent 
        // e.g. <A><B><div><C /></B></A>
        vnode = createElement(Context.Provider, {value: parent}, vnode);

        // if the parent component has providers, pass them to subtree
        const providers = parentComponent.$reactProviders;
        providers.forEach((value, provider) => {
            vnode = createElement(provider, {value}, vnode);    
        });

        const promise = new FakePromise(resolve => {
            unstable_renderSubtreeIntoContainer(
                parentComponent,
                // pass the $parent as value instead of parentComponent
                // because parentComponent is the the toplevel component and
                // not always equal to the $parent 
                // e.g. <A><B><div><C /></B></A>
                vnode,
                container,
                function(this: Element | ReactComponent) {
                    // add dom to the $lastInput for findDomFromVNode
                    // the real dom will be inserted before the container
                    const dom = instance.$lastInput.dom = container.previousSibling as IntactDom | null;
                    if (dom) {
                        (dom as any)._mountPoint = container;
                    }
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
            } else {
                if (process.env.NODE_ENV !== 'production') {
                    if (!child._mountPoint) {
                        throw new Error('Cannot remove the node. Maybe it is a bug of intact-react.');
                    }
                }
                // if the node has been removed, then remove the mount point
                removeChild.call(parentElement, child._mountPoint!);
                child._mountPoint = null;
            }
        } as any;

        parentElement._hasRewrite = true;
    }
}
