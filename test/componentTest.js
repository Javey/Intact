import Intact from '../src';
import assert from 'assert';
import _ from 'lodash';

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
        console.log(a)
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
});
