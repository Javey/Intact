import ReactDom from 'react-dom';
import {ReactDemo, ReactChildrenDemo} from './reactDemo';
import {data, DataItem} from './data';
import {IntactDemo, IntactReactDemo, IntactReactChildrenDemo, IntactVueDemo} from './intactDemo';
import {render, createVNode} from 'intact';
import {normalize} from 'intact-react';
import {createApp, h} from 'vue';
import VueDemo from './vueDemo.vue';
import {normalize as vueNormalize} from 'intact-vue-next';
import {act} from 'react-dom/test-utils';

export function renderIntactReact(container: HTMLElement) {
    act(() => {
        ReactDom.render(
            <IntactReactDemo
                data={data}
                slotFirstName={(value: DataItem) => value.firstName}
                slotLastName={(value: DataItem) => normalize(<div>{value.lastName}</div>)}
                slotAge={(value: DataItem) => value.age}
                slotAddress={(value: DataItem) => value.address}
                slotAction={(value: DataItem) => normalize(<div>delete</div>)}
            />,
            container
        );
    });
}

export function renderReact(container: HTMLElement) {
    act(() => {
        ReactDom.render(
            <ReactDemo
                data={data}
                firstName={(value: DataItem) => value.firstName}
                lastName={(value: DataItem) => <div>{value.lastName}</div>}
                age={(value: DataItem) => value.age}
                address={(value: DataItem) => value.address}
                action={(value: DataItem) => <div>delete</div>}
            />,
            container
        );
    });
}

export function renderIntact(container: HTMLElement) {
    render(createVNode(IntactVueDemo, {
        data,
        $blocks: {
            'first-name': (_: any, value: DataItem) => value.firstName,
            'last-name': (_: any, value: DataItem) => createVNode('div', null, value.lastName),
            age: (_: any, value: DataItem) => value.age,
            address: (_: any, value: DataItem) => value.address,
            action: (_: any, value: DataItem) => createVNode('div', null, 'delete'),
        }
    }), container);
}

export function renderVue(container: HTMLElement) {
    const app = createApp({
        render() {
            return h(VueDemo, {data: data}, {
                'first-name': (props: {value: DataItem}) => props.value.firstName,
                'last-name': (props: {value: DataItem}) => h('div', null, {default: () => props.value.lastName}),
                age: (props: {value: DataItem}) => props.value.age,
                address: (props: {value: DataItem}) => props.value.address,
                action: () => h('div', null, {default: () => 'delete'}),
            })
        }
    });
    app.mount(container);

    return app;
}

export function renderIntactVue(container: HTMLElement) {
    const app = createApp({
        render() {
            return h(IntactVueDemo, {data: data}, {
                'first-name': (value: DataItem) => value.firstName,
                'last-name': (value: DataItem) => h('div', null, {default: () => value.lastName}),
                age: (value: DataItem) => value.age,
                address: (value: DataItem) => value.address,
                action: () => h('div', null, {default: () => 'delete'}),
            })
        }
    });
    app.mount(container);

    return app;
}
