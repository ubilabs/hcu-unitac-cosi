import store from "../../../../../src/app-store";

const layerById = store.getters["Map/layerById"],
    districtLevels = store.getters["Tools/DistrictSelector/districtLevels"];

/**
 * @description retrieves the map feature from the OL map
 * @param {String} featureName - the feature's name value (key depends on level)
 * @param {String} label - the label of the feature's districtLevel
 * @returns {module:ol/Feature | undefined} the matching feature or undefined
 */
export default function findDistrictFeatureByName (featureName, label) {
    const districtLevel = districtLevels.find(el => el.label === label),
        olLayer = layerById(districtLevel?.layerId)?.olLayer;

    return olLayer?.getSource()?.getFeatures()?.find(feature => feature.get(districtLevel.keyOfAttrName) === featureName);
}
