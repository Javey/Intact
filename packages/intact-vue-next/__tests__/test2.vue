<template>
    <div class="test2">
        <span>test2</span>
        <slot />
    </div>
</template>
<style></style>
<script lang="ts">
import {defineComponent} from 'vue';
import {Component} from '../src';
class IntactComponent extends Component {
    static template = '<div>intact component in vue</div>';
}

export default {
    components: {
        IntactComponent,
    }
}
</script>
