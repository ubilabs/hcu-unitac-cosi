<script>
import Tool from "../../../../src/modules/tools/ToolTemplate.vue";
import getComponent from "../../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersResidentialSimulation";
import mutations from "../store/mutationsResidentialSimulation";
import ScenarioManager from "../../ScenarioBuilder/components/ScenarioManager.vue";
import GeometryPicker from "../../components/GeometryPicker.vue";
import {geomPickerUnlisten, geomPickerClearDrawPolygon, geomPickerResetLocation, geomPickerSetGeometry} from "../../utils/geomPickerHandler";
import ReferenceDistrictPicker from "./ReferenceDistrictPicker.vue";
import StatisticsTable from "./StatisticsTable.vue";
import NeighborhoodEditor from "./NeighborhoodEditor.vue";
import ChartDataset from "../../ChartGenerator/classes/ChartDataset";
import {updateArea, updateUnits, updateResidents, updateDensity, updateLivingSpace, updateGfz, updateBgf, updateHousholdSize, updateLivingSpaceRatio} from "../utils/updateNeighborhoodData";
import residentialLayerStyle from "../utils/residentialLayerStyle";
import Feature from "ol/Feature";
import ScenarioNeighborhood from "../../ScenarioBuilder/classes/ScenarioNeighborhood";
import Modal from "../../../../src/share-components/modals/components/ModalItem.vue";
import processStats from "../utils/processStats";
import {getContainingDistrictForExtent} from "../../utils/geomUtils";
import ToolInfo from "../../components/ToolInfo.vue";
import Slider from "../../../../src/modules/tools/filterGeneral/components/SnippetSlider.vue";

export default {
    name: "ResidentialSimulation",
    components: {
        Tool,
        ToolInfo,
        ScenarioManager,
        GeometryPicker,
        ReferenceDistrictPicker,
        StatisticsTable,
        Modal,
        NeighborhoodEditor,
        Slider
    },
    data () {
        return {
            datePicker: false,
            editStatsTable: false,
            geometry: null,
            neighborhood: {
                name: "Mein Wohnquartier",
                area: 0,
                residents: 0,
                avgHouseholdSize: 2.5,
                housingUnits: 0,
                gfz: 1.0,
                bgf: 0,
                populationDensity: 5000,
                livingSpace: 30,
                livingSpaceRatio: 0.8,
                stats: null,
                year: new Date().toISOString().substring(0, 7)
            },
            fallbacks: {
                residents: 0,
                avgHouseholdSize: 2.5,
                housingUnits: 0,
                gfz: 1.0,
                bgf: 0,
                populationDensity: 5000,
                livingSpace: 30,
                livingSpaceRatio: 0.8
            },
            lowerBounds: {householdSize: 1.0, populationDensity: 0, gfz: 0, livingSpace: 10, livingSpaceRatio: 0},
            upperBounds: {householdSize: 6.0, populationDensity: 50000, gfz: 4.0, livingSpace: 100, livingSpaceRatio: 1.0},
            baseStats: {
                reference: {},
                absolute: [],
                relative: []
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
            },
            isCreated: false,
            invalidValues: [],
            errorMsg: false,
            isInitializing: false
        };
    },
    computed: {
        ...mapGetters("Language", ["currentLocale"]),
        ...mapGetters("Tools/ResidentialSimulation", Object.keys(getters)),
        ...mapGetters("Tools/ScenarioBuilder", ["activeScenario"]),
        ...mapGetters("Tools/DistrictSelector", {
            districtLevels: "districtLevels",
            districtLayer: "layer",
            selectedFeatures: "selectedFeatures",
            selectedAdminFeatures: "selectedAdminFeatures",
            selectedDistricts: "selectedDistricts",
            selectedDistrictLevel: "selectedDistrictLevel"
        }),
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
        },

        stats () {
            return this.neighborhood.stats;
        },

        hasReference () {
            return Object.keys(this.baseStats.reference).length !== 0;
        }
    },

    watch: {
        /**
         * If the tool is active, redraw the geometry if one exists
         * If the tool is not actvie, deactivate the interactions (select, drag box) and remove overlay if no districts are selected
         * and update the extent of the selected features (districts).
         * @param {boolean} newActive - Defines if the tool is active.
         * @returns {void}
         */
        async active (newActive) {
            if (newActive) {
                if (this.geometry) {
                    await this.$nextTick();
                    geomPickerSetGeometry(this.$refs["geometry-picker"], this.geometry);
                }
            }
            else {
                const model = getComponent(this.id);

                if (model) {
                    model.set("isActive", false);
                }

                geomPickerUnlisten(this.$refs["geometry-picker"]);
            }
        },

        async geometry () {
            if (!this.hasReference && this.geometry !== null) {
                this.getBaseStats();
            }
            this.neighborhood.area = this.polygonArea;
            this.updateArea(this.polygonArea);
        },

        async baseStats () {
            if (!this.hasReference && this.geometry !== null) {
                this.getBaseStats();
            }
            if (!(this.baseStats.reference?.districtName && this.baseStats.reference?.districtLevel)) {
                return;
            }

            this.extrapolateNeighborhoodStatistics();
        },

        residents () {
            this.extrapolateNeighborhoodStatistics();
        },

        neighborhood: {
            deep: true,
            handler () {
                this.isCreated = false;
            }
        },

        invalidValues (invValues) {
            if (invValues.length > 0) {
                this.errorMsg = true;
            }
        }
    },
    created () {
        this.$on("close", () => {
            this.setActive(false);
        });
    },
    mounted () {
        this.createDrawingLayer();
    },
    methods: {
        ...mapMutations("Tools/ResidentialSimulation", Object.keys(mutations)),
        ...mapActions("Map", ["createLayer"]),
        ...mapActions("Tools/ChartGenerator", ["channelGraphData"]),
        ...mapActions("Tools/DistrictSelector", ["getStatsByDistrict"]),

        /**
         * @description create a guide layer used for additional info to display on the map
         * @returns {void}
         */
        async createDrawingLayer () {
            const newLayer = await this.createLayer(this.id + "_layer");

            newLayer.setVisible(true);
            newLayer.setStyle(residentialLayerStyle);
            this.setDrawingLayer(newLayer);

            return newLayer;
        },

        async getBaseStats () {
            const district = getContainingDistrictForExtent(this.selectedDistrictLevel, this.geometry.getExtent()),
                stats = await this.getStatsByDistrict({
                    id: district.getId(),
                    districtLevel: this.selectedDistrictLevel
                }),
                baseStats = processStats(
                    district.getName(),
                    this.selectedDistrictLevel.label,
                    stats,
                    "Bevölkerung insgesamt",
                    this.timelinePrefix,
                    this.groupsList
                );

            if (baseStats) {
                this.onPickReference(baseStats);
            }
        },
        async updateSliders () {
            this.isInitializing = true;
            await this.$nextTick();
            this.isInitializing = false;
        },
        /**
         * Updates the geometry from the geomPicker in the data for later use when instantiating a new feature
         * @param {module:ol/Geometry} geom the new geometry object
         * @returns {void}
         */
        updateGeometry (geom) {
            this.geometry = geom;
            geomPickerUnlisten(this.$refs["geometry-picker"]);
        },
        updateArea (newArea) {
            updateArea(newArea, this.neighborhood, this.fallbacks);
            this.updateSliders();
        },
        updateResidents (newResidents) {
            this.invalidValues = updateResidents(newResidents.value, this.neighborhood, this.fallbacks, this.polygonArea, this.lowerBounds, this.upperBounds);
            this.updateSliders();
            // this.unfocusInput(new Event("endaction"), this.$refs["slider-units"]);
        },
        updateUnits (newUnits) {
            if (!newUnits.startup) {
                this.invalidValues = updateUnits(newUnits.value, this.neighborhood, this.fallbacks, this.polygonArea, this.lowerBounds, this.upperBounds);
                this.updateSliders();
            }
        },
        updateDensity (newDensity) {
            if (!newDensity.startup) {
                this.invalidValues = updateDensity(newDensity.value, this.neighborhood, this.fallbacks, this.polygonArea, this.lowerBounds, this.upperBounds);
                this.updateSliders();
            }
            // this.unfocusInput(new Event("endaction"), this.$refs["slider-density"]);
        },
        updateLivingSpace (newLivingSpace) {
            if (!newLivingSpace.startup) {
                this.invalidValues = updateLivingSpace(newLivingSpace.value, this.neighborhood, this.fallbacks, this.polygonArea, this.lowerBounds, this.upperBounds);
                this.updateSliders();
            }
            // this.unfocusInput(new Event("endaction"), this.$refs["slider-livingspace"]);
        },
        updateGfz (newGfz) {
            if (!newGfz.startup) {
                this.invalidValues = updateGfz(newGfz.value, this.neighborhood, this.fallbacks, this.polygonArea, this.lowerBounds, this.upperBounds);
                this.updateSliders();
            }
            // this.unfocusInput(new Event("endaction"), this.$refs["slider-gfz"]);
        },
        updateBgf (newBgf) {
            if (!newBgf.startup) {
                this.invalidValues = updateBgf(newBgf.value, this.neighborhood, this.fallbacks, this.polygonArea, this.lowerBounds, this.upperBounds);
                this.updateSliders();
            }
            // this.unfocusInput(new Event("endaction"), this.$refs["slider-bgf"]);
        },
        updateHousholdSize (newHouseholdSize) {
            if (!newHouseholdSize.startup) {
                this.invalidValues = updateHousholdSize(newHouseholdSize.value, this.neighborhood, this.fallbacks, this.polygonArea, this.lowerBounds, this.upperBounds);
                this.updateSliders();
            }
            // this.unfocusInput(new Event("endaction"), this.$refs["slider-householdsize"]);
        },
        updateLivingSpaceRatio (newLivingSpaceRatio) {
            if (!newLivingSpaceRatio.startup) {
                this.invalidValues = updateLivingSpaceRatio(newLivingSpaceRatio.value, this.neighborhood, this.fallbacks, this.polygonArea, this.lowerBounds, this.upperBounds);
                this.updateSliders();
            }
        },
        onReferencePickerActive () {
            geomPickerUnlisten(this.$refs["geometry-picker"]);
        },

        onPickReference (baseStats) {
            this.baseStatsChartData.charts = [];
            this.baseStats = baseStats;
        },

        extrapolateNeighborhoodStatistics () {
            if (this.baseStats.absolute.length === 0) {
                return;
            }
            this.neighborhood.stats = [
                ...this.baseStats.absolute.map(datum => {
                    return {
                        ...datum,
                        value: Math.round(datum.value * this.neighborhood.residents)
                    };
                }),
                ...this.baseStats.relative
            ];
        },

        visualizeDemographics (baseStats) {
            const chartData = this.referenceDistrictCharts.map(chartOptions => {
                const {id, name, scaleLabels, labels, type} = chartOptions;

                return new ChartDataset({
                    id: id + "-" + baseStats.reference.districtName,
                    name,
                    scaleLabels,
                    data: {
                        datasets: [this.getChartDataset(labels, baseStats.reference.districtName)],
                        labels
                    },
                    type,
                    options: this.baseStatsChartData.options,
                    beginAtZero: true
                });
            });

            this.channelGraphData(chartData);
        },

        getChartDataset (labels, districtName) {
            return {
                borderColor: "darkblue",
                backgroundColor: "darkblue",
                data: labels.map(label => this.baseStats.absolute.find(datum => datum.category === label)?.value),
                label: districtName
            };
        },

        async createFeature () {
            const feature = new Feature({
                    geometry: this.geometry,
                    ...this.neighborhood,
                    baseStats: this.baseStats
                }),
                neighborhood = new ScenarioNeighborhood(feature, this.drawingLayer, this.districtLevels);

            this.activeScenario.addNeighborhood(neighborhood);

            this.isCreated = true;
            // reset geometry
            geomPickerClearDrawPolygon(this.$refs["geometry-picker"]);
        },

        resetFeature () {
            // reset neighborhood data to defaults
            this.neighborhood.name = this.defaults.name;
            this.neighborhood.avgHouseholdSize = this.defaults.avgHouseholdSize;
            this.neighborhood.gfz = this.defaults.gfz;
            this.neighborhood.populationDensity = this.defaults.populationDensity;
            this.neighborhood.livingSpace = this.defaults.livingSpace;
            this.neighborhood.year = new Date().toISOString().substring(0, 7);

            // reset fallback data to defaults
            this.fallbacks.avgHouseholdSize = this.defaults.avgHouseholdSize;
            this.fallbacks.gfz = this.defaults.gfz;
            this.fallbacks.populationDensity = this.defaults.populationDensity;
            this.fallbacks.livingSpace = this.defaults.livingSpace;

            this.resetBaseStats();

            // reset geometry
            geomPickerResetLocation(this.$refs["geometry-picker"]);
        },

        // reset baseStats from reference
        resetBaseStats () {
            this.baseStats = {
                reference: {},
                absolute: [],
                relative: []
            };
        },

        escapeEditStatsTable () {
            this.editStatsTable = false;
        },

        unfocusInput (evt, ref) {
            // weird hack to force vuetify to unfocus the slider
            if (ref?.isActive) {
                ref.isActive = false;
                ref.onSliderMouseUp(evt);

            }
        }
    }
};
</script>

<template lang="html">
    <div :class="active ? 'tool-wrap' : ''">
        <Tool
            :title="$t('additional:modules.tools.cosi.residentialSimulation.title')"
            :icon="glyphicon"
            :active="active"
            :render-to-window="renderToWindow"
            :resizable-window="resizableWindow"
            :deactivate-gfi="deactivateGFI"
            :initial-width="width"
        >
            <template
                v-if="active"
                #toolBody
            >
                <ToolInfo :url="readmeUrl[currentLocale]" />
                <v-app absolute>
                    <v-main
                        id="scenario-builder"
                    >
                        <div>
                            <ScenarioManager @pruneScenario="resetFeature" />
                            <v-divider />
                            <div>
                                <span class="text-subtitle-2">
                                    {{ $t('additional:modules.tools.cosi.residentialSimulation.title') }}
                                </span>
                            </div>
                            <div class="mb-2">
                                Neue fiktive Wohnquartiere mitsamt Bewohnerstruktur anlegen und die statistischen Daten im Gebiet entsprechend modifizieren.
                            </div>
                            <ReferenceDistrictPicker
                                :groups-list="groupsList"
                                :timeline-prefix="timelinePrefix"
                                :has-reference="hasReference"
                                :selected-name="baseStats.reference.districtName"
                                :base-population-prop="basePopulationProp"
                                @referencePickerActive="onReferencePickerActive"
                                @pickReference="onPickReference"
                                @resetReference="resetBaseStats"
                                @visualizeDemographics="visualizeDemographics(baseStats)"
                            />
                            <v-divider />
                            <div class="mb-5 overline">
                                {{ $t('additional:modules.tools.cosi.residentialSimulation.subTitle') }}
                            </div>
                            <v-row dense>
                                <v-col cols="3">
                                    <v-subheader>Name</v-subheader>
                                </v-col>
                                <v-col cols="9">
                                    <v-text-field
                                        v-model="neighborhood.name"
                                        label="Quartiername"
                                    />
                                </v-col>
                            </v-row>
                            <GeometryPicker
                                ref="geometry-picker"
                                :geom-field="geomField"
                                :is-gml="false"
                                @updateGeometry="updateGeometry"
                            />
                            <v-row dense>
                                <v-col cols="3">
                                    <v-subheader>Grundfläche</v-subheader>
                                </v-col>
                                <v-col cols="9">
                                    <v-text-field
                                        v-model="polygonArea"
                                        readonly
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
                                        @input="updateResidents"
                                    />
                                </v-col>
                            </v-row>
                            <v-row
                                :title="!geometry ? $t('additional:modules.tools.cosi.residentialSimulation.noGeomWarning') : $t('additional:modules.tools.cosi.residentialSimulation.helpUnits')"
                                dense
                            >
                                <v-col cols="3">
                                    <v-subheader>
                                        {{ $t('additional:modules.tools.cosi.residentialSimulation.units') }}
                                    </v-subheader>
                                </v-col>
                                <v-col cols="9">
                                    <Slider
                                        v-if="!isInitializing"
                                        ref="housingUnits"
                                        :disabled="Boolean(!geometry)"
                                        :info="$t('additional:modules.tools.cosi.residentialSimulation.helpUnits')"
                                        :min-value="0"
                                        :max-value="Math.ceil(polygonArea / 5) || 1"
                                        :prechecked="neighborhood.housingUnits"
                                        @changeRule="updateUnits"
                                    />
                                    <!-- <v-slider
                                        ref="slider-units"
                                        v-model="neighborhood.housingUnits"
                                        :hint="$t('additional:modules.tools.cosi.residentialSimulation.helpUnits')"
                                        min="0"
                                        :max="(polygonArea / 5) || 1"
                                        :disabled="!geometry"
                                        @input="updateUnits"
                                    >
                                        <template #append>
                                            <v-text-field
                                                v-model="neighborhood.housingUnits"
                                                class="mt-0 pt-0 slider-val"
                                                hide-details
                                                single-line
                                                type="number"
                                                @input="updateUnits"
                                            />
                                        </template>
                                    </v-slider> -->
                                </v-col>
                            </v-row>
                            <v-row
                                :title="!geometry ? $t('additional:modules.tools.cosi.residentialSimulation.noGeomWarning') : $t('additional:modules.tools.cosi.residentialSimulation.helpBgf')"
                                dense
                            >
                                <v-col cols="3">
                                    <v-subheader>
                                        {{ $t('additional:modules.tools.cosi.residentialSimulation.bgf') }}
                                    </v-subheader>
                                </v-col>
                                <v-col cols="9">
                                    <Slider
                                        v-if="!isInitializing"
                                        ref="bgf"
                                        :disabled="Boolean(!geometry)"
                                        :info="$t('additional:modules.tools.cosi.residentialSimulation.bgf')"
                                        :min-value="0"
                                        :max-value="Math.ceil(polygonArea * 4) || 1"
                                        :prechecked="neighborhood.bgf"
                                        @changeRule="updateBgf"
                                    />
                                    <!-- <v-slider
                                        ref="slider-bgf"
                                        v-model="neighborhood.bgf"
                                        :hint="$t('additional:modules.tools.cosi.residentialSimulation.bgf')"
                                        min="0"
                                        :max="(polygonArea * 4) || 1"
                                        :disabled="!geometry"
                                        @input="updateBgf"
                                    >
                                        <template #append>
                                            <v-text-field
                                                v-model="neighborhood.bgf"
                                                class="mt-0 pt-0 slider-val"
                                                hide-details
                                                single-line
                                                type="number"
                                                @input="updateBgf"
                                            />
                                        </template>
                                    </v-slider> -->
                                </v-col>
                            </v-row>
                            <v-row
                                :title="!geometry ? $t('additional:modules.tools.cosi.residentialSimulation.noGeomWarning') : $t('additional:modules.tools.cosi.residentialSimulation.helpHouseholdSize')"
                                dense
                            >
                                <v-col cols="3">
                                    <v-subheader>
                                        {{ $t('additional:modules.tools.cosi.residentialSimulation.householdSize') }}
                                    </v-subheader>
                                </v-col>
                                <v-col cols="9">
                                    <Slider
                                        v-if="!isInitializing"
                                        ref="avgHouseholdSize"
                                        :disabled="Boolean(!geometry)"
                                        :info="$t('additional:modules.tools.cosi.residentialSimulation.helpHouseholdSize')"
                                        :min-value="0"
                                        :max-value="5"
                                        :decimal-places="1"
                                        :prechecked="neighborhood.avgHouseholdSize"
                                        @changeRule="updateHousholdSize"
                                    />
                                    <!-- <v-slider
                                        ref="slider-householdsize"
                                        v-model="neighborhood.avgHouseholdSize"
                                        :hint="$t('additional:modules.tools.cosi.residentialSimulation.helpHouseholdSize')"
                                        min="0"
                                        max="5"
                                        step="0.2"
                                        :disabled="!geometry"
                                        @input="updateHousholdSize"
                                    >
                                        <template #append>
                                            <v-text-field
                                                v-model="neighborhood.avgHouseholdSize"
                                                class="mt-0 pt-0 slider-val"
                                                hide-details
                                                single-line
                                                type="number"
                                                @input="updateHousholdSize"
                                            />
                                        </template>
                                    </v-slider> -->
                                </v-col>
                            </v-row>
                            <v-row dense>
                                <v-col cols="3">
                                    <v-subheader>GFZ</v-subheader>
                                </v-col>
                                <v-col cols="9">
                                    <Slider
                                        v-if="!isInitializing"
                                        ref="gfz"
                                        :disabled="Boolean(!geometry)"
                                        :info="$t('additional:modules.tools.cosi.residentialSimulation.helpGfz')"
                                        :min-value="0"
                                        :max-value="4"
                                        :decimal-places="1"
                                        :prechecked="neighborhood.gfz"
                                        @changeRule="updateGfz"
                                    />
                                    <!-- <v-slider
                                        ref="slider-gfz"
                                        v-model="neighborhood.gfz"
                                        hint="GFZ"
                                        min="0"
                                        max="4"
                                        step="0.1"
                                        :disabled="!geometry"
                                        @input="updateGfz"
                                    >
                                        <template #append>
                                            <v-text-field
                                                v-model="neighborhood.gfz"
                                                class="mt-0 pt-0 slider-val"
                                                hide-details
                                                single-line
                                                type="number"
                                                @input="updateGfz"
                                            />
                                        </template>
                                    </v-slider> -->
                                </v-col>
                            </v-row>
                            <v-row dense>
                                <v-col cols="3">
                                    <v-subheader>Bevölkerungsdichte</v-subheader>
                                </v-col>
                                <v-col cols="9">
                                    <Slider
                                        v-if="!isInitializing"
                                        ref="populationDensity"
                                        :disabled="Boolean(!geometry)"
                                        label="EW / km²"
                                        :min-value="0"
                                        :max-value="50000"
                                        :prechecked="neighborhood.populationDensity"
                                        @changeRule="updateDensity"
                                    />
                                    <!-- <v-slider
                                        ref="slider-density"
                                        :value="neighborhood.populationDensity"
                                        hint="EW / km²"
                                        min="0"
                                        max="50000"
                                        :disabled="!geometry"
                                        @end="updateDensity"
                                    >
                                        <template #append>
                                            <v-text-field
                                                :value="neighborhood.populationDensity"
                                                class="mt-0 pt-0 slider-val"
                                                hide-details
                                                single-line
                                                type="number"
                                                @change="updateDensity"
                                            />
                                        </template>
                                    </v-slider> -->
                                </v-col>
                            </v-row>
                            <v-row
                                :title="!geometry ? $t('additional:modules.tools.cosi.residentialSimulation.noGeomWarning') : $t('additional:modules.tools.cosi.residentialSimulation.helpLivingSpace')"
                                dense
                            >
                                <v-col cols="3">
                                    <v-subheader>
                                        {{ $t('additional:modules.tools.cosi.residentialSimulation.helpLivingSpace') }}
                                    </v-subheader>
                                </v-col>
                                <v-col cols="9">
                                    <Slider
                                        v-if="!isInitializing"
                                        ref="livingSpace"
                                        :disabled="Boolean(!geometry)"
                                        label="m² / EW"
                                        :min-value="0"
                                        :max-value="100"
                                        :prechecked="neighborhood.livingSpace"
                                        @changeRule="updateLivingSpace"
                                    />
                                    <!-- <v-slider
                                        ref="slider-livingspace"
                                        v-model="neighborhood.livingSpace"
                                        hint="m² / EW"
                                        min="0"
                                        max="100"
                                        :disabled="!geometry"
                                        @end="updateLivingSpace"
                                    >
                                        <template #append>
                                            <v-text-field
                                                :value="neighborhood.livingSpace"
                                                class="mt-0 pt-0 slider-val"
                                                hide-details
                                                single-line
                                                type="number"
                                                @change="updateLivingSpace"
                                            />
                                        </template>
                                    </v-slider> -->
                                </v-col>
                            </v-row>
                            <v-row
                                :title="!geometry ? $t('additional:modules.tools.cosi.residentialSimulation.noGeomWarning') : $t('additional:modules.tools.cosi.residentialSimulation.helpLivingSpaceRatio')"
                                dense
                            >
                                <v-col cols="3">
                                    <v-subheader>
                                        {{ $t('additional:modules.tools.cosi.residentialSimulation.livingSpaceRatio') }}
                                    </v-subheader>
                                </v-col>
                                <v-col cols="3">
                                    <Slider
                                        v-if="!isInitializing"
                                        ref="livingSpaceRatio"
                                        :disabled="Boolean(!geometry)"
                                        label="m² / EW"
                                        :min-value="0"
                                        :max-value="1"
                                        :decimal-places="2"
                                        :prechecked="neighborhood.livingSpaceRatio"
                                        @changeRule="updateLivingSpaceRatio"
                                    />
                                    <!-- <v-text-field
                                        v-model="neighborhood.livingSpaceRatio"
                                        class="mt-0 pt-0 slider-val"
                                        hide-details
                                        single-line
                                        type="number"
                                        :disabled="!geometry"
                                    /> -->
                                </v-col>
                            </v-row>
                            <v-divider />
                            <v-row dense>
                                <v-col cols="12">
                                    <v-menu
                                        ref="datePicker"
                                        v-model="datePicker"
                                        :close-on-content-click="false"
                                        :return-value.sync="neighborhood.year"
                                        transition="scale-transition"
                                        offset-y
                                        max-width="290px"
                                        min-width="auto"
                                    >
                                        <template #activator="{ on, attrs }">
                                            <!-- eslint-disable-next-line vue/no-multiple-template-root -->
                                            <v-text-field
                                                v-model="neighborhood.year"
                                                :label="$t('additional:modules.tools.cosi.residentialSimulation.dateOfCompletion')"
                                                prepend-icon="mdi-calendar"
                                                readonly
                                                v-bind="attrs"
                                                v-on="on"
                                            />
                                        </template>
                                        <v-date-picker
                                            v-model="neighborhood.year"
                                            type="month"
                                            no-title
                                            scrollable
                                        >
                                            <v-spacer />
                                            <v-btn
                                                text
                                                color="primary"
                                                @click="datePicker = false"
                                            >
                                                {{ $t("common:button.cancel") }}
                                            </v-btn>
                                            <v-btn
                                                text
                                                color="primary"
                                                @click="$refs.datePicker.save(neighborhood.year)"
                                            >
                                                OK
                                            </v-btn>
                                        </v-date-picker>
                                    </v-menu>
                                </v-col>
                            </v-row>
                            <v-divider />
                            <v-row dense>
                                <v-col
                                    class="flex"
                                    cols="12"
                                >
                                    <v-btn
                                        dense
                                        small
                                        tile
                                        color="grey lighten-1"
                                        class="flex-item"
                                        @click="resetFeature"
                                    >
                                        <v-icon>mdi-eraser</v-icon>
                                        <span>
                                            {{ $t('additional:modules.tools.cosi.residentialSimulation.resetFeature') }}
                                        </span>
                                    </v-btn>
                                    <v-btn
                                        dense
                                        small
                                        tile
                                        color="grey lighten-1"
                                        class="flex-item"
                                        :disabled="!neighborhood.stats || geometry === null"
                                        @click="editStatsTable = true"
                                    >
                                        <v-icon>mdi-pencil</v-icon>
                                        <span>
                                            {{ $t("additional:modules.tools.cosi.statisticsTable.editStatsTable") }}
                                        </span>
                                    </v-btn>
                                    <v-btn
                                        dense
                                        small
                                        tile
                                        color="primary"
                                        :title="$t('additional:modules.tools.cosi.residentialSimulation.createFeatureHelp')"
                                        :disabled="!activeScenario || geometry === null || !neighborhood.stats || isCreated"
                                        class="flex-item"
                                        @click="createFeature"
                                    >
                                        <v-icon>mdi-home-plus</v-icon>
                                        <span>
                                            {{ $t('additional:modules.tools.cosi.residentialSimulation.createFeature') }}
                                        </span>
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </div>
                        <Modal
                            :show-modal="editStatsTable"
                            @modalHid="editStatsTable = false"
                            @clickedOnX="escapeEditStatsTable"
                            @clickedOutside="escapeEditStatsTable"
                        >
                            <v-container>
                                <v-card-title primary-title>
                                    {{ $t("additional:modules.tools.cosi.statisticsTable.editStatsTable") }} : {{ neighborhood.name }}
                                </v-card-title>
                                <v-subheader>
                                    {{ $t("additional:modules.tools.cosi.statisticsTable.referencePicker.reference") }} ({{ baseStats.reference.districtLevel }}): {{ baseStats.reference.districtName }}
                                </v-subheader>
                                <div class="stats-table-modal">
                                    <StatisticsTable
                                        v-if="neighborhood.stats && geometry !== null"
                                        v-model="neighborhood.stats"
                                    />
                                </div>
                            </v-container>
                        </Modal>
                    </v-main>
                    <v-snackbar
                        v-model="errorMsg"
                        :timeout="5000"
                        color="error"
                        multi-line
                    >
                        {{ $t('additional:modules.tools.cosi.residentialSimulation.valueError') }}<br>
                        <div
                            v-for="el in invalidValues"
                            :key="el.id"
                        >
                            <small>
                                <span><i>{{ $t(`additional:modules.tools.cosi.residentialSimulation.${el.id}`) }}</i>: {{ el.val.toLocaleString(currentLocale) }} </span>
                                <span>- {{ $t('additional:modules.tools.cosi.residentialSimulation.bounds') }}: {{ lowerBounds[el.id] }} - {{ upperBounds[el.id] }}</span>
                            </small>
                        </div>
                        <template #action="{ attrs }">
                            <v-btn
                                text
                                v-bind="attrs"
                                @click="errorMsg = false"
                            >
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </template>
                    </v-snackbar>
                </v-app>
            </template>
        </Tool>
        <NeighborhoodEditor
            :drawing-layer="drawingLayer"
            @visualizeDemographics="visualizeDemographics"
        />
    </div>
</template>

<style lang="scss">
    .slider-val {
        width: 60px;
        input {
            text-align: right;
        }
    }
    .stats-table-modal {
        height: 65vh;
        overflow-y: scroll;
        margin-bottom: 20px;
    }
</style>
