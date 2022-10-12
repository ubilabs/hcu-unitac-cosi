import {rawLayerList} from "@masterportal/masterportalapi/src";
import defaults from "@masterportal/masterportalapi/src/defaults";

/**
 *
 * @export
 * @param {Object} [layerConf=defaults.layerConf] -
 * @return {Promise} -
 */
export async function initializeLayerList (layerConf = defaults.layerConf) {
    return new Promise((resolve, reject) => {
        try {
            rawLayerList.initializeLayerList(layerConf, () => {
                resolve();
            });
        }
        catch (err) {
            reject(err);
        }
    });

}
