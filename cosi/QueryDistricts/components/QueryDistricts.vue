<script>
/* eslint-disable vue/no-unused-components */
import Vue from "vue";
import {mapGetters, mapMutations, mapActions} from "vuex";
import Tool from "../../../../src/modules/tools/Tool.vue";
import getters from "../store/gettersQueryDistricts";
import mutations from "../store/mutationsQueryDistricts";
import {getLayerList as _getLayerList} from "masterportalAPI/src/rawLayerList";
import compareFeatures from "./compareFeatures.js";
import LayerFilter from "./LayerFilter.vue";
import DashboardResult from "./DashboardResult.vue";
import Collection from "ol/Collection";
import Info from "text-loader!./info.html";
import {Fill, Stroke, Style} from "ol/style.js";


export default {
    name: "QueryDistricts",
    components: {
        Tool,
        LayerFilter
    },
    data () {
        return {
            selectedDistrict: null,
            allLayerOptions: [],
            layerOptions: [],
            selectedLayer: null,
            districtNames: [],
            layerFilterModels: [],
            selectorField: "verwaltungseinheit",
            resultNames: null,
            refDistrict: null,
            dashboard: null
        };
    },
    computed: {
        ...mapGetters("Tools/QueryDistricts", Object.keys(getters)),
        ...mapGetters("Tools/DistrictSelector", [
            "keyOfAttrName",
            "selectedFeatures",
            "layer",
            "keyOfAttrNameStats",
            "selectedDistrictLevel"
        ]),
        ...mapGetters("Tools/DistrictLoader", [
            "mapping",
            "getAllFeaturesByAttribute"
        ])
    },
    watch: {
        async layerFilterModels () {
            this.computeResults();
        },

        async selectedDistrict () {
            await this.recreateLayerFilterModels();
        },

        active (value) {
            if (value) {
                this.initializeDistrictNames();

                const url = this.selectedDistrictLevel.stats.baseUrl,
                    layers = this.getLayerList()
                        .filter(layer=> layer.url === url);

                this.allLayerOptions = [];
                for (const m of this.mapping) {
                    const layer = layers.find(l=>l.featureType && l.featureType.includes(m.category));

                    if (layer) {
                        this.allLayerOptions.push({name: m.value, id: layer.id, group: m.group, valueType: m.valueType});
                    }
                }
                this.setLayerOptions();
            }
        }
    },

    created () {
        this.$on("close", this.close);
    },

    async mounted () {
        this.applyTranslationKey(this.name);
        this.mapLayer = await this.createLayer("query-districts");
    },
    methods: {
        ...mapMutations("Tools/QueryDistricts", Object.keys(mutations)),
        ...mapMutations("Tools/DistrictSelector", ["setSelectedDistrictsCollection"]),
        ...mapActions("Alerting", ["addSingleAlert", "cleanup"]),
        ...mapActions("Map", ["zoomTo", "createLayer"]),
        ...compareFeatures,

        initializeDistrictNames: function () {
            const selector = this.keyOfAttrName;

            if (this.selectedFeatures?.length) {
                this.districtNames = this.selectedFeatures.map(
                    (feature) => feature.getProperties()[selector]
                );
            }
            else {
                this.districtNames = this.layer
                    .getSource()
                    .getFeatures()
                    .map((district) => district.getProperties()[selector]);
            }

            this.districtNames = [...new Set(this.districtNames)];
        },

        getLayerList: function () {
            return _getLayerList();
        },

        setLayerOptions () {
            const layerOptions = this.allLayerOptions.filter(
                    layer => this.layerFilterModels.find(model => model.layerId === layer.id) === undefined
                ),
                groups = layerOptions.reduce((acc, el)=> ({...acc, [el.group]: [...acc[el.group] || [], el]}), {});

            let ret = [];

            for (const g in groups) {
                ret.push({header: g});
                ret = ret.concat(groups[g]);
            }
            this.layerOptions = ret;
        },

        addLayerFilter: async function () {
            this.layerOptions = this.layerOptions.filter(layer => layer.id !== this.selectedLayer.id);
            this.layerFilterModels.push(await this.createLayerFilterModel(this.selectedLayer));
            this.selectedLayer = null;
            this.setLayerOptions();
        },

        getFieldValues: function (features, prefix) {
            const ret = [];

            for (const feature of features) {
                for (const prop in feature.getProperties()) {
                    if (prop.startsWith(prefix)) {
                        ret.push(prop);
                    }
                }
            }

            return [... new Set(ret)];
        },


        createLayerFilterModel: async function (layer) {
            const selector = this.keyOfAttrNameStats,
                features = await this.getAllFeaturesByAttribute({
                    id: layer.id
                }),
                fieldValues = this.getFieldValues(features, "jahr_"),
                field = fieldValues[0],
                values = features.map(feature => parseFloat(feature.getProperties()[field])).filter(value => !Number.isNaN(value)),
                max = parseInt(Math.max(...values), 10),
                min = parseInt(Math.min(...values), 10);

            let value = 0;

            if (this.selectedDistrict) {
                const refFeature = features.filter(feature => feature.getProperties()[selector] === this.selectedDistrict)[0];

                if (refFeature) {
                    value = parseInt(refFeature.getProperties()[field], 10);
                }
            }
            return {layerId: layer.id, name: layer.name, field, value, valueType: layer.valueType, max, min, high: 0, low: 0, fieldValues};
        },

        async recreateLayerFilterModels () {
            const newModels = [];

            for (const m of this.layerFilterModels) {
                const newModel = await this.createLayerFilterModel({id: m.layerId, name: m.name});

                newModel.high = m.high;
                newModel.low = m.low;
                newModel.field = m.field;
                newModels.push(newModel);
            }
            this.layerFilterModels = newModels;
        },

        async computeResults () {
            if (this.layerFilterModels.length) {
                const result = await this.setComparableFeatures(this.layerFilterModels);

                this.resultNames = result.resultNames;
                this.showDistrictFeatures(result.features);
            }
            else {
                this.resultNames = null;
                this.showSelectedDistrict();
            }
        },

        zoomToDistrict: function (districtName) {
            const selectedDistrictLayer = this.layer,
                attributeSelector = this.keyOfAttrName,
                districtFeatures = selectedDistrictLayer.getSource().getFeatures();


            for (const feature of districtFeatures) {
                if (feature.getProperties()[attributeSelector] === districtName) {
                    const extent = feature.getGeometry().getExtent();

                    this.zoomTo(extent, {padding: [20, 20, 20, 20]});
                    return;
                }
            }
        },

        changeDistrictSelection: function () {
            const selector = this.keyOfAttrNameStats,
                features = this.layer.getSource().getFeatures(),
                selectedFeatures = features.filter(feature => this.resultNames.includes(feature.getProperties()[selector])),
                featureCollection = new Collection(selectedFeatures);

            featureCollection.set("fromExternal", true);

            if (this.refDistrict) {
                selectedFeatures.push(this.refDistrict);
            }

            this.setSelectedDistrictsCollection(featureCollection);
        },

        showInDashboard: function () {
            const Ctor = Vue.extend(DashboardResult),
                root = document.createElement("div"),
                cont = document.createElement("div"), // nested container needed for mount
                i18n = this.$t("additional:modules.tools.cosi.queryDistricts", {"returnObjects": true});

            root.appendChild(cont);


            Radio.trigger("Dashboard", "destroyWidgetById", "compareDistricts");
            Radio.trigger("Dashboard", "append", $(root), "#dashboard-containers", {
                id: "compareDistricts",
                name: "Vergleichbare Gebiete ermitteln",
                glyphicon: "glyphicon glyphicon-random",
                scalable: true
            });

            if (this.dashboard !== null) {
                this.dashboard.$destroy();
                this.dashboard = null;
            }

            this.dashboard = new Ctor({
                propsData: {layerFilterModels: this.layerFilterModels, districtNames: this.resultNames, i18n}
            }).$mount(cont);
        },

        updateFilter (value) {
            const filters = [...this.layerFilterModels];

            for (let i = 0; i < filters.length; i++) {
                if (filters[i].layerId === value.layerId) {
                    filters[i] = {...filters[i], ...value};
                    break;
                }
            }
            this.layerFilterModels = filters;
        },
        closeFilter (value) {
            this.layerFilterModels = this.layerFilterModels.filter(elem => elem.layerId !== value.layerId);
            this.setLayerOptions();
        },

        showHelp: function () {
            this.cleanup();
            this.addSingleAlert({
                category: "Info",
                content: Info,
                displayClass: "info"
            });
        },

        close () {
            this.setActive(false);
        },

        createDistrictStyle () {
            return new Style({
                fill: new Fill({
                    color: [8, 119, 95, 0.3]
                }),
                stroke: new Stroke({
                    color: [8, 119, 95, 0.3],
                    width: 3
                })
            });
        },

        showSelectedDistrict: function () {
            this.mapLayer.getSource().clear();

            if (this.selectedDistrict) {

                this.refDistrict = this.layer.getSource().getFeatures()
                    .find(feature => feature.getProperties()[this.keyOfAttrName] === this.selectedDistrict);

                const featureClone = this.refDistrict.clone();

                featureClone.setStyle(this.createDistrictStyle());

                this.mapLayer.getSource().addFeature(featureClone);
            }
        },
        showDistrictFeatures (districtFeatures) {
            this.mapLayer.getSource().clear();

            const cloneCollection = districtFeatures.map((feature) => {
                const featureClone = feature.clone();

                featureClone.setStyle(this.createDistrictStyle());
                return featureClone;
            });

            if (this.refDistrict) {
                const refDistrictClone = this.refDistrict.clone();

                refDistrictClone.setStyle(this.createDistrictStyle());
                cloneCollection.push(refDistrictClone);
            }
            this.mapLayer.getSource().addFeatures(cloneCollection);
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t('additional:modules.tools.cosi.queryDistricts.title')"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
            <v-app>
                <div
                    v-if="active"
                    id="queryDistricts"
                    class="compare-districts"
                >
                    <div class="selectors">
                        <v-select
                            id="layerfilter-selector-container"
                            v-model="selectedLayer"
                            :label="$t('additional:modules.tools.cosi.queryDistricts.layerDropdownLabel')"
                            item-text="name"
                            item-value="id"
                            :items="layerOptions"
                            :clearable="false"
                            outlined
                            dense
                            return-object
                            class="qd-select"
                        />
                        <v-select
                            id="district-selector-container"
                            v-model="selectedDistrict"
                            :label="$t('additional:modules.tools.cosi.queryDistricts.districtDropdownLabel')"
                            :items="districtNames"
                            :clearable="true"
                            outlined
                            dense
                            class="qd-select"
                        />
                        <div
                            id="help"
                            @click="showHelp()"
                        >
                            <span class="glyphicon glyphicon-question-sign"></span>
                        </div>
                    </div>
                    <br />
                    <div>
                        <button
                            id="add-filter"
                            type="button"
                            class="btn btn-lgv-grey measure-delete"
                            :disabled="selectedLayer===null"
                            @click="addLayerFilter()"
                        >
                            <span class="glyphicon glyphicon-plus"></span>
                            {{ $t('additional:modules.tools.cosi.queryDistricts.add') }}
                        </button>
                    </div>
                    <br />
                    <div id="layerfilter-container"></div>
                    <div id="results">
                        <template
                            v-for="filter in layerFilterModels"
                        >
                            <LayerFilter
                                :key="filter.layerId"
                                v-bind="filter"
                                class="layer-filter"
                                @update="updateFilter"
                                @close="closeFilter"
                            />
                        </template>
                        <div id="params">
                        </div>
                        <div
                            v-if="selectedDistrict"
                            id="reference-district"
                        >
                            <strong>
                                {{ $t('additional:modules.tools.cosi.queryDistricts.referenceDistrict') }}:
                            </strong>
                            <span
                                id="reference-district-button"
                                class="name-tag district-name"
                                @click="zoomToDistrict(selectedDistrict)"
                            >{{ selectedDistrict }}</span>
                        </div>
                        <div
                            v-if="resultNames"
                            id="compare-results"
                        >
                            <p>
                                <strong>
                                    {{ $t('additional:modules.tools.cosi.queryDistricts.comparableResults') }}:
                                </strong>
                            </p>
                            <span
                                v-for="name in resultNames"
                                :id="'result-'+name"
                                :key="name"
                                class="name-tag district-name"
                                @click="zoomToDistrict(name)"
                            >{{ name }}</span>
                        </div>
                    </div>
                    <br />
                    <div>
                        <button
                            v-if="resultNames && resultNames.length"
                            id="set-selected-district"
                            class="btn btn-lgv-grey measure-delete"
                            @click="changeDistrictSelection()"
                        >
                            {{ $t('additional:modules.tools.cosi.queryDistricts.resultAsSelection') }}
                        </button>
                    </div>
                    <br />
                    <div>
                        <button
                            v-if="resultNames && resultNames.length"
                            id="show-in-dashboard"
                            class="btn btn-lgv-grey measure-delete"
                            @click="showInDashboard()"
                        >
                            {{ $t('additional:modules.tools.cosi.queryDistricts.showInDashboardLable') }}
                        </button>
                    </div>
                </div>
            </v-app>
        </template>
    </Tool>
</template>

<style lang="less">
.selectors {
    display: flex;
    flex-direction: column;
}

.qd-select .v-select__selection {
  white-space: nowrap;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 496px;
}

.qd-select .v-select__selections {
  max-width: 496px;
  max-height: 30px;
}

#help {
    align-self: flex-end;
}
.layer-filter {
    margin-bottom: 10px;
}

#compare-results {
    max-width: 500px;
 word-wrap: break-word
}

.compare-districts {
    #layerfilter-selector-container {
        .bootstrap-select {
            width: 12vw !important;
        }

        .dropdown-menu.open {
            width: 400px;
            height: 200px;
        }
    }

    #district-selector-container {
        .bootstrap-select {
            width: 12vw !important;
        }

        .dropdown-menu.open {
            height: 200px;
        }
    }
}


#add-filter {
    width: 100%;
}


#help {
    padding-top: 5px;
    background-color: white;
    height: 30px;
    border: 1px solid #ccc;
    cursor: pointer;
    text-align: center;
    min-width: 30px;
}

#help:hover {
    background-color: #d3d3d3;
}

#compare-results {
    line-height: 1.6;
}

.name-tag {
    border-radius: 5px;
    background-color: #E3E3E3;
    color: black;
    padding: 2px 4px;
    margin: 2px;
    display: inline-block;
}

.name-tag.district-name {
    cursor: pointer;
}

.compare-districts {
    min-height: 300px;
}

#show-in-dashboard,
#set-selected-district {
    width: 100%;
}

.table {

    th,
    td {
        border-bottom: 1px solid #ddd;
    }

    tr:hover {
        background-color: #f5f5f5;
    }
}
#reference-district {
    color: #646262;
    margin-bottom: 10px;
}
</style>
