<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import Dropdown from "../../../../src/share-components/dropdowns/DropdownSimple.vue";
import { mapGetters, mapMutations, mapActions } from "vuex";
import ReachabilityResult from "./ReachabilityResult.vue";
import VueSelect from "vue-select";
import getters from "../store/gettersAccessibilityAnalysis";
import mutations from "../store/mutationsAccessibilityAnalysis";
import methods from "./methodsPointAnalysis";

export default {
  name: "AccessibilityAnalysis",
  components: {
    Tool,
    Dropdown,
    ReachabilityResult,
    VueSelect,
  },
  data() {
    return {
      mode: "point",
      facilityNames: [],
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
    };
  },
  computed: {
    ...mapGetters("Tools/AccessibilityAnalysis", Object.keys(getters)),
    ...mapGetters("Map", ["map", "getOverlayById", "createLayerIfNotExists"]),
    ...mapGetters("MapMarker", ["markerPoint", "markerPolygon"]),
    ...mapGetters("Tools/DistrictSelector", ["extent", "boundingGeometry"]),
  },
  created() {
    this.$on("close", this.close);
    const that = this;
    Backbone.Events.listenTo(Radio.channel("ModelList"), {
      updatedSelectedLayerList: function (models) {
        that.setFacilityLayers(models);
      },
    });
  },
  /**
   * Put initialize here if mounting occurs after config parsing
   * @returns {void}
   */
  mounted() {
    this.applyTranslationKey(this.name);

    this.mapLayer = Radio.request(
      "Map",
      "createLayerIfNotExists",
      "reachability-from-point"
    );
    this.mapLayer.setVisible(true);
    this.map.addEventListener("click", this.setCoordinateFromClick);

    Backbone.Events.listenTo(Radio.channel("Searchbar"), {
      hit: this.setSearchResultToOrigin,
    });
  },
  methods: {
    ...mapMutations("Tools/AccessibilityAnalysis", Object.keys(mutations)),
    ...mapActions("MapMarker", ["placingPointMarker", "removePointMarker"]),
    ...mapActions("GraphicalSelect", ["featureToGeoJson"]),
    ...methods,

    /**
     * Closes this tool window by setting active to false
     * @returns {void}
     */
    close() {
      this.setActive(false);

      // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
      // else the menu-entry for this tool is always highlighted
      const model = Radio.request("ModelList", "getModelByAttributes", {
        id: this.$store.state.Tools.AccessibilityAnalysis.id,
      });
      if (model) {
        model.set("isActive", false);
      }
    },
    /**
     * set facilityNames in model, trigger renderDropDownView
     * @param {Object} models layer models of updated selected layer
     * @returns {void}
     */
    setFacilityLayers: function (models) {
      const facilityLayerModels = models.filter(
        (model) => model.get("isFacility") === true
      );
      const facilityNames = facilityLayerModels.map((model) =>
        model.get("name").trim()
      );
      this.facilityNames = facilityNames;
    },
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

<template lang="html">
    <Tool
        :title="$t(name)"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
            <div
                v-if="active"
                id="accessibilityanalysis"
            >
                <p class="dropdown-info">Bitte wählen Sie den Modus, in dem Sie arbeiten möchten: </p>
                <Dropdown
                    v-model="mode"
                    :options="availableModes"
                />
                <!-- <p><strong>1) Erreichbarkeit ab einem Referenzpunkt</strong>: Zeigt ein Gebiet an, welches von einem vom Nutzer
                    gewählten Punkt auf der Karte innerhalb einer vom Nutzer festgelegten Entfernung erreichbar ist. Die Entfernung
                    kann in Zeit oder in Metern angegeben werden. Die Erreichbarkeit wird berechnet abhängig von dem vom Nutzer
                    festgelegten Verkehrsmittel.
                    <br />
                    <strong>2) Erreichbarkeit im Gebiet</strong>: Zeigt die Abdeckung und Erreichbarkeit von einer zuvor
                    festgelegten Einrichtungsart (z.B. Kindergärten) in dem von dem Nutzer festgelegten Einzugsbereich. Der
                    Einzugsbereich ist die Entfernung von der jeweiligen Einrichtung und kann angegeben werden in Zeit oder in
                    Metern. Die Erreichbarkeit wird berechnet abhängig von dem vom Nutzer festgelegten Verkehrsmittel.
                </p> -->
          <div v-if="mode!=null" class="isochrones">
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
            <div v-if="mode=='point'">
              <button
                type="button"
                class="btn btn-lgv-grey measure-delete update-result-button"
                id="show-result"
                @click="updateResult"
              >
                <span class="glyphicon glyphicon-th-list"></span>Einrichtungsabdeckung
              </button>
              <div v-if="layers" ref="result" id="result">
                <ReachabilityResult  :layers="layers" />
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
                    <td id="dashboard-container">
                      <button
                        @click="showInDashboard"
                        type="button"
                        class="btn btn-lgv-grey measure-delete"
                        id="show-in-dashboard"
                      >
                        Im Dashboard anzeigen
                      </button>
                    </td>
                  </tr>
                </table>
              </div>

              <button
                v-if="showRequestButton"
                class="btn btn-lgv-grey measure-delete"
                @click="requestInhabitants"
              >
                <span class="glyphicon glyphicon-user"></span>Einwohnerabfrage für den
                Bereich
              </button>
            </div>
          </div>
            </div>
        </template>
    </Tool>
</template>

<style lang="less">
#accessibilityanalysis {
  width: 400px;
  min-height: 100px;
}
.isochrones {
  margin-top: 10px;
}
.dropdown-info {
  margin-bottom: 5px;
}
.update-result-button {
  margin-top: 10px;
}
</style>