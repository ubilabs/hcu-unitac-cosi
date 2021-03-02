import {generateSimpleMutations} from "../../../src/app-store/utils/generators";
import initialState from "./stateORS";
import * as Proj from "ol/proj";

export default {
    ...generateSimpleMutations(initialState),
    setRequestData (state, payload) {
        payload.locations = payload.locations.map(l => Proj.transform(l, state.crs.portal, state.crs.service));
        state.requestData = payload;
    },
    setGeoJson (state, payload) {
        state.geoJson.push(payload);
    },
    resetGeoJson (state) {
        state.geoJson = [];
    }
};
