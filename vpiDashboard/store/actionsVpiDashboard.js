import axios from "axios";
import {Config} from "../config";

const actions = {
    // NOTE write actions here if you need them
    getIndividualVisitors: async ({commit}) => {
        const url = `${Config.whatalocationApi.host}${Config.whatalocationApi.basepath}/quick-data?location_id=d5a5e897-a98a-4cb8-bbcd-cc45738d1a08&transport=pedestrian&interval=180&expands=unique`,
            options = {
                "Authorization": `Bearer ${Config.whatalocationApi.auth_token}`
            },
            response = await axios.get(url, {headers: options});

        commit("setFrequencyData", response.data);
        commit("setAverageVisitorsPerMonth", response.data);
        commit("setAverageVisitorsPerDay", response.data);
        commit("setIndividualVisitorsPerYear", response.data);
    },
    changeChart: ({commit}, chartname) => {
        commit("setChartData", chartname);
    }
};

export default actions;
