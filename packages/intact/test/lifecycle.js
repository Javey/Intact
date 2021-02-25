import Intact from '../src';
import assert from 'assert';
import {patchProps} from '../src/instance/lifecycle';
import {isArray} from '../src/utils';

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
});
