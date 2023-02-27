import isObject from "../../../src/utils/isObject";

/**
 * Translator to merge multiple arrays of objects from the knowledge base in one array.
 * @param {String[]} datakey - An array of formats to construct the array from.
 * @param {Object} knowledgeBase - The knowledge base to get value from.
 * @param {String} defaultValue - The default value to use for any unset value.
 * @returns {Object[]} The merged objects or an empty array.
 */
function mergeObjectsByDatakey (datakey, knowledgeBase, defaultValue) {
    const mergedObjects = [];

    if (!Array.isArray(datakey)) {
        console.error(`addons/valuationPrint/utils/translator.mergeObjectsByDatakey: datakey is ${datakey}, but it has to be an array`);
        return mergedObjects;
    }

    if (!isObject(knowledgeBase)) {
        console.error(`addons/valuationPrint/utils/translator.mergeObjectsByDatakey: knowledgeBase is ${knowledgeBase}, but it has to be an object`);
        return mergedObjects;
    }

    if (typeof defaultValue !== "string") {
        console.error(`addons/valuationPrint/utils/translator.mergeObjectsByDatakey: defaultValue is ${defaultValue}, but it has to be a string`);
        return mergedObjects;
    }

    datakey.forEach(key => {
        if (Array.isArray(knowledgeBase[key])) {
            knowledgeBase[key].forEach(obj => {
                for (const prop in obj) {
                    if (typeof obj[prop] === "undefined") {
                        obj[prop] = defaultValue;
                    }
                }
            });

            mergedObjects.push(...knowledgeBase[key]);
        }
    });

    return mergedObjects;
}

export {
    mergeObjectsByDatakey
};
