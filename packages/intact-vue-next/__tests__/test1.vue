<template>
    <div class="test1">
        <Test2>
            <i>test1</i>
            <IntactComponent>
                <b>test</b>
                <Test3>
                    <IntactComponent>
                        <b>test</b>
                    </IntactComponent>
                </Test3>
            </IntactComponent>
        </Test2>
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
import Test2 from './test2.vue';
import Test3 from './test3.vue';
class IntactComponent extends Component {
    static template = `<div>intact component in vue{this.get('children')}</div>`;
}
// const IntactComponent = {
    // template: `<div>intact component in vue<slot /></div>`
// }

export default {
    components: {
        IntactComponent, Test2, Test3,
    }
}
</script>
