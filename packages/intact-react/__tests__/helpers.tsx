import React, {ReactElement, Component as ReactComponent, ReactNode} from 'react';
import ReactDOM from 'react-dom';
import {Component} from '../src';

export let container: HTMLDivElement;
export function render(vNode: ReactElement) {
    container = document.createElement('div');
    document.body.appendChild(container);
    // ReactDOM.createRoot(container).render(vNode);
    ReactDOM.render(vNode, container);
}

export function createIntactComponent(template: string) {
    return class extends Component {
        static template = template;
    }
}

export class SimpleIntactComponent extends Component {
    static template = `<div>Intact Component</div>`;
}

export class ChildrenIntactComponent extends Component {
    static template = `<div>{this.get('children')}</div>`
}

// class ChildrenIntactComponent extends ReactComponent<{a: number}> {
//     // static template = `<div>{this.get('children')}</div>`
//     render() {
//         return <div></div>
//     }
// }
export class SimpleReactComponent extends React.Component<{children?: ReactNode | undefined}> {
    render() {
        return <div>{this.props.children}</div>
    }
}

export class PropsIntactComponent extends Component<{a?: string | number, b?: string | number}> {
    static template = `<div>a: {this.get('a')} b: {this.get('b')}</div>`;
}

export function expect(input: any) {
    if (typeof input === 'string') {
        input = input.replace(/<!-- react-mount-point-unstable -->/g, '#');
    }
    return (window as any).expect(input);
}

export function wait(time: number = 0) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

export function renderApp<P>(_render: (this: any) => ReactNode, state?: P): ReactComponent<{}, P> {
    let instance: ReactComponent<{}, P>;
    class App extends ReactComponent<{}, P> {
        constructor(props: {}) {
            super(props);
            instance = this;
            (window as any).vm = instance;
            if (state) {
                this.state = state;
            }
        }
        render() {
            return _render.call(this);
        }
    }
    render(<App />);

    return instance!;
}

