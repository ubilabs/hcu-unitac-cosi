<script>
import Tool from "../../../src/modules/tools/Tool.vue";

export default {
    name: "SchoolRoutePlanning",
    components: {
        Tool
    }
};
</script>

<template>
    <Tool
        :title="$t(name)"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
        </template>
    </Tool>
</template>

<style lang="less" scoped>

</style>
