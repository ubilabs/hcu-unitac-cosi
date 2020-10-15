import Tool from "../../modules/core/modelList/tool/model";
import GraphicalSelectModel from "../../modules/snippets/graphicalSelect/model";
import {WFS} from "ol/format.js";
import * as turf from "@turf/turf";

const SdpDownloadModel = Tool.extend(/** @lends SdpDownloadModel.prototype */{

    defaults: Object.assign({}, Tool.prototype.defaults, {
        type: "tool",
        parentId: "tools",
        id: "sdpdownload",
        name: "SDP Download", // must be here although it is in the config.json, else it is lost
        glyphicon: "glyphicon-download", // must be here although it is in the config.json, else it is lost
        deactivateGFI: true,
        renderToSidebar: true,
        renderToWindow: false,
        wmsRasterLayerId: "4707",
        formats: [
            {id: "NAS", label: "", isSelected: true, desc: ""},
            {id: "DWG_310", label: "", isSelected: false, desc: ""},
            {id: "DWG_320", label: "", isSelected: false, desc: ""},
            {id: "JPG", label: "", isSelected: false, desc: ""}],
        selectedFormat: "NAS", // is preselected
        compressDataId: "compressData",
        compressedFileId: "compressedFile",
        wfsRasterParams: {
            url: "https://geodienste.hamburg.de/HH_WFS_Uebersicht_Kachelbezeichnungen",
            request: "GetFeature",
            service: "WFS",
            version: "1.1.0",
            typename: "app:lgv_kachel_dk5_1km_utm"
        },
        overviewDownloadLocation: "U:\\Kachel_Uebersichten\\UTM_Kachel_1KM_",
        wfsRaster: {},
        graphicalSelectModel: {},
        requesting: false,
        selectedRasterLimit: 9,
        rasterNames: [],
        // translations:
        selectFormat: "",
        howToChooseTiles: "",
        downloadDataPackage: "",
        specialDownloads: "",
        neuwerkDataPackage: "",
        scharhörnDataPackage: "",
        tileOverview310: "",
        tileOverview320: "",
        pleaseSelectTiles: "",
        failedToDownload: "",
        details: "",
        serviceNotResponding: ""
    }),
    /**
 * @class SdpDownloadModel
 * @extends Tool
 * @memberof Addons.SdpDownload
 * @constructs
 * @property {Boolean} deactivateGFI=true avoid show DK5-Info if user clicks into Map
 * @property {Boolean} isActive=false state of the tool
 * @property {Boolean} renderToSidebar=true show this tool in sidebar
 * @property {Boolean} renderToWindow=false not show this tool in window
 * @property {String} wmsRasterLayerId="4707" id of the Layer utm_dk5_1km (WMS Uebersicht Kachelbezeichnungen)
 * @property {array} formats=[] provided formats of data to download
 * @property {string} selectedFormat="NAS" is the preselected format
 * @property {string} compressDataId="compressData" todo
 * @property {string} compressedFileId="compressedFile" todo
 * @property {Object} wfsRasterParams connection parameters
 * @property {string} wfsRasterParams.url="https://geodienste.hamburg.de/HH_WFS_Uebersicht_Kachelbezeichnungen" todo
 * @property {string} wfsRasterParams.request="GetFeature" Request type
 * @property {string} wfsRasterParams.service="WFS" Service type
 * @property {string} wfsRasterParams.version="1.1.0" Version from services
 * @property {string} wfsRasterParams.typename="app:lgv_kachel_dk5_1km_utm" Type in service
 * @property {string} overviewDownloadLocation= "U:\\Kachel_Uebersichten\\UTM_Kachel_1KM_" location of the files to download
 * @property {Object} wfsRaster={} contains wfs raster features after loading them
 * @property {Object} graphicalSelectModel={} model for graphical selection
 * @property {Object} requesting=false state of server request
 * @property {Object} selectedRasterLimit=9 limit og raster images for download
 * @property {Array} rasterNames=[] stores the names of the tiles in the raster
 * @property {String} selectFormat: "" contains the translated text
 * @property {String} howToChooseTiles: "" contains the translated text
 * @property {String} downloadDataPackage: "" contains the translated text
 * @property {String} specialDownloads: "" contains the translated text
 * @property {String} neuwerkDataPackage: "" contains the translated text
 * @property {String} scharhörnDataPackage: "" contains the translated text
 * @property {String} tileOverview310: "" contains the translated text
 * @property {String} tileOverview320: "" contains the translated text
 * @property {String} pleaseSelectTiles: "" contains the translated text
 * @property {String} failedToDownload: "" contains the translated text
 * @property {String} details: "" contains the translated text
 * @property {String} serviceNotResponding: "" contains the translated text
 * @listens Addons.SdpDownloadModel#changeIsActive
 * @listens Core#RadioTriggerMapViewChangedOptions
 * @listens Core.ModelList#RadioTriggerModelListToggleDefaultTool
 * @fires Snippets.GraphicalSelect#setStatus
 * @fires Snippets.GraphicalSelect#resetView
 * @fires Core.ModelList#RadioTriggerModelListAddModelsByAttributes
 * @fires Core.ModelList#RadioTriggerModelListSetModelAttributesById
 * @fires Snippets.GraphicalSelect#featureToGeoJson
 * @fires Addons.SdpDownloadModel#render
 */
    initialize: function () {
        this.superInitialize();
        this.listenTo(this, {
            "change:isActive": function (value) {
                const isActive = value.get("isActive");

                this.toggleRasterLayer(isActive);
                if (isActive) {
                    this.loadWfsRaster();
                    this.changeGraphicalSelectStatus(true);
                    Radio.trigger("GraphicalSelect", "resetGeographicSelection");
                }
                else {
                    this.changeGraphicalSelectStatus(false);
                }
            }
        });
        this.listenTo(Radio.channel("MapView"), {
            // zoomlevel, center or resolution of the map changes
            "changedOptions": function () {
                if (this.get("isActive")) {
                    this.toggleRasterLayer(true);
                }
            }
        });
        this.listenTo(Radio.channel("ModelList"), {
            // sidebar closes -> hide raster
            "toggleDefaultTool": function () {
                this.toggleRasterLayer(false);
                this.changeGraphicalSelectStatus(false);
            }
        });
        this.setGraphicalSelectModel(new GraphicalSelectModel({id: this.id}));

        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });
        this.changeLang();
    },
    /**
    * change language - sets default values for the language
    * @param {String} lng - new language to be set
    * @returns {Void} -
    */
    changeLang: function (lng) {
        const nasDefaults = this.get("formats")[0],
            dwg310Defaults = this.get("formats")[1],
            dwg320Defaults = this.get("formats")[2],
            jpgDefaults = this.get("formats")[3];

        nasDefaults.label = i18next.t("additional:modules.tools.sdpdownload.nasLabel");
        nasDefaults.desc = i18next.t("additional:modules.tools.sdpdownload.nasDescription");

        dwg310Defaults.label = i18next.t("additional:modules.tools.sdpdownload.dwg310Label");
        dwg310Defaults.desc = i18next.t("additional:modules.tools.sdpdownload.dwg310Description");

        dwg320Defaults.label = i18next.t("additional:modules.tools.sdpdownload.dwg320Label");
        dwg320Defaults.desc = i18next.t("additional:modules.tools.sdpdownload.dwg320Description");

        jpgDefaults.label = i18next.t("additional:modules.tools.sdpdownload.jpgLabel");
        jpgDefaults.desc = i18next.t("additional:modules.tools.sdpdownload.jpgDescription");
        
        this.set({
            "selectFormat": i18next.t("additional:modules.tools.sdpdownload.selectFormat"),
            "howToChooseTiles": i18next.t("additional:modules.tools.sdpdownload.howToChooseTiles"),
            "downloadDataPackage": i18next.t("additional:modules.tools.sdpdownload.downloadDataPackage"),
            "specialDownloads": i18next.t("additional:modules.tools.sdpdownload.specialDownloads"),
            "neuwerkDataPackage": i18next.t("additional:modules.tools.sdpdownload.neuwerkDataPackage"),
            "scharhörnDataPackage": i18next.t("additional:modules.tools.sdpdownload.scharhörnDataPackage"),
            "tileOverview310": i18next.t("additional:modules.tools.sdpdownload.tileOverview310"),
            "tileOverview320": i18next.t("additional:modules.tools.sdpdownload.tileOverview320"),
            "pleaseSelectTiles": i18next.t("additional:modules.tools.sdpdownload.pleaseSelectTiles"),
            "failedToDownload": i18next.t("additional:modules.tools.sdpdownload.failedToDownload"),
            "details": i18next.t("additional:modules.tools.sdpdownload.details"),
            "serviceNotResponding": i18next.t("additional:modules.tools.sdpdownload.serviceNotResponding"),
            "currentLng": lng
        });
    },
    /**
     * Sets the state at GraphicalSelect - handles (de-)activation of this Tool
     * @param {Boolean} val active or not
     * @fires Snippets.GraphicalSelect#setStatus
     * @returns {void}
     */
    changeGraphicalSelectStatus: function (val) {
        Radio.trigger("GraphicalSelect", "setStatus", this.id, val);
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
     * Shows or hides the raster layer
     * @param {Boolean} value show or not
     * @returns {void}
     */
    toggleRasterLayer: function (value) {
        const layerId = this.get("wmsRasterLayerId");

        this.addModelsByAttributesToModelList(layerId);
        this.setModelAttributesByIdToModelList(layerId, value);
    },
    /**
     * Adds the layer to the modellist
     * @param {String} layerId id of the layer
     * @fires Core.ModelList#RadioTriggerModelListAddModelsByAttributes
     * @returns {void}
     */
    addModelsByAttributesToModelList: function (layerId) {
        if (Radio.request("ModelList", "getModelsByAttributes", {id: layerId}).length === 0) {
            Radio.trigger("ModelList", "addModelsByAttributes", {id: layerId});
        }
    },
    /**
     * Sets the layer to the modellist
     * @param {String} layerId id of the layer
     * @param {Boolean} value is selected and is visible in map
     * @fires  Core.ModelList#RadioTriggerModelListSetModelAttributesById
     * @returns {void}
     */
    setModelAttributesByIdToModelList: function (layerId, value) {
        Radio.trigger("ModelList", "setModelAttributesById", layerId, {
            isSelected: value,
            isVisibleInMap: value
        });
    },
    /**
    * Loads the wfs raster with the params stored in property wfsRasterParams.
    * On success the features are read.
    * @returns {void}
    */
    loadWfsRaster: function () {
        const params = this.get("wfsRasterParams"),
            data = "service=" + params.service + "&version=" + params.version + "&request=" + params.request + "&TypeName=" + params.typename;

        $.ajax({
            url: Radio.request("Util", "getProxyURL", params.url),
            data: encodeURI(data),
            contentType: "text/xml",
            type: "GET",
            context: this,
            cache: false,
            dataType: "xml",
            success: function (resp) {
                this.readFeatures(resp);
            },
            error: function (jqXHR, errorText, error) {
                Radio.trigger("Alert", "alert", error);
            }
        });
    },
    /**
     * Reads all features in the given data and stores it in the property wfsRaster
     * @param {Object} data of the wfs response
     * @returns {void}
     */
    readFeatures: function (data) {
        const format = new WFS(),
            features = format.readFeatures(data);

        this.setWfsRaster(features);
    },

    /**
     * Requests GraphicalSelect.featureToGeoJson.
     * It converts a feature to a geojson,
     * if the feature geometry is a circle, it is converted to a polygon.
     * @param {ol.Feature} feature - drawn feature
     * @fires Snippets.GraphicalSelect#featureToGeoJson
     * @returns {GeoJSON} the converted feature
     */
    featureToGeoJson: function (feature) {
        return Radio.request("GraphicalSelect", "featureToGeoJson", feature);
    },
    /**
     * Calculates the intersection of the graphical selection with the raster. The names of the intersected raster squares are returned.
     * @see {@link https://turfjs.org/docs/#intersect}
     * @returns {Array} names of the selected raster squares
     */
    calculateSelectedRasterNames: function () {
        const rasterLayerFeatures = this.get("wfsRaster"),
            selectedAreaGeoJson = this.get("graphicalSelectModel").get("selectedAreaGeoJson"),
            rasterNames = [];

        if (selectedAreaGeoJson) {
            const turfGeoSelection = turf.polygon([selectedAreaGeoJson.coordinates[0]]);

            rasterLayerFeatures.forEach(feature => {
                const turfRaster = turf.polygon([this.featureToGeoJson(feature).coordinates[0]]);

                if (turf.intersect(turfGeoSelection, turfRaster)) {
                    this.addFeaturenameToRasternames(feature, rasterNames);
                }
            });
        }
        this.set("rasterNames", rasterNames);
    },
    /**
     * Adds the name of the features tile to the given list of rasterNames.
     * @param {Object} feature to get the name of the tile from
     * @param {Array} rasterNames array to fill with unique names
     * @returns {void}
     */
    addFeaturenameToRasternames: function (feature, rasterNames) {
        if (feature && rasterNames) {
            const intersectedRasterName = feature.getProperties().kachel,
                result = rasterNames.find(rasterName => rasterName === intersectedRasterName);

            if (result === undefined) {
                rasterNames.push(intersectedRasterName);
            }
        }
    },
    /**
     * Collects the params to request the WMS for "Kacheln" and triggers the request.
     * @returns {void}
     */
    requestCompressedData: function () {
        this.calculateSelectedRasterNames();

        if (this.checkRasterNamesAmount()) {
            const adaptedNames = [],
                selectedRasterNames = this.get("rasterNames");

            selectedRasterNames.forEach(rasterName => {
                const adaptedName = rasterName.substring(0, 2) + "0" + rasterName.substring(2, 4) + "0";

                adaptedNames.push(adaptedName);
            });
            // params have to look like: "kacheln=650330§650340&type=JPG"
            this.doRequest("kacheln=" + adaptedNames.join("§") + "&type=" + this.get("selectedFormat"));
        }
    },
    /**
     * Checks the models "rasterNames":
     * If there are more than 9 tiles selected, the user is warned to reduce the selection.
     * If there are no tiles selected, the user is informed to select some.
     * @returns {Booelan} if check is okay to request server
     */
    checkRasterNamesAmount: function () {
        const selectedRasterNames = this.get("rasterNames");

        if (selectedRasterNames.length > this.get("selectedRasterLimit")) {
            Radio.trigger("Alert", "alert", {
                text: i18next.t("additional:modules.tools.sdpdownload.tooManyTilesSelected", {tilesCount: selectedRasterNames.length, maxTiles: this.get("selectedRasterLimit")}),
                kategorie: "alert-warning"
            });
            this.setRequesting(false);
            this.trigger("render");
            return false;
        }
        else if (selectedRasterNames.length === 0) {
            Radio.trigger("Alert", "alert", {
                text: "<strong>" + this.get("pleaseSelectTiles") + "</strong>",
                kategorie: "alert-info"
            });
            return false;
        }
        return true;
    },
    /**
     * Collects the params to request the WMS for island data.
     * @param {String} islandName name of the island
     * @returns {void}
     */
    requestCompressIslandData: function (islandName) {
        // params have to look like: "insel=Neuwerk&type=JPG"
        const params = "insel=" + islandName + "&type=" + this.get("selectedFormat");

        this.doRequest(params);
    },
    /**
     * Collects the params to load an overview.
     * @param {String} state the LS state
     * @returns {void}
     */
    requestCompressRasterOverviewData: function (state) {
        const temp = this.get("overviewDownloadLocation") + state + ".dwg",
            url = Radio.request("RestReader", "getServiceById", this.get("compressedFileId")).get("url");

        window.location.href = url + "?no_delete=1&mt=dwg&name=" + temp;
    },
    /**
     * Requests the WFS and loads the data down.
     * @param {String} params to specify the request
     * @returns {void}
     */
    doRequest: function (params) {
        let url = Radio.request("RestReader", "getServiceById", this.get("compressDataId")).get("url");

        if (window.location.hostname === "localhost") {
            url = Radio.request("Util", "getProxyURL", url);
        }
        $.ajax({
            url: url,
            data: encodeURI(params),
            context: this,
            type: "POST",
            beforeSend: function () {
                this.showLoader();
            },
            success: function (resp) {
                this.resetView();
                this.changeGraphicalSelectStatus(true);
                if (resp.indexOf("Fehler") > -1) {
                    Radio.trigger("Alert", "alert", {
                        text: "<strong>" + this.get("failedToDownload") + "</strong> <br> <small>" + this.get("details") + " " + resp + "</small>",
                        kategorie: "alert-warning"
                    });

                }
                else {
                    // download zip-file
                    window.location.href = Radio.request("RestReader", "getServiceById", this.get("compressedFileId")).get("url") + "?name=" + resp;
                    this.get("graphicalSelectModel").set("selectedAreaGeoJson", undefined);
                }
            },
            complete: function () {
                this.hideLoader();
            },
            timeout: 15000,
            error: function () {
                this.resetView();
                this.changeGraphicalSelectStatus(false);
                Radio.trigger("Alert", "alert", {
                    text: "<strong>" + this.get("failedToDownload") + "</strong> <br> <small>" + this.get("details") + " " + this.get("serviceNotResponding") + "</small>",
                    kategorie: "alert-warning"
                });
            }
        });
    },
    /**
     * Hides the loader by setting the requesting to false and renders the view.
     * @fires Addons.SdpDownloadModel#render
     * @returns {void}
     */
    hideLoader: function () {
        this.set("requesting", false);
        this.trigger("render");
    },
    /**
     * Shows the loader by setting the requesting to true and renders the view.
     * @fires Addons.SdpDownloadModel#render
     * @returns {void}
     */
    showLoader: function () {
        this.set("requesting", true);
        this.trigger("render");
    },
    /**
     * Sets the requesting
     * @param {Boolean} value true or false
     * @returns {void}
     */
    setRequesting: function (value) {
        this.set("requesting", value);
    },
    /**
     * Sets the selected format
     * @param {String} value SdpDownloadModel#defaults#formats
     * @returns {void}
     */
    setSelectedFormat: function (value) {
        this.set("selectedFormat", value);
    },
    /**
     * Sets the WFSRaster
     * @param {ol.feature} value the features of the WFSRaster
     * @returns {void}
     */
    setWfsRaster: function (value) {
        this.set("wfsRaster", value);
    },
    /**
     * Sets the graphicalSelectModel
     * @param {Snippets.GraphicalSelect.GraphicalSelectModel} value graphicalSelectModel
     * @returns {void}
     */
    setGraphicalSelectModel: function (value) {
        this.set("graphicalSelectModel", value);
    },
    /**
     * Sets the loaderPath
     * @param {String} value path to the loader gif
     * @returns {void}
     */
    setLoaderPath: function (value) {
        this.set("loaderPath", value);
    },
    /**
     * Sets the value to models property isSelected
     * @param {Boolean} value is selected or not
     * @returns {void}
     */
    setIsSelected: function (value) {
        this.set("isSelected", value);
    },
    /**
     * Sets the value to models property rasterNames
     * @param {Boolean} value rasterNames
     * @returns {void}
     */
    setSelectedRasternames: function (value) {
        this.set("rasterNames", value);
    }

});

export default SdpDownloadModel;
