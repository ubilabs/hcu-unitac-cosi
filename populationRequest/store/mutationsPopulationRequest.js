import {generateSimpleMutations} from "../../../src/app-store/utils/generators";
import statePopulationRequest from "./statePopulationRequest";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(statePopulationRequest),

    /**
     * Sets the Raster state
     * @param {object} state vuex state
     * @param {boolean} payload new status
     * @returns {void}
     */
    setRasterActive (state, payload) {
        state.rasterActive = payload;
    },

    /**
     * Sets the Alkis Adresses state
     * @param {object} state vuex state
     * @param {boolean} payload new status
     * @returns {void}
     */
    setAlkisAdressesActive (state, payload) {
        state.alkisAdressesActive = payload;
    }
};

export default mutations;
