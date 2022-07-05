import store from "../../../src/app-store";
import {buildLayers} from "./parseLayerForMapfish";
import getPrintedLayers from "./getPrintedLayers";
import {getFeatureLayer} from "./createVectorLayer";

/**
 * Gets the map configuration with center and scale as walker map type for mapfish in jasper.
 * @param {Number[]} coordinates The geo coordination
 * @param {Number[]} center The center point of parcel
 * @param {String} projection the projection
 * @param {String} dpi the dpi for resolution
 * @param {Object} style the style for polygon feature
 * @param {Number} scale the scale of map
 * @param {String[]} LayerIds the layer id
 * @returns {Object} The map configuration in object
 */
function getWalkerMap (coordinates, center, projection, dpi, style, scale, LayerIds) {
    const mapConfig = {},
        defaultDpi = 200,
        defaultScale = 20000;
    let originLayers = [];

    mapConfig.dpi = typeof dpi === "number" ? dpi : defaultDpi;
    mapConfig.projection = typeof projection === "string" ? projection : store.getters["Maps/projection"].getCode();
    mapConfig.scale = typeof scale === "number" ? scale : defaultScale;
    mapConfig.center = Array.isArray(center) ? center : [];
    mapConfig.layers = [];

    originLayers.push(getFeatureLayer(style, coordinates));
    originLayers = originLayers.concat(getPrintedLayers(LayerIds));

    buildLayers(originLayers).then(parsedLayers => {
        mapConfig.layers = parsedLayers;
    });

    return mapConfig;
}

export {
    getWalkerMap
};
