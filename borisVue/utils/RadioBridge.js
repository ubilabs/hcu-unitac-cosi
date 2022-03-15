/**
 * Returns the layerModel with the given attributes.
 * Can be done directly or is no longer needed, if modelList is refactored.
 * @returns {void}
 */
export function getLayerModelsByAttributes () {
    return Radio.request("ModelList", "getModelsByAttributes", {isNeverVisibleInTree: true});
}
/**
 * Requests the click-listener
 * Can be done directly or is no longer needed, if modelList is refactored.
 * @param {Function} fn function that is triggered by the click-listener
 * @returns {void}
 */
export function mapClickListener (fn) {
    return Radio.request("Map", "registerListener", "click", fn);
}
