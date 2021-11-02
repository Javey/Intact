import {Component} from '../core/component';
import {
    isNullOrUndefined, 
    isArray,
    error,
    isStringOrNumber,
    throwError,
    EMPTY_OBJ,
} from 'intact-shared';
import {
    VNode,
    VNodeTag,
    Props,
    TransitionHooks,
    TransitionElement,
    Types,
    VNodeComponentClass,
    NormalizedChildren,
    findDomFromVNode,
} from 'misstime';

export type BaseTransitionCallback = (el: TransitionElement) => void;
export type BaseTransitionDoneCallback = (el: TransitionElement, done: () => void) => void;

export interface BaseTransitionProps {
    // mode?: 'in-out' | 'out-in' | 'default'
    appear?: boolean
    show?: boolean

    // enter
    onBeforeEnter?: BaseTransitionCallback
    onEnter?: BaseTransitionDoneCallback
    onAfterEnter?: BaseTransitionCallback
    onEnterCancelled?: BaseTransitionCallback
    // leave
    onBeforeLeave?: BaseTransitionCallback
    onLeave?: BaseTransitionDoneCallback
    onAfterLeave?: BaseTransitionCallback
    onLeaveCancelled?: BaseTransitionCallback
    // appear
    onBeforeAppear?: BaseTransitionCallback
    onAppear?: BaseTransitionDoneCallback
    onAfterAppear?: BaseTransitionCallback
    onAppearCancelled?: BaseTransitionCallback
}

export class BaseTransition<P extends BaseTransitionProps = BaseTransitionProps> extends Component<P> {
    static template(this: BaseTransition) {
        const props = this.$props;
        const children = props.children;

        if (isNullOrUndefined(children)) return null;
        if (process.env.NODE_ENV !== 'production') {
            if (isArray(children) && children.length > 1) {
                error(
                    `<Transition> can only be used on a single element or component. ` + 
                    `Use <TransitionGroup> for lists.`
                );
            } else if (isInvalidTranstionChild(children as NormalizedChildren)) {
                throwError(`<Transtion> received a invalid element: ${JSON.stringify(children)}.`);
            }
        }

        // const {mode} = props;
        const vNode = (isArray(children) ? children[0] : children) as VNode;
       
        // if (this.isLeaving) {
            // return null;
        // }

        const enterHooks = resolveTransitionHooks(vNode, props, this);
        setTransitionHooks(vNode, enterHooks);

        return vNode;
    }

    static defaults(): Partial<BaseTransitionProps> {
        return {show: true};
    };

    // private isLeaving: boolean = false;
    public leavingVNodesCache: Record<string, VNode> = {};
    public el: TransitionElement | null = null;
    public originalDisplay: string = '';

    mounted() {
        const lastInput = this.$lastInput!;
        // is a void vNode 
        if (lastInput.type & Types.Text) return;

        const el = this.el = findDomFromVNode(lastInput, true) as TransitionElement;
        const display = el.style.display;
        this.originalDisplay = display === 'none' ? '' : display;

        if (!this.$props.show) {
            setDisplay(el, 'none');
        }
    }

    updated(
        lastVNode: VNodeComponentClass<BaseTransition<P>>,
        nextVNode: VNodeComponentClass<BaseTransition<P>>
    ) {
        const lastValue = (lastVNode.props || EMPTY_OBJ).show;
        const nextValue = (nextVNode.props || EMPTY_OBJ).show;
        if (lastValue !== nextValue) {
            const lastInput = this.$lastInput!;
            const transition = lastInput.transition;
            // maybe the element has been removed
            if (!transition) return;

            // maybe the element has changed
            const el = this.el = findDomFromVNode(lastInput, true) as TransitionElement;

            if (nextValue) {
                transition.beforeEnter(el);
                setDisplay(el, this.originalDisplay);
                transition.enter(el);
            } else {
                transition.leave(el, () => {
                    setDisplay(el, 'none');
                });
            }
        }
    }

    unmounted() {
        const el = this.el;
        if (el) {
            el.$TD = undefined;
        }
    }
}

export function resolveTransitionHooks(
    vNode: VNode,
    props: Props<BaseTransitionProps, BaseTransition>,
    component: BaseTransition
): TransitionHooks {
    const {
        appear,
        // mode,
        onBeforeEnter,
        onEnter,
        onAfterEnter,
        onEnterCancelled,
        onBeforeLeave,
        onLeave,
        onAfterLeave,
        onLeaveCancelled,
        onBeforeAppear,
        onAppear,
        onAfterAppear,
        onAppearCancelled
    } = props;

    const key = vNode.key as string;
    const leavingVNodesCache = component.leavingVNodesCache;

    return {
        beforeEnter(el) {
            let hook = onBeforeEnter;
            if (!component.$mounted) {
                if (appear) {
                    hook = onBeforeAppear || onBeforeEnter;
                } else {
                    return;
                }
            }

            // for same element (show)
            if (el._leaveCb) {
                el._leaveCb(true);
            }

            // for toggled element with the same key (v-if)
            const leavingVNode = leavingVNodesCache[key]; 
            if (leavingVNode && vNode.tag === leavingVNode.tag) {
                const el = findDomFromVNode(leavingVNode, true) as TransitionElement;
                const leaveCb = el._leaveCb;
                if (leaveCb) {
                    leaveCb();
                }
            }
            
            hook && hook(el);
        },

        enter(el) {
            let hook = onEnter;
            let afterHook = onAfterEnter;
            let cancelHook = onEnterCancelled;

            if (!component.$mounted) {
                if (!appear) return;

                hook = onAppear || onEnter;
                afterHook = onAfterAppear || onAfterEnter;
                cancelHook = onAppearCancelled || onEnterCancelled;
            }

            let called = false;
            const done = el._enterCb = (cancelled?) => {
                if (called) return;
                called = true;
                if (cancelled) {
                    cancelHook && cancelHook(el);
                } else {
                    afterHook && afterHook(el);
                }

                el._enterCb = undefined;
            };

            if (hook) {
                hook(el, done);
                if (hook.length <= 1) {
                    done();
                }
            } else {
                done();
            }
        },

        leave(el, remove) {
            if (el._enterCb) {
                el._enterCb(true);
            }
            if (component.$unmounted) {
                return remove();
            }

            onBeforeLeave && onBeforeLeave(el);
            let called = false;
            const done = el._leaveCb = (cancelled?) => {
                if (called) return;
                called = true;
                remove();
                if (cancelled) {
                    onLeaveCancelled && onLeaveCancelled(el);
                } else {
                    onAfterLeave && onAfterLeave(el);
                }
                el._leaveCb = undefined;
                if (leavingVNodesCache[key] === vNode) {
                    delete leavingVNodesCache[key];
                }
            };

            leavingVNodesCache[key] = vNode;

            if (onLeave) {
                onLeave(el, done);
                if (onLeave.length <= 1) {
                    done();
                }
            } else {
                done();
            }
        }
    };
}

export function setTransitionHooks(vNode: VNode, hooks: TransitionHooks) {
    if (vNode.type & Types.ComponentClass) {
        const component = (vNode as VNodeComponentClass).children;
        if (!isNullOrUndefined(component) && component.$inited) {
            setTransitionHooks(component.$lastInput!, hooks);
        } else {
            vNode.transition = hooks;
        }
    } else {
        vNode.transition = hooks;
    } 
}

function setDisplay(dom: TransitionElement, display: string) {
    dom.$TD = dom.style.display = display;
}

export function isInvalidTranstionChild(vNode: NormalizedChildren) {
    return isStringOrNumber(vNode) || 
        typeof vNode === 'boolean' || 
        (vNode as VNode).type & Types.TextElement
}
