export default {
    /**
     * Sets the Raster state
     * @param {Object} state state object
     * @param {Function} commit store commit function
     * @param {Object} payload The given parameters
     * @param {String} payload.value The new value
     * @returns {void}
     */
    setRaster ({state, commit}, {value}) {
        commit("setRasterActive", state, value);
    },

    /**
     * Sets the Alkis Adresses state
     * @param {Object} state state object
     * @param {Function} commit store commit function
     * @param {Object} payload The given parameters
     * @param {String} payload.value The new value
     * @returns {void}
     */
    setAlkisAdresses ({state, commit}, {value}) {
        commit("setAlkisAdressesActive", state, value);
    }
};
