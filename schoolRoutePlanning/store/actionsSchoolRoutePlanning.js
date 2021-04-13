import {search} from "masterportalAPI/src/searchAddress/search";
import {Point} from "ol/geom.js";

export default {
    processInput ({dispatch}, inputs) {
        const input = inputs.evt.target.value,
            layer = inputs.layer;

        console.log("-------------");

        if (input.slice(-1) === " ") {
            console.log("empty");
        }
        else if (!isNaN(input.slice(-1))) {
            console.log("filterHouseNumbers");
            dispatch("filterHouseNumbers", {input, layer});
        }
        else if (input.length > 2) {
            console.log("searchStreets");
            dispatch("searchStreets", input);
        }
    },

    searchStreets ({commit}, input) {
        search(input, {
            map: Radio.request("Map", "getMap"),
            searchStreets: true
        }).then(streets => {
            commit("setStreetNames", streets.map(street => street.name).sort());
        });
    },

    searchHousenumbers ({commit}, streetName) {
        commit("setStreetNames", [streetName]);
        commit("setInputAddress", streetName);

        search(streetName, {
            map: Radio.request("Map", "getMap"),
            searchStreets: true,
            searchHouseNumbers: true
        }).then(response => {
            const houseNumbers = response.filter(value => value.type === "houseNumbersForStreet");

            commit("setHouseNumbers", houseNumbers);
            commit("setFilteredHouseNumbers", houseNumbers);
        });
    },

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
     * @param {string} targetElement.featureId Id of the feature (startPoint | endPoint).
     * @param {ol.source} targetElement.source Vector source of the route layer.
     * @param {string} targetElement.geometry Geometry of the feature.
     * @returns {void}
     */
    setGeometryByFeatureId ({commit}, targetElement) {
        const geometry = targetElement.geometry,
            source = targetElement.source,
            featureId = targetElement.id;

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

    searchRegionalPrimarySchool ({commit}, address) {
        search(address, {
            map: Radio.request("Map", "getMap"),
            searchAddress: true
        }).then(response => {
            commit("setRegionalPrimarySchool", response[0].properties.grundschulnr);
        });
    }
};
