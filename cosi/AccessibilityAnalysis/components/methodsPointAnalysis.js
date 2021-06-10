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

export const methodConfig = {store: null};
export default {
    /**
     * create isochrones features
     * @returns {void}
     */
    createIsochrones: function () {
        this.clear();
        if (this.mode === "point") {
            this.createIsochronesPoint();
        }
        else {
            this.createIsochronesRegion();
        }
    },
    /**
     * create isochrones features for selected several coordiantes
     * TODO: break apart into smaller functions
     * @fires Alerting#RadioTriggerAlertAlertRemove
     * @fires Core#RadioRequestMapGetLayerByName
     * @fires OpenRouteService#RadioRequestOpenRouteServiceRequestIsochrones
     * @returns {void}
     */
    createIsochronesRegion: async function () {
        const range =
            this.scaleUnit === "time" ? this.distance * 60 : this.distance,

            coordinates = this.getCoordinates(this.selectedFacilityName);

        if (
            coordinates !== null &&
            this.transportType !== "" &&
            this.scaleUnit !== "" &&
            range !== 0
        ) {
            // TODO: Use store-method - see DistrictSelector component
            Radio.trigger("Alert", "alert:remove");
            // group coordinates into groups of 5
            const coordinatesList = [],
                groupedFeaturesList = [],
                distance = parseFloat(this.distance);

            for (let i = 0; i < coordinates.length; i += 5) {
                const arrayItem = coordinates.slice(i, i + 5);

                coordinatesList.push(arrayItem);
            }

            for (const coords of coordinatesList) {
                // TODO: make use of new OpenRouteService component
                const res = await Radio.request("OpenRoute", "requestIsochrones", this.transportType, coords, this.scaleUnit,
                        [range, range * 0.67, range * 0.33]),
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

                // TODO: get projections via arguments and/or store
                layerUnionFeatures = this.transformFeatures(layerUnionFeatures, "EPSG:4326", "EPSG:25832");

                const featureType = "Erreichbarkeit im Gebiet";

                // TODO: add props to layers, like type of facility, unit of measured distance
                layerUnionFeatures.forEach(feature => {
                    feature.set("featureType", featureType);
                });
                features = features.concat(layerUnionFeatures);
            }
            this.styleFeatures(features);
            this.mapLayer.getSource().addFeatures(features);

            // TODO: get locale from store
            this.steps = [distance * 0.33, distance * 0.67, distance].map((n) => Number.isInteger(n) ? n.toLocaleString("de-DE") : n.toFixed(2)
            );
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
        const range =
            this.scaleUnit === "time" ? this.distance * 60 : this.distance;

        if (
            this.coordinate !== null &&
            this.transportType !== "" &&
            this.scaleUnit !== "" &&
            range !== 0
        ) {
            try {
                const res = await Radio.request(
                        "OpenRoute",
                        "requestIsochrones",
                        this.transportType,
                        [this.coordinate],
                        this.scaleUnit,
                        [range * 0.33, range * 0.67, range]
                    ),


                    distance = parseFloat(this.distance);

                this.steps = [distance * 0.33, distance * 0.67, distance].map((n) => Number.isInteger(n) ? n.toString() : n.toFixed(2)
                );

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
                });

                this.rawGeoJson = await this.featureToGeoJson(newFeatures[0]);

                this.styleFeatures(newFeatures, [this.coordinate]);

                this.mapLayer.getSource().addFeatures(newFeatures.reverse());
                this.isochroneFeatures = newFeatures;
                this.setIsochroneAsBbox();
                this.showRequestButton = true;
                Radio.trigger("Alert", "alert:remove");
            }
            catch (err) {
                console.error(err);
                this.showError();
            }
        }
        else {
            this.inputReminder();
        }
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
        let features = this.markerPoint.getSource().getFeatures();

        if (features.length === 1) {
            // single point
            const coord = features[0].getGeometry().getCoordinates(),
                pcoord = Proj.transform(coord, "EPSG:25832", "EPSG:4326");

            this.coordinate = pcoord;
            this.setBySearch = true;
        }
        else {
            // single polygon
            features = this.markerPolygon.getSource().getFeatures();
            if (features.length === 1) {
                const pts = features[0].getGeometry().getInteriorPoints();

                if (pts.getPoints().length === 1) {
                    const pcoord = Proj.transform(
                        pts.getPoints()[0].getCoordinates().slice(0, 2),
                        "EPSG:25832",
                        "EPSG:4326"
                    );

                    this.coordinate = pcoord;
                    this.setBySearch = true;
                }
                else if (pts.getPoints().length > 1) {
                    const geo = features[0].getGeometry(),
                        coords = Extent.getCenter(geo.getExtent()),
                        pcoord = Proj.transform(coords, "EPSG:25832", "EPSG:4326");

                    this.coordinate = pcoord;
                    this.setBySearch = true;
                }
            }
        }
    },
    /**
     * reminds user to set inputs
     * @returns {void}
     */
    inputReminder: function () {
        Radio.trigger("Alert", "alert", {
            text: "<strong>Bitte füllen Sie alle Felder aus.</strong>",
            kategorie: "alert-warning"
        });
    },

    showError: function () {
        Radio.trigger("Alert", "alert", {
            text: "<strong>Die Anfrage konnte nicht korrekt ausgeführt werden. Bitte überprüfen Sie Ihre Eingaben.</strong>",
            kategorie: "alert-danger"
        });
    },
    /**
     * style isochrone features
     * @param {ol.Feature} features isochone features (polygons)
     * @param {array} coordinate todo
     * @returns {void}
     */
    styleFeatures: function (features, coordinate) {
        for (let i = 0; i < features.length; i++) {
            features[i].setProperties({
                coordinate
            });
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
                this.steps.length - 1
            ].getGeometry(),
            geometryCollection = new GeometryCollection([polygonGeometry]);

        setBBoxToGeom(geometryCollection);
    },
    /**
     * updates facilitie's name within the isochrone results
     * @returns {void}
     */
    updateResult: function () {
        const visibleLayerModels = Radio.request(
            "ModelList",
            "getModelsByAttributes", {
                typ: "WFS",
                isBaseLayer: false,
                isSelected: true
            }
        );

        if (visibleLayerModels.length > 0) {
            this.layers = [];
            Radio.trigger("Alert", "alert:remove");
            visibleLayerModels.forEach((layerModel) => {
                const features = layerModel.get("layer").getSource().getFeatures();

                if (features && features.length) {
                    let idSelector;

                    // inscribe the coordinate to the feature for rendering to the resultView DOM Element
                    // for zooming to feature by click
                    // eslint-disable-next-line one-var
                    const sfeatures = features.map((feature, i) => {
                        const geometry = feature.getGeometry(),
                            coord =
                            geometry.getType() === "Point" ?
                                geometry.getCoordinates().splice(0, 2) :
                                Extent.getCenter(geometry.getExtent());

                        let label = feature.getProperties()[idSelector];

                        if (!label) {
                            label = i + 1;
                        }
                        return [label, coord];
                    });

                    this.layers.push({
                        layerName: layerModel.get("name"),
                        layerId: layerModel.get("id"),
                        features: sfeatures
                    });
                }
            });
        }
        else {
            this.selectionReminder();
        }
    },
    /**
     * reminds user to select facility layers
     * @returns {void}
     */
    selectionReminder: function () {
        Radio.trigger("Alert", "alert", {
            text: "<strong>Bitte wählen Sie mindestens ein Thema unter Fachdaten aus, zum Beispiel \"Sportstätten\".</strong>",
            kategorie: "alert-warning"
        });
    },
    resetMarkerAndZoom: function () {
        const icoord = Proj.transform(this.coordinate, "EPSG:4326", "EPSG:25832");

        this.placingPointMarker(icoord);
        Radio.trigger("MapView", "setCenter", icoord);
    },
    showInDashboard: function () {
        const el = $(this.$refs.result);

        Radio.trigger("Dashboard", "append", el, "#dashboard-containers", {
            id: "reachability",
            name: "Erreichbarkeit ab einem Referenzpunkt",
            glyphicon: "glyphicon-road",
            scalable: true
        });
        el.find("#dashboard-container").empty();
    },
    /**
     * shows help window
     * @returns {void}
     */
    showHelp: function () {
        Radio.trigger("Alert", "alert:remove");
        Radio.trigger("Alert", "alert", {
            text: this.mode === "point" ? InfoTemplatePoint : InfoTemplateRegion,
            kategorie: "alert-info",
            position: "center-center"
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
        this.rawGeoJson = null;
        this.isochroneFeatures = [];

        if (this.mapLayer.getSource().getFeatures().length > 0) {
            this.mapLayer.getSource().clear();
            if (this.extent?.length > 0) {
                setBBoxToGeom(this.boundingGeometry);
            }
        }
    },
    /**
     * requests inhabitant calculation function
     * @returns {void}
     */
    requestInhabitants: function () {
        // TODO
        Radio.trigger(
            "GraphicalSelect",
            "onDrawEnd",
            this.rawGeoJson,
            "einwohnerabfrage",
            true
        );
    },
    getFeatureColors: function () {
        return [
            "rgba(200, 0, 3, 0.1)",
            "rgba(100, 100, 3, 0.15)",
            "rgba(0, 200, 3, 0.2)"
        ];
    },
    getCoordinates: function (name) {
        const selectedLayerModel = Radio.request("ModelList", "getModelByAttributes", {
            name: name
        });

        if (selectedLayerModel) {
            const features = selectedLayerModel.get("layer")
                .getSource().getFeatures().filter(f => typeof f.style_ === "object" || f.style_ === null);

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
