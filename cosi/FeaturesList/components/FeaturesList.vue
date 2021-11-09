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
import LayerWeights from "./LayerWeights.vue";
import ScoreValues from "./ScoreValues.vue";
import {prepareTableExport, prepareDetailsExport, composeFilename} from "../utils/prepareExport";
import exportXlsx from "../../utils/exportXlsx";
import arrayIsEqual from "../../utils/arrayIsEqual";
import {getLayerWhere} from "masterportalAPI/src/rawLayerList";
import deepEqual from "deep-equal";
import isFeatureActive from "../../utils/isFeatureActive";

export default {
    name: "FeaturesList",
    components: {
        Tool,
        Multiselect,
        DetailView,
        FeatureIcon,
        LayerWeights,
        ScoreValues
    },
    data () {
        return {
            distanceScoreQueue: [],
            weight: 0,
            showWeightsDialog: false,
            showScoresDialog: false,
            layerWeights: {},
            currentScores: {},
            selectedLayers: [],
            search: "",
            layerFilter: [],
            expanded: [],
            filterProps: {},
            filteredItems: [],
            excludedPropsForExport: [
                "Icon",
                "Aktionen",
                "Ein-/ Ausblenden",
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
                    text: this.$t("additional:modules.tools.cosi.featuresList.colToggleEnabled"),
                    value: "enabled"
                },
                {
                    text: this.$t("additional:modules.tools.cosi.featuresList.colFacility"),
                    value: "name"
                },
                {
                    value: "warning"
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
            ],
            numericalColumns: []
        };
    },
    computed: {
        ...mapGetters("Language", ["currentLocale"]),
        ...mapGetters("Tools/FeaturesList", Object.keys(getters)),
        ...mapGetters("Tools/ScenarioBuilder", ["activeSimulatedFeatures", "scenarioUpdated"]),
        ...mapGetters("Tools/DistrictSelector", {selectedDistrictLevel: "selectedDistrictLevel", selectedDistrictFeatures: "selectedFeatures", districtLayer: "layer", bufferValue: "bufferValue", extent: "extent"}),
        ...mapGetters("Tools/DistanceScoreService", ["wmsLayersInfo"]),
        ...mapState(["configJson"]),
        columns () {
            return [
                ...this.featureColumns,
                ...this.numericalColumns
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
        layerOptions () {
            const layers = this.getLayerList(),
                groups = layers.reduce((acc, el)=> ({...acc, [el.group]: [...acc[el.group] || [], el]}), {});

            let ret = [];

            for (const g in groups) {
                ret.push({header: g});
                ret = ret.concat(groups[g]);
            }

            return ret;
        },
        selectedFeatureLayers () {
            return this.selectedLayers.filter(l=>l.group !== "Wms Layers");
        },
        selectedWmsLayers () {
            return this.selectedLayers.filter(l=>l.group === "Wms Layers");
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
        scenarioUpdated () {
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
        },

        activeLayerMapping () {
            this.numericalColumns = this.getNumericalColumns();
        },

        selectedFeatureLayers () {
            this.numericalColumns = this.getNumericalColumns();
        },

        selectedLayers () {
            for (const layer of this.selectedFeatureLayers) {
                if (this.layerWeights[layer.layerId] === undefined) {
                    this.layerWeights[layer.layerId] = 1;
                }
            }
            this.updateDistanceScores();
        },

        items (newItems) {
            if (!deepEqual(newItems.map(i=>i.key), this.items.map(i=>i.key))) {
                this.updateDistanceScores();
            }
        },

        layerWeights () {
            this.updateDistanceScores();
        },

        extent () {
            this.updateDistanceScores();
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
        Radio.on("VectorLayer", "featuresLoaded", this.updateFeaturesList);
        Radio.on("ModelList", "showFeaturesById", this.updateFeaturesList);
        Radio.on("ModelList", "showAllFeatures", this.updateFeaturesList);
    },
    methods: {
        ...mapMutations("Tools/FeaturesList", Object.keys(mutations)),
        ...mapActions("Tools/FeaturesList", Object.keys(actions)),
        ...mapActions("Tools/DistanceScoreService", ["getDistanceScore", "getFeatureValues"]),
        ...mapActions("Map", ["removeHighlightFeature"]),

        getVectorlayerMapping,
        isFeatureActive,
        getNumericalColumns () {
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

            if (this.selectedFeatureLayers) {
                numCols.push({text: "SB", value: "distanceScore", divider: true, hasAction: true});
            }

            for (const l of this.selectedWmsLayers) {
                numCols.push({
                    text: l.name,
                    value: l.name
                });
            }

            return numCols;
        },

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
                        // only features that can be seen on the map
                        visibleFeatures = features.filter(this.isFeatureActive),
                        layerMap = this.layerMapById(vectorLayer.get("id")),
                        layerStyleFunction = vectorLayer.getStyleFunction();

                    list.push(...this.checkDisabledFeatures(vectorLayer));
                    return [...list, ...visibleFeatures.map((feature) => {
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
                            isModified: feature.get("isModified") || false,
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
                classes.push("light-green", "lighten-5");
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
            const data = this.items.filter(item => {
                    if (this.search && !this.filteredItems.includes(item)) {
                        return false;
                    }
                    if (this.selected.length > 0 && !this.selected.includes(item)) {
                        return false;
                    }
                    if (this.layerFilter.length > 0 && !this.layerFilter.map(l => l.layerId).includes(item.layerId)) {
                        return false;
                    }
                    return true;
                }),
                exportData = exportDetails ? prepareDetailsExport(data, this.filterProps) : prepareTableExport(data),
                filename = composeFilename(this.$t("additional:modules.tools.cosi.featuresList.exportFilename"));

            exportXlsx(exportData, filename, {exclude: this.excludedPropsForExport});
        },

        /**
         * Toggle a feature on/off and emit the corresponding event to trigger uodated
         * @param {Object} featureItem - the item from the table
         * @returns {void}
         */
        toggleFeature (featureItem) {
            featureItem.enabled = !featureItem.enabled;
            this.toggleFeatureDisabled(featureItem);
            this.$root.$emit("updateFeature");
        },

        getNumericalValueColor (item, key) {
            const val = parseFloat(item[key]),
                maxVal = Math.max(
                    ...this.items
                        .map(_item => parseFloat(_item[key]))
                        .filter(_item => !isNaN(_item))
                );

            if (isNaN(val)) {
                return "grey";
            }
            if (val / maxVal > 0.9) {
                return "purple";
            }
            if (val / maxVal > 0.8) {
                return "indigo";
            }
            if (val / maxVal > 0.7) {
                return "blue";
            }
            if (val / maxVal > 0.6) {
                return "cyan";
            }
            if (val / maxVal > 0.5) {
                return "teal";
            }
            if (val / maxVal > 0.4) {
                return "green";
            }
            if (val / maxVal > 0.4) {
                return "light-green";
            }
            if (val / maxVal > 0.2) {
                return "lime";
            }
            if (val / maxVal > 0.1) {
                return "amber";
            }
            return "red";
        },
        getLayerList () {
            const groups = this.mapping,
                allLayers = [];

            for (const g of groups) {
                for (const l of g.layer) {
                    const layer = getLayerWhere({id: l.layerId});

                    if (layer) {
                        allLayers.push({id: l.id, layerId: l.layerId, url: layer.url, group: g.group, featureType: layer.featureType});
                    }
                }
            }
            for (const l of this.wmsLayersInfo) {
                allLayers.push({...l, id: l.name, layerId: l.id, group: "Wms Layers"});
            }

            return allLayers;
        },
        async updateSelectedLayers (layerIds) {
            this.selectedLayers = layerIds;
        },
        async updateDistanceScores () {
            if (this.items && this.items.length) {
                const items = [];

                if (this.selectedLayers.length) {
                    this.distanceScoreQueue = [...this.items];
                    while (this.distanceScoreQueue.length) {
                        const item = {...this.distanceScoreQueue.shift()};

                        if (this.selectedFeatureLayers) {
                            const ret = await this.getDistanceScore({feature: item.feature, layerIds: this.selectedFeatureLayers.map(l=>l.layerId),
                                weights: this.selectedFeatureLayers.map(l=>this.layerWeights[l.layerId]),
                                extent: this.extent ? this.extent : undefined});

                            item.weightedDistanceScores = ret;
                            item.distanceScore = ret !== null ? ret.score.toFixed(1) : "na";
                        }
                        for (const layer of this.selectedWmsLayers) {
                            const value = await this.getFeatureValues({feature: item.feature, layerId: layer.layerId});

                            item[layer.name] = value;
                        }

                        items.push(item);
                    }

                    this.items = items;
                }
            }
        },
        updateWeights (weights) {
            this.layerWeights = {...weights};
        },
        getNumericalValueStyle (item, key) {
            const val = parseFloat(item[key]),
                maxVal = Math.max(
                    ...this.items
                        .map(_item => parseFloat(_item[key]))
                        .filter(_item => !isNaN(_item))
                );

            return {
                padding: 0,
                height: "10px",
                width: Math.round(100 * val / maxVal) + "%"
            };
        },
        showInfo (item) {
            this.currentScores = item.weightedDistanceScores;
            this.showScoresDialog = true;
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
            <v-app id="features-list-wrapper">
                <div class="my-2">
                    <v-btn
                        id="export-table"
                        dense
                        small
                        tile
                        color="grey lighten-1"
                        class="my-2"
                        :title="$t('additional:modules.tools.cosi.featuresList.exportTable')"
                        @click="exportTable(false)"
                    >
                        {{ $t('additional:modules.tools.cosi.featuresList.exportTable') }}
                    </v-btn>
                    <v-btn
                        id="export-detail"
                        dense
                        small
                        tile
                        color="grey lighten-1"
                        :title="$t('additional:modules.tools.cosi.featuresList.exportDetails')"
                        @click="exportTable(true)"
                    >
                        {{ $t('additional:modules.tools.cosi.featuresList.exportDetails') }}
                    </v-btn>
                </div>
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
                    <form class="features-list-table-wrapper">
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
                                :items-per-page="10"
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
                                <template #item.warning="{ item }">
                                    <v-icon
                                        v-if="item.isModified"
                                        :title="$t('additional:modules.tools.cosi.featuresList.warningIsModified')"
                                    >
                                        mdi-alert
                                    </v-icon>
                                    <!-- <v-icon
                                        v-if="item.isSimulation"
                                        :title="$t('additional:modules.tools.cosi.featuresList.warningIsSimulated')"
                                    >
                                        mdi-sprout
                                    </v-icon> -->
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
                                    <div class="text-center">
                                        <v-icon
                                            right
                                            @click="toggleFeature(item)"
                                        >
                                            {{ item.enabled ? 'mdi-eye' : 'mdi-eye-off' }}
                                        </v-icon>
                                    </div>
                                </template>
                                <template
                                    v-for="col in numericalColumns"
                                    #[`item.${col.value}`]="{ item }"
                                >
                                    <template v-if="!isNaN(parseFloat(item[col.value]))">
                                        <div
                                            :key="col.value"
                                            class="text-right"
                                            :class="col.hasAction? 'number-action': ''"
                                            @click="showInfo(item)"
                                        >
                                            <div>
                                                {{ parseFloat(item[col.value]).toLocaleString(currentLocale) }}
                                            </div>
                                            <div>
                                                <v-chip
                                                    :style="getNumericalValueStyle(item, col.value)"
                                                    :color="getNumericalValueColor(item, col.value)"
                                                    dark
                                                    dense
                                                />
                                            </div>
                                        </div>
                                    </template>
                                </template>
                            </v-data-table>
                        </div>
                        <v-row>
                            <v-col>
                                <v-autocomplete
                                    id="selectedLayers"
                                    :value="selectedLayers"
                                    :items="layerOptions"
                                    :label="$t('additional:modules.tools.cosi.featuresList.distanceScoreLayerLabel')"
                                    outlined
                                    dense
                                    multiple
                                    small-chips
                                    item-text="id"
                                    return-object
                                    @input="updateSelectedLayers"
                                />
                            </v-col>
                            <v-col>
                                <v-btn
                                    v-if="selectedFeatureLayers.length>0"
                                    id="weights"
                                    depressed
                                    tile
                                    @click.native="showWeightsDialog=true"
                                >
                                    {{ $t('additional:modules.tools.cosi.featuresList.weighting') }}
                                </v-btn>
                                <v-btn
                                    v-if="distanceScoreQueue.length>0"
                                    id="weights"
                                    depressed
                                    tile
                                    @click.native="distanceScoreQueue=[]"
                                >
                                    {{ $t('additional:modules.tools.cosi.featuresList.abort') }}
                                </v-btn>
                            </v-col>
                            <v-progress-linear
                                v-if="distanceScoreQueue.length>0"
                                :value="100-(distanceScoreQueue.length/items.length)*100"
                                background-color="white"
                            />
                        </v-row>
                    </form>
                </div>
                <LayerWeights
                    v-model="showWeightsDialog"
                    :weights="layerWeights"
                    :layers="selectedFeatureLayers"
                    @update="updateWeights"
                />
                <ScoreValues
                    v-model="showScoresDialog"
                    :label="$t('additional:modules.tools.cosi.featuresList.scoresDialogTitle')"
                    :scores="currentScores"
                    :layers="selectedFeatureLayers"
                />
            </v-app>
        </template>
    </Tool>
</template>

<style lang="less">
    @import "../../utils/variables.less";
    #features-list-wrapper {
        height: 100%;
        position: relative;
    }
    #features-list {
        height: 100%;
        .features-list-table-wrapper {
           height: calc(100% - 170px);
            display: block;
            position: relative;
           .features-list-table {
               height: 100%;
               .v-data-table {
                   height: 100%;
                   .v-data-table__wrapper {
                    overflow-x: auto;
                    overflow-y: auto;
                    height: 100%;
                   }
               }
           }
        }
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
        .number-action{
            cursor: pointer;
        }
    }
</style>
