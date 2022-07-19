import BuildSpec from "./../../../src/modules/tools/print/utils/buildSpec";
import store from "../../../src/app-store";

/**
 * Parses the layers into mapfisch format
 * @param {[ol/layer, opacity]} layerList the printed layer and its opacity in an Array list
 * @returns {ol/layer[]} the parsed layers in an Array for mapfish
 */
async function buildLayers (layerList) {
    const layers = [],
        currentResolution = store.getters["Maps/getView"].getResolution();

    if (Array.isArray(layerList)) {
        for (const layer of layerList) {
            const printLayers = [];

            if (!Array.isArray(layer) || layer.length !== 2) {
                return [];
            }

            printLayers.push(await BuildSpec.buildLayerType(layer[0], currentResolution));
            printLayers.forEach(printLayer => {
                if (typeof printLayer !== "undefined") {
                    printLayer.opacity = layer[1];
                    layers.push(printLayer);
                }

            });
        }
    }

    return layers;
}

export {
    buildLayers
};
