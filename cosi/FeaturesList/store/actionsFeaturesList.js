import getClusterSource from "../../utils/getClusterSource";

const actions = {
    /**
     * @description dis-/enables a feature in the map
     * @param {Function} store.dispatch - Function to dispatch an action.
     * @param {Function} store.commit - Function to commit a mutation.
     * @param {Object} store.rootGetters - the root store's getters
     * @param {Object} featureItem - The featureItem to dis-/enable
     * @returns {void}
     */
    toggleFeatureDisabled ({dispatch, commit, rootGetters}, featureItem) {
        const layerById = rootGetters["Map/layerById"],
            layer = layerById(featureItem.layerId)?.olLayer,
            source = getClusterSource(layer);

        // remove all highlightings to avoid undefined errors on the map
        dispatch("Map/removeHighlightFeature", null, {root: true});
        featureItem.enabled = !featureItem.enabled
        if (layer) {
            if (featureItem.enabled) {
                source.removeFeature(featureItem.feature);
                commit("addDisabledFeatureItem", featureItem);
            }
            else {
                source.addFeature(featureItem.feature);
                commit("removeDisabledFeatureItem", featureItem);
            }
        }
    }
};

export default actions;
