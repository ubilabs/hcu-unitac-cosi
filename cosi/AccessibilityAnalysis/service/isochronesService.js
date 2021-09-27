import Worker from "worker-loader!./isochronesWorker.js";
import {readFeatures} from "../components/util";

/**
 *
 * @param {*} params parameters
 * @return {*} isochrones
 */
export async function createIsochrones (params) {
    const worker = new Worker();

    return new Promise((resolve, reject) => {
        worker.onmessage = event => {
            const data = event.data;

            if (data.error) {
                reject(data.error);
            }
            else {
                resolve(readFeatures(data));
            }
        };
        worker.onerror = e => {
            reject(e);
        };
        worker.postMessage(params);
    });
}
