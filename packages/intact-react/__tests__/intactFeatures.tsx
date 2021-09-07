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
} from './helpers';
import {Component, createVNode as h, findDomFromVNode} from '../src';

describe('Intact React', () => {
    describe('Intact Features', () => {
        describe('Lifecycle', () => {
            it('lifecycle of intact in react', () => {
                const beforeMount = sinon.spy(() => console.log('beforeMount'));
                const mounted = sinon.spy(() => console.log('mounted'));
                const beforeUpdate = sinon.spy(() => console.log('beforeUpdate'));
                const updated = sinon.spy(() => console.log('updated'));
                const beforeUnmount = sinon.spy(() => console.log('beforeUnmount'));
                const unmounted = sinon.spy(() => console.log('unmounted'));

                class Test extends Component {
                    static template = '<div>test</div>';
                    beforeMount = beforeMount;
                    mounted = mounted;
                    beforeUpdate = beforeUpdate;
                    updated = updated;
                    beforeUnmount = beforeUnmount;
                    unmounted = unmounted;
                }
                const test = (counts: number[]) => {
                    expect(beforeMount.callCount).to.eql(counts[0]);
                    expect(mounted.callCount).to.eql(counts[1]);
                    expect(beforeUpdate.callCount).to.eql(counts[2]);
                    expect(updated.callCount).to.eql(counts[3]);
                    expect(beforeUnmount.callCount).to.eql(counts[4]);
                    expect(unmounted.callCount).to.eql(counts[5]);
                }

                const instance = renderApp(function() {
                    return <div>{this.state.show ? <Test /> : undefined}</div>
                }, {show: true, a: 0});

                test([1, 1, 0, 0, 0, 0]);
                expect(beforeMount.calledBefore(mounted)).to.be.true;

                // update
                instance.setState({a: 1});
                test([1, 1, 1, 1, 0, 0]);
                expect(beforeMount.calledBefore(mounted)).to.be.true;

                // destroy
                instance.setState({show: false});
                test([1, 1, 1, 1, 1, 1]);
                expect(beforeUnmount.calledBefore(unmounted)).to.be.true;
            });

            it('lifecycle of react in intact', () => {
                const getDerivedStateFromProps = sinon.spy(function(props: any) {
                    console.log('getDerivedStateFromProps');
                    return props;
                });
                const shouldComponentUpdate = sinon.spy(() => {
                    console.log('shouldComponentUpdate');
                    return true;
                });
                const getSnapshotBeforeUpdate = sinon.spy(() => {
                    console.log('getSnapshotBeforeUpdate');
                    return null;
                });
                const componentDidMount = sinon.spy(() => console.log('componentDidMount'));
                const componentDidUpdate = sinon.spy(() => console.log('componentDidUpdate'));
                const componentWillUnmount = sinon.spy(() => console.log('componentWillUnmount'));
                class Test extends ReactComponent<{a: number}, {a: number}> {
                    static getDerivedStateFromProps = getDerivedStateFromProps;
                    constructor(props: {a: number}) {
                        super(props);
                        this.state = {a: 0};
                    }
                    render() {
                        return <div>{this.state.a}</div>
                    }
                }
                Object.assign(Test.prototype, {
                    shouldComponentUpdate,
                    getSnapshotBeforeUpdate,
                    componentDidMount,
                    componentDidUpdate,
                    componentWillUnmount,
                });
                const instance = renderApp(function() {
                    return <ChildrenIntactComponent>
                        {this.state.a === 3 ? undefined : <Test a={this.state.a} />}
                    </ChildrenIntactComponent>
                }, {a: 1});

                expect(getDerivedStateFromProps.callCount).to.eql(1);
                expect(componentDidMount.callCount).to.eql(1);

                // update
                instance.setState({a: 2});
                expect(getDerivedStateFromProps.callCount).to.eql(2);
                expect(componentDidMount.callCount).to.eql(1);
                expect(shouldComponentUpdate.callCount).to.eql(1);
                expect(getSnapshotBeforeUpdate.callCount).to.eql(1);
                expect(componentDidUpdate.callCount).to.eql(1);

                // destroy
                instance.setState({a: 3});
                // expect(componentWillUnmount.callCount).to.eql(1);
            });

        });

        describe('vNode', () => {
            it('should get $parent of nested intact component', () => {
                class C extends Component {
                    static template = `<div>{this.get('children')}</div>`;
                    mounted() {
                        expect(this.$parent).to.be.null;
                    }
                }
                class D extends Component {
                    static template = `<span>test</span>`;
                    mounted() {
                        expect(this.$parent).be.instanceof(E);
                        expect(this.$parent!.$parent).to.be.instanceof(C);
                    }
                }
                class E extends Component {
                    static template = `<i>{this.get('children')}</i>`;
                    mounted() {
                        expect(this.$parent).to.be.instanceof(C);
                    }
                }
                class F extends Component {
                    static template = `<span>f</span>`;
                    mounted() {
                        // firsthand intact component
                        expect(this.$parent).to.be.instanceof(C);
                    }
                }
                class G extends Component {
                    static template = `<b>g</b>`;
                    mounted() {
                        expect(this.$parent).to.be.instanceof(ChildrenIntactComponent);
                    }
                }

                const instance = renderApp(function() {
                    return <div>
                        <C>
                            <p><E><b><D /></b></E></p>
                            <F />
                            <ChildrenIntactComponent><div><G /></div></ChildrenIntactComponent>
                            <ChildrenIntactComponent><G /></ChildrenIntactComponent>
                        </C>
                        <ChildrenIntactComponent><div>aaa</div></ChildrenIntactComponent>
                    </div>
                });
            });

            it('should get $parent which return by functional component', () => {
                const C = Component.functionalWrapper((props) => {
                    return h(D, props);
                });
                class D extends Component {
                    static template = `<div>test</div>`;
                    mounted() {
                        expect(this.$parent).to.be.instanceof(E);
                    }
                }
                class E extends Component {
                    static template = `<div>{this.get('children')}</div>`
                }

                const instance = renderApp(function() {
                    return (
                        <ChildrenIntactComponent>
                            <E>
                                <div>
                                    <C />
                                </div>
                                <C />
                            </E>
                        </ChildrenIntactComponent>
                    )
                });
            });

            it('should get $parent which nest functional component in functional component', () => {
                const C = Component.functionalWrapper<{className?: string}>((props) => {
                    return h(D, props);
                });
                let firstD = true;
                class D extends Component {
                    static template = `<div>{this.get('children')}</div>`;
                    mounted() {
                        if (firstD) {
                            expect(this.$parent).to.be.null;
                            firstD = false;
                        } else {
                            expect(this.$parent).to.be.instanceof(E);
                        }
                    }
                }

                let e: E;
                class E extends Component<{show?: boolean}> {
                    static template = `<div>{this.get('show') ? this.get('children') : null}</div>`;
                    mounted() {
                        e = this;
                        expect(this.$parent).to.be.instanceof(D);
                    }
                }

                class F extends Component {
                    static template = `<div>{this.get('children')}</div>`;
                    mounted() {
                        // update in updating
                        e.forceUpdate();
                        expect(this.$parent).to.be.instanceof(D);
                        expect(this.$parent!.$parent).to.be.instanceof(E);
                        expect(this.$parent!.$parent!.$parent).to.be.instanceof(D);
                    }
                }

                const instance = renderApp(function() {
                    return (
                        <C className="a">
                            <i>test</i>
                            <E>
                                <C className="b">
                                    <F><span>test</span></F>
                                </C>
                            </E>
                        </C>
                    )
                });
                e!.set('show', true);
            });
        });
    });
});
