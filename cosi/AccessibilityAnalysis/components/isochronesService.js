import Worker from "worker-loader!./isochronesWorker.js";
import {readFeatures} from "./util";

/**
 *
 * */
export async function createIsochrones (mode, transportType, coordinate, scaleUnit, distance) {
    const worker = new Worker();

    return new Promise((resolve, reject) => {
        worker.onmessage = event => {

            const {steps, features} = event.data;

            resolve({steps, features: readFeatures(features)});
        };
        worker.onerror = e => {
            reject(e);
        };
        worker.postMessage({mode, transportType, coordinate, scaleUnit, distance});
    });
}
