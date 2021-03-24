<script>
import Tool from "../../../src/modules/tools/Tool.vue";
import {mapGetters, mapMutations, mapActions} from "vuex";
import getters from "../store/gettersPopulationRequest";
import mutations from "../store/mutationsPopulationRequest";
import state from "../store/statePopulationRequest";
import actions from "../store/actionsPopulationRequest";
import Dropdown from "../../../src/share-components/dropdowns/DropdownSimple.vue";
import ToggleCheckbox from "../../../src/share-components/ToggleCheckbox.vue";
import thousandsSeparator from "../../../src/utils/thousandsSeparator";
import WPS from "../../../src/api/wps";
import LoaderOverlay from "../../../src/utils/loaderOverlay";

export default {
    name: "PopulationRequest",
    components: {
        Tool,
        Dropdown,
        ToggleCheckbox
    },
    data () {
        return {
            metaDataLink: undefined,
            selectedOption: "square",
            options: {
                "square": this.$t("common:snippets.graphicalSelect.selectBySquare"),
                "circle": this.$t("common:snippets.graphicalSelect.selectByCircle"),
                "polygon": this.$t("common:snippets.graphicalSelect.selectByPolygon")
            },
            mrhId: "46969C7D-FAA8-420A-81A0-8352ECCFF526",
            fhhId: "B3FD9BD5-F614-433F-A762-E14003C300BF",
            rasterLayerId: "13023",
            alkisAdressLayerId: "9726",
            source_fhh: "no",
            source_mrh: "no",
            inhabitants_fhh: "-1",
            inhabitants_fhh_num: -1,
            inhabitants_mrh: "-1",
            inhabitants_mrh_num: -1,
            searcharea: 0
        };
    },
    computed: {
        ...mapGetters("Tools/PopulationRequest", Object.keys(getters)),
        ...mapGetters(["isTableStyle", "isDefaultStyle"]),
        ...mapGetters("Map", ["scale"]),

        /**
         * returns if the Raster Layer is Visible in the map
         * @returns {Boolean} -
         */
        isRasterVisibleInMap: function () {
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.rasterLayerId}),
                isVisibleInMap = model !== undefined ? model.get("isVisibleInMap") : false;

            return isVisibleInMap;
        },

        /**
         * returns if the Alkis Adress Layer is Visible in the map
         * @returns {Boolean} -
         */
        isAlkisAdressesVisibleInMap: function () {
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.alkisAdressLayerId}),
                isVisibleInMap = model !== undefined ? model.get("isVisibleInMap") : false;

            return isVisibleInMap;
        }
    },
    created () {
        this.$on("close", this.close);

        /*
        Backbone.Events.listenTo(Radio.channel("GraphicalSelect"), {
            "onDrawEnd": function (geoJson) {
                if (this.isActive) {
                    this.makeRequest(geoJson);
                }
            }
        });
        */

        const service = Radio.request("RestReader", "getServiceById", this.populationReqServiceId);

        if (service !== undefined) {
            this.metaDataLink = service.get("url");
        }

    },
    methods: {
        ...mapMutations("Tools/PopulationRequest", Object.keys(mutations)),
        ...mapActions("Tools/PopulationRequest", Object.keys(actions)),
        ...mapActions("Alerting", ["addSingleAlert"]),

        /**
         * Fake Request for Testing - square in HH Neustadt: Result 2548, 155.661 m²
         * @returns {void}
         */
        fakeReqHHNeustadt: function () {
            const fakeJsonHHNeustadtSq = {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            564770.4077996021,
                            5933854.868462995
                        ],
                        [
                            565310.1575081373,
                            5933854.868462995
                        ],
                        [
                            565310.1575081373,
                            5934143.264140594
                        ],
                        [
                            564770.4077996021,
                            5934143.264140594
                        ],
                        [
                            564770.4077996021,
                            5933854.868462995
                        ]
                    ]
                ]
            };

            this.makeRequest(fakeJsonHHNeustadtSq);
        },
        /**
         * Fake Request for Testing - square in HH und MRH: 48.817, 63.290 und 69 km²
         * @returns {void}
         */
        fakeReqHHUndMRH: function () {
            const fakeJsonHHUndMRHSq = {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            562632.8559168844,
                            5945847.806177786
                        ],
                        [
                            572290.1423686164,
                            5945847.806177786
                        ],
                        [
                            572290.1423686164,
                            5952991.552320163
                        ],
                        [
                            562632.8559168844,
                            5952991.552320163
                        ],
                        [
                            562632.8559168844,
                            5945847.806177786
                        ]
                    ]
                ]
            };

            this.makeRequest(fakeJsonHHUndMRHSq);
        },
        /**
         * Fake Request for Testing - square in MRH: 28.120, 75 km²
         * @returns {void}
         */
        fakeReqMRH: function () {
            const fakeJsonMRHSq = {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            587172.946831902,
                            5958812.382510248
                        ],
                        [
                            595507.3173313419,
                            5958812.382510248
                        ],
                        [
                            595507.3173313419,
                            5967808.210985834
                        ],
                        [
                            587172.946831902,
                            5967808.210985834
                        ],
                        [
                            587172.946831902,
                            5958812.382510248
                        ]
                    ]
                ]
            };

            this.makeRequest(fakeJsonMRHSq);
        },
        /**
         * Fake Request for Testing - partially outside MRH
         * @returns {void}
         */
        fakeReqPartiallyOutsideMRH: function () {
            const fakeJsonPartiallyOutsideMRH = {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            674543.7833962495,
                            5895666.4320419235
                        ],
                        [
                            694122.9394901718,
                            5895666.4320419235
                        ],
                        [
                            694122.9394901718,
                            5912467.464636033
                        ],
                        [
                            674543.7833962495,
                            5912467.464636033
                        ],
                        [
                            674543.7833962495,
                            5895666.4320419235
                        ]
                    ]
                ]
            };

            this.makeRequest(fakeJsonPartiallyOutsideMRH);
        },
        /**
         * Fake Request for Testing - result 0 in MRH
         * @returns {void}
         */
        fakeReqMRHRes0: function () {
            const fakeJsonMRHRes0 = {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            597811.4600437658,
                            5939733.7778160535
                        ],
                        [
                            598016.5120163711,
                            5939733.7778160535
                        ],
                        [
                            598016.5120163711,
                            5939933.538124849
                        ],
                        [
                            597811.4600437658,
                            5939933.538124849
                        ],
                        [
                            597811.4600437658,
                            5939733.7778160535
                        ]
                    ]
                ]
            };

            this.makeRequest(fakeJsonMRHRes0);
        },
        /**
         * Fake Request for Testing - outside MRH
         * @returns {void}
         */
        fakeReqOutsideMRH: function () {
            const fakeOutsideMRH = {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            694283.2813496877,
                            5892959.981420023
                        ],
                        [
                            712671.8130865473,
                            5892959.981420023
                        ],
                        [
                            712671.8130865473,
                            5902881.851062214
                        ],
                        [
                            694283.2813496877,
                            5902881.851062214
                        ],
                        [
                            694283.2813496877,
                            5892959.981420023
                        ]
                    ]
                ]
            };

            this.makeRequest(fakeOutsideMRH);
        },
        /**
         * Fake Request for Testing - too small in MRH
         * @returns {void}
         */
        fakeReqTooSmallMRH: function () {
            const fakeTooSmallMRH = {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            546278.9689146504,
                            5939402.325029877
                        ],
                        [
                            546347.7605441695,
                            5939402.325029877
                        ],
                        [
                            546347.7605441695,
                            5939438.043760589
                        ],
                        [
                            546278.9689146504,
                            5939438.043760589
                        ],
                        [
                            546278.9689146504,
                            5939402.325029877
                        ]
                    ]
                ]
            };

            this.makeRequest(fakeTooSmallMRH);
        },
        /**
         * Resets internal data and triggers the wps request "einwohner_ermitteln.fmw" for the selected area.
         * @param  {Object} geoJson GeoJSON to get selected area from
         * @fires Addons.PopulationRequest#handleResponse
         * @fires Core#RadioTriggerWPSRequest
         * @returns {void}
         */
        makeRequest: function (geoJson) {
            this.inhabitants_fhh_num = -1;
            this.inhabitants_mrh_num = -1;
            this.source_fhh = "nein";
            this.source_mrh = "nein";
            this.searcharea = 0;
            LoaderOverlay.show();

            WPS.wpsRequest("1001", "einwohner_ermitteln.fmw", {
                "such_flaeche": JSON.stringify(geoJson)
            }, this.handleResponse.bind(this));

            this.reset();
        },
        /**
         * Reset State when tool becomes active/inactive
         * @returns {void}
         */
        reset: function () {
            LoaderOverlay.hide();
        },
        /**
         * Resets the GraphicalSelect
         * @fires Snippets.GraphicalSelect#resetView
         * @returns {void}
         */
        resetView: function () {
            Radio.trigger("GraphicalSelect", "resetView", this.id);
        },
        /**
         * Called when the wps modules returns a request
         * @param  {string} response - the response xml of the wps
         * @param  {number} status - the HTTPStatusCode
         * @returns {void}
         */
        handleResponse: function (response, status) {
            let parsedData = null;

            LoaderOverlay.hide();
            parsedData = response.ExecuteResponse.ProcessOutputs.Output.Data.ComplexData.einwohner;
            if (status === 200) {
                if (parsedData.ErrorOccured === "yes") {
                    this.handleWPSError(parsedData);
                }
                else {
                    this.handleSuccess(parsedData);
                }
            }
            else {
                this.resetView();
            }
        },
        /**
         * Displays Errortext if the WPS returns an Error
         * @param  {string} response received by wps
         * @returns {void}
         */
        handleWPSError: function (response) {
            this.addSingleAlert({
                "content": this.$t("additional:modules.tools.populationRequest.errors.requestException") + JSON.stringify(response.ergebnis)
            });
        },
        /**
         * Used when statuscode is 200 and wps did not return an error
         * @param  {string} response received by wps
         * @returns {void}
         */
        handleSuccess: function (response) {
            let obj = null;

            try {
                obj = JSON.parse(response.ergebnis);
                if (obj.hasOwnProperty("einwohner_fhh")) {
                    this.inhabitants_fhh_num = obj.einwohner_fhh;
                    this.inhabitants_fhh = thousandsSeparator(obj.einwohner_fhh);
                }
                else {
                    this.inhabitants_fhh_num = -1;
                }
                if (obj.hasOwnProperty("einwohner_mrh")) {
                    this.inhabitants_mrh_num = obj.einwohner_mrh;
                    this.inhabitants_mrh = thousandsSeparator(obj.einwohner_mrh);
                }
                else {
                    this.inhabitants_mrh_num = -1;
                }
                if (obj.hasOwnProperty("quelle_fhh")) {
                    this.source_fhh = obj.quelle_fhh;
                }
                else {
                    this.source_fhh = "no";
                }
                if (obj.hasOwnProperty("quelle_mrh")) {
                    this.source_mrh = obj.quelle_mrh;
                }
                else {
                    this.source_mrh = "no";
                }
                if (obj.hasOwnProperty("suchflaeche")) {
                    this.searcharea = this.chooseUnitAndThousandsSeparator(obj.suchflaeche);
                }
                else {
                    this.searcharea = 0;
                }
            }
            catch (e) {
                this.addSingleAlert({
                    content: this.$t("additional:modules.tools.populationRequest.errors.requestException") + JSON.stringify(response)
                });
                this.resetView();
                (console.error || console.warn).call(console, e.stack || e);
            }
        },
        /**
         * Chooses unit based on value, calls thousandsSeparator and converts to unit and appends unit
         * @param  {number} value - to inspect
         * @param  {number} maxDecimals - decimals are cut after maxlength chars
         * @returns {string} unit
         */
        chooseUnitAndThousandsSeparator: function (value, maxDecimals) {
            let newValue = null,
                ret = null;

            if (value < 250000) {
                ret = thousandsSeparator(value.toFixed(maxDecimals)) + " m²";
            }
            else if (value < 10000000) {
                newValue = value / 10000.0;
                ret = thousandsSeparator(newValue.toFixed(maxDecimals)) + " ha";
            }
            else {
                newValue = value / 1000000.0;
                ret = thousandsSeparator(newValue.toFixed(maxDecimals)) + " km²";
            }
            return ret;
        },
        /**
         * if the model does not exist, add Model from Parser to ModelList via Radio.trigger
         * @param {string} layerId id of the layer to be toggled
         * @fires Core#RadioRequestModelListGetModelByAttributes
         * @returns {void}
         */
        addModelsByAttributesToModelList: function (layerId) {
            const layerModel = Radio.request("ModelList", "getModelsByAttributes", {id: layerId});

            if (layerModel === undefined || layerModel.length === 0) {
                Radio.trigger("ModelList", "addModelsByAttributes", {id: layerId});
            }
        },
        /**
         * checks whether the model has been loaded.
         * If it is not loaded, a corresponding error message is displayed
         * @param {string} layerId id of the layer to be toggled
         * @fires Core#RadioRequestModelListGetModelByAttributes
         * @returns {void}
         */
        checkIsModelLoaded: function (layerId) {
            const layerModel = Radio.request("ModelList", "getModelsByAttributes", {id: layerId});

            if (layerModel === undefined || layerModel.length === 0) {
                this.addSingleAlert({
                    "content": this.$t("additional:modules.tools.populationRequest.errors.layerIdCantBeLoadedPrefix") + layerId + this.$t("additional:modules.tools.populationRequest.errors.layerIdCantBeLoadedSuffix")
                });
            }
        },
        /**
         * sets selected and visibility to ModelList via Radio.trigger
         * @param {string} layerId id of the layer to be toggled
         * @param {boolean} value - true | false
         * @fires Core#RadioTriggerModelListSetModelAttributesById
         * @returns {void}
         */
        setModelAttributesByIdToModelList: function (layerId, value) {
            Radio.trigger("ModelList", "setModelAttributesById", layerId, {
                isSelected: value,
                isVisibleInMap: value
            });
        },
        /**
         * Sets the state at GraphicalSelect - handles (de-)activation of this Tool
         * @param {boolean} value flag is tool is active
         * @fires Snippets.GraphicalSelect#setStatus
         * @returns {void}
         */
        changeGraphicalSelectStatus: function (value) {
            Radio.trigger("GraphicalSelect", "setStatus", this.id, value);
        },
        /**
         * Sets the state at the RasterLayer
         * @param {boolean} value flag if Raster is to be set
         * @returns {void}
         */
        triggerRaster (value) {
            if (value) {
                const scale = this.$store.state.Map.scale;

                // if the Map has too large Scale give notification and undo the activation
                if (scale > 100000) {
                    const rasterCB = this.$refs.rasterCB;

                    if (rasterCB !== undefined) {
                        rasterCB.setActive(false);
                    }

                    this.addSingleAlert({
                        "content": this.$t("additional:modules.tools.populationRequest.errors.reduceScaleForRaster")
                    });
                    return;
                }
            }

            this.setRaster(state, value);

            const layerId = this.rasterLayerId;

            this.addModelsByAttributesToModelList(layerId);
            if (value) {
                this.checkIsModelLoaded(layerId, value);
            }
            this.setModelAttributesByIdToModelList(layerId, value);
        },
        /**
         * Sets the state at the alkisAdresses Layer
         * @param {boolean} value flag if alkisAdresses is to be set
         * @returns {void}
         */
        triggerAlkisAdresses (value) {
            if (value) {
                const scale = this.$store.state.Map.scale;

                // if the Map has too large Scale give notification and undo the activation
                if (scale > 10000) {
                    const alkisAdressesCB = this.$refs.alkisAdressesCB;

                    if (alkisAdressesCB !== undefined) {
                        alkisAdressesCB.setActive(false);
                    }

                    this.addSingleAlert({
                        "content": this.$t("additional:modules.tools.populationRequest.errors.reduceScaleForAlkisAdresses")
                    });
                    return;
                }
            }

            this.setAlkisAdresses(state, value);

            const layerId = this.alkisAdressLayerId;

            this.addModelsByAttributesToModelList(layerId);
            if (value) {
                this.checkIsModelLoaded(layerId, value);
            }
            this.setModelAttributesByIdToModelList(layerId, value);
        },
        /**
         * Sets FHH values for Testing
         * @param {string} source Value for source_fhh
         * @param {integer} inhabitants_num_value Value for inhabitants_fhh_num
         * @returns {void}
         */
        setFHH (source, inhabitants_num_value) {
            this.source_fhh = source;
            this.inhabitants_fhh_num = inhabitants_num_value;
            this.inhabitants_fhh = thousandsSeparator(inhabitants_num_value);
        },
        /**
         * Sets MRH values for Testing
         * @param {string} source Value for source_mrh
         * @param {integer} inhabitants_num_value Value for inhabitants_mrh_num
         * @returns {void}
         */
        setMRH (source, inhabitants_num_value) {
            this.source_mrh = source;
            this.inhabitants_mrh_num = inhabitants_num_value;
            this.inhabitants_mrh = thousandsSeparator(inhabitants_num_value);
        },
        /**
         * Sets searcharea for Testing
         * @param {string} area Value for searcharea
         * @returns {void}
         */
        setSearchArea (area) {
            this.searcharea = area;
        },
        /**
         * Closes this tool window by setting active to false
         * @returns {void}
         */
        close () {
            this.setActive(false);

            // TODO replace trigger when Menu is migrated
            // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            // else the menu-entry for this tool is always highlighted
            const model = Radio.request("ModelList", "getModelByAttributes", {id: state.id});

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t('additional:modules.tools.populationRequest.title')"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
        class="PopulationRequest"
    >
        <template
            v-if="active"
            v-slot:toolBody
        >
            <div>{{ $t("additional:modules.tools.populationRequest.select.info") }}</div>
            <div class="dropdown">
                <form>
                    <Dropdown
                        v-model="selectedOption"
                        :options="options"
                    />
                    <button
                        class="btn-primary"
                        @click="fakeReqHHNeustadt"
                    >
                        HHNeustadt
                    </button>
                    <button
                        class="btn-primary"
                        @click="fakeReqHHUndMRH"
                    >
                        HHUndMRH
                    </button>
                    <button
                        class="btn-primary"
                        @click="fakeReqMRH"
                    >
                        MRH
                    </button>
                    <button
                        class="btn-primary"
                        @click="fakeReqPartiallyOutsideMRH"
                    >
                        PartOutsMRH
                    </button>
                    <button
                        class="btn-primary"
                        @click="fakeReqMRHRes0"
                    >
                        Res0MRH
                    </button>
                    <button
                        class="btn-primary"
                        @click="fakeReqOutsideMRH"
                    >
                        OutsideMRH
                    </button>
                    <button
                        class="btn-primary"
                        @click="fakeReqTooSmallMRH"
                    >
                        TooSmallMRH
                    </button>
                </form>
            </div>
            <div
                v-if="inhabitants_fhh_num > -1 || inhabitants_mrh_num > -1"
                class="result"
            >
                <div class="heading additional-text">
                    {{ $t("additional:modules.tools.populationRequest.result.confidentialityHint") }}:
                </div>
                <table class="table">
                    <tr
                        v-if="source_fhh !== 'no'"
                    >
                        <td>{{ $t("additional:modules.tools.populationRequest.result.populationFHH") }}:</td>
                        <td
                            class="inhabitants_fhh"
                        >
                            {{ inhabitants_fhh }}
                        </td>
                    </tr>
                    <tr
                        v-if="source_mrh !== 'no'"
                    >
                        <td>{{ $t("additional:modules.tools.populationRequest.result.populationMRH") }}:</td>
                        <td
                            class="inhabitants_mrh"
                        >
                            {{ inhabitants_mrh }}
                        </td>
                    </tr>
                    <tr
                        v-if="searcharea"
                    >
                        <td>{{ $t("additional:modules.tools.populationRequest.result.areaSize") }}:</td>
                        <td
                            class="searcharea"
                        >
                            {{ searcharea }}
                        </td>
                    </tr>
                </table>
                <div
                    v-if="inhabitants_fhh_num > -1"
                    class="inhabitants_fhh_add_text"
                >
                    <div class="hinweis additional-text">
                        <span>{{ $t("additional:modules.tools.populationRequest.result.hint") }}:</span>&nbsp;{{ $t("additional:modules.tools.populationRequest.result.confidentialityHintSmallValues") }}
                    </div>
                    <div>
                        <a
                            target="_blank"
                            :href="`${metaDataLink}${fhhId}`"
                        >
                            {{ $t("additional:modules.tools.populationRequest.result.dataSourceFHHLinktext") }}
                        </a>
                    </div>
                </div>
                <div
                    v-if="inhabitants_mrh_num > -1"
                    class="inhabitants_mrh_add_text"
                >
                    <div class="hinweis additional-text">
                        <div
                            v-if="source_mrh === 'tlw' && source_fhh === 'no'"
                        >
                            <span>{{ $t("additional:modules.tools.populationRequest.result.hint") }}:</span>&nbsp;{{ $t("additional:modules.tools.populationRequest.result.sourceAreaOutside") }}
                        </div>
                        <span>{{ $t("additional:modules.tools.populationRequest.result.dataSourceMRHKey") }}:</span>&nbsp;{{ $t("additional:modules.tools.populationRequest.result.dataSourceMRHValue") }}
                    </div>
                    <div>
                        <a
                            target="_blank"
                            :href="`${metaDataLink}${mrhId}`"
                        >
                            {{ $t("additional:modules.tools.populationRequest.result.dataSourceMRHLinktext") }}
                        </a>
                    </div>
                </div>
            </div>
            <div
                v-if="isDefaultStyle"
            >
                <hr>
                <div class="checkbox">
                    <div class="checkbox-container">
                        <div class="form-inline">
                            <div class="title-checkbox pull-left">
                                <label>{{ $t("additional:modules.tools.populationRequest.select.showRasterLayer") }}</label>
                                <ToggleCheckbox
                                    ref="rasterCB"
                                    :defaultState="isRasterVisibleInMap"
                                    :title="$t('additional:modules.tools.populationRequest.switchOffFilter')"
                                    :textOn="$t('common:snippets.checkbox.on')"
                                    :textOff="$t('common:snippets.checkbox.off')"
                                    @change="triggerRaster"
                                />
                            </div>
                        </div>
                    </div>
                    <div class="checkbox-container">
                        <div class="form-inline">
                            <div class="title-checkbox pull-left">
                                <label>{{ $t("additional:modules.tools.populationRequest.select.showAlkisAdresses") }}</label>
                                <ToggleCheckbox
                                    ref="alkisAdressesCB"
                                    :defaultState="isAlkisAdressesVisibleInMap"
                                    :title="$t('additional:modules.tools.populationRequest.switchOffFilter')"
                                    :textOn="$t('common:snippets.checkbox.on')"
                                    :textOff="$t('common:snippets.checkbox.off')"
                                    @change="triggerAlkisAdresses"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
    .PopulationRequest {
        max-width:500px;
    }
    div.result {
        margin-top: 10px;
    }
    .result .table {
        margin-bottom: 20px;
    }
    .result .table td {
        padding: 8px;
        border-top: 1px solid #ddd;
    }
    .checkbox-container .form-inline {
        font-size: 15px;
    }
    .checkbox-container .form-inline .title-checkbox {
        width: 100%;
    }
</style>
