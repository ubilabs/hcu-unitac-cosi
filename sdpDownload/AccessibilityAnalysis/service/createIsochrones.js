import requestIsochrones from "./requestIsochrones";
import {readFeatures} from "../components/util.js";
import * as turf from "@turf/turf";
import axios from "axios";
import * as Proj from "ol/proj.js";

let abortController,
    filterPoly;


/**
 *
 * @return {*} filterPoly
 */
export function getFilterPoly () {
    return filterPoly;
}

/**
 *
 * @export
 * @param {*} coords coords
 * @return {void}
 */
export function setFilterPoly (coords) {
    filterPoly = turf.polygon(coords);
}


/**
 * create isochrones features
 * @export
 * @param {*} {transportType, coordinates, scaleUnit, distance} parameters
 * @param {*} progress progress callback
 * @return {*} features
 */
export async function createIsochrones ({transportType, coordinates, scaleUnit, distance, batchSize}, progress) {
    let ret;

    if (coordinates.length === 1) {
        progress(50);
        ret = await createIsochronesPoint(transportType, coordinates[0], scaleUnit, distance);
        progress(100);
        return ret;
    }
    return createIsochronesPoints(transportType, coordinates, scaleUnit, distance, null, batchSize || 200, progress);
}

/**
 * create isochrones features for selected several coordiantes
 * @param {*} transportType transportType
 * @param {*} coordinate coordinate
 * @param {*} scaleUnit scaleUnit
 * @param {*} distance distance
 * @return {*} steps and features
 */
async function createIsochronesPoint (transportType, coordinate, scaleUnit, distance) {
    if (abortController) {
        abortController.cancel();
    }
    abortController = axios.CancelToken.source();

    const range = scaleUnit === "time" ? distance * 60 : distance,
        json = await requestIsochrones(
            transportType,
            [coordinate],
            scaleUnit,
            [range / 3, range * 2 / 3, range],
            abortController
        ),

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
        feature.set("coordinate", [coordinate]);
    });

    return newFeatures;
}

/**
 * create isochrones features for selected several coordiantes
 * @param {*} transportType transportType
 * @param {*} coordinates coordinates
 * @param {*} scaleUnit scaleUnit
 * @param {*} distance distance
 * @param {*} selectedFacilityName selectedFacilityName
 * @param {*} batchSize batchSize
 * @param {*} progress progress callback
 * @return {*} features
 */
async function createIsochronesPoints (transportType, coordinates, scaleUnit, distance, selectedFacilityName, batchSize, progress) {

    progress(1);

    if (abortController) {
        abortController.cancel();
    }
    abortController = axios.CancelToken.source();

    const range = scaleUnit === "time" ? distance * 60 : distance,

        // group coordinates into groups of 5
        coordinatesList = [],
        groupedFeaturesList = [],
        filteredCoordinates = filterPoly === undefined ? coordinates :
            coordinates.filter(c => turf.booleanPointInPolygon(
                Proj.transform(c, "EPSG:4326", "EPSG:25832"), filterPoly));

    for (let i = 0; i < filteredCoordinates.length; i += batchSize) {
        const arrayItem = filteredCoordinates.slice(i, i + batchSize);

        coordinatesList.push(arrayItem);
    }

    let k = 0,
        features = [];

    for (const coords of coordinatesList) {
        try {
            const json = await requestIsochrones(transportType, coords, scaleUnit,
                    [range, range * 2 / 3, range / 3], abortController),
                // reverse JSON object sequence to render the isochrones in the correct order
                // this reversion is intended for centrifugal isochrones (when range.length is larger than 1)
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
            groupedFeaturesList.push(groupedFeatures);
        }
        catch (e) {
            if (e.response.data.error.code !== 3099) {
                throw e;
            }
        }
        progress(((k + 1) / coordinatesList.length) * 90);
        k++;
    }

    if (groupedFeaturesList.length) {
        for (let i = 0; i < 3; i++) {
            let layeredList = groupedFeaturesList.map(groupedFeatures => groupedFeatures[i]),
                layerUnion,
                layerUnionFeatures;

            layeredList = [].concat(...layeredList);
            layerUnion = layeredList[0];

            for (let j = 0; j < layeredList.length; j++) {
                try {
                    layerUnion = turf.union(layerUnion, layeredList[j]);
                }
                catch (e) {
                    console.error(e); // turf chokes one some resulting geometries
                }
            }
            layerUnionFeatures = readFeatures(JSON.stringify(layerUnion));

            // TODO: get projections via arguments and/or store
            layerUnionFeatures = transformFeatures(layerUnionFeatures, "EPSG:4326", "EPSG:25832");

            const featureType = "Erreichbarkeit im Gebiet";

            // TODO: add props to layers, like type of facility, unit of measured distance
            layerUnionFeatures.forEach(feature => {
                feature.set("featureType", featureType);
                feature.set("value", layeredList[0].properties.value);
                feature.set("mode", transportType);
                feature.set("unit", scaleUnit);
                feature.set("topic", selectedFacilityName);
            });
            features = features.concat(layerUnionFeatures);
        }
    }
    progress(100);
    return features;
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
