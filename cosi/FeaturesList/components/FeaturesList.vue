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
            typeFilter: [],
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
                    value: "district"
                },
                {
                    text: "Typ",
                    value: "layer",
                    filter: value => {
                        if (this.typeFilter.length < 1) {
                            return true;
                        }

                        return this.typeFilter.map(t => t.id).includes(value);
                    },
                    divider: true
                },
                {
                    text: "Thema",
                    value: "group"
                }
            ],
            propBlacklist: ["geometry", "geom", "the_geom", "coordinates", "flatCoordinates", "x", "y", "lat", "lon", "latlon", "lonlat"]
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
                            layer: layerMap.id,
                            feature: feature
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
        }
    }
};
</script>

<template lang="html">
    <Tool
        ref="tool"
        :title="$t('additional:modules.tools.cosi.districtSelector.title')"
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
                                v-model="typeFilter"
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
                                :placeholder="$t('additional:modules.tools.cosi.featuresList.typeFilter')"
                            >
                                <template slot="singleLabel">
                                    <strong>{{ typeFilter.id }}</strong>
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
                                    <td :colspan="headers.length">
                                        <DetailView :items="getFeatureProperties(item)" />
                                    </td>
                                </template>
                                <template v-slot:item.style="{ item }">
                                    <FeatureIcon :item="item" />
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
    }
</style>

<style src="vue-select/dist/vue-select.css">
</style>


