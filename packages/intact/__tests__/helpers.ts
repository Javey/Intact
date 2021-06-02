import {Component} from '../src/core/component';
import {createVNode as h, render} from 'misstime';

describe('Component', () => {
    describe('Validate Props', () => {
        class A extends Component<any> {
            static template() {
                return h('div');
            }

            static typeDefs = {
                a: Boolean,
                b: {
                    type: Number,
                    required: true,
                },
                c: String,
                d: Array,
                e: Object,
                f: Date,
                g: Function,
                h: {
                    validator: (value: any) => value === 1,
                },
                i: A,
                j: [Array, Number],
                // k: Symbol,
                l: ['default', 'primary', 'danger', 1],
                m: {
                    required(props: any) {
                        return props.required
                    }
                }
            }
        }

        const container = document.createElement('div');
        const error = console.error;
        let spy: Function;
        beforeEach(() => {
            console.error = function(msg: string) {
                error.call(console, msg);
                spy(msg);
            }
        });

        afterEach(() => {
            console.error = error;
        });

        it('should warn when pass invalid props', () => {
            function test(props: any, msg?: string) {
                spy = sinon.spy();
                render(h(A, props), container);
                if (msg) {
                    expect(spy).to.have.calledOnceWith(msg);
                } else {
                    expect(spy).to.have.callCount(0);
                }
            }

            test({a: 1}, 'Invalid type of prop "a" on component "A". Expected Boolean, but got Number.');
            test({a: true}, 'Missing required prop on component "A": "b".');
            test({b: true}, 'Invalid type of prop "b" on component "A". Expected Number, but got Boolean.');
            test({b: NaN}, 'Invalid type of prop "b" on component "A". Expected Number, but got NaN.');
            test({b: 1, c: 1}, 'Invalid type of prop "c" on component "A". Expected String, but got Number.');
            test({b: 1, d: 1}, 'Invalid type of prop "d" on component "A". Expected Array, but got Number.');
            test({b: 1, e: []}, 'Invalid type of prop "e" on component "A". Expected Object, but got Array.');
            test({b: 1, f: 2}, 'Invalid type of prop "f" on component "A". Expected Date, but got Number.');
            test({b: 1, g: {}}, 'Invalid type of prop "g" on component "A". Expected Function, but got Object.');
            test({b: 1, h: 2}, 'Invalid prop "h" on component "A": custom validator check failed.');
            test({b: 1, i: () => {}}, 'Invalid type of prop "i" on component "A". Expected A, but got Function.');
            test({b: 1, j: 'a'}, 'Invalid type of prop "j" on component "A". Expected Array, Number, but got String.');
            // test({b: 1, k: 'a'}, 'Invalid type of prop "k" on component "A". Expected Symbol, but got String.');
            test({b: 1, l: 'test'}, 'Invalid type of prop "l" on component "A". Expected "default", "primary", "danger", 1, but got "test".');
            test({b: 1, l: 2}, 'Invalid type of prop "l" on component "A". Expected "default", "primary", "danger", 1, but got 2.');

            test({b: 1});
            test({b: 1, a: true});
            test({b: 1, c: '1'});
            test({b: 1, d: []});
            test({b: 1, e: {}});
            test({b: 1, f: new Date()});
            test({b: 1, g: () => {}});
            test({b: 1, h: 1});
            test({b: 1, i: new A()});
            test({b: 1, j: 1});
            test({b: 1, j: []});
            // test({b: 1, k: Symbol()});
            test({b: 1, l: 'primary'});
            test({b: 1, l: 1});
            test({b: 1, required: true}, 'Missing required prop on component "A": "m".');
        });

        it('should warn when pass invalid props on functional component', () => {
            const Test = (props: any) => h('div');
            Test.typeDefs = {
                a: Boolean,
                b: {
                    type: Number,
                    required: true,
                },
            };

            function test(props: any, msg?: string) {
                spy = sinon.spy();
                render(h(Test, props), container);
                if (msg) {
                    expect(spy).to.have.calledOnceWith(msg);
                } else {
                    expect(spy).to.have.callCount(0);
                }
            }

            test({a: 1}, 'Invalid type of prop "a" on component "Test". Expected Boolean, but got Number.');
            test({a: true}, 'Missing required prop on component "Test": "b".');
            test({b: 1});
        });
    });
});
