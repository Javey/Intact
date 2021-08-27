import {render, container} from './helpers';
import {Component} from '../src';
import {Component as ReactComponent} from 'react';

class SimpleIntactComponent extends Component {
    static template = `<div>Intact Component</div>`;
}

class ChildrenIntactComponent extends Component {
    static template = `<div>{this.get('children')}</div>`
}

// class ChildrenIntactComponent extends ReactComponent<{a: number}> {
//     // static template = `<div>{this.get('children')}</div>`
//     render() {
//         return <div></div>
//     }
// }
class SimpleReactComponent extends ReactComponent {
    // FIXME: Vue JSX need this
    $props: any;
    render() {
        return <div>{this.props.children}</div>
    }
}

describe('Intact React', () => {
    describe('Render', () => {
        it('render intact component in react', () => {
            render(<SimpleIntactComponent />);
            expect(container.innerHTML).to.eq('<div>Intact Component</div>');
        });

        it('render intact component in react element', () => {
            render(<div><SimpleIntactComponent /></div>);
            expect(container.innerHTML).to.eq('<div><div>Intact Component</div></div>');
        });

        it('render intact component in react component', () => {
            render(<SimpleReactComponent><SimpleIntactComponent /></SimpleReactComponent>);
            expect(container.innerHTML).to.eq('<div><div>Intact Component</div></div>');
        });

        it('render react element in intact component', () => {
            render(<ChildrenIntactComponent><div>test</div></ChildrenIntactComponent>);
            // expect(container.innerHTML).to.eql('<div><div>test</div></div>');
        });
    });
});
