import {renderIntact, renderReact, renderIntactReact, renderVue, renderIntactVue} from './helpers';
import ReactDom from 'react-dom';

describe('Render', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    let now: number;
    beforeEach(() => {
        now = Date.now();
    });

    afterEach(() => {
        console.log(Date.now() - now);
    });

    it('intact-react', function() {
        this.timeout(0);

        renderIntactReact(container);
    });

    it('react', function() {
        this.timeout(0);

        renderReact(container);
    });

    it('intact', function() {
        this.timeout(0);

        renderIntact(container);
    });

    it('vue', function() {
        this.timeout(0);

        const app = renderVue(container);
    });

    it('intact-vue', function() {
        this.timeout(0);

        renderIntactVue(container);
    });
});

