
import {union, featuresToGeoJsonCollection, featureToGeoJson} from "../../utils/geomUtils";
import {downloadJsonToFile} from "../../utils/download";
import store from "../../../../src/app-store";

/**
 * Gets the map's CRS from the app-store
 * @returns {String} the map's current CRS code
 */
function getPortalCrs () {
    return store.getters["Map/projectionCode"];
}

/**
 * Gets the current key of the attribute "name" from the DistrictSelector
 * @returns {String} the key of the attribute "name"
 */
function getKeyOfAttrName () {
    return store.getters["Tools/DistrictSelector/keyOfAttrName"];
}

/**
 * Exports the results of the supply analysis as geojson
 * @param {*} results - the results of the analysis
 * @param {*} districts - the district features for geometry
 * @returns {void}
 */
export function exportAsGeoJson (results, districts, layerList, selectedFieldA, selectedFieldB) {
    const projectionCode = getPortalCrs(),
        total = results.find(res => res.scope === "Gesamt"),
        average = results.find(res => res.scope === "Durchschnitt"),
        featureCollection = featuresToGeoJsonCollection(districts, false, projectionCode);
        //unionFeature = union(districts, true, false, projectionCode);

    // match the result and add it to the resp. geoJSON
    for (const feature of featureCollection.features) {
        const result = results.find(res => res.scope === feature.properties[getKeyOfAttrName()]);

        feature.properties = {...feature.properties, ...result, total, average};
        delete feature.properties.stats;
    }

    for (const field of [selectedFieldA, selectedFieldB]) {
        const layerFeatures = layerList.find(layer => layer.get("name") === field.id).getSource().getFeatures();
        for (const feature of layerFeatures) {
            const featureGeoJson = featureToGeoJson(feature);
            featureGeoJson.properties = {};
            featureCollection.features.push(featureGeoJson);
        }
    }

    // set the properties of the union to the "totals" of the analysis and adds average as separate property
    //unionFeature.properties = {
    //    ...total,
    //    average
    //};

    // add the union to the collection
    //featureCollection.features.push(unionFeature);
    console.log(featureCollection);
    downloadJsonToFile(featureCollection, "Versorgungsanalyse_CoSI.geojson");
}
