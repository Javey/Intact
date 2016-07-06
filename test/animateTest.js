describe('Animate Test', function() {
    var A = Intact.extend({
        defaults: {
            show: true 
        },
        template: Intact.Vdt.compile("var Animate = Intact.Animate;\
            <Animate>{self.get('show') && <Animate>animate</Animate> || undefined}</Animate>\
        ", {noWith: true}),
        _create: function() {
            var self = this;
            setTimeout(function() {
                self.set('show', false);
            });
        }
    });

    it('Animate component render correctly', function() {
        var a = new A();
        a.init();
        a.element.outerHTML.should.be.eql('<div><div>animate</div></div>');
    });

    it('remove element when animation has completed', function(done) {
        var a = Intact.mount(A, document.body);
        setTimeout(function() {
            a.element.outerHTML.should.be.eql('<div></div>');
            done();
        }, 500);
    });
});
