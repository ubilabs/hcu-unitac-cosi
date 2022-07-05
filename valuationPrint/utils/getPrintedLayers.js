/**
 * Gets the printed layers from layer Ids
 * @param {String[]} layerIds the layer id
 * @returns {ol/layer[]} printedLayers the printed layers in an Array list
 */
export default function getPrintedLayers (layerIds) {
    const printedLayers = [];

    if (Array.isArray(layerIds) && layerIds.length) {
        layerIds.forEach(id => {
            Radio.trigger("ModelList", "addModelsByAttributes", {id: id});
            printedLayers.push(Radio.request("ModelList", "getModelByAttributes", {id: id})?.layer);
        });
    }

    return printedLayers;
}
