import {generateSimpleMutations} from "../../../src/app-store/utils/generators";
import initialState from "./stateOpenRouteService";

export default {
    ...generateSimpleMutations(initialState),

    /**
     * @description Sets a new geoJson to draw. Removes previous Features.
     * @param {object} state - the store state
     * @param {object} payload - the new geoJson
     * @returns {void}
     */
    setGeoJson (state, payload) {
        const geoJson = Array.isArray(payload) ? geoJson : [payload];

        state.geoJson.push(payload);
    },

    /**
     * @description Adds a new geojson to the feature list to draw
     * @param {object} state - the store state
     * @param {object} payload - the new geoJson
     * @returns {void}
     */
    addGeoJson (state, payload) {
        state.geoJson.push(payload);
    },

    /**
     * @description Removes the currently drawn geojson (if any)
     * @param {object} state - the store state
     * @returns {void}
     */
    resetGeoJson (state) {
        state.geoJson = [];
    }
};
