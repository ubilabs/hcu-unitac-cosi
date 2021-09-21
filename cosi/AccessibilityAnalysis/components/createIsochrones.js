import requestIsochrones from "./requestIsochrones";
import {readFeatures} from "./util.js";

/**
     * create isochrones features
     * @returns {void}
     */
export async function createIsochrones ({mode, transportType, coordinate, scaleUnit, distance}) {
    if (mode === "point") {
        return createIsochronesPoint(transportType, coordinate, scaleUnit, distance);
    }

    // await this.createIsochronesRegion();
}

let abortController;

/**
     * TODO: see TODOs in createIsochronesRegion
     * create isochrones features for selected several coordiantes
     * @returns {void}
     */
async function createIsochronesPoint (transportType, coordinate, scaleUnit, distance) {
    if (abortController) {
        abortController.abort();
    }
    abortController = new AbortController();

    const range = scaleUnit === "time" ? distance * 60 : distance,

        // abortController = createAbortController();

        json = await requestIsochrones(
            transportType,
            [coordinate],
            scaleUnit,
            [range / 3, range * 2 / 3, range],
            abortController.signal
        ),
        d = parseFloat(distance),
        steps = [d / 3, d * 2 / 3, d].map((n) => Number.isInteger(n) ? n.toString() : n.toFixed(2)),

        // reverse JSON object sequence to render the isochrones in the correct order
        reversedFeatures = [...json.features].reverse(),
        featureType = "Erreichbarkeit ab einem Referenzpunkt";

    json.features = reversedFeatures;

    let newFeatures = readFeatures(JSON.stringify(json));

    newFeatures = transformFeatures(
        newFeatures,
        "EPSG:4326",
        "EPSG:25832"
    );

    newFeatures.forEach((feature) => {
        feature.set("featureType", featureType);
    });

    return {steps, features: newFeatures};

}

/**
     * Transforms features between CRS
     * @param   {feature[]} features Array of ol.features
     * @param   {string}    crs      EPSG-Code of feature
     * @param   {string}    mapCrs   EPSG-Code of ol.map
     * @returns {void}
     */
function transformFeatures (features, crs, mapCrs) {
    features.forEach(function (feature) {
        const geometry = feature.getGeometry();

        if (geometry) {
            geometry.transform(crs, mapCrs);
        }
    });
    return features;
}

