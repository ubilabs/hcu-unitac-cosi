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
     * @param {Object} state - vuex element
     * @param {String} payload name of this component
     * @returns {void}
     */
    applyTranslationKey: (state, payload) => {
        if (payload && payload.indexOf("translate#") > -1) {
            state.name = payload.substr("translate#".length);
        }
    },

    /**
     * Sets the value to models property rasterNames
     * @param {Object} state - vuex element
     * @returns {void}
     */
    setInitLanguage: function (state) {
        const nasDefaults = state.formats[0],
            dwg310Defaults = state.formats[1],
            dwg320Defaults = state.formats[2],
            jpgDefaults = state.formats[3];

        nasDefaults.label = i18next.t("additional:modules.tools.sdpdownload.nasLabel");
        nasDefaults.desc = i18next.t("additional:modules.tools.sdpdownload.nasDescription");

        dwg310Defaults.label = i18next.t("additional:modules.tools.sdpdownload.dwg310Label");
        dwg310Defaults.desc = i18next.t("additional:modules.tools.sdpdownload.dwg310Description");

        dwg320Defaults.label = i18next.t("additional:modules.tools.sdpdownload.dwg320Label");
        dwg320Defaults.desc = i18next.t("additional:modules.tools.sdpdownload.dwg320Description");
        jpgDefaults.label = i18next.t("additional:modules.tools.sdpdownload.jpgLabel");
        jpgDefaults.desc = i18next.t("additional:modules.tools.sdpdownload.jpgDescription");
        state.selectFormat = i18next.t("additional:modules.tools.sdpdownload.selectFormat");
        state.howToChooseTiles = i18next.t("additional:modules.tools.sdpdownload.howToChooseTiles");
        state.downloadDataPackage = i18next.t("additional:modules.tools.sdpdownload.downloadDataPackage");
        state.specialDownloads = i18next.t("additional:modules.tools.sdpdownload.specialDownloads");
        state.neuwerkDataPackage = i18next.t("additional:modules.tools.sdpdownload.neuwerkDataPackage");
        state.scharhoernDataPackage = i18next.t("additional:modules.tools.sdpdownload.scharhoernDataPackage");
        state.tileOverview310 = i18next.t("additional:modules.tools.sdpdownload.tileOverview310");
        state.tileOverview320 = i18next.t("additional:modules.tools.sdpdownload.tileOverview320");
        state.pleaseSelectTiles = i18next.t("additional:modules.tools.sdpdownload.pleaseSelectTiles");
        state.failedToDownload = i18next.t("additional:modules.tools.sdpdownload.failedToDownload");
        state.details = i18next.t("additional:modules.tools.sdpdownload.details");
        state.serviceNotResponding = i18next.t("additional:modules.tools.sdpdownload.serviceNotResponding");
    },

    /**
     * Sets the value to models property rasterNames
     * @param {Object} state - vuex element
     * @param {String} newFormat value of selected file Format like dwg or jpg
     * @returns {void}
     */
    setSelectedFormat: function (state, newFormat) {
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
    setGraphicalSelectModel: (state, graphicalSelectModel) => {
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
    setSelectedAreaGeoJson: (state, selectedAreaGeoJson) => {
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
    setWfsRaster: (state, value) => {
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
    setSelectedRasterNames: (state, value) => {
        if (value) {
            state.rasterNames = value;
        }
    },
    /**
     * Sets the value to property isSelected
     * @param {Object} state - vuex element
     * @param {Boolean} value is selected or not
     * @returns {void}
     */
    setIsSelected: (state, value) => {
        if (value) {
            state.isSelected = value;
        }
    }
};

export default mutations;
