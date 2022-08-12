import store from "../../../src/app-store";
import {
    getLayerByAttributes,
    getLayersByAttributes,
    addLayerByLayerId
} from "../utils/RadioBridge.js";

/**
 * Registers the Observer.
 * @returns {void}
 */
function register () {
    store.dispatch("Tools/SessionTool/register", {key: "Layers", getter: getCurrentLayerList, setter: setLayers});
}

/**
 * Gets the current extent of the map.
 * @returns {Object} an object which holds the extent
 */
function getCurrentLayerList () {
    const models = getLayersByAttributes({isSelected: true, type: "layer"}),
        layerIds = [];

    if (Array.isArray(models) && models.length) {
        models.forEach(model => layerIds.push({
            id: model?.id,
            visibility: typeof model.get === "function" ? model.get("isVisibleInMap") : true
        }));
    }
    else if (models?.id) {
        layerIds.push({
            id: models?.id,
            visibility: typeof models.get === "function" ? models.get("isVisibleInMap") : true
        });
    }
    return {
        layerIds
    };
}

/**
 * Sets the current extent of the map.
 * @param {Object} payload The payload
 * @returns {void}
 */
function setLayers (payload) {
    if (!Array.isArray(payload?.layerIds)) {
        return false;
    }
    const models = getLayersByAttributes({isSelected: true});

    if (Array.isArray(models)) {
        models.forEach(model => {
            model.setIsSelected(false);
        });
    }

    payload.layerIds.forEach(layer => {
        const model = getModelByLayerId(layer.id);

        if (typeof model?.setIsSelected === "function") {
            model.setIsSelected(true);
            if (typeof layer.visibility !== "undefined") {
                model.setIsVisibleInMap(layer.visibility);
            }
        }
    });
    return true;
}

/**
 * Gets the model by given layerId
 * @param {String} layerId The layerId
 * @return {Boolean|ol/layer/Layer} returns false if layerId is not a string or a number otherwise returns the model
 */
function getModelByLayerId (layerId) {
    if (typeof layerId !== "string" && typeof layerId !== "number") {
        return false;
    }

    const layers = getLayersByAttributes({id: layerId});
    let model;

    if (Array.isArray(layers) && layers.length > 0) {
        model = layers[0];
    }
    else {
        addLayerByLayerId(layerId);
        model = getLayerByAttributes({id: layerId});
    }

    return model;
}

export {
    register,
    setLayers,
    getCurrentLayerList,
    getModelByLayerId
};
