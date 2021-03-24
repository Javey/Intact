import {Component, Template} from '../src/core/component';
import {render} from '../src/core/render';
import {createVNode as h} from '../src/core/vnode';
import {Fragment} from '../src/utils/common';
import {VNode} from '../src/utils/types';

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

    describe('Mount', () => {
        it('should mount component which return HtmlElement vNode', () => {
            class Test extends Component {
                static template = () => {
                    return h('div', null, 'test')
                }
            }

            render(h(Test), container);
            expect(container.innerHTML).toBe('<div>test</div>');
        });

        it('should mount component which return Fragment vNode', () => {
            class Test extends Component {
                static template = () => {
                    return h(Fragment, null, [
                        h('i', null, 'a'),
                        h('i', null, 'b'),
                    ]);
                }
            }

            render(h(Test), container);
            expect(container.innerHTML).toBe('<i>a</i><i>b</i>');
        });

        it('should mount component which return null', () => {
            class Test extends Component {
                static template = () => {
                    return null;
                }
            }

            render(h(Test), container);
            expect(container.innerHTML).toBe('');
        });
    });

    describe('Patch', () => {
        class Test extends Component {
            static template = () => {
                return [h('i', null, 1), h('i', null, 2)];
            }
        }

        it('should move element before component', () => {
            const a = h(Test, {key: 'a'});
            const b = h('i', {key: 'b'}, 'b');
            patchTest(
                h('div', null, [a, b]),
                h('div', null, [b, a]),
                '<div><i>b</i><i>1</i><i>2</i></div>'
            );
        });

        it('should move component before element', () => {
            const a = h('i', {key: 'a'}, 'a');
            const b = h(Test, {key: 'b'});
            patchTest(
                h('div', null, [a, b]),
                h('div', null, [b, a]),
                '<div><i>1</i><i>2</i><i>a</i></div>'
            );
        });

        it('should remove component', () => {
            const a = h(Test);
            const b = h('i', null, 'i');
            patchTest(
                h('div', null, a),
                h('div', null, b),
                '<div><i>i</i></div>'
            );
        });
    });

    describe('Update', () => {
        it('should update component which return HtmlElement vNode', () => {
            class Test extends Component<{name: string}> {
                static template: Template<Test> = function() {
                    return h('div', null, this.props.name)
                }
            }

            render(h(Test, {name: 1}), container);
            render(h(Test, {name: 2}), container);
            expect(container.innerHTML).toBe('<div>2</div>');
        });

        it('should replace dom', () => {
            class Test extends Component<{name: number}> {
                static template: Template<Test> = function() {
                    if (this.props.name === 1) {
                        return h('div'); 
                    } else {
                        return [h('span'), h('span')];
                    }
                }
            }

            render(h(Test, {name: 1}), container);
            render(h(Test, {name: 2}), container);
            expect(container.innerHTML).toBe('<span></span><span></span>');
        });
    });
});
