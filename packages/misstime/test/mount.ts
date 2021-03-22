import {
    createElementVNode,
    createTextVNode, 
    createComponentVNode,
    createCommentVNode,
    createFragment,
    createVNode as h,
} from '../src/vnode';
import {Types, ChildrenTypes, ComponentClass, Props, VNodeComponent, VNode} from '../src/utils/types';
import {mount} from '../src/mount';
import {createRef} from '../src/utils/ref';
import {Component} from './utils';
import {render} from '../src/render';

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
        render(vNode, container);
        expect(container.innerHTML).toBe('<div class="class-name" id="1"><div></div></div>');
    });

    it('should mount text children of vNode', () => {
        const vNode = createElementVNode(
            Types.CommonElement,
            'div',
            'test',
            ChildrenTypes.UnknownChildren,
        );
        render(vNode, container);
        expect(container.innerHTML).toBe('<div>test</div>');
    });

    it('should mount text vNode', () => {
        const vNode = createTextVNode('test');
        render(vNode, container);
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
        render(vNode, container);
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
        render(vNode, container);
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
        render(vNode, container);
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
        render(vNode, container);

        expect(container.firstChild!.namespaceURI).toBe('http://www.w3.org/2000/svg');
        expect(container.firstChild!.firstChild!.namespaceURI).toBe('http://www.w3.org/2000/svg');
    });

    it('should throw error if we mount invalid vNode', () => {
        expect(() => mount([] as any, container, false, null, [])).toThrowError();
        expect(() => mount((() => {}) as any, container, false, null, [])).toThrowError();
    });

    it('should mount ref that is RefObject', () => {
        const ref = createRef();        
        const vNode = createElementVNode(
            Types.InputElement,
            'span',
            null,
            null,
            null,
            null,
            null,
            ref
        );
        render(vNode, container);

        expect(ref.value!.outerHTML).toBe('<span></span>');
    });

    it('should mount ref that is function', () => {
        let ref: Element | null;        
        const vNode = createElementVNode(
            Types.InputElement,
            'span',
            null,
            null,
            null,
            null,
            null,
            i => ref = i,
        );
        render(vNode, container);

        expect(ref!.outerHTML).toBe('<span></span>');
    });

    it('should mount component', () => {
        const vNode = createComponentVNode(Types.ComponentClass, Component);
        render(vNode, container);

        expect(container.innerHTML).toBe('<div></div>');
    });

    it('should call mounted method when mounted', () => {
        const mounted = jasmine.createSpy();
        class TestComponent extends Component {
            mounted() {
                mounted();
            }
        }
        render(createComponentVNode(Types.ComponentClass, TestComponent), container);
        expect(mounted).toHaveBeenCalledTimes(1);
    });

    it('should mount comment', () => {
        const vNode = createCommentVNode('comment');
        render(vNode, container);        

        expect(container.innerHTML).toBe('<!--comment-->');
    });

    describe('Fragment', () => {
        it('should mount Fragment that children is vNode', () => {
            render(createFragment(
                createElementVNode(Types.CommonElement, 'div'), 
                ChildrenTypes.UnknownChildren
            ), container);

            expect(container.innerHTML).toBe('<div></div>');
        });

        it('should mount Fragment that child is text', () => {
            render(createFragment(
                'text',
                ChildrenTypes.UnknownChildren
            ), container);

            expect(container.innerHTML).toBe('text');
        });

        it('should mount Fragment that child is invalid', () => {
            render(createFragment(
                null,
                ChildrenTypes.UnknownChildren
            ), container);

            expect(container.innerHTML).toBe('<!---->');
        });

        it('should mount Fragment that children is vNode[]', () => {
            render(createFragment(
                [
                    createElementVNode(Types.CommonElement, 'div'),
                    null,
                    createFragment(
                        'text',
                        ChildrenTypes.HasTextChildren,
                    ),
                    createElementVNode(Types.CommonElement, 'span'),
                ],
                ChildrenTypes.UnknownChildren
            ), container);

            expect(container.innerHTML).toBe('<div></div>text<span></span>');
        });

        it('should mount used Fragment', () => {
            const child = createFragment(h('i'), ChildrenTypes.HasVNodeChildren);
            const foo = createElementVNode(Types.CommonElement, 'div', child, ChildrenTypes.HasVNodeChildren);
            const bar = createElementVNode(Types.CommonElement, 'div', child, ChildrenTypes.HasVNodeChildren);
            const vNode = createElementVNode(
                Types.CommonElement,
                'div',
                [foo, bar],
                ChildrenTypes.HasNonKeyedChildren,
            );
            render(vNode, container);

            expect(container.innerHTML).toBe('<div><div><i></i></div><div><i></i></div></div>')
            expect((child.children as VNode).dom).toBe(container.firstElementChild!.firstElementChild!.firstElementChild);
        });

        it('should mount used Fragment which children is text', () => {
            const fragment = createFragment('text', ChildrenTypes.UnknownChildren);
            render(h('div', null, [
                fragment,
                fragment
            ]), container);

            expect(container.innerHTML).toBe('<div>texttext</div>');
            expect((fragment.children as VNode[])[0].dom).toBe(container.firstElementChild!.firstChild as Text);
        });
    });
});

