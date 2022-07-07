import {buildLayers} from "./parseLayerForMapfish";
import getPrintedLayers from "./getPrintedLayers";
import {getFeatureLayer} from "./createVectorLayer";

/**
 * Gets the map configuration with a proportional bounding box as proportion map type for mapfish in jasper.
 * @param {ol/Feature} feature - The parcel feature.
 * @param {Number[]} extent The extent coordinates of parcel as feature
 * @param {String} projection the projection
 * @param {Object} style the style for point feature
 * @param {Number} proportion the proportion of the parcel in the map
 * @param {String[]} LayerIds the layer id
 * @param {Number} [dpi=200] the dpi for resolution
 * @returns {Object} The map configuration in object
 */
function getProportionMap (feature, extent, projection, style, proportion, LayerIds, dpi = 200) {
    const mapConfig = {},
        defaultBbox = [545114.80, 5914269.80, 591483.01, 5957132.28];
    let originLayers = [];

    mapConfig.dpi = dpi;
    mapConfig.projection = projection;
    mapConfig.bbox = Array.isArray(extent) && extent.length === 4 ? getBoundingBox(extent, proportion) : defaultBbox;
    mapConfig.layers = [];

    originLayers.push(getFeatureLayer(style, feature));
    originLayers = originLayers.concat(getPrintedLayers(LayerIds));

    buildLayers(originLayers).then(parsedLayers => {
        mapConfig.layers = parsedLayers;
    });

    return mapConfig;
}

/**
 * Getting the Bounding Box of the map according to the extent of feature and proportion
 * The size of feature extent / the size of map is the proportion
 * @param {Number[]} coordinates The geo coordination
 * @param {Object} configProp the proportion of the map
 * @returns {Number[]} the bounding box of the map
 */
function getBoundingBox (coordinates, configProp) {
    const longiDiff = coordinates[2] - coordinates[0],
        latiDiff = coordinates[3] - coordinates[1];

    let proportion = 0.33,
        ratio = 1,
        longiLeft = 0,
        longiRight = 0,
        latiBottom = 0,
        latiTop = 0;

    if (typeof configProp === "number" && configProp > 0 && configProp < 1) {
        proportion = configProp;
    }

    ratio = (1 - proportion) / (2 * proportion);

    longiLeft = coordinates[0] - longiDiff * ratio;
    longiRight = coordinates[2] + longiDiff * ratio;
    latiBottom = coordinates[1] - latiDiff * ratio;
    latiTop = coordinates[3] + latiDiff * ratio;

    return [longiLeft, latiBottom, longiRight, latiTop];
}

export {
    getProportionMap,
    getBoundingBox
};
