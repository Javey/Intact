import {VNode, Types, ChildrenTypes, VNodeElement} from '../src/types';
import {createVNode as h, createElementVNode} from '../src/vnode';
import {patch} from '../src/patch';
import {mount} from '../src/mount';
import {linkEvent} from '../src/events/linkEvent';
import {dispatchEvent} from './utils';
import {unmount} from '../src/unmount';

describe('Patch', () => {
    let container: Element;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        // document.body.removeChild(container);
    });

    function render(vNode: VNode) {
        mount(vNode, container, false, []);
    }
    function update(vNode1: VNode, vNode2: VNode) {
        patch(vNode1, vNode2, container, false, []);
    }
    function patchTest<P, Q>(vNode1: VNode<P>, vNode2: VNode<Q>, html?: string) {
        container.textContent = '';
        render(vNode1);
        update(vNode1, vNode2);
        if (html !== undefined) {
            expect(container.innerHTML).toBe(html);
        }
        return vNode2;
    }

    it('should replace element if tag is different', () => {
        patchTest(h('div'), h('span'), '<span></span>');
    });

    it('should replace element if type is different', () => {
        patchTest(h('input'), h('div'), '<div></div>');
    });

    it('should replace element if key is different', () => {
        const vNode1 = h('div', {key: 1});
        const vNode2 = h('div', {key: 2});
        render(vNode1);
        patch(vNode1, vNode2, container, false, []);
        expect(vNode1.dom === vNode2.dom).toBeFalse();
    });

    describe('Children', () => {
        it('should patch children which last children is a vNode', () => {
            patchTest(
                h('div', null, h('a')),
                h('div', null, h('b')),
                '<div><b></b></div>'
            );
            patchTest(
                h('div', null, h('a')),
                h('div'),
                '<div></div>'
            );
            patchTest(
                h('div', null, h('a')),
                h('div', null, 'a'),
                '<div>a</div>'
            );
            patchTest(
                h('div', null, h('a')),
                h('div', null, [h('a'), h('b')]),
                '<div><a></a><b></b></div>'
            );
        });

        it('should patch children which last children is invalid', () => {
            patchTest(
                h('div'),
                h('div', null, h('b')),
                '<div><b></b></div>'
            );
            patchTest(
                h('div'),
                h('div', null, 'b'),
                '<div>b</div>'
            );
            patchTest(
                h('div'),
                h('div', null, [h('a'), h('b')]),
                '<div><a></a><b></b></div>'
            );
        });

        it('should patch children which last children is text', () => {
            patchTest(
                h('div', null, 'a'),
                h('div', null, h('b')),
                '<div><b></b></div>'
            );
            patchTest(
                h('div', null, ''),
                h('div', null, 'b'),
                '<div>b</div>'
            );
            patchTest(
                h('div', null, 'a'),
                h('div'),
                '<div></div>'
            );
            patchTest(
                h('div', null, 'a'),
                h('div', null, 'b'),
                '<div>b</div>'
            );
            patchTest(
                h('div', null, 'a'),
                h('div', null, [h('a'), h('b')]),
                '<div><a></a><b></b></div>'
            );
        });

        it('should patch children which last children is multiple vNodes', () => {
            patchTest(
                h('div', null, [h('a'), h('b')]),
                h('div', null, h('b')),
                '<div><b></b></div>'
            );
            patchTest(
                h('div', null, [h('a'), h('b')]),
                h('div'),
                '<div></div>'
            );
            patchTest(
                h('div', null, [h('a'), h('b')]),
                h('div', null, 'b'),
                '<div>b</div>'
            );
            patchTest(
                h('div', null, [h('a'), h('b')]),
                // h('div', null, []),
                createElementVNode(
                    Types.CommonElement,
                    'div',
                    [],
                    ChildrenTypes.HasKeyedChildren,
                ),
                '<div></div>'
            );
            patchTest(
                createElementVNode(
                    Types.CommonElement,
                    'div',
                    [],
                    ChildrenTypes.HasKeyedChildren,
                ),
                h('div', null, [h('a'), h('b')]),
                '<div><a></a><b></b></div>'
            );
            // patch keyed children
            patchTest(
                h('div', null, [h('a'), h('b')]),
                h('div', null, [h('span')]),
                '<div><span></span></div>'
            );
            // patch non-keyed children
            patchTest(
                createElementVNode(
                    Types.CommonElement,
                    'div',
                    [
                        createElementVNode(Types.CommonElement, 'a'),
                        createElementVNode(Types.CommonElement, 'b'),
                    ],
                    ChildrenTypes.HasNonKeyedChildren,
                ),
                createElementVNode(
                    Types.CommonElement,
                    'div',
                    [
                        createElementVNode(Types.CommonElement, 'span'),
                    ],
                    ChildrenTypes.HasNonKeyedChildren,
                ),
                '<div><span></span></div>'
            );
        });
    });

    it('should patch className', () => {
        patchTest(
            h('div', {className: 'a'}),
            h('div', {className: 'b'}),
            '<div class="b"></div>'
        );

        patchTest(
            h('div', {className: 'a'}),
            h('div'),
            '<div></div>'
        );

        patchTest(
            h('svg'),
            h('svg', {className: 'b'}),
            '<svg class="b"></svg>'
        );
    });

    it('should patch ref', () => {
        let dom1: Element | null;
        let dom2: Element | null;

        patchTest(
            h('div', {ref: i => dom1 = i}),
            h('div', {ref: i => dom2 = i}),
        );

        expect(dom1!).toBeNull();
        expect(dom2!.tagName).toBe('DIV');
    });

    describe('Props', () => {
        it('should patch attributes', () => {
            patchTest(
                h('div', {id: 'a'}),
                h('div', {id: 'b'}),
                '<div id="b"></div>'
            );

            patchTest(
                h('div', {id: 'a'}),
                h('div'),
                '<div></div>'
            );

            patchTest(
                h('div'),
                h('div', {id: 'b'}),
                '<div id="b"></div>'
            );
        });

        it('should patch svg namespace attributes', () => {
            patchTest(
                h('svg', {'xlink:href': 'http://a.com'}),
                h('svg', {'xlink:href': 'http://b.com'}),
                '<svg xlink:href="http://b.com"></svg>'
            );
        });

        it('should patch style', () => {
            patchTest(
                h('div', {style: 'color: red; font-size: 20px'}),
                h('div', {style: 'color: red;'}),
                '<div style="color: red;"></div>'
            );
            patchTest(
                h('div', {style: {color: 'red', fontSize: '20px'}}),
                h('div', {style: {color: 'red'}}),
                '<div style="color: red;"></div>'
            );
            patchTest(
                h('div', {style: {color: 'blue', fontSize: '20px'}}),
                h('div', {style: {color: 'red'}}),
                '<div style="color: red;"></div>'
            );
            patchTest(
                h('div', {style: {color: 'red'}}),
                h('div'),
                '<div style=""></div>'
            );
        });

        describe('Event', () => {
            describe('Undelegated', () => {
                it('should do nothing if is the same LinkEvent', () => {
                    const enter = jasmine.createSpy();
                    patchTest(
                        h('div', {'ev-mouseenter': linkEvent('data', enter)}),
                        h('div', {'ev-mouseenter': linkEvent('data', enter)}),
                    );

                    dispatchEvent(container.firstElementChild!, 'mouseenter');
                    expect(enter).toHaveBeenCalledTimes(1);
                });

                it('should detach event', () => {
                    const enter = jasmine.createSpy();
                    patchTest(
                        h('div', {'ev-mouseenter': enter}),
                        h('div', {'ev-mouseenter': null}),
                    );

                    dispatchEvent(container.firstElementChild!, 'mouseenter');
                    expect(enter).toHaveBeenCalledTimes(0);
                });

                it('should change event handler', () => {
                    const enter1 = jasmine.createSpy();
                    const enter2 = jasmine.createSpy();
                    patchTest(
                        h('div', {'ev-mouseenter': enter1}),
                        h('div', {'ev-mouseenter': enter2}),
                    );

                    dispatchEvent(container.firstElementChild!, 'mouseenter');
                    expect(enter1).toHaveBeenCalledTimes(0);
                    expect(enter2).toHaveBeenCalledTimes(1);
                });
            });

            describe('Delegated', () => {
                it('should do nothing if is the same LinkEvent', () => {
                    const click = jasmine.createSpy();
                    const childClick = jasmine.createSpy();
                    const vNode = patchTest(
                        h('div', {'ev-click': linkEvent('data', click)}),
                        h('div', {'ev-click': linkEvent('data', click)},
                            h('div', {'ev-click': childClick},
                                h('div', {'ev-click': childClick})
                            )
                        )

                    );

                    dispatchEvent(container.firstElementChild!, 'click');
                    expect(click).toHaveBeenCalledTimes(1);

                    update(
                        vNode, 
                        h('div', {'ev-click': linkEvent('data', click)},
                            h('div', {'ev-click': null},
                                h('div', {'ev-click': childClick})
                            )
                        )
                    );
                    dispatchEvent(container.firstElementChild!.firstElementChild!.firstElementChild!, 'click');
                    expect(click).toHaveBeenCalledTimes(2);
                    expect(childClick).toHaveBeenCalledTimes(1);

                    unmount(vNode);
                });

                it('should detach event', () => {
                    const click = jasmine.createSpy();
                    const vNode = patchTest(
                        h('div', {'ev-click': click}),
                        h('div', {'ev-click': null}),
                    );

                    dispatchEvent(container.firstElementChild!, 'mouseenter');
                    expect(click).toHaveBeenCalledTimes(0);
                    unmount(vNode);
                });

                it('should change event handler', () => {
                    const click1 = jasmine.createSpy();
                    const click2 = jasmine.createSpy();
                    const vNode = patchTest(
                        h('div', {'ev-click': click1}),
                        h('div', {'ev-click': click2}),
                    );

                    dispatchEvent(container.firstElementChild!, 'click');
                    expect(click1).toHaveBeenCalledTimes(0);
                    expect(click2).toHaveBeenCalledTimes(1);
                    unmount(vNode);
                });
            });
        });
    });

    describe('Form', () => {
        it('should patch select which multiple is false correctly', () => {
            patchTest(
                h('select', {value: ''}, [
                    h('option', {value: '1'}, '1'),
                    h('option', {value: '2'}, '2'),
                ]),
                h('select', {value: 1}, [
                    h('option', {value: '1'}, '1'),
                    h('option', {value: '2'}, '2'),
                ])
            );
            expect((container.firstElementChild as HTMLSelectElement).value).toBe('');
            
            patchTest(
                h('select', {value: '1'}, [
                    h('option', {value: 1}, '1'),
                    h('option', {value: 2}, '2')
                ]),
                h('select', {value: ''}, [
                    h('option', {value: 1}, '1'),
                    h('option', {value: 2}, '2')
                ]),
            );
            expect((container.firstElementChild as HTMLSelectElement).value).toBe('');

            patchTest(
                h('select', {defaultValue: 2}, [
                    h('option', {value: 1}, '1'),
                    h('option', {value: 2}, '2')
                ]),
                h('select', {value: 1}, [
                    h('option', {value: 1}, '1'),
                    h('option', {value: 2}, '2')
                ]),
            );
            expect((container.firstElementChild as HTMLSelectElement).value).toBe('1');
        });

        it('should patch select which multiple is true correctly', () => {
            patchTest(
                h('select', {value: 2, multiple: true}, [
                    h('option', {value: 1}, '1'),
                    h('option', {value: 2}, '2')
                ]),
                h('select', {value: 1, multiple: true}, [
                    h('option', {value: 1}, '1'),
                    h('option', {value: 2}, '2')
                ])
            );
            const select = container.firstElementChild as HTMLSelectElement;
            expect(select.options[0].selected).toBeTrue();
            expect(select.options[1].selected).toBeFalse();
        });
    });
});
