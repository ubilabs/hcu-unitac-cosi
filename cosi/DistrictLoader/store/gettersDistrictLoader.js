
import {generateSimpleGetters} from "../../../../src/app-store/utils/generators";
import districtSelectorState from "./stateDistrictLoader";
import MappingJson from "../assets/mapping.json";
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
     * Gets all mapped data layer infos by the selected district level.
     * @returns {object[]} List of all available values.
     */
    getAllValuesByScope: () => {
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
