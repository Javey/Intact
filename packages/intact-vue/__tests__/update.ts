import {Component, VNode, VNodeComponentClass, IntactDom} from '../src';
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
import {createVNode as h, ComponentFunction, directClone} from 'intact';
import {default as Vue, CreateElement, PropType} from 'vue';
import { Portal } from './portal';

describe('Intact Vue Legacy', () => {
    describe('Update', () => {
        it('insert removed element should keep the original order', async () => {
            const vm = render('<div><C v-if="show">1</C><C>2</C></div>', {
                C: ChildrenIntactComponent
            }, {show: false});

            vm.show = true;

            await nextTick();
            expect(vm.$el.outerHTML).be.eql('<div><div>1</div><div>2</div></div>');
        });

        it('insert keyed child before non-keyed child', async () => {
            const vm = render('<div><div v-if="show"><C>1</C></div><div v-else><C key="1">2</C><D /></div></div>', {
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
                private C = SimpleIntactComponent;
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
            expect(vm.$el.outerHTML).to.eql('<div><div>test2</div><div>Intact Component</div></div>');
        });

        it('insert keyed intact component that returns vue element directly', async () => {
            render(`
                <C ref="c">
                    <D key="a" v-if="show"><span>test1</span></D>
                    <D key="b"><span>test2</span></D>
                </C>
            `, {
                C: ChildrenIntactComponent,
                D: WrapperComponent,
            }, {show: false});

            vm.show = true;

            await nextTick();
            expect(vm.$el.outerHTML).to.eql('<div><span>test1</span> <span>test2</span></div>')
        });

        it('update keyed functional component children', async () => {
            render(`
                <C>
                    <div>
                        <C ref="a" v-if="show" key="a">1</C>
                        <C ref="b" v-else key="b">2</C>
                    </div>
                </C>
                `, {
                C: Component.functionalWrapper(function Fn(props: any) {
                    return h(ChildrenIntactComponent, props);
                }),
            }, {show: true});

            const a = vm.$refs.a;
            vm.show = false;

            await nextTick();
            const b = vm.$refs.b;
            expect(a === b).be.false;
            expect(vm.$el.innerHTML).be.eql('<div><div>2</div></div>');
        });

        it('diff IntactComponent with vue element', async () => {
            const C = ChildrenIntactComponent;
            render(function(this: Vue & {show: boolean}, v: CreateElement) {
                return v(C, [this.show ? v(C, '1') : v('p', '2')]);
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
            render(function(this: Vue & {show: boolean}, v: CreateElement) {
                return v('div', [this.show ? v(C, '1') : v(C, {ref: 'a'}, '2')]);
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
                        ref="test"
                        :index="item.value"
                    >{{ item.value }}</C>
                </div>
            `, {
                C: ChildrenIntactComponent
            }, {data: []}, {
                add(this: any, index: number) {
                    this.data.push({value: this.data.length + 1});
                }
            });

            vm.data.push({value: 1});
            await nextTick();
            vm.data.push({value: 2});
            await nextTick();
            vm.data.push({value: 3});
            await nextTick();
            [0, 1, 2].forEach((index) => {
                expect(vm.$refs.test[index].get('index')).to.eql(index + 1);
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
            render(function(this: Vue & {show: boolean, total: number}, v: CreateElement) {
                return v('div', [this.show ?
                    v('div', [v(C, {attrs: {total: this.total}})]) :
                    v('div')
                ]);
            }, undefined, {show: true, total: 0});

            // (window as any).vm = vm;
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
                    beforeCreate(this: any) {
                        expect(this.$parent.$parent === vm).to.be.true;
                        done();
                    }
                }
            });

            vm.$refs.c.set('show', true);
        });

        it('should update vNode.el of Vue if Intact component updated and return the different dom', async () => {
            class Test extends Component<{show: boolean}, {hide: []}> {
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
            expect(vm.$el.innerHTML).to.eql('<!---->');
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
            render(function(this: any, v: CreateElement) {
                return v(D, [v(C, this.test)]);
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

        it('update component in intact and the children are intact functional component', async () => {
            class Test extends Component<{show?: boolean}> {
                static template = `<div ev-click={this.onClick}>click{this.getChildren()}</div>`;
                static defaults() {
                    return { show: true };
                }

                init() {
                    this.getChildren = this.getChildren.bind(this);
                    this.onClick = this.onClick.bind(this);
                }

                onClick() {
                    this.set('show', !this.get('show'));
                }
                
                getChildren() {
                    const { children, show } = this.get();
                    const vNodes = children as VNode[];
                    if (show) {
                        return vNodes; 
                    }
                    return [vNodes[1]];
                }
            }

            class Tooltip extends Component {
                static template = function(this: Tooltip) {
                    const vNode = this.get('children') as VNode;
                    return [h('div', null, 'trigger'), h(Portal, null, vNode)]
                }
            }

            render(`<ChildrenIntactComponent><Test ref="test"><D /><D /></Test></ChildrenIntactComponent>`, {
                Test,
                D: Component.functionalWrapper(() => {
                    return h(Tooltip, {children: h(SimpleIntactComponent)});
                }),
                ChildrenIntactComponent,
            });

            vm.$refs.test.onClick();
            await nextTick();
            expect(vm.$el.outerHTML).to.eql('<div><div>click<div>trigger</div><!--portal--></div></div>');

            vm.$refs.test.onClick();
            await nextTick();
            expect(vm.$el.outerHTML).to.eql('<div><div>click<div>trigger</div><!--portal--><div>trigger</div><!--portal--></div></div>');

            vm.$refs.test.onClick();
            await nextTick();
            expect(vm.$el.outerHTML).to.eql('<div><div>click<div>trigger</div><!--portal--></div></div>');
        });


        it('should update children of Intact component which nested in vue element', async () => {
            render(`<div><C><div v-if="show">test</div></C></div>`, {
                C: ChildrenIntactComponent,
            }, {show: false});

            vm.show = true;
            await nextTick();
            expect(vm.$el.outerHTML).to.eql('<div><div><div>test</div></div></div>');

            // (window as any).vm = vm;
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
            render('<C ref="c"><template slot="content"><D ref="d" v-if="show" /></template></C>', {
                C: createIntactComponent(`<div><b:content /></div>`),
                D: SimpleIntactComponent,
            }, {show: true});

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

        it('should not discard the class and style', async () => {
            render('<C ref="c"><C class="a" style="display: block;">test</C></C>', {
                C: ChildrenIntactComponent,
            });
    
            vm.$refs.c.forceUpdate();

            await nextTick();
            expect(vm.$el.innerHTML).to.eql('<div class="a" style="display: block;">test</div>');
        });

        it('update vue element with different tag', async () => {
            render(`<Main><Layout class="layout" v-if="show === 'a'"><A /></Layout><Layout class="layout" v-else-if="show === 'b'"><B /></Layout><C v-else /></Main>`, {
                Main: {
                    template: `<div class="main"><slot /></div>`,
                },
                Layout: ChildrenIntactComponent,
                A: {
                    template: `<div class="a">a</div>`
                },
                B: {
                    template: `<div class="b">b</div>`
                },
                C: {
                    template: `<div class="c">c</div>`
                },
            }, { show: 'a'});

            vm.show = 'b';
            await nextTick();

            vm.show = 'c';
            await nextTick();
            expect(vm.$el.innerHTML).to.eql('<div class="c">c</div>');
        });

        describe('Multiple vNodes Component', () => {
            class Test extends Component {
                static $doubleVNodes = true;
                static template = `<template><div>1</div><div>2</div></template>`;
            }

            it('remove component', async () => {
                render('<div><Test v-if="show" /></div>', {Test }, {show: true});

                vm.show = false;
                await nextTick();
                expect(vm.$el.innerHTML).to.eql('<!---->');

                vm.show = true;
                await nextTick();
                expect(vm.$el.innerHTML).to.eql('<div>1</div><div>2</div>');
            });
        });
    });
});
