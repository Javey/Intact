import {createElementVNode} from '../src/vnode';
import {Types, ChildrenTypes, VNode} from '../src/types';
import {mount} from '../src/mount';
import {dispatchEvent} from './utils';
import {linkEvent} from '../src/events/linkEvent';

describe('Props', () => {
    let container: HTMLElement;

    function render(vNode: VNode) {
        mount(vNode, container, false, []);
    }

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        // document.body.removeChild(container);
    });

    it('should ignore some props', () => {
        const vNode = createElementVNode(
            Types.CommonElement,
            'div',
            null,
            null,
            'class-name',
            {
                children: 'test',
                className: 'test'
            },
        );
        render(vNode);
        expect(container.innerHTML).toBe('<div class="class-name"></div>');
    });

    it('should set boolean props', () => {
        const vNode = createElementVNode(
            Types.InputElement,
            'input',
            null,
            null,
            null,
            {
                autofocus: true,
            },
        );
        render(vNode);
        expect(container.innerHTML).toBe('<input autofocus="">');
    });

    it('should set defaultChecked', () => {
         const vNode = createElementVNode(
            Types.InputElement,
            'input',
            null,
            null,
            null,
            {
                defaultChecked: true,
                type: 'checkbox',
            }
        );
        render(vNode);

        expect((container.firstChild as HTMLInputElement).value).toBe('on');
        expect(container.innerHTML).toBe('<input checked="" type="checkbox">');
    });

    it('should do nothing if value is null', () => {
        const vNode = createElementVNode(
            Types.InputElement,
            'input',
            null,
            null,
            null,
            {
                value: null
            }
        );
        render(vNode);

        expect((container.firstChild as HTMLInputElement).value).toBe('');
    });

    it('should set scrollLeft', () => {
        const child = createElementVNode(
            Types.CommonElement,
            'div',
            null,
            null,
            null,
            {
                style: 'width: 100px; height: 10px;'
            }
        );
        const vNode = createElementVNode(
            Types.CommonElement,
            'div',
            child,
            ChildrenTypes.HasVNodeChildren,
            null,
            {
                style: {
                    width: '50px',
                    overflow: 'auto'
                },
                scrollLeft: 10,
            }
        );
        render(vNode);

        expect((container.firstChild as HTMLElement).scrollLeft).toBe(10);
    });

    describe('Event', () => {
        it('should mount delegated events', () => {
            const click = jasmine.createSpy('click', () => {
                console.log('click');
            });
            const dblclick = jasmine.createSpy('dblclick', (data) => {
                console.log(data);
            });
            const vNode = createElementVNode(
                Types.CommonElement,
                'div',
                null,
                null,
                null,
                {
                    'ev-click': click.and.callThrough(),
                    'ev-dblclick': linkEvent('data', dblclick.and.callThrough()),
                    'ev-focusin': linkEvent('data', 'noop' as any),
                    style: {
                        height: '100px',
                    }
                }
            );
            render(vNode);

            dispatchEvent(vNode.dom as Element, 'click');
            dispatchEvent(vNode.dom as Element, 'dblclick');
            dispatchEvent(vNode.dom as Element, 'focusin'); // do nothing
            expect(click).toHaveBeenCalledTimes(1);
            expect(dblclick).toHaveBeenCalledTimes(1);
            expect(dblclick.calls.first().args[0]).toBe('data');
        });

        it('should mount undelegated events', () => {
            const enter = jasmine.createSpy('enter', () => {
                console.log('enter');
            });
            const leave = jasmine.createSpy('leave', (data) => {
                console.log(data);
            });
            const vNode = createElementVNode(
                Types.CommonElement,
                'div',
                null,
                null,
                null,
                {
                    'ev-mouseenter': enter.and.callThrough(),
                    'ev-mouseleave': linkEvent('data', leave.and.callThrough()),
                    style: {
                        height: '100px',
                    }
                }
            );
            render(vNode);

            dispatchEvent(vNode.dom as Element, 'mouseenter');
            dispatchEvent(vNode.dom as Element, 'mouseleave');
            expect(enter).toHaveBeenCalledTimes(1);
            expect(leave).toHaveBeenCalledTimes(1);
            expect(leave.calls.first().args[0]).toBe('data');
        });

        it('should not trigger click event if button is disabled', () => {
            const click = jasmine.createSpy();
            const vNode = createElementVNode(
                Types.CommonElement,
                'button',
                null,
                null,
                null,
                {
                    disabled: true,
                    'ev-click': click.and.callThrough(),
                }
            );
            render(vNode);

            dispatchEvent(vNode.dom as Element, 'click');
            expect(click).toHaveBeenCalledTimes(0);
        });

        it('should bubble', () => {
            const click1 = jasmine.createSpy('click1', (e: Event) => {
                expect((e.currentTarget as Element).tagName).toBe('SPAN');
            });
            const click2 = jasmine.createSpy('click2', (e: Event) => {
                expect((e.currentTarget as Element).tagName).toBe('DIV');
            });
            const vNode = createElementVNode(
                Types.CommonElement,
                'div',
                createElementVNode(
                    Types.CommonElement, 
                    'span',
                    null,
                    null,
                    null,
                    {
                        'ev-click': click1.and.callThrough(),
                    }
                ),
                ChildrenTypes.HasVNodeChildren,
                null,
                {
                    'ev-click': click2.and.callThrough()
                }
            );
            render(vNode);
            dispatchEvent((vNode.dom as Element).firstElementChild!, 'click');
            expect(click1).toHaveBeenCalledTimes(1);
            expect(click2).toHaveBeenCalledTimes(1);
        });

        it('should not bubble if canceled', () => {
            const click = jasmine.createSpy();
            const vNode = createElementVNode(
                Types.CommonElement,
                'div',
                createElementVNode(
                    Types.CommonElement, 
                    'div',
                    null,
                    null,
                    null,
                    {
                        'ev-click': (e: Event) => e.stopPropagation(),
                    }
                ),
                ChildrenTypes.HasVNodeChildren,
                null,
                {
                    'ev-click': click.and.callThrough()
                }
            );
            render(vNode);
            dispatchEvent((vNode.dom as Element).firstElementChild!, 'click');
            expect(click).toHaveBeenCalledTimes(0);
        });
    });
});
