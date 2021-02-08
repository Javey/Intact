import {h, hc, render, patch, remove} from '../src';
import {createTextVNode} from '../src/vnode';
import {removeComponentClassOrInstance} from '../src/vdom';
import assert from 'assert';
import {eqlHtml, isIE8, dispatchEvent} from './utils';
import {browser} from '../src/utils';

class ClassComponent {
    constructor(props) {
        this.props = props || {};
    }
    init() { 
        this._vNode = h('span', this.props, this.props.children);
        return this.dom = render(this._vNode);
    }
    update(lastVNode, nextVNode) {
        var oldVnode = this._vNode;
        this._vNode = h('span', nextVNode.props, nextVNode.props.children);
        return this.dom = patch(oldVnode, this._vNode);
    }
    destroy() {
        remove(this._vNode);
    }
} 

class NewComponent {
    constructor(props) {
        this.props = props || {};
    }
    init() {
        return this.dom = render(h('section', this.props, this.props.children));
    }
}


function FunctionComponent(props) {
    return h('p', props, props.children);
}

function NewFunctionComponent(props) {
    return h('article', props, props.children);
}


describe('Patch', () => {
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
    function p(lastVNode, nextVNode) {
        r(lastVNode);
        patch(lastVNode, nextVNode);
    }
    function eql(lastVNode, nextVNode, html, ie8Html) {
        p(lastVNode, nextVNode);
        eqlHtml(container, html, ie8Html);
    }

    function eqlObj(lastVNode, nextVNode, obj) {
        p(lastVNode, nextVNode);
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

    function sEql(a, b) {
        assert.strictEqual(a, b);
    }

    it('patch elements', () => {
        eql(
            h('div'),
            h('span'),
            '<span></span>'
        );

        eql(
            h('div', null, h('span')),
            h('div', null, h('div')),
            '<div><div></div></div>',
            '<div>\r\n<div></div></div>'
        );
    });

    it('patch text with vnode', () => {
        eql(
            h('div', null, 'test'),
            h('div', null, h('span')),
            '<div><span></span></div>',
            '<div><span></span>&nbsp;</div>'
        );
    });

    it('patch empty children', () => {
        eql(
            h('div', null, [undefined]),
            h('div', null, [null]),
            '<div></div>'
        );

        eql(
            h('div', null, []),
            h('div', null, []),
            '<div></div>'
        );

        eql(
            h('div', null, [null]),
            h('div', null, []),
            '<div></div>'
        );

        eql(
            h('div', null, []),
            h('div', null, [undefined]),
            '<div></div>'
        );
    });
    
    it('patch string child with undefined', () => {
        eql(
            h('div', null, 'a'),
            h('div'),
            '<div></div>',
            '<div>&nbsp;</div>'
        );
    });

    it('patch empty string child with string', () => {
        eql(
            h('div', null, ''),
            h('div', null, 'a'),
            '<div>a</div>'
        );
    });

    it('patch string with array', () => {
        eql(
            h('div', null, 'a'),
            h('div', null, [h('span'), h('span')]),
            '<div><span></span><span></span></div>',
            '<div><span></span><span></span>&nbsp;</div>'
        );
    });

    it('patch comment', () => {
        eql(
            hc('div'),
            hc('span'),
            '<!--span-->'
        );
    });

    it('patch comment with text', () => {
        eql(
            h('div', null, ['a', hc('b')]),
            h('div', null, [hc('b'), 'a']),
            '<div><!--b-->a</div>'
        );
    });

    it('patch properties', () => {
        eql(
            h('div', {className: 'a'}),
            h('div', {className: 'b'}),
            '<div class="b"></div>'
        );

        eql(
            h('div', {className: 'a'}, h('span', {className: 'aa'})),
            h('div', {className: 'b'}, h('span', {className: 'bb'})),
            '<div class="b"><span class="bb"></span></div>'
        );

        eql(
            h('div', null, [
                h('span', {className: 'a'}),
                h('div', {className: 'b'})
            ]),
            h('div', null, [
                h('div', {className: 'b'}),
                h('span', {className: 'c'})
            ]),
            '<div><div class="b"></div><span class="c"></span></div>',
            '<div>\r\n<div class="b"></div><span class="c"></span></div>'
        );

        eql(
            h('div', {className: 'a'}),
            h('div'),
            '<div></div>'
        );

        eql(
            h('div'),
            h('div', {className: 'a'}),
            '<div class="a"></div>'
        );

        eql(
            h('div'),
            h('div', {className: undefined}),
            '<div></div>'
        );
    });
    
    it('patch style', () => {
        eql(
            h('div', {style: 'color: red; font-size: 20px'}),
            h('div', {style: 'color: red;'}),
            [
                '<div style="color: red;"></div>',
                '<div style="color: red"></div>',
                '<div style="color: red; "></div>',
            ]
        );
        eql(
            h('div', {style: {color: 'red', fontSize: '20px'}}),
            h('div', {style: {color: 'red'}}),
            [
                '<div style="color: red;"></div>',
                '<div style="color: red"></div>',
                '<div style="color: red; "></div>',
            ]
        );
        eql(
            h('div', {style: {color: 'red', fontSize: '20px'}}),
            h('div', {style: 'color: red;'}),
            [
                '<div style="color: red;"></div>',
                '<div style="color: red"></div>',
                '<div style="color: red; "></div>',
            ]
        );
        eql(
            h('div', {style: 'color: red; font-size: 20px'}),
            h('div', {style: {color: 'red'}}),
            [
                '<div style="color: red;"></div>',
                '<div style="color: red"></div>',
                '<div style="color: red; "></div>',
            ]
        );
    });

    it('patch dataset', () => {
        eqlObj(
            h('div', {dataset: {a: 1, b: 'b'}}),
            h('div', {dataset: {a: 2, c: 'c'}}),
            {tag: 'div', props: {'data-a': '2', 'data-c': 'c', 'data-b': null}}
        );
        eqlObj(
            h('div'),
            h('div', {dataset: {a: 2, c: 'c'}}),
            {tag: 'div', props: {'data-a': '2', 'data-c': 'c'}}
        );
        eqlObj(
            h('div', {dataset: null}),
            h('div', {dataset: {a: 2, c: 'c'}}),
            {tag: 'div', props: {'data-a': '2', 'data-c': 'c'}}
        );
        eqlObj(
            h('div'),
            h('div', {dataset: {a: 2, c: 'c'}}),
            {tag: 'div', props: {'data-a': '2', 'data-c': 'c'}}
        );
        eql(
            h('div', {dataset: {a: 1, b: 'b'}}),
            h('div', {dataset: null}),
            '<div></div>'
        );
    });

    it('patch innerHTML', () => {
        eql(
            h('div', {innerHTML: 'a'}),
            h('div', {innerHTML: 'b'}),
            '<div>b</div>'
        );
        eql(
            h('div'),
            h('div', {innerHTML: 'b'}),
            '<div>b</div>'
        );
        eql(
            h('div', {innerHTML: 'a'}),
            h('div', {innerHTML: undefined}),
            [
                '<div></div>',
                '<div>&nbsp;</div>',
            ]
        );
        eql(
            h('div', {innerHTML: 'a'}),
            h('div'),
            [
                '<div></div>',
                '<div>&nbsp;</div>'
            ]
        );
    });

    it('patch attributes', () => {
        eqlObj(
            h('div', {attributes: {a: 1, b: 'b'}}),
            h('div', {attributes: {a: 2, c: 'c'}}),
            {div: 'div', props: {a: '2', c: 'c', b: null}}
        );

        eql(
            h('div', {attributes: {a: 1, b: 'b'}}),
            h('div', {attributes: null}),
            '<div></div>'
        );

        eql(
            h('div', {attributes: {a: 1, b: 'b'}}),
            h('div'),
            '<div></div>'
        );

        eqlObj(
            h('div'),
            h('div', {attributes: {a: 2, c: 'c'}}),
            {div: 'div', props: {a: '2', c: 'c'}}
        );

        eqlObj(
            h('div', {attributes: {a: 1, b: 'b'}}),
            h('div', {attributes: {a: null, c: 'c'}}),
            {div: 'div', props: {a: null, b: null, c: 'c'}}
        );
    });

    it('patch object property', () => {
        eql(
            h('div', {p: {a: 1, b: 'b'}}),
            h('div', {p: {a: 2, c: 'c'}}),
            '<div></div>'
        );
        assert.strictEqual(container.firstChild.p.a, 2);
        assert.strictEqual(container.firstChild.p.c, 'c');
        assert.strictEqual(container.firstChild.p.b, undefined);

        eql(
            h('div', {p: {a: 1, b: 'b'}}),
            h('div'),
            '<div></div>'
        );
        assert.strictEqual(container.firstChild.p, undefined);
    });

    it('patch input', () => {
        p(
            h('input', {value: 'a'}),
            h('input', {value: null}),
        );
        assert.strictEqual(container.firstChild.value, '');

        // ie8 does not support change type for input
        if (isIE8) return;
        eql(
            h('input', {type: 'text'}),
            h('input', {type: 'password'}),
            '<input type="password">'
        );
        eql(
            h('input', {type: 'password'}),
            h('input'),
            '<input>'
        );
    });

    it('patch select', () => {
        eql(
            h('select', null, [
                h('option', null, '1'),
                h('option', {selected: true}, '2'),
                h('option', null, '3'),
            ]),
            h('select', null, [
                h('option', null, '1'),
                h('option', null, '2'),
                h('option', {selected: true}, '3'),
            ]),
            '<select><option>1</option><option>2</option><option>3</option></select>',
            '<select><option>1</option><option>2</option><option selected>3</option></select>'
        );
        assert.strictEqual(container.firstChild.children[1].selected, false);
        assert.strictEqual(container.firstChild.children[2].selected, true);

        eql(
            h('select', null, [
                h('option', {key: 1, selected: true}, '1'),
                h('option', {key: 2}, '2'),
                h('option', {key: 3}, '3'),
            ]),
            h('select', null, [
                h('option', {key: 4, selected: true}, '11'),
                h('option', {key: 2}, '22'),
                h('option', {key: 3}, '33'),
            ]),
            '<select><option>11</option><option>22</option><option>33</option></select>',
            '<select><option selected>11</option><option>22</option><option>33</option></select>'
        );
        assert.strictEqual(container.firstChild.children[0].selected, true);
        assert.strictEqual(container.firstChild.children[1].selected, false);

        eql(
            h('select', null, [
                h('option', {key: 2}, '2'),
                h('option', {key: 1, selected: true}, '1'),
                h('option', {key: 3}, '3'),
            ]),
            h('select', null, [
                h('option', {key: 2}, '22'),
                h('option', {key: 4, selected: true}, '11'),
                h('option', {key: 3}, '33'),
            ]),
            '<select><option>22</option><option>11</option><option>33</option></select>',
            '<select><option>22</option><option selected>11</option><option>33</option></select>'
        );

        assert.strictEqual(container.firstChild.children[0].selected, false);
        assert.strictEqual(container.firstChild.children[1].selected, true);
    });

    it('patch children', () => {
        eql(
            h('div', null, [h('span'), 'test', null, undefined, 'hello']),
            h('div', null, ['test', h('span', {className: 'a'})]),
            '<div>test<span class="a"></span></div>'
        );
        eql(
            h('div', null, [[h('span'), 'test'], [null], [['hello']]]),
            h('div', null, [['test'], [h('span', {className: 'a'})]]),
            '<div>test<span class="a"></span></div>'
        );
    });

    it('patch ref', () => {
        const a = {};
        eql(
            h('div', {ref: (dom) => a.dom = dom}),
            h('div', {ref: (dom) => a.newDom = dom}),
            '<div></div>'
        );
        assert.strictEqual(a.dom, null);
        assert.strictEqual(a.newDom, container.firstChild);

        eql(
            h('div', {ref: (dom) => a.dom = dom}),
            h('span', {ref: (dom) => a.newDom = dom}),
            '<span></span>'
        );
        assert.strictEqual(a.dom, null);
        assert.strictEqual(a.newDom, container.firstChild);

        eql(
            h('div', {ref: (dom) => a.dom = dom}),
            h('div'),
            '<div></div>'
        );
        assert.strictEqual(a.dom, null);
    });

    it('patch class component with element', () => {
        eql(
            h('div', null, h('div')),
            h('div', null, h(ClassComponent)),
            '<div><span></span></div>'
        );
    });

    it('patch function component with element', () => {
        eql(
            h('div', null, h('div')),
            h('div', null, h(FunctionComponent)),
            '<div><p></p></div>',
            '<div>\r\n<p></p></div>'
        );
    });

    it('patch class component with function component', () => {
        eql(
            h('div', null, h(ClassComponent)),
            h('div', null, h(FunctionComponent)),
            '<div><p></p></div>',
            '<div>\r\n<p></p></div>'
        );

        eql(
            h('div', null, h(FunctionComponent)),
            h('div', null, h(ClassComponent)),
            '<div><span></span></div>'
        );
    });

    it('patch class component with class component', () => {
        eql(
            h('div', null, [h(ClassComponent), h('i')]),
            h('div', null, [h(NewComponent), h('i')]),
            '<div><section></section><i></i></div>'
        );
    });

    it('patch function component with function component', () => {
        eql(
            h('div', null, h(FunctionComponent)),
            h('div', null, h(NewFunctionComponent)),
            '<div><article></article></div>'
        );
    });

    it('patch function component which return an array', () => {
        function C(props) {
            return [h('div', null, null, props.className), h('span', null, null, props.className)];
        }

        eql(
            h('div', null, h(C)),
            h('div', null, h(C, {className: 'a'})),
            '<div><div class="a"></div><span class="a"></span></div>',
            '<div>\r\n<div class="a"></div><span class="a"></span></div>'
        );
        eql(
            h('div', null, h(ClassComponent)),
            h('div', null, h(C, {className: 'a'})),
            '<div><div class="a"></div><span class="a"></span></div>',
            '<div>\r\n<div class="a"></div><span class="a"></span></div>'
        );
    });

    it('patch instance component with instance component', () => {
        const a = new ClassComponent({children: h('a')});
        const b = new ClassComponent({children: h('b')});
        const c = new NewComponent();
        eql(
            h('div', null, a),
            h('div', null, b),
            '<div><span><b></b></span></div>'
        );

        eql(
            h('div', null, a),
            h('div', null, c),
            '<div><section></section></div>'
        );
    });

    it('patch instance component with class component', () => {
        const a = new ClassComponent();
        eql(
            h('div', null, a),
            h('div', null, h(NewComponent)),
            '<div><section></section></div>'
        );
    });

    it('patch instance component with element', () => {
        const a = new ClassComponent();
        eql(
            h('div', null, a),
            h('div', null, h('a')),
            '<div><a></a></div>'
        );
    });

    it('patch class component with instance component', () => {
        eql(
            h('div', null, h(ClassComponent)),
            h('div', null, new NewComponent()),
            '<div><section></section></div>'
        );
    });

    it('remove function component', () => {
        const o = {};
        eql(
            h('div', null, h(FunctionComponent, {
                children: [
                    h('b'),
                    h(ClassComponent, {ref: (i) => o.i = i})
                ]
            })),
            h('div'),
            '<div></div>'
        );
        sEql(o.i, null);
    });

    it('remove class component', () => {
        const o = {};
        eql(
            h('div', null, h(ClassComponent, {
                children: [
                    h('b'),
                    h(FunctionComponent, {ref: (i) => o.i = i})
                ]
            })),
            h('div'),
            '<div></div>'
        );
        sEql(o.i, null);
    });

    it('update class component', () => {
        eql(
            h('div', null, h(ClassComponent, {
                children: 'a'
            })),
            h('div', null, h(ClassComponent, {
                children: 'b'
            })),
            '<div><span>b</span></div>'
        );
    });

    it('update class component many times', () => {
        const vNode1 = h('div', null, h(ClassComponent, {
            children: 'a'
        }));
        const vNode2 = h('div', null, h(ClassComponent, {
            children: 'b'
        }));
        const vNode3 = h('div', null, h(ClassComponent, {
            children: 'c'
        }));
        eql(vNode1, vNode2, '<div><span>b</span></div>');
        patch(vNode2, vNode3);
        eqlHtml(container, '<div><span>c</span></div>');
    });

    it('patch single select element', () => {
        // safari can not set value to empty
        if (browser.isSafari) return;
        eql(
            h('select', {value: ''}, [
                h('option', {value: 1}, '1'),
                h('option', {value: 2}, '2')
            ]),
            h('select', {value: '1'}, [
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
            h('select', {value: '1'}, [
                h('option', {value: 1}, '1'),
                h('option', {value: 2}, '2')
            ]),
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
            h('select', {defaultValue: 2}, [
                h('option', {value: 1}, '1'),
                h('option', {value: 2}, '2')
            ]),
            h('select', {value: 1}, [
                h('option', {value: 1}, '1'),
                h('option', {value: 2}, '2')
            ]),
            [
                '<select><option value="1">1</option><option value="2">2</option></select>',
                '<select><option selected value="1" _value="1">1</option><option value="2" _value="2">2</option></select>',
                '<select><option value="1" selected _value="1">1</option><option value="2" _value="2">2</option></select>',
            ]
        );
        assert.strictEqual(container.firstChild.value, '1');
        assert.strictEqual(container.firstChild.firstChild.selected, true);
        assert.strictEqual(container.firstChild.children[1].selected, false);
    });

    it('patch multiple select element', () => {
        p(
            h('select', {value: 2, multiple: true}, [
                h('option', {value: 1}, '1'),
                h('option', {value: 2}, '2')
            ]),
            h('select', {value: 1, multiple: true}, [
                h('option', {value: 1}, '1'),
                h('option', {value: 2}, '2')
            ])
        );
        assert.strictEqual(container.firstChild.value, '1');
        assert.strictEqual(container.firstChild.firstChild.selected, true);
        assert.strictEqual(container.firstChild.children[1].selected, false);

        p(
            h('select', {value: 2, multiple: true}, [
                h('option', {value: 1}, '1'),
                h('option', {value: 2}, '2')
            ]),
            h('select', {value: '', multiple: true}, [
                h('option', {value: 1}, '1'),
                h('option', {value: 2}, '2')
            ])
        );
        assert.strictEqual(container.firstChild.value, '');
        assert.strictEqual(container.firstChild.firstChild.selected, false);
        assert.strictEqual(container.firstChild.children[1].selected, false);

        p(
            h('select', {value: '', multiple: true}, [
                h('option', {value: 1}, '1'),
                h('option', {value: 2}, '2')
            ]),
            h('select', {value: [1, 2], multiple: true}, [
                h('option', {value: 1}, '1'),
                h('option', {value: 2}, '2')
            ])
        );
        assert.strictEqual(container.firstChild.firstChild.selected, true);
        assert.strictEqual(container.firstChild.children[1].selected, true);

        p(
            h('select', {value: [1, 2], multiple: true}, [
                h('option', {value: 1}, '1'),
                h('option', {value: 2}, '2')
            ]),
            h('select', {value: [], multiple: true}, [
                h('option', {value: 1}, '1'),
                h('option', {value: 2}, '2')
            ])
        );
        assert.strictEqual(container.firstChild.firstChild.selected, false);
        assert.strictEqual(container.firstChild.children[1].selected, false);

        p(
            h('select', {value: [1, 2], multiple: true}, [
                h('option', {value: 1}, '1'),
                h('option', {value: 2}, '2')
            ]),
            h('select', {value: '', multiple: true}, [
                h('option', {value: 1}, '1'),
                h('option', {value: 2}, '2')
            ])
        );
        assert.strictEqual(container.firstChild.firstChild.selected, false);
        assert.strictEqual(container.firstChild.children[1].selected, false);
    });

    it('patch vNodes which has hoisted', () => {
        const vNodes = [
            h('div', null, 1), 
            h('div', null, 2), 
            h(ClassComponent, {children: '3'}),
            'test',
            createTextVNode('text')
        ];
        eql(
            h('div', null, ['a', vNodes, 'b']),
            h('div', null, ['a', h('div', null, 0), vNodes, 'b']),
            [
                '<div>a<div>0</div><div>1</div><div>2</div><span>3</span>testtextb</div>',
                '<div>a\r\n<div>0</div>\r\n<div>1</div>\r\n<div>2</div><span>3</span>testtextb</div>',
            ]
        );
    });

    it('patch vNodes which hoisted should clone children', () => {
        const vNodes = [
            h('span', null, createTextVNode('1')),
            h('span', null, createTextVNode('2'))
        ];

        const v1 = h('div', null, vNodes);
        r(v1);
        const v2 = h('div', null, ['a', vNodes]);
        patch(v1, v2);
        const v3 = h('div', null, vNodes);
        patch(v2, v3);
    });

    it('patch vNodes which hoisted and with text should clone clildren', () => {
        const vNode = h(ClassComponent, {
            children: h('span', null, [
                '1',
                h('span', null, '2'),
                '3',
                h('span', null, '4')
            ])
        });

        const v1 = h('div', null, vNode);
        r(v1);
        v1.children.children.update(null, vNode);
        v1.children.children.update(null, vNode);

        eqlHtml(container, '<div><span><span>1<span>2</span>3<span>4</span></span></span></div>');
    });

    it('patch reused vNode', () => {
        const child = h('span', null, 'test')
        const vNode = h('div', null, child);
        const v1 = h('div', null, [
            h('div', null, vNode),
            h('div', null, vNode),
        ]);
        r(v1);
        const v2 = h('div', null, [
            h('div', null, h('div', null, h('span', null, 'changed'))),
            h('div', null, vNode),
        ]);
        p(v1, v2);

        eqlHtml(container, '<div><div><div><span>changed</span></div></div><div><div><span>test</span></div></div></div>');
    });

    it('patch multiple reused vNodes', () => {
        const child = h('span', null, 'test')
        const vNode = h('div', null, [child]);
        const v1 = h('div', null, [
            h('div', null, vNode),
            h('div', null, vNode),
        ]);
        r(v1);
        const v2 = h('div', null, [
            h('div', null, h('div', null, [h('span', null, 'changed')])),
            h('div', null, vNode),
        ]);
        p(v1, v2);

        eqlHtml(container, '<div><div><div><span>changed</span></div></div><div><div><span>test</span></div></div></div>');
    });

    describe('Event', () => {
        it('patch event', () => {
            const fn = sinon.spy();
            const newFn = sinon.spy(); 
            p(
                h('div', {'ev-click': fn}, 'test'),
                h('div', {'ev-click': newFn}, 'test')
            );
            dispatchEvent(container.firstChild, 'click');
            sEql(fn.callCount, 0);
            sEql(newFn.callCount, 1);
        });

        it('patch event by array', () => {
            const fn = sinon.spy();
            const newFn1 = sinon.spy(); 
            const newFn2 = sinon.spy();
            p(
                h('div', {'ev-click': fn}, 'test'),
                h('div', {'ev-click': [newFn1, newFn2]}, 'test')
            );
            dispatchEvent(container.firstChild, 'click');
            sEql(fn.callCount, 0);
            sEql(newFn1.callCount, 1);
            sEql(newFn2.callCount, 1);
        });
        
        it('remove event', () => {
            const fn = sinon.spy(() => console.log(111));
            p(
                h('div', {'ev-click': fn}, 'test'),
                h('div', null, 'test')
            );
            dispatchEvent(container.firstChild, 'click');
            sEql(fn.callCount, 0);

            const vNode1 = h('div', null, [h('div', {'ev-click': fn}, 'test')]);
            const vNode2 = h('span');
            r(vNode1);
            const firstDom = container.firstChild;
            patch(vNode1, vNode2);
            container.appendChild(firstDom);
            dispatchEvent(firstDom.firstChild, 'click');
            sEql(fn.callCount, 0);
        });

        it('remove array event', () => {
            const fn = sinon.spy();
            p(
                h('div', {'ev-click': [fn]}, 'test'),
                h('div', null, 'test')
            );
            dispatchEvent(container.firstChild, 'click');
            sEql(fn.callCount, 0);
        });

        it('add event', () => {
            const fn = sinon.spy();
            p(
                h('div'),
                h('div', {'ev-click': fn})
            );
            dispatchEvent(container.firstChild, 'click');
            sEql(fn.callCount, 1);
        });

        it('add event by array', () => {
            const fn1 = sinon.spy();
            const fn2 = sinon.spy();
            p(
                h('div'),
                h('div', {'ev-click': [fn1, fn2]})
            );
            dispatchEvent(container.firstChild, 'click');
            sEql(fn1.callCount, 1);
            sEql(fn2.callCount, 1);
        });

        it('patch event on children', () => {
            const fn = sinon.spy();
            const newFn = sinon.spy();
            p(
                h('div', null, h('div', {'ev-click': fn})),
                h('div', null, h('div', {'ev-click': newFn}))
            );
            dispatchEvent(container.firstChild.firstChild, 'click');
            sEql(fn.callCount, 0);
            sEql(newFn.callCount, 1);
        });

        it('remove element should remove child node event', () => {
            const fn = sinon.spy();
            p(
                h('div', null, h('div', null, h('div', {'ev-click': fn}))),
                h('div')
            );
        });

        describe('input event in IE10/11', () => {
            // if (!(browser.isIE && (browser.version === 10 || browser.version === 11))) return;
            it('shuold not trigger input event when set placeholder in IE10/11', (done) => {
                const fn = sinon.spy();
                p(
                    h('input', {'ev-input': fn, placeholder: 'a'}),
                    h('input', {'ev-input': fn, placeholder: 'b'}),
                );
                sEql(fn.callCount, 0);
                container.firstChild.focus();
                sEql(fn.callCount, 0);
                setTimeout(() => {
                    container.firstChild.value = 'a';
                    dispatchEvent(container.firstChild, 'input');
                    sEql(fn.callCount, 1);
                    container.firstChild.blur();
                    sEql(fn.callCount, 1);
    
                    done();
                });            
            });
    
            it('should remove focus event hack callback when placeholder is empty in IE10/11', (done) => {
                const fn = sinon.spy();
                p(
                    h('input', {'ev-input': fn, placeholder: 'a'}),
                    h('input', {'ev-input': fn, placeholder: ''}),
                );
                container.firstChild.focus();
                sEql(fn.callCount, 0);
                setTimeout(() => {
                    container.firstChild.value = 'a';
                    dispatchEvent(container.firstChild, 'input');
                    sEql(fn.callCount, 1);
                    container.firstChild.blur();
                    sEql(fn.callCount, 1);
    
                    done();
                });
            });
    
            it('should remove focus event hack callback when placeholder is removed in IE10/11', (done) => {
                const fn = sinon.spy();
                p(
                    h('input', {'ev-input': fn, placeholder: 'a'}),
                    h('input', {'ev-input': fn}),
                );
                container.firstChild.focus();
                sEql(fn.callCount, 0);
                setTimeout(() => {
                    container.firstChild.value = 'a';
                    dispatchEvent(container.firstChild, 'input');
                    sEql(fn.callCount, 1);
                    container.firstChild.blur();
                    sEql(fn.callCount, 1);
    
                    done();
                });
            });
        });
    });

    describe('Key', () => {
        function map(arr, fn) {
            const ret = [];
            for (let i = 0; i < arr.length; i++) {
                ret.push(fn(arr[i], i));
            }
            return ret;
        }
        function each(arr, fn) {
            for (let i = 0; i< arr.length; i++) {
                fn(arr[i], i);
            }
        }
        function createVNodeFromArray(arr) {
            return h('div', null, map(arr, value => h('span', {key: value}, value)));
        }
        function saveChildren() {
            if (isIE8) {
                const ret = [];
                const children = container.firstChild.children;
                for (let i = 0; i < children.length; i++) {
                    ret.push(children[i]);
                }
                return ret;
            }
            return Array.prototype.slice.call(container.firstChild.children, 0);
        }

        it('reorder children', () => {
            const vNode = createVNodeFromArray([1, 2, '3', 'test', 'a']);
            r(vNode);
            const childNodes = saveChildren();

            patch(vNode, createVNodeFromArray([2, '3', 1, 'a', 'test']));

            each([1, 2, 0, 4, 3], (order, index) => {
                sEql(container.firstChild.children[index], childNodes[order]);
            });
        });

        it('replace children with non-string keys', () => {
            function createVNodeFromArray(arr) {
                return h('div', null, map(arr, value => h('span', {key: value}, value.key || value)));
            }
            const keys = [1, 2, 3, 4, 5, 6, 7].map(item => ({key: item}));
            const vNode = createVNodeFromArray(keys);
            r(vNode);
            const childNodes = saveChildren();

            patch(vNode, createVNodeFromArray(['a', keys[1], keys[2], keys[3], 'b', keys[5], keys[6]]));
            each([null, 1, 2, 3, null, 5, 6], (order, index) => {
                if (order === null) return;
                sEql(container.firstChild.children[index], childNodes[order]);
            });
        });

        it('mix keys without keys', () => {
            const vNode = h('div', null, [
                h('span'),
                h('span', {key: 1}),
                h('span', {key: 2}),
                h('span'),
                h('span')
            ]);
            r(vNode);
            const childNodes = saveChildren();

            patch(vNode, h('div', null, [
                h('span', {key: 1}),
                h('span'),
                h('span'),
                h('span', {key: 2}),
                h('span')
            ]));

            each([1, 0, 3, 2, 4], (order, index) => {
                sEql(container.firstChild.children[index], childNodes[order]);
            });
        });

        it('missing key will be removed and insert a new node', () => {
            const vNode = h('div', null, [
                h('span', {key: 1}),
                h('span'),
                h('span')
            ]);
            r(vNode);
            const childNodes = saveChildren(); 
            patch(vNode, h('div', null, [
                h('span'),
                h('span'),
                h('span')
            ]));

            sEql(container.firstChild.children[0], childNodes[1]);
            sEql(container.firstChild.children[1], childNodes[2]);
            sEql(container.firstChild.children[2] === childNodes[0], false);
        });

        it('key in component', () => {
            function run(Component) {
                reset();
                function create(arr) {
                    return h('div', null, map(arr, value => h(Component, {key: value})));
                }
                const vNode = create([1, 2, 3]);
                r(vNode);
                const childNodes = saveChildren();
                patch(vNode, create([2, 1, 3]));

                each([1, 0, 2], (order, index) => {
                    sEql(container.firstChild.children[index], childNodes[order]);
                });
            }

            run(ClassComponent);
            run(FunctionComponent);
        });

        it('key in both component and element', () => {
            const vNode = h('div', null, [
                h('div', {key: 1}),
                h(ClassComponent, {key: 2}),
                h(FunctionComponent, {key: 3})
            ]);
            r(vNode);
            const childNodes = saveChildren();
            patch(vNode, h('div', null, [
                h(FunctionComponent, {key: 3}),
                h('div', {key: 1}),
                h(ClassComponent, {key: 2})
            ]));

            each([2, 0, 1], (order, index) => {
                sEql(container.firstChild.children[index], childNodes[order]);
            });
        });

        describe('Delete & Insert', () => {
            let children;
            let childNodes;

            function create(lastKeys, nextKeys) {
                const vNode = createVNodeFromArray(lastKeys);
                r(vNode);
                childNodes = saveChildren();
                patch(vNode, createVNodeFromArray(nextKeys));
                children = container.firstChild.children;
            }

            it('delete key at the start', () => {
                create([1, 2, 3], [2, 3]);
                sEql(children.length, 2);
                sEql(children[0], childNodes[1]);
                sEql(children[1], childNodes[2]);
            });

            it('delete key at the center', () => {
                create([1, 2, 3], [1, 3]);
                sEql(children.length, 2);
                sEql(children[0], childNodes[0]);
                sEql(children[1], childNodes[2]);
            });

            it('delete key at the end', () => {
                create([1, 2, 3], [1, 2]);
                sEql(children.length, 2);
                sEql(children[0], childNodes[0]);
                sEql(children[1], childNodes[1]);
            });

            it('insert key to the start', () => {
                create([2, 3], [1, 2, 3]);
                sEql(children.length, 3);
                sEql(children[1], childNodes[0]);
                sEql(children[2], childNodes[1]);
            });

            it('insert key to the center', () => {
                create([1, 3], [1, 2, 3]);
                sEql(children.length, 3);
                sEql(children[0], childNodes[0]);
                sEql(children[2], childNodes[1]);
            });

            it('insert key to the end', () => {
                create([1, 2], [1, 2, 3]);
                sEql(children.length, 3);
                sEql(children[0], childNodes[0]);
                sEql(children[1], childNodes[1]);
            });

            it('insert to start and delete from center', () => {
                create([2, 3, 4], [1, 2, 4]);
                sEql(children.length, 3);
                sEql(children[1], childNodes[0]);
                sEql(children[2], childNodes[2]);
            });

            it('insert to end and delete from center', () => {
                create([1, 2, 3], [1, 3, 4]);
                sEql(children.length, 3);
                sEql(children[0], childNodes[0]);
                sEql(children[1], childNodes[2]);
            });

            it('insert multiple keys and delete multiple keys', () => {
                create([1, 2, 3, 4, 5, 6, 7, 8], [11, 3, 5, 4, 9, 10, 1]);
                sEql(children.length, 7);
                each([[1, 2], [2, 4], [3, 3], [6, 0]], ([order, index]) => {
                    sEql(children[order], childNodes[index]);
                });
            });

            it('replace all keys', () => {
                create([1, 2, 3], [4, 5, 6, 7]);
                sEql(children.length, 4);
                for (let i = 0; i < 4; i++) {
                    sEql(children[i] === childNodes[i], false);
                }
            });
        });
    });

    describe('Component', () => {
        let Component;
        let NewComponent;
        let _p;
        let _np;

        function createComponent() {
            function Component(props) {
                this.props = props || {};
            }
            Component.prototype.init = sinon.spy(function(lastVNode, nextVNode) {
                if (lastVNode) removeComponentClassOrInstance(lastVNode, null, nextVNode);
                this.vNode = h('span', this.props, this.props.children);
                return this.dom = render(this.vNode);
            });
            Component.prototype.mount = sinon.spy();
            Component.prototype.update = sinon.spy(function() {
                return render(h('div', this.props, this.props.children));
            });
            Component.prototype.destroy = sinon.spy(function() {
                remove(this.vNode);
            });

            return Component;
        }

        beforeEach(() => {
            Component = createComponent();
            _p = Component.prototype;
            NewComponent = createComponent();
            _np = NewComponent.prototype;
        });

        it('call init and mount method once and don\'t call update and destroy method when render', () => {
            r(h(Component));

            sEql(_p.init.callCount, 1);
            sEql(_p.mount.callCount, 1);
            sEql(_p.update.callCount, 0);
            sEql(_p.destroy.callCount, 0);
            sEql(_p.mount.calledAfter(_p.init), true);
        });

        it('only call update method once when update', () => {
            eql(h(Component), h(Component), '<div></div>');

            sEql(_p.init.callCount, 1);
            sEql(_p.mount.callCount, 1);
            sEql(_p.update.callCount, 1);
            sEql(_p.destroy.callCount, 0);
            sEql(_p.update.calledAfter(_p.mount), true);
        });

        it('only call destroy method once when destroy', () => {
            p(h(Component), h(NewComponent));

            sEql(_p.init.callCount, 1);
            sEql(_p.mount.callCount, 1);
            sEql(_p.update.callCount, 0);
            sEql(_p.destroy.callCount, 1);
            sEql(_p.destroy.calledAfter(_p.mount), true);

            sEql(_np.init.callCount, 1);
            sEql(_np.mount.callCount, 1);
            sEql(_np.update.callCount, 0);
            sEql(_np.destroy.callCount, 0);
        });

        it('this should pointer to the instance of component', () => {
            p(h(Component), h(NewComponent));

            sEql(_p.init.thisValues[0] instanceof Component, true);
            sEql(_p.mount.thisValues[0] instanceof Component, true);
            sEql(_p.destroy.thisValues[0] instanceof Component, true);
            sEql(_np.init.thisValues[0] instanceof NewComponent, true);
            sEql(_np.mount.thisValues[0] instanceof NewComponent, true);
        });

        it('don\'t replace when return the same dom between different components', () => {
            _np.init = function(lastVNode, vNode) {
                return this.dom = lastVNode.dom;
            };

            const vNode = h(Component);
            r(vNode);
            const dom = container.firstChild;
            patch(vNode, h(NewComponent));
            sEql(dom, container.firstChild);
        });

        it('check the args for method when update', () => {
            const lastVNode = h(Component);
            const nextVNode = h(Component);
            p(lastVNode, nextVNode);

            sEql(_p.init.calledWithExactly(null, lastVNode), true); 
            sEql(_p.mount.calledWithExactly(null, lastVNode), true);
            sEql(_p.update.calledWithExactly(lastVNode, nextVNode), true);
        });

        it('check the args for method when destroy', () => {
            const lastVNode = h(Component);
            const nextVNode = h(NewComponent);
            p(lastVNode, nextVNode);

            sEql(_p.init.calledWithExactly(null, lastVNode), true); 
            sEql(_p.mount.calledWithExactly(null, lastVNode), true);
            sEql(_p.destroy.calledWithExactly(lastVNode, nextVNode, null), true);
        });

        it('should destroy children when destroy class component', () => {
            const C = createComponent();
            const cp = C.prototype;

            eql(
                h('div', null, h(Component, {children: h(C)})),
                h('div', null, h(NewComponent)),
                '<div><span></span></div>'
            );

            sEql(cp.init.callCount, 1);
            sEql(cp.mount.callCount, 1);
            sEql(cp.update.callCount, 0);
            sEql(cp.destroy.callCount, 1);
        });

        it('check method for instance component replacing', () => {
            eql(
                h('div', null, new Component()), 
                h('div', null, new NewComponent()), 
                '<div><span></span></div>'
            );

            sEql(_p.init.callCount, 1);
            sEql(_p.mount.callCount, 1);
            sEql(_p.update.callCount, 0);
            sEql(_p.destroy.callCount, 1);
            sEql(_np.init.callCount, 1);
            sEql(_np.mount.callCount, 1);
            sEql(_np.update.callCount, 0);
            sEql(_np.destroy.callCount, 0);
        });

        it('check method for instance component updating', () => {
            const c = new Component();
            eql(
                h('div', null, c),
                h('div', null, c),
                '<div><div></div></div>',
                '<div>\r\n<div></div></div>'
            );

            sEql(_p.init.callCount, 1);
            sEql(_p.mount.callCount, 1);
            sEql(_p.update.callCount, 1);
            sEql(_p.destroy.callCount, 0);
        });

        it('should destroy children when destroy instance component', () => {
            const C = createComponent();
            const cp = C.prototype;

            eql(
                h('div', null, new Component({children: h(C)})),
                h('div', null, new NewComponent()),
                '<div><span></span></div>'
            );

            sEql(cp.init.callCount, 1);
            sEql(cp.mount.callCount, 1);
            sEql(cp.update.callCount, 0);
            sEql(cp.destroy.callCount, 1);
        });
    });

    describe('SVG', () => {
        if (isIE8) return;

        it('patch svg', () => {
            p(
                h('svg', null, h('circle', {cx: 50, cy: 50, r: 50, fill: 'red'})),
                h('svg', null, h('circle', {cx: 50, cy: 50, r: 50, fill: 'blue'})),
            );
            sEql(container.firstChild.firstChild.getAttribute('fill'), 'blue');
        });        
    });
});
