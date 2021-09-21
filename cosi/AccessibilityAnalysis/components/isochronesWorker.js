import {writeFeatures, registerProjections} from "./util.js";
import {createIsochrones} from "./createIsochrones";
import "regenerator-runtime/runtime";


registerProjections();

/**
 * @param {*} self self
 * @param {*} event event
 * @returns {void}
 */
async function onmessage (self, event) {

    try {
        const features = await createIsochrones(event.data);

        self.postMessage(writeFeatures(features));
    }
    catch (error) {
        self.postMessage({error});
    }
}

self.onmessage = (e) => onmessage(self, e);

/**
 * use this (for testing) if Workers are not available in the active enviroment
 **/
export class Worker {
    /**
     * @param {*} args arguments
     * @memberof Worker
     * @returns {void}
     */
    async postMessage (args) {
        await onmessage({
            postMessage: (data) => {
                if (data.error) {
                    this.onerror(data);
                }
                this.onmessage({data});
            }
        }, {data: args});
    }
}
