/* eslint-disable new-cap */
import store from "../../../../src/app-store";

/**
 * Sets necessary properties on the feature, beautifies keys
 * @param {*} feature - todo
 * @returns {void}
 */
export default function prepareStatsFeatures (feature) {
    const mappingObject = store.getters["Tools/DistrictLoader/findMappingObjectByCategory"](feature.get("kategorie"));

    feature.unset("geom"); // fallback for accidentially loaded geometries
    feature.set("kategorie", mappingObject.value);
    feature.set("group", mappingObject.group);
}
