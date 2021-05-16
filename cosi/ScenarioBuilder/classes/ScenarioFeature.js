import getClusterSource from "../../utils/getClusterSource";
import {addSimulationTag, removeSimulationTag} from "../utils/guideLayer";

/**
 * @class ScenarioFeature
 */
export default class ScenarioFeature {
    /**
     * Constructor for class ScenarioFeature
     * @param {module:ol/Feature} feature the OpenLayers Feature created
     * @param {module:ol/layer/Vector} layer the OpenLayers Layer the feature is bound to
     */
    constructor (feature, layer) {
        this.feature = feature;
        this.layer = layer;
        this.scenarioData = {};
    }

    /**
     * Renders the feature to the map and tags it if a guidelayer is provided
     * @todo store tag on the class?
     * @param {module:ol/layer/Vector} guideLayer - the guideLayer to draw tags to
     * @returns {void}
     */
    renderFeature (guideLayer) {
        getClusterSource(this.layer).addFeature(this.feature);

        if (guideLayer || this.guideLayer) {
            this.guideLayer = guideLayer || this.guideLayer;
            addSimulationTag(this.feature, this.guideLayer);
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
}

/**
 * @class SimulatedFeature
 * @extends ScenarioFeature
 */
export class SimulatedFeature extends ScenarioFeature {
    // add specific stuff here
    // move render and hideFeature methods
}

/**
 * @class ModifiedFeature
 * @extends ScenarioFeature
 */
export class ModifiedFeature extends ScenarioFeature {
    // add specific stuff here
}
