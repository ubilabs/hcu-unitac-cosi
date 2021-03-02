import {generateSimpleGetters} from "../../../src/app-store/utils/generators";
import initialState from "./stateORS";
import * as Proj from "ol/proj";

export default {
    ...generateSimpleGetters(initialState),
    request: state => payload => ({
        mode: "cors",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": state.apiKey || ""
        },
        body: JSON.stringify(payload)
    }),
    requestBody: state => payload => {
        delete payload.profile;

        return {
            ...state.defaultRequestBody,
            ...payload
        };
    },
    geomTransformed: state => {
        let polygon,
            polygonArray = [];

        if (state.geoJson.length === 0) {
            return null;
        }

        for (let i = 0; i < state.geoJson?.length; i++) {
            polygon = state.geoJson?.[i].features[0].geometry.coordinates[0];
            polygon = polygon.map(coord => {
                return Proj.transform(coord, state.crs.service, state.crs.portal);
            });
            polygonArray = [...polygonArray, [polygon]];
        }


        return polygonArray ? polygonArray : null;
    }
};
