import {Component} from '../../src/components/component';
import {render} from '../../src/core/render';
import {createVNode as h, VNode as VNodeConstructor} from '../../src/core/vnode';
import {Fragment, findDomFromVNode} from '../../src/utils/common';
import {VNode, VNodeComponentClass, Template} from '../../src/utils/types';
import {wait} from '../utils';

describe('Component', () => {
    let container: Element;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    class Test extends Component {
        static template(this: Test) {
            expect(this.get('name')).toBeTruthy();
            return h('div', null, this.get('name'));
        }

        init() {
            return new Promise(resolve => {
                setTimeout(resolve, 100);
            }).then(() => {
                this.set('name', 1);
            });
        }
    }

    describe('Async Component', () => {
        it('should mount async component', async () => {
            render(h(Test), container);
            expect(container.innerHTML).toBe('<!--async-->');

            await wait(200);
            expect(container.innerHTML).toBe('<div>1</div>');
        });

        it('should trigger event correctly', async () => {
            const onChangeName = jasmine.createSpy();
            const onChangedName = jasmine.createSpy().and.callFake(() => {
                expect(container.innerHTML).toBe('<div>1</div>');
            });
            class MyTest extends Test {
                init() {
                    this.on('$change:name', onChangeName);
                    this.on('$changed:name', onChangedName);
                    return super.init();
                }
            }

            render(h(MyTest), container);
            await wait(200);
            expect(onChangeName).toHaveBeenCalledOnceWith(1, undefined);
            expect(onChangedName).toHaveBeenCalledOnceWith(1, undefined);
        });

        it('should call beforeMount and mount correctly', async () => {
            const beforeMount = jasmine.createSpy();
            const mounted = jasmine.createSpy();

            class MyTest extends Test {
                beforeMount() {
                    beforeMount();
                }

                mounted() {
                    mounted();
                }
            }

            render(h(MyTest), container);
            expect(beforeMount).toHaveBeenCalledTimes(0);
            expect(mounted).toHaveBeenCalledTimes(0);

            await wait(200);
            expect(beforeMount).toHaveBeenCalledTimes(1);
            expect(mounted).toHaveBeenCalledTimes(1);
        });

        it('should update correctly', async () => {
            render(h(Test), container);
            render(h(Test), container);
        });
    });
});
