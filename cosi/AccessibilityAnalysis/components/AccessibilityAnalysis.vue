<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import Dropdown from "../../../../src/share-components/dropdowns/DropdownSimple.vue";
import {mapGetters, mapMutations, mapActions} from "vuex";
import VueSelect from "vue-select";
import getters from "../store/gettersAccessibilityAnalysis";
import mutations from "../store/mutationsAccessibilityAnalysis";
import methods from "./methodsPointAnalysis";
import createLayer from "../../utils/createLayer";
import * as Proj from "ol/proj.js";

export default {
    name: "AccessibilityAnalysis",
    components: {
        Tool,
        Dropdown,
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
                "": this.$t("additional:modules.tools.cosi.accessibilityAnalysis.transportTypes.clear"),
                "driving-car": this.$t("additional:modules.tools.cosi.accessibilityAnalysis.transportTypes.driving-car"),
                "cycling-regular": this.$t("additional:modules.tools.cosi.accessibilityAnalysis.transportTypes.cycling-regular"),
                "cycling-electric": this.$t("additional:modules.tools.cosi.accessibilityAnalysis.transportTypes.cycling-electric"),
                "foot-walking": this.$t("additional:modules.tools.cosi.accessibilityAnalysis.transportTypes.foot-walking"),
                wheelchair: this.$t("additional:modules.tools.cosi.accessibilityAnalysis.transportTypes.wheelchair")
            },
            scaleUnit: "",
            scaleUnits: {
                "": this.$t("additional:modules.tools.cosi.accessibilityAnalysis.scaleUnits.clear"),
                time: this.$t("additional:modules.tools.cosi.accessibilityAnalysis.scaleUnits.time"),
                distance: this.$t("additional:modules.tools.cosi.accessibilityAnalysis.scaleUnits.distance")
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
        ...mapGetters("Map", ["map", "getOverlayById"]),
        ...mapGetters("MapMarker", ["markerPoint", "markerPolygon"]),
        ...mapGetters("Tools/DistrictSelector", ["extent", "boundingGeometry"])
    },
    watch: {
        active () {
            if (this.active) {
                this.map.addEventListener("click", this.setCoordinateFromClick);
            }
            else {
                this.map.removeEventListener("click", this.setCoordinateFromClick);
            }
        }
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

        this.mapLayer = createLayer("reachability-from-point");
        this.mapLayer.setVisible(true);

        Radio.on("Searchbar", "hit", this.setSearchResultToOrigin);
    },
    methods: {
        ...mapMutations("Tools/AccessibilityAnalysis", Object.keys(mutations)),
        ...mapMutations("Map", ["setCenter"]),
        ...mapActions("MapMarker", ["placingPointMarker", "removePointMarker"]),
        ...mapActions("GraphicalSelect", ["featureToGeoJson"]),
        ...methods,

        resetMarkerAndZoom: function () {
            const icoord = Proj.transform(this.coordinate, "EPSG:4326", "EPSG:25832");

            this.placingPointMarker(icoord);
            this.setCenter(icoord);
        },

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
        },
        /**
        * closes this component and opens requestInhabitants component and executes makeRequest with the calculated geoJSON of this component
        * @returns {void}
        */
        requestInhabitants: function () {
            this.close();
            this.$root.$emit("populationRequest", this.rawGeoJson);
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
                            <label class="col-sm-3">{{ $t("additional:modules.tools.cosi.accessibilityAnalysis.pointOfReference") }}</label>
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
                            <label class="col-sm-3">{{ $t("additional:modules.tools.cosi.accessibilityAnalysis.topic") }}</label>
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
                            <label class="col-sm-3">{{ $t("additional:modules.tools.cosi.accessibilityAnalysis.transportType") }}</label>
                            <div class="col-sm-9">
                                <Dropdown
                                    v-model="transportType"
                                    title="Verkehrsmittel"
                                    :options="transportTypes"
                                />
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-3">{{ $t("additional:modules.tools.cosi.accessibilityAnalysis.scaleUnit") }}</label>
                            <div class="col-sm-9">
                                <Dropdown
                                    v-model="scaleUnit"
                                    title="Maßeinheit der Entfernung"
                                    :options="scaleUnits"
                                />
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-3">{{ $t("additional:modules.tools.cosi.accessibilityAnalysis.distance") }}</label>
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
                                    {{ $t("additional:modules.tools.cosi.accessibilityAnalysis.calculate") }}
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
                                    :title="$t('additional:modules.tools.cosi.accessibilityAnalysis.clear')"
                                >
                                    <span class="glyphicon glyphicon-trash"></span>
                                </div>
                            </div>
                        </div>
                    </form>
                    <hr />
                    <h5><strong>{{ $t("additional:modules.tools.cosi.accessibilityAnalysis.legend") }}</strong></h5>
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
                            v-if="showRequestButton"
                            class="btn btn-lgv-grey measure-delete"
                            @click="requestInhabitants"
                        >
                            <span class="glyphicon glyphicon-user"></span>{{ $t("additional:modules.tools.cosi.accessibilityAnalysis.requestInhibitants") }}
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
</style>
