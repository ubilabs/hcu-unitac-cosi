import {describeFeatureType, getFeatureDescription} from "../../../../src/api/wfs/describeFeatureType.js";
import {getLayerList} from "masterportalAPI/src/rawLayerList";

/**
 * Prepares the district level objects for the district selector.
 * Each district level is assigned its layer and a list of all district names.
 * Will no longer be executed once all district levels have their layer.
 * @param {Object[]} districtLevels - All avaiable district level objects.
 * @param {module:ol/layer[]} layerList - An array of layers.
 * @returns {void}
 */
export default function modifyDistricts (districtLevels) {
    districtLevels.forEach(async (level) => {
        const layer = getLayerList().find(rawlayer => rawlayer.url === level.url),
            json = await describeFeatureType(level.url),
            desc = getFeatureDescription(json, layer.featureType),
            propertyNameList = [];

        desc.forEach(des => {
            if (des.type.search("gml:") === -1) {
                propertyNameList.push(des.name);
            }
        });

        level.propertyNameList = propertyNameList.toString();
    });
}
