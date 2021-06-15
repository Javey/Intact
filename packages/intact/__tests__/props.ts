import {Component} from '../src/core/component';
import {render, createVNode as h, VNode} from 'misstime';
import {nextTick, wait} from '../../misstime/__tests__/utils';

describe('Component', () => {
    let container: Element;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        render(null, container);
        document.body.removeChild(container);
    });

    function patchTest(vNode1: VNode, vNode2: VNode, html?: string) {
        render(vNode1, container);
        render(vNode2, container);
        if (html !== undefined) {
            expect(container.innerHTML).to.equal(html);
        }
        return vNode2;
    }

    describe('Props', () => {
        let component: Test | null;
        interface TestProps {name?: number};
        class Test<P extends TestProps = TestProps> extends Component<P> {
            static template = function(this: Test) {
                component = this;
                return h('div', null, this.get('name'));
            }

            static defaults = () => ({name: 1});
        }
        
        afterEach(() => render(null, container));

        describe('Mount', () => {
            it('should set value to default when render undefined prop', () => {
                render(h(Test, {name: undefined}), container);

                expect(component!.props).to.eql({name: 1});
            });

            it('should update prop and trigger $receive event', () => {
                const onReceiveName = sinon.spy();
                const onReceiveAge = sinon.spy();
                interface MyTestProps extends TestProps {
                    age: number
                }
                class MyTest extends Test<MyTestProps> {
                    init() {
                        this.on('$receive:name', onReceiveName);
                        this.on('$receive:age', onReceiveAge);
                    } 
                }

                render(h(MyTest, {name: 2, age: 1}), container);

                expect((component as MyTest).props).to.eql({name: 2, age: 1});
                expect(onReceiveName).to.have.been.calledOnceWith(2, 1);
                expect(onReceiveAge).to.have.been.calledOnceWith(1, undefined);
            });

            it('should not trigger $receive event if values are equal', () => {
                const onReceiveName = sinon.spy();
                class MyTest extends Test {
                    init() {
                        this.on('$receive:name', onReceiveName);
                    } 
                }

                render(h(MyTest, {name: 1}), container);

                expect(component!.props).to.eql({name: 1});
                expect(onReceiveName).to.have.callCount(0);
            });

            // it('should mount getter property', () => {
                // let count = 0;
                // class Test extends Component<{a?: number, b?: string}> {
                    // static template = function(this: Test) {
                        // return h('div', null, this.props.a! + this.props.b!);
                    // }
                    // static defaults = {
                        // get a() {
                            // return count++;
                        // },
                        // b: 'b'
                    // }
                // }

                // render(h(Test), container);
                // expect(container.innerHTML).to.equal('<div>0b</div>');

                // // another instance
                // render(h('div', null, h(Test)), container);
                // expect(container.innerHTML).to.equal('<div><div>1b</div></div>');
            // });

            // it('should replace default getter property', () => {
                // class Test extends Component<{a?: number, b?: string}> {
                    // static template = function(this: Test) {
                        // return h('div', null, this.props.a! + this.props.b!);
                    // }
                    // static defaults = {
                        // get a() {
                            // return 1
                        // },
                        // get b() {
                            // return 'b'
                        // }
                    // }
                // }

                // render(h(Test, {a: 0}), container);
                // expect(container.innerHTML).to.equal('<div>0b</div>');

                // // update 
                // render(h(Test, {b: 'c'}), container);
                // expect(container.innerHTML).to.equal('<div>0c</div>');
            // });
        });

        describe('Patch', () => {
            it('should do nothing if props are undefined', () => {
                render(h(Test), container);
                render(h(Test), container);

                expect(component!.props).to.eql({name: 1});
            });

            it('should set prop to default value if next value is undefined', () => {
                render(h(Test, {name: 2}), container);
                render(h(Test, {name: undefined}), container);

                expect(component!.props).to.eql({name: 1});
            });

            it('should set prop to default value if next value does not exist', () => {
                render(h(Test, {name: 2}), container);
                render(h(Test), container);

                expect(component!.props).to.eql({name: 1});
            });

            it('should do nothing if next value does not exist but last value is undefined', () => {
                render(h(Test, {name: undefined}), container);
                render(h(Test), container);

                expect(component!.props).to.eql({name: 1});
            });
        });

        describe('Set & Get', () => {
            it('should set props and trigger events', async () => {
                render(h(Test), container);

                const onReceiveName = sinon.spy();
                const onChangeName = sinon.spy();
                const onChangedName = sinon.spy();
                component!.on('$receive:name', onReceiveName);
                component!.on('$change:name', onChangeName);
                component!.on('$changed:name', onChangedName);

                component!.set('name', 2);
                expect(onReceiveName).to.have.callCount(0);
                expect(onChangeName).to.have.been.calledOnceWith(2, 1);
                expect(onChangedName).to.have.callCount(0);

                await nextTick();

                expect(onChangedName).to.have.been.calledOnceWith(2, 1);
                expect(container.innerHTML).to.equal('<div>2</div>');
            });

            it('should set props silent', async () => {
                render(h(Test), container);

                const onChangeName = sinon.spy();
                const onChangedName = sinon.spy();
                component!.on('$change:name', onChangeName);
                component!.on('$changed:name', onChangedName);

                component!.set({name: 2}, {silent: true});
                expect(onChangeName).to.have.callCount(0);
                expect(onChangedName).to.have.callCount(0);
                expect(component!.get()).to.eql({name: 2});

                component!.forceUpdate();
                await nextTick();
                expect(container.innerHTML).to.equal('<div>2</div>');
            });

            it('set prop on init', () => {
                const onRender = sinon.spy();
                const onChangeName = sinon.spy();
                const onChangedName = sinon.spy();
                class Test extends Component<TestProps> {
                    static template(this: Test) {
                        onRender();
                        return h('div', null, this.get('name'));
                    }

                    init() {
                        this.on('$change:name', onChangeName);
                        this.on('$changed:name', onChangedName);
                        this.set('name', 1);
                    }
                }

                render(h(Test), container);
                expect(onChangeName).to.have.been.calledOnceWith(1, undefined);
                expect(onChangedName).to.have.been.calledOnceWith(1, undefined);
                expect(onRender).to.have.callCount(1);
                expect(container.innerHTML).to.equal('<div>1</div>');
            });

            it('set prop on beforeMount', () => {
                const onRender = sinon.spy();
                const onChangeName = sinon.spy();
                const onChangedName = sinon.spy();
                class Test extends Component<TestProps> {
                    static template(this: Test) {
                        onRender();
                        return h('div', null, this.get('name'));
                    }

                    beforeMount() {
                        this.on('$change:name', onChangeName);
                        this.on('$changed:name', onChangedName);
                        this.set('name', 1);
                    }
                }

                render(h(Test), container);
                expect(onChangeName).to.have.been.calledOnceWith(1, undefined);
                expect(onChangedName).to.have.been.calledOnceWith(1, undefined);
                expect(onRender).to.have.callCount(1);
                expect(container.innerHTML).to.equal('<div>1</div>');
            });

            it('set prop on beforeUpdate', () => {
                const onRender = sinon.spy();
                const onChangeName = sinon.spy();
                const onChangedName = sinon.spy();
                class Test extends Component<TestProps> {
                    static template(this: Test) {
                        onRender();
                        return h('div', null, this.get('name'));
                    }

                    init() {
                        this.on('$change:name', onChangeName);
                        this.on('$changed:name', onChangedName);
                    }

                    beforeUpdate() {
                        this.set('name', 1);
                    }
                }

                render(h(Test), container);
                render(h(Test), container);
                expect(onChangeName).to.have.been.calledOnceWith(1, undefined);
                expect(onChangedName).to.have.been.calledOnceWith(1, undefined);
                expect(onRender).to.have.callCount(2);
                expect(container.innerHTML).to.equal('<div>1</div>');
            });

            it('set prop on template', async () => {
                const onRender = sinon.spy();
                const onChangeName = sinon.spy();
                const onChangedName = sinon.spy();
                class Test extends Component<TestProps> {
                    static template(this: Test) {
                        onRender();
                        this.set('name', 1);
                        return h('div', null, this.get('name'));
                    }

                    init() {
                        this.on('$change:name', onChangeName);
                        this.on('$changed:name', onChangedName);
                    }
                }

                render(h(Test), container);
                await nextTick();

                expect(onChangeName).to.have.been.calledOnceWith(1, undefined);
                expect(onChangedName).to.have.been.calledOnceWith(1, undefined);
                expect(onRender).to.have.callCount(2);
                expect(container.innerHTML).to.equal('<div>1</div>');
            });

            it('set prop multiple times', async () => {
                const onRender = sinon.spy(() => {
                    console.log('render');
                });
                const onChangeName = sinon.spy((...args: any[]) => {
                    console.log('change', ...args);
                });
                const onChangedName = sinon.spy((...args: any[]) => {
                    console.log('changed', ...args);
                });
                class Test extends Component<TestProps> {
                    static template(this: Test) {
                        onRender();
                        this.set('name', 3);
                        return h('div', null, this.get('name'));
                    }

                    init() {
                        this.on('$change:name', onChangeName);
                        this.on('$changed:name', onChangedName);
                        this.set('name', 1);
                    }

                    beforeMount() {
                        this.set('name', 2);
                    }
                }

                render(h(Test), container);

                expect(onChangeName).to.have.callCount(3);
                expect(onChangedName).to.have.callCount(3);
                expect(onRender).to.have.callCount(1);
                expect(container.innerHTML).to.equal('<div>3</div>');

                await nextTick();

                expect(onChangeName).to.have.callCount(3);
                expect(onChangedName).to.have.callCount(3);
                expect(onRender).to.have.callCount(2);
                expect(container.innerHTML).to.equal('<div>3</div>');
            });

            it('should only update one time when we set prop multiple times in template', async () => {
                const onRender = sinon.spy();
                class Test extends Component<{name: string, age: number}> {
                    static template(this: Test) {
                        onRender();
                        this.set('name', 'name');
                        this.set('age', 2);
                        return h('div', null, this.get('name') + this.get('age'));
                    }
                }

                render(h(Test), container);

                await nextTick();
                expect(onRender).to.have.callCount(2);
            });

            it('should not update when component has been unmounted', async () => {
                render(h(Test), container);
                const dom = container.firstElementChild!;
                render(null, container);
                component!.set('name', 2);

                await nextTick();
                expect(dom.innerHTML).to.equal('1');
            });

            it('set props on beforeMount of a async component', async () => {
                const onChangedName = sinon.spy();
                class Test extends Component<{name?: number}> {
                    static template(this: Test) {
                        expect(this.get('name')).to.exist;
                        return h('div', null, this.get('name'));
                    }

                    init() {
                        this.on('$changed:name', onChangedName);
                        return new Promise(resolve => {
                            setTimeout(resolve, 100);
                        }).then(() => {
                            this.set('name', 1);
                        });
                    }

                    beforeMount() {
                        this.set('name', 2);
                    }
                }

                render(h(Test), container);

                await wait(200);

                expect(onChangedName.getCalls()[0].args).to.eql([1, undefined]);
                expect(onChangedName.getCalls()[1].args).to.eql([2, 1]);
            });
        });
    });
});
