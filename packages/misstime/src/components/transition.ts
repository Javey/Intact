import {Component} from '../core/component';
import {ComponentConstructor, ComponentFunction, VNodeProps, TypeDefs} from '../utils/types';
import {createVNode as h} from '../core/vnode'; 
import {isNullOrUndefined} from '../utils/helpers';
import {className, nextFrame} from './heplers';
import {onEnter} from './common';

export interface TransitionProps {
    // mode?: 'in-out' | 'out-in' | 'default'
    // appear?: boolean

    // onBeforeEnter?: (dom: Element) => void

    name?: string
    type?: 'transition' | 'animation'
    css?: boolean
    duration?: number | {enter: number; leave: number}

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

export interface ElementWithTranstion extends HTMLElement {
    $TC?: Record<string, boolean>
}

const Transition: ComponentFunction<TransitionProps> = (props) => {
    return props.children;
}

const TransitionTypeDefs = {
    name: String,
    type: String,
    css: Boolean,
    duration: [String, Number, Object],
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

export function resolveTranstionProps(props: TransitionProps) {
     const {
        name = 'v',
        type,
        css = true,
        duration,
        enterFromClass = `${name}-enter-from`,
        enterActiveClass = `${name}-enter-active`,
        enterToClass = `${name}-enter-to`,
        appearFromClass = enterFromClass,
        appearActiveClass = enterActiveClass,
        appearToClass = enterToClass,
        leaveFromClass = `${name}-leave-from`,
        leaveActiveClass = `${name}-leave-active`,
        leaveToClass = `${name}-leave-to`,
    } = props;

      
}
