import {ComponentClass, createVNode, VNode, VNodeComponentClass, Props, removeVNodeDom, IntactDom} from 'intact';
import {ReactNode, ReactElement, Component as ReactComponent} from 'react';
import {unstable_renderSubtreeIntoContainer, render} from 'react-dom';
import {markRootHasListened, rootHasListened} from './helpers';

export interface WrapperProps {
    vnode: ReactNode
}

export class Wrapper implements ComponentClass<WrapperProps> {
    public $inited: boolean = true;
    public $lastInput: VNode = createVNode('div');

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
        } else if (!parentDom) {
            // parentDom = document.createDocumentFragment() as any; 
        }
        const {vnode} = vNode.props!;
        const container = document.createDocumentFragment() as any; 
        // if the parent dom has listened events, avoid listening events to this container again
        if (rootHasListened(parentDom)) {
            markRootHasListened(container, parentDom);
        }
        // make React add event listener to parent dom instead of fragment
        container.addEventListener = (eventType: string, listener: EventListener, options: boolean) => {
            parentDom.addEventListener(eventType, listener, options);
        };
        // const container = document.createElement('div');
        // console.log(getExecutionContext());
        // const context = getExecutionContext();
        // setExecutionContext(0);
        // render(vnode as ReactElement, parentDom);
        // setExecutionContext(context);
        unstable_renderSubtreeIntoContainer(
            this.$parent as unknown as ReactComponent,
            vnode as ReactElement,
            container,
            () => {
                if (anchor) {
                    parentDom.insertBefore(container, anchor);
                } else {
                    parentDom.appendChild(container);
                }
            } 
        );

        markRootHasListened(parentDom, container);

        // patch(null, vnode, parentDom, anchor, getParent(this), null, this.$SVG);

        // add dom to the $lastInput for findDomFromVNode
        // this.$lastInput.dom = vnode.el;
    }

    $update(
        lastVNode: VNodeComponentClass<Wrapper>,
        vNode: VNodeComponentClass<Wrapper>,
        parentDom: Element,
        anchor: IntactDom | null,
        // mountedQueue: Function[],
        // force: boolean
    ): void {
        const {vnode: lastVnode} = lastVNode.props!;
        const {vnode: nextVnode} = vNode.props!;
        // patch(lastVnode, nextVnode, parentDom, anchor, getParent(this), null, this.$SVG);

        // this.$lastInput.dom = nextVnode.el;
    }

    $unmount(
        vNode: VNodeComponentClass,
        nextVNode: VNodeComponentClass | null
    ): void  {
        // unmount(vNode.props!.vnode, getParent(this), null, !!nextVNode);
    }
}

// function getParent(instance: Wrapper) {
    // let $parent = instance.$parent as Component;

    // do {
        // const vueInstance = $parent.vueInstance;
        // if (vueInstance) {
            // return vueInstance;
        // }
    // } while ($parent = $parent.$parent as Component);

    // // should not hit this
    // [> istanbul ignore next <]
    // return null
// }
