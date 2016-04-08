describe('Component Test', function() {
    var A = Intact.extend({
        defaults: {
            a: 1
        },
        template: '<a>{this.get("a")}</a>'
    });
    var B = Intact.extend({
        defaults: {
            b: 1
        },
        template: '<b><A widget="a"/>{this.get("b")}</b>',
        _init: function() {
            this.A = A;
        }
    });

    it('component composite', function() {
        var b = new B();
        b.init();
        b.element.outerHTML.should.be.eql('<b><a>1</a>1</b>');
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

    it('pass arguments to child', function() {
        var C = Intact.extend({
            defaults: {
                c: 3
            },
            template: '<span><A a={this.get("c")} /></span>',
            _init: function() {
                this.A = A;
            }
        });
        var html = '<span><a>3</a></span>';
        var c = new C();
        c.init();
        c.element.outerHTML.should.be.eql(html);

        C.prototype.template = '<span><A arguments={{a: this.get("c")}} /></span>';
        c = new C();
        c.init();
        c.element.outerHTML.should.be.eql(html);
    });

    it('parent component update', function() {
        var C = Intact.extend({
            defaults: {
                c: 3
            },
            template: '<span><A widget="a" a={this.get("c")} /></span>',
            _init: function() {
                this.A = A;
            }
        });
        var html = '<span><a>3</a></span>';
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
            template: '<div>{this.get("component")}</div>'
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
});
