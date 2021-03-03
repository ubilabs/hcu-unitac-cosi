import {generateSimpleGetters} from "../../../src/app-store/utils/generators";
import initialState from "./stateORS";
import * as Proj from "ol/proj";

export default {
    ...generateSimpleGetters(initialState),
    profile: state => profile => (profile || state.defaultRequestProfile).replace("/", ""),
    service: state => service => (service || state.defaultRequestService).replace("/", ""),
    joinIsochrones: state => drawIsochrones => typeof drawIsochrones !== "undefined" ? drawIsochrones : state.defaultJoinIsochrones,
    request: state => payload => {
        const headers = {
            "Content-Type": "application/json"
        };

        if (state.apiKey) {
            headers.Authorization = state.apiKey;
        }

        return {
            mode: "cors",
            method: "POST",
            headers,
            body: JSON.stringify(payload)
        };
    },
    requestBody: state => payload => {
        const requestBody = {
            ...state.defaultRequestBody,
            ...payload
        };

        delete requestBody.profile;
        delete requestBody.service;
        delete requestBody.joinIsochrones;

        return requestBody;
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
