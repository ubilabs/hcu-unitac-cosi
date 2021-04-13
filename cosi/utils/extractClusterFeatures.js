import Feature from "ol/Feature";

/**
 * @description extracts clustered features if necessary
 * @param {module:ol/Feature} feature - the potential cluster to extract
 * @returns {module:ol/Feature[]} the extracted features, or the original feature wrapped in an array.
 */
export function extractClusterFeatures (feature) {
    const clusteredFeatures = feature.get("features");

    if (clusteredFeatures && clusteredFeatures[0]?.constructor === Feature) {
        return clusteredFeatures;
    }

    return [feature];
}

/**
 * @description Extracts feature clusters into a flat array
 * @param {module:ol/Feature[]} clusters - the clusters to extract
 * @returns {module:ol/Feature[]} the flat feature list
 */
export default function extractClusters (clusters) {
    return clusters.reduce((features, cluster) => {
        return [...features, ...extractClusterFeatures(cluster)];
    }, []);
}
