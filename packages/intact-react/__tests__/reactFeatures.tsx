import React, {Component as ReactComponent, ReactNode, Fragment} from 'react';
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
} from './helpers';
import ReactDOM from 'react-dom';
import {Component, createVNode as h, findDomFromVNode, createRef, VNode} from '../src';
import {act} from 'react-dom/test-utils';

describe('Intact React', () => {
    describe('React Features', () => {
        it('ReactDom.findDOMNode', () => {
            const refs: any = {};
            render(<div>
                <ChildrenIntactComponent ref={(i: any) => refs.a = i}>
                    <div>test</div>
                </ChildrenIntactComponent>
                <SimpleReactComponent ref={(i: any) => refs.b = i}>
                    <ChildrenIntactComponent ref={(i: any) => refs.c = i}>test</ChildrenIntactComponent>
                </SimpleReactComponent>
            </div>);

            expect((ReactDOM.findDOMNode(refs.a) as HTMLElement).outerHTML).to.eql('<div><div>test</div>#</div>');
            expect((ReactDOM.findDOMNode(refs.b) as HTMLElement).outerHTML).to.eql('<div><div>test</div></div>');
            expect((ReactDOM.findDOMNode(refs.c) as HTMLElement).outerHTML).to.eql('<div>test</div>');
        });

        it('React.createRef', () => {
            const ref1 = React.createRef<ChildrenIntactComponent>();
            const ref2 = React.createRef<SimpleIntactComponent>();
            render(<div>
                <ChildrenIntactComponent ref={ref1}>
                    <SimpleIntactComponent ref={ref2} />
                </ChildrenIntactComponent>
            </div>);

            expect(ref1.current).be.an.instanceof(ChildrenIntactComponent);
            expect(ref2.current).be.an.instanceof(SimpleIntactComponent);
        });

        it('ref conflict', () => {
            class C extends Component {
                static template = `<div ref="a">test</div>`;
                mounted() {
                    expect(this.refs.a.outerHTML).to.eql('<div>test</div>');
                }
            }

            render(<div><C /></div>);
        });

        describe('New Context Api', () => {
            it('should render new context api correctly', async () => {
                const Context = React.createContext<string | null>(null);
                class Test extends Component<{show?: boolean}> {
                    static template = `<div>{this.get('show') ? this.get('children') : null}</div>`;
                }
                let test: Test | null = null;
                function Parent(props: {value: string}) {
                    return (
                        <div>
                            <Context.Provider value={props.value}>
                                <ChildrenIntactComponent>
                                    <Child />
                                    <header>
                                        <Test ref={(i: Test | null) => {test = i}}>
                                            <Child />
                                        </Test>
                                    </header>
                                    <div>hello</div>
                                </ChildrenIntactComponent>
                            </Context.Provider>
                            <Child />
                        </div>
                    );
                }
                function Child() {
                    return (
                        <Context.Consumer>
                            {value => {
                                return <div>{value}</div>
                            }}
                        </Context.Consumer>
                    );
                }
                const root = render(<Parent value="a" />);
                expect(container.innerHTML).to.eq('<div><div><div>a</div>#<header><div></div></header>#<div>hello</div>#</div><div></div></div>');
                root.render(<Parent value="b" />);
                expect(container.innerHTML).to.eq('<div><div><div>b</div>#<header><div></div></header>#<div>hello</div>#</div><div></div></div>');
                test!.set('show', true);
                await wait();
                expect(container.innerHTML).to.eq('<div><div><div>b</div>#<header><div><div>b</div>#</div></header>#<div>hello</div>#</div><div></div></div>');
            });

            it('nested new context api should keep order', () => {
                const Context = React.createContext<string | null>(null);
                render(
                    <Context.Provider value="a">
                        <ChildrenIntactComponent>
                            <Context.Provider value="b">
                                <Context.Provider value="c">
                                    <ChildrenIntactComponent>
                                        <Context.Consumer>
                                            {value => <div>{value}</div>}
                                        </Context.Consumer>
                                    </ChildrenIntactComponent>
                                </Context.Provider>
                            </Context.Provider>
                        </ChildrenIntactComponent>
                    </Context.Provider>
                );
                expect(container.innerHTML).to.eq('<div>#<div><div>c</div>#</div></div>');
            });

            it('should get element that element nested new context api', () => {
                const Context = React.createContext<null>(null);
                class Test extends Component {
                    static template = `<template>{this.get('children')}</template>`;
                    mounted() {
                        const element = findDomFromVNode(this.$vNode, true) as HTMLElement;
                        expect(element.outerHTML).to.eql('<div>test</div>');
                    }
                }
                render(
                    <Context.Provider value={null}>
                        <Test>
                            <div>test</div>
                        </Test>
                    </Context.Provider>
                );
            });

            it('should update children when provider\'s children don\'t change and are wrapped by Intact component', () => {
                const Context = React.createContext<string | null>(null);
                const ChildContext = React.createContext<string | null>(null);
                class Parent extends ReactComponent<{children?: ReactNode}> {
                    state = {
                        value: 'a'
                    };
                    click() {
                        this.setState({value: 'b'});
                    }
                    render() {
                        return <Context.Provider value={this.state.value}>
                            <ChildContext.Provider value={null}>
                                {this.props.children}
                            </ChildContext.Provider>
                        </Context.Provider>
                    }
                }
                function Child() {
                    return (
                        <Context.Consumer>
                            {value => {
                                return <div>{value}</div>
                            }}
                        </Context.Consumer>
                    );
                }

                let instance: Parent | null;
                render(
                    <Parent ref={(i: Parent | null) => instance = i}>
                        <ChildrenIntactComponent>
                            <Child />
                        </ChildrenIntactComponent>
                    </Parent>
                );
                act(() => {
                    instance!.click();
                });

                expect(container.innerHTML).to.eq('<div><div>b</div>#</div>');
            });
        });
    });
});
