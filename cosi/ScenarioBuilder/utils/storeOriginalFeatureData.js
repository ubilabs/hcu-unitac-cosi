/**
 * Stores a feature's original data in its properties for later use
 * @todo update for none Point data
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
        const geom = feature.getGeometry();

        if (geom.getType() === "Point") {
            feature.get("originalData").location = geom.getCoordinates();
        }
        else {
            // implement for none Point data
        }
    }

}
