import {buffer, createEmpty, extend} from "ol/extent";

/**
 * Calculates the extent of a set of features.
 * Also optional with a buffer.
 * @param {module:ol/Feature[]} features - The feature list.
 * @param {Number} [bufferValue=0] - The buffer for the extent.
 * @returns {Number[]|Boolean} The extent of the features or false for no extent.
 */
export default function calculateExtent (features, bufferValue = 0) {
    if (!(Array.isArray(features) && typeof parseFloat(bufferValue) === "number")) {
        console.error(`calculateExtent: ${features} has to be defined and an array. ${bufferValue} has to be defined and a number`);
        return false;
    }
    if (features.length > 0) {
        let extent = createEmpty();

        features.forEach(feature => {
            if (feature.getGeometry) {
                // modify the extent to include the feature extent
                extent = extend(extent, feature.getGeometry().getExtent());
            }
        });
        return buffer(extent, parseFloat(bufferValue));
    }
    return false;
}
