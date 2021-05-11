import {Stroke, Style, Text} from "ol/style.js";
import Feature from "ol/Feature";
import VectorLayer from "ol/layer/Vector";
// import {unpackCluster, isCluster} from "../../utils/getClusterSource";

/**
 * Style function for the guide layer
 * @param {module:ol/Feature} feature - the simulated feature
 * @returns {Function} the style function
 */
export function featureTagStyle (feature) {
    return new Style({
        text: new Text({
            font: "18px bold sans-serif",
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
 * @returns {void}
 */
export function addSimulationTag (feature, layer) {
    if (!(feature.constructor === Feature && layer.constructor === VectorLayer)) {
        console.warn(`addSimulationTag: Layer must be of type "ol/Layer/Vector", got ${layer.constructor}. Feature must be of type "ol/Feature, got ${feature.constructor}`);
        return;
    }
    const source = layer.getSource(),
        clonedFeature = feature.clone();

    // give the simulation tag the identical ID as the referenced feature for retrieval
    clonedFeature.setId(feature.getId());
    // link their geometries (works only if the original layer is NOT clustered)
    clonedFeature.setGeometry(feature.getGeometry());

    source.addFeature(clonedFeature);
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

// /**
//  * Updates the position of any tags linked to features
//  * Compensates for missing geom references in clustered layers
//  * @deprecated
//  * @param {module:ol/Feature} originalFeature the feature moved or changed
//  * @param {module:ol/layer/Vector} layer the guide layer
//  * @returns {void}
//  */
// export function updateSimulationTags (originalFeature, layer) {
//     if (!isCluster(originalFeature)) {
//         return; // if the original feature is not a cluster no action is necessary
//     }
//     const cluster = unpackCluster(originalFeature),
//         source = layer.getSource();
//     let feature, featureId, boundFeature;

//     for (feature of cluster) {
//         featureId = feature.getId();
//         boundFeature = featureId ? source.getFeatureById(featureId) : undefined;

//         if (boundFeature) {
//             boundFeature.setGeometry(originalFeature.getGeometry());
//         }
//     }
// }

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
