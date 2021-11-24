<template>
    <div class="test1">
        <slot><div>slot</div></slot>
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
export default {
    components: {

    }
}
</script>
