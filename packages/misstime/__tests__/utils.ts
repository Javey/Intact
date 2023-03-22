import {VNode} from '../src/utils/types';
import {render} from '../src/core/render';
import {nextTick as _nextTick} from 'intact';
import {nextFrame as _nextFrame} from '../../intact/src/components/heplers';

export function dispatchEvent(target: Element, eventName: string, options?: Object) {
    let event;
    if (document.createEvent) {
        event = document.createEvent('Event');
        event.initEvent(eventName, true, true);
    // } else if (document.createEventObject) {
        // event = document.createEventObject();
        // return target.fireEvent(`on${eventName}`, event);
    } else if (typeof CustomEvent !== 'undefined') {
        event = new CustomEvent(eventName);
    }
    if (event) {
        Object.assign(event, options);
        target.dispatchEvent(event);
    }
}

export function patchTest(container: Element, vNode1: VNode, vNode2: VNode, html?: string) {
    render(vNode1, container);
    render(vNode2, container);
    if (html !== undefined) {
        expect(container.innerHTML).to.equal(html);
    }
    return vNode2;
}

export async function nextTick() {
    return new Promise(resolve => {
        _nextTick(resolve);
    });
}

export function wait(duration: number) {
    return new Promise(resolve => {
        setTimeout(resolve, duration);
    });
}

export function nextFrame() {
    return new Promise<void>(resolve => _nextFrame(resolve));
}

export async function testTransition(dom: Element, type: string) {
    expect(dom.className).to.equal(`transition-${type}-from transition-${type}-active`);

    await nextFrame();
    expect(dom.className).to.equal(`transition-${type}-active transition-${type}-to`);

    await wait(2100);
    expect(dom.className).to.equal('');
}