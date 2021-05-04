/* eslint-disable new-cap */
import {getFeature} from "../../../../src/api/wfs/getFeature.js";
import {getLayerWhere} from "masterportalAPI/src/rawLayerList";
import store from "../../../../src/app-store";
import {WFS} from "ol/format.js";
import getClusterSource from "../../utils/getClusterSource";

const wfsReader = new WFS();

/**
 * returns the map layer by ID
 * @param {String} layerId - the layerId to look up
 * @returns {module:ol/Layer} the layer on the map
 */
function layerById (layerId) {
    return store.getters["Map/layerById"](layerId)?.olLayer;
}

/**
 * Gets all possible values for a given field of a featureType
 * @param {String} field - the field's name
 * @param {String} layerId - the layerID of the layer to check
 * @returns {String[]} the list of possible values
 */
export default async function getValuesForField (field, layerId) {
    let allFeatures;
    const rawLayer = getLayerWhere({id: layerId});

    if (rawLayer) {
        const response = await getFeature(rawLayer.url, rawLayer.featureType, rawLayer.version);

        allFeatures = wfsReader.readFeatures(response);
    }
    else {
        const layer = layerById(layerId),
            source = getClusterSource(layer);

        allFeatures = source.getFeatures();
    }

    return allFeatures.reduce((values_, feature) => {
        const val = feature.getProperties()[field];

        if (val && !values_.includes(val)) {
            values_.push(val);
        }

        return values_;
    }, []);
}
