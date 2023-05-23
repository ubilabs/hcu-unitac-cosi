import axios from "axios";
import {Config} from "../../../config";

const actions = {
    /**
     * Addresses the WhatALocation visitor-types endpoint to get the data for the complete time range
     * @param {Object} commit actions commit object.
     * @param {String} locationId WHATALOCATION location id.
     * @returns {void}
     **/
    getVisitorTypes: async ({commit}, locationId) => {
        const url = `${Config.whatalocationApi.host}${Config.whatalocationApi.basepath}/visitor-types/?group_by[date]=&location_id=${locationId}&group_by[VisitorType]&format=agg&aggregate[Sum]=num_visitors&pulse=activate&interval=300&transportation=pedestrian`,
            options = {
                "Authorization": `Bearer ${Config.whatalocationApi.auth_token}`
            },
            response = await axios.get(url, {headers: options});

        commit("setVisitorTypes", response.data.data);
    }
};

export default actions;
