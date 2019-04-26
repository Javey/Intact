import Intact from '../src';
import assert from 'assert';
import {dispatchEvent, dEql, eqlHtml, eqlOuterHtml} from './utils';
import {extend, each, isEqual} from '../src/utils';
import {browser} from 'misstime/src/utils';

const sEql = assert.strictEqual;
const userAgent = navigator.userAgent;
const isSafari = userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') < 0;

function isFunction(o) {
    sEql(typeof o, 'function');
}

describe('Simple Test', function() {
    it('Intact object test', function() {
        isFunction(Intact);
        isFunction(Intact.mount);
        isFunction(Intact.extend);
        isFunction(Intact.extend());
    });

    it('Should throw error when instantiate component which has not template', function() {
        assert.throws(function() { new Intact(); });
        const Component = Intact.extend();
        assert.throws(function() { new Component(); });
    });

    describe('Intact.extend', function() {
        var Component,
            SubComponent;

        before(function() {
            Component = Intact.extend({
                defaults: {
                    a: 1,
                    c: 3
                },

                template: '<div>{self.get("a")}</div>',

                displayName: 'Component'
            });
            SubComponent = Component.extend({
                defaults: {
                    a: 2,
                    b: 1
                }
            });
        });

        it('properties', function() {
            sEql(Component.prototype.defaults.a, 1);
            sEql(SubComponent.prototype.defaults.a, 2);
            sEql(SubComponent.prototype.defaults.b, 1);
            sEql(SubComponent.prototype.defaults.c, 3);
            sEql(typeof SubComponent.prototype.template, 'function');
            
            // displayName
            sEql(Component.prototype.displayName, 'Component');
            sEql(Component.displayName, 'Component');
            sEql(SubComponent.prototype.displayName, 'Component');
            sEql(SubComponent.displayName, 'Component');
        });

        it('instantiate', function() {
            sEql((new Component()).get('a'), 1);
            sEql((new Component({a: 2})).get('a'), 2);
            sEql((new SubComponent()).get('a'), 2);
            dEql((new SubComponent({c: 3})).get(), {a: 2, b: 1, c: 3});

            var instance = new SubComponent();
            sEql(typeof instance.vdt, 'object');
            isFunction(instance.vdt.template);
            sEql(instance.inited, true);
            sEql(instance.rendered, false);
            sEql(instance.mounted, false);
            sEql(instance.get('children'), undefined);
            sEql(instance._updateCount, 0);
        });

        it('widgets reference', function() {
            var TestComponent = Intact.extend({
                template: '<Component widget="test" />',
                _init: function() {
                    this.Component = Component;
                }
            });
            var instance = new TestComponent();
            dEql(instance.widgets, {});
            instance.init();
            sEql(instance.widgets.test instanceof Component, true);

            TestComponent = Intact.extend({
                template: '<Component ref={function(i) {self._i = i;}} />',
                _init: function() {
                    this.Component = Component;
                }
            });
            instance = new TestComponent();
            sEql(instance._i, undefined);
            instance.init();
            sEql(instance._i instanceof Component, true);
        });

        it('string ref', () => {
            var TestComponent = Intact.extend({
                template: '<div ref="dom"><Component ref="test" /></div>',
                _init: function() {
                    this.Component = Component;
                }
            });
            var instance = new TestComponent();
            sEql(instance.refs.test, undefined);
            instance.init();
            sEql(instance.refs.test instanceof Component, true);
            sEql(instance.refs.dom, instance.element);
            instance.destroy();
            sEql(instance.refs.test, null);
            sEql(instance.refs.dom, null);
        });

        it('es6 class extend', () => {
            if (browser.isIE8) return;

            class TestComponent extends Intact {
                get defaults() { return {a: 1}; }
                get template() { return '<div>{self.get("a")}</div>'; }
            }
            let i = new TestComponent();
            i.init();
            sEql(i.element.outerHTML, '<div>1</div>');

            class SubComponent extends TestComponent {
                get defaults() { return Intact.Vdt.utils.extend({}, super.defaults, {a: 2}); }
            }
            i = new SubComponent();
            i.init();
            sEql(i.element.outerHTML, '<div>2</div>');
        });

        it('es6 class with function class extend', () => {
            if (browser.isIE8) return;

            class TestComponent extends Intact {
                @Intact.template()
                get template() { return `<div>aa</div>`; }
            }

            const SubComponent = TestComponent.extend({
                template: `<div><t:parent />bb</div>`
            });

            const i = new SubComponent();
            i.init();
            sEql(i.element.outerHTML, '<div><div>aa</div>bb</div>');

            class GrandSubComponent extends SubComponent {
                @Intact.template()
                static template = `<div><t:parent /></div>`;
            }
            const j = new GrandSubComponent();
            j.init();
            sEql(j.element.outerHTML, '<div><div><div>aa</div>bb</div></div>');
        });

        it('es6 class with static template', () => {
            if (browser.isIE8) return;

            class TestComponent extends Intact {
                @Intact.template()
                static template = '<div>aa</div>';
            }
            class SubComponent extends TestComponent {
                @Intact.template()
                static template = `<div><t:parent />bb</div>`
            }
            const i = new SubComponent();
            i.init();
            sEql(i.element.outerHTML, '<div><div>aa</div>bb</div>');
        });

        it('es6 class inherit static template default', () => {
            if (browser.isIE8) return;

            class TestComponent extends Intact {
                @Intact.template()
                static template = '<div>aa</div>';
            }
            class SubComponent extends TestComponent {
            }
            const i = new SubComponent();
            i.init();
            sEql(i.element.outerHTML, '<div>aa</div>');
        });

        it('es6 class with static template and prototype template', () => {
            if (browser.isIE8) return;

            class TestComponent extends Intact {
                @Intact.template()
                static template = '<div>aa</div>';
            }
            class SubComponent extends TestComponent {
                @Intact.template()
                get template() { return `<div><t:parent />bb</div>`; }
            }
            const i = new SubComponent();
            i.init();
            sEql(i.element.outerHTML, '<div><div>aa</div>bb</div>');
        });

        it('es6 class with prototype template and static template', () => {
            if (browser.isIE8) return;

            class TestComponent extends Intact {
                @Intact.template()
                get template() { return '<div>aa</div>'; }
            }
            class SubComponent extends TestComponent {
                @Intact.template()
                static template = `<div><t:parent />bb</div>`;
            }
            const i = new SubComponent();
            i.init();
            sEql(i.element.outerHTML, '<div><div>aa</div>bb</div>');
        });

        it('es6 class static template with extend method', () => {
            if (browser.isIE8) return;

            class TestComponent extends Intact {
                @Intact.template()
                static template = '<div>aa</div>';
            }
            const SubComponent = TestComponent.extend({
                template: '<div><t:parent />bb</div>'
            });
            const i = new SubComponent();
            i.init();
            sEql(i.element.outerHTML, '<div><div>aa</div>bb</div>');
        });

        it('defaults can be function', () => {
            const C = Intact.extend({
                defaults() {
                    return {
                        a: 1,
                        b: 2
                    };
                },
                template: '<div></div>'
            });
            const i = new C({c: 3});
            sEql(i.get('a'), 1);
            sEql(i.get('b'), 2);
            sEql(i.get('c'), 3);

            const D = C.extend({
                defaults() {
                    return extend(this._super(), {
                        d: 4
                    });
                },
                template: '<div></div>'
            });
            const j = new D({c: 4});
            sEql(isEqual(j.get(), {a: 1, b: 2, c: 4, d: 4}), true);
        });

        it('parent template can be used in child template', () => {
            const C = Intact.extend({
                template: '<div><b:a>c</b:a></div>'
            });
            const D = C.extend({
                template: `
                    <t:parent>
                        <b:a>{parent()}d</b:a>
                    </t:parent>
                `
            });
            const DD = D.extend({
                template: `
                    <t:parent>
                        <b:a>{parent()} dd</b:a>
                    </t:parent>
                `
            });

            const d = new D();
            eqlOuterHtml(d.init(), '<div>cd</div>');
            const dd = new DD();
            eqlOuterHtml(dd.init(), '<div>cd dd</div>');

            if (browser.isIE8) return;

            class E extends Intact {
                @Intact.template()
                get template() {
                    return '<div><b:a>e</b:a></div>';
                }
            }
            class F extends E {
                @Intact.template()
                get template() {
                    return `
                        <t:parent>
                            <b:a>{parent()}f</b:a>
                        </t:parent>
                    `;
                }
            }
            class FF extends F {
                @Intact.template()
                get template() {
                    return `
                        <t:parent>
                            <b:a>{parent()} ff</b:a>
                        </t:parent>
                    `;
                }
            }

            const f = new F();
            sEql(f.init().outerHTML, '<div>ef</div>');
            const ff = new FF();
            sEql(ff.init().outerHTML, '<div>ef ff</div>');

            class G extends Intact {
                @Intact.template()
                get template() {
                    return Intact.Vdt.compile(`
                        <div><b:a>1</b:a></div>
                    `);
                }
            }
            class GG extends G {
                @Intact.template()
                get template() {
                    return `
                        <t:parent>
                            <b:a>{parent()}2</b:a>
                        </t:parent>
                    `;
                }
            }
            class GGG extends GG {
                @Intact.template()
                get template() {
                    return Intact.Vdt.compile(`
                        <t:parent>
                            <b:a>{parent()}3</b:a>
                        </t:parent>
                    `);
                }
            }
            eqlOuterHtml(new GG().init(), '<div>12</div>');
            eqlOuterHtml(new GGG().init(), '<div>123</div>');
        });
    });

    describe('Intact.mount', function() {
        let container;
        let Component;
        let html = '<div>a</div>';
        let mount;

        beforeEach(() => {
            container = document.createElement('div');
            document.body.appendChild(container);

            mount = sinon.spy();
            Component = Intact.extend({
                template: html,
                _mount: mount
            });
        });

        afterEach(() => {
            document.body.removeChild(container);
        });

        function reset() {
            container.innerHTML = '';
        }

        it('should mount component', () => {
            let instance = Intact.mount(Component, container);
            eqlHtml(container, html);
            sEql(mount.callCount, 1);
            sEql(instance.mounted, true);
        });

        it('should mount sub-component', () => {
            let SubComponent = Component.extend();
            let instance = Intact.mount(SubComponent, container);
            eqlHtml(container, html);
            sEql(mount.callCount, 1);
            sEql(instance.mounted, true);
        });
    });

    describe('Method', function() {
        var instance;

        beforeEach(function() {
            var Component = Intact.extend({
                defaults() {
                    return {
                        a: 1,
                        bb: {
                            bb: 2
                        },
                        cc: [
                            {cc: 2}
                        ],
                        'a.a': 1,
                        b: {
                            'b.b': 1
                        },
                        d: {
                            'd.d': {
                                d: 1
                            }
                        }
                    }
                },

                template: '<div>{JSON.stringify(self.get("a"))}</div>'
            });
            instance = new Component({c: 3});
        });

        it('init', function() {
            var element = instance.init();
            sEql(instance.element, element);
            const div = document.createElement('div');
            div.appendChild(element);
            eqlHtml(div, '<div>1</div>');
            sEql(instance.inited, true);
            sEql(instance.rendered, true);
            sEql(instance.mounted, false);
        });

        it('update', function() {
            instance.init(); 
            instance.set({a: 3}, {silent: true});
            sEql(instance.element.innerHTML, '1');
            instance.update();
            sEql(instance.element.innerHTML, '3');
            instance.set({a: 4});
            sEql(instance.element.innerHTML, '4');
        });

        it('get', function() {
            sEql(instance.get('a'), 1);
            sEql(instance.get('aa'), undefined);
            sEql(instance.get().hasOwnProperty('c'), true);
            sEql(instance.get('bb.bb'), 2);
            sEql(instance.get('cc[0].cc'), 2);
            sEql(instance.get('aa.aa.aa'), undefined);
            sEql(instance.get('aa.aa.aa', 'a'), 'a');
            sEql(instance.get('a.a'), 1);
            sEql(instance.get('b["b.b"]'), 1);
            sEql(instance.get(`d['d.d'].d`), 1);
        });

        it('set sync', function() {
            instance.init();

            const $changeA = sinon.spy();
            instance.on('$change:a', $changeA);
            instance.set('a', 2);
            sEql(instance.get('a'), 2);
            sEql($changeA.callCount, 1);
            sEql($changeA.calledWith(instance, 2, 1), true);
            instance.set({a: 11});
            sEql(instance.get('a'), 11);
            sEql($changeA.callCount, 2);
            sEql($changeA.calledWith(instance, 11, 2), true);

            const $change_aa_a = sinon.spy();
            const $change_aa = sinon.spy();
            const $change = sinon.spy();
            const $changed_aa_a = sinon.spy();
            const $changed_aa = sinon.spy();
            const $changed = sinon.spy();
            instance.on('$change:aa.a', $change_aa_a);
            instance.on('$change:aa', $change_aa);
            instance.on('$change', $change);
            instance.on('$changed:aa.a', $changed_aa_a);
            instance.on('$changed:aa', $changed_aa);
            instance.on('$changed', $changed);
            instance.set({'aa.a': 1});
            sEql(instance.get('aa.a'), 1);
            dEql(instance.get('aa'), {a: 1});
            sEql($change_aa_a.callCount, 1);
            sEql($change_aa.callCount, 1);
            sEql($change.callCount, 1);
            sEql($changed_aa_a.callCount, 1);
            sEql($changed_aa.callCount, 1);
            sEql($changed.callCount, 1);

            instance.set('aaa.a', 1);
            dEql(instance.get('aaa'), {a: 1});

            const $change_a$a = sinon.spy();
            instance.on('$change:["a.a"]', $change_a$a);
            instance.set('a.a', 2);
            sEql(instance.get('a'), 11);
            sEql(instance.get('a.a'), 2);
            sEql($change_a$a.callCount, 1);

            instance.set('b["b.b"]', 2);
            dEql(instance.get('b'), {'b.b': 2});
            instance.set(`b['b.b']`, 3);
            dEql(instance.get('b'), {'b.b': 3});
            instance.set(`d['d.d'].d`, 2);
            dEql(instance.get('d'), {'d.d': {d: 2}});
        });

        it('set async', function(done) {
            instance.init();
            instance._update = sinon.spy(function() {  });
            const aFn = sinon.spy(function() {  });
            const bFn = sinon.spy(function() {  });
            instance.on('$changed:a', aFn);
            instance.on('$changed:b', bFn);

            instance.set('a', 10, {async: true});
            instance.set('b', 20, {async: true});
            sEql(instance._update.callCount, 0);
            sEql(aFn.callCount, 0);
            sEql(bFn.callCount, 0);
            setTimeout(() => {
                sEql(instance._update.callCount, 1);
                sEql(aFn.callCount, 1);
                sEql(bFn.callCount, 1);

                instance.set('a', 11, {async: true});
                instance.set('b', 21, {async: true});
                setTimeout(() => {
                    sEql(instance._update.callCount, 2);
                    sEql(aFn.callCount, 2);
                    sEql(bFn.callCount, 2);

                    done();
                });
            });
        });

        it('set with path object', function() {
            instance.init();
            const $change_a_b = sinon.spy();
            const $change_a_c = sinon.spy();
            const $change_a = sinon.spy();
            const $change_a_a = sinon.spy();
            const $change = sinon.spy();
            instance.on('$change:a.b', $change_a_b);
            instance.on('$change:a.c', $change_a_c);
            instance.on('$change:a', $change_a);
            instance.on('$change:["a.a"]', $change_a_a);
            instance.on('$change', $change);
            instance.set({
                'a.b': 1,
                'a.c': 2,
                'a.a': 2,
            });
            dEql(instance.get('a'), {b: 1, c: 2});
            sEql(instance.get('a.a'), 2);
            sEql(instance.get('a.b'), 1);
            sEql($change_a_b.callCount, 1);
            sEql($change_a_c.callCount, 1);
            sEql($change_a.callCount, 1);
            sEql($change_a_a.callCount, 1);
            sEql($change.callCount, 1);

            // order
            sEql($change_a_b.calledBefore($change_a_c), true);
            sEql($change_a_c.calledBefore($change_a), true);
            sEql($change_a.calledBefore($change_a_a), true);
            sEql($change_a_a.calledBefore($change), true);
        });
    });

    describe('Lifecycle', function() {
        var _init, _beforeCreate, _create, _mount, _update, _beforeUpdate, _destroy,
            Component, instance;
        beforeEach(function() {
            _init = sinon.spy();
            _beforeCreate = sinon.spy();
            _create = sinon.spy();
            _mount = sinon.spy();
            _update = sinon.spy();
            _beforeUpdate = sinon.spy();
            _destroy = sinon.spy();
            Component = Intact.extend({
                template: '<i></i>',
                _init: _init,
                _beforeCreate: _beforeCreate,
                _create: _create,
                _mount: _mount,
                _update: _update,
                _beforeUpdate: _beforeUpdate,
                _destroy: _destroy
            });
        });
        var assert = function(a, b, c, d, e, f, g) {
            sEql(_init.callCount, a);
            sEql(_beforeCreate.callCount, b);
            sEql(_create.callCount, c);
            sEql(_beforeUpdate.callCount, d);
            sEql(_update.callCount, e);
            sEql(_destroy.callCount, f);
            sEql(_mount.callCount, g);
        };

        it('_init', function() {
            var instance = new Component();
            assert(1, 0, 0, 0, 0, 0, 0);
        });

        it('_create', function() {
            var instance = new Component();
            instance.init();
            assert(1, 1, 1, 0, 0, 0, 0);
        });

        it('_mount', function() {
            var instance = new Component();
            instance.init();
            instance.mount();
            assert(1, 1, 1, 0, 0, 0, 1);
        });

        it('_udpate', function() {
            var instance = new Component();
            instance.init();
            instance.set({a: 1});
            assert(1, 1, 1, 1, 1, 0, 0);
            instance.set({a: 2});
            assert(1, 1, 1, 2, 2, 0, 0);
            instance.set({a: 3}, {silent: true});
            assert(1, 1, 1, 2, 2, 0, 0);
        });

        it('_destroy', function() {
            var instance = new Component();
            instance.init();
            instance.destroy();
            assert(1, 1, 1, 0, 0, 1, 0);
        });
    });

    describe('Event', function() {
        var Component;
        beforeEach(function() {
            Component = Intact.extend({
                defaults: {a: 1},
                template: '<i>{self.get("a")}</i>'
            });
        });

        it('add event listener by `on` method', function() {
            var instance = new Component(),
                testFn = sinon.spy();            

            instance.on('test', testFn);
            instance.trigger('test', 1, 2, [3]);
            sEql(testFn.callCount, 1);
            sEql(testFn.calledWith(1, 2, [3]), true);
            sEql(testFn.calledOn(instance), true);
        });

        it('add event listener by `ev-*` property', function() {
            var testFn = sinon.spy(),
                instance = new Component({
                    'ev-test': testFn 
                });

            instance.trigger('test', 1, 2, [3]);
            sEql(testFn.callCount, 1);
            sEql(testFn.calledWith(1, 2, [3]), true);
            sEql(testFn.calledOn(instance), true);
        });

        it('should trigger $receive event when init', function() {
            const fn = sinon.spy();
            const fnReceive = sinon.spy((...args) => console.log(args));
            const A = Intact.extend({
                template: `<div></div>`,
                _init() {
                    this.on('$receive:a', fn);
                    this.on('$receive', fnReceive);
                }
            });

            const a = new A({a: 1});
            sEql(fn.callCount, 1);
            sEql(fnReceive.callCount, 1);
            sEql(fnReceive.calledAfter(fn), true);
            sEql(fnReceive.calledWith(a, ['a']), true);
        });

        it('should trigger $receive event when received a different prop', function() {
            var testFn = sinon.spy();
            const receiveFn= sinon.spy();
            var C = Intact.extend({
                template: `<div></div>`,
                _init: function() {
                    this.on('$receive:a', testFn);
                    this.on('$receive', receiveFn);
                }
            });
            var Component = Intact.extend({
                template: 'var C = self.C; <C a={self.get("a")} />',
                _init: function() {
                    this.C = C;
                }
            });

            var instance = new Component();
            instance.init();
            sEql(testFn.callCount, 1);
            sEql(receiveFn.callCount, 1);
            instance.set('a', 1);
            sEql(testFn.callCount, 2);
            sEql(receiveFn.callCount, 2);
            instance.set('a', 2);
            sEql(testFn.callCount, 3);
            sEql(receiveFn.callCount, 3);
            instance.update();
            sEql(testFn.callCount, 3);
            sEql(receiveFn.callCount, 3);
        });

        it('change attributes to trigger change event', function() {
            var changeFn = sinon.spy(),
                changeAFn = sinon.spy(),
                instance = new Component();

            instance.on('$change', changeFn);
            instance.on('$change:a', changeAFn);
            instance.set('a', 2);
            sEql(changeAFn.calledOnce, true);
            sEql(changeFn.calledOnce, true);
            sEql(changeAFn.calledBefore(changeFn), true);
            sEql(changeAFn.calledWith(instance, 2), true);
            sEql(changeFn.calledWith(instance), true);

            instance.set('a', 2);
            sEql(changeAFn.calledOnce, true);
            sEql(changeFn.calledOnce, true);

            instance.set('a', 3, {silent: true});
            sEql(changeAFn.calledOnce, true);
            sEql(changeFn.calledOnce, true);

            instance.set('a', 4, {global: false});
            sEql(changeAFn.callCount, 2);
            sEql(changeFn.callCount, 2);

            instance.set({a: 5}, {silent: true, global: true});
            sEql(changeAFn.callCount, 2);
            sEql(changeFn.callCount, 2);

            instance.set({a: 6}, {update: false});
            sEql(changeAFn.callCount, 3);
            sEql(changeFn.callCount, 3);
            
            var changePathAAFn = sinon.spy(),
                changePathAAAFn = sinon.spy();
            instance.on('$change:aa', changePathAAFn);
            instance.on('$change:aa.a', changePathAAAFn);
            instance.set('aa.a', 1);
            sEql(changePathAAFn.callCount, 1);
            sEql(changePathAAAFn.callCount, 1);
            sEql(changePathAAAFn.calledBefore(changePathAAFn), true);
            sEql(changeFn.callCount, 4);
            sEql(changePathAAAFn.calledWith(instance, 1), true);
            sEql(changePathAAFn.calledWith(instance, {a: 1}), true);
        });

        it('off event', function() {
            var testFn = sinon.spy(),
                changeFn = sinon.spy(),
                instance = new Component({
                    'ev-$change': changeFn,
                    'ev-test': testFn
                }),
                test2Fn = sinon.spy();

            instance.on('test', test2Fn);

            instance.off('test', testFn);
            instance.trigger('test');
            sEql(testFn.called, false);
            sEql(test2Fn.calledOnce, true);

            instance.off('test');
            instance.trigger('test');
            sEql(testFn.called, false);
            sEql(test2Fn.calledOnce, true);
            
            instance.off();
            instance.trigger('$change');
            sEql(changeFn.called, false);
        });

        it('should keep the kept events when destroyed', () => {
            const testFn = sinon.spy();
            const instance = new Component({
                'ev-test': testFn
            });
            instance.on('test', testFn, {keep: true});

            instance.trigger('test');
            sEql(testFn.callCount, 2);

            instance.destroy();
            instance.trigger('test');
            sEql(testFn.callCount, 3);
        });

        it('should trigger $inited event when instantiate', function() {
            var testFn = sinon.spy(),
                instance = new Component({
                    'ev-$inited': testFn
                });
            sEql(testFn.calledOnce, true);
            sEql(testFn.calledWith(instance), true);
            sEql(testFn.calledOn(instance), true);
        });

        it('should trigger $rendered event when init', function() {
            var testFn = sinon.spy(),
                instance = new Component();
            instance.on('$rendered', testFn);
            instance.init();
            sEql(testFn.calledOnce, true);
            sEql(testFn.calledWith(instance), true);
            sEql(testFn.calledOn(instance), true);
        });

        it('should trigger $changed event even if we update in updating', () => {
            const fn = sinon.spy();
            const Component = Intact.extend({
                template: `<div>{self.get('a')}</div>`,
                _init() {
                    this.on('$changed:a', fn)
                    this.on('$change:a', () => {
                        this.update();
                    });
                }
            });
            const C = Intact.extend({
                template: `<Component a={self.get('a')} />`,
                _init() {
                    this.Component = Component;
                }
            });
            const instance = Intact.mount(C, document.body);
            instance.set('a', 2);
            sEql(fn.callCount, 1);
            document.body.removeChild(instance.element);
        });
    });

    describe('v-model', function() {
        it('should handle v-model for input correctly', function() {
            var Component = Intact.extend({
                template: '<input v-model="a" />'
            });

            var instance = new Component();
            var dom = instance.init();
            document.body.appendChild(dom);
            instance.set('a', '1');
            sEql(dom.value, '1');

            dom.value = '123';
            if (browser.isIE8) {
                dispatchEvent(dom, 'propertychange');
            } else {
                dispatchEvent(dom, 'input');
            }
            sEql(instance.get('a'), '123');

            document.body.removeChild(dom);
        });

        it('should handle v-model for single select correctly', function() {
            var Component = Intact.extend({
                defaults: {
                    list: [1, '2', '3']
                },
                template: `<select v-model="a">
                    <option 
                        v-for={self.get("list")}
                        value={value}
                    >{value}</option>
                </select>`
            });

            var instance = new Component();
            var dom = instance.init();
            document.body.appendChild(dom);

            // if (isSafari) {
                // sEql(dom.value, '1');
            // } else {
                // sEql(dom.value, '');
            // }

            instance.set('a', '2');
            sEql(dom.value, '2');

            dom.value = '1';
            dispatchEvent(dom, 'change');
            sEql(instance.get('a'), 1);

            document.body.removeChild(dom);
        });

        it('should handle v-model for multiple select correctly', function() {
            var Component = Intact.extend({
                defaults: {
                    list: [1, '2', '3']
                },
                template: '<select v-model="a" multiple={true}><option v-for={self.get("list")} value={value}>{value}</option></select>'
            });

            var instance = new Component();
            var dom = instance.init();
            document.body.appendChild(dom);
            window._i = instance;

            // if (isSafari) {
                // sEql(dom.value, '1');
            // } else {
                // sEql(dom.value, '');
            // }

            instance.set('a', [1, '2', 3]);
            each([true, true, false], (item, index) => {
                sEql(dom.options[index].selected, item);
            });

            dom.options[0].selected = true;
            dom.options[1].selected = false;
            dom.options[2].selected = true;
            dispatchEvent(dom, 'change');
            dEql(instance.get('a'), [1, '3']);

            document.body.removeChild(dom);
        });

        it('should handle v-model for component correctly', function() {
            var SubComponent = Intact.extend({
                template: '<div>{self.get("value")}</div>'
            });
            var Component = Intact.extend({
                template: '<SubComponent v-model="a" ref={function(i) {self.sub = i}}/>',
                _init: function() {
                    this.SubComponent = SubComponent;
                }
            });

            var instance = Intact.mount(Component, document.body);
            var dom = instance.element;

            instance.set('a', 1);
            sEql(dom.firstChild.nodeValue, '1');
            sEql(instance.sub.get('value'), 1);

            instance.sub.set('value', 2);
            sEql(instance.get('a'), 2);

            document.body.removeChild(dom);
        });

        it('v-model:{name}', function() {
            const Component = Intact.extend({
                template: `<div>{self.get('name')}</div>`,
            });

            const Page = Intact.extend({
                template: `<C v-model:name="name" ref="c" />`,
                defaults() {
                    return {name: 'test'}
                },
                _init() {
                    this.C = Component;
                }
            });

            const i = Intact.mount(Page, document.body);
            const dom = i.element;

            eqlOuterHtml(dom, '<div>test</div>');

            i.set('name', 'a');
            eqlOuterHtml(dom, '<div>a</div>');

            i.refs.c.set('name', 'b');
            eqlOuterHtml(dom, '<div>b</div>');
            sEql(i.get('name'), 'b');

            document.body.removeChild(dom);
        });
    });

    describe('validate props', () => {
        if (browser.isIE8) return;

        const A = Intact.extend({
            template: `<div></div>`,
            displayName: 'A',
        });
        A.propTypes = {
            a: Boolean,
            b: {
                type: Number,
                required: true
            },
            c: String,
            d: Array,
            e: Object,
            f: Date,
            g: Function,
            h: {
                validator: (value) => value === 1
            },
            i: A,
            j: [Array, Number],
            // k: Symbol,
            l: ['default', 'primary', 'danger', 1],
        };

        const error = console.error;
        beforeEach(() => {
            console.error = function(msg) {
                error.call(console, msg);
                throw new Error(msg); 
            }
        });

        afterEach(() => {
            console.error = error;
        });

        it('should warn when pass invalid prop', () => {
            function test(props, msg) {
                if (msg) {
                    assert.throws(
                        () => new A(props),
                        new RegExp(msg)
                    );
                } else {
                    assert.doesNotThrow(() => new A(props));
                }
            }

            test({a: 1}, 'Invalid type of prop "a" on component "A". Expected Boolean, but got Number.');
            test({a: true}, 'Missing required prop on component "A": "b".');
            test({b: true}, 'Invalid type of prop "b" on component "A". Expected Number, but got Boolean.');
            test({b: 1, c: 1}, 'Invalid type of prop "c" on component "A". Expected String, but got Number.');
            test({b: 1, d: 1}, 'Invalid type of prop "d" on component "A". Expected Array, but got Number.');
            test({b: 1, e: []}, 'Invalid type of prop "e" on component "A". Expected Object, but got Array.');
            test({b: 1, f: 2}, 'Invalid type of prop "f" on component "A". Expected Date, but got Number');
            test({b: 1, g: {}}, 'Invalid type of prop "g" on component "A". Expected Function, but got Object.');
            test({b: 1, h: 2}, 'Invalid prop "h" on component "A": custom validator check failed.');
            test({b: 1, i: () => {}}, 'Invalid type of prop "i" on component "A". Expected Child, but got Function.');
            test({b: 1, j: 'a'}, 'Invalid type of prop "j" on component "A". Expected Array, Number, but got String.');
            // test({b: 1, k: 'a'}, 'Invalid type of prop "k" on component "A". Expected Symbol, but got String.');
            test({b: 1, l: 'test'}, 'Invalid type of prop "l" on component "A". Expected "default", "primary", "danger", 1, but got "test".');
            test({b: 1, l: 2}, 'Invalid type of prop "l" on component "A". Expected "default", "primary", "danger", 1, but got 2.');

            test({b: 1});
            test({b: 1, a: true});
            test({b: 1, c: '1'});
            test({b: 1, d: []});
            test({b: 1, e: {}});
            test({b: 1, f: new Date()});
            test({b: 1, g: () => {}});
            test({b: 1, h: 1});
            test({b: 1, i: new A({b: 1})});
            test({b: 1, j: 1});
            test({b: 1, j: []});
            // test({b: 1, k: Symbol()});
            test({b: 1, l: 'primary'});
            test({b: 1, l: 1});
        });

        it('should warn when pass invalid prop on update', () => {
            const B = Intact.extend({
                template: `h(A, extend({}, self.get()))`,
                displayName: 'B',
                _init() {
                    this.A = A;
                }
            });
            function test(props, msg) {
                if (msg) {
                    assert.throws(
                        () => {
                            const b = new B({b: 2})
                            b.init();
                            b.set(props);
                        },
                        new RegExp(msg)
                    );
                } else {
                    assert.doesNotThrow(() => {
                        const b = new B({b: 2});
                        b.init();
                        b.set(props);
                    });
                }
            }

            test({a: 1}, 'Invalid type of prop "a" on component "A". Expected Boolean, but got Number.');
            test({a: true, b: null}, 'Missing required prop on component "A": "b".');
            test({b: true}, 'Invalid type of prop "b" on component "A". Expected Number, but got Boolean.');
            test({b: 1, c: 1}, 'Invalid type of prop "c" on component "A". Expected String, but got Number.');
            test({b: 1, d: 1}, 'Invalid type of prop "d" on component "A". Expected Array, but got Number.');
            test({b: 1, e: []}, 'Invalid type of prop "e" on component "A". Expected Object, but got Array.');
            test({b: 1, f: 2}, 'Invalid type of prop "f" on component "A". Expected Date, but got Number');
            test({b: 1, g: {}}, 'Invalid type of prop "g" on component "A". Expected Function, but got Object.');
            test({b: 1, h: 2}, 'Invalid prop "h" on component "A": custom validator check failed.');
            test({b: 1, i: () => {}}, 'Invalid type of prop "i" on component "A". Expected Child, but got Function.');
            test({b: 1, j: 'a'}, 'Invalid type of prop "j" on component "A". Expected Array, Number, but got String.');
            // test({b: 1, k: 'a'}, 'Invalid type of prop "k" on component "A". Expected Symbol, but got String.');
            test({b: 1, l: 'test'}, 'Invalid type of prop "l" on component "A". Expected "default", "primary", "danger", 1, but got "test".');
            test({b: 1, l: 2}, 'Invalid type of prop "l" on component "A". Expected "default", "primary", "danger", 1, but got 2.');

            test({b: 1});
            test({b: 1, a: true});
            test({b: 1, c: '1'});
            test({b: 1, d: []});
            test({b: 1, e: {}});
            test({b: 1, f: new Date()});
            test({b: 1, g: () => {}});
            test({b: 1, h: 1});
            test({b: 1, i: new A({b: 1})});
            test({b: 1, j: 1});
            test({b: 1, j: []});
            // test({b: 1, k: Symbol()});
            test({b: 1, l: 'primary'});
            test({b: 1, l: 1});
        });
    });
});
