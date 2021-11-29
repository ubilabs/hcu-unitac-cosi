import getClusterSource from "../../utils/getClusterSource";
import {addSimulationTag, removeSimulationTag} from "../utils/guideLayer";

const actions = {
    /**
     * Restores all features of the current scenario
     * @param {Object} store.getters the Scenario Builer's getters
     * @returns {void}
     */
    restoreScenario ({getters}) {
        getters.scenario.forEach(item => {
            const source = getClusterSource(item.layer);

            if (!source.getFeatures().find(feature => feature === item.feature)) {
                source.addFeature(item.feature);

                addSimulationTag(item.feature, getters.guideLayer);
            }
        });
    },
    /**
     * Clears the current scenario
     * @param {Object} store.getters the Scenario Builer's getters
     * @param {Function} store.commit the stores commit function
     * @returns {void}
     */
    pruneScenario ({getters, commit}) {
        getters.scenario.forEach(item => {
            const source = getClusterSource(item.layer);

            removeSimulationTag(item.feature, getters.guideLayer);
            source.removeFeature(item.feature);
        });

        commit("setScenario", []);
    },
    /**
     * Adds a feature to the current scenario
     * @param {Function} store.commit the stores commit function
     * @param {Function} store.getters scenario builder getters
     * @param {Object} payload - {feature, layer} to commit
     * @param {Object} payload.feature - feature to commit
     * @param {Object} payload.layer - layer the feature belongs to
     * @returns {void}
     */
    addFeatureToScenario ({commit, getters}, payload) {
        getClusterSource(payload.layer).addFeature(payload.feature);

        addSimulationTag(payload.feature, getters.guideLayer);
        commit("storeScenarioFeature", payload);
    }
};

export default actions;
