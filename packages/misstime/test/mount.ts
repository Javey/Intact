import {createElementVNode, createTextVNode} from '../src/vnode';
import {Types, ChildrenTypes} from '../src/types';
import {mount} from '../src/mount';

describe('Mount', () => {
    let container: Element;

    beforeEach(() => {
        container = document.createElement('div');
    });

    it('should mount vNode', () => {
        const vNode = createElementVNode(
            Types.CommonElement, 
            'div',
            createElementVNode(Types.CommonElement, 'div'),
            ChildrenTypes.UnknownChildren,
            'class-name',
            {id: 1}
        );
        mount(vNode, container, false, []);
        expect(container.innerHTML).toBe('<div class="class-name" id="1"><div></div></div>');
    });

    it('should mount text children of vNode', () => {
        const vNode = createElementVNode(
            Types.CommonElement,
            'div',
            'test',
            ChildrenTypes.UnknownChildren,
        );
        mount(vNode, container, false, []);
        expect(container.innerHTML).toBe('<div>test</div>');
    });

    it('should mount text vNode', () => {
        const vNode = createTextVNode('test');
        mount(vNode, container, false, []);
        expect(container.innerHTML).toBe('test');
    });

    it('should mount array children of vNode', () => {
        const child = createElementVNode(Types.CommonElement, 'div');
        const vNode = createElementVNode(
            Types.CommonElement,
            'div',
            [child, child],
            ChildrenTypes.UnknownChildren,
        );
        mount(vNode, container, false, []);
        expect(container.innerHTML).toBe('<div><div></div><div></div></div>');
    });

    it('should mount non-keyed children', () => {
        const child = createElementVNode(Types.CommonElement, 'div');
        const vNode = createElementVNode(
            Types.CommonElement,
            'div',
            [child, child],
            ChildrenTypes.HasNonKeyedChildren,
        );
        mount(vNode, container, false, []);
        expect(container.innerHTML).toBe('<div><div></div><div></div></div>');
    });

    it('should mount used child', () => {
        const child = createElementVNode(Types.CommonElement, 'i');
        const foo = createElementVNode(Types.CommonElement, 'div', child, ChildrenTypes.HasVNodeChildren);
        const bar = createElementVNode(Types.CommonElement, 'div', child, ChildrenTypes.HasVNodeChildren);
        const vNode = createElementVNode(
            Types.CommonElement,
            'div',
            [foo, bar],
            ChildrenTypes.HasNonKeyedChildren,
        );
        mount(vNode, container, false, []);
        expect(container.innerHTML).toBe('<div><div><i></i></div><div><i></i></div></div>')
    });

    it('should mount svg element', () => {
        const vNode = createElementVNode(
            Types.SvgElement,
            'svg',
            createElementVNode(Types.CommonElement, 'circle'),
            ChildrenTypes.HasVNodeChildren, 
            'class-name'
        );
        mount(vNode, container, false, []);

        expect(container.firstChild!.namespaceURI).toBe('http://www.w3.org/2000/svg');
        expect(container.firstChild!.firstChild!.namespaceURI).toBe('http://www.w3.org/2000/svg');
    });

    it('should throw error if we mount invalid vNode', () => {
        expect(() => mount([] as any, container, false, [])).toThrowError();
        expect(() => mount((() => {}) as any, container, false, [])).toThrowError();
    });
});
