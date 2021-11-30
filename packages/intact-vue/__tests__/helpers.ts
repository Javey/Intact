import {Component} from '../src';
import {isFunction, EMPTY_OBJ} from 'intact-shared';
import {
    default as Vue,
    VueConstructor,
    ComponentOptions,
    CreateElement,
    VNode as VueVNode,
    Component as VueComponent,
} from 'vue';

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


export function createIntactComponent(template: string) {
    return class extends Component {
        static template = template;
    }
}

export const SimpleIntactComponent = createIntactComponent(`<div>Intact Component</div>`);
export const ChildrenIntactComponent = createIntactComponent(
    `<div class={this.get('className')} style={this.get('style')}>{this.get('children')}</div>`
);
export const PropsIntactComponent = createIntactComponent(
    `<div>a: {this.get('a')} b: {this.get('b')}</div>`
);
export const WrapperComponent = createIntactComponent(`<template>{this.get('children')}</template>`);

export let vm: any;
export function render<Data extends {}, Methods extends {}>(
    template: string | ((h: CreateElement) => VueVNode | VueVNode[]),
    components: Record<string, VueComponent<any, any, any, any>> = EMPTY_OBJ,
    data: (Data | ((this: any, vm: Vue & Data) => Data)) = EMPTY_OBJ, // object | ((this: any, vm: any) => any) = {}, 
    methods: Methods = EMPTY_OBJ,
    lifecycle = EMPTY_OBJ 
) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    return vm = new Vue({
        el: container,
        data: isFunction(data) ? data : () => data,
        components,
        methods,
        [typeof template === 'function' ? 'render' : 'template']: template,
        ...lifecycle,
    }) as Vue & Data & Methods;
}

export function reset() {
    document.body.removeChild(vm.$el);
}

export function nextTick() {
    return new Promise<void>(resolve => {
        vm.$nextTick(() => resolve());
    });
}
