import ReactDom from 'react-dom';
import {ReactDemo} from './reactDemo';
import {data} from './data';
import {IntactDemo} from './intactDemo';

// describe('Render', () => {
    // const container = document.createElement('div');
    // document.body.appendChild(container);

    // it('intact-react', () => {
        // const now = Date.now();
        // ReactDom.render(<IntactDemo data={data} />, container);
        // console.log(Date.now() - now);
    // });

    // it('react', () => {
        // const now = Date.now();
        // ReactDom.render(<ReactDemo data={data} />, container);
        // console.log(Date.now() - now);
    // });
// });

suite('Render', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    benchmark('intact-react', () => {
        ReactDom.render(<div>
            <IntactDemo data={data}>
                <div>React Children</div>
            </IntactDemo>
        </div>, container);
    }, {
        onCycle() {
            ReactDom.unmountComponentAtNode(container);
        },
    });

    benchmark('react', () => {
        ReactDom.render(<ReactDemo data={data} />, container);
    }, {
        onCycle() {
            ReactDom.unmountComponentAtNode(container);
        },
    });

    benchmark('vue', () => {

    });
});
