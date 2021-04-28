import {Component} from '../../src/core/component';
import {render} from '../../src/core/render';
import {createVNode as h, VNode as VNodeConstructor} from '../../src/core/vnode';
import {Fragment, findDomFromVNode} from '../../src/utils/common';
import {VNode, VNodeComponentClass, Template} from '../../src/utils/types';

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

    describe('Lifecycle', () => {
        it('should call beforeMount & mounted', () => {
            const beforeMount = sinon.spy();
            const mounted = sinon.spy();

            class Test extends Component {
                static template = function(this: Test) {
                    return h('div', null, null);
                }
                beforeMount() {
                    // const dom = findDomFromVNode(this.$lastInput!, true); 
                    // dom!.textContent = 'a'; 
                    expect(this.$mounted).to.be.false;
                    expect(this.$lastInput).to.be.null;
                    beforeMount();
                }
                mounted() {
                    const dom = findDomFromVNode(this.$lastInput!, true); 
                    expect(this.$mounted).to.be.true;
                    expect(dom!.parentElement).to.be.exist;
                    mounted();
                }
            }

            render(h(Test), container);
            // expect(container.innerHTML).to.equal('<div>a</div>');
            expect(beforeMount).to.have.callCount(1);
            expect(mounted).to.have.callCount(1);
        });

        it('should call beforeUpdate & updated', () => {
            const beforeUpdate = sinon.spy();
            const updated = sinon.spy();

            class Test extends Component<{name: string}> {
                static template(this: Test) {
                    return h('div', null, this.props.name);
                }
                beforeUpdate() {
                    const dom = findDomFromVNode(this.$lastInput!, true);
                    expect((dom as Element).innerHTML).to.equal('a');
                    beforeUpdate();
                }
                updated() {
                    const dom = findDomFromVNode(this.$lastInput!, true);
                    expect((dom as Element).innerHTML).to.equal('b');
                    updated();
                }
            }

            render(h(Test, {name: 'a'}), container);
            render(h(Test, {name: 'b'}), container);
            expect(beforeUpdate).to.have.callCount(1);
            expect(updated).to.have.callCount(1);
        });

        it('should call beforeUnmount & unmounted', () => {
            const beforeUnmount = sinon.spy();
            const unmounted = sinon.spy();

            class Test extends Component<{name: string}> {
                static template(this: Test) {
                    return h('div', null, this.props.name);
                }
                beforeUnmount() {
                    expect(this.$unmounted).to.be.false;
                    beforeUnmount();
                }
                unmounted() {
                    expect(this.$unmounted).to.be.true;
                    unmounted();
                }
            }

            render(h(Test, {name: 'a'}), container);
            render(null, container);
            expect(beforeUnmount).to.have.callCount(1);
            expect(unmounted).to.have.callCount(1);
        });
    });
});
