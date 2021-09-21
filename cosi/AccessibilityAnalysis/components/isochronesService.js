import Worker from "worker-loader!./isochronesWorker.js";
import {readFeatures} from "./util";

/**
 *
 * */
export async function createIsochrones (mode, transportType, coordinate, scaleUnit, distance, abortCallback) {
    const worker = new Worker();

    if (abortCallback)
    {
        
    }

    return new Promise((resolve, reject) => {
        worker.onmessage = event => {
            const data = event.data;

            if (data.error)
            {
                reject(data.error);
            }
            else
            {
                resolve({ steps: data.steps, features: readFeatures(data.features) });
            }
        };
        worker.onerror = e => {
            reject(e);
        };
        worker.postMessage({mode, transportType, coordinate, scaleUnit, distance});
    });
}
