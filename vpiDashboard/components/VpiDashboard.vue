<script>
import ToolTemplate from "../../../src/modules/tools/ToolTemplate.vue";
import getters from "../store/gettersVpiDashboard";
import {mapGetters} from "vuex";
export default {
    name: "VpiDashboard",
    components: {
        ToolTemplate
    },
    computed: {
        ...mapGetters("Tools/VpiDashboard", Object.keys(getters))
    }
};
</script>
<template lang="html">
    <ToolTemplate
        :title="$t(name)"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :initial-width="700"
        :deactivate-g-f-i="deactivateGFI"
    >
        <template #toolBody>
            <div class="row h-100">
                <h1>Dashboard</h1>
            </div>
        </template>
    </ToolTemplate>
</template>
<style scoped>

</style>
