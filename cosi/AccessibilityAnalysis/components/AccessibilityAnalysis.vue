<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import Dropdown from "../../../../src/share-components/dropdowns/DropdownSimple.vue";
import {mapGetters, mapMutations, mapActions} from "vuex";
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
        VueSelect
    },
    data () {
        return {
            mode: "point",
            facilityNames: [],
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
                wheelchair: "Rollstuhl"
            },
            scaleUnit: "",
            scaleUnits: {
                "": "-Leeren-",
                time: "Zeit (in min)",
                distance: "Entfernung (in m)"
            },
            distance: "",
            rawGeoJson: null,
            showRequestButton: false,
            isochroneFeatures: [],
            steps: [0, 0, 0],
            layers: null,
            selectedFacilityName: null,
            legendColors: [
                "rgba(0, 200, 3, 0.6)",
                "rgba(100, 100, 3, 0.4)",
                "rgba(200, 0, 3, 0.4)"
            ]
        };
    },
    computed: {
        ...mapGetters("Tools/AccessibilityAnalysis", Object.keys(getters)),
        ...mapGetters("Map", ["map", "getOverlayById", "createLayerIfNotExists"]),
        ...mapGetters("MapMarker", ["markerPoint", "markerPolygon"]),
        ...mapGetters("Tools/DistrictSelector", ["extent", "boundingGeometry"])
    },
    /**
     * @returns {void}
     */
    created () {
        this.$on("close", this.close);
        Radio.on("ModelList", "updatedSelectedLayerList", this.setFacilityLayers.bind(this));
    },
    /**
   * Put initialize here if mounting occurs after config parsing
   * @returns {void}
   */
    mounted () {
        this.applyTranslationKey(this.name);

        this.mapLayer = Radio.request(
            "Map",
            "createLayerIfNotExists",
            "reachability-from-point"
        );
        this.mapLayer.setVisible(true);
        this.map.addEventListener("click", this.setCoordinateFromClick);

        Radio.on("Searchbar", "hit", this.setSearchResultToOrigin);
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
        close () {
            this.setActive(false);

            // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            // else the menu-entry for this tool is always highlighted
            const model = Radio.request("ModelList", "getModelByAttributes", {
                id: this.$store.state.Tools.AccessibilityAnalysis.id
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
                ),
                facilityNames = facilityLayerModels.map((model) => model.get("name").trim()
                );

            this.facilityNames = facilityNames;
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t('additional:modules.tools.cosi.accessibilityAnalysis.title')"
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
                <p class="dropdown-info">
                    {{ $t("additional:modules.tools.cosi.accessibilityAnalysis.dropdownInfo") }}
                </p>
                <Dropdown
                    v-model="mode"
                    :options="availableModes"
                />
                <div
                    v-if="mode !== null"
                    class="isochrones"
                >
                    <form class="form-horizontal">
                        <div
                            v-if="mode === 'point'"
                            class="form-group"
                        >
                            <label class="col-sm-3">Referenzpunkt</label>
                            <div class="col-sm-9">
                                <input
                                    id="coordinate"
                                    v-model="coordinate"
                                    class="form-control input-sm"
                                    title="Referenzpunkt"
                                    type="text"
                                    min="0"
                                />
                            </div>
                        </div>
                        <div
                            v-if="mode === 'region'"
                            class="form-group"
                        >
                            <label class="col-sm-3">Thema</label>
                            <div class="col-sm-9">
                                <VueSelect
                                    v-model="selectedFacilityName"
                                    class="style-chooser"
                                    placeholder="Keine Auswahl"
                                    :options="facilityNames"
                                    :clearable="false"
                                />
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-3">Verkehrsmittel</label>
                            <div class="col-sm-9">
                                <Dropdown
                                    v-model="transportType"
                                    title="Verkehrsmittel"
                                    :options="transportTypes"
                                />
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-3">Maßeinheit der Entfernung</label>
                            <div class="col-sm-9">
                                <Dropdown
                                    v-model="scaleUnit"
                                    title="Maßeinheit der Entfernung"
                                    :options="scaleUnits"
                                />
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-3">Entfernung</label>
                            <div class="col-sm-9">
                                <input
                                    id="range"
                                    v-model="distance"
                                    class="form-control input-sm"
                                    title="Entfernung"
                                    type="number"
                                    min="0"
                                />
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="col-sm-offset-3 col-sm-5">
                                <button
                                    id="create-isochrones"
                                    type="button"
                                    class="btn btn-lgv-grey"
                                    @click="createIsochrones()"
                                >
                                    Berechnen
                                </button>
                            </div>
                            <div class="col-sm-1">
                                <div
                                    id="help"
                                    @click="showHelp()"
                                >
                                    <span class="glyphicon glyphicon-question-sign"></span>
                                </div>
                            </div>
                            <div
                                class="col-sm-1"
                                @click="clear()"
                            >
                                <div
                                    id="clear"
                                    title="Lösche aktuelles Ergebnis"
                                >
                                    <span class="glyphicon glyphicon-trash"></span>
                                </div>
                            </div>
                        </div>
                    </form>
                    <hr />
                    <h5><strong>Legende: </strong></h5>
                    <div id="legend">
                        <template v-for="(j, i) in steps">
                            <svg
                                :key="i"
                                width="15"
                                height="15"
                            >
                                <circle
                                    cx="7.5"
                                    cy="7.5"
                                    r="7.5"
                                    :style="`fill: ${
                                        legendColors[i]
                                    }; stroke-width: 0.5; stroke: #e3e3e3;`"
                                />
                            </svg>
                            <span :key="i * 2 + steps.length">
                                {{ j }}
                            </span>
                        </template>
                    </div>
                    <div v-if="mode === 'point'">
                        <button
                            id="show-result"
                            type="button"
                            class="btn btn-lgv-grey measure-delete update-result-button"
                            @click="updateResult"
                        >
                            <span class="glyphicon glyphicon-th-list"></span>Einrichtungsabdeckung
                        </button>
                        <div
                            v-if="layers"
                            id="result"
                            ref="result"
                        >
                            <ReachabilityResult :layers="layers" />
                            <table>
                                <tr>
                                    <td>
                                        <button
                                            class="btn btn-lgv-grey measure-delete isochrone-origin"
                                            @click="resetMarkerAndZoom"
                                        >
                                            zoom
                                        </button>
                                    </td>
                                    <td id="dashboard-container">
                                        <button
                                            id="show-in-dashboard"
                                            type="button"
                                            class="btn btn-lgv-grey measure-delete"
                                            @click="showInDashboard"
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
