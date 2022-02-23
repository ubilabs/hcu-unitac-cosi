import actions from "./actionsStreetsmart";
import mutations from "./mutationsStreetsmart";
import getters from "./gettersStreetsmart";
import state from "./stateStreetsmart";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    actions,
    getters
};
