import {Stroke, Style, Text} from "ol/style.js";
import Feature from "ol/Feature";
import VectorLayer from "ol/layer/Vector";

/**
 * Style function for the guide layer
 * @param {module:ol/Feature} feature - the simulated feature
 * @returns {Function} the style function
 */
export function featureTagStyle (feature) {
    return new Style({
        text: new Text({
            font: "21px bold sans-serif",
            stroke: new Stroke({
                width: 3,
                color: "#fff"
            }),
            text: "*",
            offsetX: 10,
            offsetY: -5,
            placement: feature.getGeometry()?.getType() === "Point" ? "point" : "line"
        })
    });
}

/**
 * adds a new feature to the guidelayer to highlight simulated features
 * @param {module:ol/Feature} feature - the original scenario feature
 * @param {module:ol/Layer/Vector} layer - the drawing layer of the scenario builder
 * @returns {module:ol/Feature | null} the feature of the tag
 */
export function addSimulationTag (feature, layer) {
    if (!(feature.constructor === Feature && layer.constructor === VectorLayer)) {
        console.warn(`addSimulationTag: Layer must be of type "ol/Layer/Vector", got ${layer.constructor}. Feature must be of type "ol/Feature, got ${feature.constructor}`);
        return null;
    }
    const source = layer.getSource(),
        clonedFeature = feature.clone();

    // give the simulation tag the identical ID as the referenced feature for retrieval
    clonedFeature.setId(feature.getId());
    // link their geometries (works only if the original layer is NOT clustered)
    clonedFeature.setGeometry(feature.getGeometry());

    source.addFeature(clonedFeature);

    return clonedFeature;
}

/**
 * removes a feature from the guidelayer by the original feature's ID
 * @param {module:ol/Feature} feature - the original scenario feature
 * @param {module:ol/Layer/Vector} layer - the drawing layer of the scenario builder
 * @returns {void}
 */
export function removeSimulationTag (feature, layer) {
    if (!(feature.constructor === Feature && layer.constructor === VectorLayer)) {
        console.warn(`removeSimulationTag: Layer must be of type "ol/Layer/Vector", got ${layer.constructor}. Feature must be of type "ol/Feature, got ${feature.constructor}`);
        return;
    }
    const source = layer.getSource(),
        clonedFeature = source.getFeatureById(feature?.getId());

    if (clonedFeature) {
        source.removeFeature(clonedFeature);
    }
}

/**
 * Clears all features from the guide layer
 * @param {module:ol/Layer/Vector} layer - the guidelayer
 * @returns {void}
 */
export function clearGuideLayer (layer) {
    if (!layer.constructor === VectorLayer) {
        console.warn(`removeSimulationTag: Layer must be of type "ol/Layer/Vector", got ${layer.constructor}.`);
        return;
    }
    layer.getSource().clear();
}
