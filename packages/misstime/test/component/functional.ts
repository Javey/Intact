import {Component} from '../../src/core/component';
import {render} from '../../src/core/render';
import {createVNode as h} from '../../src/core/vnode';
import {Fragment} from '../../src/utils/common';
import {VNode, ComponentClass, Props, Template} from '../../src/utils/types';
import {patchTest as _patchTest} from '../utils';

describe('Functional component', () => {
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
        return _patchTest(container, vNode1, vNode2, html);
    }

    describe('Mount', () => {
        it('should mount functional component which return html element', () => {
            function Test() {
                return h('div', null, 'test');
            }
            render(h(Test), container);
            expect(container.innerHTML).toBe('<div>test</div>');
        });

        it('should mount functional component which return Fragment', () => {
            render(h(() => {
                return h(Fragment, null, [
                    h('i', null, 'a'),
                    h('i', null, 'b')
                ])
            }), container);
            expect(container.innerHTML).toBe('<i>a</i><i>b</i>');
        });

        it('should mount functional component which return null', () => {
            render(h(() => null), container);
            expect(container.innerHTML).toBe('');
        });
    });

    describe('Patch', () => {
        function Test() {
            return [h('i', null, 1), h('i', null, 2)];
        }

        it('should move element before functional component', () => {
            const a = h(Test, {key: 'a'});
            const b = h('i', {key: 'b'}, 'b');
            patchTest(
                h('div', null, [a, b]),
                h('div', null, [b, a]),
                '<div><i>b</i><i>1</i><i>2</i></div>'
            );
        });

        it('should move functional component before element', () => {
            const a = h('i', {key: 'a'}, 'a');
            const b = h(Test, {key: 'b'});
            patchTest(
                h('div', null, [a, b]),
                h('div', null, [b, a]),
                '<div><i>1</i><i>2</i><i>a</i></div>'
            );
        });

        it('should unmount functional component', () => {
            let test: Test1 | null = null;
            class Test1 extends Component {
                static template = () => h('div');
            }
            function Test() {
                return h(Test1, {ref: i => {
                    if (i) test = i;
                }});
            }
            const a = h(Test);
            const b = h('i', null, 'i');
            patchTest(
                h('div', null, a),
                h('div', null, b),
                '<div><i>i</i></div>'
            );
            expect(test!.$unmounted).toBe(true);
        });
    });
});
