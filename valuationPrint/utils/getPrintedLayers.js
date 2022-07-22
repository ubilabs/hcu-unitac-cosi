import isObject from "../../../src/utils/isObject.js";

/**
 * Gets the printed layers from layer Ids
 * @param {String[]} layerIds the layer id
 * @returns {[ol/layer, opacity]} printedLayers the printed layer and its opacity in an Array list
 */
export default function getPrintedLayers (layerIds) {
    const printedLayers = [];

    if (Array.isArray(layerIds) && layerIds.length) {
        layerIds.forEach(id => {
            if (typeof id !== "string" && !isObject(id)) {
                return;
            }

            const layerId = typeof id === "string" ? id : Object.keys(id)[0],
                opacity = isObject(id) ? Object.values(id)[0] : 1;
            let layer = {};

            Radio.trigger("ModelList", "addModelsByAttributes", {id: layerId});
            layer = Radio.request("ModelList", "getModelByAttributes", {id: layerId})?.layer;

            if (typeof layer !== "undefined") {
                printedLayers.push([layer, opacity]);
            }
        });
    }

    return printedLayers;
}
