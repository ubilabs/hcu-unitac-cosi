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
import DetailView from "./DetailView.vue";
import FeatureIcon from "./FeatureIcon.vue";

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
            filterProps: {}
        };
    },
    computed: {
        ...mapGetters("Tools/FeaturesList", Object.keys(getters)),
        ...mapGetters("Tools/ScenarioBuilder", ["scenario"]),
        ...mapGetters("Tools/DistrictSelector", {selectedDistrictFeatures: "selectedFeatures", districtLayer: "layer"}),
        ...mapGetters("Map", ["layerById", "visibleLayerList"]),
        ...mapState(["configJson"]),
        columns () {
            return [
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
                },
                {
                    text: this.$t("additional:modules.tools.cosi.featuresList.colActions"),
                    value: "actions"
                },
                {
                    text: this.$t("additional:modules.tools.cosi.featuresList.colToggleEnabled"),
                    value: "enabled"
                }
            ];
        },
        districtFeatures () {
            return this.selectedDistrictFeatures.length > 0 ? this.selectedDistrictFeatures : this.districtLayer.getSource().getFeatures();
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
            this.selected.forEach(item => this.highlightVectorFeatures(item));
        },

        /**
         * Updates the list on added/removed scenario features
         * @listens #change:Tools/ScenarioBuilder/scenario
         * @returns {void}
         */
        scenario () {
            this.updateFeaturesList();
        },

        /**
         * Listens to the layers change on the map to refresh the table
         * @listens #change:Map/visibleLayerList
         * @returns {void}
         */
        visibleLayerList () {
            this.$nextTick(() => {
                this.updateFeaturesList();
            });
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
        this.setMapping(getVectorlayerMapping(this.configJson.Themenconfig));

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
        ...mapActions("Map", ["highlightFeature", "removeHighlightFeature"]),

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

                    return [...list, ...features.map((feature, i) => {
                        return {
                            key: layerMap.id + i,
                            name: feature.get(layerMap.keyOfAttrName),
                            style: layerStyleFunction(feature),
                            district: getContainingDistrictForFeature(this.districtFeatures, feature),
                            group: layerMap.group,
                            layerName: layerMap.id,
                            layerId: layerMap.layerId,
                            type: feature.get(layerMap.categoryField),
                            address: layerMap.addressField.map(field => feature.get(field)).join(", "),
                            feature: feature,
                            enabled: true,
                            isSimulation: feature.get("isSimulation")
                        };
                    })];
                }, []);
            }
            else {
                this.items = [];
            }
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
            // this.removeHighlighting(item);
            this.removeHighlightFeature();
            this.highlightVectorFeatures(item);
        },

        /**
         * Highlights a vector feature
         * @param {Object} item the table item
         * @returns {void}
         */
        highlightVectorFeatures (item) {
            const geomType = item.feature.getGeometry()?.getType();

            if (geomType === "Point") {
                this.highlightFeature({
                    id: item.feature.getId(),
                    type: "increase",
                    scale: 1.4,
                    layer: {id: item.layerId}
                });
            }
            else if (geomType === "Polygon" || geomType === "MultiPolygon") {
                this.highlightFeature({
                    feature: item.feature,
                    type: "highlightPolygon",
                    highlightStyle: {
                        stroke: {color: "#F0E455", width: 5}
                    },
                    layer: {id: item.layerId}
                });
            }
        },

        updateFilterProps (newFilterProps) {
            this.filterProps = {
                ...this.filterProps,
                ...newFilterProps
            };
        },

        editFeature (item) {
            console.log(item);
            console.warn("not implemented");
        },
        deleteFeature (item) {
            console.log(item);
            console.warn("not implemented");
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
        :deactivateGFI="deactivateGFI"
    >
        <template
            v-if="active"
            v-slot:toolBody
        >
            <v-app>
                <div id="features-list">
                    <form class="form-inline features-list-controls">
                        <div class="form-group">
                            <Multiselect
                                v-if="activeLayerMapping.length > 0"
                                v-model="layerFilter"
                                class="layer_selection selection"
                                :options="activeLayerMapping"
                                group-label="group"
                                :group-select="false"
                                group-values="layer"
                                track-by="id"
                                label="id"
                                :multiple="true"
                                selectedLabel=""
                                selectLabel=""
                                deselectLabel=""
                                :placeholder="$t('additional:modules.tools.cosi.featuresList.layerFilter')"
                            >
                                <template slot="singleLabel">
                                    <strong>{{ layerFilter.id }}</strong>
                                </template>
                            </Multiselect>
                        </div>
                        <div class="form-group">
                            <input
                                v-model="search"
                                class="form-control"
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
                            >
                                <template v-slot:expanded-item="{ headers, item }">
                                    <td
                                        class="detail-view"
                                        :colspan="headers.length"
                                    >
                                        <DetailView
                                            :item="item"
                                            :propBlacklist="propBlacklist"
                                            :filterProps="filterProps"
                                            @filterProps="updateFilterProps"
                                        />
                                    </td>
                                </template>
                                <template v-slot:item.style="{ item }">
                                    <FeatureIcon :item="item" />
                                </template>
                                <template v-slot:item.actions="{ item }">
                                    <v-icon
                                        small
                                        class="mr-2"
                                        @click="editFeature(item)"
                                    >
                                        mdi-pencil
                                    </v-icon>
                                    <v-icon
                                        small
                                        @click="deleteFeature(item)"
                                    >
                                        mdi-delete
                                    </v-icon>
                                </template>
                                <template v-slot:item.enabled="{ item }">
                                    <v-switch
                                        v-model="item.enabled"
                                        dense
                                        @change="toggleFeatureDisabled(item)"
                                    />
                                </template>
                            </v-data-table>
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
    }
</style>

<style src="vue-select/dist/vue-select.css">
</style>


