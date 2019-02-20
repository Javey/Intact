import Intact from '../src';
import assert from 'assert';
import {patchProps} from '../src/instance/lifecycle';
import {isArray} from '../src/utils';
import {eqlHtml} from './utils';

const sEql = assert.strictEqual;
const dEql = assert.deepStrictEqual;

describe('Lifecycle Test', function() {
    it('patchProps', () => {
        const A = Intact.extend({
            template: `<div></div>`
        });

        const fn1 = sinon.spy();
        const fn2 = sinon.spy();
        const fn3 = sinon.spy();
        const fn4 = sinon.spy();
        const fn5 = sinon.spy();

        const test = (lastEvents, nextEvents, assert) => {
            const a = new A(lastEvents === undefined ? undefined : {'ev-a': lastEvents});
            patchProps(
                a, 
                lastEvents === undefined ? undefined : {'ev-a': lastEvents}, 
                nextEvents === undefined ? undefined : {'ev-a': nextEvents}
            ); 

            dEql(a._events.a, assert || (isArray(nextEvents) ? nextEvents : [nextEvents]));

            return a;
        };

        test([fn1, fn2], [fn3, fn4]);
        test([fn1, fn2], [fn3, fn4, fn5]);
        test([fn1, fn2], [fn3]);
        test([fn1, fn2], [fn1, fn3]);
        test([fn1, fn2], []);
        test([fn1, fn2], fn3);
        test([fn1, fn2], fn1);
        test([fn1, fn2], null, []);
        test([fn1, fn2], undefined, []);

        test(fn1, [fn1]);
        test(fn1, [fn1, fn2]);
        test(fn1, [fn2, fn3]);
        test(fn1, fn2);
        test(fn1, null, []);
        test(fn1, undefined, []);

        test(null, [fn1]);
        test(null, fn1);

        test(undefined, [fn1]);
        test(undefined, fn1);
    });

    it('prop that value is undefined should be set to default value when update', () => {
        const receiveA = sinon.spy();
        const receiveB = sinon.spy();
        const Component = Intact.extend({
            template: `<div>{self.get('a')} {self.get('b')}</div>`,
            defaults() {
                return {a: 1, b: 2};
            },
            _init() {
                this.on('$receive:a', receiveA);
                this.on('$receive:b', receiveB);
            }
        });
        const C = Intact.extend({
            template: `<Component a={self.get('a')} b={self.get('b')} />`,
            _init() {
                this.Component = Component;
            }
        });
        const c = Intact.mount(C, document.body); 
        eqlHtml(c.element, '1 2');
        c.set({a: 2, b: undefined});
        eqlHtml(c.element, '2 2');
        c.set({a: undefined});
        eqlHtml(c.element, '1 2');
        sEql(receiveA.callCount, 2);
        sEql(receiveB.callCount, 0);
    });
});
