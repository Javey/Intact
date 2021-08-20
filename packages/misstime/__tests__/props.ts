import {createElementVNode, createVNode as h} from '../src/core/vnode';
import {Types, ChildrenTypes, VNode, ComponentClass} from '../src/utils/types';
import {dispatchEvent} from './utils';
import {linkEvent} from '../src/events/linkEvent';
import {render as r} from '../src/core/render';
import {mount} from '../src/core/mount';
import {unmount} from '../src/core/unmount';

describe('Props', () => {
    let container: HTMLElement;

    function render(vNode: VNode) {
        (container as any).$V = null;
        container.innerHTML = '';
        r(vNode, container);
    }

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    // afterEach(() => {
        // r(null, container);
        // document.body.removeChild(container);
    // });

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
        expect(container.innerHTML).to.equal('<div class="class-name"></div>');
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
        expect(container.innerHTML).to.equal('<input autofocus="">');
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

        expect((container.firstChild as HTMLInputElement).value).to.equal('on');
        expect(container.innerHTML).to.equal('<input checked="" type="checkbox">');
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

        expect((container.firstChild as HTMLInputElement).value).to.equal('');
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
        // render(h('div', null, vNode));
        render(vNode);

        expect((container.firstChild as HTMLElement).scrollLeft).to.equal(10);
    });

    describe('Event', () => {
        it('should mount delegated events', () => {
            const click = sinon.spy(() => {
                console.log('click');
            });
            const dblclick = sinon.spy((data: any) => {
                console.log(data);
            });
            const vNode = createElementVNode(
                Types.CommonElement,
                'div',
                null,
                null,
                null,
                {
                    'ev-click': click,
                    'ev-dblclick': linkEvent('data', dblclick),
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
            expect(click).to.have.callCount(1);
            expect(dblclick).to.have.callCount(1);
            expect(dblclick).to.have.calledWith('data');
        });

        it('should mount undelegated events', () => {
            const enter = sinon.spy(() => {
                console.log('enter');
            });
            const leave = sinon.spy((data: any) => {
                console.log(data);
            });
            const vNode = createElementVNode(
                Types.CommonElement,
                'div',
                null,
                null,
                null,
                {
                    'ev-mouseenter': enter,
                    'ev-mouseleave': linkEvent('data', leave),
                    style: {
                        height: '100px',
                    }
                }
            );
            render(vNode);

            dispatchEvent(vNode.dom as Element, 'mouseenter');
            dispatchEvent(vNode.dom as Element, 'mouseleave');
            expect(enter).to.have.callCount(1);
            expect(leave).to.have.callCount(1);
            expect(leave).to.have.calledWith('data');
        });

        it('should not trigger click event if button is disabled', () => {
            const click = sinon.spy();
            const vNode = createElementVNode(
                Types.CommonElement,
                'button',
                null,
                null,
                null,
                {
                    disabled: true,
                    'ev-click': click,
                }
            );
            render(vNode);

            dispatchEvent(vNode.dom as Element, 'click');
            expect(click).to.have.callCount(0);
        });

        it('should bubble', () => {
            const click1 = sinon.spy((e: Event) => {
                expect((e.currentTarget as Element).tagName).to.equal('SPAN');
            });
            const click2 = sinon.spy((e: Event) => {
                expect((e.currentTarget as Element).tagName).to.equal('DIV');
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
                        'ev-click': click1,
                    }
                ),
                ChildrenTypes.HasVNodeChildren,
                null,
                {
                    'ev-click': click2,
                }
            );
            render(vNode);
            dispatchEvent((vNode.dom as Element).firstElementChild!, 'click');
            expect(click1).to.have.callCount(1);
            expect(click2).to.have.callCount(1);
        });

        it('should not bubble if canceled', () => {
            const click = sinon.spy();
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
                    'ev-click': click,
                }
            );
            render(vNode);
            dispatchEvent((vNode.dom as Element).firstElementChild!, 'click');
            expect(click).to.have.callCount(0);
        });
    });

    describe('Form', () => {
        describe('Input', () => {
            it('should render value correctly', () => {
                const vNode = h('input', { value: 1 });
                render(vNode);

                expect((vNode.dom as HTMLInputElement).value).to.equal('1');
            });

            it('should render defaultValue correctly', () => {
                const vNode = h('input', {defaultValue: 1});
                render(vNode);

                expect((vNode.dom as HTMLInputElement).value).to.equal('1');
                expect((vNode.dom as HTMLInputElement).defaultValue).to.equal('1');
            });

            it('should render checked correctly', () => {
                const vNode = h('input', {type: 'checkbox', checked: true, value: 1});
                render(vNode);
                expect((vNode.dom as HTMLInputElement).checked).to.be.true;
                expect((vNode.dom as HTMLInputElement).value).to.equal('1');

                const vNode2 = h('input', {checked: true});
                render(vNode2);
                expect((vNode2.dom as HTMLInputElement).checked).to.equal(true);
            });

            it('should render multiple correctly', () => {
                const vNode =h('input', {multiple: true, type: 'file'});
                render(vNode);

                expect((vNode.dom as HTMLInputElement).multiple).to.equal(true);
            });
        });

        describe('Select', () => {
            it('should render value correctly', () => {
                const vNode = h('select', {value: '2'}, [
                    h('option', {value: '1'}, '1'),
                    h('option', {value: '2'}, '2'),
                ]);
                render(vNode);

                expect((vNode.dom as HTMLSelectElement).value).to.equal('2');
                expect((vNode.dom as HTMLSelectElement).selectedIndex).to.equal(1);
            });

            it('should render defaultValue correctly', () => {
                const vNode = h('select', {defaultValue: '2'}, [
                    h('option', {value: '1'}, '1'),
                    h('option', {value: '2'}, '2'),
                ]);
                render(vNode);

                expect((vNode.dom as HTMLSelectElement).value).to.equal('2');
                expect((vNode.dom as HTMLSelectElement).selectedIndex).to.equal(1);
            });

            it('should set value to emtpy if value does not exist in options', () => {
                const vNode = h('select', {value: '1'}, h('option', {value: '2'}, '2'));
                render(vNode);
                expect((vNode.dom as HTMLSelectElement).value).to.equal('');

                const vNode2 = h('select', {value: null}, h('option', {value: '2'}, '2'));
                render(vNode2);
                expect((vNode2.dom as HTMLSelectElement).value).to.equal('');

                const vNode3 = h('select', {value: undefined}, h('option', {value: '2'}, '2'));
                render(vNode3);
                expect((vNode3.dom as HTMLSelectElement).value).to.equal('');

                const vNode4 = h('select', null, h('option', {value: '2'}, '2'));
                render(vNode4);
                expect((vNode4.dom as HTMLSelectElement).value).to.equal('2');

                const vNode5 = h('select', {id: 'test'}, h('option', {value: '2'}, '2'));
                render(vNode5);
                expect((vNode5.dom as HTMLSelectElement).value).to.equal('2');
            });

            it('should render selectedIndex correctly', () => {
                const vNode = h('select', {selectedIndex: 1}, [
                    h('option', {value: '1'}, 1),
                    h('option', {value: '2'}, 2),
                ]);
                render(vNode);
                expect((vNode.dom as HTMLSelectElement).value).to.equal('2');

                const vNode1 = h('select', {selectedIndex: -1}, [
                    h('option', {value: '1'}, 1),
                    h('option', {value: '2'}, 2),
                ]);
                render(vNode1);
                expect((vNode1.dom as HTMLSelectElement).value).to.equal('');

            });

            it('should render multiple correctly', () => {
                const vNode = h('select', {value: ['1', '2'], multiple: true}, [
                    h('option', {value: '1'}, 1),
                    h('option', {value: '2'}, 2),
                    h('option', {value: '3'}, 3),
                ]);
                render(vNode);
                const select = vNode.dom as HTMLSelectElement;
                expect((select.children[0] as HTMLOptionElement).selected).to.be.true;
                expect((select.children[1] as HTMLOptionElement).selected).to.be.true;
                expect((select.children[2] as HTMLOptionElement).selected).to.be.false;

                const vNode2 = h('select', {value: '3', multiple: true}, [
                    h('option', {value: '1'}, 1),
                    h('option', {value: '2'}, 2),
                    h('option', {value: '3'}, 3),
                ]);
                render(vNode2);
                const select2 = vNode2.dom as HTMLSelectElement;
                expect((select2.children[0] as HTMLOptionElement).selected).to.be.false;
                expect((select2.children[1] as HTMLOptionElement).selected).to.be.false;
                expect((select2.children[2] as HTMLOptionElement).selected).to.be.true;

                const vNode3 = h('select', {multiple: true}, [
                    h('option', {value: '1'}, 1),
                    h('option', {value: '2'}, 2),
                    h('option', {value: '3'}, 3),
                ]);
                render(vNode3);
                const select3 = vNode3.dom as HTMLSelectElement;
                expect((select3.children[0] as HTMLOptionElement).selected).to.be.false;
                expect((select3.children[1] as HTMLOptionElement).selected).to.be.false;
                expect((select3.children[2] as HTMLOptionElement).selected).to.be.false;

                const vNode4 = h('select', {multiple: true}, [
                    h('option', {value: '1'}, 1),
                    h('option', {value: '2', selected: true}, 2),
                    h('option', {value: '3'}, 3),
                ]);
                render(vNode4);
                const select4 = vNode4.dom as HTMLSelectElement;
                expect((select4.children[0] as HTMLOptionElement).selected).to.be.false;
                expect((select4.children[1] as HTMLOptionElement).selected).to.be.true;
                expect((select4.children[2] as HTMLOptionElement).selected).to.be.false;
            });

            it('should render selected correctly', () => {
                const vNode = h('select', {value: '1'}, [
                    h('option', null, 1),
                    h('option', {value: '2', selected: true}, 2),
                ]);
                render(vNode);
                expect((vNode.dom as HTMLSelectElement).value).to.equal('');

                const vNode2 = h('select', {value: '1'}, [
                    h('option', {value: '1'}, 1),
                    h('option', {value: '2', selected: true}, 2),
                ]);
                render(vNode2);
                expect((vNode2.dom as HTMLSelectElement).value).to.equal('1');

                const vNode3 = h('select', {value: '2'}, [
                    h('option', {value: '1', selected: true}, 1),
                    h('option', {value: '2'}, 2),
                ]);
                render(vNode3);
                expect((vNode3.dom as HTMLSelectElement).value).to.equal('2');

                const vNode4 = h('select', {id: 'test'}, [
                    h('option', {value: '1'}, 1),
                    h('option', {value: '2', selected: true}, 2),
                ]);
                render(vNode4);
                expect((vNode4.dom as HTMLSelectElement).value).to.equal('2');
            });
        });

        describe('Textarea', () => {
            it('should render value correctly', () => {
                const vNode = h('textarea', {value: 'test'});
                render(vNode);

                expect((vNode.dom as HTMLTextAreaElement).value).to.equal('test');
            });

            it('should render defaultValue correctly', () => {
                const vNode = h('textarea', {defaultValue: 'test'});
                render(vNode);

                expect((vNode.dom as HTMLTextAreaElement).value).to.equal('test');
            });
        });

        describe('VModel', () => {
            const component = {
                v: '',
                set(v: string) {
                    component.v = v;
                },
            };

            it('should handle v-model on input correctly', () => {
                const vNode = h('input', {
                    value: 'test',
                    'ev-$model:input': linkEvent(component, (v: typeof component, e: InputEvent) => {
                        component.set((e.target as HTMLInputElement).value);
                    })
                });
                render(vNode);

                const input = vNode.dom as HTMLInputElement;
                input.value = 'aa';
                dispatchEvent(input, 'input');

                expect(component.v).to.equal('aa');
            });

            it('should handle v-model and input event on input element correctly', () => {
                const inputEvent = sinon.spy();
                const modelEvent = sinon.spy();
                const vNode = h('input', {
                    value: 'test',
                    'ev-$model:input': linkEvent(component, (v: typeof component, e: InputEvent) => {
                        modelEvent();
                    }),
                    'ev-input': inputEvent
                });
                render(vNode);

                const input = vNode.dom as HTMLInputElement;
                dispatchEvent(input, 'input');

                expect(inputEvent).have.been.callCount(1);
                expect(modelEvent).have.been.callCount(1);
                expect(inputEvent).to.have.been.calledAfter(modelEvent);
            });

            it('should handle v-model and input event order correctly', () => {
                const inputEvent = sinon.spy();
                const modelEvent = sinon.spy();
                const vNode = h('input', {
                    value: 'test',
                    'ev-input': inputEvent,
                    'ev-$model:input': linkEvent(component, (v: typeof component, e: InputEvent) => {
                        modelEvent();
                    }),
                });
                render(vNode);

                const input = vNode.dom as HTMLInputElement;
                dispatchEvent(input, 'input');

                expect(inputEvent).have.been.callCount(1);
                expect(modelEvent).have.been.callCount(1);
                expect(inputEvent).to.have.been.calledBefore(modelEvent);
            });

            it('should patch v-model event correctly', () => {
                const inputEvent = sinon.spy();
                const changeEvent = sinon.spy();
                const vNode = h('input', {
                    value: 'test',
                    'ev-$model:input': inputEvent,
                });
                r(vNode, container);

                r(h('input', {
                    type: 'checkbox',
                    'ev-$model:change': changeEvent,
                }), container);

                const input = vNode.dom as HTMLInputElement;
                dispatchEvent(input, 'input');
                expect(inputEvent).callCount(0);

                dispatchEvent(input, 'change');
                expect(changeEvent).callCount(1);
            });
        });

        describe('InnerHTML', () => {
            const _unmount = sinon.spy();
            class A implements ComponentClass {
                props = {};
                $inited = true;
                $SVG = false;
                $vNode = null;
                $lastInput: VNode | null = null;
                $mountedQueue = null;
                $parent = null;

                $init() { 

                }

                $render(lastVNode: any, nextVNode: any, parentDom: Element, anchor: Element, mountedQueue: Function[]) {
                    const vNode = h('div', null, 'component');
                    mount(vNode, parentDom, null, false, anchor, mountedQueue);
                    this.$lastInput = vNode;
                }

                $mount() {

                }

                $update() {

                }

                $unmount() {
                    _unmount();
                    unmount(this.$lastInput!, null);
                }
            } 

            it('should mount innerHTML', () => {
                render(h('div', {innerHTML: 'test'}));
                expect(container.innerHTML).to.equal('<div>test</div>');

                render(h('div', {innerHTML: undefined}));
                expect(container.innerHTML).to.equal('<div></div>');
            });

            it('should remove innerHTML', () => {
                r(h('div', {innerHTML: 'test'}), container);
                r(h('div', {innerHTML: undefined}), container);

                expect(container.innerHTML).to.equal('<div></div>');
            });

            it('should unmount children', () => {
                r(h('div', null, h(A)), container);
                r(h('div', {innerHTML: undefined}), container);

                expect(_unmount).to.have.callCount(1);
                expect(container.innerHTML).to.equal('<div></div>');

                r(h('div', null, [h(A), h(A)]), container);
                r(h('div', {innerHTML: undefined}), container);
                expect(_unmount).to.have.callCount(3);
                expect(container.innerHTML).to.equal('<div></div>');
            });

            it('should replace with component', () => {
                r(h('div', {innerHTML: 'test'}), container);
                r(h('div', null, h(A)), container);

                expect(container.innerHTML).to.equal('<div><div>component</div></div>');
            });
        });
    });
});
