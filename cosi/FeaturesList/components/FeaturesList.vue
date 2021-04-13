<script>
/* eslint-disable new-cap */
import Tool from "../../../../src/modules/tools/Tool.vue";
import getComponent from "../../../../src/utils/getComponent";
import {mapState, mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersFeaturesList";
import mutations from "../store/mutationsFeaturesList";
import getVectorlayerMapping from "../utils/getVectorlayerMapping";
import Multiselect from "vue-multiselect";
import {getContainingDistrictForFeature} from "../../utils/geomUtils";
import extractClusters from "../../utils/extractClusterFeatures";
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
            expanded: [],
            columns: [
                {
                    text: "Icon",
                    value: "style",
                    filterable: false,
                    sortable: false
                },
                {
                    text: "Einrichtung",
                    value: "name"
                },
                {
                    text: "Gebiet",
                    value: "district",
                    divider: true
                },
                {
                    text: "Layer",
                    value: "layerName",
                    filter: value => {
                        if (this.layerFilter.length < 1) {
                            return true;
                        }

                        return this.layerFilter.map(t => t.id).includes(value);
                    }
                },
                {
                    text: "Typ",
                    value: "type",
                    divider: true
                },
                {
                    text: "Thema",
                    value: "group",
                    divider: true
                },
                {
                    text: "Aktionen",
                    value: "actions"
                },
                {
                    text: "Ein-/Ausschalten",
                    value: "disabled"
                }
            ]
        };
    },
    computed: {
        ...mapGetters("Tools/FeaturesList", Object.keys(getters)),
        ...mapGetters("Tools/DistrictSelector", {selectedDistrictFeatures: "selectedFeatures", districtLayer: "layer"}),
        ...mapGetters("Map", ["layerList"]),
        ...mapState(["configJson"]),
        activeVectorLayerList () {
            return this.layerList.filter(layer => this.flatActiveVectorLayerIdList.includes(layer.get("id")));
        },
        activeLayerMapping () {
            const activeLayerList = this.layerList.map(layer => layer.get("id"));

            return this.mapping.reduce((groups, group) => {
                const groupLayers = group.layer.filter(layer => activeLayerList.includes(layer.layerId));

                if (groupLayers.length > 0) {
                    return [...groups, {
                        group: group.group,
                        layer: groupLayers
                    }];
                }
                return groups;
            }, []);
        },
        flatActiveVectorLayerIdList () {
            return this.activeLayerMapping.reduce((list, group) => {
                return [...list, ...group.layer.map(l => l.layerId)];
            }, []);
        },
        flatActiveLayerMapping () {
            return this.activeLayerMapping.reduce((list, group) => {
                return [...list, ...group.layer.map(l => ({...l, group: group.group}))];
            }, []);
        },
        layerMapById () {
            return id => this.flatActiveLayerMapping.find(l => l.layerId === id);
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
            if (state) {
                this.$nextTick(() => {
                    this.updateFeaturesList();
                });
            }
            else {
                const model = getComponent(this.id);

                if (model) {
                    model.set("isActive", false);
                }
            }
        },

        selected () {
            console.log(this.selected);
        },

        featuresList () {
            console.log(this.featuresList);
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
    },
    methods: {
        ...mapMutations("Tools/FeaturesList", Object.keys(mutations)),
        ...mapActions("Map", ["highlightFeature", "removeHighlightFeature"]),
        updateFeaturesList () {
            if (this.activeLayerMapping.length > 0) {
                this.items = this.activeVectorLayerList.reduce((list, vectorLayer) => {
                    const features = extractClusters(vectorLayer.getSource()?.getFeatures() || []),
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
                            disabled: false
                        };
                    })];
                }, []);
            }
            else {
                this.items = [];
            }
        },
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
        },
        disableFeature (item) {
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
                                v-if="mapping.length > 0"
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
                                <template v-slot:item.disabled="{ item }">
                                    <v-switch
                                        v-model="item.disabled"
                                        dense
                                        @change="disableFeature(item)"
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


