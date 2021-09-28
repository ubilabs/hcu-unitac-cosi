import {createIsochrones} from "./isochronesService";

const id = "AccessibilityAnalysisService",
    actions = {
        // eslint-disable-next-line no-unused-vars
        async getIsochrones ({getters, commit}, params) {
            const ret = await createIsochrones(params, (p) => commit("setProgress", p));

            commit("setProgress", 0);
            return ret;
        }

    },
    store = {
        namespaced: true,
        state: {
            active: false,
            id,
            progress: 0
        },
        getters: {progress: s => {
            return s.progress;
        }},
        mutations: {
            "setProgress": (moduleState, payload) => {
                moduleState.progress = payload;
            }
        },
        actions
    };

export default {
    component: {
        name: id
    },
    store
};
