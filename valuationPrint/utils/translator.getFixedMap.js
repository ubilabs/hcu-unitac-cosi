import store from "../../../src/app-store";
import {buildLayers} from "./parseLayerForMapfish";
import getPrintedLayers from "./getPrintedLayers";
import {getFeatureLayer} from "./createVectorLayer";

/**
 * Gets the map configuration with bounding box as fixed map type for mapfish in jasper.
 * @param {Number[]} coordinates The geo coordination
 * @param {String} projection the projection
 * @param {String} dpi the dpi for resolution
 * @param {Object} style the style for point feature
 * @param {Number[]} bbox the bounding box coordinates
 * @param {String[]} LayerIds the layer id
 * @returns {Object} The map configuration in object
 */
function getFixedMap (coordinates, projection, dpi, style, bbox, LayerIds) {
    const mapConfig = {},
        defaultDpi = 200,
        defaultBbox = [545114.80, 5914269.80, 591483.01, 5957132.28];
    let originLayers = [];

    mapConfig.dpi = typeof dpi === "number" ? dpi : defaultDpi;
    mapConfig.projection = typeof projection === "string" ? projection : store.getters["Maps/projection"].getCode();
    mapConfig.bbox = Array.isArray(bbox) && bbox.length === 4 ? bbox : defaultBbox;
    mapConfig.layers = [];

    originLayers.push(getFeatureLayer(style, coordinates, "point"));
    originLayers = originLayers.concat(getPrintedLayers(LayerIds));

    buildLayers(originLayers).then(parsedLayers => {
        mapConfig.layers = parsedLayers;
    });

    return mapConfig;
}

export {
    getFixedMap
};
