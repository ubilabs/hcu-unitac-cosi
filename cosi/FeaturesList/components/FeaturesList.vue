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
import {Stroke} from "ol/style.js";

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
            expanded: []
        };
    },
    computed: {
        ...mapGetters("Tools/FeaturesList", Object.keys(getters)),
        ...mapGetters("Tools/ScenarioBuilder", ["scenario"]),
        ...mapGetters("Tools/DistrictSelector", {selectedDistrictFeatures: "selectedFeatures", districtLayer: "layer"}),
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
                    value: "district",
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
            }
        },

        selected () {
            console.log(this.selected);
        },

        scenario () {
            this.updateFeaturesList();
        }
    },
    created () {
        this.$on("close", () => {
            this.setActive(false);
        });
    },
    mounted () {
        // initally set the facilities mapping based on the config.json
        this.setMapping(getVectorlayerMapping(this.configJson.Themenconfig));

        /**
         * @description Listen to newly loaded VectorLayer Features to update the FeaturesList
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
         * Get a feature's properties, sanitized of blacklisted attributes
         * @param {Object} tableItem - the table item containing the feature
         * @returns {Object} the properties as dictionary
         */
        getFeatureProperties (tableItem) {
            const _propBlacklist = this.propBlacklist,
                props = tableItem.feature.getProperties(),
                filteredProps = Object.entries(props).filter(prop => !_propBlacklist.includes(prop[0]));

            return Object.fromEntries(filteredProps);
        },
        getFeatureTypeFields (tableItem) {
            const _propBlacklist = this.propBlacklist,
                props = tableItem.feature.getProperties();

            return Object.keys(props).reduce((fields, field) => {
                if (!_propBlacklist.includes(field)) {
                    return [...fields, {
                        text: field,
                        value: field
                    }];
                }
                return fields;
            }, []);
        },
        /**
         * Highlights a vector feature
         * @param {Object} item the table item
         * @returns {void}
         */
        highlightVectorFeatures (item) {
            this.removeHighlighting();
            if (item.feature.getGeometry()?.getType() === "Point") {
                this.highlightFeature({
                    feature: item.feature,
                    type: "increase",
                    scale: 1.2,
                    layer: {id: item.layerId}
                });
            }
            else if (item.feature.getGeometry()?.getType() === "Polygon") {
                this.highlightFeature({
                    feature: item.feature,
                    type: "highlightPolygon",
                    highlightStyle: {
                        stroke: new Stroke({color: "#3399CC", width: 5})
                    },
                    layer: {id: item.layerId}
                });
            }
        },
        /**
         * Removes the feature highlighting
         * @returns {void}
         */
        removeHighlighting () {
            this.removeHighlightFeature();
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
                            >
                                <template v-slot:expanded-item="{ headers, item }">
                                    <td
                                        class="detail-view"
                                        :colspan="headers.length"
                                    >
                                        <DetailView :items="getFeatureProperties(item)" />
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


