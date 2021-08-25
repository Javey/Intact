import {Component, provide, inject} from '../src';
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
import {h as v, ComponentPublicInstance, render as vueRender, getCurrentInstance} from 'vue';

describe('Intact Vue Next', () => {
    describe('Intact Features', () => {
        describe('Lifecycle', () => {
            it('lifecycle of intact in vue', async () => {
                const beforeMount = sinon.spy(() => console.log('beforeMount'));
                const mounted = sinon.spy(() => {
                    console.log('mounted');
                });
                const beforeUpdate = sinon.spy(() => console.log('beforeUpdate'));
                const updated = sinon.spy(() => console.log('updated'));
                const beforeUnmount = sinon.spy(() => console.log('beforeUnmount'));
                const unmounted = sinon.spy(() => console.log('unmounted'));
                class Test extends Component {
                    static template = '<div>test</div>';
                    beforeMount = beforeMount;
                    mounted = mounted;
                    beforeUpdate = beforeUpdate;
                    updated = updated;
                    beforeUnmount = beforeUnmount;
                    unmounted = unmounted;
                }
                render('<C :a="a" v-if="show"/>', {
                    C: Test 
                }, {a: 1, show: true});

                expect(beforeMount.callCount).be.eq(1);
                expect(mounted.callCount).be.eql(1);

                vm.a = 2;
                await nextTick();
                expect(beforeUpdate.callCount).be.eq(1);
                expect(updated.callCount).be.eql(1);

                vm.show = false;
                await nextTick();
                expect(beforeUnmount.callCount).be.eq(1);
                expect(unmounted.callCount).be.eql(1);
            });

            it('lifecycle of vue in intact', async () => {
                const created = sinon.spy();
                const mounted = sinon.spy();
                const updated = sinon.spy();
                const destroyed = sinon.spy();
                render('<C v-if="show"><VueComponent :a="a"/></C>', {
                    C: ChildrenIntactComponent,
                    VueComponent: {
                        props: ['a'],
                        template: '<div>{{a}}</div>',
                        created,
                        mounted,
                        updated,
                        unmounted: destroyed,
                    }
                }, {show: true, a: 1});

                vm.a = 2;
                await nextTick();
                expect(created.callCount).be.eql(1);
                expect(mounted.callCount).be.eql(1);
                expect(updated.callCount).be.eql(1);

                vm.show = false;
                await nextTick();
                expect(destroyed.callCount).be.eql(1);
            });

            it('lifecycle of mounted nested intact component', async () => {
                const mounted1 = sinon.spy(() => {
                    console.log(1)
                });
                const mounted2 = sinon.spy(() => {
                    console.log(2)
                });
                const mounted3 = sinon.spy(() => {
                    console.log(3);
                });
                class Test1 extends Component {
                    static template = `<div>{this.get('children')}</div>`;
                    mounted = mounted1;
                }
                class Test2 extends Component {
                    static template = `const {Test3} = this; <div><Test3 /></div>`;
                    Test3 = Test3;
                    mounted = mounted2;
                }
                class Test3 extends Component {
                    static template = `<div></div>`;
                    mounted = mounted3;
                }

                render('<div><C><div><D /></div></C></div>', {
                    C: Test1,
                    D: Test2, 
                });

                await nextTick();
                expect(mounted1.callCount).be.eql(1);
                expect(mounted2.callCount).be.eql(1);
                expect(mounted2.calledBefore(mounted1)).be.true;
                expect(mounted3.calledBefore(mounted2)).be.true;
            });

            it('handle mountedQueue', async () => {
                class Test extends Component {
                    static template = '<div>test</div>';
                    init() {
                        this.on('$receive:a', () => {
                            this.forceUpdate();
                        });
                    }
                }
                render('<VueComponent :a="a" />', {
                    VueComponent: {
                        props: ['a'],
                        template: '<div><C :a="a" />{{ a }}</div>',
                        components: {
                            C: Test,
                        }
                    }
                }, {a: 1});

                vm.a = 2;
                await nextTick();
                expect(vm.$el.outerHTML).to.eql('<div><div>test</div>2</div>');
            });

            it('call method of Intact component to show nested Intact component', async () => {
                function Test(isShow: boolean) {
                    return new Promise<void>(resolve => {
                        class Test1 extends Component<{show: boolean}> {
                            static template = `<div v-if={this.get('show')}>{this.get('children')}</div>`;
                            static defaults() {
                                return {show: !!isShow}
                            }
                            show() {
                                this.set('show', true);
                            }
                        }
                        class Test2 extends Component {
                            static template = `const Test = this.Test; <Test />`;
                            Test = Test3;
                        }
                        class Test3 extends Component {
                            static template = '<div ref="element">test</div>';
                            mounted() {
                                expect(document.body.contains(this.refs.element)).to.be.true;
                                resolve();
                            }
                        }

                        render('<div><Test1 ref="a"><div><Test2 /></div></Test1></div>', {
                            Test1: Test1,
                            Test2: Test2, 
                        });
                    });
                }

                await Test(true);
                await Promise.all([Test(false), vm.$refs.a.show()]);
            });

            it('should call mount method when we update data in vue mounted lifecycle method', async () => {
                class IntactComponent extends Component {
                    static template = `<div>{this.get('value') ? this.get('children') : null}</div>`;
                };
                const mounted = sinon.spy(() => console.log('mount'));
                class IntactChildrenComponent extends Component {
                    static template = `<span>{this.get('children')}</span>`;

                    mounted = mounted;
                };
                const Test = {
                    template: `
                        <IntactChildrenComponent ref="b">
                            {{ value }}
                        </IntactChildrenComponent>
                    `,
                    components: {
                        IntactChildrenComponent,
                    },
                    data() {
                        return {value: 1}
                    },
                    mounted(this: any) {
                        this.value = 2;
                    }
                };
                render(`<IntactComponent :value="show" ref="a"><Test ref="c" /></IntactComponent>`, {
                    IntactComponent, Test,
                }, {show: false});

                vm.show = true;
                await nextTick();
                expect(mounted.callCount).to.eql(1);
                expect(Object.isFrozen(vm.$refs.a.instance.$mountedQueue)).to.be.true;
                expect(Object.isFrozen(vm.$refs.c.$refs.b.$mountedQueue)).to.be.true;
            });

            it('should call mounted after all components have mounted', async () => {
                const mounted = sinon.spy(function(this: any) {
                    expect(this.refs.element.parentNode).to.be.exist;
                });
                class Test extends Component {
                    static template = `<div ref="element">test</div>`;
                    mounted = mounted;
                }
                render('<div><C /><C /></div>', {C: Test});
                await nextTick();
                expect(mounted.callCount).to.eql(2);
            });
        });

        describe('vNode', () => {
            it('should get $parent of nested component', (done) => {
                const E = createIntactComponent('<i>{this.get("children")}</i>');
                class Test extends Component {
                    static template = `<span>test</span>`;
                    mounted() {
                        expect(this.$parent).be.instanceof(E);
                        expect(this.$parent!.$parent).instanceof(ChildrenIntactComponent);
                        done();
                    }
                }
                render('<C><p><E><b><D /></b></E></p></C>', {
                    C: ChildrenIntactComponent,
                    D: Test,
                    E,
                });
            });

            it('should get parentVNode after updating', async () => {
                const C = createIntactComponent(`<div>{this.get('children')}</div>`);
                const mounted = sinon.spy();
                const updated = sinon.spy();

                class D extends Component {
                    static template = `<i>{this.get("children")}</i>`;
                    mounted() {
                        mounted();
                        expect(this.$parent).instanceof(IntactComponent);
                        expect(this.$parent!.$parent).instanceof(C);
                        expect(this.$parent!.$parent!.$parent).instanceof(IntactComponent1);
                    }
                    updated() {
                        updated();
                        expect(this.$parent).instanceof(IntactComponent);
                        expect(this.$parent!.$parent).instanceof(C);
                        expect(this.$parent!.$parent!.$parent).instanceof(IntactComponent1);
                    }
                }

                class IntactComponent extends Component {
                    static template = `const {D} = this; <D>{this.get('children')}</D>`;
                    D = D;
                }

                class IntactComponent1 extends Component {
                    static template = `const {C} = this; <C>{this.get('children')}</C>`;
                    C = C;
                }

                render(`
                    <div>
                        {{count}}
                        <IntactComponent1>
                            <p>
                                {{count}}
                                <IntactComponent>test{{count}}</IntactComponent>
                            </p>
                        </IntactComponent1>
                    </div>
                `, {
                    IntactComponent1,
                    IntactComponent,
                }, {count: 1});

                vm.count = 2;
                await nextTick();
                expect(mounted.callCount).to.eql(1);
                expect(updated.callCount).to.eql(1);
            });

            it('should get $parent of inserted Component which nests in vue element in updating', (done) => {
                let count = 0;
                class Test extends Component {
                    static template = `<span>test</span>`;
                    mounted() {
                        count++;
                        expect(this.$parent).instanceof(ChildrenIntactComponent);
                        console.log(this.$parent);
                        if (count === 2) {
                            done();
                        }
                    }
                }
                render('<C><div></div><div v-if="show"><D /><D /></div></C>', {
                    C: ChildrenIntactComponent,
                    D: Test,
                }, {show: false});
                vm.show = true;
            });
        });

        describe('Provide & Inject', () => {
            it('should inject correctly', () => {
                class A extends Component {
                    static template = `<div>{this.get('children')}</div>`
                    init() {
                        provide('test', 1);
                    }
                }

                class B extends Component {
                    static template = `<div>{this.test}</div>`;
                    private test = inject<number>('test')
                }

                render(`<A><div><B /></div></A>`, {
                    A, B,
                });

                expect(vm.$el.outerHTML).to.eql('<div><div><div>1</div></div></div>');

                render(`<A><B /></A>`, {
                    A, B,
                });

                expect(vm.$el.outerHTML).to.eql('<div><div>1</div></div>');
            });
        });
    });
});
