import isObject from "../../../src/utils/isObject.js";

/**
 * Gets the printed layers from layer Ids
 * @param {String[]} layerIds the layer id
 * @param {Number} dpi the dpi to use for all layers
 * @returns {[ol/layer, opacity]} printedLayers the printed layer and its opacity in an Array list
 */
export default function getPrintedLayers (layerIds, dpi) {
    const printedLayers = [];

    if (Array.isArray(layerIds) && layerIds.length) {
        layerIds.forEach(id => {
            if (typeof id !== "string" && !isObject(id)) {
                return;
            }

            const layerId = typeof id === "string" ? id : Object.keys(id)[0],
                opacity = isObject(id) ? id[layerId] : 1;
            let layer = {};

            Radio.trigger("ModelList", "addModelsByAttributes", {id: layerId});
            layer = Radio.request("ModelList", "getModelByAttributes", {id: layerId})?.layer;

            if (typeof layer !== "undefined") {
                printedLayers.push({layer, opacity, dpi});
            }
        });
    }

    return printedLayers;
}
