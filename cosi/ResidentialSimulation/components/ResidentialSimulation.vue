<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import getComponent from "../../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersResidentialSimulation";
import mutations from "../store/mutationsResidentialSimulation";
import ScenarioManager from "../../ScenarioBuilder/components/ScenarioManager.vue";
import GeometryPicker from "../../ScenarioBuilder/components/GeometryPicker.vue";
import {geomPickerUnlisten, geomPickerClearDrawPolygon} from "../../ScenarioBuilder/utils/geomPickerHandler";

export default {
    name: "ResidentialSimulation",
    components: {
        Tool,
        ScenarioManager,
        GeometryPicker
    },
    data () {
        return {
            geometry: null,
            residentialProject: {
                area: 0,
                residents: 0,
                avgHouseholdSize: 2.5,
                housingUnits: 0,
                gfz: 1.0,
                populationDensity: 2500,
                livingSpace: 30
            }
        };
    },
    computed: {
        ...mapGetters("Tools/ResidentialSimulation", Object.keys(getters)),
        geomField () {
            return {
                name: this.$t("additional:modules.tools.cosi.residentialSimulation.geom"),
                type: "Polygon"
            };
        },

        polygonArea () {
            console.log(this.geometry);

            return this.geometry?.getArea() || 0;
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

                geomPickerUnlisten(this.$refs["geometry-picker"]);
                geomPickerClearDrawPolygon(this.$refs["geometry-picker"]);
                this.removePointMarker();
            }
        },

        polygonArea (area) {
            this.residentialProject.area = area;
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
        },

        updateUnits (newUnits, oldUnits) {
            console.log(newUnits);
            console.log(this.residentialProject);
            const residents = newUnits * this.residentialProject.avgHouseholdSize,
                populationDensity = residents * 1000000 / (this.residentialProject.area),
                bgf = residents * 40,
                gfz = bgf / this.residentialProject.area,
                livingSpace = bgf * 0.85 / residents;

            if (
                populationDensity > 5000 ||
                gfz > 4.0 ||
                livingSpace < 10
            ) {
                this.residentialProject.housingUnits = oldUnits;
            }
            else {
                this.residentialProject.residents = residents;
                this.residentialProject.populationDensity = populationDensity;
                this.residentialProject.bgf = bgf;
                this.residentialProject.gfz = gfz;
                this.residentialProject.livingSpace = livingSpace;
            }

            console.log(residents, populationDensity, bgf, gfz, livingSpace);
        },

        updateResidents (newResidents, oldResidents) {},
        updateDensity (newDensity, oldDensity) {},
        updateLivingSpace (newLivingSpace, oldLivingSpace) {},
        updateGfz (newGfz, oldGfz) {},
        updateBgf (newBgf, oldBgf) {},
        updateHousholdSize (newHouseholdSize, oldHouseholdSize) {}
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
                            <v-row dense>
                                <v-col cols="3">
                                    <v-subheader>Grundfläche</v-subheader>
                                </v-col>
                                <v-col cols="9">
                                    <v-text-field
                                        v-model="polygonArea"
                                        label="Fläche"
                                        suffix="m²"
                                    />
                                </v-col>
                            </v-row>
                            <v-row dense>
                                <v-col cols="3">
                                    <v-subheader>Bewohnerzahl insgesamt</v-subheader>
                                </v-col>
                                <v-col cols="9">
                                    <v-text-field
                                        v-model="residentialProject.residents"
                                        label="Einwohner gesamt"
                                        suffix="EW"
                                        @change="updateResidents"
                                    />
                                </v-col>
                            </v-row>
                            <v-row dense>
                                <v-col cols="3">
                                    <v-subheader>Zahl der Wohneinheiten</v-subheader>
                                </v-col>
                                <v-col cols="9">
                                    <v-slider
                                        v-model="residentialProject.housingUnits"
                                        hint="Wohneinheiten"
                                        min="0"
                                        :max="polygonArea / 5"
                                        @change="updateUnits"
                                    >
                                        <template v-slot:append>
                                            <v-text-field
                                                v-model="residentialProject.housingUnits"
                                                class="mt-0 pt-0 slider-val"
                                                hide-details
                                                single-line
                                                type="number"
                                                @change="updateUnits"
                                            />
                                        </template>
                                    </v-slider>
                                </v-col>
                            </v-row>
                            <v-row dense>
                                <v-col cols="3">
                                    <v-subheader>Ø Haushaltsgröße</v-subheader>
                                </v-col>
                                <v-col cols="9">
                                    <v-slider
                                        v-model="residentialProject.avgHouseholdSize"
                                        hint="Haushaltsgröße"
                                        min="0"
                                        max="5"
                                        step="0.2"
                                        @change="updateHousholdSize"
                                    >
                                        <template v-slot:append>
                                            <v-text-field
                                                v-model="residentialProject.avgHouseholdSize"
                                                class="mt-0 pt-0 slider-val"
                                                hide-details
                                                single-line
                                                type="number"
                                                @change="updateHousholdSize"
                                            />
                                        </template>
                                    </v-slider>
                                </v-col>
                            </v-row>
                            <v-row dense>
                                <v-col cols="3">
                                    <v-subheader>GFZ</v-subheader>
                                </v-col>
                                <v-col cols="9">
                                    <v-slider
                                        v-model="residentialProject.gfz"
                                        hint="GFZ"
                                        min="0"
                                        max="4"
                                        step="0.1"
                                        @change="updateGfz"
                                    >
                                        <template v-slot:append>
                                            <!-- eslint-disable-next-line vue/no-multiple-template-root -->
                                            <v-text-field
                                                v-model="residentialProject.gfz"
                                                class="mt-0 pt-0 slider-val"
                                                hide-details
                                                single-line
                                                type="number"
                                                @change="updateGfz"
                                            />
                                        </template>
                                    </v-slider>
                                </v-col>
                            </v-row>
                            <v-row dense>
                                <v-col cols="3">
                                    <v-subheader>Bevölkerungsdichte</v-subheader>
                                </v-col>
                                <v-col cols="9">
                                    <v-slider
                                        v-model="residentialProject.populationDensity"
                                        hint="EW / km²"
                                        min="0"
                                        max="5000"
                                        @change="updateDensity"
                                    >
                                        <template v-slot:append>
                                            <!-- eslint-disable-next-line vue/no-multiple-template-root -->
                                            <v-text-field
                                                v-model="residentialProject.populationDensity"
                                                class="mt-0 pt-0 slider-val"
                                                hide-details
                                                single-line
                                                type="number"
                                                @change="updateDensity"
                                            />
                                        </template>
                                    </v-slider>
                                </v-col>
                            </v-row>
                            <v-row dense>
                                <v-col cols="3">
                                    <v-subheader>Wohnfläche pro Person</v-subheader>
                                </v-col>
                                <v-col cols="9">
                                    <v-slider
                                        v-model="residentialProject.livingSpace"
                                        hint="m² / EW"
                                        min="0"
                                        max="80"
                                        @change="updateLivingSpace"
                                    >
                                        <template v-slot:append>
                                            <!-- eslint-disable-next-line vue/no-multiple-template-root -->
                                            <v-text-field
                                                v-model="residentialProject.livingSpace"
                                                class="mt-0 pt-0 slider-val"
                                                hide-details
                                                single-line
                                                type="number"
                                                @change="updateLivingSpace"
                                            />
                                        </template>
                                    </v-slider>
                                </v-col>
                            </v-row>
                        </div>
                    </v-form>
                </v-main>
            </v-app>
        </template>
    </Tool>
</template>

<style lang="less">
    .slider-val {
        width: 60px;
    }
</style>
