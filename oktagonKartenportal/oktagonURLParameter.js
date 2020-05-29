import ParametricURL from "../../modules/core/parametricURL";

const OktagonURLParameter = ParametricURL.extend(/** @lends OktagonURLParameter.prototype */{
    defaults: {
        rueckURL: ""
    },
    /**
     * @class OktagonURLParameter
     * @description Processes parameters that are specified via the URL.
     * @extends ParametricURL
     * @memberOf Addons.OktagonKartenportal
     * @property {String} rueckURL Parameter for the submit url.
     * @listens ParametricURL#RadioRequestOktagonURLParameterGetRueckURL
     * @listens Gaz#RadioRequestGazGetAdress
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Gaz#RadioTriggerGazAdressSearch
     * @fires MapMarker#RadioTriggerMapMarkerZoomTo
     * @fires Util#RadioTriggerUtilPick
     * @constructs
     */
    initialize: function () {
        const result = {},
            channel = Radio.channel("OktagonURLParameter"),
            adress = {};
        let query = location.search.substr(1),
            rueckURLParameter = "";

        channel.reply({
            "getRueckURL": function () {
                return this.get("rueckURL");
            }
        }, this);

        this.listenTo(Radio.channel("Gaz"), {
            "getAdress": this.triggerZoomToAdress
        });
        if (query.indexOf("rueckurl") > 0) {
            rueckURLParameter = query.slice(query.indexOf("rueckurl"));
            query = query.slice(0, query.indexOf("&rueckurl"));
        }
        query = query.toUpperCase();
        query.split("&").forEach(function (keyValue) {
            const item = keyValue.split("=");

            result[item[0]] = decodeURIComponent(item[1]);
        });

        if (rueckURLParameter.length > 0) {
            this.setRueckURL(rueckURLParameter.slice(rueckURLParameter.indexOf("=") + 1));
        }
        if (result.hasOwnProperty("BEZIRK")) {
            const districtFromUrl = this.getParameterValue(result, "BEZIRK");
            let districtNameToZoom = "";

            districtNameToZoom = this.hasBezirk(districtFromUrl);
            if (districtNameToZoom === "") {
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Der Parametrisierte Aufruf des Portals ist leider schief gelaufen!</strong>"
                    + "<br>"
                    + "<small>Der Parameter BEZIRK=" + districtFromUrl + " existiert nicht.</small>",
                    kategorie: "alert-warning"
                });
            }
            else {
                Radio.trigger("ZoomToGeometry", "zoomToGeometry", districtNameToZoom, Config.zoomToGeometry.layerId, Config.zoomToGeometry.attribute);
            }
        }
        else if (result.hasOwnProperty("STRASSE")) {
            adress.streetname = this.getParameterValue(result, "STRASSE");

            if (result.hasOwnProperty("HAUSNUMMER")) {
                adress.housenumber = this.getParameterValue(result, "HAUSNUMMER");
            }
            if (result.hasOwnProperty("ZUSATZ")) {
                adress.affix = this.getParameterValue(result, "ZUSATZ");
            }
            if (adress.streetname && adress.housenumber) {
                Radio.trigger("Gaz", "adressSearch", adress);
            }
            else {
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Der Parametrisierte Aufruf des Portals ist leider schief gelaufen!</strong>"
                    + "<br>"
                    + "<small>Der Parameter Strasse=" + adress.streetname + " oder Hausnummer=" + adress.housenumber + "ist nicht angegeben.</small>",
                    kategorie: "alert-warning"
                });
            }
        }
    },
    /**
     * Handels the Bezirk URL parameter
     * @param {String} districtFromUrl contains the "Bezirk" URL String.
     * @returns {void} returns the distirct string if it exists in config.
     */
    hasBezirk: function (districtFromUrl) {
        let geometries,
            districtNameToZoom = "";

        if (Config.hasOwnProperty("zoomToGeometry") && Config.zoomToGeometry.hasOwnProperty("geometries")) {
            geometries = Config.zoomToGeometry.geometries;

            if (geometries.includes(districtFromUrl.toUpperCase())) {
                districtNameToZoom = districtFromUrl.toUpperCase();
            }
        }
        return districtNameToZoom;
    },
    /**
     * Zomms the map to the adress
     * @param {Object} data xml object.
     * @fires MapMarker#RadioTriggerMapMarkerZoomTo
     * @returns {void}
     */
    triggerZoomToAdress: function (data) {
        const gages = $("gages\\:Hauskoordinaten,Hauskoordinaten", data)[0],
            coordinates = $(gages).find("gml\\:pos, pos")[0].textContent.split(" ");
        let coordinatesArray = [];

        coordinatesArray = this.parseCoordinatesToFloat(coordinates);

        Radio.trigger("MapMarker", "zoomTo", {type: "SearchByCoord", coordinate: coordinatesArray});
    },
    /**
     * Returns the parameter value
     * @param {Object} result xml object.
     * @param {String} property xml object.
     * @fires Util#RadioTriggerUtilPick
     * @returns {String} returns the parmeter value
     */
    getParameterValue: function (result, property) {
        return Object.values(Radio.request("Util", "pick", result, [property]))[0];
    },
    /**
     * Parses the coordinates to float
     * @param {Array} coordinates contains the coordinates.
     * @fires MapMarker#RadioTriggerMapMarkerZoomTo
     * @returns {Array} array with coordinates
     */
    parseCoordinatesToFloat: function (coordinates) {
        const coordinatesArray = [];

        if (coordinates && Array.isArray(coordinates)) {
            coordinates.forEach(coordinate => {
                coordinatesArray.push(parseFloat(coordinate));
            });
        }
        return coordinatesArray;
    },
    /**
     * Setter for rueckURL.
     * @param {String} value Contains the submit url
     * @returns {void}
     */
    setRueckURL: function (value) {
        this.set("rueckURL", value);
    }
});

export default OktagonURLParameter;
