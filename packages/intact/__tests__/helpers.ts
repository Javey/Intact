import {set, get} from '../../src/utils/helpers';
import {Component} from '../../src/core/component';
import {createVNode as h} from '../../src/core/vnode';
import {render} from '../../src/core/render';

describe('Component', () => {
    describe('Helpers', () => {
        it('should set by key', () => {
            const props = {a: 1};
            const changeTraces = set(props, 'a', 2);

            expect(props).to.eql({a: 2});
            expect(changeTraces).to.eql([{path: 'a', newValue: 2, oldValue: 1}]);
        });

        it('should set by path', () => {
            const props = {a: {b: 1}};
            const changeTraces = set(props, 'a.b', 2);

            expect(props).to.eql({a: {b: 2}});
            expect(changeTraces).to.eql([
                {path: 'a', newValue: {b: 2}, oldValue: {b: 1}},
                {path: 'a.b', newValue: 2, oldValue: 1},
            ]);
        });

        it('should set by path that does not exist', () => {
            const props = {a: {b: 1}};
            const changeTraces = set(props, 'a.c.d', 2);

            expect(props).to.eql({a: {b: 1, c: {d: 2}}} as any);
            expect(changeTraces).to.eql([
                {path: 'a', newValue: {b: 1, c: {d: 2}}, oldValue: {b: 1}},
                {path: 'a.c', newValue: {d: 2}, oldValue: undefined},
                {path: 'a.c.d', newValue: 2, oldValue: undefined},
            ]);
        });
    });

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
        beforeEach(() => {
            console.error = function(msg: string) {
                error.call(console, msg);
                throw new Error(msg); 
            }
        });

        afterEach(() => {
            console.error = error;
        });

        it('should warn when pass invalid props', () => {
            function test(props: any, msg?: string) {
                if (msg) {
                    expect(() => render(h(A, props), container)).to.throw(new RegExp(msg));
                } else {
                    expect(() => render(h(A, props), container)).to.not.throw();
                }
            }

            test({a: 1}, 'Invalid type of prop "a" on component "A". Expected Boolean, but got Number.');
            test({a: true}, 'Missing required prop on component "A": "b".');
            test({b: true}, 'Invalid type of prop "b" on component "A". Expected Number, but got Boolean.');
            test({b: NaN}, 'Invalid type of prop "b" on component "A". Expected Number, but got NaN.');
            test({b: 1, c: 1}, 'Invalid type of prop "c" on component "A". Expected String, but got Number.');
            test({b: 1, d: 1}, 'Invalid type of prop "d" on component "A". Expected Array, but got Number.');
            test({b: 1, e: []}, 'Invalid type of prop "e" on component "A". Expected Object, but got Array.');
            test({b: 1, f: 2}, 'Invalid type of prop "f" on component "A". Expected Date, but got Number');
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
            test({b: 1, i: new A({b: 1}, [])});
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
                if (msg) {
                    expect(() => render(h(Test, props), container)).to.throw(new RegExp(msg));
                } else {
                    expect(() => render(h(Test, props), container)).to.not.throw();
                }
            }

            test({a: 1}, 'Invalid type of prop "a" on component "Test". Expected Boolean, but got Number.');
            test({a: true}, 'Missing required prop on component "Test": "b".');
            test({b: 1});
        });
    });
});
