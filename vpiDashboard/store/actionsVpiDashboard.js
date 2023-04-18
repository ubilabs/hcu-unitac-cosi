import axios from "axios";
const actions = {
    // NOTE write actions here if you need them
    getIndividualVisitors: async ({commit}) => {
        const url = "https://api.whatalocation.io/api/v2/quick-data/?location_id=df5404f0-b8f0-4a91-a7b0-c3fd0e6a7703&auth_token=db34d184-3053-4adb-a76c-65e9601f0001&transport=pedestrian&pulse=activate&interval=180&expands=unique",
            response = await axios.get(url);

        commit("setFrequencyData", response.data);
        commit("setAverageVisitorsPerMonth", response.data)
        commit("setAverageVisitorsPerDay", response.data)
        commit("setIndividualVisitorsPerYear", response.data)
    },
    changeChart: ({commit}, chartname) => {
        commit("setChartData", chartname);
    }
};

export default actions;
