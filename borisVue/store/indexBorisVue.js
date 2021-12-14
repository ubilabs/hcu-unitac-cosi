import mutations from "./mutationsBorisVue";
import actions from "./actionsBorisVue";
import getters from "./gettersBorisVue";
import state from "./stateBorisVue";

export default {
    namespaced: true, // mandatory
    state,
    mutations,
    actions,
    getters
};

