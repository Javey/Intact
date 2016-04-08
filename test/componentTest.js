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
});
