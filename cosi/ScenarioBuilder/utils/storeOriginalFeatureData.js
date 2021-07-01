/**
 * Stores a feature's original data in its properties for later use
 * @param {module:ol/Feature} feature - the feature whose data to store for later
 * @param {Boolean} [storeGeometry=true] - whether to store the geometry
 * @returns {void}
 */
export default function storeOriginalFeatureData (feature, storeGeometry = true) {
    if (!feature.get("originalData")) {
        feature.set("originalData", {
            ...feature.getProperties()
        });
    }
    if (storeGeometry && !feature.get("originalData").location) {
        feature.get("originalData").geometry = feature.getGeometry().clone();
    }

}
