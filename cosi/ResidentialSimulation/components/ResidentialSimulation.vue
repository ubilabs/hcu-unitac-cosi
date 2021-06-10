<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import getComponent from "../../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersResidentialSimulation";
import mutations from "../store/mutationsResidentialSimulation";

export default {
    name: "ResidentialSimulation",
    components: {
        Tool
    },
    data () {
        return {
        };
    },
    computed: {
        ...mapGetters("Tools/ResidentialSimulation", Object.keys(getters))
    },

    watch: {
        /**
         * If the tool is active, activate the select interaction and add overlay to the districtLayers if necessary
         * If the tool is not actvie, deactivate the interactions (select, drag box) and remove overlay if no districts are selected
         * and update the extent of the selected features (districts).
         * @param {boolean} newActive - Defines if the tool is active.
         * @returns {void}
         */
        active (newActive) {
            if (!newActive) {
                const model = getComponent(this.id);

                if (model) {
                    model.set("isActive", false);
                }
            }
        }
    },
    created () {
        this.$on("close", () => {
            this.setActive(false);
        });
    },
    methods: {
        ...mapMutations("Tools/ResidentialSimulation", Object.keys(mutations))
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t('additional:modules.tools.cosi.residentialSimulation.title')"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template
            v-if="active"
            v-slot:toolBody
        >
            <!-- FOO -->
        </template>
    </Tool>
</template>

<style lang="less" scoped>
</style>
