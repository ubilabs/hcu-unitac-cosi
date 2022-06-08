<script>
import ToolTemplate from "../../../src/modules/tools/ToolTemplate.vue";
import {mapMutations, mapGetters} from "vuex";
import mutations from "../store/mutationsValuationPrint";
import getters from "../store/gettersValuationPrint";

export default {
    name: "ValuationPrint",
    components: {
        ToolTemplate
    },
    computed: {
        ...mapGetters("Tools/ValuationPrint", Object.keys(getters))
    },
    created () {
        this.$on("close", () => {
            this.setActive(false);
        });
    },
    methods: {
        ...mapMutations("Tools/ValuationPrint", Object.keys(mutations))
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
    >
        <template
            v-if="active"
            #toolBody
        >
            <div class="valuation-print" />
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>

</style>
