describe('Simple Test', function() {
    it('Intact object test', function() {
        Intact.should.be.a.Function;
        Intact.mount.should.be.a.Function;
        Intact.extend.should.be.a.Function;
        (Intact.extend()).should.be.a.Function;
    });

    it('Should throw error when instantiate component which has not template', function() {
        (function() { new Intact(); }).should.throw();
        var Component = Intact.extend();
        (function() { new Component(); }).should.throw();
    });

    describe('Intact.extend', function() {
        var Component,
            SubComponent;

        before(function() {
            Component = Intact.extend({
                defaults: {
                    a: 1
                },

                template: '<div>{this.get("a")}</div>'
            });
            SubComponent = Component.extend({
                defaults: {
                    a: 2,
                    b: 1
                }
            });
        });

        it('properties', function() {
            Component.prototype.defaults.a.should.be.eql(1);
            SubComponent.prototype.defaults.a.should.be.eql(2);
            SubComponent.prototype.defaults.b.should.be.eql(1);
            SubComponent.prototype.template.should.be.type('string');
        });

        it('instantiate', function() {
            (new Component()).get('a').should.be.eql(1);
            (new Component()).type.should.be.eql('Widget');
            (new Component({a: 2})).get('a').should.be.eql(2);
            (new SubComponent()).get('a').should.be.eql(2);
            (new SubComponent({c: 3})).get().should.be.eql({a: 2, b: 1, c: 3});

            var instance = new SubComponent();
            instance.vdt.should.be.type('object');
            instance.vdt.template.should.be.a.Function;
            instance.inited.should.be.eql(true);
            instance.rendered.should.be.eql(false);
            instance._hasCalledInit.should.be.eql(false);
            instance._events.should.have.keys('change');
            instance._events.change.length.should.be.eql(1);
            (instance.get('children') === undefined).should.be.true;
            instance._updateCount.should.be.eql(0);
        });

        it('call constructor directly should return a thunk', function() {
            var thunk = Component();
            thunk.type.should.be.eql('Thunk');
            thunk.Widget.should.be.eql(Component);
            (SubComponent()).type.should.be.eql('Thunk');
        });
        
        it('widgets reference', function() {
            var TestComponent = Intact.extend({
                template: '<Component widget="test" />',
                _init: function() {
                    this.Component = Component;
                }
            });
            var instance = new TestComponent();
            instance.widgets.should.be.eql({});
            instance.init();
            instance.widgets.should.have.keys('test');
            instance.widgets.test.should.be.instanceOf(Component);
        });
    });

    describe('Method', function() {
        var instance;

        beforeEach(function() {
            var Component = Intact.extend({
                defaults: {
                    a: 1
                },

                template: '<div>{this.get("a")}</div>'
            });
            instance = new Component({c: 3});
        });

        it('init', function() {
            var element = instance.init();
            element.tagName.toLowerCase().should.be.eql('div');
            instance.element.should.be.eql(element);
            instance.inited.should.be.eql(true);
            instance.rendered.should.be.eql(true);
            instance._hasCalledInit.should.be.eql(true);
        });

        it('update', function() {
            instance.init(); 
            instance.set({a: 3}, {silent: true});
            $(instance.element).text().should.be.eql('1');
            instance.update();
            $(instance.element).text().should.be.eql('3');
            instance.set({a: 4});
            $(instance.element).text().should.be.eql('4');
        });

        it('get', function() {
            instance.get('a').should.be.eql(1);
            (instance.get('aa') === undefined).should.be.true;
            instance.get().should.be.eql({a: 1, c: 3});
        });

        it('set', function() {
            instance.set('a', 1);
            instance.get('a').should.be.eql(1);
            instance.set({a: 11});
            instance.get('a').should.be.eql(11);
            instance.defaults.a.should.be.eql(1);
        });
    });

    describe('Life cycle', function() {
        var _init, _create, _update, _beforeUpdate, _destroy,
            Component, instance;
        beforeEach(function() {
            _init = sinon.spy();
            _create = sinon.spy();
            _update = sinon.spy();
            _beforeUpdate = sinon.spy();
            _destroy = sinon.spy();
            Component = Intact.extend({
                template: '<i></i>',
                _init: _init,
                _create: _create,
                _update: _update,
                _beforeUpdate: _beforeUpdate,
                _destroy: _destroy
            });
        });
        var assert = function(a, b, c, d, e) {
            _init.callCount.should.be.eql(a);
            _create.callCount.should.be.eql(b);
            _beforeUpdate.callCount.should.be.eql(c);
            _update.callCount.should.be.eql(d);
            _destroy.callCount.should.be.eql(e);
        };

        it('_init', function() {
            var instance = new Component();
            assert(1, 0, 0, 0, 0);
        });

        it('_create', function() {
            var instance = new Component();
            instance.init();
            assert(1, 1, 0, 0, 0);

            instance = new Component();
            instance.vdt.render(instance);
            instance.update();
            assert(2, 2, 1, 1, 0);
        });

        it('_udpate', function() {
            var instance = new Component();
            instance.init();
            instance.set({a: 1});
            assert(1, 1, 1, 1, 0);
            instance.set({a: 2});
            assert(1, 1, 2, 2, 0);
            instance.set({a: 3}, {silent: true});
            assert(1, 1, 2, 2, 0);
        });

        it('_destroy', function() {
            var instance = new Component();
            instance.init();
            instance.destroy();
            assert(1, 1, 0, 0, 1);
        });
    });

    describe('Event', function() {
        var Component;
        beforeEach(function() {
            Component = Intact.extend({
                defaults: {a: 1},
                template: '<i>{this.get("a")}</i>'
            });
        });

        it('add event listener by `on` method', function() {
            var instance = new Component(),
                testFn = sinon.spy();            

            instance.on('test', testFn);
            instance.trigger('test', 1, 2, [3]);
            testFn.callCount.should.be.eql(1);
            testFn.calledWith(1, 2, [3]).should.be.true;
            testFn.calledOn(instance).should.be.true;
        });

        it('add event listener by `ev-*` property', function() {
            var testFn = sinon.spy(),
                instance = new Component({
                    'ev-test': testFn 
                });

            instance.trigger('test', 1, 2, [3]);
            testFn.callCount.should.be.eql(1);
            testFn.calledWith(1, 2, [3]).should.be.true;
            testFn.calledOn(instance).should.be.true;
        });

        it('change attributes to trigger change event', function() {
            var changeFn = sinon.spy(),
                changeAFn = sinon.spy(),
                instance = new Component();

            instance.on('change', changeFn);
            instance.on('change:a', changeAFn);
            instance.set('a', 2);
            changeAFn.calledOnce.should.be.true;
            changeFn.calledOnce.should.be.true;
            changeAFn.calledBefore(changeFn).should.be.true;
            changeAFn.calledWith(instance, 2).should.be.true;
            changeFn.calledWith(instance).should.be.true;

            instance.set('a', 2);
            changeAFn.calledOnce.should.be.true;
            changeFn.calledOnce.should.be.true;

            instance.set('a', 3, {silent: true});
            changeAFn.calledOnce.should.be.true;
            changeFn.calledOnce.should.be.true;

            instance.set('a', 4, {global: false});
            changeAFn.calledTwice.should.be.true;
            changeFn.calledOnce.should.be.true;

            instance.set({a: 5}, {silent: true, global: true});
            changeAFn.calledTwice.should.be.true;
            changeFn.calledOnce.should.be.true;
        });

        it('off event', function() {
            var testFn = sinon.spy(),
                changeFn = sinon.spy(),
                instance = new Component({
                    'ev-change': changeFn,
                    'ev-test': testFn
                }),
                test2Fn = sinon.spy();

            instance.on('test', test2Fn);

            instance.off('test', testFn);
            instance.trigger('test');
            testFn.called.should.be.false;
            test2Fn.calledOnce.should.be.true;

            instance.off('test');
            instance.trigger('test');
            testFn.called.should.be.false;
            test2Fn.calledOnce.should.be.true;
            
            instance.off();
            instance.trigger('change');
            changeFn.called.should.be.false;
        });

        it('should trigger inited event when instantiate', function() {
            var testFn = sinon.spy(),
                instance = new Component({
                    'ev-inited': testFn
                });
            testFn.calledOnce.should.be.true;
            testFn.calledWith(instance).should.be.true;
            testFn.calledOn(instance).should.be.true;
            instance.inited.should.be.true;
            instance.rendered.should.be.false;
        });

        it('should trigger rendered event when init', function() {
            var testFn = sinon.spy(),
                instance = new Component();
            instance.on('rendered', testFn);
            instance.init();
            testFn.calledOnce.should.be.true;
            testFn.calledWith(instance).should.be.true;
            testFn.calledOn(instance).should.be.true;
            instance.inited.should.be.true;
            instance.rendered.should.be.true;
        });

        it('should trigger rendered event when update without init', function() {
            var testFn = sinon.spy(),
                instance = new Component();
            instance.on('rendered', testFn);
            instance.vdt.render(instance);
            instance.update();
            testFn.calledOnce.should.be.true;
            testFn.calledWith(instance).should.be.true;
            testFn.calledOn(instance).should.be.true;
            instance.inited.should.be.true;
            instance.rendered.should.be.true; 
        });
    });
});
