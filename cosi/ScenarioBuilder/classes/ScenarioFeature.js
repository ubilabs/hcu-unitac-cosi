import getClusterSource from "../../utils/getClusterSource";
import {addSimulationTag, removeSimulationTag} from "../utils/guideLayer";
import storeOriginalFeatureData from "../utils/storeOriginalFeatureData";
import translateFeature from "../../utils/translateFeature";
import {unByKey} from "ol/Observable";

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
     * @param {Object} [scenarioData] properties the feature holds for a specific scenario
     */
    constructor (feature, layer, guideLayer, scenarioData) {
        this.feature = feature;
        this.layer = layer;
        this.guideLayer = guideLayer;
        this.scenarioData = scenarioData || {};
        this.scenario = null;
        this.eventKeys = {};

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

        // Here the feauture is added again, if it has been removed from an other Tool. For example by an accessibility analysis.
        this.eventKeys[this.feature.getId()] = getClusterSource(this.layer).on("change", () => {
            if (!getClusterSource(this.layer).hasFeature(this.feature) && this.scenario.isActive) {
                getClusterSource(this.layer).addFeature(this.feature);
            }
        });

        if (guideLayer || this.guideLayer) {
            this.guideLayer = guideLayer || this.guideLayer;
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

        // unbind the listener
        unByKey(this.eventKeys[this.feature.getId()]);
        if (source.getFeatureById(this.feature.getId())) {
            source.removeFeature(this.feature);
        }

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
     * @param {Boolean} [purge=false] - whether to clear the stored scenarioData definitively
     * @returns {void}
     */
    resetProperties (props, purge = false) {
        const originalProperties = this.feature.get("originalData");
        let prop;

        for (prop of props || Object.keys(originalProperties)) {

            if (prop === "geometry") {
                this.resetLocation(purge);
            }
            else {
                this.feature.set(prop, originalProperties[prop]);
                if (purge) {
                    delete this.scenarioData[prop];
                }
            }
        }

        this.checkScenarioData();
    }

    /**
     * Retrieves the original location of a feature and resets its position on the map
     * @param {Boolean} [purge=false] - whether to clear the stored scenario geometry definitively
     * @returns {void}
     */
    resetLocation (purge = false) {
        const originalGeom = this.feature.get("originalData").geometry;

        if (originalGeom) {
            translateFeature(this.feature, originalGeom);

            if (this.guideLayer) {
                removeSimulationTag(this.feature, this.guideLayer);
                addSimulationTag(this.feature, this.guideLayer);
            }

            if (purge) {
                delete this.scenarioData.geometry;
                this.checkScenarioData();
            }
        }
    }

    /**
     * Checks if the scenario data has any content
     * @returns {void}
     */
    checkScenarioData () {
        if (Object.keys(this.scenarioData).length === 0) {
            this.feature.unset("isModified");
            unByKey(this.eventKeys.modifier);
        }
    }

    /**
     * Clears scenario data
     * @returns {void}
     */
    clearScenarioData () {
        this.scenarioData = {};
        this.feature.unset("isModified");
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

        /**
         * @todo outsource to own method, merge with render event?
         */
        this.eventKeys.modifier = getClusterSource(this.layer).on("change", () => {
            const source = getClusterSource(this.layer);

            if (!source.hasFeature(this.feature) && this.scenario.isActive) {
                const replace = source.getFeatureById(this.feature.getId());

                if (replace) {
                    source.removeFeature(replace);
                }

                source.addFeature(this.feature);
            }
        });
        this.feature.set("isModified", true);
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
