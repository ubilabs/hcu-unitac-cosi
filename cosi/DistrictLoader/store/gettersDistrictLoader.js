
import {generateSimpleGetters} from "../../../../src/app-store/utils/generators";
import districtSelectorState from "./stateDistrictLoader";
import MappingJson from "../../assets/mapping.json";
import {WFS} from "ol/format.js";
import {getLayerWhere} from "masterportalAPI/src/rawLayerList";
import {getFeature} from "../../../../src/api/wfs/getFeature.js";

const getters = {
    ...generateSimpleGetters(districtSelectorState),

    /**
     * Returns all features of a layer by the given attributes.
     * If the features are not yet stored, it will be loaded.
     * @param {Object} state - The DistrictLoader state.
     * @param {Object} getters - The DistrictLoader getters.
     * @param {Object} getters.featureList - The stored features per layer.
     * @param {Object} attributes - Key value pair(s) of layer attribute(s).
     * @returns {module:ol/Feature[]} The features of a layer.
     */
    getAllFeaturesByAttribute: (state, {featureList}) => (attributes) => {
        // layer name, layer id or any other value of the layer
        const valueOfLayer = attributes[Object.keys(attributes)[0]],
            layer = getLayerWhere(attributes);

        if (featureList.hasOwnProperty(valueOfLayer)) {
            return featureList[valueOfLayer];
        }
        return getFeature(layer?.url, layer?.featureType)
            .then(response => {
                const wfsReader = new WFS({
                    featureNS: layer.featureNS
                });

                featureList[valueOfLayer] = wfsReader.readFeatures(response);
                return featureList[valueOfLayer];
            })
            .catch(function (error) {
                console.error(error);
            });
    },

    /**
     * Gets all categories of the stats data.
     * @returns {object[]} List of all available stats categories.
     */
    getAllCategories: () => {
        return MappingJson;
    },

    /**
     * Returns all laoded stats features filtered by "kategorie".
     * @param {Object} state - The DistrictLoader state.
     * @param {Object} getters - The DistrictLoader getters.
     * @param {Object} getters.selectedDistrictLevel - The selected district level.
     * @param {String} value - The category to filter by.
     * @returns {module:ol/Feature[]} The stats features.
     */
    statsFeaturesByCategory: (state, {selectedDistrictLevel}) => (value) => {
        return selectedDistrictLevel.features.filter(function (feature) {
            return feature.getProperties().kategorie === value;
        });
    },

    /**
     * Returns all laoded stats features filtered by district name.
     * @param {Object} state - The DistrictLoader state.
     * @param {Object} getters - The DistrictLoader getters.
     * @param {Object} getters.selectedDistrictLevel - The selected district level.
     * @param {String} value - The districtname to filter by.
     * @returns {module:ol/Feature[]} The stats features.
     */
    statsFeaturesByDistrict: (state, {selectedDistrictLevel}) => (value) => {
        return selectedDistrictLevel.features.filter(function (feature) {
            return feature.getProperties()[selectedDistrictLevel.keyOfAttrName] === value;
        });
    },

    /**
     * Returns all laoded stats features filtered by district name.
     * @param {Object} state - The DistrictLoader state.
     * @param {Object} getters - The DistrictLoader getters.
     * @param {Object} getters.districtLevels - All districtLevels with their loaded stats features.
     * @param {String} value - The level label to filter by.
     * @returns {module:ol/Feature[]} The stats features.
     */
    statsFeaturesByLevel: (state, {districtLevels}) => (value) => {
        return districtLevels.find(level => level.label === value)?.features;
    },

    /**
     * Returns all loaded stats features filtered by any set of literal key/value pairs.
     * @param {Object} state - The DistrictLoader state.
     * @param {Object} getters - The DistrictLoader getters.
     * @param {Object} getters.districtLevels - All districtLevels with their loaded stats features.
     * @param {Object} getters.selectedDistrictLevel - The currently loaded district level with its stats features.
     * @param {Object} values - The object with keys and values to filter by, including "level" providing the districtLevel's label.
     * @returns {module:ol/Feature[]} The stats features.
     */
    statsFeaturesByAttributes: (state, {districtLevels, selectedDistrictLevel}) => (values) => {
        let districtLevel = selectedDistrictLevel;

        if (values.level) {
            districtLevel = districtLevels.find(level => level.label === values.level) || districtLevel;
            delete values.level;
        }

        return districtLevel.features.filter(function (feature) {
            const props = feature.getProperties();

            for (const prop in values) {
                if (props[prop] !== values[prop]) {
                    return false;
                }
            }
            return true;
        });
    },

    /**
     * @description Returns all loaded stats (as objects) filtered by any set of literal key/value pairs.
     * @param {Object} state - the DistrictLoader store state
     * @param {Object} getters - the DistrictLoader getters
     * @param {Function} getters.statsFeaturesByAttributes - the function that returns statFeatures by attributes for a given level
     * @returns {Object[]} the List of Stats Objects
     */
    statsByAttributes: (state, {statsFeaturesByAttributes}) => (values) => {
        return statsFeaturesByAttributes(values).map(feature => feature.getProperties());
    },

    /**
     * @description checks whether there is any feature of the category in all districtLevels
     * @param {Object} state - the DistrictLoader store state
     * @param {Object} getters - the DistrictLoader getters
     * @param {Function} getters.statsFeaturesByAttributes - the function that returns statFeatures by attributes for a given level
     * @param {Object[]} getters.districtLevels - all districtLevels
     * @param {String} value - the category to search for
     * @returns {Boolean} returns whether a feature has been found
     */
    anyStatsOfCategory: (state, {statsFeaturesByAttributes, districtLevels}) => (value) => {
        for (const level of districtLevels) {
            if (statsFeaturesByAttributes({level: level.label, kategorie: value}).length > 0) {
                return true;
            }
        }
        return false;
    },

    /**
     * Returns all current loaded stats features of the selected district level.
     * @param {Object} state - The DistrictLoader state.
     * @param {Object} getters - The DistrictLoader getters.
     * @param {Object} getters.selectedDistrictLevel - The selected district level.
     * @returns {module:ol/Feature[]} The stats features.
     */
    currentStatsFeatures: (state, {selectedDistrictLevel}) => {
        return selectedDistrictLevel.features;
    }
};


export default getters;
