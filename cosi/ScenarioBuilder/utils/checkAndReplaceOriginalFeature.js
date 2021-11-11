import getClusterSource from "../../utils/getClusterSource";

/**
 * looks up the original of a feature and replaces it with the one in the scenario
 * @param {*} feature - the ol feature from the scenario
 * @param {*} layer - the layer to replace the feature on
 * @returns {void}
 */
export default async function checkAndReplaceOriginalFeature (feature, layer) {
    const
        source = getClusterSource(layer),
        originalFeature = source.getFeatureById(feature.getId());

    if (originalFeature && feature !== originalFeature) {
        source.removeFeature(originalFeature);
        source.addFeature(feature);
    }
}
