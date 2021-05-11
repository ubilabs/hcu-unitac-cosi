<script>
import { mapGetters, mapActions } from "vuex";
import Dropdown from "../../../../src/share-components/dropdowns/DropdownSimple.vue";
import * as Proj from "ol/proj.js";
import * as Extent from "ol/extent";
import GeoJSON from "ol/format/GeoJSON";
import GeometryCollection from "ol/geom/GeometryCollection";
import setBBoxToGeom from "../../utils/setBBoxToGeom";
import {Fill, Stroke, Style} from "ol/style.js";

export default {
  name: "PointAnalysis",
  components: {
    Dropdown,
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
      steps: 3,
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
  },
  methods: {
    ...mapActions("MapMarker", ["placingPointMarker", "removePointMarker"]),
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

      console.log(this, range);

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

          this.rawGeoJson = Radio.request(
            "GraphicalSelect",
            "featureToGeoJson",
            newFeatures[0]
          );

          this.styleFeatures(newFeatures, [coordinate]);

          this.mapLayer.getSource().clear(); // Persistence of more than one isochrones?
          this.mapLayer.getSource().addFeatures(newFeatures.reverse());
          this.isochroneFeatures = newFeatures;
          this.setIsochroneAsBbox();
          // this.clearResult();
          // this.$el.find("#show-in-dashboard").hide();
          //   this.$el.find("#hh-request").show();
          //   this.showRequestButton = true;
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
    clearResult: function () {
      this.$el.find("#result").empty();
    },
    // hideDashboardButton: function () {
    //   this.$el.find("#show-in-dashboard").hide();
    //   //   this.$el.find("#hh-request").hide();
    //   this.showRequestButton = false;
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
     * @returns {void}
     */
    styleFeatures: function (features) {
      for (let i = features.length - 1; i >= 0; i--) {
        features[i].setStyle(
          new Style({
            fill: new Fill({
              color: `rgba(200 , 3, 3, ${0.05 * i + 0.1})`,
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
          this.steps - 1
        ].getGeometry(),
        geometryCollection = new GeometryCollection([polygonGeometry]);

      setBBoxToGeom(geometryCollection);
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
          <div id="help">
            <span class="glyphicon glyphicon-question-sign"></span>
          </div>
        </div>
        <div class="col-sm-1">
          <div id="backward" title="Zurück zur Erreichbarkeitsanalyse">
            <span class="glyphicon glyphicon-arrow-left"></span>
          </div>
        </div>
        <div class="col-sm-1">
          <div id="clear" title="Lösche aktuelles Ergebnis">
            <span class="glyphicon glyphicon-trash"></span>
          </div>
        </div>
      </div>
    </form>
    <hr />
    <h5><strong>Legende: </strong></h5>
    <div id="legend"></div>
    <br />
    <button
      type="button"
      class="btn btn-lgv-grey measure-delete"
      id="show-result"
    >
      <span class="glyphicon glyphicon-th-list"></span>Einrichtungsabdeckung
    </button>
    <div id="result"></div>

    <button
      v-if="showRequestButton"
      class="btn btn-lgv-grey measure-delete"
      id="hh-request"
    >
      <span class="glyphicon glyphicon-user"></span>Einwohnerabfrage für den
      Bereich
    </button>
  </div>
</template>

<style lang="less">
</style>