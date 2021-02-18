import {createElementVNode} from '../src/vnode';
import {Types, ChildrenTypes, VNode} from '../src/types';
import {mount} from '../src/mount';

describe('Props', () => {
    let container: HTMLElement;

    function render(vNode: VNode) {
        mount(vNode, container, false, []);
    }

    beforeEach(() => {
        container = document.createElement('div');
    });

    it('should ignore some props', () => {
        const vNode = createElementVNode(
            Types.CommonElement,
            'div',
            null,
            null,
            'class-name',
            {
                children: 'test',
                className: 'test'
            },
        );
        render(vNode);
        expect(container.innerHTML).toBe('<div class="class-name"></div>');
    });

    it('should set boolean props', () => {
        const vNode = createElementVNode(
            Types.InputElement,
            'input',
            null,
            null,
            null,
            {
                autofocus: true,
            },
        );
        render(vNode);
        expect(container.innerHTML).toBe('<input autofocus="">');
    });

    it('should set defaultChecked', () => {
         const vNode = createElementVNode(
            Types.InputElement,
            'input',
            null,
            null,
            null,
            {
                defaultChecked: true,
                type: 'checkbox',
            }
        );
        render(vNode);

        expect((container.firstChild as HTMLInputElement).value).toBe('on');
        expect(container.innerHTML).toBe('<input checked="" type="checkbox">');
    });

    it('should do nothing if value is null', () => {
        const vNode = createElementVNode(
            Types.InputElement,
            'input',
            null,
            null,
            null,
            {
                value: null
            }
        );
        render(vNode);

        expect((container.firstChild as HTMLInputElement).value).toBe('');
    });

    it('should set scrollLeft', () => {
        const child = createElementVNode(
            Types.CommonElement,
            'div',
            null,
            null,
            null,
            {
                style: 'width: 100px; height: 10px;'
            }
        );
        const vNode = createElementVNode(
            Types.CommonElement,
            'div',
            child,
            ChildrenTypes.HasVNodeChildren,
            null,
            {
                style: {
                    width: '50px',
                    overflow: 'auto'
                },
                scrollLeft: 10,
            }
        );
        document.body.appendChild(container);
        render(vNode);

        expect((container.firstChild as HTMLElement).scrollLeft).toBe(10);
    });
});
