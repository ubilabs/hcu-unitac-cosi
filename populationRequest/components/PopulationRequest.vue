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
            sourceFHH: "nein",
            sourceMRH: "nein",
            inhabitantsFHH: "-1",
            inhabitantsFHHNum: -1,
            inhabitantsMRH: "-1",
            inhabitantsMRHNum: -1,
            searchArea: 0
        };
    },
    computed: {
        ...mapGetters("Tools/PopulationRequest", Object.keys(getters)),
        ...mapGetters(["isTableStyle", "isDefaultStyle"]),

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
            this.inhabitantsFHHNum = -1;
            this.inhabitantsMRHNum = -1;
            this.sourceFHH = "nein";
            this.sourceMRH = "nein";
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
                    this.inhabitantsFHHNum = obj.einwohner_fhh;
                    this.inhabitantsFHH = thousandsSeparator(obj.einwohner_fhh);
                }
                else {
                    this.inhabitantsFHHNum = -1;
                }
                if (obj.hasOwnProperty("einwohner_mrh")) {
                    this.inhabitantsMRHNum = obj.einwohner_mrh;
                    this.inhabitantsMRH = thousandsSeparator(obj.einwohner_mrh);
                }
                else {
                    this.inhabitantsMRHNum = -1;
                }
                if (obj.hasOwnProperty("quelle_fhh")) {
                    this.sourceFHH = obj.quelle_fhh;
                }
                else {
                    this.sourceFHH = "nein";
                }
                if (obj.hasOwnProperty("quelle_mrh")) {
                    this.sourceMRH = obj.quelle_mrh;
                }
                else {
                    this.sourceMRH = "nein";
                }
                if (obj.hasOwnProperty("suchflaeche")) {
                    this.searchArea = this.chooseUnitAndThousandsSeparator(obj.suchflaeche);
                }
                else {
                    this.searchArea = 0;
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
         * @param {boolean} value the new value
         * @param {object} checkboxComponent the Component that triggered this call
         * @fires Core#RadioRequestModelListGetModelByAttributes
         * @returns {void}
         */
        checkIsModelLoaded: function (layerId, value, checkboxComponent) {
            const layerModel = Radio.request("ModelList", "getModelsByAttributes", {id: layerId});

            if (layerModel === undefined || layerModel.length === 0) {
                if (value) {
                    checkboxComponent.setActive(false);
                }

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
            const rasterCB = this.$refs.rasterCB,
                layerId = this.rasterLayerId;

            if (value) {
                const scale = this.$store.state.Map.scale; // Radio.request("MapView", "getOptions").scale

                // if the Map has too large Scale give notification and undo the activation
                if (scale > 100000) {
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

            this.addModelsByAttributesToModelList(layerId);
            if (value) {
                this.checkIsModelLoaded(layerId, value, rasterCB);
            }
            this.setModelAttributesByIdToModelList(layerId, value);
        },
        /**
         * Sets the state at the alkisAdresses Layer
         * @param {boolean} value flag if alkisAdresses is to be set
         * @returns {void}
         */
        triggerAlkisAdresses (value) {
            const alkisAdressesCB = this.$refs.alkisAdressesCB,
                layerId = this.alkisAdressLayerId;

            if (value) {
                const scale = this.$store.state.Map.scale; // Radio.request("MapView", "getOptions").scale;

                // if the Map has too large Scale give notification and undo the activation
                if (scale > 10000) {
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

            this.addModelsByAttributesToModelList(layerId);
            if (value) {
                this.checkIsModelLoaded(layerId, value, alkisAdressesCB);
            }
            this.setModelAttributesByIdToModelList(layerId, value);
        },
        /**
         * Sets FHH values for Testing
         * @param {string} source Value for sourceFHH
         * @param {integer} inhabitantsNumValue Value for inhabitantsFHHNum
         * @returns {void}
         */
        setFHH (source, inhabitantsNumValue) {
            this.sourceFHH = source;
            this.inhabitantsFHHNum = inhabitantsNumValue;
            this.inhabitantsFHH = thousandsSeparator(inhabitantsNumValue);
        },
        /**
         * Sets MRH values for Testing
         * @param {string} source Value for sourceMRH
         * @param {integer} inhabitantsNumValue Value for inhabitantsMRHNum
         * @returns {void}
         */
        setMRH (source, inhabitantsNumValue) {
            this.sourceMRH = source;
            this.inhabitantsMRHNum = inhabitantsNumValue;
            this.inhabitantsMRH = thousandsSeparator(inhabitantsNumValue);
        },
        /**
         * Sets searcharea for Testing
         * @param {string} area Value for searchArea
         * @returns {void}
         */
        setSearchArea (area) {
            this.searchArea = area;
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
                v-if="inhabitantsFHHNum > -1 || inhabitantsMRHNum > -1"
                class="result"
            >
                <div class="heading additional-text">
                    {{ $t("additional:modules.tools.populationRequest.result.confidentialityHint") }}:
                </div>
                <table class="table">
                    <tr
                        v-if="sourceFHH !== 'nein'"
                    >
                        <td>{{ $t("additional:modules.tools.populationRequest.result.populationFHH") }}:</td>
                        <td
                            class="inhabitantsFHH"
                        >
                            {{ inhabitantsFHH }}
                        </td>
                    </tr>
                    <tr
                        v-if="sourceMRH !== 'nein'"
                    >
                        <td>{{ $t("additional:modules.tools.populationRequest.result.populationMRH") }}:</td>
                        <td
                            class="inhabitantsMRH"
                        >
                            {{ inhabitantsMRH }}
                        </td>
                    </tr>
                    <tr
                        v-if="searchArea"
                    >
                        <td>{{ $t("additional:modules.tools.populationRequest.result.areaSize") }}:</td>
                        <td
                            class="searchArea"
                        >
                            {{ searchArea }}
                        </td>
                    </tr>
                </table>
                <div
                    v-if="(inhabitantsFHHNum > -1 && inhabitantsFHHNum < 1000 && sourceFHH === 'ja')"
                    class="inhabitantsFHHAddText"
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
                    v-if="inhabitantsMRHNum > 0 && (sourceMRH === 'ja' || sourceMRH === 'tlw' || sourceFHH === 'nein')"
                    class="inhabitantsMRHAddText"
                >
                    <div
                        class="hinweis additional-text"
                    >
                        <div
                            v-if="sourceFHH !== 'nein'"
                        >
                            <span>{{ $t("additional:modules.tools.populationRequest.result.hint") }}:</span>&nbsp;{{ $t("additional:modules.tools.populationRequest.result.sourceAreaOutside") }}
                        </div>
                        <span>{{ $t("additional:modules.tools.populationRequest.result.dataSourceMRHKey") }}:</span>&nbsp;{{ $t("additional:modules.tools.populationRequest.result.dataSourceMRHValue") }}
                    </div>
                    <div
                        v-if="sourceMRH === 'tlw' || sourceFHH === 'nein'"
                    >
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
