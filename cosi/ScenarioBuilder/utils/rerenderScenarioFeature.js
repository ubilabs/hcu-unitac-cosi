import store from "../../../../src/app-store";
import Vue from "vue";
import getClusterSource from "../../utils/getClusterSource";

/**
 * rerenders the feature if necessary
 * @param {ScenarioFeature} scenarioFeature - the scenario feature
 * @returns {void}
 */
export default async function (scenarioFeature) {
    await Vue.nextTick();

    if (
        !getClusterSource(scenarioFeature.layer).hasFeature(scenarioFeature.feature) &&
        // eslint-disable-next-line new-cap
        store.getters["Tools/FeaturesList/isFeatureActive"](scenarioFeature.feature) &&
        scenarioFeature.scenario.isActive
    ) {
        getClusterSource(scenarioFeature.layer).addFeature(scenarioFeature.feature);
    }
}
