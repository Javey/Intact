import React, {Component, ReactElement} from 'react'
import ReactDOM from 'react-dom'

export let container: HTMLDivElement;
export function render(vNode: ReactElement) {
    container = document.createElement('div');
    document.body.appendChild(container);
    ReactDOM.render(vNode, container);
}

