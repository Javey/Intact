import React, {ReactElement, Component as ReactComponent, ReactNode} from 'react';
// import {createRoot} from 'react-dom/client';
import {act} from 'react-dom/test-utils';
import {Component} from '../src';

export let container: HTMLDivElement;
export function render(vNode: ReactElement): any {
    // (global as any).IS_REACT_ACT_ENVIRONMENT = true;

    // container = document.createElement('div');
    // document.body.appendChild(container);
    // const root = createRoot(container);
    // act(() => {
        // root.render(vNode);
    // });

    // return {
        // render: (vNode: ReactElement) => {
            // act(() => {
                // root.render(vNode);
            // });
        // },
        // unmount: () => {
            // act(() => {
                // root.unmount();
            // });
        // }
    // }
    // ReactDOM.render(vNode, container);
}

export function createIntactComponent<P = {}, E = {}, B = {}>(template: string) {
    return class extends Component<P, E, B> {
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

export function renderApp<P>(_render: (this: any) => ReactNode, state?: P): ReactComponent<{}, P> & {$root: ReturnType<typeof render>} {
    let instance: ReactComponent<{}, P> & {$root: ReturnType<typeof render>};
    class App extends ReactComponent<{}, P> {
        constructor(props: {}) {
            super(props);
            instance = this as any;
            (window as any).vm = instance;
            if (state) {
                this.state = state;
            }
        }
        render() {
            return _render.call(this);
        }
    }
    const root = render(<App />);

    instance!.$root = root;

    return instance!;
}

export function getSpyError() {
    const error = console.error;
    const spyError = sinon.spy((...args: any[]) => {
        error.apply(console, ['Spy Error:', ...args]);
    });
    console.error = spyError 

    return [spyError, () => console.error = error];
}
