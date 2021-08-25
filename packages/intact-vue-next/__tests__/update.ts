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
import {h as v, ComponentPublicInstance} from 'vue';
import Normalize from './normalize.vue';

describe('Intact Vue Next', () => {
    describe('Update', () => {
        it('insert removed element should keep the original order', async () => {
            render('<div><C v-if="show">1</C><C>2</C></div>', {
                C: ChildrenIntactComponent
            }, {show: false});

            vm.show = true;

            await nextTick();
            expect(vm.$el.outerHTML).be.eql('<div><div>1</div><div>2</div></div>');
        });

        it('insert keyed child before non-keyed child', async () => {
            render('<div><div v-if="show"><C>1</C></div><div v-else><C key="1">2</C><D /></div></div>', {
                C: ChildrenIntactComponent,
                D: SimpleIntactComponent
            }, {show: true});

            vm.show = false;

            await nextTick();
            expect(vm.$el.outerHTML).be.eql('<div><div><div>2</div><div>Intact Component</div></div></div>');
        });

        it('insert keyed vue element before non-keyed element in Intact component', async () => {
            class IntactComponent extends Component {
                static template = `const C = this.C; <div>{this.get('children')}<C ref="c" /></div>`;
                private C!: typeof SimpleIntactComponent;
                init() {
                    this.C = SimpleIntactComponent;
                } 
            }
            render(`
                <C ref="c">
                    <div key="test" v-if="show">test2</div>
                </C>
            `, {
                C: IntactComponent,
            }, {show: false});

            vm.$refs.c.refs.c.test = true;
            vm.show = true;

            await nextTick();
            expect(vm.$refs.c.refs.c.test).to.be.true;
        });

        it('update keyed functional component children', async () => {
            // v-if / v-else will add different key by Vue
            render(`
                <C>
                    <div>
                        <C :forwardRef="i => a = i" v-if="show">1</C>
                        <C :forwardRef="i => b = i" v-else>2</C>
                    </div>
                </C>
                `, {
                C: Component.functionalWrapper(function Wrapper(props: any) {
                    return h(ChildrenIntactComponent, props);
                }),
            }, {show: true});

            await nextTick();
            const a = vm.a;
            vm.show = false;
            await nextTick();
            const b = vm.b;
            expect(a === b).be.false;
            expect(vm.$el.innerHTML).be.eql('<div><div>2</div></div>');
        });

        it('diff IntactComponent with vue element', async () => {
            const C = ChildrenIntactComponent;
            render(function(this: ComponentPublicInstance<{show: boolean}>) {
                return v(C, null, this.show ? v(C, null, '1') : v('p', null, '2'));
            }, undefined, function() {
                return {
                    show: false
                }
            });

            vm.show = true;
            await nextTick();
            expect(vm.$el.outerHTML).be.eql('<div><div>1</div></div>');

            vm.show = false;
            await nextTick();
            expect(vm.$el.outerHTML).be.eql('<div><p>2</p></div>');
        });

        it('should update ref', async () => {
            const C = ChildrenIntactComponent;
            render(function(this: ComponentPublicInstance<{show: boolean}>) {
                return v('div', null, this.show ? v(C, null, 1) : v(C, {ref: 'a'}, 2));
            }, undefined, {show: true});

            vm.show = false;
            await nextTick();
            expect(vm.$refs.a.forceUpdate).to.exist;
        });

        it('should update ref in for', async () => {
            render(`
                <div>
                    <C v-for="(item, index) in data"
                        :key="index"
                        :ref="'test' + index"
                        :index="item.value"
                    >{{ item.value }}</C>
                </div>
            `, {
                C: ChildrenIntactComponent
            }, {data: []}, {add(this: any, index: number) {
                this.data.push({value: this.data.length + 1});
            }});

            vm.data.push({value: 1});
            await nextTick();
            vm.data.push({value: 2});
            await nextTick();
            vm.data.push({value: 3});
            await nextTick();
            [0, 1, 2].forEach((index) => {
                expect(vm.$refs['test' + index].get('index')).to.eql(index + 1);
            });
        });

        it('should watch vue component nested into intact component', async () => {
            const handler = sinon.spy();
            render('<C><D :a="a" /><div @click="add" ref="add">click</div></C>', {
                C: ChildrenIntactComponent,
                // C: {template: '<div><slot></slot></div>'},
                D: {
                    template: '<div>{{ a.join(",") }}</div>',
                    props: {
                        a: {
                            default: [],
                            type: Array,
                        }
                    },
                    watch: {
                        a: {
                            immediate: true,
                            deep: true,
                            handler,
                        }
                    }
                }
            }, {a: [2]}, {add(this: any) { this.a.push(2) }});

            await nextTick();
            expect(handler.callCount).to.eql(1);
            vm.$refs.add.click();
            await nextTick();
            expect(handler.callCount).to.eql(2);
            expect(vm.$el.innerHTML).to.eql('<div>2,2</div><div>click</div>');
        });

        it('should update correctly even if intact has changed type of element', async () => {
            class C extends Component<{total: number}> {
                static template = `if (!this.get('total')) return; <div>component</div>`;
            }
            render(function(this: ComponentPublicInstance<{show: boolean, total: number}>) {
                return v('div', null, this.show ?
                    v('div', null, v(C, {total: this.total})) :
                    v('div')
                );
            }, undefined, {show: true, total: 0});

            vm.total = 1;
            await nextTick();
            expect(vm.$el.outerHTML).eql('<div><div><div>component</div></div></div>');
            vm.show = false;
            await nextTick();
            expect(vm.$el.outerHTML).eql('<div><div></div></div>');
        });

        it('update vue element which has been reused across multiple renders', async () => {
            render(`<C ref="c"><div>test</div></C>`, {
                C: createIntactComponent(`<div>{this.get('children')}{this.get('children')}</div>`)
            });
            vm.$forceUpdate();
            await nextTick();
            expect(vm.$el.outerHTML).eql('<div><div>test</div><div>test</div></div>');

            vm.$refs.c.forceUpdate();
            await nextTick();
            expect(vm.$el.outerHTML).eql('<div><div>test</div><div>test</div></div>');
        });

        it('call intact show method to create elements that contains vue component, should get the $parent in vue component', (done) => {
            const C = createIntactComponent(`<div>{this.get('show') ? this.get('children') : undefined}</div>`);
            render(`<C ref="c"><V /></C>`, {
                C, 
                V: {
                    template: `<div>test</div>`,
                    beforeCreate() {
                        expect(this.$parent.$parent === vm).to.be.true;
                        done();
                    }
                }
            });

            vm.$refs.c.set('show', true);
        });

        it('should update vNode.el of Vue if Intact component updated and return the different dom', async () => {
            class Test extends Component<{show: boolean}> {
                static template = `
                    const show = this.get('show');
                    if (!show) return;
                    <div>show</div>
                `;

                static defaults() {
                    return {show: true}
                }

                hide() {
                    this.set('show', false);
                    this.trigger('hide');
                }
            }

            render(`<div><C v-if="show" ref="c" @hide="hide" /></div>`, {C: Test}, {show: true}, {
                hide(this: any) {
                    this.show = false;
                }
            });

            vm.$refs.c.hide();

            await nextTick();
            expect(vm.$el.innerHTML).to.eql('<!--v-if-->');
        });

        it('call update method on init in Intact component', async () => {
            class Test extends Component {
                static template = `<div>test</div>`;
                init() {
                    this.forceUpdate();
                }
            }
            render('<C />', { C: Test });

            await nextTick();
            expect(vm.$el.outerHTML).to.eql('<div>test</div>');
        });

        it('should call update method of vue to update Intact functional component children that created by createVNode', async () => {
            const consoleWarn = console.warn;
            const warn = console.warn = sinon.spy(consoleWarn);
            const C = Component.functionalWrapper(function(props: any) {
                return h(WrapperComponent, props);
            });
            const D = createIntactComponent(`const children = this.get('children'); <div>{children}{children}</div>`);
            render(function(ctx: any) {
                return v(D, null, {
                    default() {
                        return v(C, null, {
                            default() {
                                return ctx.test;
                            }
                        });
                    }
                });
            }, undefined, {test: 1});

            expect(vm.$el.outerHTML).to.eql('<div>11</div>');

            vm.test = 2;
            await nextTick();
            expect(vm.$el.outerHTML).to.eql('<div>22</div>');
            expect(warn.callCount).to.eql(0);
            console.warn = consoleWarn;
        });

        it('should update children which are Intact components of Intact component', async () => {
            render(`<C><D v-if="show" /><D /></C>`, {
                C: ChildrenIntactComponent,
                D: SimpleIntactComponent,
            }, {show: false});

            vm.show = true;
            await nextTick();
            expect(vm.$el.outerHTML).to.eql('<div><div>Intact Component</div><div>Intact Component</div></div>');

            vm.show = false;
            await nextTick();
            expect(vm.$el.outerHTML).to.eql('<div><div>Intact Component</div></div>');
        });

        it('should update children which are Intact functional components of Intact component', async () => {
            render(`<C><D v-if="show" /><D /></C>`, {
                C: ChildrenIntactComponent,
                D: Component.functionalWrapper(() => {
                    return h(SimpleIntactComponent);
                }),
            }, {show: false});

            vm.show = true;
            await nextTick();
            expect(vm.$el.outerHTML).to.eql('<div><div>Intact Component</div><div>Intact Component</div></div>');

            vm.show = false;
            await nextTick();
            expect(vm.$el.outerHTML).to.eql('<div><div>Intact Component</div></div>');
        });

        it('should update children of Intact component which nested in vue element', async () => {
            render(`<div><C><div v-if="show">test</div></C></div>`, {
                C: ChildrenIntactComponent,
            }, {show: false});

            vm.show = true;
            await nextTick();
            expect(vm.$el.outerHTML).to.eql('<div><div><div>test</div></div></div>');

            vm.show = false;
            await nextTick();
            expect(vm.$el.outerHTML).to.eql('<div><div></div></div>');
        });

        it('should update children of slot in Intact component which nested in vue element', async () => {
            render(`<C><template v-slot:test>{{ show }}</template></C>`, {
                C: createIntactComponent(`<div><b:test /></div>`),
            }, {show: false});

            vm.show = true;
            await nextTick();
            expect(vm.$el.outerHTML).to.eql('<div>true</div>');
        });

        it('should handle ref correctly on update block in Intact component', async () => {
            render('<C ref="c"><template v-slot:content><D ref="d" v-if="show" /></template></C>', {
                C: createIntactComponent(`<div><b:content /></div>`),
                D: SimpleIntactComponent,
            }, {show: true});

            await nextTick();
            expect(vm.$refs.c.forceUpdate).to.be.exist;
            expect(vm.$refs.d.forceUpdate).to.be.exist;

            vm.$refs.c.forceUpdate();
            await nextTick();
            expect(vm.$refs.c.forceUpdate).to.be.exist;
            expect(vm.$refs.d.forceUpdate).to.be.exist;

            vm.show = false;
            await nextTick();
            expect(vm.$refs.c.forceUpdate).to.be.exist;
            expect(vm.$refs.d).to.be.null;
        });
    });
});