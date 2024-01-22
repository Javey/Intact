import {VNode, Types, LinkedEvent, Reference, TransitionElement, IntactElement, VNodeElement, ChildrenTypes} from './types';
import {isNullOrUndefined, isUndefined, isString, isEventProp, isNull} from 'intact-shared';
import {delegatedEvents, handleDelegatedEvent} from '../events/delegation';
import {isLinkEvent, isSameLinkEvent, wrapLinkEvent} from '../events/linkEvent';
import {attachEvent, attachModelEvent} from '../events/attachEvents';
import {namespaces, REFERENCE, normalizeEventName} from './common';
import {processElement} from '../wrappers/process';
import {unmountAllChildren, unmount} from '../core/unmount';

export function mountProps(vNode: VNode, type: Types, props: any, dom: Element, isSVG: boolean) {
    const isFormElement = (type & Types.FormElement) > 0;
    REFERENCE.value = false;
    for (const prop in props) {
        patchProp(prop, null, props[prop], dom, isSVG, isFormElement, REFERENCE, null);
    }
    if (isFormElement) {
        processElement(type, vNode, dom, props, true, REFERENCE.value);
    }
}

export function patchProp(
    prop: string,
    lastValue: any,
    nextValue: any,
    dom: Element,
    isSVG: boolean,
    isFormElement: boolean,
    hasControlledValue: Reference,
    lastVNode: VNodeElement | null,
) {
    let value;
    switch (prop) {
        case 'children':
        case 'className':
        case 'defaultValue':
        case 'key':
        case 'ref':
        case 'multiple':
        case 'selectedIndex':
        case '$blocks':
            break;
        // case 'autoFocus':
            // (dom as any).autofocus = !!nextValue;
            // break;
        case 'autofocus':
        case 'allowfullscreen':
        case 'autoplay':
        case 'capture':
        case 'checked':
        case 'controls':
        case 'default':
        case 'disabled':
        case 'hidden':
        case 'indeterminate':
        case 'loop':
        case 'muted':
        case 'novalidte':
        case 'open':
        case 'readOnly':
        case 'required':
        case 'reversed':
        case 'scoped':
        case 'seamless':
        case 'selected':
        case 'spellcheck':
            (dom as any)[prop] = !!nextValue;
            break;
        // special bool value
        case 'formnovalidate':
            (dom as any).formNoValidate = !!nextValue;
            break;
        case 'defaultChecked':
        case 'value':
        case 'volume':
            // if (hasControlledValue && prop === 'value') break;
            if (prop === 'value') {
                (dom as IntactElement).$VA = nextValue;
                if (isFormElement) {
                    hasControlledValue.value = true;
                    break;
                }
            }
            value = isNullOrUndefined(nextValue) ? '' : nextValue;
            if ((dom as any)[prop] !== value) {
                (dom as any)[prop] = value;
            }
            break;
        // TODO: scrollLeft/scrollTop must be handled after style and mounted (use mountedQueue)
        case 'scrollLeft':
        case 'scrollTop':
            value = isNullOrUndefined(nextValue) ? 0 : nextValue;
            if (dom[prop] !== value) {
                dom[prop] = value;
            }
            break;
        case 'innerHTML':
            patchInnerHTML(lastValue, nextValue, dom, lastVNode);
            break;
        case 'style':
            patchStyle(lastValue, nextValue, dom);
            break;
        // handle v-model
        case '$model:value':
            (dom as IntactElement).$M = nextValue;
            break;
        case 'trueValue':
            (dom as IntactElement).$TV = nextValue;
            break;
        case 'falseValue':
            (dom as IntactElement).$FV = nextValue;
            break;
        case 'ev-$model:change':
            patchModelEvent('change', lastValue, nextValue, dom);
            break;
        case 'ev-$model:input':
            patchModelEvent('input', lastValue, nextValue, dom);
            break;
        default:
            if (delegatedEvents[prop]) {
                handleDelegatedEvent(prop, lastValue, nextValue, dom); 
            } else if (isEventProp(prop)) {
                patchEvent(prop, lastValue, nextValue, dom);
            } else if (isNullOrUndefined(nextValue)) {
                dom.removeAttribute(prop); 
            } else if (isSVG && namespaces[prop]) {
                dom.setAttributeNS(namespaces[prop], prop, nextValue);
            } else {
                dom.setAttribute(prop, nextValue);
            }
            break;
    }
}

function patchStyle(lastValue: any, nextValue: any, dom: Element) {
    if (isNullOrUndefined(nextValue)) {
        dom.removeAttribute('style');
    } else {
        // In most cases, we need not read dom.style
        // const domStyle = (dom as HTMLElement).style as any;
        if (isString(nextValue)) {
            (dom as HTMLElement).style.cssText = nextValue; 
        } else {
            let style;
            let value;
            let domStyle: any;
            const hasLastValue = !isNullOrUndefined(lastValue);
            if (hasLastValue && !isString(lastValue)) {
                for (style in nextValue) {
                    value = nextValue[style];
                    if (value !== lastValue[style]) {
                        (domStyle || (domStyle = (dom as HTMLElement).style))[style] = value;
                    }
                }
                for (style in lastValue) {
                    if (isNullOrUndefined(nextValue[style])) {
                        (domStyle || (domStyle = (dom as HTMLElement).style))[style] = '';
                    }
                }
            } else {
                if (hasLastValue) {
                    // remove style firstly if lastValue is string
                    dom.removeAttribute('style');
                }
                for (style in nextValue) {
                    value = nextValue[style];
                    (domStyle || (domStyle = (dom as HTMLElement).style))[style] = value;
                }
            }
        }
    }

    // handle Transition display
    const display = (dom as TransitionElement).$TD;
    if (!isUndefined(display)) {
        (dom as TransitionElement).style.display = display; 
    }
}

function patchEvent(name: string, lastValue: EventListener | LinkedEvent<any>, nextValue: EventListener | LinkedEvent<any>, dom: Element) {
    if (isLinkEvent(nextValue)) {
        if (isSameLinkEvent(lastValue, nextValue)) {
            return;
        }
        nextValue = wrapLinkEvent(nextValue);
    }
    attachEvent(dom, normalizeEventName(name), nextValue);
}

function patchModelEvent(name: string, lastValue: EventListener | LinkedEvent<any>, nextValue: EventListener | LinkedEvent<any>, dom: Element) {
    if (isLinkEvent(nextValue)) {
        if (isSameLinkEvent(lastValue, nextValue)) {
            return;
        }
        nextValue = wrapLinkEvent(nextValue);
    }
    attachModelEvent(dom, name, nextValue);
}

function patchInnerHTML(lastValue: string | undefined | null, nextValue: string | undefined | null, dom: Element, lastVNode: VNodeElement | null) {
    if (isNullOrUndefined(lastValue)) {
        lastValue = '';
    }
    if (isNullOrUndefined(nextValue)) {
        nextValue = '';
    }
    if (lastValue !== nextValue) {
        if (!isNull(lastVNode)) {
            if (lastVNode.childrenType & ChildrenTypes.MultipleChildren) {
                unmountAllChildren(lastVNode.children as VNode[]);
            } else if (lastVNode.childrenType === ChildrenTypes.HasVNodeChildren) {
                unmount(lastVNode.children as VNode, null);
            }
            lastVNode.children = null;
            lastVNode.childrenType = ChildrenTypes.HasInvalidChildren;
        }
        dom.innerHTML = nextValue;
    }
}
