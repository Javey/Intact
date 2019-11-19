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

const wait = (time) => {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
};
const after = (fn, time) => {
    return new Promise(resolve => {
        setTimeout(() => {
            fn();
            resolve();
        }, time);
    });
};

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
    beforeEach(function() {
        this.enableTimeouts(false);
        app = Intact.mount(App, document.body);
    });

    // afterEach(() => {
        // document.body.removeChild(app.element);
    // });

    it('Animate appear and leave', async function() {
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
        await wait(100);
        sEql(app.element.firstChild.className, 'animate-appear-active');
        await wait(100);
        app.set('view', undefined);
        await wait(100);
        sEql(app.element.firstChild.className, 'animate-leave-active animate-leave');
        sEql(destroyC.callCount, 1);
        sEql(destroyD.callCount, 0);
        await wait(50);
        app.load(C);
        await wait(100);
        sEql(app.element.firstChild.className, 'animate-appear-active');
        sEql(destroyC.callCount, 1);
        sEql(destroyD.callCount, 0);
        await wait(200);
        app.set('view', undefined);
        await wait(100);
        sEql(app.element.firstChild.className, 'animate-leave-active animate-leave');
        await wait(1100);
        sEql(app.element.innerHTML, '');
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

    it('should not reuse dom if Animate key is undefined', function(done) {
        this.enableTimeouts(false);
        class Component1 extends Intact {
            @Intact.template()
            static template = `<Animate><div>test</div></Animate>`
        }
        class Component2 extends Intact {
            @Intact.template()
            static template = `<Animate><span>test</span></Animate>`
        }
        class A extends Intact {
            @Intact.template()
            static template = `<div><C key="a1" /><C key="a2" /></div>`;
            _init() {
                this.C = Component1;
            }
        }
        class B extends Intact {
            @Intact.template()
            static template = `<div><C key="b1" /><C key="b2" /></div>`;
            _init() {
                this.C = Component2;
            }
        }
        app.load(A);
        app.load(B);
        done();
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
            sEql(app.element.innerHTML, '<div><div class=""><div>test</div></div></div>');
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

    it('enter when a element is leaving', async function() {
        this.enableTimeouts(false);

        const C = Intact.extend({
            defaults() {
                return {show: true};
            },
            template: `<div><Animate v-if={self.get('show')} key="a">test</Animate><div>click</div></div>`,
        });
        const c = Intact.mount(C, document.body);
        const element = c.element;

        c.set('show', false);
        await after(() => {
            c.set('show', true);
        }, 500).then(() => {
            return after(() => {
                sEql(element.outerHTML, '<div><div class="">test</div><div>click</div></div>');
            }, 1200);
        });
    });

    describe('a:show', () => {
        let c;
       
        const testAttribute = (className, style) => {
            sEql(c.element.getAttribute('style'), style);
            sEql(c.element.getAttribute('class'), className);
         
        };
        const test = (fn, className, style) => {
            return new Promise(resolve => {
                const p = fn();
                const doTest = () => {
                    setTimeout(() => {
                        if (typeof className === 'function') {
                            className();
                        } else {
                            testAttribute(className, style);
                        }
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

        afterEach(() => {
            if (c) {
                c.destroy();
                document.body.removeChild(c.element);
            }
        });

        it('show/hide animation', async function() {
            this.enableTimeouts(false);

            const C = Intact.extend({
                template: `<Animate a:show={self.get('show')}>test</Animate>`,
            });
            c = Intact.mount(C, document.body);
            const element = c.element;

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

        it('enter element at leave end callback', function(done) {
            this.enableTimeouts(false);

            const C = Intact.extend({
                defaults() {
                    return {show: true};
                },
                template: `<Animate a:show={self.get('show')} ev-a:leaveEnd={self.leaveEnd}>test</Animate>`,
                leaveEnd() {
                    testAttribute('', null);
                    test(() => {
                        this.set('show', true);
                        return new Promise(resolve => {
                            setTimeout(() => {
                                testAttribute('animate-enter-active', null);
                                resolve();
                            }, 200)
                        });
                    }, '', null).then(done);
                }
            });
            c = Intact.mount(C, document.body);

            c.set('show', false);
        });

        it('leave element at enter end callback', function(done) {
            this.enableTimeouts(false);

            const C = Intact.extend({
                defaults() {
                    return {show: false};
                },
                template: `<Animate a:show={self.get('show')} ev-a:enterEnd={self.enterEnd}>test</Animate>`,
                enterEnd() {
                    testAttribute('', '');
                    test(() => {
                        this.set('show', false);
                        return new Promise(resolve => {
                            setTimeout(() => {
                                testAttribute('animate-leave-active animate-leave', '');
                                resolve();
                            }, 200)
                        });
                    }, '', 'display: none;').then(done);
                }
            });
            c = Intact.mount(C, document.body);

            c.set('show', true);
        });

        it('a:show and v-if at the same time', async function() {
            this.enableTimeouts(false);

            const C = Intact.extend({
                defaults() {
                    return {
                        show: false,
                        create: false,
                    };
                },
                template: `<Animate ref="a" v-if={self.get('create')} a:show={self.get('show')}>test</Animate>`,
            });
            c = Intact.mount(C, document.body);

            let element;
            const isEmpty = () => {
                // element has been removed
                sEql(element.parentNode, null);
                sEql(c.element.nodeValue, 'empty')
            };

            await test(() => c.set({show: true, create: true}), '', null);
            element = c.element;
            await test(() => c.set({show: false, create: false}), isEmpty);
            await test(() => c.set({show: false, create: true}), null, 'display: none;');
            element = c.element;
            await test(() => c.set({show: false, create: false}), isEmpty);
            await test(() => c.set({show: true, create: true}), '', null);
            element = c.element;
            const leaveStart = sinon.spy();
            const leaveEnd = sinon.spy();
            c.refs.a.on('a:leaveStart', leaveStart);
            c.refs.a.on('a:leaveEnd', leaveEnd);
            await test(() => {
                c.set('show', false);
                setTimeout(() => {
                    c.set('create', false);
                }, 200);
            }, () => {
                isEmpty();
                sEql(leaveStart.callCount, 1);
                sEql(leaveEnd.callCount, 1);
            });
        });
        it('handle events', async function() {
            this.enableTimeouts(false);

            const events = ['enterStart', 'enter', 'enterEnd', 'leaveStart', 'leave', 'leaveEnd'];
            let callbacks;
            let props;
            function initCallbacks() {
                callbacks = {};
                props = {};
                events.forEach(item => {
                    callbacks[item] = sinon.spy(() => console.log(item));
                    props[`ev-a:${item}`] = callbacks[item];
                });
            }
            function result(callCounts) {
                events.forEach((item, index) => {
                    sEql(callbacks[item].callCount, callCounts[index]);
                });
            }
            const C = Intact.extend({
                template: function(data, Vdt) {
                    const h = Vdt.miss.h;
                    return h(data.Animate, Object.assign({
                        'a:show': data.get('show'),
                    }, props), 'test');
                } 
            });
            initCallbacks();
            c = Intact.mount(C, document.body);
            const element = c.element;

            await test(() => {
                initCallbacks();
                c.set('show', true);
                c.set('show', false);
            }, () => {
                result([1, 0, 1, 1, 0, 1]);
            });
            await test(() => {
                initCallbacks();
                c.set('show', true);
            }, () => {
                result([1, 1, 1, 0, 0, 0]);
            });
            await test(() => {
                initCallbacks();
                c.set('show', false);
                c.set('show', true);
            }, () => {
                result([1, 0, 1, 1, 0, 1]);
            });
            await test(() => {
                initCallbacks();
                c.set('show', false);
            }, () => {
                result([0, 0, 0, 1, 1, 1]);
            });
        });

        it('handle dom in a:enterStart', async function() {
            this.enableTimeouts(false);

            const C = Intact.extend({
                template: `<Animate a:show={self.get('show')} a:enterStart={self._onShow}>test</Animate>`,
                _onShow(el) {
                    el.offsetWidth;
                }
            });
            c = Intact.mount(C, document.body);
            const element = c.element;

            c.set('show', true);
            await after(() => { c.set('show', false); }, 500);
            await after(() => { testAttribute('animate-leave-active animate-leave', '') }, 200);
            await after(() => { testAttribute('', 'display: none;') }, 700);
            c.set('show', true);
            await after(() => { c.set('show', false); }, 1200);
            await after(() => { c.set('show', true); }, 500);
            await after(() => { testAttribute('animate-enter-active', '') }, 200);
            await after(() => { testAttribute('', '') }, 700);
        });

        it('disable and show a leaving animate', async function() {
            this.enableTimeouts(false);

            const C = Intact.extend({
                template: `<Animate a:show={self.get('show')} a:disabled={self.get('disabled')}>test</Animate>`,
                defaults() {
                    return {show: true, disabled: false};
                },
            });

            c = Intact.mount(C, document.body);
            // show a disabled animation when leaving
            c.set('show', false);
            c.set({show: true, disabled: true});
            testAttribute('', null);

            // show a enabled animation when leaving
            c.set('show', false);
            c.set({show: true, disabled: false});
            await wait(1500);
            testAttribute('', '');

            // hide a disabed animation when entering
            c.set({show: false, disabled: true});
            c.set({show: true, disabled: false});
            c.set({show: false, disabled: true});
            testAttribute('', 'display: none;');

            // hide a enabled animation when entering
            c.set({show: false, disabled: true});
            c.set({show: true, disabled: true});
            c.set({show: false, disabled: false});
            await wait(1500);
            testAttribute('', 'display: none;');
        });

        it('hydrate a:show Animate', async function() {
            this.enableTimeouts(false);
            c = null;

            const div = document.createElement('div');
            document.body.appendChild(div);
            const C = Intact.extend({
                template: `<Animate a:show={self.get('show')}>test</Animate>`,
                defaults() {
                    return {show: false};
                }
            });
            const i = new C();
            const html = i.toString();
            div.innerHTML = html;
            sEql(html, '<div style="display:none;">test</div>');

            const newC = Intact.hydrate(C, div);
            newC.set('show', true);
            await wait(100)
            sEql(div.innerHTML, '<div style="" class="animate-enter-active">test</div>');
            await wait(1500);
            sEql(div.innerHTML, '<div style="" class="">test</div>');
            document.body.removeChild(div);
        });

        it('unmount a hide end Animate', async function() {
            this.enableTimeouts(false);

            const C = Intact.extend({
                template: `<div>
                    <Animate a:show={self.get('show')} v-if={!self.get('remove')}>test</Animate>
                </div>`,
                defaults() {
                    return {show: true, remove: false};
                },
            });

            c = Intact.mount(C, document.body);
            c.set('show', false);
            await wait(1500);

            const warn = console.warn;
            console.warn = sinon.spy(function(msg) {
                warn.call(console, msg);
            });
            c.set('remove', true);
            sEql(console.warn.callCount, 0);
            console.warn = warn;
        });

    });

    it('should call end even if transition can not be executed', async function() {
        this.enableTimeouts(false);
        const C = Intact.extend({
            template: `<div style="display: none;">
                <Animate v-if={!self.get('remove')}>test</Animate>
            </div>`,
            defaults() {
                return {remove: true};
            }
        });
        const c = Intact.mount(C, document.body);            
        c.set('remove', false);
        await wait(1200);
        sEql(c.element.firstChild.className, '');

        c.set('remove', true);
        await wait(1200);
        sEql(c.element.innerHTML, '');
    });
});
