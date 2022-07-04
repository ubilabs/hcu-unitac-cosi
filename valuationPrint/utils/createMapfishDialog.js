import {concatStringByDatakey} from "./translator.concatStringByDatakey";

/**
 * Creates the mapfish dialog from the transformer configuration and the knowledge base.
 * @param {Object} knowledgeBase - The knowledge base.
 * @param {Object} transformer - The configuration of the transformer.
 * @param {String} defaultValue - Used when nothing is present or nothing was found.
 * @returns {Object} The mapfish dialog.
 */
export function createMapfishDialog (knowledgeBase, transformer, defaultValue) {
    const mapfishDialog = {},
        defaultDelimitor = ", ";

    Object.entries(transformer).forEach(([prefix, obj]) => {
        Object.entries(obj).forEach(([postfix, transformerConfig]) => {
            if (transformerConfig.type === "mapWalker") {
                // mapfishDialog[prefix + "." + postfix] = getMapWalker(knowledgeBase[transformerConfig.datakey], transformerConfig.style, tranformerConfig.scale, getServicesByLayerIds(layerIds));
            }
            else if (transformerConfig.type === "mapProportion") {
                // mapfishDialog[prefix + "." + postfix] = getMapProportio(knowledgeBase[transformerConfig.datakey], transformerConfig.style, tranformerConfig.proportion, getServicesByLayerIds(layerIds));
            }
            else if (transformerConfig.type === "mapFixed") {
                // mapfishDialog[prefix + "." + postfix] = getMapFixed(knowledgeBase[transformerConfig.datakey], transformerConfig.style, tranformerConfig.bbox, getServicesByLayerIds(layerIds));
            }
            else if (transformerConfig.type === "concat") {
                const resultConcat = concatStringByDatakey(knowledgeBase, transformerConfig.datakey, transformerConfig.default, defaultValue, transformerConfig.delimitor ? transformerConfig.delimitor : defaultDelimitor);

                if (!(resultConcat instanceof Error)) {
                    mapfishDialog[prefix + "." + postfix] = resultConcat;
                }
            }
            else if (transformerConfig.type === "iterator") {
                if (!(knowledgeBase[transformerConfig.datakey] instanceof Error) && typeof transformerConfig?.idx === "number") {
                    for (let idx = 0; idx < transformerConfig.idx; idx++) {
                        if (Array.isArray(knowledgeBase[transformerConfig.datakey]) && typeof knowledgeBase[transformerConfig.datakey][idx] !== "undefined") {
                            mapfishDialog[prefix + "." + postfix + "." + idx] = knowledgeBase[transformerConfig.datakey][idx];
                        }
                        else {
                            mapfishDialog[prefix + "." + postfix + "." + idx] = typeof transformerConfig?.default === "string" ? transformerConfig.default : defaultValue;
                        }
                    }
                }
            }
            else {
                mapfishDialog[prefix + "." + postfix] = transformerConfig.content;
            }
        });
    });

    return mapfishDialog;
}
