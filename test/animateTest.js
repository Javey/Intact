import Intact from '../src';
import assert from 'assert';
import _ from 'lodash';
import css from './css/animate.css';
import Index from './components/index';
import Detail from './components/detail';
import App from './components/app';

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

    it('animate cross component', (done) => {
        const app = Intact.mount(App, document.body);
        app.load(Index);
        app.load(Detail);
        setTimeout(() => {
            const children = app.element.firstChild.children;
            sEql(children.length, 2);
            sEql(children[0].innerHTML.indexOf('detail-header') > -1, true);
            sEql(children[0].className, '');
            sEql(children[1].innerHTML.indexOf('detail-body') > -1, true);
            sEql(children[1].className, '');
            done();
        }, 500);
    });

    it('should destroy component when leaving', (done) => {
        const app = Intact.mount(App, document.body);
        const C = Intact.extend({
            template: '<span>c</span>',
            _destroy() {
                console.log('aaa')
            }
        });
        app.load(Index, {Component: new C()});
        // app.load(Detail);
        done();
    });
});
