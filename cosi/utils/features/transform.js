/**
 * Transform each coordinate of the feature geometry from one crs to another.
 * @param {ol/Feature[]} features - An array of features.
 * @param {String} source - The current projection as crs identifier string.
 * @param {String} destination - The desired projection as crs identifier string.
 * @returns {void}
 */
function transformFeatures (features, source, destination) {
    if (typeof source !== "string" || typeof destination !== "string") {
        console.error(`utils/features/transformFeatures: The second and the third parameter must both be a string, but got ${typeof source} and ${typeof destination}`);

    }
    features.forEach(function (feature) {
        const geometry = feature.getGeometry();

        if (geometry) {
            geometry.transform(source, destination);
        }
    });
    return features;
}

module.exports = {
    transformFeatures
};
