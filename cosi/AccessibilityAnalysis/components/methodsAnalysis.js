import GeoJSON from "ol/format/GeoJSON";
import * as Proj from "ol/proj.js";
import * as Extent from "ol/extent";
import GeometryCollection from "ol/geom/GeometryCollection";
import setBBoxToGeom from "../../utils/setBBoxToGeom";
import {
    Fill,
    Stroke,
    Style
} from "ol/style.js";
import InfoTemplatePoint from "text-loader!./info_point.html";
import InfoTemplateRegion from "text-loader!./info_region.html";
import * as turf from "@turf/turf";
import {getSearchResultsCoordinates} from "../../utils/getSearchResultsGeom";

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
                const res = JSON.parse(err.response);

                if (res.error.code === 3002) {
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
        const range =
            this.scaleUnit === "time" ? this.distance * 60 : this.distance,

            coordinates = this.getCoordinates();

        if (
            coordinates !== null &&
            this.transportType !== "" &&
            this.scaleUnit !== "" &&
            range !== 0
        ) {
            // TODO: Use store-method - see DistrictSelector component
            this.askUpdate = false;
            this.cleanup();
            // group coordinates into groups of 5
            const coordinatesList = [],
                groupedFeaturesList = [],
                distance = parseFloat(this.distance);

            for (let i = 0; i < coordinates.length; i += 5) {
                const arrayItem = coordinates.slice(i, i + 5);

                coordinatesList.push(arrayItem);
            }

            if (this.abortController) {
                this.abortController.abort();
            }
            this.abortController = this.createAbortController();
            for (const coords of coordinatesList) {
                // TODO: make use of new OpenRouteService component
                const res = await this.requestIsochrones(this.transportType, coords, this.scaleUnit,
                        [range, range * 2 / 3, range / 3], this.abortController.signal),
                    // reverse JSON object sequence to render the isochrones in the correct order
                    // this reversion is intended for centrifugal isochrones (when range.length is larger than 1)
                    json = JSON.parse(res),
                    reversedFeatures = [...json.features].reverse(),
                    groupedFeatures = [
                        [],
                        [],
                        []
                    ];

                for (let i = 0; i < reversedFeatures.length; i = i + 3) {
                    groupedFeatures[i % 3].push(reversedFeatures[i]);
                    groupedFeatures[(i + 1) % 3].push(reversedFeatures[i + 1]);
                    groupedFeatures[(i + 2) % 3].push(reversedFeatures[i + 2]);
                }
                json.features = reversedFeatures;
                groupedFeaturesList.push(groupedFeatures);
            }
            let features = [];

            for (let i = 0; i < 3; i++) {
                let layeredList = groupedFeaturesList.map(groupedFeatures => groupedFeatures[i]),
                    layerUnion,
                    layerUnionFeatures;

                layeredList = [].concat(...layeredList);
                layerUnion = layeredList[0];

                for (let j = 0; j < layeredList.length; j++) {
                    layerUnion = turf.union(layerUnion, layeredList[j]);
                }
                layerUnionFeatures = this.parseDataToFeatures(JSON.stringify(layerUnion));

                /** @todo get projections via arguments and/or store */
                layerUnionFeatures = this.transformFeatures(layerUnionFeatures, "EPSG:4326", "EPSG:25832");

                /** @todo featureType via i18n */
                const featureType = "Erreichbarkeit im Gebiet";

                /** @todo add props to layers, like type of facility, unit of measured distance */
                layerUnionFeatures.forEach(feature => {
                    feature.set("featureType", featureType);
                    feature.set("value", layeredList[0].properties.value);
                    feature.set("mode", this.transportType);
                    feature.set("unit", this.scaleUnit);
                    feature.set("topic", this.selectedFacilityName);
                });
                features = features.concat(layerUnionFeatures);
            }
            this.setIsochroneFeatures(features);
            this.currentCoordinates = coordinates;

            // TODO: get locale from store
            this.steps = [distance / 3, distance * 2 / 3, distance].map((n) => Number.isInteger(n) ? n.toLocaleString("de-DE") : n.toFixed(2));
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
        const range = this.scaleUnit === "time" ? this.distance * 60 : this.distance;

        if (
            this.coordinate !== null &&
            this.transportType !== "" &&
            this.scaleUnit !== "" &&
            range !== 0
        ) {
            if (this.abortController) {
                this.abortController.abort();
            }
            this.abortController = this.createAbortController();
            const res = await this.requestIsochrones(
                    this.transportType,
                    [this.coordinate],
                    this.scaleUnit,
                    [range / 3, range * 2 / 3, range],
                    this.abortController.signal
                ),


                distance = parseFloat(this.distance);

            this.steps = [distance / 3, distance * 2 / 3, distance].map((n) => Number.isInteger(n) ? n.toString() : n.toFixed(2));

            // reverse JSON object sequence to render the isochrones in the correct order
            // eslint-disable-next-line one-var
            const json = JSON.parse(res),
                reversedFeatures = [...json.features].reverse(),
                featureType = "Erreichbarkeit ab einem Referenzpunkt";

            json.features = reversedFeatures;

            let newFeatures = this.parseDataToFeatures(JSON.stringify(json));

            newFeatures = this.transformFeatures(
                newFeatures,
                "EPSG:4326",
                "EPSG:25832"
            );

            newFeatures.forEach((feature) => {
                feature.set("featureType", featureType);
                feature.set("coordinate", [this.coordinate]);
            });

            this.setRawGeoJson(await this.featureToGeoJson(newFeatures[0]));
            this.setIsochroneFeatures(newFeatures);

            await this.$nextTick();
            this.setIsochroneAsBbox();
            this.showRequestButton = true;
            this.cleanup();
        }
        else {
            this.inputReminder();
        }
    },
    renderIsochrones (newFeatures) {
        this.styleFeatures(newFeatures);
        this.mapLayer.getSource().addFeatures(newFeatures);
    },
    /**
     * Tries to parse data string to ol.format.GeoJson
     * @param   {string} data string to parse
     * @throws Will throw an error if the argument cannot be parsed.
     * @returns {object}    ol/format/GeoJSON/features
     */
    parseDataToFeatures: function (data) {
        const geojsonReader = new GeoJSON();
        let jsonObjects;

        try {
            jsonObjects = geojsonReader.readFeatures(data);
        }
        catch (err) {
            console.error(err);
            this.showError();
        }

        return jsonObjects;
    },
    /**
     * Transforms features between CRS
     * @param   {feature[]} features Array of ol.features
     * @param   {string}    crs      EPSG-Code of feature
     * @param   {string}    mapCrs   EPSG-Code of ol.map
     * @returns {void}
     */
    transformFeatures: function (features, crs, mapCrs) {
        features.forEach(function (feature) {
            const geometry = feature.getGeometry();

            if (geometry) {
                geometry.transform(crs, mapCrs);
            }
        });
        return features;
    },
    /**
     * add coordinate after user click
     * @param {event} evt Event from User click
     * @returns {void}
     */
    setCoordinateFromClick: function (evt) {
        const coordinate = Proj.transform(
            evt.coordinate,
            "EPSG:25832",
            "EPSG:4326"
        );

        this.coordinate = coordinate;
        this.placingPointMarker(evt.coordinate);
        this.setBySearch = false;
    },
    /**
     * TODO: replace calls to this function with /addons/cosi/utils/getSearchResultsCoordinate.js
     * @returns {void}
     */
    setSearchResultToOrigin: function () {
        const coord = getSearchResultsCoordinates();

        if (coord) {
            this.coordinate = coord;
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


        if (this.mapLayer.getSource().getFeatures().length > 0) {
            this.mapLayer.getSource().clear();
            if (this.extent?.length > 0) {
                setBBoxToGeom(this.boundingGeometry);
            }
        }
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
