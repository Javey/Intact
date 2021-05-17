import {Component} from '../src/core/component';
import {render, createVNode as h, VNode} from 'misstime';
import {inject, provide} from '../src/core/inject';

describe('Component', () => {
    let container: Element;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    // afterEach(() => {
        // render(null, container);
        // document.body.removeChild(container);
    // });

    describe('Provide & Inject', () => {
        it('should inject', () => {
            class A extends Component {
                static template(this: A) {
                    return h('div', null, this.get('children'));
                }

                init() {
                    provide('number', 1);
                }
            }

            class B extends Component {
                static template = () => {
                    return h('div', null, 'b');
                }

                init() {
                    expect(inject('number')).to.equal(1);
                }
            }

            render(h(A, null,  h(B)), container);
            render(h(A, null, h('div', null, h(B))), container);
        });

        it('should extends parent provides', () => {
            class A extends Component {
                static template(this: A) {
                    return h('div', null, this.get('children'));
                }

                init() {
                    provide('number', 1);
                }
            }

            class B extends Component {
                static template(this: B) {
                    return h('div', null, this.get('children'));
                }

                init() {
                    provide('string', 'a');
                }
            }

            class C extends Component {
                static template = () => {
                    return h('div', null, 'b');
                }

                init() {
                    expect(inject('number')).to.equal(1);
                    expect(inject('string')).to.equal('a');
                }
            }

            render(h(A, null, h(B, null, h(C))), container);
        });

        it('should warn if not found', () => {
            const error = console.error;
            console.error = function(msg: string) {
                error.call(console, msg);
                throw new Error(msg); 
            }

            class A extends Component {
                static template = () => h('div');
                init() {
                    inject('a');
                }
            }

            expect(() => render(h(A), container)).to.throw('injection "a" not found.');
            console.error = error;
        });

        it('should use default value', () => {
            class A extends Component {
                static template = () => h('div');
                init() {
                    expect(inject('a', 1)).to.equal(1);
                }
            }

            render(h(A), container);
        });

        it('should throw if it is nout be used inside init()', () => {
            class A extends Component {
                static template = () => h('div');
                mounted() {
                    provide('a', 1); 
                }
            }

            class B extends Component {
                static template = () => h('div');
                mounted() {
                    inject('a'); 
                }
            }

            expect(() => render(h(A), container)).to.throw('Intact Error: provide() can only be used inside init()');
            expect(() => render(h(B), container)).to.throw('Intact Error: inject() can only be used inside init()');
        });
    });
});
