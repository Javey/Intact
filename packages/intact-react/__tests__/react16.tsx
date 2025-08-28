import React, {Component as ReactComponent, ReactNode, Fragment, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {Portal} from './portal';
import {act} from 'react-dom/test-utils';
import {callAll, Component, createVNode} from '../src';
import { wait, getSpyError } from './helpers';

describe('Intact React 16', () => {
    it('render portal', async () => {
        const container = document.createElement('div');
        document.body.appendChild(container);

        class Dialog extends Component<{show?: boolean}> {
            static template = `const Portal = this.Portal;
                <Portal>
                    <div class="k-dialog react-16">
                        <template v-if={this.get('show')}>
                            {this.get('children')}
                            <div class="k-dialog-footer" ev-click={this.close}>X</div>
                        </template>
                    </div>
                </Portal>
            `
            static defaults() {
                return { show: true };
            }

            private Portal = Portal;

            close = () => {
                this.set('show', false);
            }

            show() {
                const mountedQueue = this.$mountedQueue = [];
                this.$init(null);
                const vNode = this.$vNode;
                vNode.children = this;
                this.$render(null, vNode, document.body, null, mountedQueue);
                callAll(mountedQueue);
            }
        }

        function App() {
            function show() {
                const dialog = new Dialog({}, createVNode(Dialog));
                dialog.show();
            }

            return <div onClick={show}>show</div>
        }

        const [spyError, resetError] = getSpyError();

        act(() => {
            ReactDOM.render(<App />, container);
        });

        (container.firstElementChild as HTMLElement).click(); 
        await wait();

        const dialog = document.querySelector('.k-dialog.react-16')!;
        expect(dialog.innerHTML).to.eql('<div class="k-dialog-footer">X</div>');
        const close = dialog.querySelector('.k-dialog-footer') as HTMLElement;
        close.click();
        await wait();
        expect(spyError.callCount).to.eql(0);
        resetError();
        expect(dialog.innerHTML).to.eql('');
    });
});
