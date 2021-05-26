import {Component} from '../src/core/component';
import {render, createVNode as h, VNode} from 'misstime';
import {watch} from '../src/core/watch';
import {onInited, onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted} from '../src/core/lifecyles';

describe('Component', () => {
    let container: Element;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    describe('Composition API', () => {
        it('should throwError if call composition api not in init()', () => {
            class A extends Component {
                static template = () => h('div');

                beforeMount() {
                    watch('key', () => {});
                }
            }

            expect(() => render(h(A), container)).throw('Intact Error: watch() can only be used inside init()');

            class B extends Component {
                static template = () => h('div');

                beforeMount() {
                    onMounted(() => {});
                }
            }

            expect(() => render(h(B), container)).throw('Intact Error: onMounted() can only be used inside init()');
        });

        it('watch', () => {
            const callback = sinon.spy();
            interface AProps {a: string, b?: number}
            class A<T extends AProps = AProps> extends Component<T> {
                static template = () => h('div');
                init() {
                    watch<AProps, 'a'>('a', (newValue, oldValue) => {
                        callback(newValue, oldValue);
                    });
                }
            }

            render(h(A, {a: 'a'}), container);
            expect(callback).to.have.calledWith('a', undefined);

            let component: A | null;
            render(h(A, {a: 'b', ref: i => component = i}), container);
            expect(callback).to.have.calledWith('b', 'a');

            component!.set('a', 'c');
            expect(callback).to.have.calledWith('c', 'b');
        });

        it('lifecycle', () => {
            const inited = sinon.spy(() => console.log('inited'));
            const beforeMount = sinon.spy(() => console.log('beforeMount'));
            const mounted = sinon.spy(() => console.log('mounted'));
            const beforeUpdate = sinon.spy(() => console.log('beforeUpdate'));
            const updated = sinon.spy(() => console.log('udpated'));
            const beforeUnmount = sinon.spy(() => console.log('beforeUnmount'));
            const unmounted = sinon.spy(() => console.log('unmounted'));

             class A extends Component<{a: string}> {
                static template = function(this: A) {
                    return h('div', null, this.get('a'));
                }

                init() {
                    onInited(() => {
                        inited();
                        expect(this.$inited).to.be.true;
                    });

                    onBeforeMount(() => {
                        beforeMount();
                        expect(this.$mounted).to.be.false;
                    });

                    onMounted(() => {
                        mounted();
                        expect(this.$mounted).to.be.true;
                    });

                    onBeforeUpdate(() => {
                        beforeUpdate();
                        expect(container.innerHTML).to.equal('<div>a</div>');
                    });

                    onUpdated(() => {
                        updated();
                        expect(container.innerHTML).to.equal('<div>b</div>');
                    });

                    onBeforeUnmount(() => {
                        beforeUnmount();
                        expect(this.$unmounted).to.be.false;
                    });

                    onUnmounted(() => {
                        unmounted();
                        expect(this.$unmounted).to.be.true;
                    });
                }
            }

            render(h(A, {a: 'a'}), container);
            expect(inited).to.have.callCount(1);
            expect(beforeMount).to.have.callCount(1);
            expect(mounted).to.have.callCount(1);

            render(h(A, {a: 'b'}), container);
            expect(beforeUpdate).to.have.callCount(1);
            expect(updated).to.have.callCount(1);

            render(null, container);
            expect(beforeUnmount).to.have.callCount(1);
            expect(unmounted).to.have.callCount(1);
        });
    });
});
