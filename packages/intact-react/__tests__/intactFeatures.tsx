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
                const instance = renderApp(function() {
                    return <div>{this.state.show ? <Test /> : undefined}</div>
                }, {show: true, a: 0});

                
                // update
                instance.setState({a: 1});
                // expect(.callCount).to.eql(1);
                // expect(_mount.callCount).to.eql(1);
                // expect(_update.callCount).to.eql(1);

                // destroy
                instance.setState({show: false});
                // expect(_destroy.callCount).to.eql(1);
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
                        console.log(this.$parent);
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
                        console.log(this.$parent);
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
