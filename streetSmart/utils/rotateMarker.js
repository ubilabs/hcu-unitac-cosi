/**
 * Rotates the given marker.
 * @param {Object} markerPoint the vector layer for the point map marker
 * @param {Number} yaw the rotation
 * @returns {void}
 */
export default function rotateMarker (markerPoint, yaw) {
    const features = markerPoint?.getSource().getFeatures();

    if (features.length > 0) {
        const feature = features[0],
            icon = feature.getStyle().getImage().clone();

        icon.setRotation(yaw * Math.PI / 180);
        feature.getStyle().setImage(icon);
        markerPoint.getSource().clear(true);
        markerPoint.getSource().addFeatures([feature]);
    }
}
