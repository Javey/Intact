import {ComponentFunction, TransitionElement, Types, createComponentVNode} from 'misstime';
import {BaseTransition, BaseTransitionProps} from './baseTransition';
import {isUndefined} from 'intact-shared';
import {nodeOps, nextFrame, whenTransitionEnds} from './heplers';

type TransitionElementWithCancel = TransitionElement & {
    _cancelNextFrame?: (() => void) | null
}

export interface TransitionProps extends BaseTransitionProps {
    name?: string
    // type?: 'transition' | 'animation'
    css?: boolean
    // duration?: number | {enter: number; leave: number}

    // custom transition classes
    enterFromClass?: string
    enterActiveClass?: string
    enterToClass?: string
    appearFromClass?: string
    appearActiveClass?: string
    appearToClass?: string
    leaveFromClass?: string
    leaveActiveClass?: string
    leaveToClass?: string
}

export const Transition: ComponentFunction<TransitionProps, BaseTransition> = (props) => {
    return createComponentVNode(Types.ComponentClass, BaseTransition, resolveTransitionProps(props), props.key, props.ref);
}

const TransitionTypeDefs = {
    name: String,
    // type: String,
    css: Boolean,
    // duration: [String, Number, Object],
    enterFromClass: String,
    enterActiveClass: String,
    enterToClass: String,
    appearFromClass: String,
    appearActiveClass: String,
    appearToClass: String,
    leaveFromClass: String,
    leaveActiveClass: String,
    leaveToClass: String,
};

Transition.typeDefs = TransitionTypeDefs;

export function resolveTransitionProps(props: TransitionProps): BaseTransitionProps {
     const {
        name = 'transition',
        // type,
        css = true,
        // duration,
        enterFromClass = `${name}-enter-from`,
        enterActiveClass = `${name}-enter-active`,
        enterToClass = `${name}-enter-to`,
        appearFromClass = enterFromClass,
        appearActiveClass = enterActiveClass,
        appearToClass = enterToClass,
        leaveFromClass = `${name}-leave-from`,
        leaveActiveClass = `${name}-leave-active`,
        leaveToClass = `${name}-leave-to`,
        ...baseProps
    } = props;

    if (!css) return baseProps; 

    // let enterDuration: number | null = null;
    // let leaveDuration: number | null = null;
    // if (isObject(duration)) {
        // enterDuration = duration.enter;
        // leaveDuration = duration.leave;
    // } else if (!isNullOrUndefined(duration)) {
        // enterDuration = leaveDuration = duration;
    // }

    const {
        onBeforeEnter,
        onEnter,
        onEnterCancelled,
        onLeave,
        onLeaveCancelled,
        onBeforeAppear = onBeforeEnter,
        onAppear = onEnter,
        onAppearCancelled = onEnterCancelled,
    } = baseProps;

    // let cancelNextFrame: (() => void) | null = null;

    const cancelFrame = (el: TransitionElementWithCancel) => {
        const cancelNextFrame = el._cancelNextFrame;
        if (cancelNextFrame) {
            cancelNextFrame();
            forceReflow();
            el._cancelNextFrame = null;
        }
    }

    const finishEnter = (el: TransitionElementWithCancel, isAppear: boolean, done?: () => void) => {
        if (isAppear) {
            if (el._cancelNextFrame) {
                removeTransitionClass(el, appearFromClass);
            } else {
                removeTransitionClass(el, appearToClass); 
            }
            removeTransitionClass(el, appearActiveClass);
        } else {
            if (el._cancelNextFrame) {
                removeTransitionClass(el, enterFromClass);
            } else {
                removeTransitionClass(el, enterToClass); 
            }
            removeTransitionClass(el, enterActiveClass);
        }
        done && done();
    };

    const finishLeave = (el: TransitionElementWithCancel, done?: () => void) => {
        if (el._cancelNextFrame) {
            removeTransitionClass(el, leaveFromClass);
        } else {
            removeTransitionClass(el, leaveToClass);
        }
        removeTransitionClass(el, leaveActiveClass);
        done && done();
    };

    const makeEnterHook = (isAppear: boolean) => {
        return (el: TransitionElementWithCancel, done: () => void) => {
            const hook = isAppear ? onAppear : onEnter;
            const resolve = () => finishEnter(el, isAppear, done);
            hook && hook(el, resolve);
            el._cancelNextFrame = nextFrame(() => {
                if(isAppear) {
                    removeTransitionClass(el, appearFromClass);
                    addTransitionClass(el, appearToClass);
                } else {
                    removeTransitionClass(el, enterFromClass);
                    addTransitionClass(el, enterToClass);
                }
                if (isUndefined(hook) || hook.length <= 1) {
                    whenTransitionEnds(el, resolve); 
                }
                el._cancelNextFrame = null;
            });
        }
    };

    return {
        ...baseProps,
        onBeforeEnter(el) {
            onBeforeEnter && onBeforeEnter(el);
            addTransitionClass(el, enterFromClass);
            addTransitionClass(el, enterActiveClass);
        },
        onEnter: makeEnterHook(false),
        onEnterCancelled(el) {
            finishEnter(el, false);
            cancelFrame(el);
            onEnterCancelled && onEnterCancelled(el);
        },

        onBeforeAppear(el) {
            onBeforeAppear && onBeforeAppear(el);
            addTransitionClass(el, appearFromClass);
            addTransitionClass(el, appearActiveClass);
        },
        onAppear: makeEnterHook(true),
        onAppearCancelled(el) {
            finishEnter(el, true);
            cancelFrame(el);
            onAppearCancelled && onAppearCancelled(el);
        },

        onLeave(el: TransitionElementWithCancel, done) {
            const resolve = () => finishLeave(el, done);
            addTransitionClass(el, leaveFromClass);
            forceReflow();
            addTransitionClass(el, leaveActiveClass);
            el._cancelNextFrame = nextFrame(() => {
                removeTransitionClass(el, leaveFromClass);
                addTransitionClass(el, leaveToClass);
                if (isUndefined(onLeave) || onLeave.length <= 1) {
                    whenTransitionEnds(el, resolve);
                }
                el._cancelNextFrame = null;
            });
            onLeave && onLeave(el, resolve);
        },
        onLeaveCancelled(el) {
            finishLeave(el);
            cancelFrame(el);
            onLeaveCancelled && onLeaveCancelled(el);
        }
    }
}

export function addTransitionClass(el: TransitionElement, className: string) {
    nodeOps.addClass(el, className);
    (el.$TC || (el.$TC = {}))[className] = true;
}

export function removeTransitionClass(el: TransitionElement, className: string) {
    nodeOps.removeClass(el, className);
    const transitionClassname = el.$TC;
    if (transitionClassname) {
        delete transitionClassname[className];
        if (Object.keys(transitionClassname).length === 0) {
            el.$TC = undefined;
        }
    }
}

export function forceReflow() {
    return document.body.offsetHeight;
}
