<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import Tool from "../../../../src/modules/tools/Tool.vue";
import getters from "../store/gettersQueryDistricts";
import mutations from "../store/mutationsQueryDistricts";
import VueSelect from "vue-select";
import {getLayerList as _getLayerList} from "masterportalAPI/src/rawLayerList";
import compareFeatures from "./compareFeatures.js";
import Collection from "ol/Collection";


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
        VueSelect
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
            "featureList"
        ])
    },
    watch: {
        async layerFilterModels (newModels) {
            const result = await this.setComparableFeatures(newModels);

            if (result) {
                this.resultNames = result.resultNames;
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
        this.initializeDistrictNames();
        this.allLayerOptions = this.getLayerList()
            .filter(layer=> layer.url === this.urls[this.keyOfAttrNameStats])
            .map(layer => ({name: layer.name, id: layer.id}));
        this.layerOptions = [...this.allLayerOptions];

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

            if (this.selectedFeatures) {
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
        },

        getLayerList: function () {
            return _getLayerList();
        },
        getSelectedDistrict: function () {
            return Radio.request("DistrictSelector", "getSelectedDistrict"); // TODO
        },

        addLayerFilter: async function () {
            const selectedLayerId = this.selectedLayer.id;

            this.selectedLayer = null;
            this.layerOptions = this.layerOptions.filter(layer => layer.id !== selectedLayerId);

            this.layerFilterModels.push(await this.createLayerFilterModel(selectedLayerId));
        },


        createLayerFilterModel: async function (layerId) {
            const selector = this.keyOfAttrNameStats,
                features = await this.getAllFeaturesByAttribute({
                    id: layerId
                }),
                field = getLatestFieldFromCollection(features),
                values = features.map(feature => parseFloat(feature.getProperties()[field])).filter(value => !Number.isNaN(value)),
                max = parseInt(Math.max(...values), 10),
                min = parseInt(Math.min(...values), 10),
                districtName = this.getSelectedDistrict(),
                filter = {[field]: [0, 0]};

            let value = 0;

            if (districtName !== "Leeren") {
                const refFeature = features.filter(feature => feature.getProperties()[selector] === districtName)[0];

                value = parseInt(refFeature.getProperties()[field], 10);
            }
            // TODO: why array?
            return {layerId, field, filter: filter, districtInfo: [{key: field, value, max, min}]};
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

        // TODO
        showInDashboard: function () {
            const results = $(this.$refs.result);

            // Radio.trigger("Dashboard", "append", el, "#dashboard-containers", {
            //     id: "reachability",
            //     name: "Erreichbarkeit ab einem Referenzpunkt",
            //     glyphicon: "glyphicon-road",
            //     scalable: true
            // });
            // el.find("#dashboard-container").empty();

            // const resultsClone = this.$el.find("#results").clone();

            Radio.trigger("Dashboard", "destroyWidgetById", "compareDistricts");
            Radio.trigger("Dashboard", "append", results, "#dashboard-containers", {
                id: "compareDistricts",
                name: "Vergleichbare Gebiete ermitteln",
                glyphicon: "glyphicon glyphicon-random",
                scalable: true
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
            <div
                v-if="active"
                id="queryDistricts"
                class="compare-districts"
            >
                <div>
                    <table>
                        <tr>
                            <th>Statistische Datenfilter</th>
                            <th>Referenzgebiet</th>
                            <th></th>
                        </tr>
                        <tr>
                            <td>
                                <VueSelect
                                    id="layerfilter-selector-container"
                                    v-model="selectedLayer"
                                    class="style-chooser"
                                    placeholder="Keine Auswahl"
                                    :options="layerOptions"
                                    :clearable="false"
                                />
                            </td>
                            <td>
                                <VueSelect
                                    v-model="selectedDistrict"
                                    class="style-chooser"
                                    placeholder="Keine Auswahl"
                                    :options="districtNames"
                                    :clearable="false"
                                />
                            </td>
                            <td>
                                <div id="help">
                                    <span class="glyphicon glyphicon-question-sign"></span>
                                </div>
                            </td>
                        </tr>
                    </table>
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
                    <div id="params">
                    </div>
                    <div id="reference-district">
                    </div>
                    <div
                        v-if="resultNames!==null"
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
                        v-if="resultNames!==null"
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
                        v-if="resultNames!==null"
                        id="show-in-dashboard"
                        class="btn btn-lgv-grey measure-delete"
                        @click="showInDashboard()"
                    >
                        Im Dashboard anzeigen
                    </button>
                </div>
            </div>
        </template>
    </Tool>
</template>

<style lang="less">
#accessibilityanalysis {
  width: 400px;
  min-height: 100px;
}
.isochrones {
  margin-top: 10px;
}
.dropdown-info {
  margin-bottom: 5px;
}
.snackbar-text {
  color: black;
}
</style>
