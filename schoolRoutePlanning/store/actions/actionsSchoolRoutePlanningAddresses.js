import {search} from "masterportalAPI/src/searchAddress/search";
import {Point} from "ol/geom.js";
import {sortObjectsByNestedAttributes} from "../../../../src/utils/sortObjects";

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
    }
};
