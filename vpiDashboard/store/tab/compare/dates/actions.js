import axios from "axios";
import {Config} from "../../../../config";
import apiEndpointService from "../../../apiEndpointService";

const actions = {
    /* Adresses the WhatALocation API and compares to data points
     * @param {Object} commit Commit Object,
     * @param {Object} compareData Object which holds the data to compare
     * @returns {Promise<void>} sets the data in store
     */
    getDataToCompare: async ({commit}, compareData) => {
        const
            options = {
                "Authorization": `Bearer ${Config.whatalocationApi.auth_token}`
            };

        if (compareData.character === "Verweildauer") {
            commit("setLoader", true);

            const
                responseA = await apiEndpointService.receiveDwellTimes(compareData.location_id, compareData.dates[0].date),
                responseB = await apiEndpointService.receiveDwellTimes(compareData.location_id, compareData.dates[1].date);

            commit(`setDwellTime${compareData.dates[0].dateName}`, responseA.data);
            commit(`setDwellTime${compareData.dates[1].dateName}`, responseB.data);
            commit("setLoader", false);
        }

        if (compareData.character === "Individuelle Besucher") {
            let date = compareData.dates[0];

            commit("setLoader", true);
            const
                urlA = `${Config.whatalocationApi.host}${Config.whatalocationApi.basepath}/daily-aggregated/?group_by[date]=&location_id=${compareData.location_id}&group_by[ReiseArt]&format=agg&aggregate[Avg]=num_visitors&pulse=activate&interval=300&transportation=pedestrian&date=${date.date}`,
                responseA = await axios.get(urlA, {headers: options});

            commit(`setIndividualVisitors${date.dateName}`, responseA.data);

            date = compareData.dates[1];
            // eslint-disable-next-line
            const
                urlB = `${Config.whatalocationApi.host}${Config.whatalocationApi.basepath}/daily-aggregated/?group_by[date]=&location_id=${compareData.location_id}&group_by[ReiseArt]&format=agg&aggregate[Avg]=num_visitors&pulse=activate&interval=300&transportation=pedestrian&date=${date.date}`,
                responseB = await axios.get(urlB, {headers: options});

            commit("setLoader", false);
            commit(`setIndividualVisitors${date.dateName}`, responseB.data);
        }

        if (compareData.character === "Altersgruppen") {
            commit("setLoader", true);

            const
                responseA = await apiEndpointService.receiveAgeGroups(compareData.location_id, compareData.dates[0].date),
                responseB = await apiEndpointService.receiveAgeGroups(compareData.location_id, compareData.dates[1].date);

            commit(`setAgeGroups${compareData.dates[0].dateName}`, responseA.data);
            commit(`setAgeGroups${compareData.dates[1].dateName}`, responseB.data);
            commit("setLoader", false);
        }

        if (compareData.character === "Besuchergruppen") {
            commit("setLoader", true);

            const
                responseA = await apiEndpointService.receiveVisitorTypes(compareData.location_id, compareData.dates[0].date),
                responseB = await apiEndpointService.receiveVisitorTypes(compareData.location_id, compareData.dates[1].date);

            commit(`setVisitorTypes${compareData.dates[0].dateName}`, responseA.data);
            commit(`setVisitorTypes${compareData.dates[1].dateName}`, responseB.data);
            commit("setLoader", false);
        }
    }

};

export default actions;
