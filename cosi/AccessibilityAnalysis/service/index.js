import Worker from "worker-loader!./isochronesWorker.js";
import {readFeatures} from "../components/util";

let worker,
    // eslint-disable-next-line func-style, require-jsdoc
    workerFactory = () => new Worker();

/**
 *
 * @param {*} factory factory
 * @return {void}
 */
export function setWorkerFactory (factory) {
    workerFactory = factory;
}

/**
 *
 * @param {*} params parameters
 * @param {*} progress progress callback
 * @return {*} isochrones
 */
export async function createIsochrones (params, progress) {
    if (worker) {
        worker.terminate();
    }
    worker = workerFactory();

    return new Promise((resolve, reject) => {
        worker.onmessage = event => {
            const data = event.data;

            if (data.error) {
                reject(data.error);
            }
            else if (data.result) {
                resolve(readFeatures(data.result));
            }
            else if (data.progress) {
                progress(data.progress);
            }
        };
        worker.onerror = e => {
            reject(e);
        };
        worker.postMessage(params);
    });
}

const id = "AccessibilityAnalysisService",
    actions = {
        // eslint-disable-next-line no-unused-vars
        async getIsochrones ({getters, commit}, params) {
            let ret;

            try {
                ret = await createIsochrones(params, (p) => commit("setProgress", p));
            }
            finally {

                commit("setProgress", 0);
            }
            return ret;
        }

        // async abort ({getters, commit}, params) {
        //     worker.terminate();
        //     commit("setProgress", 0);
        // }
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
