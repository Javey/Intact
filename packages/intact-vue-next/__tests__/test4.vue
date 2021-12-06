<template>
    <div class="test1">
        <IntactComponent :show="show">
            <b>test</b>
        </IntactComponent>
        <slot></slot>
    </div>
</template>
<style scoped>
.test1 {
    font-size: 12px;
}
.test1 span {
    color: yellow;
}
</style>
<script lang="ts">
import {Component} from '../src';
class IntactComponent extends Component {
    static template = `<div v-if={this.get('show')}>intact component in vue{this.get('children')}</div>`;
}

export default {
    components: {
        IntactComponent,
    },
    props: ['show']
}
</script>
