<template>
    <IntactComponent :test="test" :component="component" />
</template>
<script lang="ts">
import {Component} from '../src';
import {h} from 'vue';

class IntactComponent extends Component {
    static template = `<div>{this.get('test')}{this.get('component')}</div>`;
}

export default {
    components: {
        IntactComponent,
    },
    data() {
        return {
            test: Component.normalize(h('div', null, 'test')),
            component: Component.normalize(h(IntactComponent))
        }
    }
}
</script>
