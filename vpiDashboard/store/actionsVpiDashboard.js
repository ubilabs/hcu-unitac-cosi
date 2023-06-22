import tabVisitorTypesActions from "./tab/visitor-types/actions";
import tabCompareDatesActions from "./tab/compare/dates/actions";
import apiEndpointService from "./apiEndpointService";

const actions = {

    ...tabVisitorTypesActions,
    ...tabCompareDatesActions,

    /**
     * Addresses the WhatALocation locations endpoint to get all locations
     * @param {Object} commit actions commit object.
     * @returns {Object} data returned by the endpoint
     **/
    getAllLocations: async ({commit}) => {

        commit("setLoader", true);

        const
            response = await apiEndpointService.receiveAllSummary();

        commit("setAllLocationsGeoJson", Object.values(response.data));
        commit("setLoader", false);

        return response.data;
    },
    /**
     * Addresses the WhatALocation endpoint to get aggregated values for unique visitors for the complete data collection range
     * @param {Object} state the store's state and commit object.
     * @returns {void}
     **/
    getActivities: async ({state, commit}) => {
        if (state.selectedLocationId !== "") {
            commit("setLoader", true);

            const
                response = await apiEndpointService.receiveActivities(state.selectedLocationId);

            // Tab "Activities", Card: "unique daily visitors per month"
            commit("setAverageVisitorsPerMonth", response.data);

            // Tab "Activities", Card: "unique daily visitors on a"
            commit("setAverageVisitorsPerDay", response.data);

            // Tab "Activities", Card: "unique weekly visitors in the year"
            commit("setIndividualVisitorsPerYear", response.data);

            // Tab "Activities", Dropdown: "Activities"
            commit("setBarChartData", response.data);
            commit("setLineChartData", response.data);

            // Tab "Activities", Dropdown: "Average of daily activities"
            commit("setBarChartDailyData", response.data);
            commit("setLineChartDailyData", response.data);

            // Tab "Activities", Dropdown: "Average of monthly activities"
            commit("setBarChartMonthlyData", response.data);
            commit("setLineChartMonthlyData", response.data);

            commit("setLoader", false);
        }
    },
    /**
     * Addresses the WhatALocation activities endpoint with 2
     * request to compare data
     * @param {Object} commit Commit Object
     * @param {Object} compareData Object which holds the data to compare
     * @returns {Promise<void>} sets the data in store
     */
    getActivitiesToCompare: async ({commit}, compareData) => {
        commit("setLoader", true);

        const
            responseA = await apiEndpointService.receiveActivities(compareData.location_id_a, compareData.date),
            responseB = await apiEndpointService.receiveActivities(compareData.location_id_b, compareData.date);

        commit("setIndividualVisitorsLocationA", responseA.data);
        commit("setIndividualVisitorsLocationB", responseB.data);
        commit("setLoader", false);
    },
    /**
     * Addresses the WhatALocation dwell time endpoint to get the dwell times for the complete time range
     * @param {Object} state the store's state object
     * @param {Object} commit actions commit object.
     * @returns {void}
     **/
    getDwellTimes: async ({state, commit}) => {
        commit("setLoader", true);

        const
            response = await apiEndpointService.receiveDwellTimes(state.selectedLocationId);

        commit("setDwellTimes", response.data.data);
        commit("setLoader", false);
    },
    /**
     * Adresses the WhatALocation dwell time endpoint with 2
     * request to compare data
     * @param {Object} commit Commit Object
     * @param {Object} compareData Object which holds the data to compare
     * @returns {Promise<void>} sets the data in store
     */
    getDwellTimesToCompare: async ({commit}, compareData) => {
        commit("setLoader", true);

        const
            responseA = await apiEndpointService.receiveDwellTimes(compareData.location_id_a, compareData.date),
            responseB = await apiEndpointService.receiveDwellTimes(compareData.location_id_b, compareData.date);

        commit("setDwellTimeLocationA", responseA.data);
        commit("setDwellTimeLocationB", responseB.data);

        commit("setLoader", false);
    },
    /**
     * Get all data by age group
     * @param {Object} state the store's state object
     * @param {Object } commit Commit Object
     * @returns {Promise<void>} sets the data in store
     */
    getAllAgeGroupsData: async ({state, commit}) => {
        commit("setLoader", true);

        const
            response = await apiEndpointService.receiveAgeGroups(state.selectedLocationId);

        await commit("setAllAgeGroupsData", response.data);
        await commit("setAllAgeGroupsMonthlyData");
        commit("setLoader", false);
    },
    /**
     * Adresses the WhatALocation age group endpoint with 2
     * request to compare data
     * @param {Object } commit Commit Object
     * @param {Object } compareData Object which holds the data to compare
     * @returns {Promise<void>} sets the data in store
     */
    getAgeGroupsToCompare: async ({commit}, compareData) => {
        commit("setLoader", true);

        const
            responseA = await apiEndpointService.receiveAgeGroups(compareData.location_id_a, compareData.date),
            responseB = await apiEndpointService.receiveAgeGroups(compareData.location_id_b, compareData.date);

        commit("setAgeGroupsLocationA", responseA.data);
        commit("setAgeGroupsLocationB", responseB.data);

        commit("setLoader", false);
    },
    /**
     * Addresses the WhatALocation endpoint to get hourly data for one day for unique visitors
     * @param {Object} state the store's state and commit object
     * @param {String} date contains the date to be requested
     * @returns {Object} response object from WhatALocation endpoint
     **/
    getIndividualVisitorsForDay: async ({state, commit}, date) => {
        commit("setLoader", true);

        const
            response = await apiEndpointService.receiveVisitorsDaily(state.selectedLocationId, date);

        commit("setLoader", false);
        return response.data;
    },
    /**
     * changes the selected chart data base
     * @param {Object} commit actions commit object.
     * @param {String} chartname contains dateFrom and dateTo to define daterange to be requested
     * @returns {void}
     **/
    changeChart: ({commit}, chartname) => {
        commit("setChartData", chartname);
    }
};

export default actions;
