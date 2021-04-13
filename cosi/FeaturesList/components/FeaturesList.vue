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

export default {
    name: "FeaturesList",
    components: {
        Tool,
        Multiselect
    },
    data () {
        return {
            search: "",
            typeFilter: [],
            columns: [
                // {
                //     title: "",
                //     name: "menu"
                // },
                {
                    text: "Einrichtung",
                    value: "name"
                },
                {
                    text: "Gebiet",
                    value: "district"
                },
                {
                    text: "Thema",
                    value: "group"
                },
                {
                    text: "Typ",
                    value: "layer",
                    filter: value => {
                        if (this.typeFilter.length < 1) {
                            return true;
                        }

                        return this.typeFilter.map(t => t.id).includes(value);
                    }
                }
                // {
                //     title: "Daten",
                //     name: "data"
                // }
            ],
            rows: []
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
                this.rows = this.activeVectorLayerList.reduce((list, vectorLayer) => {
                    const features = extractClusters(vectorLayer.getSource()?.getFeatures() || []),
                        layerMap = this.layerMapById(vectorLayer.get("id"));

                    console.log(features);
                    return [...list, ...features.map(feature => {
                        return {
                            name: feature.get(layerMap.keyOfAttrName),
                            district: getContainingDistrictForFeature(this.districtFeatures, feature),
                            group: layerMap.group,
                            layer: layerMap.id,
                            data: feature
                        };
                    })];
                }, []);
            }
            else {
                this.rows = [];
            }
        },
        onPaginationData (paginationData) {
            this.$refs.pagination.setPaginationData(paginationData);
        },
        onChangePage (page) {
            this.$refs.vuetable.changePage(page);
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
                        <!-- <v-text-field
                            v-model="search"
                            append-icon="mdi-magnify"
                            label="Tabelle Durchsuchen"
                            outlined
                            clearable
                            dense
                        ></v-text-field> -->
                    </div>
                </form>
                <form>
                    <div class="form-group features-list-table">
                        <v-data-table
                            :headers="columns"
                            :items="rows"
                            :search="search"
                            multi-sort
                            show-select
                            :items-per-page="20"
                        ></v-data-table>
                    </div>
                </form>
            </div>
        </template>
    </Tool>
</template>

<style lang="less">
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


