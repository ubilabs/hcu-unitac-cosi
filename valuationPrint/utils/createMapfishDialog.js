import {concatStringByDatakey} from "./translator.concatStringByDatakey";
import {getFixedMap} from "./translator.getFixedMap";
import {getProportionMap} from "./translator.getProportionMap";
import {getWalkerMap} from "./translator.getWalkerMap";

/**
 * Creates the mapfish dialog from the transformer configuration and the knowledge base.
 * @param {Object} knowledgeBase - The knowledge base.
 * @param {Object} transformer - The configuration of the transformer.
 * @param {String} defaultValue - Used when nothing is present or nothing was found.
 * @param {String} mapProjection - The EPSG-Code of the current map projection.
 * @returns {Object} The mapfish dialog.
 */
export function createMapfishDialog (knowledgeBase, transformer, defaultValue, mapProjection) {
    const mapfishDialog = {},
        defaultDelimitor = ", ";

    Object.entries(transformer).forEach(([prefix, obj]) => {
        Object.entries(obj).forEach(([postfix, transformerConfig]) => {
            if (transformerConfig.type === "mapWalker") {
                mapfishDialog[prefix + "." + postfix] = getWalkerMap(knowledgeBase.parcel.feature, knowledgeBase.parcel.center, mapProjection, transformerConfig.style, transformerConfig.scale, transformerConfig.layerIds);
            }
            else if (transformerConfig.type === "mapProportion") {
                mapfishDialog[prefix + "." + postfix] = getProportionMap(knowledgeBase.parcel.feature, knowledgeBase.parcel.extent, mapProjection, transformerConfig.style, transformerConfig.proportion, transformerConfig.layerIds);
            }
            else if (transformerConfig.type === "mapFixed") {
                mapfishDialog[prefix + "." + postfix] = getFixedMap(knowledgeBase.parcel.center, mapProjection, transformerConfig.style, transformerConfig.bbox, transformerConfig.layerIds);
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
