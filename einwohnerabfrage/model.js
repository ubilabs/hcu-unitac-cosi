import Tool from "../../modules/core/modelList/tool/model";
import GraphicalSelectModel from "../../modules/snippets/graphicalSelect/model";
import SnippetCheckboxModel from "../../modules/snippets/checkbox/model";
import thousandsSeparator from "../../src/utils/thousandsSeparator";
import LoaderOverlay from "../../src/utils/loaderOverlay";
import "./RadioBridge.js";

const EinwohnerabfrageModel = Tool.extend(/** @lends EinwohnerabfrageModel.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        type: "tool",
        parentId: "tools",
        deactivateGFI: true,
        renderToWindow: true,
        checkBoxAddress: undefined,
        checkBoxRaster: undefined,
        name: "Einwohneranzahl abfragen",
        nameTranslationKey: "additional:modules.tools.populationRequest.title",
        data: {},
        dataReceived: false,
        style: "DEFAULT",
        snippetDropdownModel: {},
        metaDataLink: undefined,
        mrhId: "46969C7D-FAA8-420A-81A0-8352ECCFF526",
        fhhId: "B3FD9BD5-F614-433F-A762-E14003C300BF",
        fhhDate: undefined,
        uniqueIdList: [],
        glyphicon: "glyphicon-wrench",
        rasterLayerId: "13023",
        alkisAdressLayerId: "9726",
        populationReqServiceId: "2",
        id: "einwohnerabfrage",
        idCounter: 0,
        // translations
        confidentialityHint: "",
        confidentialityHintSmallValues: "",
        populationFHH: "",
        populationMRH: "",
        areaSize: "",
        hint: "",
        dataSourceFHHKey: "",
        dataSourceFHHValue: "",
        dataSourceFHHLinktext: "",
        dataSourceMRHKey: "",
        dataSourceMRHValue: "",
        dataSourceMRHLinktext: "",
        info: "",
        showRasterLayer: "",
        showAlkisAdresses: "",
        useProxy: false
    }),

    /**
     * @class EinwohnerabfrageModel
     * @extends Tool
     * @memberof Addons.Einwohnerabfrage
     * @constructs
     * @property {Boolean} deactivateGFI=true flag for deactivate gfi
     * @property {Boolean} renderToWindow=true render to window for tools
     * @property {*} checkBoxAddress=undefined checkbox snippet for alkis adressen layer
     * @property {*} checkBoxRaster=undefined checkbox snippet for zensus raster layer
     * @property {Object} data={} data of the wps request
     * @property {Boolean} dataReceived=false true | false, depending on the request
     * @property {String} style = "default" - style for MasterPortal ("table" - for table View)
     * @property {Object} snippetDropdownModel={} the model of the graphical selection
     * @property {String} metaDataLink=undefined link to meta data
     * @property {String} mrhId="46969C7D-FAA8-420A-81A0-8352ECCFF526" mrh meta data id
     * @property {String} fhhId="B3FD9BD5-F614-433F-A762-E14003C300BF" fhh meta data id
     * @property {*} fhhDate=undefined the date
     * @property {Array} uniqueIdList=[] array to store unique ids in
     * @property {String} glyphicon="glyphicon-wrench" glyphicon to show
     * @property {String} rasterLayerId="13023" layerId for layer with raster
     * @property {String} alkisAdressLayerId="9726" layerId for the alkis adresses
     * @property {String} populationReqServiceId="2" serviceid
     * @property {String} id= "Einwohnerabfrage" id of this model
     * @property {Number} idCounter=0 counter for unique ids
     * @property {String} confidentialityHint="", filled with "Unter Berücksichtigung der Geheimhaltung wurde folgender Wert berechnet"- translated
     * @property {String} confidentialityHintSmallValues="Aus Datenschutzgründen werden kleine Fallzahlen unter 3 verändert.", filled with ""- translated
     * @property {String} populationFHH="", filled with "Einwohnerzahl in Hamburg"- translated
     * @property {String} populationMRH="", filled with "Einwohnerzahl in der Metropolregion ohne Hamburg"- translated
     * @property {String} areaSize="", filled with "Größe der abgefragten Fläche"- translated
     * @property {String} hint="", filled with "Hinweis"- translated
     * @property {String} dataSourceFHHKey="", filled with "Datenquelle Hamburg"- translated
     * @property {String} dataSourceFHHValue="", filled with "Einwohner mit Hauptwohnsitz, Melderegister"- translated
     * @property {String} dataSourceFHHLinktext="", filled with "Quelle FHH"- translated
     * @property {String} dataSourceMRHKey="", filled with "Datenquelle Metropolregion ohne Hamburg"- translated
     * @property {String} dataSourceMRHValue="", filled with "Bevölkerung insgesamt im 100 Meter-Gitter, Zensus 2011. Stand der Zensus-Daten 09.05.2011."- translated
     * @property {String} dataSourceMRHLinktext="", filled with "Quelle MRH"- translated
     * @property {String} info="", filled with "Die Abfrage der Einwohnerzahl ist sowohl für die Freie Hansestadt Hamburg als auch für die Metropolregion Hamburg möglich."- translated
     * @property {String} showRasterLayer="", filled with "Raster Layer anzeigen (ab 1: 100.000)"- translated
     * @property {String} showAlkisAdresses="", filled with "ALKIS Adressen anzeigen (ab 1: 20.000)"- translated
     * @listens Tools.Einwohnerabfrage#ChangeIsActive
     * @listens CswParser#RadioTriggerCswParserFetchedMetaData
     * @listens Core#RadioTriggerModelListUpdateVisibleInMapList
     * @listens i18next#RadioTriggerLanguageChanged
     * @listens Einwohnerabfrage#ChangeIsActive
     * @listens CswParser#RadioTriggerCswParserFetchedMetaData
     * @listens Core.ModelList#RadioTriggerModelListUpdateVisibleInMapList
     * @fires RestReader#RadioRequestRestReaderGetServiceById
     * @fires Addons.Einwohnerabfrage#RenderResult
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core#RadioRequestUtilThousandsSeparator
     * @fires Core#RadioTriggerMapAddInteraction
     * @fires Core#RadioTriggerWPSRequest
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @fires Core.ModelList#RadioTriggerModelListAddModelByAttributes
     * @fires Core.ModelList#RadioTriggerModelListSetModelAttributesById
     */
    initialize: function () {
        this.changeLang(i18next.language);
        if (Radio.request("Util", "getUiStyle") !== "DEFAULT") {
            this.setStyle("TABLE");
        }
        this.superInitialize();

        this.setCheckBoxAddress(new SnippetCheckboxModel({
            isSelected: false,
            label: this.get("showAlkisAdresses")
        }));
        this.setCheckBoxRaster(new SnippetCheckboxModel({
            isSelected: false,
            label: this.get("showRasterLayer")
        }));

        this.listenTo(this, {
            "change:isActive": function () {
                this.changeGraphicalSelectStatus(this.get("isActive"));
            }
        });
        this.listenTo(Radio.channel("CswParser"), {
            "fetchedMetaDataForEinwohnerabfrage": this.fetchedMetaData
        });
        this.listenTo(this.get("checkBoxRaster"), {
            "valuesChanged": this.toggleRasterLayer
        });
        this.listenTo(this.get("checkBoxAddress"), {
            "valuesChanged": this.toggleAlkisAddressLayer
        });
        this.listenTo(Radio.channel("ModelList"), {
            "updateVisibleInMapList": function () {
                this.checksSnippetCheckboxLayerIsLoaded(this.get("rasterLayerId"), this.get("checkBoxRaster"));
                this.checksSnippetCheckboxLayerIsLoaded(this.get("alkisAdressLayerId"), this.get("checkBoxAddress"));
            }
        });
        this.on("change:isActive", this.handleCswRequests, this);
        this.setDropDownSnippet(new GraphicalSelectModel({id: this.id}));
        this.listenTo(Radio.channel("GraphicalSelect"), {
            "onDrawEnd": function (geoJson) {
                if (this.get("isActive")) {
                    this.makeRequest(geoJson);
                }
            }
        });

        const service = Radio.request("RestReader", "getServiceById", this.get("populationReqServiceId"));

        if (service !== undefined) {
            this.setMetaDataLink(service.get("url"));
        }

        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });
    },
    /**
     * change language - sets default values for the language
     * @returns {Void}  -
     */
    changeLang: function () {
        this.set({
            confidentialityHint: i18next.t("additional:modules.tools.populationRequest.result.confidentialityHint"),
            populationFHH: i18next.t("additional:modules.tools.populationRequest.result.populationFHH"),
            populationMRH: i18next.t("additional:modules.tools.populationRequest.result.populationMRH"),
            areaSize: i18next.t("additional:modules.tools.populationRequest.result.areaSize"),
            confidentialityHintSmallValues: i18next.t("additional:modules.tools.populationRequest.result.confidentialityHintSmallValues"),
            hint: i18next.t("additional:modules.tools.populationRequest.result.hint"),
            dataSourceFHHKey: i18next.t("additional:modules.tools.populationRequest.result.dataSourceFHHKey"),
            dataSourceFHHValue: i18next.t("additional:modules.tools.populationRequest.result.dataSourceFHHValue"),
            dataSourceFHHLinktext: i18next.t("additional:modules.tools.populationRequest.result.dataSourceFHHLinktext"),
            dataSourceMRHKey: i18next.t("additional:modules.tools.populationRequest.result.dataSourceMRHKey"),
            dataSourceMRHValue: i18next.t("additional:modules.tools.populationRequest.result.dataSourceMRHValue"),
            dataSourceMRHLinktext: i18next.t("additional:modules.tools.populationRequest.result.dataSourceMRHLinktext"),
            showRasterLayer: i18next.t("additional:modules.tools.populationRequest.select.showRasterLayer"),
            showAlkisAdresses: i18next.t("additional:modules.tools.populationRequest.select.showAlkisAdresses")
        });
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
     * Updates the metadata for the unique id of the given csw object
     * @param {Object} cswObj the csw object
     * @returns {void}
     */
    fetchedMetaData: function (cswObj) {
        if (this.isOwnMetaRequest(this.get("uniqueIdList"), cswObj.uniqueId)) {
            this.removeUniqueIdFromList(this.get("uniqueIdList"), cswObj.uniqueId);
            this.updateMetaData(cswObj.attr, cswObj.parsedData);
        }
    },
    /**
     * Checks if the id is in the list.
     * @param {Array} uniqueIdList array with ids
     * @param {String} uniqueId is contained?
     * @returns {Boolean} true, if id is contained in list
     */
    isOwnMetaRequest: function (uniqueIdList, uniqueId) {
        return uniqueIdList ? uniqueIdList.indexOf(uniqueId) > -1 : false;
    },
    /**
     * Removes the id from the list.
     * @param {Array} uniqueIdList array with ids
     * @param {String} uniqueId to remove from array
     * @returns {void}
     */
    removeUniqueIdFromList: function (uniqueIdList, uniqueId) {
        if (!uniqueIdList) {
            this.setUniqueIdList([]);
        }
        else {
            const filtered = uniqueIdList.filter(function (value) {
                return value !== uniqueId;
            });

            this.setUniqueIdList(filtered);
        }
    },
    /**
     * If attr equals "fhhDate" the parsed date is set to model
     * @param {String} attr attribute of the metadata
     * @param {Object} parsedData date of this param is set
     * @returns {void}
     */
    updateMetaData: function (attr, parsedData) {
        if (attr === "fhhDate") {
            this.setFhhDate(parsedData.date);
        }
    },

    /**
     * Reset State when tool becomes active/inactive
     * @returns {void}
     */
    reset: function () {
        this.setData({});
        this.setDataReceived(false);
        LoaderOverlay.hide();
    },

    /**
     * Called when the wps modules returns a request
     * @param  {String} response - the response xml of the wps
     * @param  {Number} status - the HTTPStatusCode
     * @fires Addons.Einwohnerabfrage#RenderResult
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
        this.trigger("renderResult");
    },

    /**
     * Displays Errortext if the WPS returns an Error
     * @param  {String} response received by wps
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    handleWPSError: function (response) {
        Radio.trigger("Alert", "alert", JSON.stringify(response.ergebnis));
    },

    /**
     * Used when statuscode is 200 and wps did not return an error
     * @param  {String} response received by wps
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    handleSuccess: function (response) {
        let obj = null;

        try {
            obj = JSON.parse(response.ergebnis);
            obj = this.prepareDataForRendering(obj);
            this.setData(obj);
            this.setDataReceived(true);
        }
        catch (e) {
            Radio.trigger("Alert", "alert", "Datenabfrage fehlgeschlagen. (Technische Details: " + JSON.stringify(response));
            this.resetView();
            (console.error || console.warn).call(console, e.stack || e);
        }
    },

    /**
     * Iterates ofer response properties
     * @param  {Object} response - the parsed response from wps
     * @fires Core#RadioRequestUtilThousandsSeparator
     * @returns {Object} the prepared data
     */
    prepareDataForRendering: function (response) {
        const preparedData = {};

        Object.entries(response).forEach(function ([key, value]) {
            let stringVal = "";

            if (!isNaN(value)) {
                if (key === "suchflaeche") {
                    stringVal = this.chooseUnitAndThousandsSeparator(value);
                }
                else {
                    stringVal = thousandsSeparator(value);
                }
                preparedData[key] = stringVal;
            }
            else {
                preparedData[key] = value;
            }

        }, this);
        return preparedData;
    },

    /**
     * Chooses unit based on value, calls thousandsSeparator and converts to unit and appends unit
     * @param  {Number} value - to inspect
     * @param  {Number} maxDecimals - decimals are cut after maxlength chars
     * @fires Core#RadioRequestUtilThousandsSeparator
     * @returns {String} unit
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
     * Sets the state at GraphicalSelect - handles (de-)activation of this Tool
     * @param {Boolean} value flag is tool is active
     * @fires Snippets.GraphicalSelect#setStatus
     * @returns {void}
     */
    changeGraphicalSelectStatus: function (value) {
        if (value) {
            this.checksSnippetCheckboxLayerIsLoaded(this.get("rasterLayerId"), this.get("checkBoxRaster"));
            this.checksSnippetCheckboxLayerIsLoaded(this.get("alkisAdressLayerId"), this.get("checkBoxAddress"));
        }
        Radio.trigger("GraphicalSelect", "setStatus", this.id, value);
    },

    /**
     * runs the csw requests once and removes this callback from the change:isActive event
     * because both requests only need to be executed once
     * @returns {void}
     */
    handleCswRequests: function () {
        const metaIds = [
            {
                metaId: this.get("fhhId"),
                attr: "fhhDate"
            }
        ];

        if (this.get("isActive")) {
            metaIds.forEach(function (metaIdObj) {
                const uniqueId = this.uniqueId(),
                    cswObj = {};

                this.get("uniqueIdList").push(uniqueId);
                cswObj.metaId = metaIdObj.metaId;
                cswObj.keyList = ["date"];
                cswObj.uniqueId = uniqueId;
                cswObj.attr = metaIdObj.attr;
                Radio.trigger("CswParser", "getMetaDataForEinwohnerabfrage", cswObj, this.get("useProxy"));
            }, this);

            this.off("change:isActive", this.handleCswRequests);
        }
    },
    /**
     * Returns a unique id, starts with the given prefix
     * @param {string} prefix prefix for the id
     * @returns {string} a unique id
     */
    uniqueId: function (prefix) {
        let counter = this.get("idCounter");
        const id = ++counter;

        this.setIdCounter(id);
        return prefix ? prefix + id : id;
    },
    /**
     * Triggers the wps request "einwohner_ermitteln.fmw" for the selected area.
     * @param  {Object} geoJson GeoJSON to get selected area from
     * @fires Addons.Einwohnerabfrage#RenderResult
     * @fires Core#RadioTriggerWPSRequest
     * @returns {void}
     */
    makeRequest: function (geoJson) {
        this.setDataReceived(false);
        LoaderOverlay.show();
        this.trigger("renderResult");

        Radio.trigger("WPS", "request", "1001", "einwohner_ermitteln.fmw", {
            "such_flaeche": JSON.stringify(geoJson)
        }, this.handleResponse.bind(this));
    },

    /**
     * checks if snippetCheckboxLayer is loaded and toggles the button accordingly
     * @param {String} layerId - id of the addressLayer
     * @param {SnippetCheckboxModel} snippetCheckboxModel - snippet checkbox model for a layer
     * @fires Core#RadioRequestModelListGetModelByAttributes
     * @returns {void}
     */
    checksSnippetCheckboxLayerIsLoaded: function (layerId, snippetCheckboxModel) {
        const model = Radio.request("ModelList", "getModelByAttributes", {id: layerId}),
            isVisibleInMap = model !== undefined ? model.get("isVisibleInMap") : false;

        if (isVisibleInMap) {
            snippetCheckboxModel.setIsSelected(true);
        }
        else {
            snippetCheckboxModel.setIsSelected(false);
        }
    },

    /**
     * show or hide the zensus raster layer
     * @param {Boolean} value - true | false
     * @returns {void}
     */
    toggleRasterLayer: function (value) {
        const layerId = this.get("rasterLayerId");

        this.addModelsByAttributesToModelList(layerId);
        if (value) {
            this.checkIsModelLoaded(layerId, this.get("checkBoxRaster"));
        }
        this.setModelAttributesByIdToModelList(layerId, value);
    },

    /**
     * show or hide the alkis adressen layer
     * @param {Boolean} value - true | false
     * @returns {void}
     */
    toggleAlkisAddressLayer: function (value) {
        const layerId = this.get("alkisAdressLayerId");

        this.addModelsByAttributesToModelList(layerId);
        if (value) {
            this.checkIsModelLoaded(layerId, this.get("checkBoxAddress"));
        }
        this.setModelAttributesByIdToModelList(layerId, value);
    },

    /**
     * if the model does not exist, add Model from Parser to ModelList via Radio.trigger
     * @param {String} layerId id of the layer to be toggled
     * @fires Core#RadioRequestModelListGetModelByAttributes
     * @returns {void}
     */
    addModelsByAttributesToModelList: function (layerId) {
        if (Radio.request("ModelList", "getModelsByAttributes", {id: layerId}).length === 0) {
            Radio.trigger("ModelList", "addModelsByAttributes", {id: layerId});
        }
    },

    /**
     * checks whether the model has been loaded.
     * If it is not loaded, a corresponding error message is displayed and switches snippetCheckbox off
     * @param {String} layerId id of the layer to be toggled
     * @param {SnippetCheckboxModel} snippetCheckboxModel - snippet checkbox model for a layer
     * @fires Core#RadioRequestModelListGetModelByAttributes
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    checkIsModelLoaded: function (layerId, snippetCheckboxModel) {
        if (Radio.request("ModelList", "getModelsByAttributes", {id: layerId}).length === 0) {
            Radio.trigger("Alert", "alert", "Der Layer mit der ID: " + layerId + " konnte nicht geladen werden, da dieser im Portal nicht zur Verfügung steht!");
            snippetCheckboxModel.setIsSelected(false);
        }
    },

    /**
     * sets selected and visibility to ModelList via Radio.trigger
     * @param {String} layerId id of the layer to be toggled
     * @param {Boolean} value - true | false
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
    * Sets the idCounter.
    * @param {string} value counter
    * @returns {void}
    */
    setIdCounter: function (value) {
        this.set("idCounter", value);
    },
    /**
     * setter for style
     * @param {String} value - table or default (for master portal)
     * @returns {void}
     */
    setStyle: function (value) {
        this.set("style", value);
    },

    /**
     * Sets the checkBoxAddress
     * @param {SnippetCheckboxModel} value  the model of the checkbox
     * @returns {void}
     */
    setCheckBoxAddress: function (value) {
        this.set("checkBoxAddress", value);
    },

    /**
     * Sets the checkBoxRaster
     * @param {SnippetCheckboxModel} value the model of the checkbox
     * @returns {void}
     */
    setCheckBoxRaster: function (value) {
        this.set("checkBoxRaster", value);
    },

    /**
     * Sets the data
     * @param {Object} value data of the wps request
     * @returns {void}
     */
    setData: function (value) {
        this.set("data", value);
    },

    /**
     * Sets the dataReceived
     * @param {Boolean} value true | false
     * @returns {void}
     */
    setDataReceived: function (value) {
        this.set("dataReceived", value);
    },

    /**
     * Sets the GraphicalSelectModel
     * @param {GraphicalSelectModel} value the model of the graphical selectbox
     * @returns {void}
     */
    setDropDownSnippet: function (value) {
        this.set("snippetDropdownModel", value);
    },

    /**
     * Sets the fhhDate
     * @param {String} value the date
     * @returns {void}
     */
    setFhhDate: function (value) {
        this.set("fhhDate", value);
    },

    /**
     * Sets the uniqueIdList
     * @param {Array} value the array to store ids in
     * @returns {void}
     */
    setUniqueIdList: function (value) {
        this.set("uniqueIdList", value);
    },

    /**
     * Sets the metaDataLink
     * @param {String} value link to the metadata
     * @returns {void}
     */
    setMetaDataLink: function (value) {
        this.set("metaDataLink", value);
    },
});

export default EinwohnerabfrageModel;
