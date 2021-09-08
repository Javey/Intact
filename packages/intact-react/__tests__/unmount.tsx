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
    renderApp
} from './helpers';
import {Component, createVNode as h, findDomFromVNode} from '../src';
import ReactDOM from 'react-dom';

describe('Intact React', () => {
    describe('Unmount', () => {
        it('should unmount intact component which returned by react component directly', () => {
            const instance = renderApp(function() {
                return <ChildrenIntactComponent>test</ChildrenIntactComponent>
            });
            ReactDOM.unmountComponentAtNode(container);
            expect(container.innerHTML).to.eql('');
        });

        it('should unmount react component which return intact component and the intact component nests a react component which return a intact component', () => {
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
        });
    });
});
