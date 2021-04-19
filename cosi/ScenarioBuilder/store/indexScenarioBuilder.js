import getters from "./gettersScenarioBuilder";
import mutations from "./mutationsScenarioBuilder";
import state from "./stateScenarioBuilder";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters
};
