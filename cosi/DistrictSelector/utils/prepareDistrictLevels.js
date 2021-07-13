import {unByKey} from "ol/Observable";
import {describeFeatureType, getFeatureDescription} from "../../../../src/api/wfs/describeFeatureType.js";
import {getLayerList} from "masterportalAPI/src/rawLayerList";

const eventKeys = {};

/**
 * Prepares the district level objects for the district selector.
 * Each district level is assigned its layer and a list of all district names.
 * Will no longer be executed once all district levels have their layer.
 * @param {Object[]} districtLevels - All avaiable district level objects.
 * @param {module:ol/layer[]} layerList - An array of layers.
 * @returns {void}
 */
export function prepareDistrictLevels (districtLevels, layerList) {
    const filteredDistrictLevels = getAllDistrictsWithoutLayer(districtLevels);

    if (filteredDistrictLevels.length > 0) {
        filteredDistrictLevels.forEach((districtLevel, index) => {
            // the reference level, null if there is none reference level
            districtLevel.referenceLevel = index < districtLevels.length - 1 ? districtLevels[index + 1] : null;
            // the layer for the district level
            districtLevel.layer = getLayerById(layerList, districtLevel.layerId);
            // the names of all avaible districts
            districtLevel.nameList = getNameList(districtLevel.layer, districtLevel.keyOfAttrName);
            // property names for the WFS GetFeature request for the stats features, without geometry
            districtLevel.propertyNameList = getPropertyNameList(districtLevel);
            // all featureTypes for the WFS GetFeature request for the stats features
            districtLevel.featureTypes = getFeatureTypes(districtLevel);
            // all districts at this level
            districtLevel.districts = getDistricts(districtLevel);
            // at this point the features of the layer are probably not yet loaded,
            // therefore the listener on the layer source to set the 'nameList' and the 'districts' property
            eventKeys[districtLevel.layerId] = districtLevel.layer.getSource().on("change", setProperties.bind(districtLevel));
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
 * Creates a new 'district' object for all features from the layer and return them.
 * @param {module:ol/layer} layer - A vector layer.
 * @param {String} keyOfAttrName -
 * @returns {Object[]} The districts.
 */
export function getDistricts ({layer, keyOfAttrName, label}) {
    const districts = [];

    layer.getSource().getFeatures().forEach(function (feature) {
        districts.push({
            // the administration feature (district)
            adminFeature: feature,
            // an array for all statistical features of this district
            statFeatures: [],
            // flag district is selected
            isSelected: false,
            // id of the district
            getId: () => feature.getId(),
            // label of the district
            getLabel: () => {
                const sameNamedDistricts = ["Eimsbüttel", "Wandsbek", "Bergedorf"];

                // rename feature name for reference levels to avoid naming conflict
                if (label === "Bezirke" && sameNamedDistricts.includes(feature.get(keyOfAttrName))) {
                    return feature.get(keyOfAttrName) + " (Bezirk)";
                }
                return feature.get(keyOfAttrName);
            },
            // name of the district
            getName: () => feature.get(keyOfAttrName)
        });
    });

    return districts;
}

/**
 *
 * @param {Object} level
 * @returns {String[]}
 */
export function getFeatureTypes (level) {
    return getLayerList().reduce((typeNames, layer) => {
        return layer.url === level?.stats.baseUrl ? [...typeNames, layer.featureType] : typeNames;
    }, []);
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
 * @param {module:ol/layer/VectorLayer} layer - A vector layer.
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

    return [...new Set(nameList)];
}

/**
 * Prepares the district level objects for the district selector.
 * Each district level is assigned its layer and a list of all district names.
 * Will no longer be executed once all district levels have their layer.
 * @param {Object[]} level - All avaiable district level objects.
 * @param {module:ol/layer[]} layerList - An array of layers.
 * @returns {void}
 */
export default async function getPropertyNameList (level) {
    const layer = getLayerList().find(rawlayer => rawlayer.url === level.stats.baseUrl),
        json = await describeFeatureType(level.stats.baseUrl),
        desc = getFeatureDescription(json, layer?.featureType),
        propertyNameList = [];

    if (desc) {
        desc.forEach(des => {
            if (des.type.search("gml:") === -1) {
                propertyNameList.push(des.name);
            }
        });
    }

    return propertyNameList;
}

/**
 * Sets the districts and the names of all districts to the district level.
 * Removes the event listener using the key returned by on() for this callback.
 * @this districtLevel
 * @param {module:ol/events/Event~BaseEvent} evt - Change event of a source.
 * @returns {void}
 */
export function setProperties (evt) {
    if (evt.target.getFeatures().length > 0 && this.districts.length === 0) {
        this.districts = getDistricts(this);
        this.nameList = getNameList(this.layer, this.keyOfAttrName);
        // unbind the listener
        unByKey(eventKeys[this.layerId]);
    }
}
