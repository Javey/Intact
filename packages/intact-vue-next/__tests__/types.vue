<template>
    <IntactComponent :test="test" :component="component" :name="1" @xxx="a" />
    <IntactComponent name="1" @hello="b" @test="a" />
    <Test :name="1" @hello="a" @test="b">
        <template v-slot:header="data">
            aaa {{ data.a }}
        </template>
    </Test>
    <Test />
</template>
<script lang="tsx">
import {Component} from '../src';
import {h, defineComponent} from 'vue';

type Props = {
    name: string
}

interface Events {
    hello: [number]
    test: []
}

class IntactComponent extends Component<Props, Events> {
    static template = `<div>{this.get('test')}{this.get('component')}</div>`;
    a() {
        this.get()
    }
}

const Test = defineComponent({
    props: {
        name: String
    },
    emits: {
        test() {

        },
        hello() {

        }
    },
    methods: {
        a() {
            this.$emit('xxx');
        },
        b(n: number) {

        },
        c(a: string, b: string) {

        }
    },
    render() {
        // @ts-expect-error
        <IntactComponent />;
        <IntactComponent name="1" onTest={this.a} />;
        // @ts-expect-error
        <IntactComponent name="1" onTest={this.b} />;
        <IntactComponent name="1" onHello={this.a} />;
        <IntactComponent name="1" onHello={this.b} />;
        // @ts-expect-error
        <IntactComponent name="1" a={1} />;
        <IntactComponent name="1" class="a" onClick={this.a} />;
        // @ts-expect-error
        <IntactComponent name="1" onChange:name={this.b} />;
        <IntactComponent name="1" onChange:name={this.c} />;

        return <Test onHello={this.$forceUpdate} />
    }
});

export default defineComponent({
    components: {
        IntactComponent, Test
    },
    data() {
        return {
            test: Component.normalize(h('div', null, 'test')),
            component: Component.normalize(h(IntactComponent))
        }
    },
    methods: {
        a() {

        },
        b(a: number) {

        }
    }
});
</script>
