import Intact from '../src';
import assert from 'assert';
import _ from 'lodash';
import css from './css/animate.css';
import Index from './components/index';
import Detail from './components/detail';
import App from './components/app';
import Animate from '../src/animate';

const sEql = assert.strictEqual;
const dEql = assert.deepStrictEqual;

describe('Animate Test', function() {
    var A = Intact.extend({
        defaults: {
            show: true 
        },

        template: Intact.Vdt.compile(`
            <Animate><Animate v-if={self.get('show')}>animate</Animate></Animate>
        `, {noWith: true}),

        _mount: function() {
            this.set('show', false);
        }
    });

    let app;
    beforeEach(() => {
        app = Intact.mount(App, document.body);
    });

    afterEach(() => {
        document.body.removeChild(app.element);
    });

    it('Animate appear and leave', function(done) {
        this.enableTimeouts(false);
        const destroyC = sinon.spy(function() {
            this._superApply(arguments);
        });
        const C = Intact.extend({
            template: '<Animate a:tag="span" a:appear="1"><D /></Animate>',
            _init() {
                this.Animate = Animate;
                this.D = D;
            },
            destroy: destroyC
        });
        const destroyD = sinon.spy(function() {
            this._superApply(arguments);
        });
        const D = Intact.extend({
            template: '<a>test</a>',
            destroy: destroyD
        });

        app.load(C);
        setTimeout(() => {
            sEql(app.element.firstChild.className, 'animate-appear-active');
        }, 100);
        setTimeout(() => {
            app.set('view', undefined);
            setTimeout(() => {
                sEql(app.element.firstChild.className, 'animate-leave-active animate-leave');
            }, 100);
            sEql(destroyC.callCount, 1);
            sEql(destroyD.callCount, 0);
        }, 400);
        setTimeout(() => {
            app.load(C);
            setTimeout(() => {
                sEql(app.element.firstChild.className, 'animate-appear-active');
            }, 100);
            sEql(destroyC.callCount, 1);
            sEql(destroyD.callCount, 0);
        }, 700);
        setTimeout(() => {
            app.set('view', undefined);
            setTimeout(() => {
                sEql(app.element.firstChild.className, 'animate-leave-active animate-leave');
            }, 100);
            setTimeout(() => {
                sEql(app.element.innerHTML, '');
                done();
            }, 1000);
        }, 1000);
    });

    it('Animate nested', function(done) {
        this.enableTimeouts(false);
        this.enableTimeouts(false);
        const C = Intact.extend({
            template: '<Animate a:tag="span" key="c"><Animate a:tag="b" v-if={self.get("show")}><E /></Animate></Animate>',
            _init() {
                this.Animate = Animate;
                this.E = E;
            }
        });
        const D = Intact.extend({
            template: '<Animate a:tag="span" key="d">aaa</Animate>',
            _init() {
                this.Animate = Animate;
            }
        });
        const destroy = sinon.spy(function() {
            this._superApply(arguments);
        });
        const E = Intact.extend({
            template: '<i>test</i>',
            destroy: destroy
        });
        const view = app.load(C, {show: true});
        view.set('show', false);
        setTimeout(() => {
            sEql(app.element.firstChild.firstChild.className, "animate-leave-active animate-leave");
            sEql(destroy.callCount, 0);
        }, 100);
        setTimeout(() => {
            view.set('show', true);
            setTimeout(() => {
                sEql(app.element.firstChild.firstChild.className, "animate-enter-active");
            }, 100);
            sEql(destroy.callCount, 0);
        }, 300);
        setTimeout(() => {
            app.load(D);
            setTimeout(() => {
                sEql(app.element.firstChild.className, "animate-leave-active animate-leave");
                sEql(app.element.children[1].className, "animate-enter-active");
                sEql(destroy.callCount, 0);
            }, 100);
            setTimeout(() => {
                sEql(destroy.callCount, 1);
                done();
            }, 1100);
        }, 500);
    });

    it('Animate mode', function(done) {
        this.enableTimeouts(false);
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
        setTimeout(() => {
            done();
        }, 1200);
    });

    it('Animate move', function(done) {
        this.enableTimeouts(false);
        const C = Intact.extend({
            template: `<Animate a:tag="ul">
                <Animate a:tag="li" key="1">1</Animate> 
                <Animate a:tag="li" key="2">2</Animate> 
            </Animate>`
        });
        const D = Intact.extend({
            template: `<Animate a:tag="ul">
                <Animate a:tag="li" key="1">1</Animate> 
                <Animate a:tag="li" key="3">3</Animate> 
                <Animate a:tag="li" key="2">2</Animate> 
            </Animate>`
        });
        app.load(C);
        app.load(D);
        const children = app.element.firstChild.children;
        setTimeout(() => {
            sEql(children[0].className, '');
            sEql(children[1].className, 'animate-enter-active');
            sEql(children[2].className, 'animate-move');
        }, 100);
        setTimeout(() => {
            sEql(children[0].className, '');
            sEql(children[1].className, '');
            sEql(children[2].className, '');
            done();
        }, 1200);
    });

    it('Animate component render correctly', function() {
        var a = new A();
        a.init();
        sEql(a.element.outerHTML, '<div><div>animate</div></div>');
    });

    it('remove element when animation has completed', function(done) {
        this.enableTimeouts(false);
        setTimeout(function() {
            sEql(app.element.outerHTML, '<div></div>');
            done();
        }, 1100);
    });

    it('animate cross components', function(done) {
        this.enableTimeouts(false);
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
        }, 1100);
    });

    it('should destroy component when leaving', function(done) {
        this.enableTimeouts(false);
        const _destroy = sinon.spy();
        const C = Intact.extend({
            template: '<span>c</span>',
            _destroy: _destroy
        });
        app.load(Index, {Component: new C()});
        app.load(Detail);
        app.load(Index, {Component: new C()});
        sEql(_destroy.callCount, 1);
        setTimeout(() => {
            const children = app.element.firstChild.children;
            sEql(children.length, 2);
            sEql(children[0].className, '');
            sEql(children[1].className, '');
            done();
        }, 1100);
    });

    it('patch between Animate and non-Animate components', function(done) {
        this.enableTimeouts(false);
        const C = Intact.extend({
            template: `
                <Animate>
                    <div key="c-header">c header</div>
                    <Animate key="c-body">c body</Animate>
                </Animate>
            `,
            destroy() {}
        });
        const D = Intact.extend({
            template: `
                <Animate>
                    <div key="d-header">d header</div>
                    <Animate key="d-body">d body</Animate>
                </Animate>
            `,
            destroy() {}
        });
        app.load(C);
        app.load(D);
        setTimeout(() => {
            const children = app.element.firstChild.children;
            sEql(children.length, 3);
            sEql(children[0].className, 'animate-leave-active animate-leave');
            sEql(children[2].className, 'animate-enter-active');
        }, 100);
        setTimeout(() => {
            const children = app.element.firstChild.children;
            sEql(children.length, 2);
            sEql(children[0].className, '');
            sEql(children[1].className, '');
            done();
        }, 1200);
    });
});
