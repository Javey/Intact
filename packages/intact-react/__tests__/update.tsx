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

describe('Intact React', () => {
    describe('Update', () => {
        it('update intact component', () => {
            const instance = renderApp(function() {
                return <PropsIntactComponent a={this.state.a} />
            }, {a: 1});
            instance.setState({a: 2});
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
            instance.setState({a: 2});
            expect(container.innerHTML).to.eql('<div>b</div>');
            instance.setState({a: 1});
            expect(container.innerHTML).to.eql('<div><div>a</div></div>');
        });

        it('update react element in intact component', () => {
            const instance = renderApp(function() {
                return (
                    <ChildrenIntactComponent>
                        <div>{this.state.a}</div>
                    </ChildrenIntactComponent>
                )
            }, {a: 1});
            instance.setState({a: 2});
            expect(container.innerHTML).to.eql('<div><div>2</div></div>');
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
            instance.setState({list: [2]});
            expect(container.innerHTML).to.eql('<div><div>2</div></div>')
            expect(container.firstElementChild!.children[0]).to.eql(node2);

            instance.setState({list: [1, 2, 3]});
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
            instance.setState({list: [2]});
            expect(container.innerHTML).to.eql('<div><div>2</div></div>')
            expect(container.firstElementChild!.children[0]).to.eql(node2);

            instance.setState({list: [1, 2, 3]});
            expect(container.innerHTML).to.eql('<div><div>1</div><div>2</div><div>3</div></div>')
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
            instance.setState({show: true});
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

            instance.setState({loading: true});
            expect(container.innerHTML).to.eql('<div><div>Loading...</div><span>test</span></div>');
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
            instance.setState({show: true});
            expect((instance.refs.c as any).refs.c.test).to.be.true;
        });

        it('the updated lifecycle of intact should be called after all children has updated when call its update method directly', () => {
            return;
            const updated = sinon.spy();
            class Test extends Component {
                static template = `<div ref="a"><b:test params={[this.get('v')]} /></div>`;
                static defaults() {
                    return {v: 1};
                }
                updated() {
                    updated();
                    expect(this.refs.a.innerHTML).to.eql('<i>2</i>');
                }
            }
            const instance = renderApp(function() {
                return (
                    <Test 
                        slot-test={(v: number) => {
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
            expect(container.innerHTML).to.eql('<div><div><div>react</div></div></div>');
        });

        it('update intact component which children is react element', async () => {
            const mounted = sinon.spy();
            class C extends Component {
                static template = `<template>{this.get('children')}</template>`;
                mounted() {
                    mounted();
                    const element = findDomFromVNode(this.$vNode, true) as HTMLElement;
                    expect(element.outerHTML).to.eql('<div>react</div>');
                }
            }
            class D extends Component {
                static template = `
                    const {C} = this;
                    <div><C v-if={this.get('show')}>{this.get('children')}</C></div>
                `;
                C = C;
            }
            let d: any;
            const instance = renderApp(function() {
                return <D ref={(i: any) => d = i}><div>react</div></D>
            });
            d.set('show', true);
            await wait();
            expect(container.innerHTML).to.eql('<div><div>react</div></div>');

            // destroy
            d.set('show', false);
            await wait();
            expect(container.innerHTML).to.eql('<div></div>');

            d.forceUpdate();
            await wait();
            expect(container.innerHTML).to.eql('<div></div>');
            expect(mounted.callCount).to.eql(1);
        });
    });
});
