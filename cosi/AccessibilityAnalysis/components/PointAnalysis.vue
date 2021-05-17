<script>
import { mapGetters, mapActions } from "vuex";
import Dropdown from "../../../../src/share-components/dropdowns/DropdownSimple.vue";
import * as Proj from "ol/proj.js";
import * as Extent from "ol/extent";
import GeoJSON from "ol/format/GeoJSON";
import GeometryCollection from "ol/geom/GeometryCollection";
import setBBoxToGeom from "../../utils/setBBoxToGeom";
import { Fill, Stroke, Style } from "ol/style.js";
import ReachabilityResult from "./ReachabilityResult.vue";
import InfoTemplate from "text-loader!./info.html";

export default {
  name: "PointAnalysis",
  components: {
    Dropdown,
    ReachabilityResult,
  },
  data() {
    return {
      mapLayer: null,
      coordinate: null,
      setBySearch: false,
      transportType: "",
      transportTypes: {
        "": "-Leeren-",
        "driving-car": "Auto",
        "cycling-regular": "Rad",
        "cycling-electric": "Rad (elektrisch)",
        "foot-walking": "Gehen",
        wheelchair: "Rollstuhl",
      },
      scaleUnit: "",
      scaleUnits: {
        "": "-Leeren-",
        time: "Zeit (in min)",
        distance: "Entfernung (in m)",
      },
      distance: "",
      featureType: "Erreichbarkeit ab einem Referenzpunkt", // used for targeting the features within the layer
      rawGeoJson: null,
      showRequestButton: false,
      isochroneFeatures: [],
      steps: [0, 0, 0],
      legendColors: [
        "rgba(0, 200, 3, 0.6)",
        "rgba(100, 100, 3, 0.4)",
        "rgba(200, 0, 3, 0.4)",
      ],
      featureColors: [
        "rgba(200, 0, 3, 0.1)",
        "rgba(100, 100, 3, 0.15)",
        "rgba(0, 200, 3, 0.2)",
      ],
      layers: null,
      // layers: [
      //   {
      //     layerName: "Öffentliche Bibliotheken",
      //     layerId: "19574",
      //     features: [
      //       [1, [570824.297, 5936699.183]],
      //       [2, [563727.906, 5939460.024]],
      //       [3, [569135.925, 5937984.32]],
      //       [4, [566215.467, 5938851.577]],
      //       [5, [569951.144, 5941128.675]],
      //       [6, [571364.041, 5940805.339]],
      //       [7, [569049.021, 5936960.341]],
      //       [8, [565395.821, 5930338.883]],
      //       [9, [566866.781, 5928072.595]],
      //       [10, [573382.404, 5932829.053]],
      //       [11, [566851.562, 5933894.162]],
      //       [12, [571664.534, 5934430.264]],
      //       [13, [563080.846, 5934655.51]],
      //       [14, [563375.559, 5936312.499]],
      //     ],
      //   },
      // ],
    };
  },
  watch: {
    distance() {
      console.log(this.distance);
    },
  },
  mounted() {
    // this.applyTranslationKey(this.name);

    // TODO
    //this.mapLayer = this.createLayerIfNotExists("reachability-from-point");
    this.mapLayer = Radio.request(
      "Map",
      "createLayerIfNotExists",
      "reachability-from-point"
    );
    this.mapLayer.setVisible(true);
    this.map.addEventListener("click", this.setCoordinateFromClick);

    // TODO: use Radio/Backbone?
    Backbone.Events.listenTo(Radio.channel("Searchbar"), {
      hit: this.setSearchResultToOrigin,
    });
    console.log(this.map);
  },
  computed: {
    ...mapGetters("Map", ["map", "getOverlayById", "createLayerIfNotExists"]),
    ...mapGetters("MapMarker", ["markerPoint", "markerPolygon"]),
    ...mapGetters("Tools/DistrictSelector", ["extent", "boundingGeometry"]),
  },
  methods: {
    ...mapActions("MapMarker", ["placingPointMarker", "removePointMarker"]),
    ...mapActions("GraphicalSelect", ["featureToGeoJson"]),
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
    setSearchResultToOrigin: function () {
      let features = this.markerPoint.getSource().getFeatures();
      if (features.length == 1) {
        // single point
        const coord = features[0].getGeometry().getCoordinates();
        const pcoord = Proj.transform(coord, "EPSG:25832", "EPSG:4326");
        this.coordinate = pcoord;
        this.setBySearch = true;
      } else {
        // single polygon
        features = this.markerPolygon.getSource().getFeatures();
        if (features.length == 1) {
          const pts = features[0].getGeometry().getInteriorPoints();
          if (pts.getPoints().length == 1) {
            const pcoord = Proj.transform(
              pts.getPoints()[0].getCoordinates().slice(0, 2),
              "EPSG:25832",
              "EPSG:4326"
            );
            this.coordinate = pcoord;
            this.setBySearch = true;
          } else if (pts.getPoints().length > 1) {
            const geo = features[0].getGeometry();
            const coords = Extent.getCenter(geo.getExtent());
            const pcoord = Proj.transform(coords, "EPSG:25832", "EPSG:4326");
            this.coordinate = pcoord;
            this.setBySearch = true;
          }
        }
      }
    },
    createIsochrones: async function () {
      // coordinate has to be in the format of [[lat,lon]] for the request
      const range =
        this.scaleUnit === "time" ? this.distance * 60 : this.distance;

      if (
        this.coordinate != null &&
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
          );

          const distance = parseFloat(this.distance);
          this.steps = [distance * 0.33, distance * 0.67, distance].map((n) =>
            Number.isInteger(n) ? n.toString() : n.toFixed(2)
          );

          // reverse JSON object sequence to render the isochrones in the correct order
          const json = JSON.parse(res);
          const reversedFeatures = [...json.features].reverse();
          json.features = reversedFeatures;
          let newFeatures = this.parseDataToFeatures(JSON.stringify(json));

          newFeatures = this.transformFeatures(
            newFeatures,
            "EPSG:4326",
            "EPSG:25832"
          );

          newFeatures.forEach((feature) => {
            feature.set("featureType", this.featureType);
          });

          this.rawGeoJson = await this.featureToGeoJson(newFeatures[0]);
          console.log(this.rawGeoJson);

          this.styleFeatures(newFeatures, [coordinate]);

          this.mapLayer.getSource().clear(); // Persistence of more than one isochrones?
          this.mapLayer.getSource().addFeatures(newFeatures.reverse());
          this.isochroneFeatures = newFeatures;
          this.setIsochroneAsBbox();
          this.showRequestButton = true;
          Radio.trigger("Alert", "alert:remove");
        } catch (err) {
          console.error(err);
          this.showError();
        }
      } else {
        this.inputReminder();
      }
    },
    /**
     * reminds user to set inputs
     * @returns {void}
     */
    inputReminder: function () {
      Radio.trigger("Alert", "alert", {
        text: "<strong>Bitte füllen Sie alle Felder aus.</strong>",
        kategorie: "alert-warning",
      });
    },

    showError: function () {
      Radio.trigger("Alert", "alert", {
        text:
          "<strong>Die Anfrage konnte nicht korrekt ausgeführt werden. Bitte überprüfen Sie Ihre Eingaben.</strong>",
        kategorie: "alert-danger",
      });
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
      } catch (err) {
        console.error(err);
        this.showError();
      }

      return jsonObjects;
    },
    /**
     * clears the list of facilities within the isochrones
     * @returns {void}
     */
    // hideDashboardButton: function () {
    //   this.$el.find("#show-in-dashboard").hide();
    //   //   this.$el.find("#hh-request").hide();
    // },
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
     * style isochrone features
     * @param {ol.Feature} features isochone features (polygons)
     * @param {array} coordinate todo
     * @returns {void}
     */
    styleFeatures: function (features, coordinate) {
      for (let i = 0; i < features.length; i++) {
        features[i].setProperties({ coordinate });
        features[i].setStyle(
          new Style({
            fill: new Fill({
              color: this.featureColors[i],
            }),
            stroke: new Stroke({
              color: "white",
              width: 1,
            }),
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
      //TODO
      const visibleLayerModels = Radio.request(
        "ModelList",
        "getModelsByAttributes",
        { typ: "WFS", isBaseLayer: false, isSelected: true }
      );

      if (visibleLayerModels.length > 0) {
        this.layers = [];
        Radio.trigger("Alert", "alert:remove");
        visibleLayerModels.forEach((layerModel) => {
          const features = layerModel.get("layer").getSource().getFeatures();
          let idSelector;

          /**
           * hard coded id selector for facility layers
           */
          if (features[0].getProperties().schul_id) {
            idSelector = features[0].getProperties().schulname
              ? "schulname"
              : "schul_id";
          } else if (features[0].getProperties().einrichtung) {
            idSelector = features[0].getProperties().name
              ? "name"
              : "einrichtung";
          } else if (features[0].getProperties().Einrichtungsnummer) {
            idSelector = features[0].getProperties().Name_normalisiert
              ? "Name_normalisiert"
              : "Einrichtungsnummer";
          } else if (features[0].getProperties().identnummer) {
            idSelector = features[0].getProperties().belegenheit
              ? "belegenheit"
              : "identnummer";
          } else if (features[0].getProperties().hauptklasse) {
            idSelector = features[0].getProperties().anbietername
              ? "anbietername"
              : "strasse";
          }
          // inscribe the coordinate to the feature for rendering to the resultView DOM Element
          // for zooming to feature by click
          const sfeatures = features.map((feature, i) => {
            const geometry = feature.getGeometry();
            const coord =
              geometry.getType() === "Point"
                ? geometry.getCoordinates().splice(0, 2)
                : Extent.getCenter(geometry.getExtent());

            let label = feature.getProperties()[idSelector];
            if (!label) label = i + 1;
            return [label, coord];
          });

          this.layers.push({
            layerName: layerModel.get("name"),
            layerId: layerModel.get("id"),
            features: sfeatures,
          });
        });
        // dataObj.coordinate = Proj.transform(
        //   this.coordinate,
        //   "EPSG:4326",
        //   "EPSG:25832"
        // );

        console.log(this.layers);

        // this.model.set("dataObj", dataObj);
        // this.resultView = new ReachabilityResultView({ model: this.model });
        // this.$el.find("#result").html(this.resultView.render().$el);
        // this.$el.find("#show-in-dashboard").show();
      } else {
        this.selectionReminder();
      }
    },
    /**
     * reminds user to select facility layers
     * @returns {void}
     */
    selectionReminder: function () {
      Radio.trigger("Alert", "alert", {
        text:
          '<strong>Bitte wählen Sie mindestens ein Thema unter Fachdaten aus, zum Beispiel "Sportstätten".</strong>',
        kategorie: "alert-warning",
      });
    },
    resetMarkerAndZoom: function () {
      const icoord = Proj.transform(this.coordinate, "EPSG:4326", "EPSG:25832");
      this.placingPointMarker(icoord);
      Radio.trigger("MapView", "setCenter", icoord);
    },
    showInDashboard: function () {
      //TODO
      Radio.trigger("Dashboard", "append", this.$el, "#dashboard-containers", {
        id: "reachability",
        name: "Erreichbarkeit ab einem Referenzpunkt",
        glyphicon: "glyphicon-road",
        scalable: true,
      });
      // this.$el.find("#dashboard-container").empty();
    },
    /**
     * shows help window
     * @returns {void}
     */
    showHelp: function () {
      Radio.trigger("Alert", "alert:remove");
      Radio.trigger("Alert", "alert", {
        text: InfoTemplate,
        kategorie: "alert-info",
        position: "center-center",
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

      if (this.mapLayer.getSource().getFeatures().length > 0) {
        this.mapLayer.getSource().clear();
        this.model.isochroneFeatures = [];
        //TODO
        if (this.extent.length > 0) {
          setBBoxToGeom(this.boundingGeometry);
        }
      }
    },
    /**
     * requests inhabitant calculation function
     * @returns {void}
     */
    requestInhabitants: function () {
      //TODO
      Radio.trigger(
        "GraphicalSelect",
        "onDrawEnd",
        this.rawGeoJson,
        "einwohnerabfrage",
        true
      );
    },
  },
};
</script>
<template>
  <div class="isochrones">
    <form class="form-horizontal">
      <div class="form-group">
        <label class="col-sm-3">Referenzpunkt</label>
        <div class="col-sm-9">
          <input
            class="form-control input-sm"
            title="Referenzpunkt"
            id="coordinate"
            type="text"
            min="0"
            v-model="coordinate"
          />
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3">Verkehrsmittel</label>
        <div class="col-sm-9">
          <Dropdown
            title="Verkehrsmittel"
            v-model="transportType"
            :options="transportTypes"
          />
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3">Maßeinheit der Entfernung</label>
        <div class="col-sm-9">
          <Dropdown
            title="Maßeinheit der Entfernung"
            v-model="scaleUnit"
            :options="scaleUnits"
          />
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3">Entfernung</label>
        <div class="col-sm-9">
          <input
            class="form-control input-sm"
            title="Entfernung"
            id="range"
            type="number"
            min="0"
            v-model="distance"
          />
        </div>
      </div>
      <div class="form-group">
        <div class="col-sm-offset-3 col-sm-5">
          <button
            type="button"
            class="btn btn-lgv-grey"
            id="create-isochrones"
            @click="createIsochrones()"
          >
            Berechnen
          </button>
        </div>
        <div class="col-sm-1">
          <div id="help" @click="showHelp()">
            <span class="glyphicon glyphicon-question-sign"></span>
          </div>
        </div>
        <div class="col-sm-1" @click="clear()">
          <div id="clear" title="Lösche aktuelles Ergebnis">
            <span class="glyphicon glyphicon-trash"></span>
          </div>
        </div>
      </div>
    </form>
    <hr />
    <h5><strong>Legende: </strong></h5>
    <div id="legend">
      <template v-for="(j, i) in steps">
        <svg :key="i" width="15" height="15">
          <circle
            cx="7.5"
            cy="7.5"
            r="7.5"
            :style="`fill: ${legendColors[i]}; stroke-width: 0.5; stroke: #e3e3e3;`"
          />
        </svg>
        <span :key="i * 2 + steps.length">
          {{ j }}
        </span>
      </template>
    </div>
    <br />
    <button
      type="button"
      class="btn btn-lgv-grey measure-delete"
      id="show-result"
      @click="updateResult"
    >
      <span class="glyphicon glyphicon-th-list"></span>Einrichtungsabdeckung
    </button>
    <div id="result"></div>
    <template v-if="layers">
      <ReachabilityResult :layers="layers" />
      <table>
        <tr>
          <td>
            <button
              @click="resetMarkerAndZoom"
              class="btn btn-lgv-grey measure-delete isochrone-origin"
            >
              zoom
            </button>
          </td>
          <td>
            <button
              @click="showInDashboard"
              type="button"
              class="btn btn-lgv-grey measure-delete"
            >
              Im Dashboard anzeigen
            </button>
          </td>
        </tr>
      </table>
    </template>

    <button
      v-if="showRequestButton"
      class="btn btn-lgv-grey measure-delete"
      @click="requestInhabitants"
    >
      <span class="glyphicon glyphicon-user"></span>Einwohnerabfrage für den
      Bereich
    </button>
  </div>
</template>

<style lang="less">
</style>