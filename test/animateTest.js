import Intact from '../src';
import assert from 'assert';
import _ from 'lodash';
import css from './animate.css';

const sEql = assert.strictEqual;
const dEql = assert.deepStrictEqual;

describe('Animate Test', function() {
    var A = Intact.extend({
        defaults: {
            show: true 
        },

        template: Intact.Vdt.compile(`var Animate = self.Animate;
            <Animate><Animate v-if={self.get('show')}>animate</Animate></Animate>
        `, {noWith: true}),

        _mount: function() {
            this.set('show', false);
        }
    });

    it('Animate component render correctly', function() {
        var a = new A();
        a.init();
        sEql(a.element.outerHTML, '<div><div>animate</div></div>');
    });

    it('remove element when animation has completed', function(done) {
        var a = Intact.mount(A, document.body);
        setTimeout(function() {
            sEql(a.element.outerHTML, '<div></div>');
            done();
        }, 500);
    });
});
