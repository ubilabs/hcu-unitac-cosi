import * as Proj from "ol/proj.js";
import * as Extent from "ol/extent";
import GeometryCollection from "ol/geom/GeometryCollection";
import setBBoxToGeom from "../../utils/setBBoxToGeom";
import
{
    Fill,
    Stroke,
    Style
} from "ol/style.js";
import InfoTemplatePoint from "text-loader!./info_point.html";
import InfoTemplateRegion from "text-loader!./info_region.html";
import {getSearchResultsCoordinates} from "../../utils/getSearchResultsGeom";
import * as turf from "@turf/turf";


export const methodConfig = {
    store: null
};
export default {
    /**
     * create isochrones features
     * @returns {void}
     */
    createIsochrones: async function () {
        this.clear();

        try {
            if (this.mode === "point") {
                await this.createIsochronesPoint();
            }
            else {
                await this.createIsochronesRegion();
            }
        }
        catch (err) {
            console.error(err);
            try {
                const res = JSON.parse(err.message || err.error.message);

                if (res.error.code === 3002 || res.error.code === 3099) {
                    this.showErrorInvalidInput();
                }
                else {
                    this.showError();
                }
            }
            catch (e) {
                this.showError();
            }
        }
    },
    /**
     * create isochrones features for selected several coordiantes
     * TODO: break apart into smaller functions
     * @fires Core#RadioRequestMapGetLayerByName
     * @fires OpenRouteService#RadioRequestOpenRouteServiceRequestIsochrones
     * @returns {void}
     */
    createIsochronesRegion: async function () {

        const coordinates = this.getCoordinates(),
            distance = parseFloat(this.distance);

        if (
            coordinates !== null &&
            this.transportType !== "" &&
            this.scaleUnit !== "" &&
            distance !== 0
        ) {
            // TODO: Use store-method - see DistrictSelector component
            this.askUpdate = false;
            this.cleanup();
            const features = await this.getIsochrones({transportType: this.transportType, coordinates, scaleUnit: this.scaleUnit, distance: this.distance});

            // TODO: get locale from store
            this.steps = [distance / 3, distance * 2 / 3, distance].map((n) => Number.isInteger(n) ? n.toLocaleString("de-DE") : n.toFixed(2));
            this.setIsochroneFeatures(features);
            this.currentCoordinates = coordinates;
        }
        else {
            this.inputReminder();
        }
    },
    /**
     * TODO: see TODOs in createIsochronesRegion
     * create isochrones features for selected several coordiantes
     * @returns {void}
     */
    createIsochronesPoint: async function () {
        const distance = parseFloat(this.distance);

        if (
            this.coordinate.length > 0 &&
            this.transportType !== "" &&
            this.scaleUnit !== "" &&
            distance !== 0
        ) {
            this.setByFeature = false;

            const features = await this.getIsochrones({transportType: this.transportType, coordinates: this.coordinate, scaleUnit: this.scaleUnit, distance: this.distance});

            this.steps = [distance / 3, distance * 2 / 3, distance].map((n) => Number.isInteger(n) ? n.toLocaleString("de-DE") : n.toFixed(2));
            this.setRawGeoJson(await this.featureToGeoJson(features[0]));
            this.setIsochroneFeatures(features);
            this.showRequestButton = true;
            this.cleanup();
        }
        else {
            this.inputReminder();
        }
    },
    renderIsochrones (newFeatures) {
        this.mapLayer.getSource().clear();

        if (newFeatures.length === 0 && this.mode === "point") {
            if (this.extent?.length > 0) {
                setBBoxToGeom(this.boundingGeometry);
            }
            return;
        }
        this.styleFeatures(newFeatures);
        this.mapLayer.getSource().addFeatures(newFeatures);
        if (this.mode === "point") {
            this.setIsochroneAsBbox();
        }
    },
    /**
     * add coordinate after user click
     * @param {event} evt Event from User click
     * @returns {void}
     */
    setCoordinateFromClick: function (evt) {
        const rawCoords = this.setByFeature ? this.setCoordinatesByFeatures(evt) : [evt.coordinate],
            coordinates = rawCoords.map(coord => Proj.transform(
                coord,
                "EPSG:25832",
                "EPSG:4326"
            ));

        this.coordinate = coordinates;
        this.placingPointMarker(evt.coordinate);
        this.setBySearch = false;
    },

    setCoordinatesByFeatures: function (evt) {
        const feature = this.map.getFeaturesAtPixel(evt.pixel, {
            layerFilter: layer => this.activeVectorLayerList.includes(layer)
        })[0];

        if (feature) {
            const geom = feature.getGeometry();

            return this.simplifyGeometry(geom) || [evt.coordinate];
        }

        return [evt.coordinate];
    },

    simplifyGeometry (geom) {
        let simplified, geojson;

        if (geom.getType() === "Polygon") {
            geojson = turf.polygon(geom.getCoordinates());
            simplified = turf.simplify(geojson);

            return simplified.geometry.coordinates.flat(1).map(p => [p[0], p[1]]);
        }
        if (geom.getType() === "MultiPolygon") {
            geojson = turf.multiPolygon(geom.getCoordinates());
            simplified = turf.simplify(geojson);

            return simplified.geometry.coordinates.flat(2).map(p => [p[0], p[1]]);
        }
        if (geom.getType() === "Point") {
            return [[geom.getCoordinates()[0], geom.getCoordinates()[1]]];
        }

        return null;
    },

    /**
     * TODO: replace calls to this function with /addons/cosi/utils/getSearchResultsCoordinate.js
     * @returns {void}
     */
    setSearchResultToOrigin: function () {
        const coord = getSearchResultsCoordinates();

        if (coord) {
            this.coordinate = [coord];
            this.setBySearch = true;
        }
    },
    /**
     * reminds user to set inputs
     * @returns {void}
     */
    inputReminder: function () {
        this.addSingleAlert({
            category: "Info",
            content: "<strong>" + this.$t("additional:modules.tools.cosi.accessibilityAnalysis.inputReminder") + "</strong>",
            displayClass: "info"
        });
    },

    showError: function () {
        this.addSingleAlert({
            content: "<strong>" + this.$t("additional:modules.tools.cosi.accessibilityAnalysis.showError") + "</strong>",
            category: "Error",
            displayClass: "error"
        });
    },
    showErrorInvalidInput: function () {
        this.addSingleAlert({
            content: "<strong>" + this.$t("additional:modules.tools.cosi.accessibilityAnalysis.showErrorInvalidInput") + "</strong>",
            category: "Error",
            displayClass: "error"
        });
    },
    /**
     * style isochrone features
     * @param {ol.Feature} features isochone features (polygons)
     * @returns {void}
     */
    styleFeatures: function (features) {
        for (let i = 0; i < features.length; i++) {
            features[i].setStyle(
                new Style({
                    fill: new Fill({
                        color: this.getFeatureColors()[i]
                    }),
                    stroke: new Stroke({
                        color: "white",
                        width: 1
                    })
                })
            );
        }
    },
    /**
     * sets facility layers' bbox as the isochrones
     * @fires Core.ConfigLoader#RadioRequestParserGetItemsByAttributes
     * @fires BboxSettor#RadioTriggerSetBboxGeometryToLayer
     * @returns {void}
     */
    setIsochroneAsBbox: function () {
        const polygonGeometry = this.isochroneFeatures[
                // this.steps.length - 1
                0
            ].getGeometry(),
            geometryCollection = new GeometryCollection([polygonGeometry]);

        setBBoxToGeom(geometryCollection);
    },
    /**
     * shows help window
     * @returns {void}
     */
    showHelp: function () {
        this.cleanup();
        this.addSingleAlert({
            category: "Info",
            content: this.mode === "point" ? InfoTemplatePoint : InfoTemplateRegion,
            displayClass: "info"
        });
    },
    /**
     * clears the component
     * @returns {void}
     */
    clear: function () {
        this.layers = null;
        this.showRequestButton = false;
        this.steps = [0, 0, 0];
        this.setRawGeoJson(null);
        this.setIsochroneFeatures([]);
    },
    getFeatureColors: function () {
        return [
            "rgba(200, 0, 3, 0.1)",
            "rgba(100, 100, 3, 0.15)",
            "rgba(0, 200, 3, 0.2)"
        ];
    },
    getCoordinates: function () {
        const selectedLayerModel = Radio.request("ModelList", "getModelByAttributes", {
            name: this.selectedFacilityName,
            type: "layer"
        });

        if (selectedLayerModel) {
            const features = selectedLayerModel.get("layer")
                .getSource().getFeatures()
                .filter(f => (typeof f.style_ === "object" || f.style_ === null) && !this.isFeatureDisabled(f));

            return features
                .map((feature) => {
                    const geometry = feature.getGeometry();

                    if (geometry.getType() === "Point") {
                        return geometry.getCoordinates().splice(0, 2);
                    }
                    return Extent.getCenter(geometry.getExtent());

                }).map(coord => Proj.transform(coord, "EPSG:25832", "EPSG:4326"));
        }
        return null;
    }
};
