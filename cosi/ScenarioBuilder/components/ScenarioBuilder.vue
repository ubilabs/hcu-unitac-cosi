<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import getComponent from "../../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersScenarioBuilder";
import mutations from "../store/mutationsScenarioBuilder";
import Select from "ol/interaction/Select";
import {click} from "ol/events/condition";

export default {
    name: "ScenarioBuilder",
    components: {
        Tool
    },
    data () {
        return {
            select: null,
            selectedDistrict: null
        };
    },
    computed: {
        ...mapGetters("Tools/ScenarioBuilder", Object.keys(getters)),
        ...mapGetters("Map", ["map", "visibleLayerList"]),
        ...mapGetters("Tools/DistrictSelector", ["layer"])
    },

    watch: {
        selectedDistrict (feature) {
            if (feature) {
                console.log(feature);
            }
        },
        layer (newLayer) {
            this.select.layerFilter_ = (layer) => layer === newLayer;
        },
        /**
         * If the tool is active, activate the select interaction and add overlay to the districtLayers if necessary
         * If the tool is not actvie, deactivate the interactions (select, drag box) and remove overlay if no districts are selected
         * and update the extent of the selected features (districts).
         * @param {boolean} newActive - Defines if the tool is active.
         * @returns {void}
         */
        active (newActive) {
            if (newActive) {
                this.map.addInteraction(this.select);
            }
            else {
                this.map.removeInteraction(this.select);
                const model = getComponent(this.id);

                if (model) {
                    model.set("isActive", false);
                }
            }
        }
    },
    created () {
        this.select = new Select({
            condition: click,
            layers: [this.layer]
        });

        this.$on("close", () => {
            this.setActive(false);
        });
    },
    mounted () {
        this.select.on("select", function (evt) {
            console.log(evt);
            this.selectedDistrict = evt.selected?.[0] || null;
        });
    },
    methods: {
        ...mapMutations("Tools/ScenarioBuilder", Object.keys(mutations))
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t('additional:modules.tools.cosi.scenarioBuilder.header')"
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
            <!-- TODO -->
        </template>
    </Tool>
</template>

<style lang="less">
</style>

<style src="vue-select/dist/vue-select.css">
</style>


