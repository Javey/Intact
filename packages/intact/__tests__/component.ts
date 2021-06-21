import {Component} from '../src/core/component';
import {render, createVNode as h, Fragment, VNode, RefFunction} from 'misstime';
import {Template} from 'vdt';
import {nextTick} from '../../misstime/__tests__/utils';

describe('Component', () => {
    let container: Element;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    // afterEach(() => {
        // render(null, container);
        // document.body.removeChild(container);
    // });

    function patchTest(vNode1: VNode, vNode2: VNode, html?: string) {
        render(vNode1, container);
        render(vNode2, container);
        if (html !== undefined) {
            expect(container.innerHTML).to.equal(html);
        }
        return vNode2;
    }

    describe('Mount', () => {
        it('should mount component which return HtmlElement vNode', () => {
            class Test extends Component {
                static template = () => {
                    return h('div', null, 'test')
                }
            }

            render(h(Test), container);
            expect(container.innerHTML).to.equal('<div>test</div>');
        });

        it('should mount component which return Fragment vNode', () => {
            class Test extends Component {
                static template = () => {
                    return h(Fragment, null, [
                        h('i', null, 'a'),
                        h('i', null, 'b'),
                    ]);
                }
            }

            render(h(Test), container);
            expect(container.innerHTML).to.equal('<i>a</i><i>b</i>');
        });

        it('should mount component which return null', () => {
            class Test extends Component {
                static template = () => {
                    return null;
                }
            }

            render(h(Test), container);
            expect(container.innerHTML).to.equal('');
        });

        it('should get parent component correctly', () => {
            class Test extends Component {
                static template(this: Test) {
                    return h('div', null, this.get('children'));
                }
            } 

            let component: Test | null;
            render(h('div', null, h(Test, {ref: i => component = i})), container);
            expect(component!.$parent).to.be.null;

            render(h(Test, null, h(Test, {ref: i => component = i})), container);
            expect(component!.$parent).to.be.instanceof(Test);
        });

        it('should mount component which template is string', () => {
            class Test extends Component<{test: string}> {
                static template = `<div>{this.get('test')}</div>`
            } 

            render(h(Test, {test: 'test'}), container);
            expect(container.innerHTML).to.equal('<div>test</div>');
        });
    });

    describe('Patch', () => {
        class Test extends Component {
            static template = () => {
                return [h('i', null, 1), h('i', null, 2)];
            }
        }

        it('should move element before component', () => {
            const a = h(Test, {key: 'a'});
            const b = h('i', {key: 'b'}, 'b');
            patchTest(
                h('div', null, [a, b]),
                h('div', null, [b, a]),
                '<div><i>b</i><i>1</i><i>2</i></div>'
            );
        });

        it('should move component before element', () => {
            const a = h('i', {key: 'a'}, 'a');
            const b = h(Test, {key: 'b'});
            patchTest(
                h('div', null, [a, b]),
                h('div', null, [b, a]),
                '<div><i>1</i><i>2</i><i>a</i></div>'
            );
        });

        it('should remove component', () => {
            const a = h(Test);
            const b = h('i', null, 'i');
            patchTest(
                h('div', null, a),
                h('div', null, b),
                '<div><i>i</i></div>'
            );
        });

        it('should reuse the dom even if it is a different component', () => {
            class Test2 extends Component {
                static template = () => {
                    return [h('i', null, 3)]
                }
            }
            render(h(Test), container);
            const dom = container.firstElementChild;
            render(h(Test2), container);
            expect(container.firstElementChild).to.equal(dom);
            expect(container.innerHTML).to.equal('<i>3</i>');
        });
    });

    describe('Update', () => {
        it('should update component which return HtmlElement vNode', () => {
            class Test extends Component<{name: number}> {
                static template: Template = function(this: Test) {
                    return h('div', null, this.props.name)
                }
            }

            render(h(Test, {name: 1}), container);
            render(h(Test, {name: 2}), container);
            expect(container.innerHTML).to.equal('<div>2</div>');
        });

        it('should replace dom', () => {
            class Test extends Component<{name: number}> {
                static template: Template = function(this: Test) {
                    if (this.props.name === 1) {
                        return h('div'); 
                    } else {
                        return [h('span'), h('span')];
                    }
                }
            }

            render(h(Test, {name: 1}), container);
            render(h(Test, {name: 2}), container);
            expect(container.innerHTML).to.equal('<span></span><span></span>');
        });

        it('update on updating', async () => {
            const callback = sinon.spy();
            class Test extends Component<{name: number}> {
                static template: Template = function(this: Test) {
                    return h('div', null, this.props.name)
                };

                mounted() {
                    this.set('name', 2);
                }

                beforeUpdate() {
                    this.props.name = 3;
                    this.forceUpdate(() => {
                        expect(container.innerHTML).to.equal('<div>3</div>');
                        callback();
                    });
                }
            }

            render(h(Test, {name: 1}), container);
            await nextTick();
            expect(callback).to.have.callCount(1);
        });

        describe('Reuse dom', () => {
            it('replace component', async () => {
                const unmounted = sinon.spy();
                function createComponentTest() {
                    return class Test extends Component {
                        static template = function(this: Test) {
                            return h('div', null, this.props.children);
                        }

                        unmounted() {
                            unmounted();
                        }
                    }
                } 

                render(h(
                    createComponentTest(),
                    {children: h(
                        createComponentTest(),
                        {children: '1'}
                    )}
                ), container);
                render(h(
                    createComponentTest(),
                    {children: h(
                        createComponentTest(),
                        {children: '2'}
                    )}
                ), container);

                expect(unmounted).to.have.callCount(2);
            });

            it('should recreate component if parent has receated but reuse dom', async () => {
                const unmounted = sinon.spy();
                function createComponentTest() {
                    return class Test extends Component {
                        static template = function(this: Test) {
                            return h('div', null, this.props.children);
                        }

                        unmounted() {
                            unmounted();
                        }
                    }
                } 

                const C = createComponentTest();

                render(h(
                    createComponentTest(),
                    {children: h(C, {children: '1'})}
                ), container);
                
                const oldNode = container.firstChild;
                const oldNodeChild = oldNode!.firstChild;

                render(h(
                    createComponentTest(),
                    {children: h(C, {children: '2'})}
                ), container);

                expect(unmounted).to.have.callCount(2);
                expect(oldNode).to.equal(container.firstChild);
                expect(oldNodeChild).to.equal(container.firstChild!.firstChild);
            });

            it('should update ref of element if parent has recreated', async () => {
                let dom: Element | null = null;
                const ref: RefFunction<Element> = i => dom = i;
                function createComponentTest() {
                    return class Test extends Component {
                        static template = function(this: Test) {
                            return h('div', {ref: ref}, this.props.children);
                        }
                    }
                } 

                render(h(createComponentTest()), container);
                render(h(createComponentTest()), container);

                expect(dom).to.be.exist;
            });

            it('should not unmounted an unmounted vNode if we are reusing the dom', async () => {
                class Test1 extends Component {
                    static template = function(this: Test1) {
                        return h('div', null, this.props.children);
                    }
                }

                class Test2 extends Component {
                    static template = function(this: Test2) {
                        return h('span', null, this.props.children);
                    }
                }

                class Test3 extends Component {
                    static template = function(this: Test2) {
                        return h('i', null, 'test3');
                    }
                }

                render(h(Test1, {children: h(Test3)}), container);
                render(h(Test2, {children: h(Test3)}), container);
            });

            it('should not unmounted an unmounted keyed vNode if we are reusing the dom', async () => {
                class Test1 extends Component {
                    static template = function(this: Test1) {
                        return h('div', null, this.props.children);
                    }
                }

                class Test2 extends Component {
                    static template = function(this: Test2) {
                        return h('div', null, this.props.children);
                    }
                }

                class Test3 extends Component {
                    static template = function(this: Test2) {
                        return h('i', null, 'test3');
                    }
                }

                render(h(Test1, {children: [h('div', {key: 1}), h(Test3, {key: 2})]}), container);
                render(h(Test2, {children: [h('div', {key: 1}), h(Test3, {key: 3})]}), container);
            });

            it('replace one vNode with multiple vNodes and vice versa', () => {
                class Test1 extends Component {
                    static template = function(this: Test1) {
                        return h('div', null, this.props.children);
                    } 
                }

                function createTest2() {
                    return class Test2 extends Component<{a: boolean}> {
                        static template = function(this: Test2) {
                            return h('div', null, this.props.a ? h(Test1) : [h(Test1), h(Test1)]);
                        }
                    }
                }

                render(h(createTest2(), {a: true}), container);
                render(h(createTest2(), {a: false}), container);
                render(h(createTest2(), {a: true}), container);
            });
        });
    });
});
