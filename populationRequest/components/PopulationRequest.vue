<script>
import Tool from "../../../src/modules/tools/Tool.vue";
import {mapGetters, mapMutations, mapActions} from "vuex";
import getters from "../store/gettersPopulationRequest";
import mutations from "../store/mutationsPopulationRequest";
import state from "../store/statePopulationRequest";
import actions from "../store/actionsPopulationRequest";
import GraphicalSelect from "../../../modules/snippets/graphicalSelect/components/GraphicalSelect.vue";
import ToggleCheckbox from "../../../src/share-components/ToggleCheckbox.vue";
import thousandsSeparator from "../../../src/utils/thousandsSeparator";
import WPS from "../../../src/api/wps";
import LoaderOverlay from "../../../src/utils/loaderOverlay";

export default {
    name: "PopulationRequest",
    components: {
        Tool,
        GraphicalSelect,
        ToggleCheckbox
    },
    data () {
        return {
            metaDataLink: undefined,
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
    /**
     * Created hook:
     * @returns {void}
     */
    created () {
        this.$on("close", this.close);

        this.$on("onDrawEnd", function (geoJson) {
            this.makeRequest(geoJson);
        });

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
        },
        /**
         * Resets the GraphicalSelect
         * @fires Snippets.GraphicalSelect#resetView
         * @returns {void}
         */
        resetView: function () {
            this.$refs.graphicalSelectComponent.resetView();
        },
        /**
         * Called when the wps modules returns a request
         * @param  {string} response - the response xml of the wps
         * @param  {number} status - the HTTPStatusCode
         * @returns {void}
         */
        handleResponse: function (response, status) {
            let parsedData = null;

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

            LoaderOverlay.hide();
        },
        /**
         * Displays Errortext if the WPS returns an Error
         * @param  {string} response received by wps
         * @returns {void}
         */
        handleWPSError: function (response) {
            this.addSingleAlert({
                category: this.translate("additional:modules.tools.populationRequest.errors.errorCategory"),
                content: this.translate("additional:modules.tools.populationRequest.errors.requestException") + JSON.stringify(response.ergebnis),
                displayClass: "error"
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
                    category: this.translate("additional:modules.tools.populationRequest.errors.errorCategory"),
                    content: this.translate("additional:modules.tools.populationRequest.errors.requestException") + JSON.stringify(response),
                    displayClass: "error"
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
                    "content": this.translate("additional:modules.tools.populationRequest.errors.layerIdCantBeLoadedPrefix") + layerId + this.translate("additional:modules.tools.populationRequest.errors.layerIdCantBeLoadedSuffix")
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
                        "content": this.translate("additional:modules.tools.populationRequest.errors.reduceScaleForRaster")
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
                        "content": this.translate("additional:modules.tools.populationRequest.errors.reduceScaleForAlkisAdresses")
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
        },
        /**
         * translates the given key, checkes if the key exists and throws a console warning if not
         * @param {String} key the key to translate
         * @param {Object} [options=null] for interpolation, formating and plurals
         * @returns {String} the translation or the key itself on error
         */
        translate (key, options = null) {
            if (key === "additional:" + this.$t(key)) {
                console.warn("the key " + JSON.stringify(key) + " is unknown to the additional translation");
            }

            return this.$t(key, options);
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="translate('additional:modules.tools.populationRequest.title')"
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
            <div>{{ translate("additional:modules.tools.populationRequest.select.info") }}</div>
            <div class="dropdown">
                <GraphicalSelect
                    ref="graphicalSelectComponent"
                    :selectElement="'Dropdown'"
                />
            </div>
            <div
                v-if="inhabitantsFHHNum > -1 || inhabitantsMRHNum > -1"
                class="result"
            >
                <div class="heading additional-text">
                    {{ translate("additional:modules.tools.populationRequest.result.confidentialityHint") }}:
                </div>
                <table class="table">
                    <tr
                        v-if="sourceFHH !== 'nein'"
                    >
                        <td>{{ translate("additional:modules.tools.populationRequest.result.populationFHH") }}:</td>
                        <td
                            class="inhabitantsFHH"
                        >
                            {{ inhabitantsFHH }}
                        </td>
                    </tr>
                    <tr
                        v-if="sourceMRH !== 'nein'"
                    >
                        <td>{{ translate("additional:modules.tools.populationRequest.result.populationMRH") }}:</td>
                        <td
                            class="inhabitantsMRH"
                        >
                            {{ inhabitantsMRH }}
                        </td>
                    </tr>
                    <tr
                        v-if="searchArea"
                    >
                        <td>{{ translate("additional:modules.tools.populationRequest.result.areaSize") }}:</td>
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
                        <span>{{ translate("additional:modules.tools.populationRequest.result.hint") }}:</span>&nbsp;{{ translate("additional:modules.tools.populationRequest.result.confidentialityHintSmallValues") }}
                    </div>
                    <div>
                        <a
                            target="_blank"
                            :href="`${metaDataLink}${fhhId}`"
                        >
                            {{ translate("additional:modules.tools.populationRequest.result.dataSourceFHHLinktext") }}
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
                            <span>{{ translate("additional:modules.tools.populationRequest.result.hint") }}:</span>&nbsp;{{ translate("additional:modules.tools.populationRequest.result.sourceAreaOutside") }}
                        </div>
                        <span>{{ translate("additional:modules.tools.populationRequest.result.dataSourceMRHKey") }}:</span>&nbsp;{{ translate("additional:modules.tools.populationRequest.result.dataSourceMRHValue") }}
                    </div>
                    <div
                        v-if="sourceMRH === 'tlw' || sourceFHH === 'nein'"
                    >
                        <a
                            target="_blank"
                            :href="`${metaDataLink}${mrhId}`"
                        >
                            {{ translate("additional:modules.tools.populationRequest.result.dataSourceMRHLinktext") }}
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
                                <label>{{ translate("additional:modules.tools.populationRequest.select.showRasterLayer") }}</label>
                                <ToggleCheckbox
                                    ref="rasterCB"
                                    :defaultState="isRasterVisibleInMap"
                                    :title="translate('additional:modules.tools.populationRequest.switchOffFilter')"
                                    :textOn="translate('common:snippets.checkbox.on')"
                                    :textOff="translate('common:snippets.checkbox.off')"
                                    @change="triggerRaster"
                                />
                            </div>
                        </div>
                    </div>
                    <div class="checkbox-container">
                        <div class="form-inline">
                            <div class="title-checkbox pull-left">
                                <label>{{ translate("additional:modules.tools.populationRequest.select.showAlkisAdresses") }}</label>
                                <ToggleCheckbox
                                    ref="alkisAdressesCB"
                                    :defaultState="isAlkisAdressesVisibleInMap"
                                    :title="translate('additional:modules.tools.populationRequest.switchOffFilter')"
                                    :textOn="translate('common:snippets.checkbox.on')"
                                    :textOff="translate('common:snippets.checkbox.off')"
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
    .checkbox-container .form-inline .title-checkbox label {
        white-space: normal;
        padding-left:5px;
    }
</style>
