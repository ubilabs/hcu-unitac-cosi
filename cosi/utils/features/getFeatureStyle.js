import {Fill, Stroke, Style, Icon} from "ol/style.js";

/**
 * extracts the style of a feature
 * generates a new style for webgl features
 * @param {module:ol/Feature} feature - the feature to check
 * @param {function} layerStyleFunction - the style function of the layer
 * @returns {module:ol/Style} the feature style
 */
export default function getFeatureStyle (feature, layerStyleFunction) {
    // return the feature's style if exists
    if (feature.getStyle()) {
        return feature.getStyle();
    }
    // generate a style if styleFunction is set on layer
    if (layerStyleFunction) {
        return layerStyleFunction(feature);
    }
    // generate new style if styleRule is set on feature (only WebGL)
    if (feature._styleRule) {
        if (feature._styleRule.style.type === "Icon") {
            return new Style({
                image: new Icon({
                    src: (feature._styleRule.style.imagePath || Config.wfsImgPath) + feature._styleRule.style.imageName,
                    width: 40,
                    height: 40
                })
            });
        }
        return new Style({
            fill: new Fill({color: feature._styleRule.style.polygonFillColor || feature._styleRule.style.circleFillColor}),
            stroke: new Stroke({
                color: feature._styleRule.style.polygonStrokeColor || feature._styleRule.style.circleStrokeColor,
                width: feature._styleRule.style.polygonStrokeWidth || feature._styleRule.style.circleStrokeWidth
            })
        });
    }
    return null;
}
