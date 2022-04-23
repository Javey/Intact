import ReactDom from 'react-dom';
import {render} from 'intact';
import {renderIntact, renderReact, renderIntactReact, renderVue, renderIntactVue} from './helpers';
import {act} from 'react-dom/test-utils';

suite('Render', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    benchmark('intact-react', () => {
        renderIntactReact(container);
    }, {
        onCycle(e: any) {
            // console.log(e); 
            act(() => {
                ReactDom.unmountComponentAtNode(container);
            });
        },
    });

    benchmark('react', () => {
        renderReact(container);
    }, {
        onCycle(e: any) {
            act(() => {
                ReactDom.unmountComponentAtNode(container);
            });
        },
    });

    benchmark('intact', () => {
        renderIntact(container);
    }, {
        onCycle(e: any) {
            render(null, container);
        }
    })

    let app: any;
    benchmark('intact-vue', () => {
        app = renderIntactVue(container);
    }, {
        onCycle(e: any) {
            // console.log(e); 
            app.unmount();
        }
    });

    benchmark('vue', () => {
        app = renderVue(container);
    }, {
        onCycle(e: any) {
            // console.log(e); 
            app.unmount();
        }
    });
}, {async: true});
