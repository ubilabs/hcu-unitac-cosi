import getters from "./gettersDashboardManager";
import mutations from "./mutationsDashboardManager";
import state from "./stateDashboardManager";
import actions from "./actionsDashboardManager";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters,
    actions
};
