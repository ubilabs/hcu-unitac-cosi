import {generateSimpleMutations} from "../../../src/app-store/utils/generators";
import initialState from "./stateOpenRouteService";

export default {
    ...generateSimpleMutations(initialState),
    setGeoJson (state, payload) {
        const geoJson = Array.isArray(payload) ? geoJson : [payload];

        state.geoJson.push(payload);
    },
    addGeoJson (state, payload) {
        state.geoJson.push(payload);
    },
    resetGeoJson (state) {
        state.geoJson = [];
    }
};
