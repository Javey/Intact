import {Component} from '../core/component';
import {
    isNullOrUndefined, 
    isArray,
    error,
    isUndefined,
    isNull,
    isFunction,
    isStringOrNumber,
    throwError,
} from '../utils/helpers';
import {VNode, Props, TransitionHooks, TransitionElement, Types, VNodeComponentClass} from '../utils/types';
import {findDomFromVNode} from '../utils/common';

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

export class BaseTransition extends Component<BaseTransitionProps> {
    static template(this: BaseTransition) {
        const props = this.props;
        const children = props.children;

        if (isNullOrUndefined(children)) return null;
        if (process.env.NODE_ENV !== 'production') {
            if (isArray(children) && children.length > 1) {
                error(
                    `<Transition> can only be used on a single element or component. ` + 
                    `Use <TransitionGroup> for lists.`
                );
            } else if (
                isStringOrNumber(children) || 
                typeof children === 'boolean' || 
                (children as VNode).type & Types.TextElement
            ) {
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

    // private isLeaving: boolean = false;
    public leavingVNodesCache: Record<string, VNode> = {};
    public el: TransitionElement | null = null;

    defaults() {
        return {show: true};
    }
    
    mounted() {
        const lastInput = this.$lastInput!;
        // is a void vNode 
        if (lastInput.type & Types.Text) return;

        const el = this.el = findDomFromVNode(lastInput, true) as TransitionElement;
        const display = el.style.display;
        const originDisplay = display === 'none' ? '' : display;

        if (!this.props.show) {
            setDisplay(el, 'none');
        }

        this.on('$receive:show', (show) => {
            if (show) {
                lastInput.transition!.beforeEnter(el);
                setDisplay(el, originDisplay);
                lastInput.transition!.enter(el);
            } else {
                lastInput.transition!.leave(el, () => {
                    setDisplay(el, 'none');
                });
            }
        });
    }

    unmounted() {
        const el = this.el;
        if (!isNull(el)) {
            el.$TD = undefined;
        }
    }
}

function resolveTransitionHooks(
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
            if (!isUndefined(el._leaveCb)) {
                el._leaveCb(true);
            }

            // for toggled element with the same key (v-if)
            const leavingVNode = leavingVNodesCache[key]; 
            if (!isUndefined(leavingVNode) && vNode.tag === leavingVNode.tag) {
                const el = findDomFromVNode(leavingVNode, true) as TransitionElement;
                const leaveCb = el._leaveCb;
                if (!isUndefined(leaveCb)) {
                    leaveCb();
                }
            }
            
            callHook(hook, el);
        },

        enter(el) {
            let hook = onEnter;
            let afterHook = onAfterEnter;
            let cancelHook = onEnterCancelled;

            if (!component.$mounted) {
                if (appear) {
                    hook = onAppear || onEnter;
                    afterHook = onAfterAppear || onAfterEnter;
                    cancelHook = onAppearCancelled || onEnterCancelled;
                } else {
                    return;
                }
            }

            let called = false;
            const done = el._enterCb = (cancelled?) => {
                if (called) return;
                called = true;
                if (cancelled) {
                    callHook(cancelHook, el);
                } else {
                    callHook(afterHook, el);
                }

                el._enterCb = undefined;
            };

            if (!isUndefined(hook)) {
                hook(el, done);
                if (hook.length <= 1) {
                    done();
                }
            } else {
                done();
            }
        },

        leave(el, remove) {
            if (!isUndefined(el._enterCb)) {
                el._enterCb(true);
            }
            if (component.$unmounted) {
                return remove();
            }

            callHook(onBeforeLeave, el);
            let called = false;
            const done = el._leaveCb = (cancelled?) => {
                if (called) return;
                called = true;
                remove();
                if (cancelled) {
                    callHook(onLeaveCancelled, el);
                } else {
                    callHook(onAfterLeave, el);
                }
                el._leaveCb = undefined;
                if (leavingVNodesCache[key] === vNode) {
                    delete leavingVNodesCache[key];
                }
            };

            leavingVNodesCache[key] = vNode;

            if (!isUndefined(onLeave)) {
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

function callHook(hook: Function | undefined, el: TransitionElement) {
    if (!isUndefined(hook)) {
        hook(el);
    } 
}

function setTransitionHooks(vNode: VNode, hooks: TransitionHooks) {
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
