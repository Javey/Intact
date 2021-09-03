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
                const mounted = sinon.spy(() => {
                    console.log('mounted');
                });
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
    });
});
