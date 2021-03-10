/**
 * quick fix for VectorLayer BBox
 * @todo refactor to vuex store action
 * @param {module:ol/geom/GeometryCollection} bboxGeometry - the geometry to set the bounding box to
 * @returns {void}
 */
export default function setBBoxToGeom (bboxGeometry) {
    const layerlist = Radio.request("Parser", "getItemsByAttributes", {typ: "WFS", isBaseLayer: false}).concat(Radio.request("Parser", "getItemsByAttributes", {typ: "GeoJSON", isBaseLayer: false}));

    Radio.trigger("BboxSettor", "setBboxGeometryToLayer", layerlist, bboxGeometry);
}
