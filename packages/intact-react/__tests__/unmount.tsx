import {Component as ReactComponent, ReactNode, Fragment, useState, useEffect} from 'react';
import {act} from 'react-dom/test-utils';
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
            instance.$root.unmount();
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

            instance.$root.unmount();
            expect(container.innerHTML).to.eql('');
            // expect(spyError.callCount).to.eql(0);
            resetError();
        });

        it('should unmount intact component that contains react element and has handled update on rendering', () => {
            class Test extends Component<{data: number}> {
                static template = `<div>{this.get('children')}</div>`;
                init() {
                    this.set('data', this.get('data') + 1);
                }
            }

            const instance = renderApp(function() {
                return <ChildrenIntactComponent>
                    <Test data={this.state.data}
                        onChangeData={data => this.setState({data})}
                    >test</Test>
                    <div>content</div>
                </ChildrenIntactComponent>
            }, {data: 0});

            instance.$root.unmount();
            expect(container.innerHTML).to.eql('');
        });

        it('should unmount correctly even if intact has changed type of element', async () => {
            const [spyError, resetError] = getSpyError();
            class C extends Component<{total: number}> {
                static template = `if (!this.get('total')) return; <div>{this.get('children')}</div>`;
            }

            const Foo = function(props: {total: number}) {
                return <C total={props.total}><div>test</div></C>
            }

            const Demo = function() {
                const [total, setTotal] = useState(0);

                useEffect(() => {
                    setTotal(1);
                }, []);

                return <Foo total={total} />
            }

            const instance = renderApp(function() {
                return this.state.show ? <Demo /> : null;
            }, {show: true});

            act(() => {
                instance.setState({show: false});
            });

            expect(spyError.callCount).to.eql(0);
            resetError();
        });
    });
});
