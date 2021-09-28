import Worker from "worker-loader!./isochronesWorker.js";
import {readFeatures} from "../components/util";

/**
 *
 * @param {*} params parameters
 * @return {*} isochrones
 */
export async function createIsochrones (params, progress) {
    const worker = new Worker();

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
