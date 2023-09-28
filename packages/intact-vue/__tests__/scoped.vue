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
.test i {
    color: red;
}
</style>
<script lang="ts">
import {Component} from '../src';
class IntactComponent extends Component {
    static template = `
        const {className, children, ...rest} = this.get();
        <div class={className} {...rest}><i>intact component in vue {children}</i></div>
    `;
}

export default {
    components: {
        IntactComponent,
        // IntactComponent: {
            // template: `<div><i>intact component in vue <slot /></i></div>`
        // }
    }
}
</script>
