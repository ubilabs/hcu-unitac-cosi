<script>
import { mapGetters, mapActions } from "vuex";
import Dropdown from "../../../../src/share-components/dropdowns/DropdownSimple.vue";
import ReachabilityResult from "./ReachabilityResult.vue";
import VueSelect from "vue-select";
import methods from "./methodsPointAnalysis";

export default {
  name: "PointAnalysis",
  components: {
    Dropdown,
    ReachabilityResult,
    VueSelect,
  },
  props: {
    facilityNames: { type: Array, default: [] },
    mode: { type: String, default: "point" },
  },
  data() {
    return {
      mapLayer: null,
      coordinate: null,
      setBySearch: false,
      transportType: "",
      scaleUnit: "",
      distance: "",
      rawGeoJson: null,
      showRequestButton: false,
      isochroneFeatures: [],
      steps: [0, 0, 0],
      layers: null,
      selectedFacilityName: null,
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
  },
  computed: {
    ...mapGetters("Map", ["map", "getOverlayById", "createLayerIfNotExists"]),
    ...mapGetters("MapMarker", ["markerPoint", "markerPolygon"]),
    ...mapGetters("Tools/DistrictSelector", ["extent", "boundingGeometry"]),
  },
  methods: {
    ...mapActions("MapMarker", ["placingPointMarker", "removePointMarker"]),
    ...mapActions("GraphicalSelect", ["featureToGeoJson"]),
    ...methods,

    //TODO: int
    getTransportTypes: function () {
      return {
        "": "-Leeren-",
        "driving-car": "Auto",
        "cycling-regular": "Rad",
        "cycling-electric": "Rad (elektrisch)",
        "foot-walking": "Gehen",
        wheelchair: "Rollstuhl",
      };
    },
    getLegendColors: function () {
      return [
        "rgba(0, 200, 3, 0.6)",
        "rgba(100, 100, 3, 0.4)",
        "rgba(200, 0, 3, 0.4)",
      ];
    },
    //TODO: int
    getScaleUnits: function () {
      return {
        "": "-Leeren-",
        time: "Zeit (in min)",
        distance: "Entfernung (in m)",
      };
    },
  },
};
</script>
<template>
  <div class="isochrones">
    <form class="form-horizontal">
      <div v-if="mode == 'point'" class="form-group">
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
      <div v-if="mode == 'region'" class="form-group">
        <label class="col-sm-3">Thema</label>
        <div class="col-sm-9">
          <VueSelect
            class="style-chooser"
            placeholder="Keine Auswahl"
            v-model="selectedFacilityName"
            :options="facilityNames"
            :clearable="false"
          />
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3">Verkehrsmittel</label>
        <div class="col-sm-9">
          <Dropdown
            title="Verkehrsmittel"
            v-model="transportType"
            :options="getTransportTypes()"
          />
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3">Maßeinheit der Entfernung</label>
        <div class="col-sm-9">
          <Dropdown
            title="Maßeinheit der Entfernung"
            v-model="scaleUnit"
            :options="getScaleUnits()"
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
            @click="createIsochrones2()"
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
            :style="`fill: ${
              getLegendColors()[i]
            }; stroke-width: 0.5; stroke: #e3e3e3;`"
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