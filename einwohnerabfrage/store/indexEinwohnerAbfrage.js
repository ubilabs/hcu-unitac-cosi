import getters from "./gettersEinwohnerAbfrage";
import mutations from "./mutationsEinwohnerAbfrage";
import state from "./stateEinwohnerAbfrage";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters
};
