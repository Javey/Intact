import {VNode, Types, LinkedEvent, Reference, TransitionElement, IntactElement} from './types';
import {isNullOrUndefined, isUndefined, isString, isEventProp} from 'intact-shared';
import {delegatedEvents, handleDelegatedEvent} from '../events/delegation';
import {isLinkEvent, isSameLinkEvent, wrapLinkEvent} from '../events/linkEvent';
import {attachEvent, attachModelEvent} from '../events/attachEvents';
import {namespaces, REFERENCE, normalizeEventName} from './common';
import {processElement} from '../wrappers/process';

export function mountProps(vNode: VNode, type: Types, props: any, dom: Element, isSVG: boolean) {
    const isFormElement = (type & Types.FormElement) > 0;
    REFERENCE.value = false;
    for (const prop in props) {
        patchProp(prop, null, props[prop], dom, isSVG, isFormElement, REFERENCE);
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
            (dom as any)[prop] = !!nextValue;
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
            // TODO: umount children if it has component children
            (dom as any).innerHTML = nextValue;
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
        // because we set style by cssText or setProperty,
        // we must set style attribute before removing it in webkit,
        // but it does not matter
        // dom.setAttribute('style', '');
        dom.removeAttribute('style');
    } else {
        const domStyle = (dom as HTMLElement).style;
        if (isString(nextValue)) {
            domStyle.cssText = nextValue; 
        } else {
            let style;
            let value;
            if (!isNullOrUndefined(lastValue) && !isString(lastValue)) {
                for (style in nextValue) {
                    value = nextValue[style];
                    if (value !== lastValue[style]) {
                        domStyle.setProperty(style, value);
                    }
                }
                for (style in lastValue) {
                    if (isNullOrUndefined(nextValue[style])) {
                        domStyle.removeProperty(style);
                    }
                }
            } else {
                // TODO: remove style firstly if lastValue is string
                for (style in nextValue) {
                    value = nextValue[style];
                    domStyle.setProperty(style, value);
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
