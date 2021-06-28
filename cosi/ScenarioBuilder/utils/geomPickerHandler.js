/**
 * Unlistens the map events to draw / pick a geometry and toggles the button in the geomPicker off
 * @param {Vue} geomPicker - the geomPicker component
 * @returns {void}
 */
export function geomPickerUnlisten (geomPicker) {
    if (geomPicker) {
        geomPicker.locationPickerActive = false;
        geomPicker.unlisten();
    }
}

/**
 * Resets the currently picked location in the geomPicker
 * @param {Vue} geomPicker - the geomPicker component
 * @returns {void}
 */
export function geomPickerResetLocation (geomPicker) {
    if (geomPicker) {
        geomPicker.resetLocation();
    }
}

/**
 * Clears the drawing source of the geomPicker
 * Does not remove any picked geometry
 * @param {Vue} geomPicker - the geomPicker component
 * @returns {void}
 */
export function geomPickerClearDrawPolygon (geomPicker) {
    geomPicker.clearDrawPolygon();
}
