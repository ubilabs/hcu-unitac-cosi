import mapping from "../../assets/mapping.json";

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
