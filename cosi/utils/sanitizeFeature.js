import hash from "object-hash";

/**
 * Validates and sanitizes a feature for parsing
 * @param {module:ol/Feature} feature - the OL feature
 * @returns {module:ol/Feature} the sanitized feature
 */
export function sanitizeFeature (feature) {
    console.log(feature);

    return feature;
}

/**
 * Validates and sanitizes features for parsing
 * @param {module:ol/Feature[]} features - the OL features
 * @returns {module:ol/Feature[]} the sanitized features
 */
export function sanitizeFeatures (features) {
    for (const feature of features) {
        sanitizeFeature(feature);
    }
    return features;
}
