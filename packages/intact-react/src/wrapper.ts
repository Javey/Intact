import {ComponentClass, createVNode, VNode, VNodeComponentClass, Props, removeVNodeDom, IntactDom, TransitionHooks} from 'intact';
import {ReactNode, ReactElement, Component as ReactComponent, createContext, createElement} from 'react';
import {unstable_renderSubtreeIntoContainer, render, findDOMNode} from 'react-dom';
import {markRootHasListened, rootHasListened} from './helpers';
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
            container.parentElement!.removeChild(container);
        });
    }

    private render(vNode: VNodeComponentClass<Wrapper>) {
        const vnode = vNode.props!.vnode;
        const parent = this.$parent as Component;
        const parentComponent = getParent(this)!;
        const instance = this;
        const container = this.container;

        const promise = new FakePromise(resolve => {
            unstable_renderSubtreeIntoContainer(
                parentComponent,
                // pass the $parent as value instead of parentComponent
                // because parentComponent is the the toplevel component and
                // not always equal to the $parent 
                // e.g. <A><B><div><C /></B></A>
                createElement(Context.Provider, {value: parent}, vnode as ReactElement),
                container,
                function(this: Element | ReactComponent) {
                    // add dom to the $lastInput for findDomFromVNode
                    // the real dom will be inserted before the container
                    instance.$lastInput.dom = container.previousSibling as IntactDom;
                    // instance.$lastInput.dom = this instanceof ReactComponent ?
                        // findDOMNode(this) :
                        // this;

                    // console.log(instance.$lastInput.dom);

                    // if (anchor) {
                        // parentDom.insertBefore(container, anchor);
                    // } else {
                        // parentDom.appendChild(container);
                    // }
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
