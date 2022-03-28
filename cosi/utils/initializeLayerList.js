import {initializeLayerList as initializeLayerList_} from "masterportalapi/src/rawLayerList";
import defaults from "masterportalapi/src/defaults";

/**
 *
 * @export
 * @param {Object} [layerConf=defaults.layerConf] -
 * @return {Promise} -
 */
export async function initializeLayerList (layerConf = defaults.layerConf) {
    return new Promise((resolve, reject) => {
        try {
            initializeLayerList_(layerConf, () => {
                resolve();
            });
        }
        catch (err) {
            reject(err);
        }
    });

}
