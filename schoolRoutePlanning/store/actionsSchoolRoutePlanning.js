import {search} from "masterportalAPI/src/searchAddress/search";
import {Point} from "ol/geom.js";
import {MultiLineString} from "ol/geom.js";
import {WKT} from "ol/format.js";
import WPS from "../../../src/api/wps";
import LoaderOverlay from "../../../src/utils/loaderOverlay";
import {sortObjectsByNestedAttributes} from "../../../src/utils/sortObjects";
import thousandsSeparator from "../../../src/utils/thousandsSeparator";
import BuildSpecModel from "../../../modules/tools/print/buildSpec";

export default {
    /**
     * Starts the processing of the entered address part or address.
     * @param {Object} context The vuex context.
     * @param {String} inputs The input part of an address.
     * @returns {void}
     */
    processInput ({dispatch}, inputs) {
        const input = inputs.evt.target.value,
            layer = inputs.layer;

        if (input.slice(-1) !== " ") {
            if (!isNaN(input.slice(-1))) {
                dispatch("filterHouseNumbers", {input, layer});
            }
            else if (input.length > 2) {
                dispatch("searchStreets", input);
            }
        }
    },

    /**
     * Search for streets that contains the input.
     * @param {Object} context The vuex context.
     * @param {String} input The inout part of a streetname.
     * @returns {void}
     */
    searchStreets ({commit}, input) {
        search(input, {
            map: Radio.request("Map", "getMap"),
            searchStreets: true
        }).then(streets => {
            commit("setStreetNames", streets.map(street => street.name).sort());
        });
    },

    /**
     * Search house number for a street name.
     * @param {Object} context The vuex context.
     * @param {String} streetName The streetname to search for housenumbers.
     * @returns {void}
     */
    searchHousenumbers ({commit}, streetName) {
        commit("setStreetNames", [streetName]);
        commit("setInputAddress", streetName);

        search(streetName, {
            map: Radio.request("Map", "getMap"),
            searchStreets: true,
            searchHouseNumbers: true
        }).then(response => {
            const houseNumbers = response.filter(value => value.type === "houseNumbersForStreet"),
                sortedHouseNumbers = sortObjectsByNestedAttributes(houseNumbers, ["properties.hausnummernzusatz._", "properties.hausnummer._"]);

            commit("setHouseNumbers", sortedHouseNumbers);
            commit("setFilteredHouseNumbers", sortedHouseNumbers);
        });
    },

    /**
     * Filters by the address in the already loaded house numbers.
     * @param {Object} context The vuex context.
     * @param {Object} inputs The inputs.
     * @param {String} inputs.input The input address.
     * @param {ol/Source} inputs.layer Vector source of the route layer.
     * @returns {void}
     */
    filterHouseNumbers ({state, commit, dispatch}, inputs) {
        const input = inputs.input,
            filteredHouseNumbers = state.houseNumbers.filter(houseNumber => houseNumber.name.search(input) !== -1);

        commit("setInputAddress", input);

        if (filteredHouseNumbers.length === 1) {
            dispatch("setGeometryByFeatureId", {
                id: "startPoint",
                source: inputs.layer.getSource(),
                geometry: new Point(filteredHouseNumbers[0].geometry.coordinates)
            });
            dispatch("searchRegionalPrimarySchool", filteredHouseNumbers[0].name);
        }
        else {
            commit("setFilteredHouseNumbers", state.houseNumbers.filter(houseNumber => houseNumber.name.search(input) !== -1));
        }
    },

    /**
     * Find the house number to an input address.
     * @param {Object} context The vuex context.
     * @param {Object} inputs The inputs.
     * @param {String} inputs.input The input address.
     * @param {ol/Source} inputs.layer Vector source of the route layer.
     * @returns {void}
     */
    findHouseNumber ({state, commit, dispatch}, inputs) {
        const input = inputs.input,
            foundHouseNumber = state.houseNumbers.find(houseNumber => houseNumber.name === input);

        commit("setInputAddress", input);

        dispatch("setGeometryByFeatureId", {
            id: "startPoint",
            source: inputs.layer.getSource(),
            geometry: new Point(foundHouseNumber.geometry.coordinates)
        });
        dispatch("searchRegionalPrimarySchool", foundHouseNumber.name);
    },

    /**
     * Sets the geometry for the route features and zoom to the feature extent.
     * @param {Object} context The vuex context.
     * @param {Object} targetElement The payload element.
     * @param {String} targetElement.featureId Id of the feature (startPoint | endPoint).
     * @param {ol/Source} targetElement.source Vector source of the route layer.
     * @param {String} targetElement.geometry Geometry of the feature.
     * @returns {void}
     */
    setGeometryByFeatureId ({commit}, targetElement) {
        const featureId = targetElement.id,
            source = targetElement.source,
            geometry = targetElement.geometry;

        commit("setFilteredHouseNumbers", []);

        source.getFeatureById(featureId).setGeometry(geometry);
        if (geometry.getType() === "Point") {
            Radio.trigger("MapView", "setCenter", geometry.getCoordinates(), 6);
        }
        else {
            Radio.trigger("Map", "zoomToExtent", source.getExtent());
        }
        Radio.trigger("MapView", "setZoomLevelDown");
    },

    /**
     * Search for the reginal primary school to the given address.
     * @param {Object} context The vuex context.
     * @param {String} address The address to search the regional primary school
     * @returns {void}
     */
    searchRegionalPrimarySchool ({commit}, address) {
        search(address, {
            map: Radio.request("Map", "getMap"),
            searchAddress: true
        }).then(response => {
            commit("setRegionalPrimarySchool", response[0].properties.grundschulnr);
        });
    },

    /**
     * Select the school from school list and adds to the schoolway vector layer.
     * @param {Object} context The vuex context.
     * @param {Object} payload The payload for select school.
     * @param {Object} payload.event The click event.
     * @param {Object} payload.event.target The targets of click event.
     * @param {Object} payload.event.target.value The selected school id.
     * @param {ol/vectorLayer} payload.layer The vector layer for schoolway features.
     * @returns {void}
     */
    selectSchool ({state, commit, dispatch}, payload) {
        const selectedHouseNumber = state.houseNumbers.find(houseNumber => houseNumber.name === state.inputAddress),
            selectedSchoolId = payload.event.target.value;

        if (selectedHouseNumber && selectedSchoolId) {
            const selectedSchool = state.schools.find(school => school.get("schul_id") === selectedSchoolId);

            commit("setSelectedSchool", selectedSchool);
            dispatch("setGeometryByFeatureId", {
                id: "endPoint",
                source: payload.layer.getSource(),
                geometry: selectedSchool.getGeometry()
            });
            dispatch("prepareWayToSchoolRequest", {selectedHouseNumber, selectedSchoolId});
        }
    },

    /**
     * Builds the payload for wps to request the schoolway.
     * @param {Object} context The vuex context.
     * @param {Object} payload The payload for select school.
     * @param {Object} payload.selectedHouseNumber The selected house number of the student.
     * @param {Object} payload.selectedSchoolId The selected school id.
     * @returns {void}
     */
    prepareWayToSchoolRequest ({state, dispatch}, payload) {
        const wpsPayload = {
            "Schul-ID": {
                "dataType": "string",
                "value": payload.selectedSchoolId
            },
            "SchuelerStrasse": {
                "dataType": "string",
                "value": state.streetNames[0]
            },
            "SchuelerHausnr": {
                "dataType": "integer",
                "value": parseInt(payload.selectedHouseNumber?.properties?.hausnummer._, 10)
            },
            "SchuelerZusatz": {
                "dataType": "string",
                "value": payload.selectedHouseNumber?.properties?.hausnummernzusatz?._ || ""
            },
            "RouteAusgeben": {
                "dataType": "boolean",
                "value": 1
            },
            "tm_ttl": {
                "dataType": "integer",
                "value": 50
            }
        };

        dispatch("requestWayToSchool", wpsPayload);
    },

    /**
     * Request the  schoolway from trhough a wps.
     * @param {Object} context The vuex context.
     * @param {Object} wpsPayload The payload for the wps  that contains data to student and school.
     * @returns {void}
     */
    requestWayToSchool ({state, dispatch}, wpsPayload) {
        LoaderOverlay.show();
        WPS.wpsRequest(
            state.wpsId,
            state.fmwProcess,
            wpsPayload,
            (response, status) => dispatch("parseResponseWayToSchool", {response, status}),
            50000
        );

    },

    /**
     * Parses the schoolway response data of the wps.
     * @param {Object} context The vuex context.
     * @param {Object} payload The schoolway response data.
     * @returns {void}
     */
    parseResponseWayToSchool ({dispatch}, payload) {
        LoaderOverlay.hide();
        const routeElements = payload?.response?.ExecuteResponse?.ProcessOutputs?.Output?.Data?.ComplexData?.Schulweg?.Ergebnis;

        if (routeElements === undefined) {
            dispatch("Alerting/addSingleAlert", i18next.t("additional:modules.tools.schoolRoutePlanning.responseError", {
                errorMessage: payload.response.ExecuteResponse.ProcessOutputs.Output.Data.ComplexData.serviceResponse.statusInfo.message
            }), {root: true});
        }
        else if (payload.status === 200 && routeElements?.ErrorOccured === "no") {
            dispatch("parseRouteElements", routeElements);

        }
        else {
            dispatch("Alerting/addSingleAlert", i18next.t("additional:modules.tools.schoolRoutePlanning.wpsError", {status: routeElements.status}), {root: true});
        }
    },

    /**
     * Parse the route elments and start parse route.
     * @param {Object} context The vuex context.
     * @param {Object} routeElements The route elements of the schoolway.
     * @returns {void}
     */
    parseRouteElements ({commit, dispatch}, routeElements) {
        const routeDescription = routeElements.routenbeschreibung.part,
            routeEdges = routeElements.route.edge;

        commit("setRouteElements", routeElements);
        commit("setRouteDescription", Array.isArray(routeDescription) ? routeDescription : [routeDescription]);
        commit("setRouteLength", thousandsSeparator(routeElements.kuerzesteStrecke) + "m");
        dispatch("parseRoute", Array.isArray(routeEdges) ? routeEdges : [routeEdges]);
    },

    /**
     * Creates one MultiLineString geometry from the routing parts.
     * @param {Object} context The vuex context.
     * @param {Object[]} routeEdges The routing edges including wkt geometry
     * @returns {void}
     */
    parseRoute ({commit}, routeEdges) {
        const wktParser = new WKT(),
            multiLineString = new MultiLineString({});

        routeEdges.forEach(routePart => {
            multiLineString.appendLineString(wktParser.readGeometry(routePart.wkt));
        });

        commit("setRouteGeometry", multiLineString);
    },

    /**
     * Prints the route via the print module.
     * @param {Object} context The vuex context.
     * @returns {void}
     */
    printRoute ({state, rootState}) {
        const routeElements = state.routeElements,
            visibleLayerList = rootState.Map.layerList.filter(layer => layer.getVisible() === true),
            attributes = {
                "layout": state.printLayout,
                "outputFormat": state.printOutputFormat,
                "attributes": {
                    "title": state.printTitle,
                    "length": `${routeElements.kuerzesteStrecke}m`,
                    "address": state.inputAddress,
                    "school": `${state.selectedSchool.get("schulname")}, ${routeElements.SchuleingangTyp} (${routeElements.SchuleingangAdresse})`,
                    "map": {
                        "dpi": state.printDpi,
                        "projection": Radio.request("MapView", "getProjection").getCode(),
                        "center": Radio.request("MapView", "getCenter"),
                        "scale": Radio.request("MapView", "getOptions").scale
                    },
                    "datasource": [{
                        "table": {
                            "columns": ["index", "description"],
                            "data": state.routeDescription
                        }
                    }]
                }
            };

        let buildSpec = new BuildSpecModel(attributes);

        buildSpec.buildLayers(visibleLayerList);
        buildSpec = buildSpec.toJSON();

        Radio.trigger("Print", "createPrintJob", encodeURIComponent(JSON.stringify(buildSpec)), "schulwegrouting", "pdf");
    }
};
