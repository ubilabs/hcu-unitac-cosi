
import {generateSimpleGetters} from "../../../../src/app-store/utils/generators";
import selectionManagerState from "./stateSelectionManager";

const getters = {
    ...generateSimpleGetters(selectionManagerState),
    // needs getter argument to reach rootGetters in fourth argument, so allow this in eslint
    // eslint-disable-next-line no-shadow
    /**
     *
     * @param {*} state vuex state
     * @param {*} getters  vuex getters
     * @param {*} rootState vuex rootState
     * @param {*} rootGetters vuex rootGetters
     * @returns {*} an object descirbing the current data selection. It can be passed to selectionManager.acceptSelection to load them again later.
     */
    lastSelectionWithCurrentDataLayers (state, getters, rootState, rootGetters) {

        // 1. picks active selection
        // 2. bind currently selected data layers to selection, not just geometry
        // 3. retuns those selection settings
        const index = state.selections.length - 1, // get most recent selection
            // pick currently active data layers from FeatureList
            activeVectorLayerList = rootGetters["Tools/FeaturesList/activeVectorLayerList"],
            // store the names only
            activeLayerList = activeVectorLayerList.map(layer => layer.getProperties().name); // as in activeLayers() computed prop. better duplicate this line than put the whole logic in store

        // update the selection in selectionManager
        state.selections[index].storedLayers = activeLayerList;
        // return the selection settings
        return state.selections[index];

    }
};

export default getters;
