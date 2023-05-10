import axios from "axios";
import {Config} from "../config";

const actions = {
    /**
     * Addresses the WhatALocation endpoint to get aggregated values for unique visitors for the complete data collection range
     * @param {Object} commit actions commit object.
     * @returns {void}
    **/
    getIndividualVisitors: async ({commit}) => {
        const url = `${Config.whatalocationApi.host}${Config.whatalocationApi.basepath}/quick-data?location_id=d5a5e897-a98a-4cb8-bbcd-cc45738d1a08&transport=pedestrian&interval=300&expands=unique`,
            options = {
                "Authorization": `Bearer ${Config.whatalocationApi.auth_token}`
            },
            response = await axios.get(url, {headers: options});

        commit("setFrequencyData", response.data);
        commit("setAverageVisitorsPerMonth", response.data);
        commit("setAverageVisitorsPerDay", response.data);
        commit("setIndividualVisitorsPerYear", response.data);
    },
    /**
     * Addresses the WhatALocation endpoint to get hourly data for one day for unique visitors
     * @param {Object} context actions context object.
     * @param {Strin} date contains the date to be requested
     * @returns {Object} response object from WhatALocation endpoint
    **/
    getIndividualVisitorsForDay: async (context, date) => {
        const url = `${Config.whatalocationApi.host}${Config.whatalocationApi.basepath}/daily?location_id=d5a5e897-a98a-4cb8-bbcd-cc45738d1a08&transport=pedestrian&interval=300&use_pulse=activate&&aggregate[Avg]=num_visitors&ReiseArt__in=eingehend,ausgehend&&group_by[date__hour]&date__gte=${date} 00:00:00&date__lte=${date} 23:59:19`,
            options = {
                "Authorization": `Bearer ${Config.whatalocationApi.auth_token}`
            },
            response = await axios.get(url, {headers: options});

        return response.data;
    },
    /**
     * Addresses the WhatALocation endpoint to get daily aggregated values for unique visitors
     * @param {Object} context actions context object.
     * @param {Object} dates contains dateFrom and dateTo to define daterange to be requested
     * @returns {Object} response object from WhatALocation endpoint
    **/
    getIndividualVisitorsForDateRange: async (context, dates) => {
        const url = `${Config.whatalocationApi.host}${Config.whatalocationApi.basepath}/daily-aggregated?location_id=d5a5e897-a98a-4cb8-bbcd-cc45738d1a08&transport=pedestrian&interval=300&use_pulse=activate&&aggregate[Sum]=num_visitors&ReiseArt__in=eingehend,ausgehend&&group_by[date]&date__gte=${dates.dateFrom}&date__lte=${dates.dateTo}`,
            options = {
                "Authorization": `Bearer ${Config.whatalocationApi.auth_token}`
            },
            response = await axios.get(url, {headers: options});

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
    },
    /**
     * Addresses the WhatALocation locations endpoint to get all locations
     * @param {Object} context actions context object.
     * @returns {void}
    **/
    getAllLocations: async ({commit}) => {
        const url = `${Config.whatalocationApi.host}${Config.whatalocationApi.basepath}/locations`,
            options = {
                "Authorization": `Bearer ${Config.whatalocationApi.auth_token}`
            },
            response = await axios.get(url, {headers: options});

        commit("setAllLocationsGeoJson", response.data.results);
    }
};

export default actions;
