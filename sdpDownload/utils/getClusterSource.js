import Cluster from "ol/source/Cluster";

/**
 * Tests if a layer is a ClusterLayer
 * @param {module:ol/layer/Vector} layer the layer to test
 * @returns {Boolean} is the given layer a clustered layer?
 */
export function isClusterLayer (layer) {
    const source = layer.getSource();

    return source.constructor === Cluster;
}

/**
 * Tests if a feature is a cluster
 * @param {module:ol/Feature} feature the feature to test
 * @returns {Boolean} is the given feature a cluster?
 */
export function isCluster (feature) {
    return Boolean(feature.get("features"));
}

/**
 * Extracts the features in a cluster
 * @param {module:ol/Feature} feature the map feature to unpack
 * @returns {module:ol/Feature[]} an array of the clustered features
 */
export function unpackCluster (feature) {
    return feature.get("features") ? feature.get("features") : [feature];
}

/**
 * returns the raw vector source of a vector layer, both clustered and not
 * @param {module:ol/layer/Vector} layer - the ol vector layer
 * @returns {module:ol/source/Vector} the raw vector source
 */
export default function getClusterSource (layer) {
    const source = layer.getSource();

    return source.constructor === Cluster ? source.getSource() : source;
}
