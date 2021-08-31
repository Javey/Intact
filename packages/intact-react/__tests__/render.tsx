import {render, container} from './helpers';
import {Component, createVNode as h} from '../src';
import {Component as ReactComponent, ReactNode, Fragment} from 'react';
import ReactDOM from 'react-dom';

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
    render() {
        return <div>{this.props.children}</div>
    }
}

class PropsIntactComponent extends Component<{a?: string | number, b?: string | number}> {
    static template = `<div>a: {this.get('a')} b: {this.get('b')}</div>`;
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
            expect(container.innerHTML).to.eql('<div><div>test</div></div>');
        });

        it('render react component in intact component', () => {
            render(
                <ChildrenIntactComponent>
                    <SimpleReactComponent>test1</SimpleReactComponent>
                    <SimpleReactComponent>test2</SimpleReactComponent>
                </ChildrenIntactComponent>
            );
            expect(container.innerHTML).to.eql('<div><div>test1</div><div>test2</div></div>');
        });

        it('render nested react and intact component', () => {
            render(
                <ChildrenIntactComponent>
                    <SimpleReactComponent>
                        <ChildrenIntactComponent>test</ChildrenIntactComponent>
                    </SimpleReactComponent>
                </ChildrenIntactComponent>
            );
            expect(container.innerHTML).to.eql('<div><div><div>test</div></div></div>');
        });

        it('render with props', () => {
            render(<PropsIntactComponent a="a" b={1} />);
            expect(container.innerHTML).to.eql('<div>a: a b: 1</div>');
        });

        it('render react element with event', () => {
            const click = sinon.spy((event: Event) => {
                console.log('click', event);
                expect((event.target as HTMLElement).tagName).to.eql('DIV');
            });
            render(
                <ChildrenIntactComponent>
                    <div onClick={click}>click</div>
                    <div onClick={click}>click</div>
                </ChildrenIntactComponent>
            );

            (container.firstElementChild!.firstElementChild! as HTMLElement).click();
            expect(click.callCount).to.eql(1);
        });

        it('render nested array children', () => {
            render(
                <ChildrenIntactComponent>
                    {[1, 2].map(item => <div key={item}>{item}</div>)}
                    <div>3</div>
                </ChildrenIntactComponent>
            );
            expect(container.innerHTML).to.eql('<div><div>1</div><div>2</div><div>3</div></div>');
        });

        it('render react component which return null', () => {
            function Null() {
                return null;
            }
            function NotNull() {
                return <div>test</div>
            }
            render(
                <ChildrenIntactComponent>
                    <Null />
                    <NotNull />
                </ChildrenIntactComponent>
            );
            ReactDOM.render(
                <ChildrenIntactComponent>
                    <NotNull />
                </ChildrenIntactComponent>,
                container
            );
            expect(container.innerHTML).to.eql('<div><div>test</div></div>');
        });

        describe('Normalize', () => {
            it('normalize events', () => {
                class C extends Component<{onClick: Function, value?: number, on: string}> {
                    static template = `<div ev-click={this.onClick.bind(this)}>click {this.get('on')}</div>`;

                    onClick() {
                        this.set('value', 1);
                        this.trigger('click');
                    }
                }

                const click = sinon.spy(() => console.log('click'));
                const change = sinon.spy(() => console.log('change'));
                render(<div><C onClick={click} on$change-value={change} on="1"/></div>);

                (container.firstElementChild!.firstElementChild! as HTMLElement).click();
                expect(container.innerHTML).to.eql('<div><div>click 1</div></div>');
                expect(click.callCount).to.eql(1);
                expect(change.callCount).to.eql(1);
            });

            it('normalize bloks', () => {
                class C extends Component {
                    static template = (`<div>{this.get('children')}<b:footer /></div>`);
                }

                render(<C slot-footer={<span>footer</span>}>children</C>);
                expect(container.innerHTML).to.eql('<div>children<span>footer</span></div>');

                render(<C slot-footer={'footer'}>children</C>);
                expect(container.innerHTML).to.eql('<div>childrenfooter</div>');
            });

            it('normalize scope blocks', () => {
                class C extends Component {
                    static template = (`<div>{this.get('children')}<b:footer params={1} /></div>`);
                }
                render(<C slot-footer={(i: number) => <span>footer{i}</span>}>children</C>);

                expect(container.innerHTML).to.eql('<div>children<span>footer1</span></div>');
            });

            it('normalize the property which value is vNodes', () => {
                class C extends Component<{test: ReactNode}> {
                    static template = `<div>{this.normalize(this.get('test'))}</div>`
                    private normalize = Component.normalize;
                }
                render(<C test={<div>test</div>} />);

                expect(container.innerHTML).to.eql('<div><div>test</div></div>');
            });

            it('normalize React.Fragment', () => {
                class C extends Component {
                    static template = `<div>{this.get('children')}</div>`;
                }
                render(<C><>react</></C>);
            });
        });

        describe('Functional Component', () => {
            it('render intact functional component', () => {
                const Test = Component.functionalWrapper<{}>(function(props) {
                    return h(ChildrenIntactComponent, props);
                });
                render(<Test>test</Test>);
                expect(container.innerHTML).to.eql('<div>test</div>');

                const Tests = Component.functionalWrapper(function(props) {
                    return [
                        h(ChildrenIntactComponent, props),
                        h(ChildrenIntactComponent, props),
                    ];
                });
                render(<Tests>test<i>test</i></Tests>);
                expect(container.innerHTML).to.eql('<div>test<i>test</i></div><div>text</div>test');

                render(<div><Tests>test1</Tests><Tests>test2</Tests></div>);
                expect(container.innerHTML).to.eql('<div><div>test1</div><div>text</div>test<div>test2</div><div>text</div>test</div>');
            });
        });
    });
});
