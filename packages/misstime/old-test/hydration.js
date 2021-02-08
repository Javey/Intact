import {hydrateRoot} from '../src/hydration';
import {h, hc, renderString, patch, hydrate, render} from '../src';
import assert from 'assert';
import {eqlHtml, isIE8} from './utils';

function sEql(a, b) {
    assert.strictEqual(a, b);
}

class ClassComponent {
    constructor(props) {
        this.props = props || {};
    }
    init() {
        this.render();
        return this.dom = render(this._vNode);
    }
    toString() {
        this.render();
        return renderString(this._vNode);
    }
    hydrate(vNode, dom) {
        this.render();
        return this.dom = hydrate(this._vNode, dom, this.mountedQueue, this.parentDom, vNode);
    }
    update(lastVNode, nextVNode) {
        var oldVnode = this._vNode;
        this.props = nextVNode.props;
        this.render();
        return this.dom = patch(oldVnode, this._vNode);
    }
    render() {
        this._vNode = h('span', this.props, this.props.children);
    }
}


describe('hydrate', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    function hy(vNode) {
        container.innerHTML = renderString(vNode);
        hydrateRoot(vNode, container);
    }

    it('hydrate element', () => {
        const vNode = h('div', {id: 'test'}, 'test', 'test');
        container.innerHTML = renderString(vNode);
        hydrateRoot(vNode, container);
        sEql(vNode.dom, container.firstChild);

        patch(vNode, h('div', null, 'hello'));
        eqlHtml(container, '<div>hello</div>');
    });

    it('hydrate text element', () => {
        const vNode = h('div', null, ['test']);
        hy(vNode);
        sEql(vNode.children[0].dom, container.firstChild.firstChild);

        patch(vNode, h('div', null, ['hello']));
        eqlHtml(container, '<div>hello</div>');
    });

    it('hydrate text elements', () => {
        const vNode = h('div', null, ['test1', 'test2']);
        hy(vNode);
        sEql(vNode.children[0].dom, container.firstChild.childNodes[0]);
        sEql(vNode.children[1].dom, container.firstChild.childNodes[1]);
        sEql(container.firstChild.childNodes.length, 2);

        patch(vNode, h('div', null, ['test3']));
        eqlHtml(container, '<div>test3</div>');
    });

    it('hydrate comment', () => {
        const vNode = h('div', null, hc('test'));
        hy(vNode);
        sEql(vNode.children.dom, container.firstChild.firstChild);
        
        patch(vNode, h('div', null, 'test'));
        eqlHtml(container, '<div>test</div>');
    });

    it('hydrate component class', () => {
        const vNode = h(ClassComponent, {
            className: 'test',
            children: [h('i')]
        });
        hy(vNode);
        sEql(vNode.dom, container.firstChild);
        sEql(vNode.children._vNode.dom, container.firstChild);
        sEql(vNode.children._vNode.children[0].dom, container.firstChild.firstChild);

        patch(vNode, h(ClassComponent, {
            className: 'hello',
            children: h('b')
        }));
        eqlHtml(container, '<span class="hello"><b></b></span>');
    });

    it('hydrate svg', () => {
        if (isIE8) return;

        const vNode = h('svg', null, h('circle', {cx: 50, cy: 50, r: 50, fill: 'red'}));
        hy(vNode);
        sEql(vNode.dom, container.firstChild);

        patch(vNode, h('svg', null, h('circle', {cx: 50, cy: 50, r: 50, fill: 'blue'})));
        eqlHtml(
            container,
            [
                '<svg><circle cx="50" cy="50" r="50" fill="blue"></circle></svg>',
                '<svg xmlns="http://www.w3.org/2000/svg"><circle fill="blue" cx="50" cy="50" r="50" /></svg>',
            ]
        );
    });

    it('should remove redundant elements', () => {
        const vNode = h('div');
        container.innerHTML = renderString(vNode);
        container.appendChild(render(vNode));
        container.appendChild(render(vNode));
        sEql(container.children.length, 3);
        hydrateRoot(vNode, container);
        sEql(container.children.length, 1);
    });

    it('hydrate empty root', () => {
        const vNode = h('div');
        hydrateRoot(vNode, container);
        sEql(container.firstChild, vNode.dom);
    });
});
