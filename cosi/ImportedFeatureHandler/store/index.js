import getters from "./gettersImportedFeatureHandler";
import mutations from "./mutationsImportedFeatureHandler";
import state from "./stateImportedFeatureHandler";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters
};
