import {
    union as turfUnion,
    intersect as turfIntersect,
    circle as turfCircle,
    centroid as turfCentroid,
    centerOfMass as turfCenterOfMass
} from "@turf/turf";
import {GeoJSON} from "ol/format";
import {getCenter} from "ol/extent";

/**
 * Gets the centroid of any OL feature
 * @param {module:ol/Feature} feature - the polygon feature to get the centroid of
 * @param {String} [sourceCrs="EPSG:25832"] - the CRS of the input
 * @param {String} [targetCrs="EPSG:4326"] - the CRS of the output
 * @returns {[Number, Number]} the centroid coord
 */
export function getCenterOfMass (feature, sourceCrs = "EPSG:25832", targetCrs = "EPSG:4326") {
    const
        parser = new GeoJSON({
            dataProjection: targetCrs,
            featureProjection: sourceCrs
        }),
        geojson = parser.writeFeatureObject(feature),
        centroid = turfCenterOfMass(geojson);

    return centroid?.geometry.coordinates;
}

/**
 * Gets the centroid of any OL feature
 * @param {module:ol/Feature} feature - the polygon feature to get the centroid of
 * @param {String} [sourceCrs="EPSG:25832"] - the CRS of the input
 * @param {String} [targetCrs="EPSG:4326"] - the CRS of the output
 * @returns {[Number, Number]} the centroid coord
 */
export function getCentroid (feature, sourceCrs = "EPSG:25832", targetCrs = "EPSG:4326") {
    const
        parser = new GeoJSON({
            dataProjection: targetCrs,
            featureProjection: sourceCrs
        }),
        geojson = parser.writeFeatureObject(feature),
        centroid = turfCentroid(geojson);

    return centroid?.geometry.coordinates;
}

/**
 * Checks which district contains a given feature
 * @param {DistrictLevel} districtLevels - the districtLevels to check
 * @param {module:ol/Feature} feature - the feature to check against
 * @param {Boolean} [multiple=false] - defines whether multiple results are possible, returns the first result if false
 * @returns {String|module:ol/Feature} the districts name or the district feature
 */
export function getAllContainingDistricts (districtLevels, feature, multiple = false) {
    const containingDistricts = [];

    for (const districtLevel of districtLevels) {
        for (const district of districtLevel.districts) {
            const geom = district.adminFeature?.getGeometry(),
                featureExtent = feature.getGeometry().getExtent();

            if (!geom || geom.intersectsExtent(featureExtent)) {
                containingDistricts.push({
                    districtLevel: districtLevel.label,
                    district: district
                });

                if (!multiple) {
                    break;
                }
            }
        }

    }

    return multiple ? containingDistricts : containingDistricts[0];
}

/**
 * Checks which district contains a given feature
 * @param {DistrictLevel} districtLevel - the districtLevel to check
 * @param {module:ol/Feature} feature - the feature to check against
 * @param {Boolean} [returnsFeature=true] - defines whether to return a String or the Feature Object
 * @param {Boolean} [multiple=false] - defines whether multiple results are possible, returns the first result if false
 * @returns {String|module:ol/Feature} the districts name or the district feature
 */
export function getContainingDistrictForFeature (districtLevel, feature, returnsFeature = true, multiple = false) {
    const containingDistricts = [];

    for (const district of districtLevel.districts) {
        const geom = district.adminFeature.getGeometry(),
            featureExtent = feature.getGeometry().getExtent(),
            featureCenter = getCenter(featureExtent);

        if (multiple) {
            if (geom.intersectsExtent(featureExtent)) {
                containingDistricts.push(returnsFeature ? district : district.getName());
            }
        }
        else if (geom.intersectsCoordinate(featureCenter)) {
            containingDistricts.push(returnsFeature ? district : district.getName());
            break;
        }
    }

    return multiple ? containingDistricts : containingDistricts[0];
}

/**
 * Checks which district contains a given extent
 * @param {DistrictLevel} districtLevel - the districtLevel to check
 * @param {module:ol/extent} extent - the extent to check against
 * @param {Boolean} [returnsFeature=true] - defines whether to return a String or the Feature Object
 * @param {Boolean} [multiple=false] - defines whether multiple results are possible, returns the first result if false
 * @returns {String|module:ol/Feature} the districts name or the district feature
 */
export function getContainingDistrictForExtent (districtLevel, extent, returnsFeature = true, multiple = false) {
    const containingDistricts = [];

    for (const district of districtLevel.districts) {
        const geom = district.adminFeature.getGeometry();

        if (geom.intersectsExtent(extent)) {
            containingDistricts.push(returnsFeature ? district : district.getName());

            if (!multiple) {
                break;
            }
        }
    }

    return multiple ? containingDistricts : containingDistricts[0];
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
 * Creates a new feature as a boolean intersection of two features
 * @param {module:ol/Feature[]} features - the OL features to intersect
 * @param {Boolean} [resetProperties=false] - defines whether to reset the new feature's properties to empty
 * @param {Boolean} [returnsFeature=false] - defines whether to return an OL feature or a simple GeoJSON
 * @param {String} [sourceCrs="EPSG:25832"] - the CRS of the input
 * @param {String} [targetCrs="EPSG:4326"] - the CRS of the output
 * @returns {module:ol/Feature | GeoJSONFeatureCollection} the feature or GeoJSON
 */
export function intersect (features, resetProperties = false, returnsFeature = false, sourceCrs = "EPSG:25832", targetCrs = "EPSG:4326") {
    const parser = new GeoJSON({
            dataProjection: targetCrs,
            featureProjection: sourceCrs
        }),
        geojson = parser.writeFeaturesObject(features);
    let intersectionFeature = geojson.features[0];

    // intersect features
    for (let i = 1; i < geojson.features.length; i++) {
        intersectionFeature = turfIntersect(intersectionFeature, geojson.features[i]);
    }

    if (intersectionFeature) {
        // reset the feature's properties
        if (resetProperties) {
            intersectionFeature.properties = {};
        }
        // parse to OL feature
        if (returnsFeature) {
            intersectionFeature = parser.readFeature(intersectionFeature);
        }
    }

    return intersectionFeature;
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

/**
 * Converts a circle, defined by center and radius to a apporx. polygon
 * @param {module:ol/geom/Circle} circle - the original geometry
 * @param {String} [steps=64] - the number of edge points
 * @param {String} [crs="EPSG:25832"] - the CRS of the input
 * @returns {module:ol/geom/Polygon} the OL Polygon result
 */
export function circleToPolygon (circle, steps = 64, crs = "EPSG:25832") {
    const
        parser = new GeoJSON({
            dataProjection: "EPSG:4326",
            featureProjection: crs
        }),
        _circle = circle.clone().transform(crs, "EPSG:4326"),
        center = _circle.getCenter(),
        radius = circle.getRadius() / 1000, // m => km
        polygon = turfCircle(center, radius, {steps});

    return parser.readFeature(polygon).getGeometry();
}

export default {
    featureToGeoJson,
    featuresToGeoJsonCollection,
    intersect,
    union,
    getContainingDistrictForFeature
};

