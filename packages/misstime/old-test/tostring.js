import {toString} from '../src/tostring';
import {h, hc, render} from '../src';
import assert from 'assert';

function eql(vNode, html) {
    assert.strictEqual(toString(vNode), html);
}

class ClassComponent {
    constructor(props) {
        this.props = props || {};
    }
    init() {}
    toString() {
        this.vNode = h('span', this.props, this.props.children);
        return toString(this.vNode);
    }
}

describe('toString', () => {
    it('render element to string', () => {
        eql(h('div'), '<div></div>');
        eql(h('div', {a: 1, b: 'b'}), '<div a="1" b="b"></div>');
        eql(h('div', {a: 1}, 'test'), '<div a="1">test</div>');
        eql(h('div', null, h('i'), 'test'), '<div class="test"><i></i></div>');
        eql(
            h('div', null, [h('i'), h('b', {a: 'a'})], "test"),
            '<div class="test"><i></i><b a="a"></b></div>'
        );
    });

    it('render style to string', () => {
        eql(
            h('div', {style: 'font-size: 14px; color: red;'}),
            '<div style="font-size: 14px; color: red;"></div>'
        );

        eql(
            h('div', {style: {fontSize: '14px', color: 'red'}}),
            '<div style="font-size:14px;color:red;"></div>'
        );
    });

    it('render attributes to string', () => {
        eql(
            h('div', {attributes: {a: 1, b: '2', c: 'c', checked: true}}),
            '<div a="1" b="2" c="c" checked></div>'
        );
    });

    it('render dataset to string', () => {
        eql(
            h('div', {dataset: {a: '1', 'aA': true, 'aAA': 3}}),
            '<div data-a="1" data-a-a="true" data-a-a-a="3"></div>'
        );
    });

    it('render innerHTML to string', () => {
        eql(
            h('div', {innerHTML: '<i></i>', a: 1}),
            '<div a="1"><i></i></div>'
        );
    });

    it('render defaultValue and defaultChecked to string', () => {
        eql(
            h('input', {defaultValue: 0}),
            '<input value="0" />'
        );
        eql(
            h('input', {defaultValue: '1', value: 0}),
            '<input value="0" />'
        );
        eql(
            h('input', {defaultChecked: true}),
            '<input checked />'
        );
        eql(
            h('input', {defaultChecked: true, checked: false}),
            '<input />'
        );
    });

    it('render <option> to string', () => {
        eql(
            h('select', {value: 1}, [
                h('option', {value: 0}),
                h('option', {value: 1})
            ]),
            '<select value="1"><option value="0"></option><option value="1" selected></option></select>'
        );
    });

    it('render textNode to string', () => {
        eql(
            h('div', null, ['a', 'b']),
            '<div>a<!---->b</div>'
        );
        eql(
            h('div', null, h('div', null, ['a', 'b'])),
            '<div><div>a<!---->b</div></div>'
        );
        eql(
            h('div', null, ['a', h('i'), 'b']),
            '<div>a<i></i>b</div>'
        );
    });

    it('render commnet to string', () => {
        eql(hc('div'), '<!--div-->');
        eql(h('div', null, hc('div')), '<div><!--div--></div>');
    });

    it('should escape text', () => {
        eql(
            h('div', null, '<div></div>'), 
            '<div>&lt;div&gt;&lt;/div&gt;</div>'
        );
    });

    it('render class component to string', () => {
        eql(
            h(ClassComponent, {
                className: 'test',
                children: h('i')
            }),
            '<span class="test"><i></i></span>'
        );
    });

    it('render instance component to string', () => {
        eql(
            h(new ClassComponent({
                className: 'test',
                children: h('i')
            })),
            '<span class="test"><i></i></span>'
        );
    });

    it('render svg to string', () => {
        eql(
            h('svg', null, h('circle', {cx: 50, cy: 50, r: 50, fill: 'red'})),
            '<svg><circle cx="50" cy="50" r="50" fill="red"></circle></svg>'
        );
    });
});
