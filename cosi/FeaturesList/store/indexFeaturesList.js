import getters from "./gettersFeaturesList";
import mutations from "./mutationsFeaturesList";
import state from "./stateFeaturesList";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters
};
