import {Component as ReactComponent, ReactNode, Fragment} from 'react';
import {
    render,
    container,
    createIntactComponent, 
    SimpleIntactComponent,
    ChildrenIntactComponent,
    SimpleReactComponent,
    PropsIntactComponent,
    expect,
    wait,
    renderApp,
    getSpyError,
} from './helpers';
import {Component, createVNode as h, findDomFromVNode} from '../src';
import ReactDOM from 'react-dom';

describe('Intact React', () => {
    describe('Unmount', () => {
        it('should unmount intact component which returned by react component directly', () => {
            const [spyError, resetError] = getSpyError();
            const instance = renderApp(function() {
                return <ChildrenIntactComponent>test</ChildrenIntactComponent>
            });
            ReactDOM.unmountComponentAtNode(container);
            expect(container.innerHTML).to.eql('');
            expect(spyError.callCount).to.eql(0);
            resetError();
        });

        it('should unmount react component which return intact component and the intact component nests a react component which return a intact component', () => {
            const [spyError, resetError] = getSpyError();
            const ReactComponent = function() {
                return <ChildrenIntactComponent>test</ChildrenIntactComponent>
            }
            const instance = renderApp(function() {
                return <ChildrenIntactComponent>
                    <ReactComponent />
                </ChildrenIntactComponent>
            });

            ReactDOM.unmountComponentAtNode(container);
            expect(container.innerHTML).to.eql('');
            expect(spyError.callCount).to.eql(0);
            resetError();
        });

        it('should unmount intact component that contains react element and has handled update on rendering', () => {
            class Test extends Component<{data: number}> {
                static template = `<div>{this.get('children')}</div>`;
                init() {
                    this.set('data', this.get('data') + 1);
                }
            }

            renderApp(function() {
                return <ChildrenIntactComponent>
                    <Test data={this.state.data}
                        onChangeData={data => this.setState({data})}
                    >test</Test>
                    <div>content</div>
                </ChildrenIntactComponent>
            }, {data: 0});

            ReactDOM.unmountComponentAtNode(container);
            expect(container.innerHTML).to.eql('');
        });
    });
});
