import apiEndpointService from "../../apiEndpointService";

const actions = {
    /**
     * Addresses the WhatALocation visitor-types endpoint to get the data for the complete time range
     * @param {Object} state the stores state object.
     * @param {Object} commit actions commit object.
     * @returns {void}
     **/
    getVisitorTypes: async ({state, commit}) => {
        commit("setLoader", true);

        const response = await apiEndpointService.receiveVisitorTypes(state.selectedLocationId);

        commit("setVisitorTypes", response.data.data);
        commit("setLoader", false);
    }
};

export default actions;
