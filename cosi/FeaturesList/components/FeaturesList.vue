<script>
/* eslint-disable new-cap */
import Tool from "../../../../src/modules/tools/Tool.vue";
import getComponent from "../../../../src/utils/getComponent";
import {mapState, mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersFeaturesList";
import mutations from "../store/mutationsFeaturesList";
import actions from "../store/actionsFeaturesList";
import getVectorlayerMapping from "../utils/getVectorlayerMapping";
import Multiselect from "vue-multiselect";
import {getContainingDistrictForFeature} from "../../utils/geomUtils";
import getClusterSource from "../../utils/getClusterSource";
import highlightVectorFeature from "../../utils/highlightVectorFeature";
import DetailView from "./DetailView.vue";
import FeatureIcon from "./FeatureIcon.vue";
import {prepareTableExport, prepareDetailsExport, composeFilename} from "../utils/prepareExport";
import exportXlsx from "../../utils/exportXlsx";
import arrayIsEqual from "../../utils/arrayIsEqual";
import truncate from '@turf/truncate';

export default {
    name: "FeaturesList",
    components: {
        Tool,
        Multiselect,
        DetailView,
        FeatureIcon
    },
    data () {
        return {
            search: "",
            layerFilter: [],
            expanded: [],
            filterProps: {},
            filteredItems: [],
            excludedPropsForExport: [
                "Icon",
                "Aktionen",
                "Ein-/Ausschalten",
                "layerId",
                "feature",
                "key"
            ],
            featureColumns: [
                {
                    text: this.$t("additional:modules.tools.cosi.featuresList.colIcon"),
                    value: "style",
                    filterable: false,
                    sortable: false
                },
                {
                    text: this.$t("additional:modules.tools.cosi.featuresList.colFacility"),
                    value: "name"
                },
                {
                    text: this.$t("additional:modules.tools.cosi.featuresList.colDistrict"),
                    value: "district"
                },
                {
                    text: this.$t("additional:modules.tools.cosi.featuresList.colAddress"),
                    value: "address",
                    divider: true
                },
                {
                    text: this.$t("additional:modules.tools.cosi.featuresList.colLayerName"),
                    value: "layerName",
                    filter: value => {
                        if (this.layerFilter.length < 1) {
                            return true;
                        }

                        return this.layerFilter.map(t => t.id).includes(value);
                    }
                },
                {
                    text: this.$t("additional:modules.tools.cosi.featuresList.colType"),
                    value: "type",
                    divider: true
                },
                {
                    text: this.$t("additional:modules.tools.cosi.featuresList.colGroup"),
                    value: "group",
                    divider: true
                }
            ],
            actionColumns: [
                // {
                //     text: this.$t("additional:modules.tools.cosi.featuresList.colActions"),
                //     value: "actions"
                // },
                {
                    text: this.$t("additional:modules.tools.cosi.featuresList.colToggleEnabled"),
                    value: "enabled"
                }
            ]
        };
    },
    computed: {
        ...mapGetters("Tools/FeaturesList", Object.keys(getters)),
        ...mapGetters("Tools/ScenarioBuilder", ["activeSimulatedFeatures"]),
        ...mapGetters("Tools/DistrictSelector", {selectedDistrictLevel: "selectedDistrictLevel", selectedDistrictFeatures: "selectedFeatures", districtLayer: "layer", bufferValue: "bufferValue"}),
        ...mapState(["configJson"]),
        columns () {
            console.log([
                ...this.featureColumns,
                ...this.numericalColumns,
                ...this.actionColumns
            ]);
            return [
                ...this.featureColumns,
                ...this.numericalColumns,
                ...this.actionColumns
            ];
        },
        selected: {
            get () {
                return this.selectedFeatureItems;
            },
            set (value) {
                this.setSelectedFeatureItems(value);
            }
        },
        items: {
            get () {
                return this.featuresListItems;
            },
            set (value) {
                this.setFeaturesListItems(value);
            }
        },
        numericalColumns () {
            const numCols = this.flatActiveLayerMapping.reduce((cols, mappingObj) => {
                return [
                    ...cols,
                    ...mappingObj.numericalValues.map(v => ({
                        text: v.name,
                        value: v.id
                    }))
                ];
            }, []);

            // add divider to last col
            if (numCols.length > 0) {
                numCols[numCols.length - 1].divider = true;
            }

            return numCols;
        }
    },
    watch: {
        /**
         * Unselect the Menu item if the tool is deactivated
         * @param {boolean} state - Defines if the tool is active.
         * @returns {void}
         */
        active (state) {
            if (!state) {
                const model = getComponent(this.id);

                if (model) {
                    model.set("isActive", false);
                }

                this.removeHighlightFeature();
            }
        },

        /**
         * Updates the feature highlighting on selection change
         * @listens #change:this.$data.selected
         * @returns {void}
         */
        selected () {
            this.removeHighlightFeature();
            this.selected.forEach(item => highlightVectorFeature(item.feature, item.layerId));
        },

        /**
         * Updates the list on added/removed scenario features
         * @listens #change:Tools/ScenarioBuilder/activeSimulatedFeatures
         * @returns {void}
         */
        activeSimulatedFeatures () {
            this.updateFeaturesList();
        },

        /**
         * Listens to the layers change on the map to refresh the table
         * @listens #change:FeaturesList/activeVectorLayerList
         * @param {module:ol/layer/Vector[]} newList - the new activeVectorLayerList
         * @param {module:ol/layer/Vector[]} oldList - the old activeVectorLayerList
         * @returns {void}
         */
        activeVectorLayerList (newList, oldList) {
            if (!arrayIsEqual(newList, oldList)) {
                this.$nextTick(() => {
                    this.updateFeaturesList();
                });
            }
        }
    },
    created () {
        /**
         * listens to the close event of the Tool Component
         * @listens #close
         */
        this.$on("close", () => {
            this.setActive(false);
        });
    },
    mounted () {
        // initally set the facilities mapping based on the config.json
        this.setMapping(this.getVectorlayerMapping(this.configJson.Themenconfig));
        this.updateFeaturesList();

        /**
         * @description Listen to newly loaded VectorLayer Features to update the FeaturesList
         * Doubles execution from the visibleLayerList listener, but necessary due to delay in features loaded
         * @todo refactor to vuex, there should be an event on the map calling out loaded features
         * @deprecated
         */
        Radio.on("VectorLayer", "featuresLoaded", () => {
            this.updateFeaturesList();
        });
    },
    methods: {
        ...mapMutations("Tools/FeaturesList", Object.keys(mutations)),
        ...mapActions("Tools/FeaturesList", Object.keys(actions)),
        ...mapActions("Map", ["removeHighlightFeature"]),

        getVectorlayerMapping,

        /**
         * Reads the active vector layers, constructs the list of table items and writes them to the store.
         * Finds the containing district from districtSelector for each feature
         * @todo connect to other features and statistics to build location score
         * @returns {void}
         */
        updateFeaturesList () {
            if (this.activeLayerMapping.length > 0) {
                this.items = this.activeVectorLayerList.reduce((list, vectorLayer) => {
                    const features = getClusterSource(vectorLayer).getFeatures(),
                        layerMap = this.layerMapById(vectorLayer.get("id")),
                        layerStyleFunction = vectorLayer.getStyleFunction();

                    list.push(...this.checkDisabledFeatures(vectorLayer));

                    return [...list, ...features.map((feature) => {
                        return {
                            key: feature.getId(),
                            name: feature.get(layerMap.keyOfAttrName),
                            style: layerStyleFunction(feature),
                            district: getContainingDistrictForFeature(this.selectedDistrictLevel, feature, false),
                            group: layerMap.group,
                            layerName: layerMap.id,
                            layerId: layerMap.layerId,
                            type: feature.get(layerMap.categoryField),
                            address: layerMap.addressField.map(field => feature.get(field)).join(", "),
                            feature: feature,
                            enabled: true,
                            isSimulation: feature.get("isSimulation") || false,
                            ...Object.fromEntries(layerMap.numericalValues.map(field => [field.id, feature.get(field.id)]))
                        };
                    })];
                }, []);
            }
            else {
                this.items = [];
            }
        },

        checkDisabledFeatures (layer) {
            return this.disabledFeatureItems.filter(item => item.layerId === layer.get("id"));
        },

        /**
         * Checks each table item for values to set specific css-classes for the row
         * @param {Object} item - the table item to check
         * @returns {String[]} an array of css-classes
         */
        getRowClasses (item) {
            const classes = [];

            if (item.isSimulation) {
                classes.push("light-green", "lighten-4");
            }
            // potentially add more conditionals here

            return classes;
        },

        handleClickRow (item) {
            if (item.enabled) {
                this.removeHighlightFeature();
                highlightVectorFeature(item.feature, item.layerId);
            }
        },

        updateFilterProps (newFilterProps) {
            this.filterProps = {
                ...this.filterProps,
                ...newFilterProps
            };
        },

        /**
         * @todo
         * @param {Object} item - the table item clicked
         * @returns {void}
         */
        editFeature (item) {
            console.warn(item, "not implemented");
        },

        /**
         * @todo
         * @param {Object} item - the table item clicked
         * @returns {void}
         */
        deleteFeature (item) {
            console.warn(item, "not implemented");
        },

        /**
         * Sets the filteredItems for export
         * @param {Object[]} items - the table items visible
         * @returns {void}
         */
        setFilteredItems (items) {
            this.filteredItems = items;
        },

        /**
         * Export the table as XLSX
         * Either the simple view or incl. details
         * @param {Boolean} exportDetails - whether to include the detailed feature data
         * @returns {void}
         */
        exportTable (exportDetails = false) {
            const data = this.search ? this.filteredItems : this.items,
                exportData = exportDetails ? prepareDetailsExport(data, this.filterProps) : prepareTableExport(data),
                filename = composeFilename(this.$t("additional:modules.tools.cosi.featuresList.exportFilename"));

            exportXlsx(exportData, filename, {exclude: this.excludedPropsForExport});
        },

        toggleFeature (featureItem) {
            this.toggleFeatureDisabled(featureItem);
            this.$root.$emit("updateFeature");
        }
    }
};
</script>

<template lang="html">
    <Tool
        ref="tool"
        :title="$t('additional:modules.tools.cosi.featuresList.title')"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
    >
        <template
            v-if="active"
            #toolBody
        >
            <v-app>
                <div id="features-list">
                    <form class="form-inline features-list-controls">
                        <div class="form-group selection">
                            <Multiselect
                                v-if="activeLayerMapping.length > 0"
                                v-model="layerFilter"
                                class="layer_selection"
                                :options="activeLayerMapping"
                                group-label="group"
                                :group-select="false"
                                group-values="layer"
                                track-by="id"
                                label="id"
                                :multiple="true"
                                selected-label=""
                                select-label=""
                                deselect-label=""
                                :placeholder="$t('additional:modules.tools.cosi.featuresList.layerFilter')"
                            >
                                <template slot="singleLabel">
                                    <strong>{{ layerFilter.id }}</strong>
                                </template>
                            </Multiselect>
                        </div>
                        <div class="form-group selection">
                            <input
                                v-model="search"
                                class="form-control search"
                                type="text"
                                :placeholder="$t('additional:modules.tools.cosi.featuresList.search')"
                            >
                        </div>
                    </form>
                    <form>
                        <div class="form-group features-list-table">
                            <v-data-table
                                v-model="selected"
                                :headers="columns"
                                :items="items"
                                :search="search"
                                :expanded.sync="expanded"
                                multi-sort
                                item-key="key"
                                show-select
                                show-expand
                                :items-per-page="20"
                                :item-class="getRowClasses"
                                @click:row="handleClickRow"
                                @current-items="setFilteredItems"
                            >
                                <template #expanded-item="{ headers, item }">
                                    <td
                                        class="detail-view"
                                        :colspan="headers.length"
                                    >
                                        <DetailView
                                            :item="item"
                                            :prop-blacklist="propBlacklist"
                                            :filter-props="filterProps"
                                            @filterProps="updateFilterProps"
                                        />
                                    </td>
                                </template>
                                <template #item.style="{ item }">
                                    <FeatureIcon :item="item" />
                                </template>
                                <template #item.actions="{ item }">
                                    <v-icon
                                        small
                                        disabled
                                        class="mr-2 not-implemented"
                                        title="Noch nicht implementiert"
                                        @click="editFeature(item)"
                                    >
                                        mdi-pencil
                                    </v-icon>
                                    <v-icon
                                        small
                                        disabled
                                        class="mr-2 not-implemented"
                                        title="Noch nicht implementiert"
                                        @click="deleteFeature(item)"
                                    >
                                        mdi-delete
                                    </v-icon>
                                </template>
                                <template #item.enabled="{ item }">
                                    <v-switch
                                        v-model="item.enabled"
                                        dense
                                        @change="toggleFeature(item)"
                                    />
                                </template>
                            </v-data-table>
                        </div>
                        <div class="form-group">
                            <v-row>
                                <v-col cols="12">
                                    <v-btn
                                        id="export-table"
                                        tile
                                        depressed
                                        :title="$t('additional:modules.tools.cosi.featuresList.exportTable')"
                                        @click="exportTable(false)"
                                    >
                                        {{ $t('additional:modules.tools.cosi.featuresList.exportTable') }}
                                    </v-btn>
                                    <v-btn
                                        id="export-detail"
                                        tile
                                        depressed
                                        :title="$t('additional:modules.tools.cosi.featuresList.exportDetails')"
                                        @click="exportTable(true)"
                                    >
                                        {{ $t('additional:modules.tools.cosi.featuresList.exportDetails') }}
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </div>
                    </form>
                </div>
            </v-app>
        </template>
    </Tool>
</template>

<style lang="less">
    @import "../../utils/variables.less";
    #features-list {
        input.form-control {
            font-size: 12px;
            border-color: #e8e8e8;
            height: 40px;
        }
        .detail-view {
            padding: 0;
        }
        .selection {
            width: 40%;
            .search {
                width: 100%;
            }
        }
    }
</style>

<style src="vue-select/dist/vue-select.css">
</style>


