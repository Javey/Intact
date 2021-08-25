import {Component} from '../src/core/component';
import {render, createVNode as h, Fragment, VNode, RefFunction} from 'misstime';
import {Template} from 'vdt';
import {nextTick} from '../../misstime/__tests__/utils';

describe('Component', () => {
    let container: Element;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    describe('ForceUpdate', () => {
        it('should not update when set prop in first $receive event callback', async () => {
            const template = sinon.spy(() => console.log('render'));
            class Test extends Component<{name: string}> {
                static template(this: Test) {
                    template();
                    return h('div', null, this.$props.name);
                }

                init() {
                    this.on('$receive:name', () => {
                        this.set('name', '2');
                    });
                }
            }

            render(h(Test, {name: '1'}), container);

            await nextTick();
            expect(template).to.have.callCount(1);
        });
    });
});
