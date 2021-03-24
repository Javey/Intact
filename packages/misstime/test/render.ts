import {render} from '../src/core/render';
import {createVNode as h} from '../src/core/vnode';

describe('Render', () => {
    let container: Element;

    beforeEach(() => {
        container = document.createElement('div');
    });

    // it('should call mounted method when mounted', () => {
        // const mounted = jasmine.createSpy();
        // class TestComponent extends Component {
            // mounted() {
                // mounted();
            // }
        // }
        // render(h(TestComponent), container);
        // expect(mounted).toHaveBeenCalledTimes(1);
    // });

    it('should remove vNode if render null to container', () => {
        const vNode = h('div');
        render(vNode, container);
        render(null, container);
        expect(container.innerHTML).toBe('');
    });

    it('should update vNode if render new vNode to container', () => {
        render(h('div'), container);
        render(h('span'), container);
        expect(container.innerHTML).toBe('<span></span>');
    });

    it('should clone vNode if render an in use vNode', () => {
        const vNode = h('div');
        render(vNode, container);
        render(vNode, container);
        expect(container.innerHTML).toBe('<div></div>');

        render(null, container);
        render(vNode, container);
        expect(container.innerHTML).toBe('<div></div>');
    });

    it('should throw error if container is invalid', () => {
        expect(() => render(h('div'), document.body)).toThrowError();
        expect(() => render(h('div'), null as any)).toThrowError();
        expect(() => render(h('div'), true as any)).toThrowError();
    });
});
