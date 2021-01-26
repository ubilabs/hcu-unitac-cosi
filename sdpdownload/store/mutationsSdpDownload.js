import {generateSimpleMutations} from "../../../src/app-store/utils/generators";
import stateSdpAddon from "./stateSdpDownload";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateSdpAddon),

    /**
     * If name from config.json starts with "translate#", the corrected key is set to name here.
     * @param {object} state - vuex element
     * @param {string} payload name of this component
     * @returns {void}
     */
    applyTranslationKey: (state, payload) => {
        if (payload && payload.indexOf("translate#") > -1) {
            state.name = payload.substr("translate#".length);
        }
    },

    /**
     * Sets the value to models property rasterNames
     * @param {object} state - vuex element
     * @param {String} newFormat value of selected file Format like dwg or jpg
     * @returns {void}
     */
    updateSelectedFormat: (state, newFormat) => {
        if (newFormat) {
            state.selectedFormat = newFormat;
        }
    },

    /**
     * Sets the graphicalSelectModel
     * @param {Object} state - vuex element
     * @param {Object} graphicalSelectModel from the graphical selection snippet
     * @returns {void}
     */
    updateGraphicalSelectModel: (state, graphicalSelectModel) => {
        if (graphicalSelectModel) {
            state.graphicalSelectModel = graphicalSelectModel;
        }
    },

    /**
     * Sets the selectedAreaGeoJson from the selected area by the graphicalSelect snippet
     * @param {Object} state - vuex element
     * @param {Object} selectedAreaGeoJson of the selected area by the graphicalSelect snippet
     * @returns {void}
     */
    updateSelectedAreaGeoJson: (state, selectedAreaGeoJson) => {
        if (selectedAreaGeoJson) {
            state.graphicalSelectModel.attributes.selectedAreaGeoJson = selectedAreaGeoJson;
        }
    },
    /**
     * Sets the WFSRaster
     * @param {Object} state - vuex element
     * @param {ol.feature} value the features of the WFSRaster
     * @returns {void}
     */
    updateWfsRaster: (state, value) => {
        if (value) {
            state.wfsRaster = value;
        }
    },
    /**
     * Sets the value to models property rasterNames
     * @param {Object} state - vuex element
     * @param {Array} value names of the raster squares from the intersected graphical selection
     * @returns {void}
     */
    updateSelectedRasterNames: (state, value) => {
        state.rasterNames = value;
    },
    /**
     * Sets the value to property isSelected
     * @param {Object} state - vuex element
     * @param {Boolean} value is selected or not
     * @returns {void}
     */
    updateIsSelected: (state, value) => {
        state.isSelected = value;
    }
};

export default mutations;
