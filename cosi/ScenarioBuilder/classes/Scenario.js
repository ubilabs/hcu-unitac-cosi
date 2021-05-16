import ScenarioFeature from "./ScenarioFeature";
import getClusterSource from "../../utils/getClusterSource";
import Feature from "ol/Feature";

/**
 * @class Scenario
 */
export default class Scenario {
    /**
     * Constructor for class Scenario
     * @param {String} name the name of the scenario
     * @param {module:ol/layer/Vector} [guideLayer] the guideLayer to draw labels to
     */
    constructor (name, guideLayer) {
        this.name = name;
        this.simulatedFeatures = [];
        this.modifiedFeatures = [];
        this.guideLayer = guideLayer;
    }

    /**
     * Adds a feature to the scenario
     * @param {ScenarioFeature} scenarioFeature - the scenariofeature to add to the scenario
     * @param {Boolean} renderFeature - whether to render the feature on add
     * @returns {void}
     */
    addFeature (scenarioFeature, renderFeature = true) {
        if (scenarioFeature.constructor !== ScenarioFeature) {
            console.error(`Scenario.addFeature: feature must be of Type ScenarioFeature. Got ${scenarioFeature.constructor} instead.`);
            return;
        }
        if (!this.simulatedFeatures.find(item => item === scenarioFeature)) {
            this.simulatedFeatures.push(scenarioFeature);
        }
        if (renderFeature) {
            scenarioFeature.renderFeature(this.guideLayer);
        }
    }

    /**
     * Modifies a given feature's properties and stores the changes on the scenario
     * @param {module:ol/Feature} feature - the feature to modify
     * @param {Object} properties - the properties to change and store
     * @param {module:ol/layer/Vector} layer - the layer the feature is on
     * @returns {void}
     */
    modifyFeature (feature, properties, layer) {
        if (feature.constructor !== Feature) {
            console.error(`Scenario.addFeature: feature must be of Type ScenarioFeature. Got ${feature.constructor} instead.`);
            return;
        }
        let scenarioFeature = this.modifiedFeatures.find(item => item.feature === feature);

        if (!scenarioFeature) {
            if (!layer) {
                return;
            }
            scenarioFeature = new ScenarioFeature(feature, layer);
            this.modifiedFeatures.push(scenarioFeature);
        }

        for (const prop in properties) {
            scenarioFeature.scenarioData[prop] = properties[prop];
            scenarioFeature.feature.set("prop", properties[prop]);
        }
    }

    /**
     * Hides all features in the scenario from the map
     * @returns {void}
     */
    hideScenario () {
        let item;

        for (item of this.simulatedFeatures) {
            item.hideFeature();
        }
    }

    /**
     * Clears the current scenario
     * @returns {void}
     */
    prune () {
        this.hideScenario();
        this.simulatedFeatures = [];
    }

    /**
     * Restores all features of the current scenario
     * @returns {void}
     */
    restore () {
        for (const item of this.simulatedFeatures) {
            if (!getClusterSource(item.layer)
                .getFeatures()
                .find(feature => feature === item.feature)) {
                item.renderFeature();
            }
        }
        for (const item of this.modifiedFeatures) {
            item.restoreScenarioProperties();
        }
    }

    /**
     * Returns all simulated or modified features of the scenario as a single list
     * @returns {ScenarioFeature[]} all simulated an modified features in the scenario
     */
    getAllFeatures () {
        return [
            ...this.simulatedFeatures,
            ...this.modifiedFeatures
        ];
    }
}
