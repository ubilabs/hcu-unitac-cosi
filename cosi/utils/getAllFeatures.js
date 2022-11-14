import {WFS} from "ol/format.js";
import {getLayerWhere} from "@masterportal/masterportalapi/src/rawLayerList";
import axios from "axios";

/**
 * Handles the WFS GetFeature request.
 * @param {String} url - The url of the WFS.
 * @param {String | String[]} featureType - The layer name, resp. the layer names if WFS version is >2.0.0.
 * @param {String} [propertyName] - A list of properties to restrict the request.
 * @param {String} [bbox] - A extent to restrict the request.
 * @param {String} [srsName] - srsName
 * @param {String} [version="1.1.0"] - The version of the WFS.
 * @param {String} [filter] - An XML encoded filter function.
 * @returns {Promise<Object|undefined>} Promise object represents the DescribeFeatureType request.
 */
export async function getFeature (url, featureType, propertyName, bbox, srsName, version = "1.1.0") {
    const ret = await axios.get(url, {
        // the params "service", "request", "version" are required
        params: {
            service: "WFS",
            request: "GetFeature",
            srsName,
            version: version,
            typeName: `de.hh.up:${featureType}`,
            typeNames: Array.isArray(featureType) ? featureType.join(",") : featureType,
            propertyName,
            bbox
        }
    });

    return ret.data;
}

/**
 * @param {*} bbox bbox
 * @param {*} srsName srsName
 * @returns {String} bbox
 */
function formatBbox (bbox, srsName) {
    if (Array.isArray(bbox) && bbox.length === 4) {
        if (srsName) {
            return bbox.join(",") + "," + srsName;
        }
        return bbox.join(",");
    }
    return undefined;
}

/**
 * Returns all features of a layer by the given layer id.
 * If the features are not yet stored, it will be loaded.
 * @param {String} layerId - The id of the layer.
 * @param {String} bbox - bbox
 * @param {String} srsName - srsName
 * @returns {module:ol/Feature[]} The features of the layer.
 */
export async function getAllFeatures (layerId, bbox, srsName) {

    const layer = getLayerWhere({id: layerId}),
        wfsReader = new WFS({
            featureNS: layer?.featureNS
        }),
        features = layer?.url ? await getFeature(layer?.url, layer?.featureType, undefined, formatBbox(bbox, srsName), srsName, "1.1.0") : [];

    return wfsReader.readFeatures(features);
}
