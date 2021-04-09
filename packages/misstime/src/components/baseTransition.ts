import {Component} from '../core/component';
import {isNullOrUndefined, isArray, error, isUndefined, isFunction} from '../utils/helpers';
import {VNode, Props, TransitionHooks, TransitionElement} from '../utils/types';

export type BaseTransitionCallback = (el: TransitionElement) => void;
export type BaseTransitionDoneCallback = (el: TransitionElement, done: () => void) => void;

export interface BaseTransitionProps {
    mode?: 'in-out' | 'out-in' | 'default'
    appear?: boolean

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


class BaseTransition extends Component<BaseTransitionProps> {
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
            }
        }

        const {mode} = props;
        const vNode = children as VNode;
       
        if (this.isLeaving) {
            return null;
        }

        const enterHooks = resolveTranstionHooks(vNode, props, this);
        setTransitionHooks(vNode, enterHooks);
    }

    private isLeaving: boolean = false;

    init() {

    } 
}

function resolveTranstionHooks(
    vNode: VNode,
    props: Props<BaseTransitionProps, BaseTransition>,
    component: BaseTransition
): TransitionHooks {
    const {
        appear,
        mode,
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

    // const key = vNode.key;

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

            // if (el._leaveCb) {
                // el._leaveCb(true);
            // }
            
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
            // const key = vNode.key;
            if (el._enterCb) {
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
            }

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

function callHook(hook: Function | undefined, el: TransitionElement) {
    if (isUndefined(hook)) return;
    hook(el);
    
    // if (isFunction(hook)) {
        // hook(el);
    // } else {
        // for (let i = 0; i < hook.length; i++) {
            // hook[i](el);
        // }
    // }
}

function setTransitionHooks(vNode: VNode, hooks: TransitionHooks) {
    
}
