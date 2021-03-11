import * as Proj from "ol/proj";

export default {
    newRequest ({commit, state}, payload) {
        // transform coordinates/locations to service CRS
        payload.locations = payload.locations?.map(l => Proj.transform(l, state.crs.portal, state.crs.service));
        payload.coordinates = payload.coordinates?.map(l => Proj.transform(l, state.crs.portal, state.crs.service));

        commit("setRequestData", payload);
    },
    toggleIsochroneView ({state}, isActive = undefined) {
        const drawingLayer = state.drawingLayer,
            _isActive = isActive === undefined ? !drawingLayer?.getVisible() : isActive;

        if (drawingLayer) {
            drawingLayer.setVisible(_isActive);
        }
    }
};
