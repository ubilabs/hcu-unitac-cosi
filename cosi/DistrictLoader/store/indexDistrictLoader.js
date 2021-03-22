import actions from "./actionsDistrictLoader";
import getters from "./gettersDistrictLoader";
import mutations from "./mutationsDistrictLoader";
import state from "./stateDistrictLoader";

export default {
    namespaced: true,
    actions,
    mutations,
    getters,
    state: {...state}
};
