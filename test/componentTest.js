import Intact from '../src';
import assert from 'assert';
import _ from 'lodash';
import App from './components/app';

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
        sEql(b.element.outerHTML, '<b><a>1</a>1</b>');
    });

    it('child component update self', function() {
        var b = new B();
        b.init();

        b.set('b', 2);
        sEql(b.element.outerHTML, '<b><a>1</a>2</b>');
        sEql(b.widgets.a instanceof A, true);

        b.widgets.a.set('a', 2);
        sEql(b.element.outerHTML, '<b><a>2</a>2</b>');

        b.set('b', 3);
        sEql(b.element.outerHTML, '<b><a>2</a>3</b>');
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
        sEql(c.element.outerHTML, html);
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
        sEql(c.element.outerHTML, '<span><a>2</a></span>');

        c.widgets.a.set('a', 4);
        sEql(c.element.outerHTML, '<span><a>4</a></span>');
        c.update();
        sEql(c.element.outerHTML, '<span><a>2</a></span>');
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

        c.init();
        sEql(c.element.outerHTML, '<div></div>');

        c.set('component', a);
        sEql(a.inited, true);
        sEql(a.rendered, true);
        sEql(a.mounted, true);
        sEql(c.element.outerHTML, '<div><a>1</a></div>');

        c.set('component', b);
        sEql(b.inited, true);
        sEql(b.rendered, true);
        sEql(b.mounted, true);
        sEql(c.element.outerHTML, '<div><b><a>1</a>1</b></div>');

        sEql(destroyAFn.callCount, 1);
        sEql(destroyBFn.callCount, 0);
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

            template: '<div><B a={self.get("a")} ev-$change:a={self.changeData.bind(self)} widget="aa"/><B widget="b" /></div>',

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
        a.init();
        sEql(a.element.outerHTML, '<div><b>1</b><b>1</b></div>');

        a.set('a', 2);
        sEql(a.widgets.b instanceof B, true);
        sEql(a.element.outerHTML, '<div><b>3</b><b>1</b></div>');

        a.set('a', 4);
        sEql(a.element.outerHTML, '<div><b>3</b><b>1</b></div>');
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
            sEql(a.init().outerHTML, '<a>1</a>');
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
            _.each(['_init', '_create', '_mount', '_update', '_destroy'], (item, index) => {
                sEql(p[item].callCount, counts[index]);
            });
        }

        it('should render async component correctly', function(done) {
            this.enableTimeouts(false);
            const p = {
                template: '<a ref={(dom) => self.dom = dom}>a</a>',
                _init: sinon.spy(() => {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve();
                        }, 100);
                    });
                }),
                _create: sinon.spy(() => {
                    sEql(app.element.innerHTML, '<!--!--><a>a</a>');
                }),
                _mount: sinon.spy(() => {
                    sEql(app.element.innerHTML, '<a>a</a>');
                }),
                _update: sinon.spy(),
                _destroy: sinon.spy()
            };
            const Async = Intact.extend(p);

            app.load(Async);

            sEql(app.element.innerHTML, '<!--!-->');
            checkFunctionCallCount(p, [1, 0, 0, 0, 0]);
            sEql(app.get('view').dom, undefined);

            setTimeout(() => {
                sEql(app.element.innerHTML, '<a>a</a>');
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
            const Async2 = createAsyncComponent(2, 200);

            app.load(Async1);
            app.load(Async2);

            setTimeout(() => {
                sEql(app.element.innerHTML, '<!--!-->');
            }, 150);
            setTimeout(() => {
                sEql(app.element.innerHTML, '<a>2</a>');
                done();
            }, 300);
        });

        it('should destroy async component correctly', function(done) {
            this.enableTimeouts(false);
            const p = {
                template: '<a ref={(dom) => self.dom = dom}>a</a>',
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

            sEql(app.element.innerHTML, '<b>b</b>');
            checkFunctionCallCount(p, [1, 0, 0, 0, 1]);
            sEql(app.get('view').dom, undefined);

            setTimeout(() => {
                sEql(app.element.innerHTML, '<b>b</b>');
                checkFunctionCallCount(p, [1, 0, 0, 0, 1]);
                sEql(app.get('view').dom, undefined);
                
                // the async component should be destroyed correctly,
                // although it has be rendered
                app.load(Async);
                const lastView = app.get('view');

                setTimeout(() => {
                    app.load(Sync);
                    sEql(lastView.dom , null);
                    sEql(app.element.innerHTML, '<b>b</b>');
                    lastView.update();
                    sEql(app.element.innerHTML, '<b>b</b>');
                    checkFunctionCallCount(p, [2, 1, 1, 1, 2]);
                });
                done();
            });
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
            sEql(app.element.innerHTML, '<b><i>b</i>c</b>');
            sync.set('value', 'bb');
            app.update();
            
            sEql(app.element.innerHTML, '<b><i>bb</i>c</b>');
            sEql(_destroy.callCount, 0);
            setTimeout(() => {
                sEql(_destroy.callCount, 1);
                sEql(app.element.innerHTML, '<a>a</a>');
                
                app.load(Sync);
                app.load(Async);
                app.load(Sync);
                sEql(_destroy.callCount, 2);
                sEql(app.element.innerHTML, '<b><i>b</i>c</b>');

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
            sEql(app.element.innerHTML, '<!--!-->');
            setTimeout(() => {
                sEql(app.element.innerHTML, '<span><!--!--></span>');
                app.load(Async2);
                sEql(app.element.innerHTML, '<span><!--!--></span>');
            }, 150);
            setTimeout(() => {
                sEql(app.element.innerHTML, '<span><a>a</a></span>');

                // update
                const sync = app.load(Async2);
                sEql(app.element.innerHTML, '<span><a>a</a></span>');
                sEql(sync.inited, false);
                sEql(sync.rendered, false);

                setTimeout(() => {
                    sEql(app.element.innerHTML, '<span><a>a</a></span>');
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
                sEql(app.element.innerHTML, '<a>a</a>');
                done();
            });
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
                sEql(app.element.innerHTML, '<a>a</a>');
                sEql(syncElement, app.element.firstChild);
                done();
            });
        });
    });
});
