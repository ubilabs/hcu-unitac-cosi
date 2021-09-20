import requestIsochrones from "./requestIsochrones";
import {readFeatures} from "./util.js";
import
{
    Fill,
    Stroke,
    Style
} from "ol/style.js";

/**
     * create isochrones features
     * @returns {void}
     */
export async function createIsochrones ({mode, transportType, coordinate, scaleUnit, distance}) {
    // this.clear();
    // try {
    if (mode === "point") {
        return createIsochronesPoint(transportType, coordinate, scaleUnit, distance);
    }

    // await this.createIsochronesRegion();

    // }
    // catch (err) {
    //     console.error(err);
    //     try {
    //         const res = JSON.parse(err.response);

    //         if (res.error.code === 3002) {
    //             this.showErrorInvalidInput();
    //         }
    //         else {
    //             this.showError();
    //         }
    //     }
    //     catch (e) {
    //         this.showError();
    //     }
    // }
}

/**
     * TODO: see TODOs in createIsochronesRegion
     * create isochrones features for selected several coordiantes
     * @returns {void}
     */
async function createIsochronesPoint (transportType, coordinate, scaleUnit, distance) {
    const range = scaleUnit === "time" ? distance * 60 : distance,

        // if (
        //     this.coordinate !== null &&
        //         this.transportType !== "" &&
        //         this.scaleUnit !== "" &&
        //         range !== 0
        // ) {
        //     if (this.abortController) {
        //         this.abortController.abort();
        //     }
        //     this.abortController = this.createAbortController();
        res = await requestIsochrones(
            transportType,
            [coordinate],
            scaleUnit,
            [range / 3, range * 2 / 3, range]
            // this.abortController.signal
        ),
        d = parseFloat(distance),
        steps = [d / 3, d * 2 / 3, d].map((n) => Number.isInteger(n) ? n.toString() : n.toFixed(2));

    // reverse JSON object sequence to render the isochrones in the correct order
    // eslint-disable-next-line one-var
    const json = JSON.parse(res),
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
    styleFeatures(newFeatures, [coordinate]);

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

/**
     * style isochrone features
     * @param {ol.Feature} features isochone features (polygons)
     * @param {array} coordinate todo
     * @returns {void}
     */
function styleFeatures (features, coordinate) {
    for (let i = 0; i < features.length; i++) {
        features[i].setProperties({
            coordinate
        });
        features[i].setStyle(
            new Style({
                fill: new Fill({
                    color: getFeatureColors()[i]
                }),
                stroke: new Stroke({
                    color: "white",
                    width: 1
                })
            })
        );
    }
}

function getFeatureColors () {
    return [
        "rgba(200, 0, 3, 0.1)",
        "rgba(100, 100, 3, 0.15)",
        "rgba(0, 200, 3, 0.2)"
    ];
}
