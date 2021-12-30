import {generateSimpleMutations} from "../../../src/app-store/utils/generators";
import state from "./stateBorisVue";
import stateBoris from "./stateBorisVue";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateBoris),

    // NOTE overwrite (or create additional) mutations here if you need special behavior in them
    setAreaLayerSelected (state, value) {
        state.areaLayerSelected = value;
    },
    setShowStripesLayer (state, value) {
        state.stripesLayer = value;
    },
    setGfiFeature (state, value) {
        state.gfiFeature = value;
    },
    setBrwFeatures ( state, value) {
        state.brwFeature = value;
    }
};

export default mutations;
