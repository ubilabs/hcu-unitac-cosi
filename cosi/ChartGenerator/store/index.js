import getters from "./gettersChartGenerator";
import mutations from "./mutationsChartGenerator";
import state from "./stateChartGenerator";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters
};
