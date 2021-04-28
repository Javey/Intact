import {VNode, Types, IntactElement} from '../utils/types';
import {isInvalid, throwError, error, isNullOrUndefined, hasDocumentAvailable} from 'intact-shared';
import {directClone} from './vnode';
import {mount} from './mount';
import {remove} from './unmount';
import {patch} from './patch';
import {callAll} from '../utils/common';

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'production') {
    if (hasDocumentAvailable && !document.body) {
        error(
            'Intact warning: you cannot initialize intact without "document.body".' + 
            ' Wait on "DOMContentLoaded" event, add script to bottom of body,' + 
            ' or use async/defer attributes on script tag.'
        );
    }
}

let documentBody: HTMLElement | null = null;

if (hasDocumentAvailable) {
    documentBody = document.body;
    /*
    * Defining $EV and $V properties on Node.prototype
    * fixes v8 "wrong map" de-optimization
    */
    if (window.Node) {
        const prototype = Node.prototype as any;
        prototype.$EV = null; // event
        prototype.$V = null; // vNode

        // v-model
        prototype.$M = null; // model
        prototype.$TV = null; // trueValue
        prototype.$FV = null; // falseValue
        prototype.$VA = null; // value

        // Transtion Element
        prototype.$TC = undefined;
        prototype.$TD = undefined;
        prototype._enterCb = undefined;
        prototype._leaveCb = undefined;
        prototype._moveCb = undefined;
    }
}

export function render(vNode: VNode | null | undefined, parentDom: IntactElement): void {
    if (process.env.NODE_ENV !== 'production') {
        if (documentBody === parentDom) {
            throwError('you cannot render() to the "document.body". Use an empty element as container instead.');
        }
        if (isInvalid(parentDom)) {
            throwError(`render target (DOM) is mandatory, received ${parentDom === null ? 'null' : typeof parentDom}`);
        }
    }

    const mountedQueue: Function[] = [];
    let lastVNode = (parentDom as any).$V as VNode | null;

    if (isNullOrUndefined(lastVNode)) {
        if (!isNullOrUndefined(vNode)) {
            if (vNode.type & Types.InUse) {
                vNode = directClone(vNode);
            }
            mount(vNode, parentDom, null, false, null, mountedQueue);
            parentDom.$V = vNode;
        }
    } else {
        if (isNullOrUndefined(vNode)) {
            remove(lastVNode, parentDom);
            parentDom.$V = null;
        } else {
            if (vNode.type & Types.InUse) {
                vNode = directClone(vNode);
            }
            patch(lastVNode, vNode, parentDom, null, false, null, mountedQueue);
            parentDom.$V = vNode; 
        }
    }

    callAll(mountedQueue);
}
