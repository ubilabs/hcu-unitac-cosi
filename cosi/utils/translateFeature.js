/**
 * Moves a feature to a given location based on its geometry type
 * @param {module:ol/Feature} feature - the give to translate
 * @param {Number[]} location - the location (as coords, linestring or polygon)
 * @returns {void}
 */
export default function translateFeature (feature, location) {
    const geom = feature.getGeometry();

    if (geom.getType() === "Point") {
        geom.setCoordinates(location);
    }
}
