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
    renderApp
} from './helpers';
import {Component, createVNode as h, findDomFromVNode} from '../src';
import ReactDOM from 'react-dom';

describe('Intact React', () => {
    describe('Update', () => {
        it('update intact component', () => {
            const instance = renderApp(function() {
                return <PropsIntactComponent a={this.state.a} />
            }, {a: 1});
            act(() => {
                instance.setState({a: 2});
            });
            expect(container.innerHTML).to.eql('<div>a: 2 b: </div>');
        });

        it('update react element with string', () => {
            const instance = renderApp(function() {
                return (
                    <ChildrenIntactComponent>
                        {this.state.a === 1 ? <div>a</div> : 'b'}
                    </ChildrenIntactComponent>
                )
            }, {a: 1});
            act(() => {
                instance.setState({a: 2});
            });
            expect(container.innerHTML).to.eql('<div>b</div>');
            act(() => {
                instance.setState({a: 1});
            });
            expect(container.innerHTML).to.eql('<div><div>a</div>#</div>');
        });

        it('update react element in intact component', () => {
            const instance = renderApp(function() {
                return (
                    <ChildrenIntactComponent>
                        <div>{this.state.a}</div>
                    </ChildrenIntactComponent>
                )
            }, {a: 1});
            act(() => {
                instance.setState({a: 2});
            });
            expect(container.innerHTML).to.eql('<div><div>2</div>#</div>');
        });

        it('insert and append intact component in react element', () => {
            const C = createIntactComponent(`<div>`)
            const instance = renderApp(function() {
                return (
                    <div>
                        {this.state.list.map((item: number, index: number) => {
                            return <ChildrenIntactComponent key={item}>{item}</ChildrenIntactComponent>
                        })}
                    </div>
                );
            }, {list: [1, 2]});
            const node2 = container.firstElementChild!.children[1]!
            act(() => {
                instance.setState({list: [2]});
            });
            expect(container.innerHTML).to.eql('<div><div>2</div></div>')
            expect(container.firstElementChild!.children[0]).to.eql(node2);

            act(() => {
                instance.setState({list: [1, 2, 3]});
            });
            expect(container.innerHTML).to.eql('<div><div>1</div><div>2</div><div>3</div></div>')
            expect(container.firstElementChild!.children[1]).to.eql(node2);
        });

        it('insert and append react element in intact component', () => {
            const instance = renderApp(function() {
                return (
                    <ChildrenIntactComponent>
                        {this.state.list.map((item: number, index: number) => {
                            return <div key={item}>{item}</div>
                        })}
                    </ChildrenIntactComponent>
                )
            }, {list: [1, 2]});
            const node2 = container.firstElementChild!.children[1]!
            act(() => {
                instance.setState({list: [2]});
            });
            expect(container.innerHTML).to.eql('<div><div>2</div>#</div>')
            expect(container.firstElementChild!.children[0]).to.eql(node2);

            act(() => {
                instance.setState({list: [1, 2, 3]});
            });
            expect(container.innerHTML).to.eql('<div><div>1</div>#<div>2</div>#<div>3</div>#</div>')
            expect(container.firstElementChild!.children[1]).to.eql(node2);
        });

        it('insert react element before intact component', () => {
            const instance = renderApp(function() {
                return (
                    <div>
                        {this.state.show ? <div>show</div> : undefined}
                        <SimpleIntactComponent />
                    </div>
                );
            }, {show: false});
            act(() => {
                instance.setState({show: true});
            });
            expect(container.innerHTML).to.eql('<div><div>show</div><div>Intact Component</div></div>');
        });

        it('insert node before react element in intact component', () => {
            class Button extends Component<{loading: boolean}> {
                static template = `
                    const loading = this.get('loading');
                    <div>
                        <div v-if={loading} key="loading">Loading...</div>
                        {this.get('children')}
                    </div>
                `
            }
            const instance = renderApp(function() {
                return <Button loading={this.state.loading}><span>test</span></Button>;
            }, {loading: false});

            act(() => {
                instance.setState({loading: true});
            });
            expect(container.innerHTML).to.eql('<div><div>Loading...</div><span>test</span>#</div>');
        });

        it('insert keyed react element before non-keyed element in Intact component', () => {
            class Test extends Component {
                static template = `
                    const C = this.C;
                    <div>{this.get('children')}<C ref="c" /></div>
                `;
                C = SimpleIntactComponent;
            }
            const instance = renderApp(function() {
                return <Test ref="c">
                    {this.state.show ? <div key="test">test</div> : undefined}
                </Test>
            }, {show: false});

            (instance.refs.c as any).refs.c.test = true;
            act(() => {
                instance.setState({show: true});
            });
            expect((instance.refs.c as any).refs.c.test).to.be.true;
        });

        it('the updated lifecycle of intact should be called after all children has updated when call its update method directly', async () => {
            const updated = sinon.spy();
            class Test extends Component<{}, {}, {test: number}> {
                static template = `<div ref="a"><b:test params={[this.get('v')]} /></div>`;
                static defaults() {
                    return {v: 1};
                }
                updated() {
                    updated();
                    expect(this.refs.a.innerHTML).to.eql('<i>2</i>#');
                }
            }
            const instance = renderApp(function() {
                return (
                    <Test 
                        slotTest={(v: number) => {
                            return v === 1 ?
                                <SimpleReactComponent>{v}</SimpleReactComponent> :
                                <i>{v}</i>
                        }}
                        ref={(i: any) => {
                            this.i = i;
                        }}
                    />
                );
            });
            (instance as any).i.set('v', 2);
            await wait();
            expect(updated.callCount).to.eql(1);
        });

        it('update intact component itself with react element', () => {
            const C = createIntactComponent(`
                <div ev-click={this.set.bind(this, 'show', !this.get('show'))}>
                    <span v-if={this.get('show')}>intact</span>
                    <div v-else>{this.get('children')}</div>
                </div>
            `);
            const instance = renderApp(function() {
                return <C><div>react</div></C>
            });
            (container.firstElementChild as HTMLElement).click();
            (container.firstElementChild as HTMLElement).click();
            expect(container.innerHTML).to.eql('<div><div><div>react</div>#</div></div>');
        });

        it('update intact component which children is react element', async () => {
            const mounted = sinon.spy();
            let isNull = false;
            class C extends Component {
                static template = `<template>{this.get('children')}</template>`;
                mounted() {
                    mounted();
                    const element = findDomFromVNode(this.$vNode, true) as HTMLElement;
                    if (isNull) {
                        // Text
                        expect(element.nodeType).to.eql(3);
                    } else {
                        expect(element.outerHTML).to.eql('<div>react</div>');
                    }
                }
            }
            class D extends Component<{show?: boolean}> {
                static template = `
                    const {C} = this;
                    <div><C v-if={this.get('show')}>{this.get('children')}</C></div>
                `;
                C = C;
            }
            let d!: D;
            const instance = renderApp(function() {
                return <D ref={(i: any) => d = i}><div>react</div></D>
            });
            d.set('show', true);
            await wait();
            expect(container.innerHTML).to.eql('<div><div>react</div>#</div>');

            // destroy
            d.set('show', false);
            await wait();
            expect(container.innerHTML).to.eql('<div></div>');

            d.forceUpdate();
            await wait();
            expect(container.innerHTML).to.eql('<div></div>');
            expect(mounted.callCount).to.eql(1);

            // empty react component
            isNull = true;
            function Null() {
                return null
            }
            const instance1 = renderApp(function() {
                return <D ref={(i: any) => d = i}><Null /></D>
            });

            d.set('show', true);
            await wait();
            expect(container.innerHTML).to.eql('<div>#</div>');

            // destroy
            d.set('show', false);
            await wait();
            expect(container.innerHTML).to.eql('<div></div>');
        });

        it('update block', async () => {
            const C = createIntactComponent<{}, {}, {test: null}>(`<div><b:test /></div>`);
            let c: Component;
            const instance = renderApp(function() {
                return <C ref={(i: any) => c = i}
                    slotTest={<Fragment><SimpleIntactComponent /></Fragment>}
                ></C>
            });

            c!.forceUpdate();
            await wait();
            expect(container.innerHTML).to.eql('<div><div>Intact Component</div></div>');

            c!.forceUpdate();
            await wait();
            expect(container.innerHTML).to.eql('<div><div>Intact Component</div></div>');

            instance.forceUpdate();
            expect(container.innerHTML).to.eql('<div><div>Intact Component</div></div>');
            instance.forceUpdate();
            expect(container.innerHTML).to.eql('<div><div>Intact Component</div></div>');
        });

        it('update in receive props', () => {
            class C extends Component<{count: number}> {
                static template = `<div>{this.get('count')}</div>`;
                init() {
                    this.on('$receive:count', (v) => {
                        if (v === 1) {
                            this.set('count', 0);
                        }
                    });
                }
            }
            const instance = renderApp(function() {
                return <ChildrenIntactComponent>
                    <C count={this.state.count} />
                </ChildrenIntactComponent>
            }, {count: 0});
            act(() => {
                instance.setState({count: 1});
            });
            expect(container.innerHTML).to.eql('<div><div>0</div></div>');
            act(() => {
                instance.setState({count: 2});
            });
            expect(container.innerHTML).to.eql('<div><div>2</div></div>');
        });

        it('update react children with wrapper element', async () => {
            class C extends Component<{wrapper?: boolean}> {
                static template = `
                    <div>
                        {this.get('wrapper') ?
                            <div>{this.get('children')}</div> :
                            this.get('children')
                        }
                    </div>
                `
                static defaults() {
                    return {wrapper: false}
                }
            }

            let c: C;
            const instance = renderApp(function() {
                return <C ref={(i: any) => c = i}><div>test</div></C>
            });

            c!.set('wrapper', false);
            await wait();
            expect(container.innerHTML).to.eql('<div><div>test</div>#</div>');

            c!.set('wrapper', true);
            await wait();
            expect(container.innerHTML).to.eql('<div><div><div>test</div>#</div></div>');
        });

        it('should remove intact functional component that return element directly', () => {
            const DirectComponent = createIntactComponent(
                `<template>{this.get('children')}</template>`
            );
            const Test = Component.functionalWrapper(function(props) {
                return h(DirectComponent, props);
            });

            const root = render(
                <div>
                    <Test>
                        <span>test</span>
                    </Test>
                </div>
            );

            expect(container.innerHTML).to.eql('<div><span>test</span>#</div>');

            root.render(null as any);
            expect(container.innerHTML).to.eql('');
        });

        it('should remove react element in slot', () => {
            class Test extends Component<{data: string[]}, {}, {test: string}> {
                static template = `<div>
                    <div v-for={this.get('data')}>
                        <b:test params={$value} />
                    </div>
                </div>`
            }
            const instance = renderApp(function() {
                return <Test data={this.state.data} slotTest={(data) => {
                    return <div onClick={remove} className="click">{data}</div>
                }}/>
            }, {data: [1, 2]});

            function remove() {
                act(() => {
                    instance.setState({data: [1]});
                });
            }

            container.querySelector<HTMLElement>('.click')!.click();

            expect(container.innerHTML).to.eql('<div><div><div class="click">1</div>#</div></div>')
        });

        it('update intact component that return different dom', () => {
            class Test extends Component<{show?: boolean}> {
                static template = `if (!this.get('show')) { return null } <template>{this.get('children')}</template>`;
            }

            const instance = renderApp(function() {
                return <div><Test show={this.state.show}><span>show</span></Test></div>
            }, {show: false});

            act(() => {
                instance.setState({show: true});
            });
            expect(container.innerHTML).to.eql('<div><span>show</span>#</div>');

            act(() => {
                instance.setState({show: false});
            });
            expect(container.innerHTML).to.eql('<div></div>');
        });

        it('replace component that return react element directly with react element', () => {
            class C extends Component {
                static template = `<template>{this.get('children')}</template>`
            }
            class D extends ReactComponent {
                state = {
                    show: true,
                }

                render() {
                    return <div>
                        {this.state.show ?
                            <C>
                                <div>a</div>
                            </C> :
                            <div>b</div>
                        }
                    </div>
                }
            }

            let ref: D;
            render(<D ref={(i: any) => ref = i}/>);

            act(() => {
                ref!.setState({show: false});
            });
            expect(container.innerHTML).to.eql('<div><div>b</div></div>');

            act(() => {
                ref!.setState({show: true});
            });
            expect(container.innerHTML).to.eql('<div><div>a</div>#</div>');
        });

        it('unmount react component that returns intact component directly', () => {
            function Hoc(props: {children: ReactNode}) {
                // return <div>{props.children}</div>;
                return props.children || null;
            }
            class HocComponent extends Component {
                static template = `<template>{this.get('children')}</template>`;
                // mounted() {
                    // console.log(findDomFromVNode(this.$vNode, true));
                // }
            }

            const root = render(
                <HocComponent>
                    <Hoc>
                        <HocComponent>
                            <div>test</div>
                        </HocComponent>
                    </Hoc>
                </HocComponent>
            );
            expect(container.innerHTML).to.eql('#<div>test</div>#');

            root.render(
                <HocComponent>
                    <Hoc>
                    </Hoc>
                </HocComponent>,
            );
            expect(container.innerHTML).to.eql('#');

            root.render(
                <HocComponent>
                </HocComponent>,
            );
            expect(container.innerHTML).to.eql('');
        });

        it('replace intact component with react element', async () => {
            const instance = renderApp(function() {
                return <ChildrenIntactComponent>
                    {this.state.show ?
                        <ChildrenIntactComponent>1</ChildrenIntactComponent> :
                        <div>2</div>
                    }
                </ChildrenIntactComponent>
            }, {show: true});
            
            act(() => {
                instance.setState({show: false});
            });
            expect(container.innerHTML).to.eql('<div><div>2</div>#</div>');
        });

        describe('Multiple vNodes Component', () => {
            class Test extends Component {
                static $doubleVNodes = true;
                static template = `<template><div>1</div><div>2</div></template>`;
            }

            it('remove component', () => {
                const instance = renderApp(function() {
                    return this.state.show ? <Test /> : null;
                }, {show: true});;

                act(() => {
                    instance.setState({show: false});
                });
            });
        });
    });
});
