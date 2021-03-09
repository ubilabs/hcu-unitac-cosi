import getters from "./gettersDistrictSelector";
import mutations from "./mutationsDistrictSelector";
import state from "./stateDistrictSelector";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters
};
