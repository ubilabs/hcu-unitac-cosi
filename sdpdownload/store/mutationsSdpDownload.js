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
     * @param {object} state of this component
     * @param {string} payload name of this component
     * @returns {void}
     */
    applyTranslationKey: (state, payload) => {
        if (payload && payload.indexOf("translate#") > -1) {
            state.name = payload.substr("translate#".length);
        }
    },
    updateSelectedFormat: (newFormat) => {
        if (newFormat) {
            stateSdpAddon.selectedFormat = newFormat;
        }
    },
    updateGraphicalSelectModel: (graphicalSelectModel) => {
        if (graphicalSelectModel) {
            stateSdpAddon.graphicalSelectModel = graphicalSelectModel;
        }
    },
    updateWfsRaster: function (value) {
        stateSdpAddon.wfsRaster = value;
    },
    updateIsSelected: function (value) {
        stateSdpAddon.isSelected = value;
    },
    updateSelectedRasternames: function (value) {
        stateSdpAddon.rasterNames = value;
    }
};

export default mutations;
