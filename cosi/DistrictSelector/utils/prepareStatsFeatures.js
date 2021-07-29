import mapping from "../../assets/mapping.json";

/**
 * Sets necessary properties on the feature, beautifies keys
 * @param {*} feature - todo
 * @returns {void}
 */
export default function prepareStatsFeatures (feature) {
    const mappingObject = findMappingObjectByCategory(feature.get("kategorie"));

    feature.unset("geom"); // fallback for accidentially loaded geometries
    feature.set("kategorie", mappingObject.value);
    feature.set("group", mappingObject.group);
}

/**
 * finds a mapping object by its category
 * @param {String} value - the category to search by
 * @returns {object} the mapping object
 */
export function findMappingObjectByCategory (value) {
    return mapping.find(obj => {
        return obj.category === value;
    });
}
