import getClusterSource from "../../utils/getClusterSource";
import {addSimulationTag, removeSimulationTag} from "../utils/guideLayer";
import storeOriginalFeatureData from "../utils/storeOriginalFeatureData";
import translateFeature from "../../utils/translateFeature";

/**
 * @description Stores the scenario specific properties of a feature
 * @class ScenarioFeature
 */
export default class ScenarioFeature {
    /**
     * Constructor for class ScenarioFeature
     * @param {module:ol/Feature} feature the OpenLayers Feature created
     * @param {module:ol/layer/Vector} layer the OpenLayers Layer the feature is bound to
     * @param {module:ol/layer/Vector} [guideLayer] the guideLayer to render additional info to
     */
    constructor (feature, layer, guideLayer) {
        this.feature = feature;
        this.layer = layer;
        this.guideLayer = guideLayer;
        this.scenarioData = {};
        this.scenario = null;

        // Here the feauture is added again, if it has been removed from an other Tool. For example by an accessibility analysis.
        this.layer.getSource().on("change", () => {
            if (!this.layer.getSource().hasFeature(this.feature) && this.scenario?.isActive) {
                this.layer.getSource().addFeature(this.feature);
            }
        });
        storeOriginalFeatureData(this.feature);
    }

    /**
     * Renders the feature to the map and tags it if a guidelayer is provided
     * @todo store tag on the class?
     * @param {module:ol/layer/Vector} guideLayer - the guideLayer to draw tags to
     * @returns {void}
     */
    renderFeature (guideLayer) {
        getClusterSource(this.layer).addFeature(this.feature);

        console.log(this.guideLayer, guideLayer);
        if (guideLayer || this.guideLayer) {
            this.guideLayer = guideLayer || this.guideLayer;
            console.log(this.feature);
            addSimulationTag(this.feature, this.guideLayer, this.layer);
        }
    }

    /**
     * removes the feature and the tag from the map
     * @todo remove tag directly without searching the guideLayer
     * @returns {void}
     */
    hideFeature () {
        const source = getClusterSource(this.layer);

        source.removeFeature(this.feature);

        if (this.guideLayer) {
            removeSimulationTag(this.feature, this.guideLayer);
        }
    }

    /**
     * Sets a features properties to the values of the given scenario
     * @returns {void}
     */
    restoreScenarioProperties () {
        for (const prop in this.scenarioData) {
            this.feature.set(prop, this.scenarioData[prop]);

            if (prop === "geometry" && this.scenarioData.geometry) {
                translateFeature(this.feature, this.scenarioData.geometry);

                if (this.guideLayer) {
                    removeSimulationTag(this.feature, this.guideLayer);
                    addSimulationTag(this.feature, this.guideLayer, this.layer);
                }
            }
        }
    }

    /**
     * Resets a features properties to the original data
     * @param {String[]} [props] - the props to restore
     * @returns {void}
     */
    resetProperties (props) {
        const originalProperties = this.feature.get("originalData");
        let prop;

        for (prop of props || Object.keys(originalProperties)) {
            console.log(prop, originalProperties[prop])
            this.feature.set(prop, originalProperties[prop]);

            if (prop === "geometry") {
                this.resetLocation();
            }
        }
    }

    /**
     * Retrieves the original location of a feature and resets its position on the map
     * @returns {void}
     */
    resetLocation () {
        const originalGeom = this.feature.get("originalData").geometry;

        if (originalGeom) {
            translateFeature(this.feature, originalGeom);

            if (this.guideLayer) {
                removeSimulationTag(this.feature, this.guideLayer);
                addSimulationTag(this.feature, this.guideLayer);
            }
        }
    }

    /**
     * Edits the scenario feature's properties
     * CAUTION: Does not yet work for geometries
     * @param {Object} properties - the prop key to store a value to
     * @returns {void}
     */
    setProperties (properties) {
        for (const prop in properties) {
            this.set(prop, properties[prop]);
        }
    }

    /**
     * Retrieves the feature's original properties
     * @returns {Object} the stored original properties
     */
    getOriginalProperties () {
        return this.feature.get("originalData");
    }

    /**
     * Stores a key/value pair specific to the scenario
     * @param {String} prop - the prop key to store a value to
     * @param {*} val - the value to store
     * @returns {void}
     */
    set (prop, val) {
        // store the scenario specific value for a prop on the scenario
        this.scenarioData[prop] = val;
        // store the currently active values on the feature
        this.feature.set(prop, val);
    }

    /**
     * Retrieves a scenario specific property
     * @param {String} prop - the prop to retrieve
     * @returns {*} the stored value
     */
    get (prop) {
        return this.scenarioData[prop];
    }
}
