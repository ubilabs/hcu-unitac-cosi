import {fetch as fetchPolyfill} from "whatwg-fetch";

const OktagonGetFeatureInformationModel = Backbone.Model.extend(/** @lends OktagonGetFeatureInformationModel.prototype */{
    defaults: {
        returnURL: "",
        submitURL: "",
        layerId: "183",
        submitObject: {},
        glyphicon: "glyphicon-info-sign",
        name: "Hausnummernvergabe"
    },
    /**
     * @class OktagonGetFeatureInformationModel
     * @description Processes parameters that are specified via the URL.
     * @extends Backbone.Model
     * @memberOf Addons.OktagonKartenportal
     * @property {String} submitURL Contains the submit url
     * @property {String} layerId="183" Layerid for the GetFeatureInfo request
     * @property {Object} submitObject Object for the submit parameter
     * @property {String} glyphicon="glyphicon-info-sign" Icon for the sidebar header
     * @property {String} name="Hausnummernvergabe" Name of the sidebar
     * @fires OktagonURLParameter#RadioRequestOktagonURLParameterGetRueckURL
     * @fires ModelList#RadioRequestModelListGetModelByAttributes
     * @fires MapMarker#RadioTriggerMapMarkerZoomTo
     * @fires MapView#RadioRequestMapViewGetOptions
     * @fires Core#RadioRequestMapViewGetProjection
     * @fires Alerting#RadioTriggerAlertAlert
     * @constructs
     */
    initialize: function () {
        this.setReturnURL(Radio.request("OktagonURLParameter", "getRueckURL"));
    },
    /**
     * Gets the layerModel,
     * Zooms to the clicked coordinates
     * @param  {Array} coordinate contains the clicked map coordinates
     * @fires ModelList#RadioRequestModelListGetModelByAttributes
     * @fires MapMarker#RadioTriggerMapMarkerZoomTo
    * @returns {void}
     */
    onMapClick: function (coordinate) {
        const layerModel = Radio.request("ModelList", "getModelByAttributes", {id: this.get("layerId")});

        Radio.trigger("MapMarker", "zoomTo", {type: "SearchByCoord", coordinate: coordinate});
        this.addCoordinatesToSubmitObject(coordinate);
        this.requestALKISWMS(layerModel, coordinate);
    },
    /**
     * Requests the ALKIS WMS and starts to parse the xml response
     * @param  {Object} layerModel contains the layer model
     * @param  {Array} coordinate contains the clicked map coordinates
     * @fires MapView#RadioRequestMapViewGetOptions
     * @fires Core#RadioRequestMapViewGetProjection
     * @fires Alert#RadioTriggerAlertAlert
    * @returns {void}
     */
    requestALKISWMS: function (layerModel, coordinate) {
        const resolution = Radio.request("MapView", "getOptions").resolution,
            projection = Radio.request("MapView", "getProjection"),
            url = layerModel.get("layerSource").getGetFeatureInfoUrl(coordinate, resolution, projection, {INFO_FORMAT: "text/xml", STYLES: ""});

        fetchPolyfill(url)
            .then(response => response.text())
            .then(responseAsString => new window.DOMParser().parseFromString(responseAsString, "text/xml"))
            .then(responseXML => {
                this.parseXML(responseXML);
            })
            .catch(error => {
                console.warn("The fetch of the data failed with the following error message: " + error);
                Radio.trigger("Alert", "alert", {
                    text: "<strong>" + i18next.t("common:modules.vectorStyle.styleModel.getGeometryTypeFromWFSFetchfailed") + "</strong> <br>"
                        + "<small>" + i18next.t("common:modules.vectorStyle.styleModel.getGeometryTypeFromWFSFetchfailedMessage") + "</small>",
                    kategorie: "alert-warning"
                });
            });
    },
    /**
     * Parses the xml response
     * @param  {Object} xml contains the response xml
    * @returns {void}
     */
    parseXML: function (xml) {
        const xmlElements = Array.from(xml.getElementsByTagName("FIELDS")),
            submitObject = this.get("submitObject");

        xmlElements.forEach(xmlElement => {
            if (xmlElement.getAttribute("Baublock")) {
                submitObject.Baublock = xmlElement.getAttribute("Baublock");
            }
            if (xmlElement.getAttribute("Gemarkungsname")) {
                submitObject.Gemarkungsname = xmlElement.getAttribute("Gemarkungsname");
            }
            if (xmlElement.getAttribute("Gemarkungsnummer")) {
                submitObject.Gemarkungsnummer = xmlElement.getAttribute("Gemarkungsnummer");
            }
            if (xmlElement.getAttribute("Flurstuecksnummer")) {
                submitObject.Flurstuecksnummer = xmlElement.getAttribute("Flurstuecksnummer");
            }
        });
        this.setSubmitObject(submitObject);
        this.setSubmitURL(this.createSubmitURL(submitObject));
    },
    /**
     * Creates the submit url
     * @param  {Object} submitObject contains the submit parameters
    * @returns {String} returns the submit url
     */
    createSubmitURL: function (submitObject) {
        let submitURL = this.get("returnURL");

        if (submitURL && submitURL.includes("?")) {
            submitURL += "&";
        }
        else {
            submitURL += "?";
        }
        Object.keys(submitObject).forEach((prop, index) => {
            if (index > 0) {
                submitURL += "&";
            }
            submitURL += prop + "=" + submitObject[prop];
        });

        return submitURL;
    },
    /**
     * Adds the coordinate parameters to the submit object
     * @param  {Array} coordinate contains clicked coordinates
    * @returns {void}
     */
    addCoordinatesToSubmitObject: function (coordinate) {
        const submitObject = this.get("submitObject");

        submitObject.KoordinateX = Radio.request("Util", "punctuate", coordinate[0]).replace(/\./g, "");
        submitObject.KoordinateY = Radio.request("Util", "punctuate", coordinate[1]).replace(/\./g, "");

        this.setSubmitObject(submitObject);
    },
    /**
     * Setter for returnURL
     * @param {*} value - todo
     * @returns {void}
     */
    setReturnURL: function (value) {
        this.set("returnURL", value);
    },
    /**
     * Setter for submitURL
     * @param {*} value - todo
     * @returns {void}
     */
    setSubmitURL: function (value) {
        this.set("submitURL", value);
    },
    /**
     * Setter for submitObject
     * @param {*} value - todo
     * @returns {void}
     */
    setSubmitObject: function (value) {
        this.set("submitObject", value);
    }
});

export default OktagonGetFeatureInformationModel;
