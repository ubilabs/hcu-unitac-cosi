<script>
/* eslint-disable new-cap */
import Tool from "../../../../src/modules/tools/Tool.vue";
import getComponent from "../../../../src/utils/getComponent";
import {mapState, mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersFeaturesList";
import mutations from "../store/mutationsFeaturesList";
import getVectorlayerMapping from "../utils/getVectorlayerMapping";
import Multiselect from "vue-multiselect";
import Vue from "vue";
import VGrid, {VGridVueTemplate, VGridVueEditor} from "@revolist/vue-datagrid";
import MenuCell from "./MenuCell.vue";
// import "vue-good-table/dist/vue-good-table.css";
// import {VueGoodTable} from "vue-good-table";
import {getContainingDistrictForFeature} from "../../utils/geomUtils";
import extractClusters from "../../utils/extractClusterFeatures";

export default {
    name: "FeaturesList",
    components: {
        Tool,
        Multiselect,
        VGrid
    },
    data () {
        return {
            listFilter: [],
            columns: [
                {
                    prop: "menu",
                    autoSizeColumn: true,
                    // cellTemplate: VGridVueTemplate(MenuCell)
                    cellTemplate: VGridVueTemplate(MenuCell)
                },
                {
                    name: "Einrichtung",
                    prop: "name"
                },
                {
                    name: "Gebiet",
                    prop: "district"
                },
                {
                    name: "Thema",
                    prop: "group"
                },
                {
                    name: "Typ",
                    prop: "layer"
                }
                // {
                //     label: "Daten",
                //     field: "data"
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
        },
        clientHeight () {
            return this.$refs.tool?.$el?.clientHeight;
        }
    },

    watch: {
        clientHeight () {
            console.log(this.clientHeight);
        },
        /**
         * Unselect the Menu item if the tool is deactivated
         * @param {boolean} state - Defines if the tool is active.
         * @returns {void}
         */
        active (state) {
            if (state) {
                console.log(this.clientHeight);
                console.log(this.$refs.tool);
                console.log(this.$refs.tool.$el);
                this.$nextTick(() => {
                    this.updateFeaturesList();
                    console.log(this.clientHeight);
                    console.log(this.$refs.tool.$el);
                });
            }
            else {
                const model = getComponent(this.id);

                if (model) {
                    model.set("isActive", false);
                }
            }
        },

        rows () {
            console.log(this.rows);
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

        console.log(this.mapping);
    },
    methods: {
        ...mapMutations("Tools/FeaturesList", Object.keys(mutations)),
        updateFeaturesList () {
            // console.log(this.activeLayerMapping);
            // console.log(this.flatActiveVectorLayerIdList);
            // console.log(this.activeVectorLayerList);
            if (this.activeLayerMapping.length > 0) {
                this.rows = this.activeVectorLayerList.reduce((list, vectorLayer) => {
                    const features = extractClusters(vectorLayer.getSource()?.getFeatures() || []),
                        layerMap = this.layerMapById(vectorLayer.get("id"));

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
            <form id="features-list">
                <div class="form-group">
                    <Multiselect
                        v-if="mapping.length > 0"
                        v-model="listFilter"
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
                        :placeholder="$t('additional:modules.tools.cosi.featuresList.listFilter')"
                    >
                        <template slot="singleLabel">
                            <strong>{{ listFilter.id }}</strong>
                        </template>
                    </Multiselect>
                </div>
                <div class="form-group features-list-table">
                    <VGrid
                        key="features-table"
                        ref="features-table"
                        theme="compact"
                        :source="rows"
                        :columns="columns"
                        :autoSizeColumn="{
                            mode: 'autoSizeOnTextOverlap'
                        }"
                        :row-headers="{size: 40}"
                        :row-size="40"
                        resize
                        :style="{height: clientHeight + 'px'}"
                    />
                    <!-- <VueGoodTable
                        :columns="columns"
                        :rows="rows"
                    >
                    </VueGoodTable> -->
                </div>
            </form>
        </template>
    </Tool>
</template>

<style lang="less">
    form#features-list {
        height: 100%;
        .features-list-table {
            height: 400px;
            revo-grid {
                height: 100%;
            }
        }
    }
</style>

<style src="vue-select/dist/vue-select.css">
</style>


