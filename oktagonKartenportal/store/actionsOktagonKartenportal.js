import {search} from "@masterportal/masterportalapi/src/searchAddress";
import thousandsSeparator from "../../../src/utils/thousandsSeparator";

export default {
    /**
    * Adds the coordinate parameters to the submit object
    * @param  {Array} coordinate contains clicked coordinates
    * @returns {void}
    */
    addCoordinatesToSubmitObject ({getters, commit}, coordinate) {
        const submitObject = getters.submitObject;

        submitObject.KoordinateX = thousandsSeparator(coordinate[0]).replace(/\./g, "");
        submitObject.KoordinateY = thousandsSeparator(coordinate[1]).replace(/\./g, "");

        commit("setSubmitObject", submitObject);
    },
    /**
    * Trigger an alert for wrong input Parameters.
    * @returns {void}
    */
    alertWrongInputParameters ({dispatch}) {
        dispatch("Alerting/addSingleAlert",
            "<strong>" + i18next.t("additional:modules.tools.oktagon.wrongAddressParameter") + "</strong>"
            + "<br>"
            + "<small>" + i18next.t("additional:modules.tools.oktagon.wrongAddressParameterMessage") + "</small>",
            {root: true}
        );
    },
    /**
    * Assembles the address from the URL parameters.
    * @param {Object} result - The url parameters.
    * @returns {void}
    */
    createAddress({dispatch, commit, getters}, result) {
        let address = getters.getParameterValue({result: result, property: "STRASSE"}),
        searchParams = {
            searchStreets: true
        };

        if (result?.HAUSNUMMER && result.HAUSNUMMER.length > 0) {
            address += " "+ getters.getParameterValue({result: result, property: "HAUSNUMMER"});
            searchParams.searchAddress = true;
        }
        if (result?.ZUSATZ) {
            address += getters.getParameterValue({result: result, property: "ZUSATZ"});
            searchParams.searchAddress = true;
        }

        commit("setAddress", address.toUpperCase());
        dispatch("startSearch", {searchInput: address, searchParams: searchParams});
    },
    /**
    * Handles the wms response.
    * @param {Object} response The wms response.
    * @returns {void}
    */
    handleResponse ({dispatch ,getters}, response) {
        const result = response.find(element => element.name.toUpperCase() === getters.address);

        dispatch("zoomToAddress", result?.geometry?.coordinates);
    },

    /**
    * Processes the url parameter.
    * @returns {void}
    */
    initURLParameter ({dispatch, commit, getters}) {
        const result = {};
        let query = window.location.search.substring(1),
            rueckURLParameter = "";

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
            commit("setReturnURL", rueckURLParameter.slice(rueckURLParameter.indexOf("=") + 1));
        }

        if (result?.BEZIRK) {
            const districtFromUrl = getters.getParameterValue({result: result, property: "BEZIRK"});
            let districtNameToZoom = "";

            districtNameToZoom = getters.hasBezirk(districtFromUrl);
            if (districtNameToZoom === "") {
                dispatch("Alerting/addSingleAlert",
                    "<strong>" + i18next.t("additional:modules.tools.oktagon.wrongDistrictName") + "</strong>"
                    + "<br>"
                    + "<small>" + i18next.t("additional:modules.tools.oktagon.wrongDistrictNameMessage") + districtFromUrl + ".</small>",
                    {root: true}
                );
            }
            else {
                commit("ZoomTo/setZoomToGeometry", districtNameToZoom, {root: true});
                dispatch("ZoomTo/zoomToFeatures", {}, {root: true});
            }
        }
        else if (result?.STRASSE) {
            dispatch("createAddress", result);
        }
    },
    /**
    * Parses the xml response
    * @param  {Object} xml contains the response xml
    * @returns {void}
    */
     parseXML ({getters, commit}, xml) {
        const xmlElements = Array.from(xml.getElementsByTagName("FIELDS")).length > 0 ? Array.from(xml.getElementsByTagName("FIELDS")) : Array.from(xml.getElementsByTagName("app:baubloecke")),
            submitObject = getters.submitObject;

        xmlElements.forEach(xmlElement => {
            if (xmlElement.getElementsByTagName("app:baublockbezeichnung").length > 0) {
                submitObject.Baublock = xmlElement.getElementsByTagName("app:baublockbezeichnung")[0].textContent;
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

        commit("setSubmitURL", getters.createSubmitURL(submitObject));
        commit("setSubmitObject", {});
        commit("setSubmitObject", submitObject);
    },
    /**
     * Starts the search via the MasterportalAPI
     * @param {String} searchInput The search input.
     * @param {Object} searchParams The search parameter.
     * @returns {void}
     */
    startSearch ({dispatch}, searchObject) {
        search(searchObject.searchInput, searchObject.searchParams, true)
            .then((searchResults) => {
                dispatch("handleResponse", searchResults);
            })
            .catch(error => {
                if (String(error) !== "AbortError: The user aborted a request.") {
                    console.error(error);
                }
            });
    },
    /**
    * Zooms the map to the address.
    * @param {Object} data xml object.
    * @returns {void}
    */
    zoomToAddress ({dispatch}, coordinates) {
        const coordinatesArray = [];

        if (coordinates && coordinates !== null) {

            if (coordinates && Array.isArray(coordinates)) {
                coordinates.forEach(coordinate => {
                    coordinatesArray.push(parseFloat(coordinate));
                });
            }

            dispatch("Maps/setCenter", coordinatesArray, {root: true});
            dispatch("Maps/setZoomLevel", 9, {root: true});
            dispatch("MapMarker/placingPointMarker", coordinatesArray, {root: true});
        }
        else {
            dispatch("alertWrongInputParameters");
        }
    }
};
