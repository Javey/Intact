import {Component, Template} from '../../src/components/component';
import {render} from '../../src/core/render';
import {createVNode as h, VNode as VNodeConstructor} from '../../src/core/vnode';
import {Fragment, findDomFromVNode} from '../../src/utils/common';
import {VNode, VNodeComponentClass} from '../../src/utils/types';

describe('Component', () => {
    let container: Element;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
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
        const a: {name?: number} = {name: 1}
        let component: Test | null;
        interface TestProps {name?: number};
        class Test<P extends TestProps = TestProps> extends Component<P> {
            static template = function(this: Test) {
                component = this;
                return h('div');
            }

            defaults() {
                return {name: 1} as P;
            }
        }
        
        afterEach(() => render(null, container));

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

        // it('should update props', () => {
            // render(h(Test, {name: 1}), container);
            // expect(component!.props).toEqual({name: 1} as any);

            // render(h(Test, {name: 2}), container);
            // expect(component!.props).toEqual({name: 2} as any);

            // render(h(Test, {name: undefined}), container);
            // expect(component!.props).toEqual({name: 1} as any);

            // render(h(Test), container);
            // expect(component!.props).toEqual({name: 1} as any);
        // });
    });
});
