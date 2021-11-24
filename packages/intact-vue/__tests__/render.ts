import Vue from 'vue';
import Test from './test1.vue';
import {Component, createVNode as h} from '../src';
import {
    dispatchEvent,
    createIntactComponent,
    SimpleIntactComponent,
    ChildrenIntactComponent,
    PropsIntactComponent,
    vm,
    render,
    reset,
    nextTick,
} from './helpers';

describe('Intact Vue Legacy', () => {
    describe('Render', () => {
        it('render intact componnet in vue', async () => {
            render('<C />', {C: SimpleIntactComponent});
            expect(vm.$el.outerHTML).to.eql(SimpleIntactComponent.template);
        });

        it('render nested intact component', () => {
            render(`<C><C>test</C></C>`, {C: ChildrenIntactComponent});
            expect(vm.$el.outerHTML).to.eql(`<div><div>test</div></div>`);
        });

        it('render intact in vue element', () => {
            render('<div><C/></div>', {C: SimpleIntactComponent});
            expect(vm.$el.outerHTML).to.eql(`<div>${SimpleIntactComponent.template}</div>`);
        });

        it('render intact in vue component', () => {
            render(
                '<VueComponent><C/></VueComponent>',
                {
                    VueComponent: {
                        template: `<div><slot></slot></div>`
                    },
                    C: SimpleIntactComponent
                }
            );

            expect(vm.$el.outerHTML).to.eql(`<div>${SimpleIntactComponent.template}</div>`);
        });

        it('render vue element in intact', () => {
            render('<C><div>vue</div></C>', {C: ChildrenIntactComponent});
            expect(vm.$el.outerHTML).to.eql(`<div><div>vue</div></div>`);
        });

        it('render vue component in intact', () => {
            render('<C><VueComponent /></C>', {
                C: ChildrenIntactComponent,
                VueComponent: {
                    template: `<div>vue component</div>`
                }
            });
            expect(vm.$el.outerHTML).to.eql(`<div><div>vue component</div></div>`);
        });

        it('render nested vue and intact', () => {
            render('<C><V><C><V></V></C></V></C>', {
                C: ChildrenIntactComponent,
                V: {
                    template: `<div><slot></slot></div>`
                }
            });
            expect(vm.$el.outerHTML).to.eql(`<div><div><div><div></div></div></div></div>`);
        });

        it('render nested component in template', () => {
            render('<C class="a"><V><div></div></V></C>', {
                C: ChildrenIntactComponent,
                V: {
                    template: `<C class="b"><slot></slot></C>`,
                    components: {
                        C: ChildrenIntactComponent,
                    }
                }
            });

            expect(vm.$el.outerHTML).to.eql(`<div class="a"><div class="b"><div></div></div></div>`);
        });

        it('render with props', () => {
            render('<C a="a" :b="b" />', {
                C: PropsIntactComponent
            }, {b: 1});

            expect(vm.$el.outerHTML).to.eql('<div>a: a b: 1</div>');
        });

        it('render Boolean type prop', () => {
            class Test extends Component {
                static template = `
                    var data = {
                        a: this.get('a'),
                        b: this.get('b'),
                        c: this.get('c'),
                        d: this.get('d')
                    };
                    <div>{JSON.stringify(data)}</div>
                `;

                static typeDefs = {
                    a: Boolean,
                    b: {
                        type: Boolean,
                        required: true,
                    },
                    c: [Number, Boolean],
                    d: {
                        type: [Number, Boolean],
                        required: true,
                    }
                };
            }

            render('<C a b c d="d" />', {C: Test});
            expect(vm.$el.outerHTML).to.eql('<div>{"a":true,"b":true,"c":true,"d":true}</div>');
        });

    });
    it('test', () => {
        const TestA = Vue.extend({
            template: '<div>test</div>'
        });

        class TestB extends Component {
            static template() {
                return h('div', null, 'test');
            }
        }

        const container = document.createElement('div');
        document.body.appendChild(container);

        const app = new Vue({
            el: container,
            // components: {Test: TestA},
            components: {Test: TestB},
            template: '<Test><div>test</div></Test>'
        });
    });
});
