export default {
    toggleIsochroneView ({state}, isActive = undefined) {
        const drawingLayer = state.drawingLayer,
            _isActive = isActive === undefined ? !drawingLayer?.getVisible() : isActive;

        if (drawingLayer) {
            drawingLayer.setVisible(_isActive);
        }
    }
};
