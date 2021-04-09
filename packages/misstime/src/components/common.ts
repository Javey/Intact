import type {Animate} from './animate';
import {addClass, removeClass} from './heplers';
import {findDomFromVNode} from '../utils/common';
import {nextFrame, whenAnimationEnds} from './heplers';

export function addAnimateClass(component: Animate<any>, dom: Element, className: string) {
    component.classNames[className] = true;

    addClass(dom, className);
}

export function removeAnimateClass(component: Animate<any>, dom: Element, className: string) {
    component.classNames[className] = false;

    removeClass(dom, className);
}

export function onEnter(component: Animate<any>) {
    const dom = findDomFromVNode(component.$lastInput!, true) as Element;
    const {transition} = component.props;

    addAnimateClass(component, dom, `${transition}-enter`);
    nextFrame(() => {
        addAnimateClass(component, dom, `${transition}-enter-active`);
        removeAnimateClass(component, dom, `${transition}-enter`);
        whenAnimationEnds(dom, () => onEnterEnd(component, dom));
    });
}

export function onEnterEnd(component: Animate<any>, dom: Element) {
    const {transition} = component.props;

    removeAnimateClass(component, dom, `${transition}-enter-active`);
}
