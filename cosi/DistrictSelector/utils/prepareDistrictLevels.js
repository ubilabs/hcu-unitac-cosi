/**
 * Prepares the district level objects for the district selector.
 * Each district level is assigned its layer and a list of all district names.
 * Will no longer be executed once all district levels have their layer.
 * @param {Object[]} districtLevels - All avaiable district level objects.
 * @param {module:ol/layer[]} layerList - An array of layers.
 * @returns {void}
 */
export default function prepareDistrictLevels (districtLevels, layerList) {
    const filteredDistrictLevels = getAllDistrictsWithoutLayer(districtLevels);

    if (filteredDistrictLevels.length > 0) {
        filteredDistrictLevels.forEach(districtLevel => {
            // the layer for the district level
            districtLevel.layer = getLayerById(layerList, districtLevel.layerId);
            // the names of all avaible districts
            // at this point the features are probably not yet loaded, therefore the listener
            districtLevel.nameList = getNameList(districtLevel.layer, districtLevel.keyOfAttrName);
            districtLevel.layer.getSource().on("change", setNameList.bind(districtLevel));
            districtLevel.stats.districts = [];
        });
    }
}

/**
 * Returns all district level objects without layer.
 * @param {Object[]} districtLevels - All avaiable district level objects.
 * @returns {Object[]} The filtered district levels or an empty array.
 */
export function getAllDistrictsWithoutLayer (districtLevels) {
    if (!Array.isArray(districtLevels)) {
        console.error(`prepareDistrictLevels.getAllDistrictsWithoutLayer: ${districtLevels} has to be defined and an array.`);
        return [];
    }
    return districtLevels.filter(district => {
        return typeof district.layer === "undefined";
    });
}


/**
 * Returns the layer of the passed id or undefined if no layer is found.
 * @param {module:ol/layer[]} layerList - An array of layers.
 * @param {String} id - The layer id.
 * @returns {module:ol/layer/Layer|undefined} The found layer.
 */
export function getLayerById (layerList, id) {
    if (!Array.isArray(layerList) || typeof id !== "string") {
        console.error(`prepareDistrictLevels.getLayerById: ${layerList} has to be defined and an array. ${id} has to be defined and a string`);
        return undefined;
    }

    return layerList.find(layer => {
        return layer.get("id") === id;
    });
}

/**
 * Returns the names of all avaible districts in the district level.
 * @param {module:ol/layer/VectorLayer} layer - An vector layer.
 * @param {String} keyOfAttrName - The key for the attribute "name" of the district features.
 * @returns {String[]} The names of the districts or an empty array.
 */
export function getNameList (layer, keyOfAttrName) {
    if (typeof layer !== "object" || layer === null || Array.isArray(layer) || typeof keyOfAttrName !== "string") {
        console.error(`prepareDistrictLevels.getNameList: ${layer} has to be defined and an object. ${keyOfAttrName} has to be defined and a string`);
        return [];
    }
    const nameList = [];

    layer.getSource().getFeatures().forEach(feature => {
        if (typeof feature.get(keyOfAttrName) !== "undefined") {
            nameList.push(feature.get(keyOfAttrName));
        }
    });

    return nameList;
}

/**
 * Sets the names of all districts to the district level.
 * @this districtLevel
 * @param {module:ol/events/Event~BaseEvent} evt - Change event of a source.
 * @returns {void}
 */
export function setNameList (evt) {
    console.info(evt);
    if (evt.target.getFeatures().length > 0) {
        this.nameList = getNameList(this.layer, this.keyOfAttrName);
    }
}
