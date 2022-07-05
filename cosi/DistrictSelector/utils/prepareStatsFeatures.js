import mapping from "../../assets/mapping.json";
import Feature from "ol/Feature";

/**
 * Parses the stats from olFeatures to the district object
 * @param {Array<module:ol/Feature>} olFeatures - the parsed features from WFS
 * @param {Object} district - the district to append the data to
 * @param {Object} districtLevel - the current districtLevel
 * @returns {void}
 */
export function parseFeatures (olFeatures, district, districtLevel) {
    /**
     * parse LTF
     * @todo refactor
     */
    try {
        const features = createStatFeaturesFromLTF(olFeatures, districtLevel);

        // add statFeatures to district
        district.statFeatures.push(...features);
        // store original data on the district as a copy
        district.originalStatFeatures.push(...features.map(f => f.clone()));
    }
    /**
     * try old timeline format alternatively
     */
    catch {
        olFeatures.forEach(prepareStatsFeatures);

        // add statFeatures to district
        district.statFeatures.push(...olFeatures);
        // store original data on the district as a copy
        district.originalStatFeatures = olFeatures.map(f => f.clone());
    }
}

/**
 * Sets necessary properties on the feature, beautifies keys.
 * @param {module:ol/feature} feature -
 * @returns {void}
 */
export function prepareStatsFeatures (feature) {
    const mappingObject = findMappingObjectByCategory(feature.get("kategorie"));

    feature.unset("geom"); // fallback for accidentially loaded geometries
    if (typeof mappingObject !== "undefined") {
        feature.set("kategorie", mappingObject.value);
        feature.set("group", mappingObject.group);
    }
}

/**
 * Creates new statistical features from the loaded long table format features.
 * @param {module:ol/feature[]} ltfFeatures - long table format features.
 * @param {Object} districtLevel - the current districtLevel
 * @returns {module:ol/feature[]} The statistical features.
 */
export function createStatFeaturesFromLTF (ltfFeatures, districtLevel) {
    const statFeatureList = [],
        mappingLtf = mapping.filter(obj => obj.ltf);

    mappingLtf.forEach(obj => {
        const statFeature = new Feature({
            kategorie: obj.value,
            group: obj.group
        });

        statFeature.set(districtLevel.stats.keyOfAttrName, ltfFeatures[0].get(districtLevel.stats.keyOfAttrName));
        if (districtLevel.referenceLevel) {
            statFeature.set(districtLevel.referenceLevel.stats.keyOfAttrName, ltfFeatures[0].get(districtLevel.referenceLevel.stats.keyOfAttrName));
        }
        ltfFeatures.forEach(feature => {
            statFeature.set("jahr_" + feature.get("jahr"), feature.get(obj.category));
        });
        statFeatureList.push(statFeature);
    });

    return statFeatureList;
}

/**
 * Finds a mapping object by its category.
 * @param {String} value - The category to search by.
 * @returns {object} The mapping object.
 */
export function findMappingObjectByCategory (value) {
    if (typeof value !== "string") {
        console.error(`prepareStatFeatures.findMappingObjectByCategory: ${value} has to be defined and a string.`);
        return undefined;
    }
    return mapping.find(obj => {
        return obj.category === value;
    });
}
