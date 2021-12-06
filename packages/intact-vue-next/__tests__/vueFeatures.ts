import {Component} from '../src';
import {
    dispatchEvent,
    createIntactComponent,
    SimpleIntactComponent,
    ChildrenIntactComponent,
    PropsIntactComponent,
    WrapperComponent,
    vm,
    render,
    reset,
    nextTick,
} from './helpers';
import {createVNode as h, ComponentFunction} from 'intact';
import {h as v, ComponentPublicInstance, render as vueRender, getCurrentInstance, createApp} from 'vue';
import Test1 from './test1.vue';
import Test3 from './test3.vue';
import Test4 from './test4.vue';
import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router';

describe('Intact Vue Next', () => {
    describe('Vue Features', () => {
        describe('v-show', () => {
            it('should render v-show on class component correctly', async () => {
                render(`
                    <C v-show="show">
                        <div v-show="show">show</div>
                        <C v-show="show">test</C>
                        <C v-show="show" style="font-size: 12px;">font-size</C>
                        <C v-show="show" :style="{fontSize: '12px'}">fontSize</C>
                    </C>
                `, {
                    C: ChildrenIntactComponent
                }, {show: false});

                await nextTick();
                expect(vm.$el.outerHTML).eql('<div style="display: none;"><div style="display: none;">show</div><div style="display: none;">test</div><div style="font-size: 12px; display: none;">font-size</div><div style="font-size: 12px; display: none;">fontSize</div></div>');

                vm.show = true;
                await nextTick();
                expect(vm.$el.outerHTML).eql('<div><div style="">show</div><div>test</div><div style="font-size: 12px;">font-size</div><div style="font-size: 12px;">fontSize</div></div>');
            });

            it('should render v-show on functional component correctly', async () => {
                render(`
                    <C v-show="show">
                        <div v-show="show">show</div>
                        <C v-show="show">test</C>
                        <C v-show="show" style="font-size: 12px;">font-size</C>
                        <C v-show="show" :style="{fontSize: '12px'}">fontSize</C>
                    </C>
                `, {
                    C: Component.functionalWrapper((props: any) => {
                        return h(ChildrenIntactComponent, props);
                    }),
                }, {show: false});

                await nextTick();
                expect(vm.$el.outerHTML).eql('<div style="display: none;"><div style="display: none;">show</div><div style="display: none;">test</div><div style="font-size: 12px; display: none;">font-size</div><div style="font-size: 12px; display: none;">fontSize</div></div>');

                vm.show = true;
                await nextTick();
                expect(vm.$el.outerHTML).eql('<div><div style="">show</div><div>test</div><div style="font-size: 12px;">font-size</div><div style="font-size: 12px;">fontSize</div></div>');
            });

            // it('should render v-show on functional component that returns mutliple vNodes correctly', async () => {
                // const h = Intact.Vdt.miss.h;
                // render(`<C v-show="show"></C>`, {
                    // C: Intact.functionalWrapper(props => {
                        // return [h(ChildrenIntactComponent, props), h(SimpleIntactComponent)];
                    // }),
                // }, {show: false});
            // });
        });

        describe('v-model', () => {
            it('with modifier', async () => {
                render('<C v-model.trim="a" ref="a" />', {
                    C: createIntactComponent(`<div>{this.get('value')}</div>`)
                }, {a: '1'}, {
                    add(this: any) {
                        this.a = String(++this.a);
                    }
                });

                vm.add();

                await nextTick();
                expect(vm.$el.outerHTML).to.eql('<div>2</div>');

                vm.$refs.a.set('value', '3');
                expect(vm.a).to.eql('3');

                vm.$refs.a.set('value', '  4 ');
                expect(vm.a).to.eql('4');
            });

            it('with $change:value', async () =>{
                const change = sinon.spy();
                render('<C v-model="a" @change:value="change" ref="a"/>', {
                    C: createIntactComponent(`<div>{this.get('value')}</div>`)
                }, {a: 1}, {
                    add(this: any) {
                        this.$refs.a.set('value', 2);
                    },

                    change
                });

                vm.add();
                await nextTick();
                expect(change.callCount).to.eql(1);
            });

            it('with propName', () => {
                const test = sinon.spy(function() {console.log(arguments)});
                render('<C a="a" v-model:b="b" ref="test" @change:b="(c, v) => test(1, c, v)"/>', {
                    C: PropsIntactComponent
                }, {b: 1}, {test});

                expect(vm.$el.outerHTML).to.eql('<div>a: a b: 1</div>');

                vm.$refs.test.set('b', 2);
                expect(vm.b).eql(2);
                expect(test.callCount).eql(1);
            });

            it('with hyphen-delimited propName', async () => {
                class Test extends Component {
                    static template = `<div>{this.get('userName')}</div>`;
                    static typeDefs = {userName: String};
                }
                const spy = sinon.spy();
                render('<C ref="test" v-model:user-name="name" @change:user-name="onChange" />', {
                    C: Test,
                }, {name: 'Javey'}, {onChange: spy});

                await nextTick();
                vm.$refs.test.set('userName', 'test');
                expect(vm.name).eql('test');
                expect(spy.callCount).eql(1);
            });
        });

        describe('Scoped style', () => {
            it('render scoped intact component', () => {
                render('<Test1><C /><D><C /></D></Test1>', {
                    C: SimpleIntactComponent,
                    D: ChildrenIntactComponent,
                    Test1
                });

                expect(vm.$el.outerHTML).to.eql('<div class="test1" data-v-ec27949c=""><div class="test2" data-v-ec27949c=""><span>test2</span><i data-v-ec27949c="">test1</i><div data-v-ec27949c="">intact component in vue<b data-v-ec27949c="">test</b><div class="test3" data-v-ebef3698="" data-v-ec27949c=""><span data-v-ebef3698="">test3</span><div data-v-ec27949c="">intact component in vue<b data-v-ec27949c="">test</b></div></div></div></div><div>Intact Component</div><div><div>Intact Component</div></div></div>');
            });

            it('should set scope dd correctly even if intact has changed type of element', async () => {
                class C extends Component<{show: boolean}> {
                    static template = `if (!this.get('show')) return; <div>component</div>`;
                }
                render('<Test :show="show"><C :show="show" /></Test>', {
                    C,
                    Test: Test4,
                }, {show: false});

                expect(vm.$el.outerHTML).to.eql('<div class="test1" data-v-ebd30796=""></div>');

                vm.show = true;
                await nextTick();
                expect(vm.$el.outerHTML).to.eql('<div class="test1" data-v-ebd30796=""><div data-v-ebd30796="">intact component in vue<b data-v-ebd30796="">test</b></div><div>component</div></div>');

                vm.show = false;
                await nextTick();
                expect(vm.$el.outerHTML).to.eql('<div class="test1" data-v-ebd30796=""></div>');

                vm.show = true;
                await nextTick();
                expect(vm.$el.outerHTML).to.eql('<div class="test1" data-v-ebd30796=""><div data-v-ebd30796="">intact component in vue<b data-v-ebd30796="">test</b></div><div>component</div></div>');
            });
        });

        describe('Router', () => {
            function render(routes: RouteRecordRaw[]) {
                const container = document.createElement('div');
                document.body.appendChild(container);
                const app = createApp({
                    template: `<router-view />`
                });
                app.use(createRouter({
                    history: createWebHashHistory(),
                    routes,
                }));
                app.mount(container);
            }

            function findRouter(instance: Component) {
                do {
                    const vueInstance = instance.vueInstance;
                    if (vueInstance) {
                        return vueInstance.proxy!.$router;
                    }
                } while (instance = instance.$senior as Component);
            }

            it('should get router in Intact component', (done) => {
                class Test extends Component {
                    static template = `<div>test</div>`;
                    mounted() {
                        expect(findRouter(this)).to.be.exist;
                        done();
                    }
                }

                render([
                    {path: '/', component: {
                        template: '<C />',
                        components: {
                            C: Test 
                        }
                    }},
                ]);
            });

            it('should get router in nested Intact component', (done) => {
                class Test extends Component {
                    static template = `<div>test</div>`;
                    mounted() {
                        expect(findRouter(this)).to.be.exist;
                        done();
                    }
                }

                render([
                    {path: '/', component: {
                        template: '<ChildrenIntactComponent><C /></ChildrenIntactComponent>',
                        components: {
                            ChildrenIntactComponent,
                            C: Test 
                        }
                    }},
                ]);
            });
        });

        describe('Vue Test', () => {
            it('render emtpy slot', async () => {
                render('<C><template v-slot:slot></template></C>', {
                    C: {
                        template: `<div><slot name="slot">test</slot></div>`
                    }
                });
            });

            it('keep-alive', async () => {
                render('<keep-alive><C /></keep-alive>', {
                    C: function() {
                        const instance = getCurrentInstance() as any;
                        const {p: patch} = instance.parent.ctx.renderer;
                        console.log(patch);
                        return v('div', null, 'test');
                    }
                });
            });

            it('v-show', async () => {
                render('<C v-show="false">show</C>', {
                    C: {
                        template: `<div><slot /></div>`
                    }
                });
            });

            it('v-show with functional component that returns multiple vnodes', async () => {
                render('<C v-show="false">show</C>', {
                    C: function(props, context) {
                        return [
                            v('div', context.attrs, context.slots),
                            v('div', null, 'test')
                        ];
                    }
                });
            });

            it('scoped', async () => {
                render('<Test3><div>test</div><Test /></Test3>', {
                    Test3,
                    Test: {
                        template: `<div>component</div>`
                    }
                });
            });
        });
    });
});
