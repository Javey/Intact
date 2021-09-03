import {ComponentClass, createVNode, VNode, VNodeComponentClass, Props, removeVNodeDom, IntactDom} from 'intact';
import {ReactNode, ReactElement, Component as ReactComponent} from 'react';
import {unstable_renderSubtreeIntoContainer, render, findDOMNode} from 'react-dom';
import {markRootHasListened, rootHasListened} from './helpers';
import type {Component} from './';
import {FakePromise} from './fakePromise';

export interface WrapperProps {
    vnode: ReactNode
}

export class Wrapper implements ComponentClass<WrapperProps> {
    public $inited: boolean = true;
    public $lastInput: VNode = createVNode('div');
    private container = document.createComment(' react-mount-point-unstable ') as unknown as HTMLElement;

    constructor(
        public $props: Props<WrapperProps, ComponentClass<WrapperProps>>,
        public $vNode: VNodeComponentClass<ComponentClass<WrapperProps>>,
        public $SVG: boolean,
        public $mountedQueue: Function[],
        public $parent: ComponentClass | null,
    ) { }

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
        // const parentComponent = getParent(this)!;
        // const promise = new FakePromise(resolve => {
            // unstable_renderSubtreeIntoContainer(
                // parentComponent,
                // vnode as ReactElement,
                // container,
                // function(this: any) {
                    // console.log(this);
                    // // parentDom.removeChild(container);
                    // // add dom to the $lastInput for findDomFromVNode
                    // // this.$lastInput.dom = container.firstElementChild;

                    // // if (anchor) {
                        // // parentDom.insertBefore(container, anchor);
                    // // } else {
                        // // parentDom.appendChild(container);
                    // // }
                    // resolve();
                // } 
            // );
        // })

        // parentComponent.$promises.value.push(promise);
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
    ): void  {
        // unmount(vNode.props!.vnode, getParent(this), null, !!nextVNode);
    }

    private render(vNode: VNodeComponentClass<Wrapper>) {
        const vnode = vNode.props!.vnode;
        const parentComponent = getParent(this)!;
        const instance = this;
        const promise = new FakePromise(resolve => {
            unstable_renderSubtreeIntoContainer(
                parentComponent,
                vnode as ReactElement,
                this.container,
                function(this: Element | ReactComponent) {
                    // add dom to the $lastInput for findDomFromVNode
                    instance.$lastInput.dom = this instanceof ReactComponent ?
                        findDOMNode(this) :
                        this;

                    console.log(instance.$lastInput.dom);

                    // if (anchor) {
                        // parentDom.insertBefore(container, anchor);
                    // } else {
                        // parentDom.appendChild(container);
                    // }
                    resolve();
                } 
            );
        });

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
