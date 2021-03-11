import state from "./stateOpenRouteService";
import getters from "./gettersOpenRouteService";
import mutations from "./mutationsOpenRouteService";
import actions from "./actionsOpenRouteService";

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};
