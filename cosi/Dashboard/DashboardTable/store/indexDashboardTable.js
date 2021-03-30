import getters from "./gettersDashboardTable";
import mutations from "./mutationsDashboardTable";
import state from "./stateDashboardTable";
import actions from "./actionsDashboardTable";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters,
    actions
};
