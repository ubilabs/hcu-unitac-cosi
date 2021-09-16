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
import ChartDataSet from "../../ChartGenerator/classes/ChartDataSet";
import {updateArea, updateUnits, updateResidents, updateDensity, updateLivingSpace, updateGfz, updateBgf, updateHousholdSize} from "../utils/updateNeighborhoodData";
import residentialLayerStyle from "../utils/residentialLayerStyle";
import Feature from "ol/Feature";
import ScenarioNeighborhood from "../../ScenarioBuilder/classes/ScenarioNeighborhood";
import Modal from "../../../../src/share-components/modals/Modal.vue";

export default {
    name: "ResidentialSimulation",
    components: {
        Tool,
        ScenarioManager,
        GeometryPicker,
        ReferenceDistrictPicker,
        StatisticsTable,
        Modal
    },
    data () {
        return {
            datePicker: false,
            editDialog: false,
            editFeature: null,
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
            }
        };
    },
    computed: {
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
        ...mapGetters("Map", ["map"]),
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
            this.editFeature = null;
            this.editDialog = false;

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

        geometry () {
            this.neighborhood.area = this.polygonArea;
            this.updateArea(this.polygonArea);
        },

        async baseStats () {
            if (!(this.baseStats.reference?.districtName && this.baseStats.reference?.districtLevel)) {
                return;
            }

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

            /**
             * @todo remove timeout - only used due to issues in ChartGenerator module
             * will be refactored
             */
            await this.$nextTick();
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
    mounted () {
        this.createDrawingLayer();
        this.map.addEventListener("click", this.openEditDialog.bind(this));
    },
    methods: {
        ...mapMutations("Tools/ResidentialSimulation", Object.keys(mutations)),
        ...mapActions("Map", ["createLayer"]),
        ...mapMutations("Tools/ChartGenerator", ["setNewDataSet"]),
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

            this.setNewDataSet(chartData);
        },

        getChartDataSet (labels, districtName) {
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
                // districts = getContainingDistrictForFeature(this.selectedDistrictLevel, feature, true, true),
                // districts = getAllContainingDistricts(this.districtLevels, feature, true),
                neighborhood = new ScenarioNeighborhood(feature, this.drawingLayer, this.districtLevels);

            this.activeScenario.addNeighborhood(neighborhood);

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

            // reset fallback data to defaults
            this.fallbacks.avgHouseholdSize = this.defaults.avgHouseholdSize;
            this.fallbacks.gfz = this.defaults.gfz;
            this.fallbacks.populationDensity = this.defaults.populationDensity;
            this.fallbacks.livingSpace = this.defaults.livingSpace;

            // reset baseStats from reference
            this.baseStats = {
                reference: {},
                absolute: [],
                relative: []
            };

            // reset geometry
            geomPickerResetLocation(this.$refs["geometry-picker"]);
        },

        openEditDialog (evt) {
            this.editFeature = null;
            this.map.forEachFeatureAtPixel(evt.pixel, feature => {
                this.editFeature = feature;
                this.editDialog = true;
            }, {
                layerFilter: l => l === this.drawingLayer
            });

            if (!this.editFeature) {
                this.editDialog = false;
            }
        },

        deleteNeighborhood () {
            this.activeScenario.removeNeighborhood(this.editFeature);
            this.editDialog = false;
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
            <v-app absolute>
                <v-main
                    id="scenario-builder"
                >
                    <div>
                        <div class="form-group">
                            <label> {{ $t('additional:modules.tools.cosi.scenarioManager.title') }} </label>
                            <ScenarioManager />
                        </div>
                        <v-divider />
                        <div class="form-group">
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
                            <ReferenceDistrictPicker
                                :groups-list="groupsList"
                                :timeline-prefix="timelinePrefix"
                                @referencePickerActive="onReferencePickerActive"
                                @pickReference="onPickReference"
                            />
                            <v-divider />
                            <v-row dense>
                                <v-col
                                    class="flex"
                                    cols="12"
                                >
                                    <v-btn
                                        tile
                                        depressed
                                        class="flex-item"
                                        @click="resetFeature"
                                    >
                                        <v-icon>mdi-eraser</v-icon>
                                        <span>
                                            {{ $t('additional:modules.tools.cosi.residentialSimulation.resetFeature') }}
                                        </span>
                                    </v-btn>
                                    <v-btn
                                        tile
                                        depressed
                                        class="flex-item"
                                        :disabled="!neighborhood.stats || geometry === null"
                                        @click="editStatsTable = true"
                                    >
                                        <v-icon>mdi-pencil</v-icon>
                                        <span>
                                            {{ $t("common:button.edit") }}
                                        </span>
                                    </v-btn>
                                    <v-btn
                                        tile
                                        depressed
                                        color="primary"
                                        :title="$t('additional:modules.tools.cosi.residentialSimulation.createFeatureHelp')"
                                        :disabled="!activeScenario || geometry === null || !neighborhood.stats"
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
                            <v-row>
                                <v-col cols="12">
                                    <!-- <v-btn
                                        tile
                                        depressed
                                        color="primary"
                                        :title="$t('additional:modules.tools.cosi.residentialSimulation.createFeatureHelp')"
                                        :disabled="!activeScenario || geometry === null || !neighborhood.stats"
                                        class="flex-item"
                                        @click="createFeature"
                                    >
                                        <v-icon>mdi-home-plus</v-icon>
                                        <span>
                                            {{ $t('additional:modules.tools.cosi.residentialSimulation.createFeature') }}
                                        </span>
                                    </v-btn> -->
                                </v-col>
                            </v-row>
                        </div>
                    </div>
                    <v-snackbar
                        v-model="editDialog"
                        :timeout="-1"
                        color="grey"
                    >
                        {{ $t('additional:modules.tools.cosi.residentialSimulation.editFeature') }}

                        <template #action="{ attrs }">
                            <v-btn
                                v-bind="attrs"
                                text
                                @click="deleteNeighborhood"
                            >
                                {{ $t("common:button.delete") }}
                            </v-btn>
                            <!-- NOT IMPLEMENTED -->
                            <!-- <v-btn
                                v-bind="attrs"
                                text
                                @click="editStatsTable = true; editDialog = false;"
                            >
                                {{ $t("common:button.edit") }}
                            </v-btn> -->
                        </template>
                    </v-snackbar>
                    <Modal
                        :show-modal="editStatsTable"
                        @modalHid="escapeEditStatsTable"
                        @clickedOnX="escapeEditStatsTable"
                        @clickedOutside="escapeEditStatsTable"
                    >
                        <v-container>
                            <v-card-title primary-title>
                                {{ $t("additional:modules.tools.cosi.residentialSimulation.editStatsTable") }}
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
</template>

<style lang="less">
    .slider-val {
        width: 60px;
    }
    .stats-table-modal {
        height: 65vh;
        overflow-y: scroll;
    }
</style>
