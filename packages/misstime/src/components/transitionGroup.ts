import {Component} from '../core/component';
import {TransitionProps, resolveTransitionProps, forceReflow, addTransitionClass, removeTransitionClass} from './transition';
import {VNode, ChildrenTypes, Types, VNodeElement, TransitionElement} from '../utils/types';
import {isNullOrUndefined, error, isNull, isUndefined, throwError} from 'intact-shared';
import {setTransitionHooks, resolveTransitionHooks, BaseTransition, isInvalidTranstionChild} from './baseTransition';
import {createElementVNode, createFragment, normalizeChildren, createVoidVNode} from '../core/vnode';
import {findDomFromVNode} from '../utils/common';
import {TransitionEvents} from './heplers';

export interface TransitionGroupProps extends Omit<TransitionProps, 'show'> {
    tag?: string
    move?: boolean
    moveClass?: string
}

export class TransitionGroup<P extends TransitionGroupProps = TransitionGroupProps>  extends BaseTransition<P> {
    static template(this: TransitionGroup) {
        const props = this.props;

        const {tag, children} = props;
        let vNode: VNode;
        if (isUndefined(tag)) {
            vNode = createFragment(children, ChildrenTypes.HasKeyedChildren);
        } else {
            vNode = createElementVNode(Types.CommonElement, tag, children, ChildrenTypes.HasKeyedChildren);
        }

        normalizeChildren(vNode, children);

        const lastChildren = this.lastChildren = this.children;
        let nextChildren = vNode.children as VNode[];

        // convert to array if it has only one child
        const childrenType = vNode.childrenType;
        if (childrenType & ChildrenTypes.HasVNodeChildren) {
            vNode.childrenType = ChildrenTypes.HasKeyedChildren; 
            nextChildren = vNode.children = [nextChildren as unknown as VNode];
        } else if (childrenType & ChildrenTypes.HasInvalidChildren) {
            vNode.childrenType = ChildrenTypes.HasVNodeChildren;
            vNode.children = createVoidVNode();
            nextChildren = [];
        }

        if (process.env.NODE_ENV !== 'production') {
            if (isInvalidTranstionChild(nextChildren)) {
                throwError(`<Transtion> received a invalid element: ${JSON.stringify(children)}.`);
            }
        }

        this.children = nextChildren;

        const cssTransitionProps = resolveTransitionProps(props);

        for (let i = 0; i < nextChildren.length; i++) {
            const child = nextChildren[i];
            if (process.env.NODE_ENV !== 'production') {
                if (child.type & Types.PrefixedKey) {
                    error('The children of <TransitionGroup> must have key');
                }
            }
            setTransitionHooks(child, resolveTransitionHooks(child, cssTransitionProps, this));
        }

        for (let i = 0; i < lastChildren.length; i++) {
            const child = lastChildren[i];
            setTransitionHooks(child, resolveTransitionHooks(child, cssTransitionProps, this));
            const dom = findDomFromVNode(child, true);
            child.position = (dom as Element).getBoundingClientRect();
        }

        return vNode;
    }

    private lastChildren: VNode[] = [];
    private children: VNode[] = []; 

    defaults() {
        return {move: true} as Partial<P>;
    }

    mounted() {  }

    updated() {
        const {children, lastChildren} = this;
        if (!lastChildren.length) {
            return;
        }

        const props = this.props;
        if (!props.move) return;

        const moveClass = props.moveClass || `${props.name || 'transition'}-move`;
        const lastChildrenLength = lastChildren.length;

        for (let i = 0; i < lastChildrenLength; i++) {
            callPendingCbs(lastChildren[i]);
        }

        for (let i = 0; i < lastChildrenLength; i++) {
            const vNode = lastChildren[i];
            vNode.newPosition = (vNode.dom as Element).getBoundingClientRect();
        }

        const movedChildren = [];
        for (let i = 0; i < lastChildrenLength; i++) {
            const vNode = lastChildren[i];
            if (applyTransition(vNode)) {
                movedChildren.push(vNode);
            }
        }
        forceReflow();

        for (let i = 0; i < movedChildren.length; i++) {
            const vNode = movedChildren[i];
            const el = vNode.dom as TransitionElement;
            const style = el.style; 
            addTransitionClass(el, moveClass);
            style.transform = style.webkitTransform = style.transitionDuration = style.webkitTransitionDuration = ''
            const cb = el._moveCb = (e?: TransitionEvent) => {
                if (e && e.target !== el) return;

                if (!e || transformRegExp.test(e.propertyName)) {
                    TransitionEvents.off(el, cb as EventListener); 
                    el._moveCb = undefined;
                    removeTransitionClass(el, moveClass);
                }
            };
            TransitionEvents.on(el, cb as EventListener);
        }
    }
}

const transformRegExp = /transform$/

function callPendingCbs(vNode: VNode) {
    const el = vNode.dom as TransitionElement;

    if (el._moveCb) {
        el._moveCb();
    }

    if (el._enterCb) {
        el._enterCb();
    }
}

function applyTransition(vNode: VNode) {
    const {position, newPosition} = vNode;
    const dx = position!.left - newPosition!.left;
    const dy = position!.top - newPosition!.top;

    if (dx || dy) {
        const s = (vNode.dom as HTMLElement).style;
        s.transform = s.webkitTransform = `translate(${dx}px, ${dy}px)`;
        s.transitionDuration = s.webkitTransitionDuration = '0s';

        return vNode;
    }
}
