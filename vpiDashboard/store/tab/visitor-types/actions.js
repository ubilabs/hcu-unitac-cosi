import axios from "axios";
import {Config} from "../../../config";
import {buildEndpointUrl} from "../../../utils/buildEndpointUrl";

const actions = {
    /**
     * Addresses the WhatALocation visitor-types endpoint to get the data for the complete time range
     * @param {Object} state the stores state object.
     * @param {Object} commit actions commit object.
     * @returns {void}
     **/
    getVisitorTypes: async ({state, commit}) => {
        commit("setLoader", true);

        const
            url = `${Config.whatalocationApi.host}${Config.whatalocationApi.basepath}/visitor-types/`,
            locationId = state.selectedLocationId,
            query = {
                "location_id": locationId,
                "group_by[date]": null,
                "group_by[VisitorType]": null,
                "aggregate[Sum]": "num_visitors",
                "format": "agg",
                "pulse": false,
                "use_zone": true,
                "transportation": "pedestrian"
            },
            response = await axios.get(
                buildEndpointUrl(url, query)
            );

        commit("setVisitorTypes", response.data.data);
        commit("setLoader", false);
    }
};

export default actions;
