import ReactDom from 'react-dom';
import {render} from 'intact';
import {renderIntact, renderReact, renderIntactReact, renderVue, renderIntactVue} from './helpers';
import {act} from 'react-dom/test-utils';

suite('Render', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    function clear() {
        container.innerHTML = '';
    }

    benchmark('intact-react', () => {
        renderIntactReact(container);
        delete (container as any)._reactRootContainer;
        clear();
    });

    benchmark('react', () => {
        renderReact(container);
        delete (container as any)._reactRootContainer;
        clear();
        // ReactDom.unmountComponentAtNode(container);
    });

    benchmark('intact', () => {
        renderIntact(container);
        delete (container as any).$V;
        clear();
    });

    let app: any;

    benchmark('intact-vue', () => {
        app = renderIntactVue(container);
        delete (container as any)._vnode;
        clear();
    });

    benchmark('vue', () => {
        app = renderVue(container);
        delete (container as any)._vnode;
        clear();
    });
}, {
    async: true,
    onCycle(event: any) {
        const suite = this;
        const benchmark = event.target;
        console.log("Cycle completed for " + suite.name + ": " + benchmark.name + ', hz: ' + benchmark.hz);
    },
    onComplete() {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
        alert('Done');
    }
});
