import {h, hc, render} from '../src';
import assert from 'assert';
import {innerHTML, eqlHtml, dispatchEvent, isIE8} from './utils';
import {MountedQueue, svgNS, browser, indexOf} from '../src/utils';

class ClassComponent {
    constructor(props) {
        this.props = props || {};
    }
    init() {
        return render(h('span', this.props, this.props.children));
    }
}

function FunctionComponent(props) {
    return h('p', {
        className: props.className
    }, props.children);
}

describe('Render', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        // document.body.removeChild(container);
    });

    function reset() {
        container.innerHTML = '';
    }
    function r(vNode) {
        reset();
        render(vNode, container);
    }
    function eql(vNode, html, ie8Html) {
        r(vNode);
        eqlHtml(container, html, ie8Html);
    }
    function eqlObj(vNode, obj) {
        r(vNode);
        const node = container.firstChild;
        if (obj.tag) {
            assert.strictEqual(node.tagName.toLowerCase(), obj.tag);
        }
        if (obj.props) {
            for (let i in obj.props) {
                assert.strictEqual(node.getAttribute(i), obj.props[i]);
            }
        }
    }

    it('render null', () => {
        eql(null, '');
    });

    it('render div', () => {
        eql(h('div'), '<div></div>');
        assert.strictEqual(container.children.length, 1);
    });

    it('render comment', () => {
        eql(hc('comment'), '<!--comment-->');
    });

    it('render invalid node should throw an error', () => {
        assert.throws(function() {eql(h('div', null, true));});
    });

    it('render properties', () => {
        const div = h('div', {test: 'test', className: 'test'});
        eqlObj(div, {tag: 'div', props: {'class': 'test', test: 'test'}});
        assert.strictEqual(container.children.length, 1);
    });

    it('render style', () => {
        // the ';' at last is missing in ie
        const style = 'color: red; font-size: 20px';
        r(h('div', {style: 'color: red; font-size: 20px'}));
        assert.strictEqual(
            indexOf(
                [style, 'font-size: 20px; color: red'],
                container.firstChild.getAttribute('style')
                    .toLowerCase().substr(0, style.length)
            ) > -1,
            true
        );

        r(h('div', {style: {color: 'red', fontSize: '20px'}}));
        assert.strictEqual(
            indexOf(
                [style, 'font-size: 20px; color: red'],
                container.firstChild.getAttribute('style')
                    .toLowerCase().substr(0, style.length)
            ) > -1,
            true
        );
    });

    it('render dataset', () => {
        eqlObj(
            h('div', {dataset: {a: 1, b: 'b', aA: 'a'}}),
            {
                tag: 'div',
                props: {
                    'data-a': '1',
                    'data-b': 'b',
                    'data-a-a': 'a'
                }
            }
        );
    });

    it('render attributes', () => {
        eqlObj(
            h('div', {attributes: {a: 1, b: 'b'}}),
            {tag: 'div', props: {a: '1', b: 'b'}}
        );
    });

    it('render object property', () => {
        eql(
            h('div', {a: {b: 1}}),
            '<div></div>'
        );
        assert.strictEqual(container.firstChild.a.b, 1);
    });

    it('render children', () => {
        eql(
            h('div', {className: 'test'}, 'test'),
            '<div class="test">test</div>'
        );
        eql(
            h('div', null, ['text', 0]),
            '<div>text0</div>'
        );
        eql(
            h('div', null, ['text', h('div')]),
            '<div>text<div></div></div>',
            '<div>text\r\n<div></div></div>'
        );
        eql(
            h('div', {}, [undefined, 'text']),
            '<div>text</div>'
        );
    });

    it('render empty array children', () => {
        eql(
            h('div', null, []),
            '<div></div>'
        );
    });

    it('render nested children', () => {
        eql(
            h('div', null, [['text', [h('div')]]]),
            '<div>text<div></div></div>',
            '<div>text\r\n<div></div></div>'
        );
    });

    it('render function component children', () => {
        function Component(props) {
            return h('span', {
                className: props.className
            }, props.children);
        }
        eql(
            h('div', null, h(Component, {
                className: 'component',
                children: 'text'
            })),
            '<div><span class="component">text</span></div>'
        );
        eql(
            h('div', null, h(Component, {
                className: 'component'
            })),
            '<div><span class="component"></span></div>'
        );
        eql(
            h('div', null, h(Component, {
                className: 'component',
                children: h(Component)
            })),
            '<div><span class="component"><span></span></span></div>'
        );
    });

    it('render class component children', () => {
        class Component {
            constructor(props) {
                this.props = props;
            }
            init() {
                return render(h('span', this.props, this.props.children));
            }
        }
        eql(
            h('div', null, h(Component, {
                className: 'test'
            })),
            '<div><span class="test"></span></div>'
        );
        eql(
            h('div', null, h(Component, {
                className: 'test',
                children: 'text'
            })),
            '<div><span class="test">text</span></div>'
        );
        eql(
            h('div', null, h(Component, {
                className: 'test',
                children: h(Component)
            })),
            '<div><span class="test"><span></span></span></div>'
        );
        eql(
            h('div', null, h(Component, {
                className: 'test'
            }, h(Component))),
            '<div><span class="test"><span></span></span></div>'
        );
        eql(
            h('div', null, h(Component, {
                className: 'test',
                children: 'ignore'
            }, h(Component))),
            '<div><span class="test"><span></span></span></div>'
        );
        eql(
            h('div', null, h(Component, null, 'a')),
            '<div><span>a</span></div>'
        );
        eql(
            h('div', null, h(Component)),
            '<div><span></span></div>'
        );
    });

    it('render class component in function component', () => {
        eql(
            h('div', null, h(FunctionComponent, {
                children: [
                    h(ClassComponent),
                    h('i')
                ]
            })),
            '<div><p><span></span><i></i></p></div>',
            '<div>\r\n<p><span></span><i></i></p></div>'
        );
    });

    it('render function component in class component', () => {
        eql(
            h('div', null, h(ClassComponent, {
                children: [
                    h(FunctionComponent),
                    h('i')
                ]
            })),
            '<div><span><p></p><i></i></span></div>',
            '<div><span>\r\n<p></p><i></i></span></div>'
        );
    });

    it('render function component which return an array', () => {
        function C(props) {
            return [h('div', null, null, props.className), h('span', null, null, props.className)];
        }
        eql(
            h('div', null, h(C, {className: 'a'})),
            '<div><div class="a"></div><span class="a"></span></div>',
            '<div>\r\n<div class="a"></div><span class="a"></span></div>'
        );
    });

    it('render div with ref', () => {
        const o = {};
        eql(
            h('div', {ref: (dom) => o.dom = dom, className: 'test'}),
            '<div class="test"></div>'
        );
        assert.strictEqual(o.dom, container.firstChild);
    });

    it('render function component with ref', () => {
        const o = {};
        function C(props) {
            return h('span', props, props.children);
        }
        eql(
            h(C, {
                ref: (dom) => o.dom = dom,
                className: 'test',
                children: 'text'
            }),
            '<span class="test">text</span>'
        );
        assert.strictEqual(o.dom, container.firstChild);
    });

    it('render class component with ref', () => {
        const o = {};
        class C {
            constructor(props) {
                this.props = props;
            }
            init() {
                o._instance = this;
                return render(h('span', this.props, this.props.children));
            }
        }
        eql(
            h(C, {
                ref: (instance) => o.instance = instance,
                className: 'test',
                children: 'text'
            }),
            '<span class="test">text</span>'
        );
        assert.strictEqual(o.instance, o._instance);
    });

    it('render ref with nested component', () => {
        const o = {};
        eql(
            h(ClassComponent, {
                children: [
                    h('span', {ref: (i) => o.i = i})
                ]
            }),
            '<span><span></span></span>'
        );
        assert.strictEqual(o.i, container.firstChild.firstChild);

        eql(
            h(FunctionComponent, {
                children: [
                    h(ClassComponent, {ref: (i) => o.j = i})
                ]
            }),
            '<p><span></span></p>'
        );
        assert.strictEqual(o.j instanceof ClassComponent, true);
    });

    it('render component instance', () => {
        let i = new ClassComponent();
        eql(
            h('div', null, i),
            '<div><span></span></div>'
        );
        eql(
            h(i),
            '<span></span>'
        );

        i = new ClassComponent({className: 'a'});
        eql(
            h('div', null, [i]),
            '<div><span class="a"></span></div>'
        );

        const o = {};
        i = new ClassComponent({className: 'a', ref: (i) => o.i = i});
        eql(
            h('div', null, i),
            '<div><span class="a"></span></div>'
        );
        assert.strictEqual(o.i === i, true);
    });

    it('render input', () => {
        r(h('input', {value: 0}));
        assert.strictEqual(container.firstChild.value, '0');

        r(h('input', {value: true}));
        assert.strictEqual(container.firstChild.value, 'true');

        r(h('input', {value: false}));
        assert.strictEqual(container.firstChild.value, 'false');

        r(h('input', {value: ''}));
        assert.strictEqual(container.firstChild.value, '');

        r(h('input', {value: '1'}));
        assert.strictEqual(container.firstChild.value, '1');

        r(h('input', {value: undefined}));
        assert.strictEqual(container.firstChild.value, '');

        r(h('input', {value: null}));
        assert.strictEqual(container.firstChild.value, '');
    });

    it('render single select element', () => {
        if (browser.isSafari) return;
        eql(
            h('select', {value: ''}, [
                h('option', {value: 1}, '1'),
                h('option', {value: 2}, '2')
            ]),
            '<select><option value="1">1</option><option value="2">2</option></select>',
            '<select><option value="1" _value="1">1</option><option value="2" _value="2">2</option></select>'
        );
        assert.strictEqual(container.firstChild.value, '');
        assert.strictEqual(container.firstChild.firstChild.selected, false);
        assert.strictEqual(container.firstChild.children[1].selected, false);

        eql(
            h('select', {value: 2}, [
                h('option', {value: 1}, '1'),
                h('option', {value: 2}, '2')
            ]),
            [
                '<select><option value="1">1</option><option value="2">2</option></select>',
                '<select><option value="1" _value="1">1</option><option selected value="2" _value="2">2</option></select>',
                '<select><option value="1" _value="1">1</option><option value="2" selected _value="2">2</option></select>',
            ]
        );
        assert.strictEqual(container.firstChild.value, '2');
        assert.strictEqual(container.firstChild.firstChild.selected, false);
        assert.strictEqual(container.firstChild.children[1].selected, true);

        eql(
            h('select', {defaultValue: 2}, [
                h('option', {value: 1}, '1'),
                h('option', {value: 2}, '2')
            ]),
            [
                '<select><option value="1">1</option><option value="2">2</option></select>',
                '<select><option value="1" _value="1">1</option><option selected value="2" _value="2">2</option></select>',
                '<select><option value="1" _value="1">1</option><option value="2" selected _value="2">2</option></select>'
            ]
        );
        assert.strictEqual(container.firstChild.value, '2');
        assert.strictEqual(container.firstChild.firstChild.selected, false);
        assert.strictEqual(container.firstChild.children[1].selected, true);

        r(
            h('select', {value: '1'}, [
                h('option', {value: 1}, '1'),
                h('option', {value: 2}, '2')
            ])
        );
        assert.strictEqual(container.firstChild.value, '');
        assert.strictEqual(container.firstChild.firstChild.selected, false);
        assert.strictEqual(container.firstChild.children[1].selected, false);
    });

    it('render multiple select element', () => {
        r(
            h('select', {value: 2, multiple: true}, [
                h('option', {value: 1}, '1'),
                h('option', {value: 2}, '2')
            ])
        );
        // FIXME: it can not select the second value in android 4.4 
        assert.strictEqual(container.firstChild.value, '2');
        assert.strictEqual(container.firstChild.firstChild.selected, false);
        assert.strictEqual(container.firstChild.children[1].selected, true);

        r(
            h('select', {value: '', multiple: true}, [
                h('option', {value: 1}, '1'),
                h('option', {value: 2}, '2')
            ])
        );
        assert.strictEqual(container.firstChild.value, '');
        assert.strictEqual(container.firstChild.firstChild.selected, false);
        assert.strictEqual(container.firstChild.children[1].selected, false);

        r(
            h('select', {value: [2], multiple: true}, [
                h('option', {value: 1}, '1'),
                h('option', {value: 2}, '2')
            ])
        );
        assert.strictEqual(container.firstChild.firstChild.selected, false);
        assert.strictEqual(container.firstChild.children[1].selected, true);

        r(
            h('select', {value: [1, 2], multiple: true}, [
                h('option', {value: 1}, '1'),
                h('option', {value: 2}, '2')
            ])
        );
        assert.strictEqual(container.firstChild.firstChild.selected, true);
        assert.strictEqual(container.firstChild.children[1].selected, true);

        r(
            h('select', {value: [1, '2'], multiple: true}, [
                h('option', {value: 1}, '1'),
                h('option', {value: 2}, '2')
            ])
        );
        assert.strictEqual(container.firstChild.firstChild.selected, true);
        assert.strictEqual(container.firstChild.children[1].selected, false);
    });

    describe('Event', () => {
        it('attach event listener', () => {
            const fn = sinon.spy();
            r(h('div', {'ev-click': fn}));
            dispatchEvent(container.firstChild, 'click');
            assert.strictEqual(fn.callCount, 1);
            assert.strictEqual(fn.args[0].length, 1);
            assert.strictEqual(fn.args[0][0].type, 'click');
            assert.strictEqual(fn.args[0][0].target, container.firstChild);
            assert.strictEqual(fn.args[0][0].currentTarget, container.firstChild);

            dispatchEvent(container.firstChild, 'click');
            assert.strictEqual(fn.callCount, 2);
        });

        it('attach event listener by array', () => {
            const fn1 = sinon.spy();
            const fn2 = sinon.spy();
            r(h('div', {'ev-click': [fn1, fn2]}));
            dispatchEvent(container.firstChild, 'click');
            assert.strictEqual(fn1.callCount, 1);
            assert.strictEqual(fn2.callCount, 1);

            dispatchEvent(container.firstChild, 'click');
            assert.strictEqual(fn1.callCount, 2);
            assert.strictEqual(fn2.callCount, 2);
        });

        it('trigger event on child node', () => {
            const fn = sinon.spy();
            r(h('div', {'ev-click': fn}, h('div')));
            dispatchEvent(container.firstChild.firstChild, 'click');
            assert.strictEqual(fn.callCount, 1);
            assert.strictEqual(fn.args[0][0].target, container.firstChild.firstChild);
            assert.strictEqual(fn.args[0][0].currentTarget, container.firstChild);
        });

        it('event bubble', () => {
            const currentTargets = [];
            const fn1 = sinon.spy((e) => currentTargets.push(e.currentTarget));
            const fn2 = sinon.spy((e) => currentTargets.push(e.currentTarget));
            r(h('p', {'ev-click': fn2}, h('span', {'ev-click': fn1})));
            dispatchEvent(container.firstChild.firstChild, 'click');
            assert.strictEqual(fn1.callCount, 1);
            assert.strictEqual(fn2.callCount, 1);
            assert.strictEqual(fn2.calledAfter(fn1), true);
            assert.strictEqual(fn1.args[0][0].target, container.firstChild.firstChild);
            assert.strictEqual(currentTargets[0], container.firstChild.firstChild);
            assert.strictEqual(fn2.args[0][0].target, container.firstChild.firstChild);
            assert.strictEqual(currentTargets[1], container.firstChild);
        });

        it('stop event bubble', () => {
            const fn1 = sinon.spy((e) => e.stopPropagation());
            const fn2 = sinon.spy();
            r(h('p', {'ev-click': fn2}, h('span', {'ev-click': fn1}, 'span')));
            dispatchEvent(container.firstChild.firstChild, 'click');
            assert.strictEqual(fn1.callCount, 1);
            assert.strictEqual(fn2.callCount, 0);
        });

        it('prevent default', () => {
            const url = location.href;
            const fn = sinon.spy((e) => e.preventDefault());
            r(h('a', {'ev-click': fn, href: "https://www.baidu.com"}, 'test'));
            dispatchEvent(container.firstChild, 'click');
            assert.strictEqual(location.href, url);
        });

        it('mouseenter & mouseleave event', () => {
            const fn1 = sinon.spy(() => {});
            const fn2 = sinon.spy(() => {});
            r(h('div', {
                'ev-mouseenter': fn1,
                'ev-mouseleave': fn2 
            }, 'test'));
            dispatchEvent(container.firstChild, 'mouseenter');
            dispatchEvent(container.firstChild, 'mouseleave');
            assert.strictEqual(fn1.callCount, 1);
            assert.strictEqual(fn2.callCount, 1);
        });
    });

    describe('Class Component', () => {
        let C;
        let init;
        let mount;
        let P;
        let pInit;
        let pMount;

        beforeEach(() => {
            init = sinon.spy(function(lastVNode, vNode) {
                return render(h('div', vNode.props, vNode.props.children), null, this.mountedQueue);
            });
            mount = sinon.spy((lastVNode, vNode) => {
                assert.strictEqual(container.firstChild, vNode.dom);
            });
            function CC(props) {
                this.props = props;
            }
            CC.prototype.init = init;
            CC.prototype.mount = mount;
            C = CC;

            pInit = sinon.spy(function(lastVNode, nextVNode) {
                return render(h('div', null, 'test'), null, this.mountedQueue);
            });
            pMount = sinon.spy((lastVNode, nextVNode) => {
                assert.strictEqual(container.firstChild.firstChild, nextVNode.dom);
            });
            function PP(props) {
                this.props = props;
            }
            PP.prototype.init = pInit;
            PP.prototype.mount = pMount;
            P = PP;
        });

        it('init and mount', () => {
            const vNode = h(C, {className: 'test', children: 'text'});
            r(vNode);
            assert.strictEqual(init.callCount, 1);
            assert.strictEqual(init.calledWith(null, vNode), true);
            assert.strictEqual(mount.callCount, 1);
            assert.strictEqual(mount.calledWith(null, vNode), true);
            assert.strictEqual(mount.calledAfter(init), true);
        }); 

        it('mount in nested component', () => {
            const vNode = h(C, {children: h(P)});
            r(vNode);
            assert.strictEqual(pMount.callCount, 1);
        });

        it('mount component in element', () => {
            const vNode = h('div', null, h(P));
            r(vNode);
            assert.strictEqual(pMount.callCount, 1);
        });

        it('mount manually', () => {
            const mountedQueue = new MountedQueue();
            const vNode = h(C);
            reset();
            const dom = render(vNode, null, mountedQueue);
            container.appendChild(dom);
            mountedQueue.trigger();

            assert.strictEqual(mount.callCount, 1);
        });
    });

    describe('SVG', () => {
        if (isIE8) return;

        it('render svg', () => {
            const vNode = h('svg', null, h('circle', {
                cx: 100,
                cy: 50,
                r: 40,
                stroke: 'black',
                'stroke-width': 2,
                fill: 'red'
            }));
            r(vNode);
            assert.strictEqual(container.firstChild.namespaceURI, svgNS);
            assert.strictEqual(container.firstChild.firstChild.namespaceURI, svgNS);
        });

        it('render svg component', () => {
            class SvgComponent {
                constructor(props) {
                    this.props = props;
                }

                init() {
                    return render(h('circle', {
                        cx: 50,
                        cy: 50,
                        r: 50,
                        fill: 'red'
                    }), null, null, null, this.isSVG);
                }
            }
            r(h('svg', null, h(SvgComponent)));
            assert.strictEqual(container.firstChild.firstChild.namespaceURI, svgNS);
        });

        // android 4.4 does not support 
        // it('svg set event', (done) => {
            // if (!browser.isChrome) return done();
            // const vNode = h('svg', null, h('circle', {
                // cx: 100,
                // cy: 50,
                // r: 40,
                // stroke: 'black',
                // 'stroke-width': 2,
                // fill: 'red'
            // }, h('set', {
                // attributeName: 'fill',
                // to: 'blue',
                // begin: 'click'
            // })));
            // r(vNode);
            // dispatchEvent(container.firstChild.firstChild, 'click');
            // setTimeout(() => {
                // assert.strictEqual(
                    // getComputedStyle(container.firstChild.firstChild).fill,
                    // 'rgb(0, 0, 255)'
                // );
                // done();
            // });
        // });

        it('attach event listener', () => {
            const fn = sinon.spy();
            const vNode = h('svg', {'ev-click': fn});
            r(vNode);
            dispatchEvent(container.firstChild, 'click');
            assert.strictEqual(fn.callCount, 1);
            assert.strictEqual(fn.args[0].length, 1);
            assert.strictEqual(fn.args[0][0].type, 'click');
            assert.strictEqual(fn.args[0][0].target, container.firstChild);
            assert.strictEqual(fn.args[0][0].currentTarget, container.firstChild);

            dispatchEvent(container.firstChild, 'click');
            assert.strictEqual(fn.callCount, 2);
        });

    });
});
