import Intact from '../src';
import assert from 'assert';
import css from './css/animate.css';
import Index from './components/index';
import Detail from './components/detail';
import App from './components/app';
import Animate from '../src/animate';
import {browser} from 'misstime/src/utils';
import "regenerator-runtime/runtime";

const sEql = assert.strictEqual;
const dEql = assert.deepStrictEqual;

describe('Animate Test', function() {
    // don't test animation in IE
    if (browser.isIE) return;

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
            _create() {
                this.update();
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
            }, 1200);
        }, 1000);
    });

    it('Animate nested', function(done) {
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
        }, 200);
        setTimeout(() => {
            view.set('show', true);
            setTimeout(() => {
                sEql(app.element.firstChild.firstChild.className, "animate-enter-active");
            }, 200);
            sEql(destroy.callCount, 0);
        }, 300);
        setTimeout(() => {
            app.load(D);
            setTimeout(() => {
                sEql(app.element.firstChild.className, "animate-leave-active animate-leave");
                sEql(app.element.children[1].className, "animate-enter-active");
                sEql(destroy.callCount, 0);
            }, 200);
            setTimeout(() => {
                sEql(destroy.callCount, 1);
                done();
            }, 1200);
        }, 700);
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
        }, 1500);
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
        }, 1500);
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
        }, 3000); // this will be long time in firefox
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

    it('should not animate when a:disabled is equal to true', function(done) {
        const fn = sinon.spy();
        const D = Intact.extend({
            template: `<div>test</div>`,
            _destroy: fn
        });
        const C = Intact.extend({
            template: `
                <div>
                    <Animate v-if={self.get('show')}
                        a:disabled={true}
                    ><D /></Animate>
                </div>
            `,
            _init() { this.D = D; }
        });

        const c = app.load(C);
        c.set('show', true);
        setTimeout(() => {
            sEql(app.element.innerHTML, '<div><div><div>test</div></div></div>');
            c.set('show', false);
            sEql(app.element.innerHTML, '<div></div>');
            sEql(fn.callCount, 1);
            done();
        });
    });

    it('should destroy animate which is disabled and returned by component directly', (done) => {
        const fn = sinon.spy();
        const D = Intact.extend({
            template: `<div>test</div>`,
            _destroy: fn
        });
        const E = Intact.extend({
            template: `<Animate a:disabled={true}><D /></Animate>`,
            _init() { this.D = D; }
        });
        const C = Intact.extend({
            template: `<div><E v-if={self.get('show')} /></div>`,
            _init() { this.E = E; }
        });
        const F = Intact.extend({
            template: `<div><div v-if={!self.get('hide')}><E /></div></div>`,
            _init() { this.E = E; }
        });

        const c = app.load(C);
        c.set('show', true);
        c.set('show', false);
        sEql(fn.callCount, 1);

        const f = app.load(F);
        f.set('hide', true);
        sEql(fn.callCount, 2);
        done();
    });

    it('should not use css transition when a:css is equal to false', function(done) {
        const C = Intact.extend({
            template: `
                <div>
                    <Animate v-if={self.get('show')}
                        a:css={false}
                    >test</Animate>
                </div>
            `
        });
        const c = app.load(C);
        c.set('show', true);
        setTimeout(() => {
            sEql(app.element.innerHTML, '<div><div>test</div></div>');
            c.set('show', false);
            sEql(app.element.innerHTML, '<div></div>');
            done();
        });
    });

    it('should use js animation when a:css is equal to false but has callbacks', function(done) {
        this.enableTimeouts(false);
        const C = Intact.extend({
            template: `
                <div>
                    <Animate v-if={self.get('show')}
                        a:css={false}
                        ev-a:enter={self.enter.bind(self)}
                        ev-a:leave={self.leave.bind(self)}
                    >test</Animate>
                </div>
            `,
            enter(el, _done) {
                sEql(el.outerHTML, '<div>test</div>');
                _done();
            },
            leave(el, _done) {
                sEql(el.outerHTML, '<div>test</div>');
                setTimeout(() => {
                    _done();
                    sEql(app.element.innerHTML, '<div></div>');
                    done();
                }, 1000);
            }
        });
        const c = app.load(C);
        c.set('show', true);
        sEql(app.element.innerHTML, '<div><div>test</div></div>');
        c.set('show', false);
        setTimeout(() => {
            sEql(app.element.innerHTML, '<div><div>test</div></div>');
        });
    });

    it('hydrate Animate', () => {
        const div = document.createElement('div');
        document.body.appendChild(div);
        const C = Intact.extend({
            template: `<Animate>test</Animate>`
        });
        const c = new C();
        div.innerHTML = c.toString();
        const newC = Intact.hydrate(C, div);
        newC.update();
        sEql(div.innerHTML, `<div>test</div>`);
        document.body.removeChild(div);
    });

    it('Animate leaveEnd event', (done) => {
        const leaveEnd = sinon.spy();
        const C = Intact.extend({
            defaults() { return {show: true} },
            template: `
                <div>
                    <Animate v-if={self.get('show')}
                        ev-a:leaveEnd={self.leaveEnd.bind(self)}
                    >test</Animate>
                </div>
            `,
            leaveEnd: leaveEnd 
        });
        const c = app.load(C);
        c.set('show', false);
        setTimeout(() => {
            sEql(leaveEnd.callCount, 1);
            done();
        }, 1200);
    });

    it('should not end when event bubbles', (done) => {
        const leaveEnd = sinon.spy();
        const C = Intact.extend({
            defaults() { return {show: true, hover: false} },
            template: `
                <div>
                    <Animate v-if={self.get('show')}
                        ev-a:leaveEnd={self.leaveEnd.bind(self)}
                    >
                        <div class={{"test-button": true, "hover": self.get('hover')}}>
                            test
                        </div>
                    </Animate>
                </div>
            `,
            leaveEnd: leaveEnd 
        });
        const c = app.load(C);
        setTimeout(() => {
            c.set('hover', true);
            c.set('show', false);
        });
        setTimeout(() => {
            sEql(app.element.firstChild.children.length, 1);
            sEql(leaveEnd.callCount, 0);
        }, 500);
        setTimeout(() => {
            sEql(app.element.firstChild.children.length, 0);
            sEql(leaveEnd.callCount, 1);
            done();
        }, 1200);
    });

    it('should not destroy until animate end when replace', (done) => {
        this.enableTimeouts(false);
        const _destroy = sinon.spy();
        const C = Intact.extend({
            template: '<span>c</span>',
            _destroy: _destroy
        });
        const D = Intact.extend({
            template: `var C = self.C;
                <div>
                    <Animate v-if={self.get('show')}><C /></Animate>
                    <span v-else></span>
                </div>`,
            defaults() {
                this.C = C;
                return {
                    show: true
                }
            }
        });

        const d = Intact.mount(D, document.body);
        d.set('show', false);
        sEql(_destroy.callCount, 0);
        setTimeout(() => {
            sEql(d.element.innerHTML, '<span></span>');
            sEql(_destroy.callCount, 1);
            done();
        }, 1200);
    });

    it('should execute enter animation when a rendering component has update', function(done) {
        this.enableTimeouts(false);
        const C = Intact.extend({
            template: `<div>
                <Animate v-if={self.get('show')}>test</Animate>
            </div>`,
            _init() {
                this.on('$changed:show', (c, show) => {
                    if (show) {
                        this.update();
                    }
                });
            }
        });
        const D = Intact.extend({
            template: `<C show={self.get('show')} />`,
            _init() {
                this.C = C;
            }
        });
        const c = Intact.mount(C, document.body);
        const d = Intact.mount(D, document.body);

        c.set('show', true);
        d.set('show', true);
        setTimeout(() => {
            const el = c.element.firstChild;
            sEql(el.className, 'animate-enter-active');
            const _el = d.element.firstChild;
            sEql(el.className, 'animate-enter-active');

            document.body.removeChild(c.element);
            document.body.removeChild(d.element);

            done();
        }, 100);
    });

    it('should handle element which has className correctly ', (done) => {
        const C = Intact.extend({
            template: `<div><Animate v-if={self.get('show')} class={{"test": true, "a": self.get('a')}}>test</Animate></div>`
        });
        const c = Intact.mount(C, document.body);
        c.set('show', true);
        c.set('a', true);

        setTimeout(() => {
            sEql(c.element.firstChild.className, 'test a');
            document.body.removeChild(c.element);
            done();
        }, 1500);
    });

    it('show/hide animation', async function() {
        this.enableTimeouts(false);

        const C = Intact.extend({
            template: `<Animate a:show={self.get('show')}>test</Animate>`
        });
        const c = Intact.mount(C, document.body);
        const element = c.element;
        window.c = c;

        const testAttribute = (className, style) => {
            sEql(element.getAttribute('style'), style);
            sEql(element.getAttribute('class'), className);
         
        };
        const test = (fn, className, style) => {
            return new Promise(resolve => {
                const p = fn();
                const doTest = () => {
                    setTimeout(() => {
                        testAttribute(className, style);
                        resolve();
                    }, 1500);
                };
                if (p instanceof Promise) {
                    p.then(doTest);
                } else {
                    doTest();
                }
            });
        };

        await test(() => c.set('show', true),  '', '');
        await test(() => {c.set('show', false)}, '', 'display: none;');
        await test(() => {
            c.set('show', true);
            c.set('show', false);
            // it should not animate
            return new Promise(resolve => {
                setTimeout(() => {
                    testAttribute('', 'display: none;');
                    resolve();
                }, 100);
            });
        }, '', 'display: none;');
        await test(() => {
            c.set('show', true);
            return new Promise(resolve => {
                setTimeout(() => {
                    c.set('show', false);
                    setTimeout(() => {
                        testAttribute('animate-leave-active animate-leave', '');
                        resolve();
                    }, 100);
                }, 500);
            });
        }, '', 'display: none;');
        await test(() => c.set('show', true), '', '');
        await test(() => {
            c.set('show', false);
            c.set('show', true);
            return new Promise(resolve => {
                setTimeout(() => {
                    testAttribute('', '');
                    resolve();
                }, 100);
            });
        }, '', '');
        await test(() => {c.set('show', false)}, '', 'display: none;');
        await test(() => {c.set('show', true)}, '', '');
        await test(() => {
            c.set('show', false);
            return new Promise(resolve => {
                setTimeout(() => {
                    c.set('show', true);
                    setTimeout(() => {
                        testAttribute('animate-enter-active', '');
                        resolve();
                    }, 200)
                }, 500);
            });
        }, '', '');
    });
});
