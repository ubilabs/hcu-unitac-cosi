import {union, featuresToGeoJsonCollection, featureToGeoJson} from "../../utils/geomUtils";
import {downloadJsonToFile} from "../../utils/download";
import store from "../../../../src/app-store";
import getColorScale from "../../../utils/colorScale.js";
import utils from "../../utils";
import {Fill, Stroke, Style, Text} from "ol/style.js";

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
        featureCollection = featuresToGeoJsonCollection(districts, false, projectionCode),
        values = results.map(x => { return x.coverage }),
        colorScale = getColorScale(values);
    
    // match the result and add it to the resp. geoJSON
    for (const feature of featureCollection.features) {
        const result = results.find(res => res.scope === feature.properties[getKeyOfAttrName()]),
            getStyling = new Object();
        
        getStyling.fill = new Fill({color: utils.getRgbArray(colorScale.scale(result.coverage), 0.75)});
        getStyling.zIndex = 1;
        getStyling.text = new Text({
            font: "16px Calibri,sans-serif",
            fill: new Fill({
                color: [255, 255, 255]
            }),
            stroke: new Stroke({
                color: [0, 0, 0],
                width: 3
            }),
            text: result.coverage ? parseFloat(result.coverage).toLocaleString("de-DE") : "Keine Daten vorhanden"
        });
        const style = new Style(getStyling);
        feature.properties = {...feature.properties, paramA_name: selectedFieldA.id,
            paramB_name: selectedFieldB.id, ...result, total, average, style};
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
    downloadJsonToFile(featureCollection, "Versorgungsanalyse_CoSI.geojson");
}
