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

describe('Intact Vue Legacy', () => {
    describe('Intact Features', () => {
        describe('Lifecycle', () => {
            it('lifecycle of intact in vue', async () => {
                const beforeMount = sinon.spy(() => console.log('beforeMount'));
                const mounted = sinon.spy(() => console.log('mounted'));
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
                const created = sinon.spy(() => console.log('created'));
                const mounted = sinon.spy(() => console.log('mounted'));
                const updated = sinon.spy(() => console.log('updated'));
                const destroyed = sinon.spy();
                render('<C v-if="show" ref="a"><VueComponent :a="a"/></C>', {
                    C: ChildrenIntactComponent,
                    VueComponent: {
                        props: ['a'],
                        template: '<div>{{ a }}</div>',
                        created,
                        mounted,
                        updated,
                        destroyed,
                    }
                }, {show: true, a: 1});

                expect(vm.$refs.a.$vnode.data.queue).to.be.null;

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

                expect(mounted1.callCount).be.eql(1);
                expect(mounted2.callCount).be.eql(1);
                expect(mounted2.calledBefore(mounted1)).be.true;
                expect(mounted3.calledBefore(mounted2)).be.true;
            });

            it('handle mountedQueue', async () => {
                class Test extends Component<{a: number}> {
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
                const updated = sinon.spy(() => console.log('updated'));
                const mounted = sinon.spy(() => console.log('mounted'));
                function Test(isShow: boolean) {
                    return new Promise<void>(resolve => {
                        class Test1 extends Component<{show: boolean}> {
                            static template = `<div v-if={this.get('show')}>{this.get('children')}</div>`;
                            static defaults() {
                                return {show: isShow}
                            }
                            show() {
                                this.set('show', true);
                            }
                            updated() {
                                updated();
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
                                mounted();
                                resolve();
                            }
                        }

                        render('<div><Test1 ref="a"><div><Test2 /></div><div><Test2 /></div></Test1></div>', {
                            // Test1: {
                                // template: `<div v-if="isShow"><slot /></div>`,
                                // data() {
                                    // return {isShow}
                                // },
                                // methods: {
                                    // show() {
                                        // this.isShow = true;
                                    // }
                                // }
                            // },
                            // Test2: {
                                // template: `<div>test2</div>`,
                                // mounted() {
                                    // debugger;
                                // }
                            // },
                            Test1,
                            Test2,
                        });
                    });
                }

                await Test(true);
                expect(mounted.callCount).to.eql(2);
                // Test(false);
                // (window as any).vm = vm;
                await Promise.all([Test(false), vm.$refs.a.show()]);
                expect(updated.callCount).to.eql(1);
                expect(mounted.callCount).to.eql(4);
            });

            it('should call mount method when we update data in vue mounted lifecycle method', async () => {
                const updated = sinon.spy(() => console.log('updated'));
                class IntactComponent extends Component {
                    static template = `<div>{this.get('value') ? this.get('children') : null}</div>`;

                    updated = updated;
                };
                const mounted = sinon.spy(() => console.log('mounted'));
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

                // (window as any).vm = vm;
                vm.show = true;
                await nextTick();
                expect(mounted.callCount).to.eql(1);
                expect(Object.isFrozen(vm.$refs.a.$mountedQueue)).to.be.true;
                expect(Object.isFrozen(vm.$refs.c.$refs.b.$mountedQueue)).to.be.true;
            });
        });
    });
});
