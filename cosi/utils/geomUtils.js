import store from "../../../src/app-store";

/**
 * Checks which district contains a given feature
 * @param {*} districtFeatures - the districts to check
 * @param {*} feature - the feature to check against
 * @param {String} [keyOfAttrName] - defines the key of the attribute "name" to return for the district, if undefined the store value is used.
 * @param {Boolean} [returnsFeature=false] - defines whether to return a String or the Feature Object
 * @returns {String|module:ol/Feature} the districts name or the district feature
 */
export function getContainingDistrictForFeature (districtFeatures, feature, keyOfAttrName, returnsFeature = false) {
    const _keyOfAttrName = keyOfAttrName || store.getters["Tools/DistrictSelector/keyOfAttrName"];

    for (const district of districtFeatures) {
        const geom = district.getGeometry(),
            featureExtent = feature.getGeometry().getExtent();

        if (geom.intersectsExtent(featureExtent)) {
            return returnsFeature ? district : district.get(_keyOfAttrName);
        }
    }

    return false;
}
