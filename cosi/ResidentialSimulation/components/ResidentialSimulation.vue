<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import getComponent from "../../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersResidentialSimulation";
import mutations from "../store/mutationsResidentialSimulation";
import ScenarioManager from "../../ScenarioBuilder/components/ScenarioManager.vue";
import GeometryPicker from "../../ScenarioBuilder/components/GeometryPicker.vue";
import {geomPickerUnlisten, geomPickerClearDrawPolygon} from "../../ScenarioBuilder/utils/geomPickerHandler";
import ReferenceDistrictPicker from "./ReferenceDistrictPicker.vue";
import createLayer from "../../utils/createLayer";

export default {
    name: "ResidentialSimulation",
    components: {
        Tool,
        ScenarioManager,
        GeometryPicker,
        ReferenceDistrictPicker
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
                populationDensity: 5000,
                livingSpace: 30
            },
            fallbacks: {
                residents: 0,
                avgHouseholdSize: 2.5,
                housingUnits: 0,
                gfz: 1.0,
                populationDensity: 5000,
                livingSpace: 30
            }
        };
    },
    computed: {
        ...mapGetters("Tools/ResidentialSimulation", Object.keys(getters)),
        ...mapGetters("Tools/DistrictSelector", ["layer"]),
        geomField () {
            return {
                name: this.$t("additional:modules.tools.cosi.residentialSimulation.geom"),
                type: "Polygon"
            };
        },

        polygonArea () {
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

        geometry () {
            this.residentialProject.area = this.polygonArea;
            this.updateArea(this.polygonArea);
        }
    },
    created () {
        this.$on("close", () => {
            this.setActive(false);
        });
    },
    methods: {
        ...mapMutations("Tools/ResidentialSimulation", Object.keys(mutations)),
        ...mapActions("MapMarker", ["placingPointMarker", "removePointMarker"]),

        /**
         * @description create a guide layer used for additional info to display on the map
         * @returns {void}
         */
        createDrawingLayer () {
            const newLayer = createLayer(this.id);

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

        updateArea (newArea) {
            const area = newArea,
                livingSpace = this.residentialProject.livingSpace,
                householdSize = this.residentialProject.avgHouseholdSize,
                gfz = this.residentialProject.gfz,
                bgf = area * gfz,
                residents = bgf / (livingSpace * 1.25),
                populationDensity = residents * 1000000 / area,
                units = residents / householdSize;

            this.residentialProject.residents = residents;
            this.residentialProject.populationDensity = populationDensity;
            this.residentialProject.bgf = bgf;
            this.residentialProject.housingUnits = units;

            this.fallbacks.residents = residents;
            this.fallbacks.populationDensity = populationDensity;
            this.fallbacks.bgf = bgf;
            this.fallbacks.housingUnits = units;
        },

        updateUnits (newUnits) {
            if (this.polygonArea === 0) {
                return;
            }
            const area = this.residentialProject.area,
                livingSpace = this.residentialProject.livingSpace,
                householdSize = this.residentialProject.avgHouseholdSize,
                units = newUnits,
                residents = units * householdSize,
                populationDensity = residents * 1000000 / area,
                bgf = residents * livingSpace * 1.25,
                gfz = bgf / area;

            if (!this.validateValues(householdSize, populationDensity, gfz, bgf, livingSpace, area)) {
                this.residentialProject.housingUnits = this.fallbacks.housingUnits;
            }
            else {
                this.residentialProject.residents = residents;
                this.residentialProject.populationDensity = populationDensity;
                this.residentialProject.bgf = bgf;
                this.residentialProject.gfz = gfz;

                this.fallbacks.housingUnits = units;
                this.fallbacks.residents = residents;
                this.fallbacks.populationDensity = populationDensity;
                this.fallbacks.bgf = bgf;
                this.fallbacks.gfz = gfz;
            }
        },

        updateResidents (newResidents) {
            if (this.polygonArea === 0) {
                return;
            }
            const area = this.residentialProject.area,
                livingSpace = this.residentialProject.livingSpace,
                householdSize = this.residentialProject.avgHouseholdSize,
                residents = newResidents,
                units = newResidents / householdSize,
                populationDensity = residents * 1000000 / area,
                bgf = residents * livingSpace * 1.25,
                gfz = bgf / area;

            if (!this.validateValues(householdSize, populationDensity, gfz, bgf, livingSpace, area)) {
                this.residentialProject.residents = this.fallbacks.residents;
            }
            else {
                this.residentialProject.housingUnits = units;
                this.residentialProject.populationDensity = populationDensity;
                this.residentialProject.bgf = bgf;
                this.residentialProject.gfz = gfz;

                this.fallbacks.residents = residents;
                this.fallbacks.housingUnits = units;
                this.fallbacks.populationDensity = populationDensity;
                this.fallbacks.bgf = bgf;
                this.fallbacks.gfz = gfz;
            }
        },

        updateDensity (newDensity) {
            if (this.polygonArea === 0) {
                return;
            }
            const area = this.residentialProject.area,
                livingSpace = this.residentialProject.livingSpace,
                householdSize = this.residentialProject.avgHouseholdSize,
                populationDensity = newDensity,
                residents = (newDensity * area) / 1000000,
                units = residents / householdSize,
                bgf = residents * livingSpace * 1.25,
                gfz = bgf / area;

            if (!this.validateValues(householdSize, populationDensity, gfz, bgf, livingSpace, area)) {
                this.residentialProject.populationDensity = this.fallbacks.populationDensity;
            }
            else {
                this.residentialProject.housingUnits = units;
                this.residentialProject.residents = residents;
                this.residentialProject.bgf = bgf;
                this.residentialProject.gfz = gfz;

                this.fallbacks.populationDensity = populationDensity;
                this.fallbacks.housingUnits = units;
                this.fallbacks.residents = residents;
                this.fallbacks.bgf = bgf;
                this.fallbacks.gfz = gfz;
            }
        },
        updateLivingSpace (newLivingSpace) {
            if (this.polygonArea === 0) {
                return;
            }
            const area = this.residentialProject.area,
                householdSize = this.residentialProject.avgHouseholdSize,
                gfz = this.residentialProject.gfz,
                bgf = gfz * area,
                livingSpace = newLivingSpace,
                residents = bgf / (livingSpace * 1.25),
                populationDensity = residents * 1000000 / area,
                units = residents / householdSize;

            if (!this.validateValues(householdSize, populationDensity, gfz, bgf, livingSpace, area)) {
                this.residentialProject.livingSpace = this.fallbacks.livingSpace;
            }
            else {
                this.residentialProject.housingUnits = units;
                this.residentialProject.residents = residents;
                this.residentialProject.populationDensity = populationDensity;
                this.residentialProject.bgf = bgf;

                this.fallbacks.livingSpace = livingSpace;
                this.fallbacks.housingUnits = units;
                this.fallbacks.residents = residents;
                this.fallbacks.populationDensity = populationDensity;
                this.fallbacks.bgf = bgf;
            }
        },
        updateGfz (newGfz) {
            if (this.polygonArea === 0) {
                return;
            }
            const area = this.residentialProject.area,
                householdSize = this.residentialProject.avgHouseholdSize,
                livingSpace = this.residentialProject.livingSpace,
                gfz = newGfz,
                bgf = gfz * area,
                residents = bgf / (livingSpace * 1.25),
                populationDensity = residents * 1000000 / area,
                units = residents / householdSize;

            if (!this.validateValues(householdSize, populationDensity, gfz, bgf, livingSpace, area)) {
                this.residentialProject.gfz = this.fallbacks.gfz;
            }
            else {
                this.residentialProject.housingUnits = units;
                this.residentialProject.residents = residents;
                this.residentialProject.populationDensity = populationDensity;
                this.residentialProject.bgf = bgf;

                this.fallbacks.gfz = gfz;
                this.fallbacks.housingUnits = units;
                this.fallbacks.residents = residents;
                this.fallbacks.populationDensity = populationDensity;
                this.fallbacks.bgf = bgf;
            }
        },
        updateBgf (newBgf) {
            if (this.polygonArea === 0) {
                return;
            }
            const area = this.residentialProject.area,
                householdSize = this.residentialProject.avgHouseholdSize,
                livingSpace = this.residentialProject.livingSpace,
                bgf = newBgf,
                gfz = bgf / area,
                residents = bgf / (livingSpace * 1.25),
                populationDensity = residents * 1000000 / area,
                units = residents / householdSize;

            if (!this.validateValues(householdSize, populationDensity, gfz, bgf, livingSpace, area)) {
                this.residentialProject.bgf = this.fallbacks.bgf;
            }
            else {
                this.residentialProject.housingUnits = units;
                this.residentialProject.residents = residents;
                this.residentialProject.populationDensity = populationDensity;
                this.residentialProject.gfz = gfz;

                this.fallbacks.bgf = bgf;
                this.fallbacks.housingUnits = units;
                this.fallbacks.residents = residents;
                this.fallbacks.populationDensity = populationDensity;
                this.fallbacks.gfz = gfz;
            }
        },
        updateHousholdSize (newHouseholdSize) {
            if (this.polygonArea === 0) {
                return;
            }
            const area = this.residentialProject.area,
                livingSpace = this.residentialProject.livingSpace,
                residents = this.residentialProject.residents,
                gfz = this.residentialProject.gfz,
                bgf = gfz * area,
                householdSize = newHouseholdSize,
                populationDensity = residents * 1000000 / area,
                units = residents / householdSize;

            if (!this.validateValues(householdSize, populationDensity, gfz, bgf, livingSpace, area)) {
                this.residentialProject.avgHouseholdSize = this.fallbacks.avgHouseholdSize;
            }
            else {
                this.residentialProject.housingUnits = units;
                this.residentialProject.populationDensity = populationDensity;
                this.residentialProject.bgf = bgf;

                this.fallbacks.avgHouseholdSize = householdSize;
                this.fallbacks.housingUnits = units;
                this.fallbacks.populationDensity = populationDensity;
                this.fallbacks.bgf = bgf;
            }
        },

        validateValues (householdSize, populationDensity, gfz, bgf, livingSpace, area,
            lowerBounds = {householdSize: 1.0, populationDensity: 0, gfz: 0, livingSpace: 10},
            upperBounds = {householdSize: 6.0, populationDensity: 50000, gfz: 4.0, livingSpace: 100}
        ) {
            const validHouseholdSize = householdSize >= lowerBounds.householdSize && householdSize <= upperBounds.householdSize,
                validPopulationDensity = populationDensity >= lowerBounds.populationDensity && populationDensity <= upperBounds.populationDensity,
                validGfz = gfz >= lowerBounds.gfz && gfz <= upperBounds.gfz,
                validBgf = bgf >= lowerBounds.gfz * area && bgf <= upperBounds.gfz * area,
                validLivingSpace = livingSpace >= lowerBounds.livingSpace && livingSpace <= upperBounds.livingSpace;

            return (
                validHouseholdSize &&
                validPopulationDensity &&
                validGfz &&
                validBgf &&
                validLivingSpace
            );

        },

        onReferencePickerActive () {
            geomPickerUnlisten(this.$refs["geometry-picker"]);
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
                                    <v-subheader>Wohneinheiten</v-subheader>
                                </v-col>
                                <v-col cols="9">
                                    <v-slider
                                        v-model="residentialProject.housingUnits"
                                        hint="Anzahl der WE"
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
                                    <v-subheader>Bruttogeschossfläche (BGF)</v-subheader>
                                </v-col>
                                <v-col cols="9">
                                    <v-slider
                                        v-model="residentialProject.bgf"
                                        hint="m²"
                                        min="0"
                                        :max="polygonArea * 4"
                                        @change="updateBgf"
                                    >
                                        <template v-slot:append>
                                            <v-text-field
                                                v-model="residentialProject.bgf"
                                                class="mt-0 pt-0 slider-val"
                                                hide-details
                                                single-line
                                                type="number"
                                                @change="updateBgf"
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
                                        max="50000"
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
                                        max="100"
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
                            <v-divider />
                            <ReferenceDistrictPicker
                                @referencePickerActive="onReferencePickerActive"
                            />
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
