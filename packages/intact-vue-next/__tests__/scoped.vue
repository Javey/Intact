<template>
    <IntactComponent>
        <IntactComponent class="test">
            <b>test</b>
        </IntactComponent>
    </IntactComponent>
</template>
<style scoped>
.test {
    font-size: 12px;
}
</style>
<script lang="ts">
import {Component} from '../src';
class IntactComponent extends Component {
    static template = `
        const {className, children, ...rest} = this.get();
        <div class={className} {...rest}>intact component in vue {children}</div>
    `;
}

export default {
    components: {
        IntactComponent,
    }
}
</script>
