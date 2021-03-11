import * as Proj from "ol/proj";

export default {
    /**
     * @description Starts a new OpenRouteService request
     * @param {*} ctx - the store context
     * @param {*} payload - the request options, incl. service and profile for the URL params
     * @returns {void}
     */
    newRequest ({commit, state}, payload) {
        // transform coordinates/locations to service CRS
        payload.locations = payload.locations?.map(l => Proj.transform(l, state.crs.portal, state.crs.service));
        payload.coordinates = payload.coordinates?.map(l => Proj.transform(l, state.crs.portal, state.crs.service));

        commit("setRequestData", payload);
    },

    /**
     * @description toggles or sets the visibility of the drawing layer of the module
     * @param {*} param0 - ctx - the store context
     * @param {*} [isActive=undefined] - (optional) the new state of the drawing layer
     * @returns {void}
     */
    toggleIsochroneView ({state}, isActive = undefined) {
        const drawingLayer = state.drawingLayer,
            _isActive = isActive === undefined ? !drawingLayer?.getVisible() : isActive;

        if (drawingLayer) {
            drawingLayer.setVisible(_isActive);
        }
    }
};
