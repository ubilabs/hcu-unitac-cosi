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


/**
 * @description returns the selector for the latest entry in properties
 * @param {*} feature the feature to test, works also if a properties-object is provided
 * @param {string} [currentLatestField] the current latest field (optional)
 * @returns {string} the selector
 */
function getLatestField (feature, currentLatestField) {
    const prefix = "jahr_",
        properties = feature.getProperties ? feature.getProperties() : feature;
    let latestYear = currentLatestField ? parseFloat(currentLatestField.replace(prefix, "")) : 0,
        selector = currentLatestField;

    // find latest year
    for (const prop in properties) {
        if (prop.includes(prefix)) {
            if (parseFloat(prop.replace(prefix, "")) > latestYear) {
                latestYear = parseFloat(prop.replace(prefix, ""));
                selector = prop;
            }
        }
        // Break if the found date is from last year
        // return true as 2nd value if the latest possible year is reached for collection to break the loop
        if (latestYear === new Date().getFullYear() - 1) {
            return currentLatestField ? [selector, true] : selector;
        }
    }

    return selector;
}

/**
 */
function getLatestFieldFromCollection (features) {
    let latestField;

    for (const feature of features) {
        latestField = getLatestField(feature, latestField);
        if (latestField instanceof Array) {
            latestField = latestField[0];
        }
    }
    return latestField;
}

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
            urls: {
                "statgebiet": "https://geodienste.hamburg.de/HH_WFS_Regionalstatistische_Daten_Statistische_Gebiete",
                "stadtteil": "https://geodienste.hamburg.de/HH_WFS_Regionalstatistische_Daten_Stadtteile",
                "bezirk": "https://geodienste.hamburg.de/HH_WFS_Regionalstatistische_Daten_Bezirke"
            },
            layerFilterModels: [],
            selectorField: "verwaltungseinheit", // TODO
            resultNames: null,
            refDistrict: null
        };
    },
    computed: {
        ...mapGetters("Tools/QueryDistricts", Object.keys(getters)),
        ...mapGetters("Tools/DistrictSelector", [
            "keyOfAttrName",
            "selectedFeatures",
            "layer",
            "keyOfAttrNameStats"
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
            this.computeResults();
        },

        active (value) {
            if (value) {
                this.initializeDistrictNames();

                const layers = this.getLayerList()
                    .filter(layer=> layer.url === this.urls[this.keyOfAttrNameStats]);

                this.allLayerOptions = [];
                for (const m of this.mapping) {
                    const layer = layers.find(l=>l.featureType && l.featureType.includes(m.category));

                    if (layer) {
                        this.allLayerOptions.push({name: m.value, id: layer.id, group: m.group});
                    }
                }
                this.setLayerOptions();
            }
        }
    },
    /**
   * @returns {void}
   */
    created () {
        this.$on("close", this.close);
    },
    /**
   * Put initialize here if mounting occurs after config parsing
   * @returns {void}
   */
    async mounted () {
        this.applyTranslationKey(this.name);

    },
    methods: {
        ...mapMutations("Tools/QueryDistricts", Object.keys(mutations)),
        ...mapMutations("Tools/DistrictSelector", ["setSelectedDistrictsCollection"]),
        // TODO:REMOVE
        ...mapActions("Alerting", ["addSingleAlert", "cleanup"]),
        ...mapActions("Map", ["zoomTo"]),
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


        createLayerFilterModel: async function (layer) {
            const selector = this.keyOfAttrNameStats,
                features = await this.getAllFeaturesByAttribute({
                    id: layer.id
                }),
                field = getLatestFieldFromCollection(features),
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
            return {layerId: layer.id, name: layer.name, field, value, max, min, high: 0, low: 0};
        },

        async recreateLayerFilterModels () {
            const newModels = [];

            for (const m of this.layerFilterModels) {
                const newModel = await this.createLayerFilterModel({id: m.layerId, name: m.name});

                newModel.high = m.high;
                newModel.low = m.low;
                newModels.push(newModel);
            }
            this.layerFilterModels = newModels;
        },

        async computeResults () {
            if(this.layerFilterModels.length)
            {
            const result = await this.setComparableFeatures(this.layerFilterModels);

            this.resultNames = result?.resultNames;
            }
            else
            {
            this.resultNames = null;
            }
        },

        /**
     * sets viewport to a district clicked on
     * @param {string} districtName name of district
     * @fires Core#RadioRequestMapCreateLayerIfNotExists
     * @fires InfoScreen#RadioRequestInfoScreenGetIsInfoScreen
     * @fires InfoScreen#RadioRequestInfoScreenTriggerRemote
     * @returns {void}
     */
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

        /**
     * sets selectedDistricts to comparable districts
     * @fires Tools.SelectDistrict#RadioTriggerSelectDistrictGetScope
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @fires Tools.SelectDistrict#RadioTriggerSelectDistrictGetDistrictLayer
     * @fires Tools.SelectDistrict#RadioRequestSetSelectedDistrictsToFeatures
     * @returns {void}
     */
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
                cont = document.createElement("div"); // nested container needed for mount

            root.appendChild(cont);


            Radio.trigger("Dashboard", "destroyWidgetById", "compareDistricts");
            Radio.trigger("Dashboard", "append", $(root), "#dashboard-containers", {
                id: "compareDistricts",
                name: "Vergleichbare Gebiete ermitteln",
                glyphicon: "glyphicon glyphicon-random",
                scalable: true
            });

            if (this.dashboard) {
                this.dashboard.$destroy();
            }

            this.dashboard = new Ctor({
                propsData: {layerFilterModels: this.layerFilterModels, districtNames: this.resultNames}
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

        /**
     * shows help window
     * @returns {void}
     */
        showHelp: function () {
            this.cleanup();
            this.addSingleAlert({
                category: "Info",
                content: Info,
                displayClass: "info"
            });
        },

        /**
     * Closes this tool window
     * @returns {void}
     */
        close () {
            this.setActive(false);
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
                            :clearable="false"
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
                            Hinzufügen
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
                            <p><strong>Referenzgebiet: </strong></p>
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
                            <p><strong>Vergleichbare Gebiete: </strong></p>
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
                            Ergebnis als Gebietauswahl setzen
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
                            Im Dashboard anzeigen
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
</style>
