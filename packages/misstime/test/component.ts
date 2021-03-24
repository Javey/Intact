import {Component} from '../src/core/component';
import {render} from '../src/core/render';
import {createVNode as h} from '../src/core/vnode';
import {Fragment} from '../src/utils/common';

describe('Component', () => {
    let container: Element;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    describe('Mount', () => {
        it('should mount component which return HtmlElement vNode', () => {
            class Test extends Component {
                template = function() {
                    return h('div', null, 'test')
                }
            }

            render(h(Test), container);
            expect(container.innerHTML).toBe('<div>test</div>');
        });

        // it('should mount component which return Fragment vNode', () => {
            // class Test extends Component {
                // static template = () => {
                    // return h(Fragment, null, [
                        // h('i', null, 'a'),
                        // h('i', null, 'b'),
                    // ]);
                // }
            // }

            // render(h(Test), container);
            // expect(container.innerHTML).toBe('<i>a</i><i>b</i>');
        // });

        // it('should mount component which return null', () => {
            // class Test extends Component {
                // static template = () => {
                    // return null;
                // }
            // }

            // render(h(Test), container);
            // expect(container.innerHTML).toBe('');
        // });
    });

    // describe('Update', () => {
        // it('should mount component which return HtmlElement vNode', () => {
            // class Test extends Component {
                // static template(this: Test) {
                    // return h('div', null, this.props.name)
                // }
            // }

            // render(h(Test), container);
            // expect(container.innerHTML).toBe('<div>test</div>');
        // });
    // });
});
