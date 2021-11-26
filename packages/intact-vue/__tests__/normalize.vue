<template>
    <IntactComponent :test="test" :component="component"/>
</template>
<script lang="tsx">
import {Component} from '../src';
import Vue from 'vue';

type Props = {
    name?: string
}

class IntactComponent extends Component<Props> {
    static template = `<div>{this.get('test')}{this.get('component')}</div>`;
}

export default ({
    components: {
        IntactComponent
    },
    data(this: any): any {
        const h = this.$createElement;
        return {
            test: Component.normalize(h('div', 'test')),
            component: Component.normalize(h(IntactComponent))
        }
    }
});
</script>
