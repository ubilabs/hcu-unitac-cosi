import {createIsochrones} from "./isochronesService";

const id = "AccessibilityAnalysisService",
    getters = {
    },
    actions = {
        // eslint-disable-next-line no-unused-vars
        async getIsochrones ({_getters, commit}, params) {
            return createIsochrones(params);
        }
    },
    store = {
        namespaced: true,
        state: {
            active: false,
            id
        },
        getters,
        actions
    };

export default {
    component: {
        name: id
    },
    store
};
