<template>
    <IntactComponent :test="test" :component="component"/>
</template>
<script lang="tsx">
import {Component} from '../src';
import {h, defineComponent} from 'vue';

class IntactComponent extends Component<Props> {
    static template = `<div>{this.get('test')}{this.get('component')}</div>`;
}

export default defineComponent({
    components: {
        IntactComponent
    },
    data() {
        return {
            test: Component.normalize(h('div', null, 'test')),
            component: Component.normalize(h(IntactComponent))
        }
    }
});
</script>
