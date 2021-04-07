import {VNode, Types, MissTimeElement} from '../utils/types';
import {isInvalid, throwError, warn, isNullOrUndefined} from '../utils/helpers';
import {directClone} from './vnode';
import {mount} from './mount';
import {remove} from './unmount';
import {patch} from './patch';
import {callAll} from '../utils/common';

const hasDocumentAvailable: boolean = typeof document !== 'undefined';

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'production') {
    if (hasDocumentAvailable && !document.body) {
        warn(
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
        (Node.prototype as any).$EV = null;
        (Node.prototype as any).$V = null;
    }
}

export function render(vNode: VNode | null | undefined, parentDom: MissTimeElement): void {
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
