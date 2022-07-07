import BuildSpec from "./../../../src/modules/tools/print/utils/buildSpec";
import store from "../../../src/app-store";

/**
 * Parses the layers into mapfisch format
 * @param {ol/layer[]} layerList the layers in an Array list
 * @returns {ol/layer[]} the parsed layers in an Array for mapfish
 */
async function buildLayers (layerList) {
    const layers = [],
        currentResolution = store.getters["Maps/getView"].getResolution();

    if (Array.isArray(layerList)) {
        for (const layer of layerList) {
            const printLayers = [];

            printLayers.push(await BuildSpec.buildLayerType(layer, currentResolution));
            printLayers.forEach(printLayer => {
                if (typeof printLayer !== "undefined") {
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
