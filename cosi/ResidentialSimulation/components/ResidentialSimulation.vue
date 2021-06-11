<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import getComponent from "../../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersResidentialSimulation";
import mutations from "../store/mutationsResidentialSimulation";
import ScenarioManager from "../../ScenarioBuilder/components/ScenarioManager.vue";
import GeometryPicker from "../../ScenarioBuilder/components/GeometryPicker.vue";

export default {
    name: "ResidentialSimulation",
    components: {
        Tool,
        ScenarioManager,
        GeometryPicker
    },
    data () {
        return {
            geometry: null
        };
    },
    computed: {
        ...mapGetters("Tools/ResidentialSimulation", Object.keys(getters)),
        geomField () {
            return {
                name: this.$t("additional:modules.tools.cosi.residentialSimulation.geom"),
                type: "Polygon"
            };
        }
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
        ...mapMutations("Tools/ResidentialSimulation", Object.keys(mutations)),

        /**
         * @description create a guide layer used for additional info to display on the map
         * @returns {void}
         */
        createDrawingLayer () {
            const newLayer = Radio.request("Map", "createLayerIfNotExists", this.id);

            newLayer.setVisible(true);
            // newLayer.setStyle(featureTagStyle);
            this.setDrawingLayer(newLayer);

            return newLayer;
        },

        /**
         * Updates the geometry from the geomPicker in the data for later use when instantiating a new feature
         * @param {module:ol/Geometry} geom the new geometry object
         * @returns {void}
         */
        updateGeometry (geom) {
            this.geometry = geom;
        }
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
            <v-app absolute>
                <v-main
                    id="scenario-builder"
                >
                    <v-form>
                        <div class="form-group">
                            <label> {{ $t('additional:modules.tools.cosi.scenarioManager.title') }} </label>
                            <ScenarioManager />
                        </div>
                        <v-divider />
                        <div class="form-group">
                            <GeometryPicker
                                ref="geometry-picker"
                                :geomField="geomField"
                                :isGml="false"
                                @updateGeometry="updateGeometry"
                            />
                        </div>
                    </v-form>
                </v-main>
            </v-app>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
</style>
