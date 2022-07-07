import actions from "./actionsObliqueViewer";
import mutations from "./mutationsObliqueViewer";
import getters from "./gettersObliqueViewer";
import state from "./stateObliqueViewer";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    actions,
    getters
};
