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

        it('render with event', async () => {
            class Test extends Component<{}, {click: []}> {
                static template = `<div ev-click={this.onClick.bind(this)}>click</div>`;
                onClick() {
                    this.trigger('click')
                }
            }
            render('<div><C @click="onClick" />{{ a }}</div>', {
                C: Test 
            }, {a: 1}, {
                onClick(this: any) {
                    this.a++;
                }
            });

            dispatchEvent(vm.$el.firstElementChild!, 'click');
            await nextTick();
            expect(vm.$el.outerHTML).be.eql('<div><div>click</div>2</div>');
        });

        it('render change event', async () => {
            const changeValue = sinon.spy();
            class IntactComponent extends Component<{value: string}> {
                static template = `<div ev-click={this.onClick.bind(this)}>{this.get('value')}</div>`;
                onClick() {
                    this.set('value', 'click');
                }
            }

            render('<C @change:value="changeValue" v-model="value" />', {
                C: IntactComponent 
            }, {value: "test"}, {changeValue});

            dispatchEvent(vm.$el, 'click');
            await nextTick();
            expect(changeValue.callCount).to.eql(1);
            expect((vm as any).value).to.eql('click');
        });

        it('render with multiple events which event names are the same', async () => {
            const click = sinon.spy(() => console.log('click'));
            const changeValue = sinon.spy();
            class IntactComponent extends Component<{value: string}, {click: []}> {
                static template = `<div ev-click={this.onClick.bind(this)}>{this.get('value')}</div>`;
                onClick() {
                    this.set('value', 'click');
                    this.trigger('click');
                }
            }
            render('<div><C @click.native="click" v-model="value" />{{ value }}</div>', {
                C: Vue.extend({
                    template: `<IntactComponent v-model="value1"
                        @click="click"
                        @input="changeValue"
                        @change:value="changeValue"
                    />`,
                    components: {
                        // IntactComponent: {
                            // template: `<div>test</div>`,
                            // // props: {
                                // // value: {
                                    // // required: true, 
                                // // }
                            // // }
                        // },
                        IntactComponent,
                    },
                    methods: {click, changeValue},
                    props: {
                        value: {
                            required: true
                        }
                    },
                    data() {
                        return {
                            value1: this.value
                        }
                    },
                    watch: {
                        value1(v) {
                            this.$emit('input', v);
                        }
                    }
                })
            }, {value: "test"}, {click});

            dispatchEvent(vm.$el.firstElementChild!, 'click');
            await nextTick();
            expect(vm.$el.outerHTML).to.eql('<div><div>click</div>click</div>');
            expect(click.callCount).to.eql(2);
            expect(changeValue.callCount).to.eql(2);
        });

        it('render with slots', () => {
            class Test extends Component {
                static template = `<div>{this.get('children')}<b:footer></b:footer></div>`;
            }
            render('<C><template slot="footer"><div>footer</div></template><div>children</div></C>', {
                C: Test
            });

            expect(vm.$el.outerHTML).be.eql('<div><div>children</div><div>footer</div></div>');
        });

        it('render undefined slot', () => {
            class Test extends Component {
                static template = `<div>{this.get('children')}</div>`;
            }
            render('<C><template #footer><div><C>test</C></div></template></C>', {
                C: Test 
            });

            expect(vm.$el.outerHTML).be.eql('<div></div>');
            reset();

            render('<C><C><template slot="footer"><div>test</div></template></C></C>', {
                C: Test
            });

            expect(vm.$el.outerHTML).be.eql('<div><div></div></div>');
        });

        it('render with scoped slots', () => {
            render('<C><template slot-scope="{test}"><div>{{ test }}</div></template></C>', {
                // C: createIntactComponent(`<div>{self.get('default')('test')}</div>`)
                C: createIntactComponent(`<div><b:default params={{test: 'test'}} /></div>`)
            });

            expect(vm.$el.outerHTML).be.eql('<div><div>test</div></div>');
        });

        it('should silent when we try to treat a default scope slot as children', () => {
            const consoleWarn = console.warn;
            const warn = console.warn = sinon.spy();

            render(`<C><template slot-scope="item">{{ item.a }}</template></C>`, {
                C: createIntactComponent(`<div><b:default params={{a: 1}} /></div>`)
            });

            expect(vm.$el.outerHTML).to.eql('<div>1</div>');
            expect(warn.callCount).to.eql(0);
            console.warn = consoleWarn;
        });

        it('ignore empty slot in vue, this is the default behavior of vue', () => {
            render('<C><template slot="slot"></template></C>', {
                C: createIntactComponent(`<div><b:slot>test</b:slot></div>`)
            });

            expect(vm.$el.outerHTML).be.eql('<div>test</div>');
        });

        it('render style and class', () => {
            render(`<C style="color: red;" :style="{fontSize: '12px'}" class="a" :class="{b: true}"/>`, {
                C: createIntactComponent(`<div style={{...this.get('style'), fontWeight: "bold"}} class={this.get('className') + ' c'}>test</div>`)
            });

            expect(vm.$el.outerHTML).be.eql('<div class="a b c" style="color: red; font-size: 12px; font-weight: bold;">test</div>');
        });

        it('render async intact component', () => {
            class Test extends Component {
                static template = `<div>test</div>`;
                init() {
                    return new Promise<void>((resolve) => {
                        resolve();
                    });
                }
            }
            render('<C />', {
                C: Test 
            });

            expect(vm.$el.outerHTML).be.eql('<div>test</div>');
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
