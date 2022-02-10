import Worker from "worker-loader!./isochronesWorker.js";
import {readFeatures} from "../components/util";
import axios from "axios";
import {WFS} from "ol/format.js";

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
 * @param {*} newWorker new worker
 * @return {void}
 */
export function setWorker (newWorker) {
    worker = newWorker;
}

// eslint-disable-next-line require-jsdoc
async function getFeatures (url, featureType, version = "1.1.0") {
    const ret = await axios.get(url, {
            params: {
                service: "WFS",
                request: "GetFeature",
                version: version,
                typeName: featureType,
                srsName: "EPSG:25832"
            }
        }),
        json = ret.data;

    if (json.error) {
        throw Error(json);
    }

    return json;
}

/**
 *
 * @export
 * @param {*} url url
 * @param {*} featureType featureType
 * @return {void}
 */
export async function loadFilterPoly (url, featureType) {
    const ret = await getFeatures(url, featureType),
        wfsReader = new WFS({}),
        feature = wfsReader.readFeatures(ret)[0];

    return feature.getGeometry().getPolygon(0).getCoordinates();
}

/**
 *
 * @param {*} params parameters
 * @param {*} progress progress callback
 * @return {*} isochrones
 */
async function createIsochrones (params, progress) {
    return new Promise((resolve, reject) => {
        worker.addEventListener("message", function handler (event) {
            const data = event.data;

            if (data.type !== "createIsochrones") {
                return;
            }
            if (data.request_canceled) {
                worker.removeEventListener("message", handler);
                reject(data);
            }
            if (data.error) {
                worker.removeEventListener("message", handler);
                reject(data.error);
            }
            else if (data.result) {
                worker.removeEventListener("message", handler);
                resolve(readFeatures(data.result));
            }
            else if (data.progress) {
                progress(data.progress);
            }
        });
        worker.postMessage({type: "createIsochrones", ...params});
    });
}

/**
 *
 * @param {*} params parameters
 * @param {*} progress progress callback
 * @return {*} isochrones
 */
async function init (params) {
    return new Promise((resolve, reject) => {
        worker.addEventListener("message", function handler (event) {
            const data = event.data;

            if (data.type !== "init") {
                return;
            }

            if (data.error) {
                worker.removeEventListener("message", handler);
                reject(data.error);
            }
            else if (data.result) {
                worker.removeEventListener("message", handler);
                resolve();
            }
        });
        worker.postMessage({type: "init", ...params});
    });
}

const id = "AccessibilityAnalysisService",
    actions = {
        async getIsochrones ({getters, commit}, params) {
            let ret;

            if (worker === undefined) {
                // worker.terminate();
                worker = workerFactory();
                worker.onerror = e => {
                    console.error(e);
                };
                if (getters.filterPoly) {
                    await init({coords: [getters.filterPoly]});
                }
                else if (getters.filterUrl && getters.filterFeatureType) {
                    const coords = await loadFilterPoly(getters.filterUrl, getters.filterFeatureType);

                    await init({coords});
                }
            }

            try {
                ret = await createIsochrones({...params, batchSize: getters.batchSize, baseUrl: getters.baseUrl}, (p) => commit("setProgress", p));
            }
            catch {
                const baseUrl = Radio.request("RestReader", "getServiceById", "csl_ors").get("url") + "/v2/";

                ret = await createIsochrones({...params, batchSize: getters.batchSize, baseUrl: baseUrl}, (p) => commit("setProgress", p));
            }
            finally {
                commit("setProgress", 0);
            }
            return ret;
        },
        async getFilterPoly () {
            if (worker === undefined) {
                throw Error("worker not initialized");
            }

            return new Promise((resolve, reject) => {
                worker.addEventListener("message", function handler (event) {
                    const data = event.data;

                    if (data.type !== "getFilterPoly") {
                        return;
                    }
                    if (data.error) {
                        worker.removeEventListener("message", handler);
                        reject(data.error);
                    }
                    else if (data.result) {
                        worker.removeEventListener("message", handler);
                        resolve(data.result);
                    }
                });
                worker.postMessage({type: "getFilterPoly"});
            });
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
            progress: 0,
            batchSize: 50,
            filterPoly: null,
            filterUrl: "https://geodienste.hamburg.de/HH_WFS_Verwaltungsgrenzen",
            filterFeatureType: "landesgrenze",
            serviceId: "bkg_ors"
        },
        getters: {
            progress: s => {
                return s.progress;
            },
            batchSize: s => {
                return s.batchSize;
            },
            filterUrl: s => {
                return s.filterUrl;
            },
            filterFeatureType: s => {
                return s.filterFeatureType;
            },
            filterPoly: s => {
                return s.filterPoly;
            },
            baseUrl: s => {
                return Radio.request("RestReader", "getServiceById", s.serviceId).get("url") + "/v2/";
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
        name: id,
        render () {
            return null;
        }
    },
    store
};
