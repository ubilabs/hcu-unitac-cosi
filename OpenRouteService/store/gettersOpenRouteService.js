import {generateSimpleGetters} from "../../../src/app-store/utils/generators";
import initialState from "./stateOpenRouteService";
import * as Proj from "ol/proj";

export default {
    ...generateSimpleGetters(initialState),

    /**
     * @description Returns the profile of the current request or the default.
     * @param {String} [state] - the profile specified in the request
     * @returns {String} the current profile (foot-walking | driving-car | cycling-regular | etc)
     */
    profile: state => profile => (profile || state.defaultRequestProfile).replace("/", ""),

    /**
     * @description Returns the service of the current request or the default.
     * @param {String} [state] - the service specified in the request
     * @returns {String} the current service (isochrones | matrix | directions)
     */
    service: state => service => (service || state.defaultRequestService).replace("/", ""),

    /**
     * @description Returns whether isochrones on the same level should be joined if they intersect, can be defined in the request
     * @param {Boolean} [state] - the joinIsochrones boolean of the request
     * @returns {Boolean} the current joinIsochrones value
     */
    joinIsochrones: state => joinIsochrones => typeof joinIsochrones !== "undefined" ? joinIsochrones : state.defaultJoinIsochrones,

    /**
     * @description merges the current request body with the default POST-request settings
     * @param {Object} state - the requestBody to send
     * @returns {Object} the POST-ready request options, incl. body
     */
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

    /**
     * @description creates a readable, clean requestBody for OpenRouteService API
     * @param {Object} state - the request options (body) send to the module
     * @returns {Object} the clean requestBody
     */
    requestBody: state => payload => {
        const requestBody = {
            ...state.defaultRequestBody,
            ...payload
        };

        // remove unreadable properties that may be present on the incoming action-payload
        // make sure the object is a COPY not a REFERENCE
        delete requestBody.profile;
        delete requestBody.service;
        delete requestBody.joinIsochrones;

        return requestBody;
    },

    /**
     * Returns the incoming geoJson with transformed coordinates from OpenRouteService CRS to portal CRS
     * @param {Object} state - the store state
     * @returns {Object} the transformed geoJson
     */
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
