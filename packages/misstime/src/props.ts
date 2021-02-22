import {VNode, Types, LinkedEvent} from './types';
import {isNullOrUndefined, isString, isEventProp, namespaces} from './utils';
import {delegatedEvents, handleDelegatedEvent} from './events/delegation';
import {isLinkEvent, isSameLinkEvent} from './events/linkEvent';
import {attachEvent} from './events/attachEvents';
import {normalizeEventName} from './common';
import {isControlledFormElement, processElement} from './wrappers/process';

export function mountProps(vNode: VNode, type: Types, props: any, dom: Element, isSVG: boolean) {
    let hasControlledValue = false;
    const isFormElement = (type & Types.FormElement) > 0;
    // if (isFormElement) {
        // hasControlledValue = isControlledFormElement(props);
    // }
    for (const prop in props) {
        patchProp(prop, null, props[prop], dom, isSVG, hasControlledValue);
    }
    if (isFormElement) {
        processElement(type, vNode, dom, props, true/*, hasControlledValue*/);
    }
}

export function patchProp(prop: string, lastValue: any, nextValue: any, dom: Element, isSVG: boolean, hasControlledValue: boolean) {
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
            if (hasControlledValue && prop === 'value') break;
            value = isNullOrUndefined(nextValue) ? '' : nextValue;
            if ((dom as any)[prop] !== value) {
                (dom as any)[prop] = value;
            }
            break;
        // TODO: scrollLeft/scrollTop must be handled after style
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
        return;
    }
    const domStyle = (dom as HTMLElement).style;
    if (isString(nextValue)) {
        domStyle.cssText = nextValue; 
        return;
    }

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

function patchEvent(name: string, lastValue: any, nextValue: any, dom: Element) {
    if (isLinkEvent(nextValue)) {
        if (isSameLinkEvent(lastValue, nextValue)) {
            return;
        }
        nextValue = wrapLinkEvent(nextValue);
    }
    attachEvent(dom, normalizeEventName(name), nextValue);
}

function wrapLinkEvent(nextValue: LinkedEvent<any, any>) {
    const ev = nextValue.event;

    return function(e: Event) {
        ev(nextValue.data, e);
    }
}
