import {createElementVNode, createVNode as h} from '../src/core/vnode';
import {Types, ChildrenTypes, VNode} from '../src/utils/types';
import {dispatchEvent} from './utils';
import {linkEvent} from '../src/events/linkEvent';
import {render as r} from '../src/core/render';

describe('Props', () => {
    let container: HTMLElement;

    function render(vNode: VNode) {
        (container as any).$V = null;
        r(vNode, container);
    }

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        r(null, container);
        document.body.removeChild(container);
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

    describe('Form', () => {
        describe('Input', () => {
            it('should render value correctly', () => {
                const vNode = h('input', { value: 1 });
                render(vNode);

                expect((vNode.dom as HTMLInputElement).value).toBe('1');
            });

            it('should render defaultValue correctly', () => {
                const vNode = h('input', {defaultValue: 1});
                render(vNode);

                expect((vNode.dom as HTMLInputElement).value).toBe('1');
                expect((vNode.dom as HTMLInputElement).defaultValue).toBe('1');
            });

            it('should render checked correctly', () => {
                const vNode = h('input', {type: 'checkbox', checked: true, value: 1});
                render(vNode);
                expect((vNode.dom as HTMLInputElement).checked).toBeTrue;
                expect((vNode.dom as HTMLInputElement).value).toBe('1');

                const vNode2 = h('input', {checked: true});
                render(vNode2);
                expect((vNode2.dom as HTMLInputElement).checked).toBe(true);
            });

            it('should render multiple correctly', () => {
                const vNode =h('input', {multiple: true, type: 'file'});
                render(vNode);

                expect((vNode.dom as HTMLInputElement).multiple).toBe(true);
            });
        });

        describe('Select', () => {
            it('should render value correctly', () => {
                const vNode = h('select', {value: '2'}, [
                    h('option', {value: '1'}, '1'),
                    h('option', {value: '2'}, '2'),
                ]);
                render(vNode);

                expect((vNode.dom as HTMLSelectElement).value).toBe('2');
                expect((vNode.dom as HTMLSelectElement).selectedIndex).toBe(1);
            });

            it('should render defaultValue correctly', () => {
                const vNode = h('select', {defaultValue: '2'}, [
                    h('option', {value: '1'}, '1'),
                    h('option', {value: '2'}, '2'),
                ]);
                render(vNode);

                expect((vNode.dom as HTMLSelectElement).value).toBe('2');
                expect((vNode.dom as HTMLSelectElement).selectedIndex).toBe(1);
            });

            it('should set value to emtpy if value does not exist in options', () => {
                const vNode = h('select', {value: '1'}, h('option', {value: '2'}, '2'));
                render(vNode);
                expect((vNode.dom as HTMLSelectElement).value).toBe('');

                const vNode2 = h('select', {value: null}, h('option', {value: '2'}, '2'));
                render(vNode2);
                expect((vNode2.dom as HTMLSelectElement).value).toBe('');

                const vNode3 = h('select', {value: undefined}, h('option', {value: '2'}, '2'));
                render(vNode3);
                expect((vNode3.dom as HTMLSelectElement).value).toBe('');

                const vNode4 = h('select', null, h('option', {value: '2'}, '2'));
                render(vNode4);
                expect((vNode4.dom as HTMLSelectElement).value).toBe('2');

                const vNode5 = h('select', {id: 'test'}, h('option', {value: '2'}, '2'));
                render(vNode5);
                expect((vNode5.dom as HTMLSelectElement).value).toBe('2');
            });

            it('should render selectedIndex correctly', () => {
                const vNode = h('select', {selectedIndex: 1}, [
                    h('option', {value: '1'}, 1),
                    h('option', {value: '2'}, 2),
                ]);
                render(vNode);
                expect((vNode.dom as HTMLSelectElement).value).toBe('2');

                const vNode1 = h('select', {selectedIndex: -1}, [
                    h('option', {value: '1'}, 1),
                    h('option', {value: '2'}, 2),
                ]);
                render(vNode1);
                expect((vNode1.dom as HTMLSelectElement).value).toBe('');

            });

            it('should render multiple correctly', () => {
                const vNode = h('select', {value: ['1', '2'], multiple: true}, [
                    h('option', {value: '1'}, 1),
                    h('option', {value: '2'}, 2),
                    h('option', {value: '3'}, 3),
                ]);
                render(vNode);
                const select = vNode.dom as HTMLSelectElement;
                expect((select.children[0] as HTMLOptionElement).selected).toBeTrue();
                expect((select.children[1] as HTMLOptionElement).selected).toBeTrue();
                expect((select.children[2] as HTMLOptionElement).selected).toBeFalse();

                const vNode2 = h('select', {value: '3', multiple: true}, [
                    h('option', {value: '1'}, 1),
                    h('option', {value: '2'}, 2),
                    h('option', {value: '3'}, 3),
                ]);
                render(vNode2);
                const select2 = vNode2.dom as HTMLSelectElement;
                expect((select2.children[0] as HTMLOptionElement).selected).toBeFalse();
                expect((select2.children[1] as HTMLOptionElement).selected).toBeFalse();
                expect((select2.children[2] as HTMLOptionElement).selected).toBeTrue();

                const vNode3 = h('select', {multiple: true}, [
                    h('option', {value: '1'}, 1),
                    h('option', {value: '2'}, 2),
                    h('option', {value: '3'}, 3),
                ]);
                render(vNode3);
                const select3 = vNode3.dom as HTMLSelectElement;
                expect((select3.children[0] as HTMLOptionElement).selected).toBeFalse();
                expect((select3.children[1] as HTMLOptionElement).selected).toBeFalse();
                expect((select3.children[2] as HTMLOptionElement).selected).toBeFalse();

                const vNode4 = h('select', {multiple: true}, [
                    h('option', {value: '1'}, 1),
                    h('option', {value: '2', selected: true}, 2),
                    h('option', {value: '3'}, 3),
                ]);
                render(vNode4);
                const select4 = vNode4.dom as HTMLSelectElement;
                expect((select4.children[0] as HTMLOptionElement).selected).toBeFalse();
                expect((select4.children[1] as HTMLOptionElement).selected).toBeTrue();
                expect((select4.children[2] as HTMLOptionElement).selected).toBeFalse();
            });

            it('should render selected correctly', () => {
                const vNode = h('select', {value: '1'}, [
                    h('option', null, 1),
                    h('option', {value: '2', selected: true}, 2),
                ]);
                render(vNode);
                expect((vNode.dom as HTMLSelectElement).value).toBe('');

                const vNode2 = h('select', {value: '1'}, [
                    h('option', {value: '1'}, 1),
                    h('option', {value: '2', selected: true}, 2),
                ]);
                render(vNode2);
                expect((vNode2.dom as HTMLSelectElement).value).toBe('1');

                const vNode3 = h('select', {value: '2'}, [
                    h('option', {value: '1', selected: true}, 1),
                    h('option', {value: '2'}, 2),
                ]);
                render(vNode3);
                expect((vNode3.dom as HTMLSelectElement).value).toBe('2');

                const vNode4 = h('select', {id: 'test'}, [
                    h('option', {value: '1'}, 1),
                    h('option', {value: '2', selected: true}, 2),
                ]);
                render(vNode4);
                expect((vNode4.dom as HTMLSelectElement).value).toBe('2');
            });
        });

        describe('Textarea', () => {
            it('should render value correctly', () => {
                const vNode = h('textarea', {value: 'test'});
                render(vNode);

                expect((vNode.dom as HTMLTextAreaElement).value).toBe('test');
            });

            it('should render defaultValue correctly', () => {
                const vNode = h('textarea', {defaultValue: 'test'});
                render(vNode);

                expect((vNode.dom as HTMLTextAreaElement).value).toBe('test');
            });
        });
    });
});
