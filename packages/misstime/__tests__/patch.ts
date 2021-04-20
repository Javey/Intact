import {VNode, Types, ChildrenTypes, VNodeElement} from '../src/utils/types';
import {createVNode as h, createElementVNode, createVoidVNode, createTextVNode, createCommentVNode} from '../src/core/vnode';
import {patch} from '../src/core/patch';
import {mount} from '../src/core/mount';
import {linkEvent} from '../src/events/linkEvent';
import {dispatchEvent} from './utils';
import {unmount} from '../src/core/unmount';
import {Fragment} from '../src/utils/common';
import {render as _render} from '../src/core/render';

describe('Patch', () => {
    let container: Element;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        _render(null, container);
        document.body.removeChild(container);
    });

    function render(vNode: VNode) {
        _render(vNode, container);
    }
    function update(vNode: VNode) {
        _render(vNode, container);
        return vNode;
    }
    function patchTest(vNode1: VNode, vNode2: VNode, html?: string) {
        render(vNode1);
        render(vNode2);
        if (html !== undefined) {
            expect(container.innerHTML).to.equal(html);
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
        render(vNode2);
        expect(vNode1.dom === vNode2.dom).to.be.false;
    });

    describe('Patch the same type', () => {
        it('should patch Text', () => {
            patchTest(
                createTextVNode('a'),
                createTextVNode('b'),
                'b'
            );
        });

        it('should patch comment', () => {
            patchTest(
                createCommentVNode('a'),
                createCommentVNode('b'),
                '<!--b-->'
            );
        });
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
            patchTest(
                h('div', null, h('a')),
                h('div', null, h(Fragment, null, [h('a'), h('b')])),
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
            patchTest(
                h('div'),
                h('div', null, h(Fragment, null, [h('a'), h('b')])),
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
            patchTest(
                h('div', null, 'a'),
                h('div', null, h(Fragment, null, [h('a'), h('b')])),
                '<div><a></a><b></b></div>'
            );
        });

        it('should patch children which last children is Fragment', () => {
            patchTest(
                h('div', null, h(Fragment, null, [h('a'), h('b')])),
                h('div'),
                '<div></div>'
            );
            patchTest(
                h('div', null, h(Fragment, null, [h('a'), h('b')])),
                h('div', null, h('div')),
                '<div><div></div></div>'
            );
            patchTest(
                h('div', null, h(Fragment, null, [h('a'), h('b')])),
                h('div', null, 'a'),
                '<div>a</div>'
            );
            patchTest(
                h('div', null, h(Fragment, null, [h('a'), h('b')])),
                h('div', null, h(Fragment, null, [h('a')])),
                '<div><a></a></div>'
            );
            patchTest(
                h('div', null, h(Fragment, null, h('a'))),
                h('div', null, h(Fragment, null, [])),
                '<div></div>'
            );
            patchTest(
                h('div', null, h(Fragment, null, [h('a', {key: 'a'}), h('b', {key: 'b'})])),
                h('div', null, h(Fragment, null, [h('a', {key: 'a'}), h('i', {key: 'i'}), h('b', {key: 'b'})])),
                '<div><a></a><i></i><b></b></div>'
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
                h('div', null, h(Fragment, null, h('div'))),
                '<div><div></div></div>'
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
        });

        describe('Non-Keyed', () => {
            const map: Record<string, VNode> = {};
            ['a', 'b', 'c', 'd'].forEach(key => map[key] = h('i', null, key));

            it('should remove surplus nodes', () => {
                patchTest(
                    createElementVNode(Types.CommonElement, 'div', [map.a, map.b], ChildrenTypes.HasNonKeyedChildren),
                    createElementVNode(Types.CommonElement, 'div', [map.a], ChildrenTypes.HasNonKeyedChildren),
                    '<div><i>a</i></div>'
                );
            });

            it('should mount new nodes', () => {
                patchTest(
                    createElementVNode(Types.CommonElement, 'div', [map.a], ChildrenTypes.HasNonKeyedChildren),
                    createElementVNode(Types.CommonElement, 'div', [map.a, map.b], ChildrenTypes.HasNonKeyedChildren),
                    '<div><i>a</i><i>b</i></div>'
                );
            });
        });

        describe('Keyed', () => {
            const map: Record<string, VNode> = {};
            ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'].forEach(key => {
                map[key] = h('i', {key}, key);
            });

            it('should sync nodes with the same key at the end and insert new node', () => {
                patchTest(
                    h('div', null, [map.a, map.b]),
                    h('div', null, [map.c, map.b]),
                    '<div><i>c</i><i>b</i></div>'
                );
            });

            describe('Short length', () => {
                it('should remove whole content', () => {
                    patchTest(
                        h('div', null, [map.a, map.b]),
                        h('div', null, [map.c, map.d, map.e, map.f, map.g]),
                        '<div><i>c</i><i>d</i><i>e</i><i>f</i><i>g</i></div>'
                    );
                });

                it('should move node', () => {
                    patchTest(
                        h('div', null, [map.a, map.b]),
                        h('div', null, [map.b, map.a]),
                        '<div><i>b</i><i>a</i></div>'
                    );
                });

                it('should not remove whole content', () => {
                    patchTest(
                        h('div', null, [map.a, map.b, map.c]),
                        h('div', null, [map.c, map.b]),
                        '<div><i>c</i><i>b</i></div>'
                    );
                });

                it('should remove node that exceeds the next length', () => {
                     patchTest(
                        h('div', null, [map.b, map.c, map.a]),
                        h('div', null, [map.c, map.b]),
                        '<div><i>c</i><i>b</i></div>'
                    );
                });

                it('should clone vNode if in use', () => {
                    const {a, b} = map;
                    patchTest(
                        createElementVNode(Types.CommonElement, 'div', [a, b], ChildrenTypes.HasKeyedChildren),
                        createElementVNode(Types.CommonElement, 'div', [b, a], ChildrenTypes.HasKeyedChildren),
                        '<div><i>b</i><i>a</i></div>'
                    );

                    patchTest(
                        createElementVNode(Types.CommonElement, 'div', [a, b], ChildrenTypes.HasKeyedChildren),
                        createElementVNode(Types.CommonElement, 'div', [a, b], ChildrenTypes.HasKeyedChildren),
                        '<div><i>a</i><i>b</i></div>'
                    );

                    patchTest(
                        createElementVNode(Types.CommonElement, 'div', [a, b], ChildrenTypes.HasKeyedChildren),
                        createElementVNode(Types.CommonElement, 'div', [b], ChildrenTypes.HasKeyedChildren),
                        '<div><i>b</i></div>'
                    );

                    // j > aEnd && j <= bEnd
                    patchTest(
                        createElementVNode(Types.CommonElement, 'div', [a], ChildrenTypes.HasKeyedChildren),
                        createElementVNode(Types.CommonElement, 'div', [a, b], ChildrenTypes.HasKeyedChildren),
                        '<div><i>a</i><i>b</i></div>'
                    );

                    // patched !== bLeft
                    patchTest(
                        createElementVNode(Types.CommonElement, 'div', [map.d, a], ChildrenTypes.HasKeyedChildren),
                        createElementVNode(Types.CommonElement, 'div', [a, b], ChildrenTypes.HasKeyedChildren),
                        '<div><i>a</i><i>b</i></div>'
                    );
                });
            });

            describe('Long length', () => {
                const fillVNodes = Array.apply(null, {length: 32} as any).map((v, i) => {
                    return h('i', {key: i});
                });
                const fillHtml = new Array(32).fill('<i></i>').join('');

                it('should remove whole content', () => {
                    patchTest(
                        h('div', null, [map.a]),
                        h('div', null, fillVNodes),
                        `<div>${fillHtml}</div>`
                    );
                });

                it('should move node', () => {
                    patchTest(
                        h('div', null, [map.a, fillVNodes, map.b]),
                        h('div', null, [map.b, fillVNodes, map.a]),
                        `<div><i>b</i>${fillHtml}<i>a</i></div>`
                    );
                });

                it('should not remove whole content', () => {
                    patchTest(
                        h('div', null, [map.a, map.b, map.c, map.d]),
                        createElementVNode(Types.CommonElement, 'div', [map.c, map.b, ...fillVNodes], ChildrenTypes.HasKeyedChildren),
                        `<div><i>c</i><i>b</i>${fillHtml}</div>`
                    );
                });

                it('should remove node that exceeds the next length', () => {
                     patchTest(
                        h('div', null, [
                            fillVNodes, map.b, map.c, map.a
                        ]),
                        h('div', null, [
                            map.b, fillVNodes, map.c
                        ]),
                        `<div><i>b</i>${fillHtml}<i>c</i></div>`
                    );
                });
            });
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

        expect(dom1!).to.be.null;
        expect(dom2!.tagName).to.equal('DIV');
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
                '<div></div>'
            );
        });

        describe('Event', () => {
            describe('Undelegated', () => {
                it('should do nothing if is the same LinkEvent', () => {
                    const enter = sinon.spy();
                    patchTest(
                        h('div', {'ev-mouseenter': linkEvent('data', enter)}),
                        h('div', {'ev-mouseenter': linkEvent('data', enter)}),
                    );

                    dispatchEvent(container.firstElementChild!, 'mouseenter');
                    expect(enter).to.have.been.calledOnce;
                });

                it('should detach event', () => {
                    const enter = sinon.spy();
                    patchTest(
                        h('div', {'ev-mouseenter': enter}),
                        h('div', {'ev-mouseenter': null}),
                    );

                    dispatchEvent(container.firstElementChild!, 'mouseenter');
                    expect(enter).to.have.callCount(0);
                });

                it('should change event handler', () => {
                    const enter1 = sinon.spy();
                    const enter2 = sinon.spy();
                    patchTest(
                        h('div', {'ev-mouseenter': enter1}),
                        h('div', {'ev-mouseenter': enter2}),
                    );

                    dispatchEvent(container.firstElementChild!, 'mouseenter');
                    expect(enter1).to.have.callCount(0);
                    expect(enter2).to.have.callCount(1);
                });
            });

            describe('Delegated', () => {
                it('should do nothing if is the same LinkEvent', () => {
                    const click = sinon.spy();
                    const childClick = sinon.spy();
                    const vNode = patchTest(
                        h('div', {'ev-click': linkEvent('data', click)}),
                        h('div', {'ev-click': linkEvent('data', click)},
                            h('div', {'ev-click': childClick},
                                h('div', {'ev-click': childClick})
                            )
                        )

                    );

                    dispatchEvent(container.firstElementChild!, 'click');
                    expect(click).to.have.callCount(1);

                    const vNode2 = update(
                        h('div', {'ev-click': linkEvent('data', click)},
                            h('div', {'ev-click': null},
                                h('div', {'ev-click': childClick})
                            )
                        )
                    );
                    dispatchEvent(container.firstElementChild!.firstElementChild!.firstElementChild!, 'click');
                    expect(click).to.have.callCount(2);
                    expect(childClick).to.have.callCount(1);

                    unmount(vNode2);
                });

                it('should detach event', () => {
                    const click = sinon.spy();
                    const vNode = patchTest(
                        h('div', {'ev-click': click}),
                        h('div', {'ev-click': null}),
                    );

                    dispatchEvent(container.firstElementChild!, 'mouseenter');
                    expect(click).to.have.callCount(0);
                    unmount(vNode);
                });

                it('should change event handler', () => {
                    const click1 = sinon.spy();
                    const click2 = sinon.spy();
                    const vNode = patchTest(
                        h('div', {'ev-click': click1}),
                        h('div', {'ev-click': click2}),
                    );

                    dispatchEvent(container.firstElementChild!, 'click');
                    expect(click1).to.have.callCount(0);
                    expect(click2).to.have.callCount(1);
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
            expect((container.firstElementChild as HTMLSelectElement).value).to.equal('');
            
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
            expect((container.firstElementChild as HTMLSelectElement).value).to.equal('');

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
            expect((container.firstElementChild as HTMLSelectElement).value).to.equal('1');
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
            expect(select.options[0].selected).to.be.true;
            expect(select.options[1].selected).to.be.false;
        });
    });
});
