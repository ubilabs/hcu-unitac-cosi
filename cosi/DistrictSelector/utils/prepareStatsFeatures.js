import mapping from "../../assets/mapping.json";
import Feature from "ol/Feature";

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
 * @param {String} keyOfAttrName - The key for the attribute containing the name of the district.
 * @returns {module:ol/feature[]} The statistical features.
 */
export function createStatFeaturesFromLTF (ltfFeatures, keyOfAttrName) {
    const statFeatureList = [],
        mappingLtf = mapping.filter(obj => obj.ltf);

    mappingLtf.forEach(obj => {
        const statFeature = new Feature({
            kategorie: obj.value,
            group: obj.group
        });

        statFeature.set(keyOfAttrName, ltfFeatures[0].get(keyOfAttrName));
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
