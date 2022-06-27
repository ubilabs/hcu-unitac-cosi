/**
 * Creates the mapfish dialog from the transformer configuration and the knowledge base.
 * @param {Object} knowledgeBase - The knowledge base.
 * @param {Object} transformer - The configuration of the transformer.
 * @param {String} defaultValue - Used when nothing is present or nothing was found.
 * @returns {Object} The mapfish dialog.
 */
export function createMapfishDialog (knowledgeBase, transformer, defaultValue) {
    const mapfishDialog = {};

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
                // mapfishDialog[prefix + "." + postfix] = concatStringByDatakey(knowledgeBase, transformerConfig.datakey, transformerConfig.default, defaultValue, transformerConfig.delimitor);
            }
            else if (transformerConfig.type === "iterator") {
                if (knowledgeBase[transformerConfig.datakey] === undefined) {
                    mapfishDialog[prefix + "." + postfix] = defaultValue;
                }
                else {
                    knowledgeBase[transformerConfig.datakey].forEach((result, idx) => {
                        mapfishDialog[prefix + "." + postfix + "." + idx] = typeof result !== "undefined" ? result : defaultValue;
                    });
                }
            }
            else {
                mapfishDialog[prefix + "." + postfix] = transformerConfig.content;
            }
        });
    });

    return mapfishDialog;
}
