import {Component} from '../src/core/component';
import {render, createVNode as h, createTextVNode, TransitionElement, createRef} from 'misstime';
import {Transition} from '../src/components/transition';
import {wait, nextFrame, testTransition, nextTick} from '../../misstime/__tests__/utils';
import './transition.css';

describe('Component', function() {
    this.timeout(0);

    let container: Element;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    describe('Transition', () => {
        it('should show error if it has multiple children', () => {
            const error = console.error;
            console.error = sinon.spy();
            render(h(Transition, {appear: true}, [
                h('div', null, 'show'),
                h('div', null, 'show'),
            ]), container);
            expect(console.error).to.have.been.calledOnceWith('<Transition> can only be used on a single element or component. Use <TransitionGroup> for lists.');
            console.error = error;
        });

        it('shoud throw error if it has a invalid element child', () => {
            expect(() => render(h(Transition, null, 'show'), container)).to.throw();
            expect(() => render(h(Transition, null, true), container)).to.throw();
            expect(() => render(h(Transition, null, createTextVNode('show')), container)).to.throw();
        });

        it('should appear with transition', async () => {
            const ref = createRef<HTMLDivElement>();
            render(h(Transition, {appear: true}, h('div', {ref}, 'show')), container);

            await testTransition(ref.value!, 'enter');
        });

        it('should handle children that contains a single vNode', async () => {
            render(h(Transition, {appear: true}, [h('div', null, 'show')]), container);

            await testTransition(container.firstElementChild!, 'enter');
        });

        it('should keep className', async () => {
            let test: Test;
            class Test extends Component<{show: boolean}> {
                static template(this: Test) {
                    test = this;
                    return h('div', {className: this.$props.show ? 'show' : 'hidden'}, 'show');
                }
            }
            render(h(Transition, {appear: true}, h(Test)), container);
            test!.set('show', true);
            
            await wait(0);
            expect(container.firstElementChild!.className).to.equal('show transition-enter-from transition-enter-active');
        });

        it('shoud enter with transition', async () => {
            render(h(Transition), container);
            render(h(Transition, null, h('div', null, 'show')), container);

            await testTransition(container.firstElementChild!, 'enter');
        });

        it('should leave with transition', async () => {
            render(h(Transition, null, h('div', null, 'show')), container);
            render(h(Transition), container);

            const dom = container.firstElementChild!;

            await testTransition(dom, 'leave');
            expect(dom.parentNode).to.be.null;
        });

        it('should toggle same element (v-if)', async () => {
            render(h(Transition, null, h('div', null, 'show')), container);
            const dom1 = container.firstElementChild!;
            render(h(Transition), container);
            render(h(Transition, null, h('div', null, 'show')), container);
            const dom2 = container.firstElementChild!;

            expect((dom1 as TransitionElement)._leaveCb).to.be.undefined;
            expect(dom1.parentNode).to.be.null;
            expect(dom2.className).to.equal('transition-enter-from transition-enter-active');
        });

        it('should toggle different element (v-if)', async () => {
            render(h(Transition, null, h('div', null, 'show')), container);
            const dom1 = container.firstElementChild!;
            render(h(Transition, null, h('p', null, 'show')), container);
            const dom2 = container.firstElementChild!.nextElementSibling!;

            expect(dom1.className).to.equal('transition-leave-from transition-leave-active');
            expect(dom2.className).to.equal('transition-enter-from transition-enter-active');
            expect(dom1.parentNode).to.equal(dom2.parentNode);

            await nextFrame();
            expect(dom1.className).to.equal('transition-leave-active transition-leave-to');
            expect(dom2.className).to.equal('transition-enter-active transition-enter-to');

            await wait(2100);
            expect(dom1.className).to.equal('');
            expect(dom2.className).to.equal('');
            expect(dom1.parentNode).to.be.null;
        });

        it('should remove Transtion directly without animation', async () => {
            render(h(Transition, {appear: true}, h('div', null, 'show')), container);
            const dom = container.firstElementChild!;
            render(null, container);

            expect(dom.parentNode).to.be.null;
        });

        describe('Show', () => {
            it('should handle show transition', async () => {
                render(h(Transition, {show: false}, h('div', null, 'show')), container);
                const dom = container.firstElementChild as HTMLDivElement;
                expect(dom.style.display).to.equal('none');

                render(h(Transition, {show: true}, h('div', null, 'show')), container);

                await testTransition(dom, 'enter');
                expect((dom as HTMLElement).style.display).to.equal('');
            });

            it('should handle hide transition', async () => {
                render(h(Transition, null, h('div', null, 'show')), container);
                render(h(Transition, {show: false}, h('div', null, 'show')), container);

                const dom = container.firstElementChild!;

                await testTransition(dom, 'leave');
                expect((dom as HTMLElement).style.display).to.equal('none');
            });

            it('should keep style', async () => {
                let test: Test;
                class Test extends Component<{style?: string}> {
                    static template(this: Test) {
                        test = this;
                        return h('div', {style: this.$props.style}, 'show');
                    }
                }
                render(h(Transition, {show: false}, h(Test)), container);
                test!.set('style', 'font-size: 12px;');
                
                await wait(0);
                expect((container.firstElementChild! as HTMLDivElement).style.cssText).to.equal('font-size: 12px; display: none;');

                render(h('div', null, 'show'), container);
                expect(container.innerHTML).to.equal('<div>show</div>');
            });

            it('should show a leaving element', async () => {
                render(h(Transition, null, h('div', null, 'show')), container);
                render(h(Transition, {show: false}, h('div', null, 'show')), container);
                render(h(Transition, {show: true}, h('div', null, 'show')), container);

                const dom = container.firstElementChild!;

                await testTransition(dom, 'enter');
                expect((dom as HTMLElement).style.display).to.equal('');
            });

            it('should change transition name if name has changed on mounted', async () => {
                type Props = {name?: string, show?: boolean};
                class Test extends Component<Props> {
                    static template(this: Test) {
                        return h(Transition, {name: this.$props.name, show: this.$props.show}, h('div', null, 'show'));
                    }

                    static defaults = () => ({name: 'a', show: false});

                    mounted() {
                        this.set('name', 'b');
                    }
                } 

                let test: Test | null = null;
                render(h(Test, {ref: i => test = i}), container);
                test!.set('show', true);
                const div = container.firstElementChild!;

                await nextTick();
                expect(div.className).to.equal('b-enter-from b-enter-active');
                
                await nextFrame();
                expect(div.className).to.equal('b-enter-active b-enter-to');
            });

            it('should show when we mount the element at the same time', async () => {
                render(h(Transition, {show: false}), container);
                render(h(Transition, {show: true}, h('div', null, 'show')), container);
                const dom = container.firstElementChild!;

                await testTransition(dom, 'enter');
                expect((dom as HTMLElement).style.display).to.equal('');
            });

            it('show or hide changed element', async () => {
                render(h(Transition, {show: false}), container);
                render(h(Transition, {show: false}, h('div', null, 'show')), container);
                const dom = container.firstElementChild!;

                expect((dom as HTMLElement).style.display).to.equal('none');
            });
        });
    });
});
