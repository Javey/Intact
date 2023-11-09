<template>
    <IntactComponent>
        <RouterView />
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
import { defineComponent } from 'vue';
import {Component} from '../src';

class IntactComponent extends Component {
    static template = `
        const {className, children, ...rest} = this.get();
        <div class={className} {...rest}><i>intact component in vue {children}</i></div>
    `;
}

const Test = defineComponent({
    template: `<div><slot /></div>`,
});

const RouterView = defineComponent({
    name: 'RouterView',
    template: `
        <IntactComponent class="a">
            <IntactComponent class="b">
                <i>test</i>
            </IntactComponent>
        </IntactComponent>
    `,
    components: {
        IntactComponent,
        Test,
    },
});

export default {
    components: {
        IntactComponent,
        RouterView,
        // IntactComponent: {
            // template: `<div><i>intact component in vue <slot /></i></div>`
        // }
    }
}
</script>
