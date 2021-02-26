import {Fill, Stroke, Style} from "ol/style";
/**
 * @version 1.0
 * @exports addons/olStyles
 * @namespace olStyles
 */
export default {
    defaultColor: "rgba(255, 57, 218,1)",
    selectedColor: "rgba(218, 57, 255,1)",
    defaultClusterColor: new Style({
        fill: new Fill({
            color: "rgba(255, 128, 175, 0.2)"
        }),
        stroke: new Stroke({
            color: "rgba(255, 57, 218,1)",
            width: 3
        })
    }),
    defaultBuildingColor: new Style({
        fill: new Fill({
            color: "rgba(0, 181, 204, 0.3)"
        }),
        stroke: new Stroke({
            color: "rgba(0,84,94,1)",
            width: 2
        })
    }),
    default: new Style({
        fill: new Fill({
            color: "rgba(255, 128, 175, 0.3)"
        }),
        stroke: new Stroke({
            color: "rgba(255, 57, 218,1)",
            width: 3
        })
    }),
    selected: new Style({
        fill: new Fill({
            color: "rgba(175, 128, 255, 0.3)"
        }),
        stroke: new Stroke({
            color: "rgba(218, 57, 255,1)",
            width: 3
        })
    }),
    withPotential: new Style({
        fill: new Fill({
            color: "rgba(182, 252, 91, 0.3)"
        }),
        stroke: new Stroke({
            color: "rgba(0,255,0,1)",
            width: 3
        })
    }),
    withoutPotential: new Style({
        fill: new Fill({
            color: "rgba(217, 17, 17, 0.3)"
        }),
        stroke: new Stroke({
            color: "rgba(255,0,0,1)",
            width: 3
        })
    }),
    /**
     * @memberof olStyles
     * @method byColor
     * @param {string} color - (optional) color
     * @description display a layer that gives the exact area being searched when the "Suche starten" button is triggered
     * @returns {void}
     */
    byColor (color) {
        if (!color) {
            return this.default;
        }

        return new Style({
            fill: new Fill({
                color: color.replace("rgb", "rgba").replace(")", ",0.6)")
            }),
            stroke: new Stroke({
                color: color,
                width: 3
            })
        });
    },
    /**
     * @memberof olStyles
     * @method highlight
     * @description highligt the selected area by increasing the opacity
     * @param {ol.style} style openLayers style
     * @returns {ol.Style} an openlayers style
     */
    highlight (style) {
        if (!style) {
            return this.selected;
        }

        const color = style.getStroke().getColor().split("(")[1].split(")")[0].split(",");

        return new Style({
            fill: new Fill({
                color: [color[0], color[1], color[2], 0.5]
            }),
            stroke: new Stroke({
                color: this.selectedColor,
                width: 6
            })
        });
    },
    /**
     * @memberof olStyles
     * @method highlight
     * @description highligt the selected area by increasing the opacity
     * @param {ol.style} style openLayers style
     * @returns {ol.Style} an openlayers style
     */
    select (style) {
        if (!style) {
            return this.selected;
        }
        const color = style.getStroke().getColor();


        return new Style({
            fill: new Fill({
                color: [color[0], color[1], color[2], 0.25]
            }),
            stroke: new Stroke({
                color: color,
                width: 6
            })
        });
    }
};
