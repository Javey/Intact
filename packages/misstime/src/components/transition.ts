// import {Component} from '../core/component';
import {ComponentFunction, TransitionElement, Types} from '../utils/types';
import {BaseTransition, BaseTransitionProps} from './baseTransition';
import {createComponentVNode} from '../core/vnode'; 
import {isNullOrUndefined, isUndefined, isObject} from '../utils/helpers';
import {addClass, removeClass, nextFrame, whenTransitionEnds} from './heplers';

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
        name = 'v',
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

    const finishEnter = (el: TransitionElement, isAppear: boolean, done?: () => void) => {
        if (isAppear) {
            removeTransitionClass(el, appearToClass); 
            removeTransitionClass(el, appearActiveClass);
        } else {
            removeTransitionClass(el, enterToClass); 
            removeTransitionClass(el, enterActiveClass);
        }
        if (!isUndefined(done)) {
            done();
        }
    };

    const finishLeave = (el: TransitionElement, done?: () => void) => {
        removeTransitionClass(el, leaveToClass);
        removeTransitionClass(el, leaveActiveClass);
        if (!isUndefined(done)) {
            done();
        }
    };

    const makeEnterHook = (isAppear: boolean) => {
        return (el: TransitionElement, done: () => void) => {
            const hook = isAppear ? onAppear : onEnter;
            const resolve = () => finishEnter(el, isAppear, done);
            if (!isUndefined(hook)) {
                hook(el, resolve);
            }
            nextFrame(() => {
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
            });
        }
    };

    return {
        ...baseProps,
        onBeforeEnter(el) {
            if (!isUndefined(onBeforeEnter)) onBeforeEnter(el);
            addTransitionClass(el, enterFromClass);
            addTransitionClass(el, enterActiveClass);
        },
        onEnter: makeEnterHook(false),
        onEnterCancelled(el) {
            finishEnter(el, false);
            if (!isUndefined(onEnterCancelled)) {
                onEnterCancelled(el);
            }
        },

        onBeforeAppear(el) {
            if (!isUndefined(onBeforeAppear)) onBeforeAppear(el);
            addTransitionClass(el, appearFromClass);
            addTransitionClass(el, appearActiveClass);
        },
        onAppear: makeEnterHook(true),
        onAppearCancelled(el) {
            finishEnter(el, true);
            if (!isUndefined(onAppearCancelled)) {
                onAppearCancelled(el);
            }
        },

        onLeave(el, done) {
            const resolve = () => finishLeave(el, done);
            addTransitionClass(el, leaveFromClass);
            forceReflow();
            addTransitionClass(el, leaveActiveClass);
            nextFrame(() => {
                removeTransitionClass(el, leaveFromClass);
                addTransitionClass(el, leaveToClass);
                if (isUndefined(onLeave) || onLeave.length <= 1) {
                    whenTransitionEnds(el, resolve);
                }
            });
        },
        onLeaveCancelled(el) {
            finishLeave(el);
            if (!isUndefined(onLeaveCancelled)) {
                onLeaveCancelled(el);
            }
        }
    }
}

function addTransitionClass(el: TransitionElement, className: string) {
    addClass(el, className);
    (el.$TC || (el.$TC = {}))[className] = true;
}

function removeTransitionClass(el: TransitionElement, className: string) {
    removeClass(el, className);
    const transitionClassname = el.$TC;
    if (!isUndefined(transitionClassname)) {
        delete transitionClassname[className];
    }
}

function forceReflow() {
    return document.body.offsetHeight;
}
