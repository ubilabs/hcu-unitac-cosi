import ScenarioFeature from "./ScenarioFeature";
import getClusterSource from "../../utils/getClusterSource";
import Feature from "ol/Feature";

/**
 * @description Class storing all information about a created scenario
 * @class Scenario
 * @todo Refactor! It's just a prototype!
 * @todo join modifiedFeatures and simulatedFeatures (?) is there a reason to separate them?
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
     * @todo use OL feature as input
     * @param {ScenarioFeature} scenarioFeature - the scenariofeature to add to the scenario
     * @param {Boolean} renderFeature - whether to render the feature on add
     * @returns {ScenarioFeature} the scenario Feature added
     */
    addFeature (scenarioFeature, renderFeature = true) {
        if (scenarioFeature?.constructor !== ScenarioFeature) {
            console.error(`Scenario.addFeature: feature must be of Type ScenarioFeature. Got ${scenarioFeature?.constructor} instead.`);
            return null;
        }
        if (!this.simulatedFeatures.find(item => item === scenarioFeature)) {
            this.simulatedFeatures.push(scenarioFeature);
        }
        if (renderFeature) {
            scenarioFeature.renderFeature(this.guideLayer);
        }

        return scenarioFeature;
    }

    /**
     * Modifies a given feature's properties and stores the changes on the scenario
     * @param {module:ol/Feature} feature - the feature to modify
     * @param {module:ol/layer/Vector} layer - the layer the feature is on
     * @returns {ScenarioFeature} the created Scenario Feature
     */
    addModifiedFeature (feature, layer) {
        if (feature?.constructor !== Feature) {
            console.error(`Scenario.addModifiedFeature: feature must be of Type Feature. Got ${feature?.constructor} instead.`);
            return null;
        }
        const scenarioFeature = new ScenarioFeature(feature, layer);

        this.modifiedFeatures.push(scenarioFeature);

        return scenarioFeature;
    }

    /**
     * Modifies a given feature's properties and stores the changes on the scenario
     * @param {module:ol/Feature} feature - the feature to modify
     * @param {Object} properties - the properties to change and store
     * @param {module:ol/layer/Vector} [layer] - the layer the feature is on
     * @returns {void}
     */
    modifyFeature (feature, properties, layer) {
        if (feature?.constructor !== Feature) {
            console.error(`Scenario.modifyFeature: feature must be of Type Feature. Got ${feature?.constructor} instead.`);
            return;
        }
        if (properties?.constructor !== Object) {
            console.error(`Scenario.modifyFeature: properties must be of Type Object. Got ${properties?.constructor} instead.`);
            return;
        }
        let scenarioFeature = this.getScenarioFeature(feature);

        if (!scenarioFeature) {
            if (!layer) {
                return;
            }
            scenarioFeature = this.addModifiedFeature(feature, layer);
        }

        // store the altered properties in the scenario
        for (const prop in properties) {
            // store the scenario specific value for a prop on the scenario
            scenarioFeature.scenarioData[prop] = properties[prop];
            // store the currently active values on the feature
            scenarioFeature.feature.set(prop, properties[prop]);
        }
    }

    /**
     * Resets a modified feature to its original properties
     * @param {module:ol/Feature} feature - the feature from the map to reset
     * @param {String[]} [props] - the props to reset, resets all if none are provided
     * @returns {void}
     */
    resetFeature (feature, props) {
        const scenarioFeature = this.getScenarioFeature(feature);

        if (scenarioFeature) {
            scenarioFeature.resetProperties(props);
        }
    }

    /**
     * Resets all modified features to their original state
     * @returns {void}
     */
    resetAllFeatures () {
        let item;

        for (item of this.getAllFeatures()) {
            item.resetProperties();
        }
    }

    /**
     * Resets all modified features of a layer to their original state
     * @param {module:ol/layer/Vector} layer - the layer to reset
     * @returns {void}
     */
    resetFeaturesByLayer (layer) {
        const scenarioFeatures = this.getScenarioFeaturesByLayer(layer);
        let item;

        for (item of scenarioFeatures) {
            item.resetProperties();
        }
    }

    /**
     * Hides all features in the scenario from the map
     * @returns {void}
     */
    hideScenario () {
        let item;

        this.resetAllFeatures();
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
        this.resetAllFeatures();
        this.simulatedFeatures = [];
        this.modifiedFeatures = [];
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
            item.restoreScenarioProperties();
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

    /**
     * Returns the ScenarioFeature for a given map feature
     * @param {module:ol/Feature} feature - the OL map feature
     * @param {String} [type] - "simulated" or "modified" or undefined
     * @returns {ScenarioFeature} the scenarioFeature and its scenario specific properties
     */
    getScenarioFeature (feature, type) {
        if (type === "simulated") {
            return this.getSimulatedScenarioFeature(feature);
        }
        if (type === "modified") {
            return this.getModifiedScenarioFeature(feature);
        }

        return this.simulatedFeatures.find(item => item.feature === feature) || this.modifiedFeatures.find(item => item.feature === feature);
    }

    /**
     * Returns the simulated ScenarioFeature for a given map feature
     * @param {module:ol/Feature} feature - the OL map feature
     * @returns {ScenarioFeature} the scenarioFeature and its scenario specific properties
     */
    getSimulatedScenarioFeature (feature) {
        return this.simulatedFeatures.find(item => item.feature === feature);
    }

    /**
     * Returns the modified ScenarioFeature for a given map feature
     * @param {module:ol/Feature} feature - the OL map feature
     * @returns {ScenarioFeature} the scenarioFeature and its scenario specific properties
     */
    getModifiedScenarioFeature (feature) {
        return this.modifiedFeatures.find(item => item.feature === feature);
    }

    /**
     * Returns all ScenarioFeatures belonging to a specified layer
     * @param {module:ol/layer/Vector} layer - the layer to check
     * @param {String} [type] - "simulated" or "modified" or undefined
     * @returns {ScenarioFeature[]} the scenarioFeatures of a layer
     */
    getScenarioFeaturesByLayer (layer, type) {
        if (type === "simulated") {
            return this.getSimulatedScenarioFeaturesByLayer(layer);
        }
        if (type === "modified") {
            return this.getModifiedScenarioFeaturesByLayer(layer);
        }

        return [
            ...this.simulatedFeatures.filter(item => item.layer === layer),
            ...this.modifiedFeatures.filter(item => item.layer === layer)
        ];
    }

    /**
     * Returns all simulated ScenarioFeatures belonging to a specified layer
     * @param {module:ol/layer/Vector} layer - the layer to check
     * @returns {ScenarioFeature[]} the scenarioFeatures of a layer
     */
    getSimulatedScenarioFeaturesByLayer (layer) {
        return this.simulatedFeatures.filter(item => item.layer === layer);
    }

    /**
     * Returns all modified ScenarioFeatures belonging to a specified layer
     * @param {module:ol/layer/Vector} layer - the layer to check
     * @returns {ScenarioFeature[]} the scenarioFeatures of a layer
     */
    getModifiedScenarioFeaturesByLayer (layer) {
        return this.modifiedFeatures.filter(item => item.layer === layer);
    }
}
