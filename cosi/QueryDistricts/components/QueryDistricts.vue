<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import Tool from "../../../../src/modules/tools/Tool.vue";
import getters from "../store/gettersQueryDistricts";
import mutations from "../store/mutationsQueryDistricts";
import VueSelect from "vue-select";
import {getLayerList as _getLayerList} from "masterportalAPI/src/rawLayerList";


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
            showInDashboard: false,
            showSetSelectedDistrict: false,
            urls: {
                "statgebiet": "https://geodienste.hamburg.de/HH_WFS_Regionalstatistische_Daten_Statistische_Gebiete",
                "stadtteil": "https://geodienste.hamburg.de/HH_WFS_Regionalstatistische_Daten_Stadtteile",
                "bezirk": "https://geodienste.hamburg.de/HH_WFS_Regionalstatistische_Daten_Bezirke"
            },
            layerFilterModels: []
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
    watch: {},
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
        ...mapActions("Alerting", ["addSingleAlert", "cleanup"]),
        ...mapMutations("Tools/QueryDistricts", Object.keys(mutations)),

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
                districtName = this.getSelectedDistrict,
                filter = {field: [0, 0]};

            let value = 0;

            if (districtName !== "Leeren") {
                const refFeature = features.filter(feature => feature.getProperties()[selector] === districtName)[0];

                value = parseInt(refFeature.getProperties()[field], 10);
            }
            // TODO: why array?
            return {field, filter: JSON.stringify(filter), districtInfo: [{key: field, value, max, min}]};
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
                    <div id="compare-results">
                    </div>
                </div>
                <br />
                <div>
                    <button
                        v-if="showSetSelectedDistrict"
                        id="set-selected-district"
                        class="btn btn-lgv-grey measure-delete"
                    >
                        Ergebnis als Gebietauswahl setzen
                    </button>
                </div>
                <br />
                <div>
                    <button
                        v-if="showInDashboard"
                        id="show-in-dashboard"
                        class="btn btn-lgv-grey measure-delete"
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
