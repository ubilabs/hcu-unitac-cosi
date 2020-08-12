import getters from "./gettersVueAddon";
import mutations from "./mutationsVueAddon";
import actions from "./actionsVueAddon";
import state from "./stateVueAddon";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    actions,
    getters
};
