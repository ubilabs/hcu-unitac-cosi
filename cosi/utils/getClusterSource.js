import Cluster from "ol/source/Cluster";

/**
 * returns the raw vector source of a vector layer, both clustered and not
 * @param {module:ol/layer/Vector} layer - the ol vector layer
 * @returns {module:ol/source/Vector} the raw vector source
 */
export default function getClusterSource (layer) {
    const source = layer.getSource();

    return source.constructor === Cluster ? source.getSource() : source;
}
