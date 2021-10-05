import {WFS} from "ol/format.js";
import {getLayerWhere} from "masterportalAPI/src/rawLayerList";
import {getFeature} from "../../../src/api/wfs/getFeature.js";

/**
 * Returns all features of a layer by the given layer id.
 * If the features are not yet stored, it will be loaded.
 * @param {String} layerId - The id of the layer.
 * @returns {module:ol/Feature[]} The features of the layer.
 */
export async function getAllFeatures (layerId) {
    const layer = getLayerWhere({id: layerId}),
        wfsReader = new WFS({
            featureNS: layer.featureNS
        }),
        features = await getFeature(layer?.url, layer?.featureType);

    return wfsReader.readFeatures(features);
}
