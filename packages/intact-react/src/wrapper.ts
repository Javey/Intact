import {ComponentClass, createVNode, VNode, VNodeComponentClass, Props, removeVNodeDom, IntactDom} from 'intact';
import {ReactNode, ReactElement, Component as ReactComponent, createContext, createElement} from 'react';
import {unstable_renderSubtreeIntoContainer, render, findDOMNode} from 'react-dom';
import {markRootHasListened, rootHasListened} from './helpers';
import type {Component} from './';
import {FakePromise} from './fakePromise';

export interface WrapperProps {
    vnode: ReactNode
}

export const Context = createContext<Component | null>(null);

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
        const parent = this.$parent as Component;
        const parentComponent = getParent(this)!;
        const instance = this;

        const promise = new FakePromise(resolve => {
            unstable_renderSubtreeIntoContainer(
                parentComponent,
                // pass the $parent as value instead of parentComponent
                // because parentComponent is the the toplevel component and
                // not always equal to the $parent 
                // e.g. <A><B><div><C /></B></A>
                createElement(Context.Provider, {value: parent}, vnode as ReactElement),
                this.container,
                function(this: Element | ReactComponent) {
                    // add dom to the $lastInput for findDomFromVNode
                    instance.$lastInput.dom = this instanceof ReactComponent ?
                        findDOMNode(this) :
                        this;

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

        parent.$promises.value.push(promise);
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
