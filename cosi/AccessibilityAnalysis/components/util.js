import {
    Fill,
    Stroke,
    Style
} from "ol/style.js";
import GeoJSON from "ol/format/GeoJSON";
import * as turf from "@turf/turf";

export function fetchIsochroneFeatures(coordinates, transportType, scaleUnit, distance) {
    const range = scaleUnit === "time" ? distance * 60 : distance;

    // group coordinates into groups of 5
    const coordinatesList = []
    for (let i = 0; i < coordinates.length; i += 5) {
        const arrayItem = coordinates.slice(i, i + 5);
        coordinatesList.push(arrayItem);
    }
    // each group of 5 coordinates
    const promiseList = [];
    coordinatesList.forEach(coordinates => {
        promiseList.push(Radio.request("OpenRoute", "requestIsochrones", transportType, coordinates, scaleUnit,
                [range, range * 0.67, range * 0.33])
            .then(res => {
                // reverse JSON object sequence to render the isochrones in the correct order
                // this reversion is intended for centrifugal isochrones (when range.length is larger than 1)
                const json = JSON.parse(res),
                    reversedFeatures = [...json.features].reverse(),
                    groupedFeatures = [
                        [],
                        [],
                        []
                    ];

                for (let i = 0; i < reversedFeatures.length; i = i + 3) {
                    groupedFeatures[i % 3].push(reversedFeatures[i]);
                    groupedFeatures[(i + 1) % 3].push(reversedFeatures[i + 1]);
                    groupedFeatures[(i + 2) % 3].push(reversedFeatures[i + 2]);
                }
                json.features = reversedFeatures;
                return groupedFeatures;
            }));
    });
    return Promise.all(promiseList).then((groupedFeaturesList) => {
        for (let i = 0; i < 3; i++) {
            let layeredList = groupedFeaturesList.map(groupedFeatures => groupedFeatures[i]);

            layeredList = [].concat(...layeredList);
            let layerUnion = layeredList[0];

            for (let j = 0; j < layeredList.length; j++) {
                layerUnion = turf.union(layerUnion, layeredList[j]);
            }
            let layerUnionFeatures = parseDataToFeatures(JSON.stringify(layerUnion));
            layerUnionFeatures = transformFeatures(layerUnionFeatures, "EPSG:4326", "EPSG:25832");

            const featureType = "Erreichbarkeit im Gebiet"
            layerUnionFeatures.forEach(feature => {
                feature.set("featureType", featureType)
            });
            styleFeatures(layerUnionFeatures);
            return layerUnionFeatures;
        }
    });
}

function parseDataToFeatures(data) {
    const geojsonReader = new GeoJSON();
    let jsonObjects;
    jsonObjects = geojsonReader.readFeatures(data);
    return jsonObjects;
}

function transformFeatures(features, crs, mapCrs) {
    features.forEach(function (feature) {
        const geometry = feature.getGeometry();
        if (geometry) {
            geometry.transform(crs, mapCrs);
        }
    });
    return features;
}

function styleFeatures(features, coordinate) {
    for (let i = 0; i < features.length; i++) {
        features[i].setProperties({
            coordinate
        });
        features[i].setStyle(
            new Style({
                fill: new Fill({
                    color: getFeatureColors()[i],
                }),
                stroke: new Stroke({
                    color: "white",
                    width: 1,
                }),
            })
        );
    }
}

function getFeatureColors() {
    return [
        "rgba(200, 0, 3, 0.1)",
        "rgba(100, 100, 3, 0.15)",
        "rgba(0, 200, 3, 0.2)",
    ]
}
