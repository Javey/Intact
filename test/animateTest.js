import Intact from '../src';
import assert from 'assert';
import _ from 'lodash';
import css from './css/animate.css';
import Index from './components/index';
import Detail from './components/detail';
import App from './components/app';
import Animate from '../src/A';

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

    it('Animate appear and leave', function(done) {
        this.enableTimeouts(false);
        const app = Intact.mount(App, document.body);
        const C = Intact.extend({
            template: '<Animate a:tag="span" a:appear="1"><a>test</a></Animate>',
            _init() {
                this.Animate = Animate;
            }
        });
        app.load(C);
        setTimeout(() => {
            sEql(app.element.firstChild.className, 'animate-appear animate-appear-active');
        }, 50);
        setTimeout(() => {
            app.set('view', undefined);
            setTimeout(() => {
                sEql(app.element.firstChild.className, 'animate-leave animate-leave-active');
            }, 50);
        }, 5000);
        setTimeout(() => {
            app.load(C);
            setTimeout(() => {
                sEql(app.element.firstChild.className, 'animate-appear animate-appear-active');
            }, 50);
        }, 6000);
        setTimeout(() => {
            app.set('view', undefined);
            setTimeout(() => {
                sEql(app.element.firstChild.className, 'animate-leave animate-leave-active');
            }, 50);
            setTimeout(() => {
                sEql(app.element.innerHTML, '');
                done();
            }, 10000);
        }, 10000);
    });

    it('Animate nested', function() {
        this.enableTimeouts(false);
        const app = Intact.mount(App, document.body);
        const C = Intact.extend({
            template: '<Animate a:tag="span" key="c"><Animate a:tag="b" v-if={self.get("show")}>test</Animate></Animate>',
            _init() {
                this.Animate = Animate;
            }
        });
        const D = Intact.extend({
            template: '<Animate a:tag="span" key="d">aaa</Animate>',
            _init() {
                this.Animate = Animate;
            }
        });
        const view = app.load(C, {show: true});
        view.set('show', false);
        setTimeout(() => {
            view.set('show', true);
        }, 3000)
        // setTimeout(() => {
            // sEql(app.element.firstChild.innerHTML, '<b class="animate-leave animate-leave-active">test</b>');
        // }, 100)
        setTimeout(() => {
            app.load(D);
            // setTimeout(() => {
                // sEql(app.element.innerHTML, '<span class="animate-leave animate-leave-active"><b class="animate-leave animate-leave-active">test</b></span><span class="animate-enter animate-enter-active">aaa</span>');
            // }, 100);
            setTimeout(() => {
                app.load(C, {show: true});
            }, 5000)
        }, 5000);
        // setTimeout(() => {
            // app.load(C, {show: true});
        // }, 2000)
        console.log(view.isRender, view.isNotAppendChild);

    });

    it('Animate mode', function(done) {
        this.enableTimeouts(false);
        const app = Intact.mount(App, document.body);
        const C = Intact.extend({
            template: `<Animate>
                <Animate key="c1">c1</Animate>
                <Animate key="c2">c2</Animate>
            </Animate>`
        });
        const D = Intact.extend({
            template: `<Animate>
                <Animate key="d2">d2</Animate>
                <Animate key="d2">d2</Animate>
            </Animate>`
        });
        app.load(C);
        app.load(D);
        done();
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

    it('animate cross components', (done) => {
        const app = Intact.mount(App, document.body);
        app.load(Index);
        app.load(Detail);
        setTimeout(() => {
            const children = app.element.firstChild.children;
            // sEql(children.length, 2);
            // sEql(children[0].innerHTML.indexOf('detail-header') > -1, true);
            // sEql(children[0].className, '');
            // sEql(children[1].innerHTML.indexOf('detail-body') > -1, true);
            // sEql(children[1].className, '');
            done();
        }, 500);
    });

    it('should destroy component when leaving', (done) => {
        const app = Intact.mount(App, document.body);
        const _destroy = sinon.spy();
        const C = Intact.extend({
            template: '<span>c</span>',
            _destroy: _destroy
        });
        app.load(Index, {Component: new C()});
        app.load(Detail);
        app.load(Index, {Component: new C()});
        sEql(_destroy.callCount, 1);
        done();
    });

    it('patch between Animate and non-Animate components', (done) => {
        const app = Intact.mount(App, document.body);
        const C = Intact.extend({
            template: `var Animate = self.Animate;
                <Animate>
                    <div key="c-header">c header</div>
                    <Animate key="c-body">c body</Animate>
                </Animate>
            `,
            destroy() {}
        });
        const D = Intact.extend({
            template: `var Animate = self.Animate;
                <Animate>
                    <div key="d-header">d header</div>
                    <div key="d-body">d body</div>
                </Animate>
            `,
            destroy() {}
        });
        app.load(C);
        app.load(D);
        done();
    });
});
