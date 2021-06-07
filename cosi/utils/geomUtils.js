import store from "../../../src/app-store";
import {union as turfUnion} from "@turf/turf";
import {GeoJSON} from "ol/format";

/**
 * Checks which district contains a given feature
 * @param {*} districtFeatures - the districts to check
 * @param {*} feature - the feature to check against
 * @param {String} [keyOfAttrName] - defines the key of the attribute "name" to return for the district, if undefined the store value is used.
 * @param {Boolean} [returnsFeature=false] - defines whether to return a String or the Feature Object
 * @returns {String|module:ol/Feature} the districts name or the district feature
 */
export function getContainingDistrictForFeature (districtFeatures, feature, keyOfAttrName, returnsFeature = false) {
    const _keyOfAttrName = keyOfAttrName || store.getters["Tools/DistrictSelector/keyOfAttrName"];

    for (const district of districtFeatures) {
        const geom = district.getGeometry(),
            featureExtent = feature.getGeometry().getExtent();

        if (geom.intersectsExtent(featureExtent)) {
            return returnsFeature ? district : district.get(_keyOfAttrName);
        }
    }

    return false;
}

/**
 * Creates a new feature as a boolean union of a set of features
 * @param {module:ol/Feature[]} features - the OL features to join
 * @param {Boolean} [resetProperties=false] - defines whether to reset the new feature's properties to empty
 * @param {Boolean} [returnsFeature=false] - defines whether to return an OL feature or a simple GeoJSON
 * @param {String} [sourceCrs="EPSG:25832"] - the CRS of the input
 * @param {String} [targetCrs="EPSG:4326"] - the CRS of the output
 * @returns {module:ol/Feature | GeoJSONFeatureCollection} the feature or GeoJSON
 */
export function union (features, resetProperties = false, returnsFeature = false, sourceCrs = "EPSG:25832", targetCrs = "EPSG:4326") {
    const parser = new GeoJSON({
            dataProjection: targetCrs,
            featureProjection: sourceCrs
        }),
        geojson = parser.writeFeaturesObject(features);
    let unionFeature = geojson.features[0];

    // join features
    for (let i = 1; i < geojson.features.length; i++) {
        unionFeature = turfUnion(unionFeature, geojson.features[i]);
    }
    // reset the feature's properties
    if (resetProperties) {
        unionFeature.properties = {};
    }
    // parse to OL feature
    if (returnsFeature) {
        unionFeature = parser.readFeature(unionFeature);
    }

    return unionFeature;
}

/**
 * Parses an OL feature to a raw geojson object or string
 * @param {module:ol/Feature} feature - the feature to convert
 * @param {Boolean} [asString=false] - defines whether the result should be returned as Object or String
 * @param {String} [sourceCrs="EPSG:25832"] - the CRS of the input
 * @param {String} [targetCrs="EPSG:4326"] - the CRS of the output
 * @returns {GeoJSONFeature | String} the converted feature as GeoJSON
 */
export function featureToGeoJson (feature, asString = false, sourceCrs = "EPSG:25832", targetCrs = "EPSG:4326") {
    const parser = new GeoJSON({
        dataProjection: targetCrs,
        featureProjection: sourceCrs
    });

    return asString ? parser.writeFeature(feature) : parser.writeFeatureObject(feature);
}

/**
 * Parses an OL feature to a raw geojson featureCollection object or string
 * @param {module:ol/Feature | module:ol/Feature[]} features - the feature or features to convert
 * @param {Boolean} [asString=false] - defines whether the result should be returned as Object or String
 * @param {String} [sourceCrs="EPSG:25832"] - the CRS of the input
 * @param {String} [targetCrs="EPSG:4326"] - the CRS of the output
 * @returns {GeoJSONFeatureCollection | String} the converted features as GeoJSON featureCollection
 */
export function featuresToGeoJsonCollection (features, asString = false, sourceCrs = "EPSG:25832", targetCrs = "EPSG:4326") {
    const parser = new GeoJSON({
            dataProjection: targetCrs,
            featureProjection: sourceCrs
        }),
        _features = Array.isArray(features) ? features : [features];

    return asString ? parser.writeFeatures(_features) : parser.writeFeaturesObject(_features);
}
