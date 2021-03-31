import {Fill, Stroke, Style} from "ol/style.js";
import {asArray} from "ol/color";

const defaultsStyleValues = {fillColor: [255, 255, 255, 0], stroke: {color: "#3399CC", width: 3}};

/**
 * @description Styles the features of the selected layer with transparent overlay for better readability
 * @param {Object[]} districtLevels - the districtlevels object from the district selector module
 * @param {string} selectedLevelId - the ID of the selected level
 * @param {number} [opacity=0.6] - the opacity of the overlay
 * @param {Object} [defaults={fillColor: [255, 255, 255, 0], stroke: {color: "#3399CC", width: 3}}] - the default values in case no styles can be obtained
 * @returns {void}
 */
export default function styleSelectedDistrictLevels (districtLevels, selectedLevelId, opacity = 0.6, defaults = defaultsStyleValues) {
    if (!Array.isArray(districtLevels)) {
        console.error("styleSelectedDistrictLevels: district levels must be an array of objects");
        return;
    }
    if (typeof opacity !== "number") {
        console.error("styleSelectedDistrictLevels: Opacity must be a number, but got " + typeof opacity);
        return;
    }

    districtLevels.forEach(level => {
        if (level.layerId === selectedLevelId) {
            const vectorLayerStyle = level.layer.getStyleFunction(), // read styling function from layer
                baseStyle = vectorLayerStyle(level.layer.getSource().getFeatures()[0])?.[0], // apply to first feature of layer
                baseFillColor = asArray(baseStyle?.getFill()?.getColor() || defaults.fillColor), // read base fill color of style
                selectedStyle = new Style({
                    fill: new Fill({
                        color: [baseFillColor[0], baseFillColor[1], baseFillColor[2], opacity]
                    }),
                    stroke: baseStyle?.getStroke() || new Stroke(defaults.stroke)
                });

            level.layer.setStyle(selectedStyle);
        }
        else {
            const model = Radio.request("ModelList", "getModelByAttributes", {id: level.layerId});

            if (model) {
                model.styling();
            }
        }
    });
}
