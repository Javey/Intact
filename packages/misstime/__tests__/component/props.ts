import {Component} from '../../src/core/component';
import {render} from '../../src/core/render';
import {createVNode as h, VNode as VNodeConstructor} from '../../src/core/vnode';
import {Fragment, findDomFromVNode} from '../../src/utils/common';
import {VNode, VNodeComponentClass} from '../../src/utils/types';
import {nextTick} from '../utils';

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
            expect(container.innerHTML).toBe(html);
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

            defaults() {
                return {name: 1} as P;
            }
        }
        
        afterEach(() => render(null, container));

        describe('Mount', () => {
            it('should set value to default when render undefined prop', () => {
                render(h(Test, {name: undefined}), container);

                expect(component!.props).toEqual({name: 1});
            });

            it('should update prop and trigger $receive event', () => {
                const onReceiveName = jasmine.createSpy();
                const onReceiveAge = jasmine.createSpy();
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

                expect((component as MyTest).props).toEqual({name: 2, age: 1});
                expect(onReceiveName).toHaveBeenCalledOnceWith(2, 1);
                expect(onReceiveAge).toHaveBeenCalledOnceWith(1, undefined);
            });

            it('should not trigger $receive event if values are equal', () => {
                const onReceiveName = jasmine.createSpy();
                class MyTest extends Test {
                    init() {
                        this.on('$receive:name', onReceiveName);
                    } 
                }

                render(h(MyTest, {name: 1}), container);

                expect(component!.props).toEqual({name: 1});
                expect(onReceiveName).toHaveBeenCalledTimes(0);
            });
        })

        describe('Patch', () => {
            it('should do nothing if props are undefined', () => {
                render(h(Test), container);
                render(h(Test), container);

                expect(component!.props).toEqual({name: 1});
            });

            it('should set prop to default value if next value is undefined', () => {
                render(h(Test, {name: 2}), container);
                render(h(Test, {name: undefined}), container);

                expect(component!.props).toEqual({name: 1});
            });

            it('should set prop to default value if next value does not exist', () => {
                render(h(Test, {name: 2}), container);
                render(h(Test), container);

                expect(component!.props).toEqual({name: 1});
            });

            it('should do nothing if next value does not exist but last value is undefined', () => {
                render(h(Test, {name: undefined}), container);
                render(h(Test), container);

                expect(component!.props).toEqual({name: 1});
            });
        });

        describe('Set & Get', () => {
            it('should set props and trigger events', async () => {
                render(h(Test), container);

                const onReceiveName = jasmine.createSpy();
                const onChangeName = jasmine.createSpy();
                const onChangedName = jasmine.createSpy();
                component!.on('$receive:name', onReceiveName);
                component!.on('$change:name', onChangeName);
                component!.on('$changed:name', onChangedName);

                component!.set('name', 2);
                expect(onReceiveName).toHaveBeenCalledTimes(0);
                expect(onChangeName).toHaveBeenCalledOnceWith(2, 1);
                expect(onChangedName).toHaveBeenCalledTimes(0);

                await nextTick();

                expect(onChangedName).toHaveBeenCalledOnceWith(2, 1);
                expect(container.innerHTML).toBe('<div>2</div>');
            });

            it('should set props silent', async () => {
                render(h(Test), container);

                const onChangeName = jasmine.createSpy();
                const onChangedName = jasmine.createSpy();
                component!.on('$change:name', onChangeName);
                component!.on('$changed:name', onChangedName);

                component!.set({name: 2}, {silent: true});
                expect(onChangeName).toHaveBeenCalledTimes(0);
                expect(onChangedName).toHaveBeenCalledTimes(0);
                expect(component!.get()).toEqual({name: 2});

                component!.forceUpdate();
                await nextTick();
                expect(container.innerHTML).toBe('<div>2</div>');
            });

            it('set prop on init', () => {
                const onRender = jasmine.createSpy();
                const onChangeName = jasmine.createSpy();
                const onChangedName = jasmine.createSpy();
                class Test extends Component {
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
                expect(onChangeName).toHaveBeenCalledOnceWith(1, undefined);
                expect(onChangedName).toHaveBeenCalledOnceWith(1, undefined);
                expect(onRender).toHaveBeenCalledTimes(1);
                expect(container.innerHTML).toBe('<div>1</div>');
            });

            it('set prop on beforeMount', () => {
                const onRender = jasmine.createSpy();
                const onChangeName = jasmine.createSpy();
                const onChangedName = jasmine.createSpy();
                class Test extends Component {
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
                expect(onChangeName).toHaveBeenCalledOnceWith(1, undefined);
                expect(onChangedName).toHaveBeenCalledOnceWith(1, undefined);
                expect(onRender).toHaveBeenCalledTimes(1);
                expect(container.innerHTML).toBe('<div>1</div>');
            });

            it('set prop on beforeUpdate', () => {
                const onRender = jasmine.createSpy();
                const onChangeName = jasmine.createSpy();
                const onChangedName = jasmine.createSpy();
                class Test extends Component {
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
                expect(onChangeName).toHaveBeenCalledOnceWith(1, undefined);
                expect(onChangedName).toHaveBeenCalledOnceWith(1, undefined);
                expect(onRender).toHaveBeenCalledTimes(2);
                expect(container.innerHTML).toBe('<div>1</div>');
            });

            it('set prop on template', async () => {
                const onRender = jasmine.createSpy();
                const onChangeName = jasmine.createSpy();
                const onChangedName = jasmine.createSpy();
                class Test extends Component {
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

                expect(onChangeName).toHaveBeenCalledOnceWith(1, undefined);
                expect(onChangedName).toHaveBeenCalledOnceWith(1, undefined);
                expect(onRender).toHaveBeenCalledTimes(2);
                expect(container.innerHTML).toBe('<div>1</div>');
            });

            it('set prop multiple times', async () => {
                const onRender = jasmine.createSpy().and.callFake(() => {
                    console.log('render');
                });
                const onChangeName = jasmine.createSpy().and.callFake((...args) => {
                    console.log('change', ...args);
                });
                const onChangedName = jasmine.createSpy().and.callFake((...args) => {
                    console.log('changed', ...args);
                });
                class Test extends Component {
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

                expect(onChangeName).toHaveBeenCalledTimes(3);
                expect(onChangedName).toHaveBeenCalledTimes(3);
                expect(onRender).toHaveBeenCalledTimes(1);
                expect(container.innerHTML).toBe('<div>3</div>');

                await nextTick();

                expect(onChangeName).toHaveBeenCalledTimes(3);
                expect(onChangedName).toHaveBeenCalledTimes(3);
                expect(onRender).toHaveBeenCalledTimes(2);
                expect(container.innerHTML).toBe('<div>3</div>');
            });

            it('should only update one time when we set prop multiple times in template', async () => {
                const onRender = jasmine.createSpy();
                class Test extends Component {
                    static template(this: Test) {
                        onRender();
                        this.set('name', 'name');
                        this.set('age', 2);
                        return h('div', null, this.get('name') + this.get('age'));
                    }
                }

                render(h(Test), container);

                await nextTick();
                expect(onRender).toHaveBeenCalledTimes(2);
            });

            it('should not update when component has been unmounted', async () => {
                render(h(Test), container);
                const dom = container.firstElementChild!;
                render(null, container);
                component!.set('name', 2);

                await nextTick();
                expect(dom.innerHTML).toBe('1');
            });
        });
    });
});
