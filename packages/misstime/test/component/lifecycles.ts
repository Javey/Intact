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
            const beforeMount = jasmine.createSpy();
            const mounted = jasmine.createSpy();

            class Test extends Component {
                static template = function(this: Test) {
                    return h('div', null, null);
                }
                beforeMount() {
                    // const dom = findDomFromVNode(this.$lastInput!, true); 
                    // dom!.textContent = 'a'; 
                    expect(this.$mounted).toBeFalse();
                    expect(this.$lastInput).toBeNull();
                    beforeMount();
                }
                mounted() {
                    const dom = findDomFromVNode(this.$lastInput!, true); 
                    expect(this.$mounted).toBeTrue();
                    expect(dom!.parentElement).toBeTruthy();
                    mounted();
                }
            }

            render(h(Test), container);
            // expect(container.innerHTML).toBe('<div>a</div>');
            expect(beforeMount).toHaveBeenCalledTimes(1);
            expect(mounted).toHaveBeenCalledTimes(1);
        });

        it('should call beforeUpdate & updated', () => {
            const beforeUpdate = jasmine.createSpy();
            const updated = jasmine.createSpy();

            class Test extends Component<{name: string}> {
                static template(this: Test) {
                    return h('div', null, this.props.name);
                }
                beforeUpdate() {
                    const dom = findDomFromVNode(this.$lastInput!, true);
                    expect((dom as Element).innerHTML).toBe('a');
                    beforeUpdate();
                }
                updated() {
                    const dom = findDomFromVNode(this.$lastInput!, true);
                    expect((dom as Element).innerHTML).toBe('b');
                    updated();
                }
            }

            render(h(Test, {name: 'a'}), container);
            render(h(Test, {name: 'b'}), container);
            expect(beforeUpdate).toHaveBeenCalledTimes(1);
            expect(updated).toHaveBeenCalledTimes(1);
        });

        it('should call beforeUnmount & unmounted', () => {
            const beforeUnmount = jasmine.createSpy();
            const unmounted = jasmine.createSpy();

            class Test extends Component<{name: string}> {
                static template(this: Test) {
                    return h('div', null, this.props.name);
                }
                beforeUnmount() {
                    expect(this.$unmounted).toBeFalse();
                    beforeUnmount();
                }
                unmounted() {
                    expect(this.$unmounted).toBeTrue();
                    unmounted();
                }
            }

            render(h(Test, {name: 'a'}), container);
            render(null, container);
            expect(beforeUnmount).toHaveBeenCalledTimes(1);
            expect(unmounted).toHaveBeenCalledTimes(1);
        });
    });
});
