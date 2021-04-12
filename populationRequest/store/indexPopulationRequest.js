import getters from "./gettersPopulationRequest";
import mutations from "./mutationsPopulationRequest";
import actions from "./actionsPopulationRequest";
import state from "./statePopulationRequest";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    actions,
    getters
};
