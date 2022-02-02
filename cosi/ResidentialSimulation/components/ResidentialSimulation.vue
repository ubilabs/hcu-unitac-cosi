<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import getComponent from "../../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersResidentialSimulation";
import mutations from "../store/mutationsResidentialSimulation";
import ScenarioManager from "../../ScenarioBuilder/components/ScenarioManager.vue";
import GeometryPicker from "../../ScenarioBuilder/components/GeometryPicker.vue";
import {geomPickerUnlisten, geomPickerClearDrawPolygon, geomPickerResetLocation, geomPickerSetGeometry} from "../../ScenarioBuilder/utils/geomPickerHandler";
import ReferenceDistrictPicker from "./ReferenceDistrictPicker.vue";
import StatisticsTable from "./StatisticsTable.vue";
import NeighborhoodEditor from "./NeighborhoodEditor.vue";
import ChartDataset from "../../ChartGenerator/classes/ChartDataset";
import {updateArea, updateUnits, updateResidents, updateDensity, updateLivingSpace, updateGfz, updateBgf, updateHousholdSize} from "../utils/updateNeighborhoodData";
import residentialLayerStyle from "../utils/residentialLayerStyle";
import Feature from "ol/Feature";
import ScenarioNeighborhood from "../../ScenarioBuilder/classes/ScenarioNeighborhood";
import Modal from "../../../../src/share-components/modals/components/Modal.vue";
import processStats from "../utils/processStats";
import {getContainingDistrictForExtent} from "../../utils/geomUtils";
import ToolInfo from "../../components/ToolInfo.vue";

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
        NeighborhoodEditor
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
                populationDensity: 5000,
                livingSpace: 30,
                stats: null,
                year: new Date().toISOString().substr(0, 7)
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
            isCreated: false
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
                    // wait for 2 ticks for the drawing layer to initialize
                    await this.$nextTick();
                    this.$refs["geometry-picker"].geometry.value = this.geometry;
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
            const newLayer = await this.createLayer(this.id);

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
        },
        updateUnits (newUnits) {
            updateUnits(newUnits, this.neighborhood, this.fallbacks, this.polygonArea);
            this.unfocusInput(new Event("endaction"), this.$refs["slider-units"]);
        },
        updateResidents (newResidents) {
            updateResidents(newResidents, this.neighborhood, this.fallbacks, this.polygonArea);
            this.unfocusInput(new Event("endaction"), this.$refs["slider-units"]);
        },
        updateDensity (newDensity) {
            updateDensity(newDensity, this.neighborhood, this.fallbacks, this.polygonArea);
            this.unfocusInput(new Event("endaction"), this.$refs["slider-density"]);
        },
        updateLivingSpace (newLivingSpace) {
            updateLivingSpace(newLivingSpace, this.neighborhood, this.fallbacks, this.polygonArea);
            this.unfocusInput(new Event("endaction"), this.$refs["slider-livingspace"]);
        },
        updateGfz (newGfz) {
            updateGfz(newGfz, this.neighborhood, this.fallbacks, this.polygonArea);
            this.unfocusInput(new Event("endaction"), this.$refs["slider-gfz"]);
        },
        updateBgf (newBgf) {
            updateBgf(newBgf, this.neighborhood, this.fallbacks, this.polygonArea);
            this.unfocusInput(new Event("endaction"), this.$refs["slider-bgf"]);
        },
        updateHousholdSize (newHouseholdSize) {
            updateHousholdSize(newHouseholdSize, this.neighborhood, this.fallbacks, this.polygonArea);
            this.unfocusInput(new Event("endaction"), this.$refs["slider-householdsize"]);
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
            this.neighborhood.year = new Date().toISOString().substr(0, 7);

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
            if (ref.isActive) {
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
                                        @change="updateResidents"
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
                                    <v-slider
                                        ref="slider-units"
                                        v-model="neighborhood.housingUnits"
                                        :hint="$t('additional:modules.tools.cosi.residentialSimulation.helpUnits')"
                                        min="0"
                                        :max="(polygonArea / 5) || 1"
                                        :disabled="!geometry"
                                        @change="updateUnits"
                                    >
                                        <template #append>
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
                            <v-row
                                :title="!geometry ? $t('additional:modules.tools.cosi.residentialSimulation.noGeomWarning') : $t('additional:modules.tools.cosi.residentialSimulation.helpGfa')"
                                dense
                            >
                                <v-col cols="3">
                                    <v-subheader>
                                        {{ $t('additional:modules.tools.cosi.residentialSimulation.gfa') }}
                                    </v-subheader>
                                </v-col>
                                <v-col cols="9">
                                    <v-slider
                                        ref="slider-bgf"
                                        v-model="neighborhood.bgf"
                                        :hint="$t('additional:modules.tools.cosi.residentialSimulation.gfa')"
                                        min="0"
                                        :max="(polygonArea * 4) || 1"
                                        :disabled="!geometry"
                                        @change="updateBgf"
                                    >
                                        <template #append>
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
                                    <v-slider
                                        ref="slider-householdsize"
                                        v-model="neighborhood.avgHouseholdSize"
                                        :hint="$t('additional:modules.tools.cosi.residentialSimulation.helpHouseholdSize')"
                                        min="0"
                                        max="5"
                                        step="0.2"
                                        :disabled="!geometry"
                                        @change="updateHousholdSize"
                                    >
                                        <template #append>
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
                                        ref="slider-gfz"
                                        v-model="neighborhood.gfz"
                                        hint="GFZ"
                                        min="0"
                                        max="4"
                                        step="0.1"
                                        :disabled="!geometry"
                                        @change="updateGfz"
                                    >
                                        <template #append>
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
                                        ref="slider-density"
                                        v-model="neighborhood.populationDensity"
                                        hint="EW / km²"
                                        min="0"
                                        max="50000"
                                        :disabled="!geometry"
                                        @change="updateDensity"
                                    >
                                        <template #append>
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
                                        ref="slider-livingspace"
                                        v-model="neighborhood.livingSpace"
                                        hint="m² / EW"
                                        min="0"
                                        max="100"
                                        :disabled="!geometry"
                                        @change="updateLivingSpace"
                                    >
                                        <template #append>
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
                                            {{ $t("additional:modules.tools.cosi.residentialSimulation.editStatsTable") }}
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
                                    {{ $t("additional:modules.tools.cosi.residentialSimulation.editStatsTable") }} : {{ neighborhood.name }}
                                </v-card-title>
                                <v-subheader>
                                    {{ $t("additional:modules.tools.cosi.residentialSimulation.reference") }} ({{ baseStats.reference.districtLevel }}): {{ baseStats.reference.districtName }}
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
                </v-app>
            </template>
        </Tool>
        <NeighborhoodEditor
            :drawing-layer="drawingLayer"
            @visualizeDemographics="visualizeDemographics"
        />
    </div>
</template>

<style lang="less">
    .slider-val {
        width: 60px;
    }
    .stats-table-modal {
        height: 65vh;
        overflow-y: scroll;
        margin-bottom: 20px;
    }
</style>
