<script>
import Tool from "../../../src/modules/tools/Tool.vue";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersCommuterFlows";
import mutations from "../store/mutationsCommuterFlows";

export default {
    name: "CommuterFlows",
    components: {
        Tool
    },
    data () {
        return {
            blacklistedDistricts: ["Bremen", "Berlin", "Kiel", "Hannover"]
        };
    },
    computed: {
        ...mapGetters("Tools/CommuterFlows", Object.keys(getters))
    },
    watch: {
        /**
         * Starts the action for processes, if the tool is be activated (active === true).
         * @param {Boolean} value Value deciding whether the tool gets activated or deactivated.
         * @returns {void}
         */
        active (value) {
            if (value) {
                this.setActive(value);
            }
        }
    },
    created () {
        this.$on("close", this.close);
    },
    /**
     * Put initialize here if mounting occurs after config parsing
     * @returns {void}
     */
    mounted () {
        this.applyTranslationKey(this.name);
    },
    methods: {
        ...mapMutations("Tools/CommuterFlows", Object.keys(mutations)),

        /**
             * Closes this tool window by setting active to false
             * @returns {void}
             */
        close () {
            this.setActive(false);

            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.CommuterFlows.id});

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t(name)"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
            <div
                v-if="active"
                id="CommuterFlows"
            >
                Pendlerströme
            </div>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
</style>
