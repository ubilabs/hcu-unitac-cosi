import Worker from "worker-loader!./isochronesWorker.js";
import {readFeatures} from "./util";

/**
 *
 * */
export async function createIsochrones (transportType, coordinates, scaleUnit, distance) {
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
        worker.postMessage({transportType, coordinates, scaleUnit, distance});
    });
}
