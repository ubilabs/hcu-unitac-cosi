import {distanceScore} from "./distanceScore";

/**
 *
 * @param {*} params params
 * @return {*} score
 */
function distanceScoreWrap (params) {
    return distanceScore(params.feature, params.layerIds, params.weights);
}

const id = "DistanceScoreService",
    actions = {
        async getDistanceScore ({commit}, params) {
            return distanceScoreWrap(params);
            // let ret;

            // try {
            //     ret = await distanceScoreWrap(params, (p) => commit("setProgress", p));
            // }
            // finally {
            //     commit("setProgress", 0);
            // }
            // return ret;
        }
    },
    store = {
        namespaced: true,
        state: {
            active: true,
            id,
            progress: 0
        },
        getters: {
            progress: s => {
                return s.progress;
            }
        },
        mutations: {
            setProgress: (moduleState, payload) => {
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
