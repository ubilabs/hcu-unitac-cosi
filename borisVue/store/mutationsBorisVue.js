import {generateSimpleMutations} from "../../../src/app-store/utils/generators";
import stateBoris from "./stateBorisVue";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateBoris)

    // NOTE overwrite (or create additional) mutations here if you need special behavior in them
    setAreaLayerSelected (state, value) {
        // console.log("setAreaLayerSelected", value)
        state.areaLayerSelected = value;
    },
    setShowStripesLayer (state, value) {
        state.stripesLayer = value;
    },
    setGfiFeature (state, value) {
        state.gfiFeature = value;
    },
    setBrwFeatures (state, value) {
        state.brwFeature = value;
    },
    setBrwLanduse (state, value) {
        state.brwLanduse = value;
    },
    setSelectedBrwFeature (state, value) {
        state.selectedBrwFeature = value;
    },
    setProcessFromParametricUrl (state, value) {
        state.processFromParametricUrl = value;
    },
    setParamUrlParams (state, value) {
        state.paramUrlParams = value;
    },
    setButtonValue (state, value) {
        state.buttonValue = value;
    },
    updateSelectedLayerArray (state, value) {
        state.selectedLayerArray.push(value);
    },
    unsetSelectedBrwFeature (state) {
        state.selectedBrwFeature = {};
    }
};

export default mutations;
