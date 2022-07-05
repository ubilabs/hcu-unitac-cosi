import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import {Point, Polygon} from "ol/geom";
import {Circle as CircleStyle, Fill, Stroke, Style} from "ol/style";

/**
 * Gets the layer from point feature
 * @param {Object} style the style for feature
 * @param {Number[]} coordinates The geo coordination
 * @param {String} type The feature type point or polygon
 * @returns {ol/layer/Layer} The created layer with feature and style
 */
function getFeatureLayer (style, coordinates, type) {
    let featureLayer = {},
        layerName = "";

    if (Array.isArray(coordinates) && coordinates.length) {
        coordinates.forEach(coordinate => {
            layerName += coordinate + "_";
        });

        featureLayer = new VectorLayer({
            id: layerName,
            name: layerName,
            source: new VectorSource()
        });

        if (type === "point") {
            setPointFeatureToLayer(featureLayer, coordinates);
            featureLayer.setStyle(getPointStyle(style));
        }
        else {
            setPolygonFeatureToLayer(featureLayer, coordinates);
            featureLayer.setStyle(getPolygonStyle(style));
        }
    }

    return featureLayer;
}

/**
 * Setting the layer feature
 * @param {ol/Layer} layer the created layer
 * @param {Number[]} coordinates The geo coordination
 * @returns {void}
 */
function setPointFeatureToLayer (layer, coordinates) {
    const feature = new Feature({
        geometry: new Point(coordinates)
    });

    layer.getSource().addFeature(feature);
}

/**
 * Setting the layer style
 * @param {Object} styleConfig the style for point feature
 * @returns {ol/Style} The feature style.
 */
function getPointStyle (styleConfig) {
    const pointSize = styleConfig?.pointSize ? styleConfig.pointSize : 4,
        color = styleConfig?.color ? styleConfig.color : [228, 26, 28, 1];

    return new Style({
        image: new CircleStyle({
            radius: pointSize,
            stroke: new Stroke({
                color: color,
                width: 1
            }),
            fill: new Fill({
                color: color
            })
        })
    });
}


/**
 * Setting the layer feature
 * @param {ol/Layer} layer the created layer
 * @param {Number[]} coordinates The geo coordination
 * @returns {void}
 */
function setPolygonFeatureToLayer (layer, coordinates) {
    const feature = new Feature({
        geometry: new Polygon(coordinates)
    });

    layer.getSource().addFeature(feature);
}

/**
 * Setting the layer style
 * @param {Object} styleConfig the style for point feature
 * @returns {ol/Style} The feature style.
 */
function getPolygonStyle (styleConfig) {
    const borderSize = styleConfig?.borderSize ? styleConfig.borderSize : 4,
        color = styleConfig?.color ? styleConfig.color : [255, 255, 255, 1];

    return new Style({
        stroke: new Stroke({
            color: color,
            width: borderSize
        }),
        fill: new Fill({
            color: [255, 255, 255, 0]
        })
    });
}

export {
    getFeatureLayer,
    getPointStyle,
    getPolygonStyle
};
