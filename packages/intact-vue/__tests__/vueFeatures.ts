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
import Test1 from './test1.vue';
import Test3 from './test3.vue';
import Test4 from './test4.vue';
import Scoped from './scoped.vue';
import VueRouter, {RouteRecord, RouteConfig} from 'vue-legacy-router';
import Vue, {CreateElement} from 'vue';
import Vuex from 'vuex';

describe('Intact Vue Legacy', () => {
    describe('Vue Features', () => {
        describe('v-show', () => {
            it('should render v-show on class component correctly', async () => {
                render(`
                    <C v-show="show" style="color: red;">
                        <div v-show="show">show</div>
                        <C v-show="show">test</C>
                        <C v-show="show" style="font-size: 12px;">font-size</C>
                        <C v-show="show" :style="{fontSize: '12px'}">fontSize</C>
                    </C>
                `, {
                    C: ChildrenIntactComponent
                }, {show: false});

                expect(vm.$el.outerHTML).eql('<div style="color: red; display: none;"><div style="display: none;">show</div> <div style="display: none;">test</div> <div style="font-size: 12px; display: none;">font-size</div> <div style="font-size: 12px; display: none;">fontSize</div></div>');

                vm.show = true;
                await nextTick();
                expect(vm.$el.outerHTML).eql('<div style="color: red;"><div style="">show</div> <div>test</div> <div style="font-size: 12px;">font-size</div> <div style="font-size: 12px;">fontSize</div></div>');
            });

            it('should render v-show on functional component correctly', async () => {
                render(`
                    <C v-show="show" style="color: red;">
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

                expect(vm.$el.outerHTML).eql('<div style="color: red; display: none;"><div style="display: none;">show</div> <div style="display: none;">test</div> <div style="font-size: 12px; display: none;">font-size</div> <div style="font-size: 12px; display: none;">fontSize</div></div>');

                vm.show = true;
                await nextTick();
                expect(vm.$el.outerHTML).eql('<div style="color: red;"><div style="">show</div> <div>test</div> <div style="font-size: 12px;">font-size</div> <div style="font-size: 12px;">fontSize</div></div>');
            });
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
                render('<C a="a" :b.sync="b" ref="test" @change:b="(c, v) => test(1, c, v)"/>', {
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
                render('<C ref="test" :user-name.sync="name" @change:user-name="onChange" />', {
                    C: Test,
                }, {name: 'Javey'}, {onChange: spy});

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

                expect(vm.$el.outerHTML).to.eql('<div data-v-d6e4193c="" class="test1"><div data-v-d6e4193c="" class="test2"><span>test2</span> <i data-v-d6e4193c="">test1</i> <div data-v-d6e4193c="">intact component in vue<b data-v-d6e4193c="">test</b> <div data-v-d6abbb38="" data-v-d6e4193c="" class="test3"><span data-v-d6abbb38="">test3</span> <div data-v-d6e4193c="" data-v-d6abbb38="">intact component in vue<b data-v-d6e4193c="">test</b></div></div></div></div> <div data-v-d6e4193c="">Intact Component</div><div data-v-d6e4193c=""><div>Intact Component</div></div></div>');
            });

            it('should set scope dd correctly even if intact has changed type of element', async () => {
                class C extends Component<{show: boolean}> {
                    static template = `if (!this.get('show')) return; <div>component</div>`;
                }
                render('<Test :show="show"><C :show="show" /></Test>', {
                    C,
                    Test: Test4,
                }, {show: false});

                expect(vm.$el.outerHTML).to.eql('<div data-v-d68f8c36="" class="test1"> </div>');

                vm.show = true;
                await nextTick();
                expect(vm.$el.outerHTML).to.eql('<div data-v-d68f8c36="" class="test1"><div data-v-d68f8c36="">intact component in vue<b data-v-d68f8c36="">test</b></div> <div data-v-d68f8c36="">component</div></div>');

                vm.show = false;
                await nextTick();
                expect(vm.$el.outerHTML).to.eql('<div data-v-d68f8c36="" class="test1"> </div>');

                vm.show = true;
                await nextTick();
                expect(vm.$el.outerHTML).to.eql('<div data-v-d68f8c36="" class="test1"><div data-v-d68f8c36="">intact component in vue<b data-v-d68f8c36="">test</b></div> <div data-v-d68f8c36="">component</div></div>');
            });

            it('render scoped style on nested intact component', () => {
                render(`<Scoped />`, {Scoped});

                expect(vm.$el.outerHTML).be.eql('<div data-v-6e566bc6=""><i>intact component in vue <div class="test" data-v-6e566bc6=""><i>intact component in vue <b data-v-6e566bc6="">test</b></i></div></i></div>');
            });
        });

        describe('Router', () => {
            function render(routes: RouteConfig[]) {
                Vue.use(VueRouter);

                const container = document.createElement('div');
                document.body.appendChild(container);
                const router = new VueRouter({
                    routes
                });
                const app = new Vue({
                    el: container,
                    router,
                    render(h: CreateElement) {
                        return h('router-view');
                    }
                } as any);
            }

            function findRouter(instance: Component) {
                do {
                    const parent = instance.$parent;
                    if (parent) {
                        return parent.$router;
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

        describe('Vuex', () => {
            Vue.use(Vuex);

            const store = new Vuex.Store({
                state: {
                    count: 0,
                },
                mutations: {
                    increment(state) {
                        state.count++;
                    }
                }
            });

            it('should get store', async () => {
                const Test = {
                    template: `<div>{{ count }}</div>`,
                    computed:{
                        ...Vuex.mapState(['count']),
                    }
                }
                render(
                    '<ChildrenIntactComponent><Test /></ChildrenIntactComponent>',
                    {ChildrenIntactComponent, Test},
                    undefined,
                    undefined,
                    { store }
                );

                expect(vm.$el.outerHTML).to.eql('<div><div>0</div></div>');

                store.commit('increment');
                await nextTick();
                expect(vm.$el.outerHTML).to.eql('<div><div>1</div></div>');
            });
        });
    });
});
