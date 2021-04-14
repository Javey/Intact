import {Component} from '../../src/core/component';
import {render} from '../../src/core/render';
import {createVNode as h, VNode as VNodeConstructor} from '../../src/core/vnode';
import {Fragment, findDomFromVNode} from '../../src/utils/common';
import {VNode, VNodeComponentClass, Template} from '../../src/utils/types';
import {dispatchEvent} from '../utils';

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

    class Test extends Component<{'ev-click'?: Function}> {
        static template = function(this: Test) {
            return h('div', {'ev-click': this.onClick}, 'click');
        }

        onClick = () => {
            this.trigger('click');
        }
    }

    describe('Events', () => {
        it('should mount event', () => {
            const click = jasmine.createSpy();
            render(h(Test, {'ev-click': click}), container);
            dispatchEvent(container.firstElementChild!, 'click');

            expect(click).toHaveBeenCalledTimes(1);
        });

        it('should update event', () => {
            const click1 = jasmine.createSpy();
            const click2 = jasmine.createSpy();

            render(h(Test, {'ev-click': click1}), container);
            render(h(Test, {'ev-click': click2}), container);
            dispatchEvent(container.firstElementChild!, 'click');

            expect(click1).toHaveBeenCalledTimes(0);
            expect(click2).toHaveBeenCalledTimes(1);
        });

        it('should unmount event', () => {
            const click = jasmine.createSpy();
            render(h(Test, {'ev-click': click}), container);
            render(h(Test, {}), container);
            dispatchEvent(container.firstElementChild!, 'click');
            
            expect(click).toHaveBeenCalledTimes(0);
        });

        it('should not add event listener on beforeUpdate lifecycle', () => {
            class Test extends Component {
                static template = () => {
                    return h('div');
                }

                beforeUpdate() {
                    this.on('click', () => {});
                }
            }

            render(h(Test), container);
            expect(() => render(h(Test), container)).toThrowError();
        });

        it('should not add event listener on updated lifecycle', () => {
            class Test extends Component {
                static template = () => {
                    return h('div');
                }

                updated() {
                    this.on('click', () => {});
                }
            }

            render(h(Test), container);
            expect(() => render(h(Test), container)).toThrowError();
        });

        it('should throw error if callback is not a function', () => {
             class Test extends Component {
                static template = () => {
                    return h('div');
                }

                init() {
                    this.on('click', 'click' as any);
                }
            }

            expect(() => render(h(Test), container)).toThrowError();
        });

        it('should off event correctly', () => {
            const click = jasmine.createSpy();
            const move1 = jasmine.createSpy();
            const move2 = jasmine.createSpy();
            let component: Test;
            class Test extends Component {
                static template(this: Test) {
                    component = this;
                    return h('div');
                }

                init() {
                    this.on('click', click);
                    this.on('move', move1);
                    this.on('move', move2);
                }
            }

            render(h(Test), container);

            component!.trigger('move');
            expect(move1).toHaveBeenCalledTimes(1);
            expect(move2).toHaveBeenCalledTimes(1);

            component!.off('move', move1);
            component!.trigger('move');
            expect(move1).toHaveBeenCalledTimes(1);
            expect(move2).toHaveBeenCalledTimes(2);

            component!.off('move');
            component!.trigger('move');
            expect(move1).toHaveBeenCalledTimes(1);
            expect(move2).toHaveBeenCalledTimes(2);

            component!.off('noop');
            component!.trigger('click');
            expect(click).toHaveBeenCalledTimes(1);

            render(null, container);
            component!.trigger('click');
            expect(click).toHaveBeenCalledTimes(1);
        });
    });
});
