import Intact from '../src';
import assert from 'assert';
import App from './components/app';
import {Promise} from 'es6-promise';
import {dispatchEvent, eqlOuterHtml, eqlHtml} from './utils';
import {each} from '../src/utils';
import {svgNS, browser} from 'misstime/src/utils';

const sEql = assert.strictEqual;
const dEql = assert.deepStrictEqual;

describe('Component Test', function() {
    let A, B;

    beforeEach(() => {
        A = Intact.extend({
            defaults: {
                a: 1
            },
            template: '<a>{self.get("a")}</a>'
        });

        B = Intact.extend({
            defaults: {
                b: 1
            },
            template: '<b><A widget="a"/>{self.get("b")}</b>',
            _init: function() {
                this.A = A;
            }
        });
    });

    it('component composite', function() {
        var b = new B();
        b.init();
        eqlOuterHtml(b.element, '<b><a>1</a>1</b>');
    });

    it('child component update self', function() {
        var b = new B();
        b.init();

        b.set('b', 2);
        eqlOuterHtml(b.element, '<b><a>1</a>2</b>');
        sEql(b.widgets.a instanceof A, true);

        b.widgets.a.set('a', 2);
        eqlOuterHtml(b.element, '<b><a>2</a>2</b>');

        b.set('b', 3);
        eqlOuterHtml(b.element, '<b><a>2</a>3</b>');
    });

    it('pass props to child', function() {
        var C = Intact.extend({
            defaults: {
                c: 3
            },
            template: '<span><A a={self.get("c")} /></span>',
            _init: function() {
                this.A = A;
            }
        });
        var html = '<span><a>3</a></span>';
        var c = new C();
        c.init();
        eqlOuterHtml(c.element, html);
    });

    it('parent component update', function() {
        var C = Intact.extend({
            defaults: {
                c: 3
            },
            template: '<span><A widget="a" a={self.get("c")} /></span>',
            _init: function() {
                this.A = A;
            }
        });
        var c = new C();

        c.init();
        c.set('c', 2);
        eqlOuterHtml(c.element, '<span><a>2</a></span>');

        c.widgets.a.set('a', 4);
        eqlOuterHtml(c.element, '<span><a>4</a></span>');
        c.update();
        eqlOuterHtml(c.element, '<span><a>2</a></span>');
    });

    it('update child component instance', function() {
        var C = Intact.extend({
            defaults: {
                component: undefined
            },
            template: '<div>{self.get("component")}</div>'
        });
        var c = new C(),
            a = new A(),
            b = new B(),
            destroyAFn = sinon.spy(),
            destroyBFn = sinon.spy();
        a._destroy = destroyAFn;
        b._destroy = destroyBFn;

        const dom = c.init();
        eqlOuterHtml(c.element, '<div></div>');

        c.set('component', a);
        sEql(a.inited, true);
        sEql(a.rendered, true);
        sEql(a.mounted, true);
        eqlOuterHtml(c.element, '<div><a>1</a></div>');

        c.set('component', b);
        sEql(b.inited, true);
        sEql(b.rendered, true);
        sEql(b.mounted, true);
        eqlOuterHtml(c.element, '<div><b><a>1</a>1</b></div>');

        sEql(destroyAFn.callCount, 1);
        sEql(destroyBFn.callCount, 0);
    });

    it('update componenent which its nested component has changed dom', () => {
        const A = Intact.extend({
            template: `<B ev-hide={self.proxy} />`,
            _init() {
                this.B = B;
            },
            proxy() {
                this.trigger('hide');
            }
        });
        const B = Intact.extend({
            template:`
                if (self.get('hide')) return;
                <div ev-click={self.hide}>show</div>
            `,
            hide() {
                this.set('hide', true);
                this.trigger('hide')
            }
        });
        const C = Intact.extend({
            template: `<div><A v-if={!self.get('hide')} ev-hide={self.hide}/></div>`,
            _init() {
                this.A = A;
            },
            hide() {
                this.set('hide', true);
            }
        });

        const i = Intact.mount(C, document.body);
        dispatchEvent(i.element.firstChild, 'click');
        eqlOuterHtml(i.element, '<div></div>');
        // document.body.removeChild(i.element);
    });

    it('update when updating', function() {
        var A = Intact.extend({
            defaults: {
                a: 1
            },

            displayName: 'A',

            _init: function() {
                this.B = B;
            },

            _create: function() {
                sEql(this.widgets.b instanceof B, true);
            },

            _update: function() {
                sEql(this.widgets.b instanceof B, true);
            },

            template: `<div><B a={self.get("a")} 
                ev-$change:a={self.changeData.bind(self)} widget="aa"
            /><B widget="b" /></div>`,

            changeData: function() {
                this.set('a', 3);
            }
        });
        var B = Intact.extend({
            defaults: {
                a: 1
            },

            displayName: 'B',

            template: '<b>{self.get("a")}</b>'
        });

        var a = new A();
        const dom = a.init();
        eqlOuterHtml(a.element, '<div><b>1</b><b>1</b></div>');

        a.set('a', 2);
        sEql(a.widgets.b instanceof B, true);
        eqlOuterHtml(a.element, '<div><b>3</b><b>1</b></div>');

        a.set('a', 4);
        eqlOuterHtml(a.element, '<div><b>3</b><b>1</b></div>');
    });

    it('should remove events', function() {
        var changeData = sinon.spy();
        var A = Intact.extend({
            template: '<B a={self.get("a")} ev-$change:a={self.get("a") === 1 ? self.changeData.bind(self) : undefined} />',
            changeData: changeData,
            _init: function() {
                this.B = B;
            }
        });
        var B = Intact.extend({
            template: '<b></b>'
        });
        var a = new A();
        a.init();

        a.set('a', 1);
        sEql(changeData.calledOnce, true);
        a.set('a', 2);
        sEql(changeData.calledOnce, true);
        a.set('a', 1);
        sEql(changeData.calledTwice, true);
    });

    it('should add events by array', function() {
        const A = Intact.extend({
            template: `<div></div>`,
        });
        const fn1 = sinon.spy();
        const fn2 = sinon.spy();
        const a = new A({'ev-click': [fn1, fn2]});

        a.trigger('click');

        sEql(fn1.callCount, 1);
        sEql(fn2.callCount, 1);
    });

    it('should patch events by array', function() {
        const fn1 = sinon.spy();
        const fn2 = sinon.spy();
        const A = Intact.extend({
            template: `<div></div>`
        });
        const B = Intact.extend({
            template: `<A ref="a" ev-click={self.get('click1') ? self.fn1 : null} ev-click={self.get('click2') ? self.fn2 : null} />`,
            defaults() {
                return {click1: true, click2: true};
            },
            _init() {
                this.A = A;
                this.fn1 = fn1;
                this.fn2 = fn2;
            }
        });

        const b = new B();
        b.init();

        b.refs.a.trigger('click');
        sEql(fn1.callCount, 1);
        sEql(fn2.callCount, 1);

        b.set('click1', false);
        b.refs.a.trigger('click');
        sEql(fn1.callCount, 1);
        sEql(fn2.callCount, 2);

        b.set({click1: true, click2: false});
        b.refs.a.trigger('click');
        sEql(fn1.callCount, 2);
        sEql(fn2.callCount, 2);

        b.set({click1: false, click2: false});
        b.refs.a.trigger('click');
        sEql(fn1.callCount, 2);
        sEql(fn2.callCount, 2);
    });

    it('v-model and $change:value property both added', () => {
        const fn = sinon.spy();
        const A = Intact.extend({
            template: `<div></div>`
        });
        const B = Intact.extend({
            template: `<A ref="a" v-model="a" ev-$change:value={self.fn} />`,
            _init() {
                this.A = A;
                this.fn = fn;
            }
        });
        const b = new B();
        b.init();

        b.refs.a.set('value', 1);
        sEql(b.get('a'), 1);
        sEql(fn.callCount, 1);
    });

    it('with promise', function(done) {
        var A = Intact.extend({
            template: '<a>{self.get("a")}</a>',
            _init: function() {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        this.set('a', 1);
                        resolve();
                    });
                });
            }
        });
        var a = new A();
        sEql(a.inited, false);
        sEql(a.rendered, false);
        sEql(a.mounted, false);

        var inited = sinon.spy(function() {
            eqlOuterHtml(a.init(), '<a>1</a>');
            done();
        });

        a.on('$inited', inited);
    });

    it('should replace element when the key is different for the same components', () => {
        const app = Intact.mount(App, document.body);
        const C = Intact.extend({template: '<a>a</a>'});
        const D = Intact.extend({
            defaults: {key: 'a'},
            template: '<span><C key={self.get("key")} /></span>',
            _init() { this.C = C; }
        });
        app.load(D);
        const element1 = app.element.firstChild;
        app.load(D, {key: 'b'});
        const element2 = app.element.firstChild;
        sEql(element1 === element2, false);
        app.load(D, {key: 'b'});
        const element3 = app.element.firstChild;
        sEql(element2 === element3, true);

        document.body.removeChild(app.element);
    });

    describe('Async Component', () => {
        let app;
        beforeEach(function() {
            this.enableTimeouts(false);
            app = Intact.mount(App, document.body);
        });

        afterEach(function() {
            document.body.removeChild(app.element);
        });

        function checkFunctionCallCount(p, counts) {
            each(['_init', '_create', '_mount', '_update', '_destroy'], (item, index) => {
                sEql(p[item].callCount, counts[index]);
            });
        }

        it('should render async component correctly', function(done) {
            this.enableTimeouts(false);
            const p = {
                template: '<a ref={function(dom) {self.dom = dom}}>a</a>',
                _init: sinon.spy(() => {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve();
                        });
                    });
                }),
                _create: sinon.spy(() => {
                    eqlHtml(app.element, '<!--!--><a>a</a>');
                }),
                _mount: sinon.spy(() => {
                    eqlHtml(app.element, '<a>a</a>');
                }),
                _update: sinon.spy(),
                _destroy: sinon.spy()
            };
            const Async = Intact.extend(p);

            app.load(Async);

            eqlHtml(app.element, '<!--!-->');
            checkFunctionCallCount(p, [1, 0, 0, 0, 0]);
            sEql(app.get('view').dom, undefined);

            setTimeout(() => {
                eqlHtml(app.element, '<a>a</a>');
                checkFunctionCallCount(p, [1, 1, 1, 0, 0]);
                sEql(app.get('view').dom, app.element.firstChild);
                
                done();
            }, 200);
        });

        it('should render the last async component directly and ignore progress state', function(done) {
            this.enableTimeouts(false);
            function createAsyncComponent(index, time) {
                return Intact.extend({
                    template: `<a>${index}</a>`,
                    _init() {
                        this.i = index;
                        return new Promise((resolve) => {
                            setTimeout(() => resolve(), time);
                        });
                    }
                });
            }
            const Async1 = createAsyncComponent(1, 100);
            const Async2 = createAsyncComponent(2, 300);

            app.load(Async1);
            app.load(Async2);

            setTimeout(() => {
                eqlHtml(app.element, '<!--!-->');
            }, 200);
            setTimeout(() => {
                eqlHtml(app.element, '<a>2</a>');
                done();
            }, 400);
        });

        it('should destroy async component correctly', function(done) {
            this.enableTimeouts(false);
            const p = {
                template: '<a ref={function(dom) {self.dom = dom}}>a</a>',
                _init: sinon.spy(function() {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            this.update();
                            resolve();
                        });
                    });
                }),
                _create: sinon.spy(),
                _mount: sinon.spy(),
                _update: sinon.spy(),
                _destroy: sinon.spy()
            };
            const Async = Intact.extend(p);
            const Sync = Intact.extend({template: '<b>b</b>'});

            app.load(Async);
            app.load(Sync);

            eqlHtml(app.element, '<b>b</b>');
            checkFunctionCallCount(p, [1, 0, 0, 0, 1]);
            sEql(app.get('view').dom, undefined);

            setTimeout(() => {
                eqlHtml(app.element, '<b>b</b>');
                checkFunctionCallCount(p, [1, 0, 0, 0, 1]);
                sEql(app.get('view').dom, undefined);
                
                // the async component should be destroyed correctly,
                // although it has be rendered
                app.load(Async);
                const lastView = app.get('view');

                setTimeout(() => {
                    app.load(Sync);
                    sEql(lastView.dom, null);
                    eqlHtml(app.element, '<b>b</b>');
                    lastView.update();
                    eqlHtml(app.element, '<b>b</b>');
                    checkFunctionCallCount(p, [2, 1, 1, 1, 2]);
                    done();
                }, 100);
            }, 100);
        });

        it('should not run destroy until the next async component start to render', function(done) {
            this.enableTimeouts(false);
            const Async = Intact.extend({
                template: '<a>a</a>',
                _init() {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve();
                        }, 500);
                    });
                }
            });
            const _destroy = sinon.spy(function() {
                this.element.removeChild(this.text);
            });
            const Sync = Intact.extend({
                defaults: {value: 'b'},
                template: '<b><i>{self.get("value")}</i></b>',
                _create() {
                    this.text = document.createTextNode('c');
                    this.element.appendChild(this.text);
                },
                _destroy: _destroy 
            });
            const sync = app.load(Sync);
            app.load(Async);
            app.update();
            eqlHtml(app.element, '<b><i>b</i>c</b>');
            sync.set('value', 'bb');
            app.update();
            
            eqlHtml(app.element, '<b><i>bb</i>c</b>');
            sEql(_destroy.callCount, 0);
            setTimeout(() => {
                sEql(_destroy.callCount, 1);
                eqlHtml(app.element, '<a>a</a>');
                
                app.load(Sync);
                app.load(Async);
                app.load(Sync);
                sEql(_destroy.callCount, 2);
                eqlHtml(app.element, '<b><i>b</i>c</b>');

                done();
            }, 600);
        });

        it('should render nested async component correctly', function(done) {
            this.enableTimeouts(false);
            const Async1 = Intact.extend({
                template: '<a>a</a>',
                _init() {
                    return new Promise((resolve) => {
                        setTimeout(() => resolve(), 100);
                    });
                }
            });
            const Async2 = Intact.extend({
                template: '<span><Async1 /></span>',
                _init() {
                    this.Async1 = Async1;
                    return new Promise((resolve) => {
                        setTimeout(() => resolve(), 100);
                    });
                }
            });
            app.load(Async2);
            eqlHtml(app.element, '<!--!-->');
            setTimeout(() => {
                eqlHtml(app.element, '<span><!--!--></span>');
                app.load(Async2);
                eqlHtml(app.element, '<span><!--!--></span>');
            }, 200);
            setTimeout(() => {
                eqlHtml(app.element, '<span><a>a</a></span>');

                // update
                const sync = app.load(Async2);
                eqlHtml(app.element, '<span><a>a</a></span>');
                sEql(sync.inited, false);
                sEql(sync.rendered, false);

                setTimeout(() => {
                    eqlHtml(app.element, '<span><a>a</a></span>');
                    sEql(sync.inited, true);
                    sEql(sync.rendered, true);

                    done();
                }, 300);
            }, 400);
        });

        it('patch async component with sync component use the different tag', (done) => {
            const Async = Intact.extend({
                template: '<a>a</a>',
                _init() {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve();
                        });
                    });
                }
            });
            const Sync = Intact.extend({
                template: '<b>b</b>'
            });
            app.load(Sync);
            const syncElement = app.element.firstChild;
            app.load(Async);
            const asyncElement = app.element.firstChild;
            sEql(syncElement, asyncElement);
            setTimeout(() => {
                eqlHtml(app.element, '<a>a</a>');
                done();
            }, 100);
        });

        it('patch async component with sync component use the same tag', (done) => {
            const Async = Intact.extend({
                template: '<a>a</a>',
                _init() {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve();
                        });
                    });
                }
            });
            const Sync = Intact.extend({
                template: '<a>b</a>'
            });
            app.load(Sync);
            const syncElement = app.element.firstChild;
            app.load(Async);
            const asyncElement = app.element.firstChild;
            sEql(syncElement, asyncElement);
            setTimeout(() => {
                eqlHtml(app.element, '<a>a</a>');
                sEql(syncElement, app.element.firstChild);
                done();
            }, 100);
        });
    });

    it('toString', () => {
        const a = new A();
        const b = new B();
        sEql(a.toString(), '<a>1</a>');
        sEql(b.toString(), '<b><a>1</a>1</b>');

        const C = Intact.extend({
            template: `<div>{1}{2}</div>`
        });
        sEql(new C().toString(), '<div>1<!---->2</div>');
    });

    it('hydrate', () => {
        const div = document.createElement('div');
        document.body.appendChild(div);
        const C = Intact.extend({
            template: `<div ev-click={self.add.bind(self)}>{self.get('count')}</div>`,
            defaults() {
                return {count: 1};
            },
            add() {
                this.set('count', this.get('count') + 1);
            }
        });

        const c = new C();
        div.innerHTML = c.toString();
        eqlHtml(div, `<div>1</div>`);
        Intact.hydrate(C, div);
        eqlHtml(div, `<div>1</div>`);
        dispatchEvent(div.firstChild, 'click');
        eqlHtml(div, `<div>2</div>`);
        document.body.removeChild(div);
    });

    it('hydrate async component', (done) => {
        const div = document.createElement('div');
        document.body.appendChild(div);
        const C = Intact.extend({
            template: `<D />`,
            _init() {
                this.D = D;
            }
        });
        const D = Intact.extend({
            template: `<div ev-click={self.add.bind(self)}>{self.get('count')}</div>`,
            defaults() {
                return {count: 1};
            },
            _init() {
                return new Promise(resolve => {
                    setTimeout(resolve, 50);
                });
            },
            add() {
                this.set('count', this.get('count') + 1);
            }
        });

        div.innerHTML = '<div>0</div>';
        Intact.hydrate(C, div);
        eqlHtml(div, '<div>0</div>');
        setTimeout(() => {
            eqlHtml(div, '<div>1</div>');
            dispatchEvent(div.firstChild, 'click');
            eqlHtml(div, '<div>2</div>');
            document.body.removeChild(div);
            done();
        }, 200);
    });

    describe('SVG', () => {
        if (browser.isIE8) return;
        
        let container;

        beforeEach(() => {
            container = document.createElement('div');
            document.body.appendChild(container);
        });

        afterEach(() => {
            document.body.removeChild(container);
        });

        it('render svg component', () => {
            const SvgComponent = Intact.extend({
                template: `<svg><circle r="50" fill="red"></circle></svg>`
            });
            Intact.mount(SvgComponent, container);
            sEql(container.firstChild.namespaceURI, svgNS);
            sEql(container.firstChild.firstChild.namespaceURI, svgNS);
        });

        it('render svg child component', () => {
            const C = Intact.extend({
                template: `<circle r="50" fill="red"></circle>`
            });
            const D = Intact.extend({
                template: `var C = self.C; <svg><C /></svg>`,
                _init() {
                    this.C = C;
                }
            });
            Intact.mount(D, container);

            sEql(container.firstChild.namespaceURI, svgNS);
            sEql(container.firstChild.firstChild.namespaceURI, svgNS);
        });

        it('patch svg child component', () => {
            const C1 = Intact.extend({
                template: `<circle r="50" fill="red"></circle>`
            });
            const C2 = Intact.extend({
                template: `<rect width="50" height="50" fill="blue"></rect>`
            });
            const D = Intact.extend({
                template: `
                    var C1 = self.C1;
                    var C2 = self.C2;
                    <svg><C1 v-if={self.get('a')} /><C2 v-else /></svg>
                `,
                _init() {
                    this.C1 = C1;
                    this.C2 = C2;
                }
            });
            const d = Intact.mount(D, container);
            d.set('a', true);

            sEql(container.firstChild.namespaceURI, svgNS);
            sEql(container.firstChild.firstChild.namespaceURI, svgNS);
            sEql(container.firstChild.firstChild.tagName.toLowerCase(), 'circle');
        });
    });

    it('should reset to default value when prop in lastProps but not in nextProps', () => {
        const C = Intact.extend({
            template: `<div>{self.get('value')}</div>`,
            defaults() {
                return {
                    value: 'default'
                }
            }
        });
        const D = Intact.extend({
            template: `var C = self.C;
                <div>{self.get('a')}<C value="a" /><C /></div>
            `,
            defaults() {
                this.C = C;
                return {
                    a: 'test'
                }
            }
        });
        const d = Intact.mount(D, document.body);
        d.set('a', undefined);
        eqlHtml(d.element, '<div>a</div><div>default</div>', '<div>a</div>\r\n<div>default</div>');
        document.body.removeChild(d.element);
    });

    it('should update when destroying', () => {
        const C = Intact.extend({
            template: `<p>{self.get('value')}</p>`
        });

        const D = Intact.extend({
            template: `var C = self.C;
                <div>{self.get('value')}<C value={self.get('value')} key="c" /></div>
            `,
            _init() {
                this.C = C;
            },
            _destroy() {
                // update child component
                this.set('value', 1);
                eqlOuterHtml(d.element, '<div>1<p>1</p></div>', '<div>1\r\n<p>1</p></div>');
            }
        });

        const d = Intact.mount(D, document.body);
        d.destroy();
        // should no update when destroyed
        d.set('value', 2);
        eqlOuterHtml(d.element, '<div>1<p>1</p></div>', '<div>1\r\n<p>1</p></div>');
        document.body.removeChild(d.element);
    });

    it('should destroy when patch component with element or component', () => {
        const bDestroy = sinon.spy();
        const dDestroy = sinon.spy();
        const B = Intact.extend({
            template: `<div>b</div>`,
            _destroy: bDestroy
        });
        const C = Intact.extend({
            template: `var B = self.B; <div><B />c</div>`,
            _init() {
                this.B = B;
            },
            _destroy: dDestroy
        });
        const D = Intact.extend({
            template: `var C = self.C; var B = self.B;
                <div><C v-if={self.get('show')} /><B v-else /></div>
            `,

            defaults() {
                return {show: true};
            },

            _init() {
                this.C = C;
                this.B = B;
            }
        });
        const E = Intact.extend({
            template: `var C = self.C;
                <div><C v-if={self.get('show')} /><div v-else>d</div></div>
            `,

            defaults() {
                return {show: true};
            },

            _init() {
                this.C = C;
            }
        });

        const d = Intact.mount(D, document.body);
        d.set('show', false);
        sEql(bDestroy.callCount, 1);
        sEql(dDestroy.callCount, 1);
        document.body.removeChild(d.element);

        const e = Intact.mount(E, document.body);
        e.set('show', false);
        sEql(bDestroy.callCount, 2);
        sEql(dDestroy.callCount, 2);
        document.body.removeChild(e.element);
    });

    describe('<b:block>', () => {
        let C;
        let d;
        beforeEach(() => {
            C = Intact.extend({
                template: `<div><b:test>aa</b:test><b:body></b:body></div>`
            });
        });

        afterEach(() => {
            document.body.removeChild(d.element);
        });

        function render(template) {
            const D = Intact.extend({
                template: `var C = self.C; ${template}`,
                _init() { this.C = C; }
            });
            d = Intact.mount(D, document.body);
        }

        it('render one block', () => {
            render('<C><b:test>cc</b:test></C>');
            eqlOuterHtml(d.element, '<div>cc</div>', '<div>cc</div>');
        });

        it('render multiple blocks', () => {
            render('<C><b:test>c1</b:test><b:body>c2</b:body></C>');
            sEql(d.element.innerHTML, 'c1c2');
        });

        it('redundant block should not be rendered', () => {
            render('<C><b:test>c1</b:test><b:body>c2</b:body><b:aa>aa</b:aa></C>');
            sEql(d.element.innerHTML, 'c1c2');
        });

        it('render parent', () => {
            render('<C><b:test>{parent()}child</b:test></C>');
            sEql(d.element.innerHTML, 'aachild');
        });

        it('block extendable', () => {
            const CC = C.extend({
                template: `<t:parent><b:body>cc</b:body></t:parent>`
            });
            const D = Intact.extend({
                template: `var CC = self.CC; <CC><b:test>{parent()}child</b:test></CC>`,
                _init() { this.CC = CC; }
            });
            d = Intact.mount(D, document.body);
            sEql(d.element.innerHTML, 'aachildcc');
        });

        it('block with v-if=true directive', () => {
            render('<C><b:test v-if={true}>c1</b:test></C>');
            sEql(d.element.innerHTML, 'c1');
        });

        it('block with v-if=false directive', () => {
            render('<C><b:test v-if={false}>c1</b:test></C>');
            sEql(d.element.innerHTML, 'aa');
        });

        it('update', () => {
            render(`<C><b:test>
                <span v-if={self.get('show')}>show</span>
                <i v-else>i</i>
            </b:test></C>`);
            d.set('show', true);
            eqlHtml(d.element, '<span>show</span>');
        });
    });

    it('should render when promise.reject in _init', (done) => {
        // for unknown reason
        if (browser.isSafari) return;

        const C = Intact.extend({
            template: `<div>{self.get('a')}</div>`,
            _init() {
                return new Promise((resolve, reject) => {
                    reject();
                });
            }
        });

        const c = Intact.mount(C, document.body);
        setTimeout(() => {
            eqlOuterHtml(c.element, '<div></div>');
            document.body.removeChild(c.element);
            done();
        }, 200);
    });

    it('should autobind method', done => {
        const test = sinon.spy();
        const C = Intact.extend({
            template: `<div ev-click={self.test}>click</div>`,
            test: test,
        });

        const c = Intact.mount(C, document.body);
        dispatchEvent(c.element, 'click');
        sEql(test.callCount, 1);
        sEql(test.calledOn(c), true);
        document.body.removeChild(c.element);

        const D = C.extend({
            template: `<div ev-click={self.test}>click</div>`
        });
        const d = Intact.mount(D, document.body);
        dispatchEvent(d.element, 'click');
        sEql(test.callCount, 2);
        sEql(test.calledOn(d), true);
        document.body.removeChild(d.element);

        const test1 = sinon.spy();
        const D1 = C.extend({
            test: test1 
        });
        const d1 = Intact.mount(D1, document.body);
        dispatchEvent(d1.element, 'click');
        sEql(test.callCount, 2);
        sEql(test1.callCount, 1);
        document.body.removeChild(d1.element);

        if (!browser.isIE8) {
            class E extends Intact {
                @Intact.template()
                get template() { return `<div ev-click={self.test}>click</div>`; }

                test() {
                    test.call(this);
                }
            }

            const e = Intact.mount(E, document.body);
            dispatchEvent(e.element, 'click');
            sEql(test.callCount, 3);
            sEql(test.calledOn(e), true);
            document.body.removeChild(e.element);

            class F extends E {

            }

            const f = Intact.mount(F, document.body);
            dispatchEvent(f.element, 'click');
            sEql(test.callCount, 4);
            sEql(test.calledOn(f), true);
            document.body.removeChild(f.element);
        }

        done();
    });
});
