import {featuresToGeoJsonCollection, featureToGeoJson} from "../../utils/geomUtils";
import {downloadJsonToFile} from "../../utils/download";
import store from "../../../../src/app-store";
import {Point} from "ol/geom.js";
import Feature from "ol/Feature.js";

/**
 * Gets the map's CRS from the app-store
 * @returns {String} the map's current CRS code
 */
function getPortalCrs () {
    return store.getters["Map/projectionCode"];
}

/**
 * Exports the results of the supply analysis as geojson
 * @param {*} mapLayer - the components mapLayer
 * @param {*} selectedFacilityName - the selected facility for analysis
 * @returns {void}
 */
export function exportAsGeoJson (mapLayer) {
    const projectionCode = getPortalCrs(),
        featureCollection = featuresToGeoJsonCollection(mapLayer.getSource().getFeatures(), false, projectionCode),
        stroke = {
            color: "White",
            width: 1
        },
        colors = this.featureColors;

    for (let i = 0; i < featureCollection.features.length; i++) {
        const style = {
            fill: {
                color: colors[i]
            },
            stroke: stroke
        };

        featureCollection.features[i].style = style;
        featureCollection.features[i].properties.index = i;
    }

    if (this.mode === "point") {
        const feature = new Feature(new Point(this.clickCoordinate)),
            featureGeoJson = featureToGeoJson(feature, false, "EPSG:4326");

        featureCollection.features.push(featureGeoJson);
    }
    else if (this.mode === "region") {
        const coordinates = this.getCoordinates();

        for (let i = 0; i < coordinates.length; i++) {
            const feature = new Feature(new Point(coordinates[i])),
                featureGeoJson = featureToGeoJson(feature, false, "EPSG:4326");

            featureCollection.features.push(featureGeoJson);
        }
    }
    downloadJsonToFile(featureCollection, "Erreichbarkeitsanalyse_CoSI.geojson");
    downloadJsonToFile(require("../assets/Erreichbarkeitsanalyse_style.json"), "Erreichbarkeitsanalyse_CoSI_styles.json");
}
