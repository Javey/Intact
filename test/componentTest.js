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

    it('component self-update', function() {
        var b = new B();
        b.init();

        b.set('b', 2);
        b.element.outerHTML.should.be.eql('<b><a>1</a>2</b>');

        b.widgets.a.should.be.instanceOf(A);
        b.widgets.a.set('a', 2);
        b.element.outerHTML.should.be.eql('<b><a>2</a>2</b>');

        b.set('b', 3);
        b.element.outerHTML.should.be.eql('<b><a>2</a>3</b>');
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
        c.element.outerHTML.should.be.eql(html);

        // C.prototype.template = '<span><A arguments={{a: self.get("c")}} /></span>';
        // c = new C();
        // c.init();
        // c.element.outerHTML.should.be.eql(html);
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
        c.element.outerHTML.should.be.eql('<span><a>2</a></span>');

        c.widgets.a.set('a', 4);
        c.element.outerHTML.should.be.eql('<span><a>4</a></span>');
        c.update();
        c.element.outerHTML.should.be.eql('<span><a>2</a></span>');
    });

    it('update child component', function() {
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

        c.init();
        c.element.outerHTML.should.be.eql('<div></div>');

        c.set('component', a);
        a.inited.should.be.true;
        a.rendered.should.be.true;
        c.element.outerHTML.should.be.eql('<div><a>1</a></div>');

        c.set('component', b);
        b.inited.should.be.true;
        b.rendered.should.be.true;
        c.element.outerHTML.should.be.eql('<div><b><a>1</a>1</b></div>');

        destroyAFn.called.should.be.false;
        destroyBFn.called.should.be.false;
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
                this.widgets.b.should.be.instanceOf(B);
            },

            _update: function() {
                this.widgets.b.should.be.instanceOf(B);
            },

            template: '<div><B a={self.get("a")} ev-$change:a={self.changeData.bind(self)}/><B widget="b" /></div>',

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
        a.element.outerHTML.should.be.eql('<div><b>1</b><b>1</b></div>');

        a.set('a', 2);
        a.widgets.b.should.be.instanceOf(B);
        a.element.outerHTML.should.be.eql('<div><b>3</b><b>1</b></div>');
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
        changeData.calledOnce.should.be.true;
        a.set('a', 2);
        changeData.calledOnce.should.be.true;
        a.set('a', 1);
        changeData.calledTwice.should.be.true;
    });

    it('with promise', function(done) {
        var A = Intact.extend({
            template: '<a>{self.get("a")}</a>',
            _init: function() {
                var self = this,
                    def = $.Deferred();
                setTimeout(function() {
                    self.set('a', 1);
                    def.resolve();
                });
                return def.promise();
            }
        });
        var a = new A();
        a.inited.should.be.false;
        a.rendered.should.be.false;
        // a._hasCalledInit.should.be.false;

        var inited = sinon.spy(function() {
            a.init().outerHTML.should.be.eql('<a>1</a>');
            done();
        });

        a.on('$inited', inited);
    });
});
