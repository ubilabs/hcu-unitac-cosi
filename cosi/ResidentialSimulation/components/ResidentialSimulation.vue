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
import LineChart from "../../ChartGenerator/components/charts/LineChart.vue";
import BarChart from "../../ChartGenerator/components/charts/BarChart.vue";
import ChartDataSet from "../../ChartGenerator/classes/ChartDataSet";
import {updateArea, updateUnits, updateResidents, updateDensity, updateLivingSpace, updateGfz, updateBgf, updateHousholdSize} from "../utils/updateNeighborhoodData";

export default {
    name: "ResidentialSimulation",
    components: {
        Tool,
        ScenarioManager,
        GeometryPicker,
        ReferenceDistrictPicker,
        LineChart,
        BarChart
    },
    data () {
        return {
            geometry: null,
            neighborhood: {
                area: 0,
                residents: 0,
                avgHouseholdSize: 2.5,
                housingUnits: 0,
                gfz: 1.0,
                populationDensity: 5000,
                livingSpace: 30,
                stats: {}
            },
            fallbacks: {
                residents: 0,
                avgHouseholdSize: 2.5,
                housingUnits: 0,
                gfz: 1.0,
                populationDensity: 5000,
                livingSpace: 30
            },
            baseStats: {
                reference: {},
                absolute: {},
                relative: {}
            },
            baseStatsChartData: {
                charts: [],
                options: {
                    title: {
                        display: true,
                        text: "",
                        position: "top"
                    },
                    scales: {
                        xAxes: [{
                            ticks: {
                                beginAtZero: true
                            },
                            scaleLabel: {
                                display: true,
                                labelString: ""
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                suggestedMax: 0.6
                            },
                            scaleLabel: {
                                display: true,
                                labelString: ""
                            }
                        }]
                    }
                }
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
        },

        residents () {
            return this.neighborhood.residents;
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
            this.neighborhood.area = this.polygonArea;
            this.updateArea(this.polygonArea);
        },

        baseStats () {
            this.visualizeDemographics(
                "gender",
                "Demographie nach Gender",
                ["Anteil", "Gender"],
                [
                    "Bevölkerung weiblich",
                    "Bevölkerung männlich",
                    "Sozialversicherungspflichtig Beschäftigte insgesamt",
                    "Sozialversicherungspflichtig beschäftigte Frauen",
                    "Sozialversicherungspflichtig beschäftigte Männer"
                ],
                "BarChart"
            );
            setTimeout(() => {
                this.visualizeDemographics(
                    "age",
                    "Demographie nach Altersgruppen",
                    ["Anteil", "Alterskohorten"],
                    [
                        "Bevölkerung unter 6 Jahren",
                        "Bevölkerung 6 bis unter 10 Jahren",
                        "Bevölkerung 10 bis unter 15 Jahren",
                        "Bevölkerung 15 bis unter 21 Jahren",
                        "Bevölkerung 21 bis unter 45 Jahren",
                        "Bevölkerung 45 bis unter 65 Jahren",
                        "Bevölkerung ab 65 Jahren"
                    ],
                    "LineChart"
                );
            }, 250);
            this.extrapolateNeighborhoodStatistics();
        },

        residents () {
            this.extrapolateNeighborhoodStatistics();
        }
    },
    created () {
        this.$on("close", () => {
            this.setActive(false);
        });
    },
    methods: {
        ...mapMutations("Tools/ResidentialSimulation", Object.keys(mutations)),
        ...mapMutations("Tools/ChartGenerator", ["setNewDataSet"]),
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
            updateArea(newArea, this.neighborhood, this.fallbacks);
        },
        updateUnits (newUnits) {
            updateUnits(newUnits, this.neighborhood, this.fallbacks, this.polygonArea);
        },
        updateResidents (newResidents) {
            updateResidents(newResidents, this.neighborhood, this.fallbacks, this.polygonArea);
        },
        updateDensity (newDensity) {
            updateDensity(newDensity, this.neighborhood, this.fallbacks, this.polygonArea);
        },
        updateLivingSpace (newLivingSpace) {
            updateLivingSpace(newLivingSpace, this.neighborhood, this.fallbacks, this.polygonArea);
        },
        updateGfz (newGfz) {
            updateGfz(newGfz, this.neighborhood, this.fallbacks, this.polygonArea);
        },
        updateBgf (newBgf) {
            updateBgf(newBgf, this.neighborhood, this.fallbacks, this.polygonArea);
        },
        updateHousholdSize (newHouseholdSize) {
            updateHousholdSize(newHouseholdSize, this.neighborhood, this.fallbacks, this.polygonArea);
        },
        onReferencePickerActive () {
            geomPickerUnlisten(this.$refs["geometry-picker"]);
        },

        onPickReference (baseStats) {
            this.baseStatsChartData.charts = [];
            this.baseStats = baseStats;
        },

        extrapolateNeighborhoodStatistics () {
            this.neighborhood.stats = {
                ...this.baseStats.absolute,
                ...this.baseStats.relative
            };

            for (const prop in this.baseStats.absolute) {
                this.neighborhood.stats[prop] = Math.round(this.neighborhood.stats[prop] * this.neighborhood.residents);
            }

            // console.log(this.neighborhood);
            // console.log(this.baseStats);
        },

        visualizeDemographics (id, name, scaleLabels, labels, type) {
            const chartData = new ChartDataSet({
                id,
                name,
                scaleLabels,
                data: {
                    dataSets: [this.getChartDataSet(labels, this.baseStats.reference.districtName)],
                    labels
                },
                type,
                options: this.baseStatsChartData.options
            });

            // this.baseStatsChartData.charts.push(chartData);
            this.setNewDataSet(chartData);
        },

        getChartDataSet (labels, districtName) {
            return {
                borderColor: "darkblue",
                backgroundColor: "darkblue",
                data: labels.map(label => this.baseStats.absolute[label]),
                label: districtName
            };
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
        :initial-width="width"
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
                                        v-model="neighborhood.residents"
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
                                        v-model="neighborhood.housingUnits"
                                        hint="Anzahl der WE"
                                        min="0"
                                        :max="polygonArea / 5"
                                        @change="updateUnits"
                                    >
                                        <template v-slot:append>
                                            <v-text-field
                                                v-model="neighborhood.housingUnits"
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
                                        v-model="neighborhood.bgf"
                                        hint="m²"
                                        min="0"
                                        :max="polygonArea * 4"
                                        @change="updateBgf"
                                    >
                                        <template v-slot:append>
                                            <v-text-field
                                                v-model="neighborhood.bgf"
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
                                        v-model="neighborhood.avgHouseholdSize"
                                        hint="Haushaltsgröße"
                                        min="0"
                                        max="5"
                                        step="0.2"
                                        @change="updateHousholdSize"
                                    >
                                        <template v-slot:append>
                                            <v-text-field
                                                v-model="neighborhood.avgHouseholdSize"
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
                                        v-model="neighborhood.gfz"
                                        hint="GFZ"
                                        min="0"
                                        max="4"
                                        step="0.1"
                                        @change="updateGfz"
                                    >
                                        <template v-slot:append>
                                            <!-- eslint-disable-next-line vue/no-multiple-template-root -->
                                            <v-text-field
                                                v-model="neighborhood.gfz"
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
                                        v-model="neighborhood.populationDensity"
                                        hint="EW / km²"
                                        min="0"
                                        max="50000"
                                        @change="updateDensity"
                                    >
                                        <template v-slot:append>
                                            <!-- eslint-disable-next-line vue/no-multiple-template-root -->
                                            <v-text-field
                                                v-model="neighborhood.populationDensity"
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
                                        v-model="neighborhood.livingSpace"
                                        hint="m² / EW"
                                        min="0"
                                        max="100"
                                        @change="updateLivingSpace"
                                    >
                                        <template v-slot:append>
                                            <!-- eslint-disable-next-line vue/no-multiple-template-root -->
                                            <v-text-field
                                                v-model="neighborhood.livingSpace"
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
                                @pickReference="onPickReference"
                            />
                            <template v-if="baseStatsChartData.charts.length > 0">
                                <v-row
                                    v-for="(datum, i) in baseStatsChartData.charts"
                                    :key="i"
                                    dense
                                >
                                    <v-col cols="12">
                                        <component
                                            :is="datum.type"
                                            :dataSets="datum"
                                            :options="baseStatsChartData.options"
                                        />
                                    </v-col>
                                </v-row>
                            </template>
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
