
import {generateSimpleGetters} from "../../../../src/app-store/utils/generators";
import districtSelectorState from "./stateDistrictLoader";
import MappingJson from "../assets/mapping.json";
import {WFS} from "ol/format.js";
import {getLayerWhere} from "masterportalAPI/src/rawLayerList";
import {getFeature} from "../../../../src/api/wfs/getFeature.js";

const getters = {
    ...generateSimpleGetters(districtSelectorState),


    /**
     * get all mapped data layer infos by scope
     * @param {string} scope - statgebiet | stadtteil
     * @returns {object[]} list of all available values
     */
    getAllValuesByScope: (state, {selectedDistrictLevel}) => {
        return MappingJson;
    },

    /**
     * returns district features by a value
     * @param {string} scope - scope of districts, Stadtteile | Statistische Gebiet
     * @param {string} value - the value to be filtered by
     * @returns {ol.Feature[]} the district features
     */
    getDistrictsByValue: (state, {selectedDistrictLevel}) => (value) => {
        return selectedDistrictLevel.features.filter(function (feature) {
            return feature.getProperties().kategorie === value;
        });
    },

    /**
     * Returns the key for the attribute "name" of the district features.
     * @param {Object} state - The DistrictSelector state.
     * @param {Object} getters - The DistrictSelector getters.
     * @param {Object} getters.selectedDistrictLevel - The selected district level.
     * @returns {String} The key for the attribute "name".
     */
    getDistrictsByScope: (state, {selectedDistrictLevel}) => {
        return selectedDistrictLevel.features;
    },

    /**
     * returns all features of a layer
     * if the features are not yet stored, it will be loaded
     * @param {object} obj - key value pair of a layer attribute
     * @returns {ol.Feature[]} the features of a layer
     */
    getAllFeaturesByAttribute: (state) => (obj) => {
        // layer name, layer id or any other value of the layer
        const valueOfLayer = obj[Object.keys(obj)[0]],
            layer = getLayerWhere(obj);

        if (state.featureList.hasOwnProperty(valueOfLayer)) {
            return state.featureList[valueOfLayer];
        }
        return getFeature(layer.url, layer.featureType)
            .then(response => {
                const wfsReader = new WFS({
                    featureNS: layer.featureNS
                });

                state.featureList[valueOfLayer] = wfsReader.readFeatures(response);
                return state.featureList[valueOfLayer];
            })
            .catch(function (error) {
                console.error(error);
            });
    }
};


export default getters;
