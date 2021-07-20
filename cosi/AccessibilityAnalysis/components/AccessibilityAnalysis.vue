<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import {mapGetters, mapMutations, mapActions} from "vuex";
import getters from "../store/gettersAccessibilityAnalysis";
import mutations from "../store/mutationsAccessibilityAnalysis";
import requestIsochrones from "./requestIsochrones";
import methods from "./methodsAnalysis";
import * as Proj from "ol/proj.js";
import deepEqual from "deep-equal";

export default {
    name: "AccessibilityAnalysis",
    components: {
        Tool
    },
    data () {
        return {
            mode: "point",
            facilityNames: [],
            mapLayer: null,
            coordinate: null,
            setBySearch: false,
            transportType: "",
            transportTypes: [
                {
                    type: "",
                    name: this.$t("additional:modules.tools.cosi.accessibilityAnalysis.transportTypes.clear")
                },
                {
                    type: "driving-car",
                    name: this.$t("additional:modules.tools.cosi.accessibilityAnalysis.transportTypes.driving-car")
                },
                {
                    type: "cycling-regular",
                    name: this.$t("additional:modules.tools.cosi.accessibilityAnalysis.transportTypes.cycling-regular")
                },
                {
                    type: "cycling-electric",
                    name: this.$t("additional:modules.tools.cosi.accessibilityAnalysis.transportTypes.cycling-electric")
                },
                {
                    type: "foot-walking",
                    name: this.$t("additional:modules.tools.cosi.accessibilityAnalysis.transportTypes.foot-walking")
                },
                {
                    type: "wheelchair",
                    name: this.$t("additional:modules.tools.cosi.accessibilityAnalysis.transportTypes.wheelchair")
                }
            ],
            scaleUnit: "",
            scaleUnits: [
                {
                    type: "",
                    name: this.$t("additional:modules.tools.cosi.accessibilityAnalysis.scaleUnits.clear")
                },
                {
                    type: "time",
                    name: this.$t("additional:modules.tools.cosi.accessibilityAnalysis.scaleUnits.time")
                },
                {
                    type: "distance",
                    name: this.$t("additional:modules.tools.cosi.accessibilityAnalysis.scaleUnits.distance")
                }
            ],
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
            ],
            askUpdate: false,
            abortController: null,
            currentCoordinates: null
        };
    },
    computed: {
        ...mapGetters("Tools/AccessibilityAnalysis", Object.keys(getters)),
        ...mapGetters("Map", ["map", "getOverlayById"]),
        ...mapGetters("MapMarker", ["markerPoint", "markerPolygon"]),
        ...mapGetters("Tools/DistrictSelector", ["extent", "boundingGeometry"]),
        ...mapGetters("Tools/FeaturesList", ["isFeatureDisabled"])
    },
    watch: {
        active () {
            if (this.active) {
                this.map.addEventListener("click", this.setCoordinateFromClick);
                Radio.on("Searchbar", "hit", this.setSearchResultToOrigin);
            }
            else {
                this.map.removeEventListener("click", this.setCoordinateFromClick);
                Radio.off("Searchbar", "hit", this.setSearchResultToOrigin);
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
    async mounted () {
        this.applyTranslationKey(this.name);

        this.mapLayer = await this.createLayer("reachability-from-point");
        this.mapLayer.setVisible(true);

        Radio.on("Searchbar", "hit", this.setSearchResultToOrigin);

        this.$root.$on("updateFeature", this.tryUpdateIsochrones);
        Radio.on("ModelList", "showFeaturesById", this.tryUpdateIsochrones);
        Radio.on("ModelList", "showAllFeatures", this.tryUpdateIsochrones);
    },
    methods: {
        ...mapActions("Alerting", ["addSingleAlert", "cleanup"]),
        ...mapMutations("Tools/AccessibilityAnalysis", Object.keys(mutations)),
        ...mapMutations("Map", ["setCenter"]),
        ...mapActions("MapMarker", ["placingPointMarker", "removePointMarker"]),
        ...mapActions("GraphicalSelect", ["featureToGeoJson"]),
        ...mapActions("Map", ["createLayer"]),
        ...mapActions("Alerting", ["addSingleAlert", "cleanup"]),
        ...methods,

        requestIsochrones: requestIsochrones,
        createAbortController: ()=>new AbortController(),
        tryUpdateIsochrones: function () {
            if (this.mode === "region" && this.currentCoordinates) {
                const newCoordinates = this.getCoordinates();

                if (!deepEqual(this.currentCoordinates.map(e=>[e[0], e[1]]), newCoordinates)) {
                    this.askUpdate = true;
                }
            }
        },

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
    <div id="toolWrap">
        <Tool
            :title="$t('additional:modules.tools.cosi.accessibilityAnalysis.title')"
            :icon="glyphicon"
            :active="active"
            :render-to-window="renderToWindow"
            :resizable-window="resizableWindow"
            :deactivate-gfi="deactivateGFI"
        >
            <template v-slot:toolBody>
                <v-app>
                    <div
                        v-if="active"
                        id="accessibilityanalysis"
                    >
                        <v-select
                            v-model="mode"
                            :items="availableModes"
                            :label="$t('additional:modules.tools.cosi.accessibilityAnalysis.dropdownInfo')"
                            item-text="text"
                            item-value="type"
                            outlined
                            dense
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
                                    <v-text-field
                                        id="coordinate"
                                        v-model="coordinate"
                                        :label="$t('additional:modules.tools.cosi.accessibilityAnalysis.pointOfReference')"
                                        type="text"
                                        min="0"
                                    >
                                </div>
                                <div
                                    v-if="mode === 'region'"
                                    class="form-group"
                                >
                                    <v-select
                                        v-model="selectedFacilityName"
                                        placeholder="Keine Auswahl"
                                        :items="facilityNames"
                                        :label="$t('additional:modules.tools.cosi.accessibilityAnalysis.topic')"
                                        outlined
                                        dense
                                    />
                                </div>
                                <div class="form-group">
                                    <v-select
                                        v-model="transportType"
                                        title="Verkehrsmittel"
                                        :items="transportTypes"
                                        :label="$t('additional:modules.tools.cosi.accessibilityAnalysis.transportType')"
                                        item-text="name"
                                        item-value="type"
                                    />
                                </div>
                                <div class="form-group">
                                    <v-select
                                        v-model="scaleUnit"
                                        title="Maßeinheit der Entfernung"
                                        :items="scaleUnits"
                                        :label="$t('additional:modules.tools.cosi.accessibilityAnalysis.scaleUnit')"
                                        item-text="name"
                                        item-value="type"
                                    />
                                </div>
                                <div class="form-group">
                                    <v-text-field
                                        id="range"
                                        v-model="distance"
                                        :label="$t('additional:modules.tools.cosi.accessibilityAnalysis.distance')"
                                        type="number"
                                        min="0"
                                    >
                                </div>
                                <div class="form-group">
                                    <div class="col-sm-offset-3 col-sm-5">
                                        <v-btn
                                            id="create-isochrones"
                                            dense
                                            small
                                            tile
                                            color="grey lighten-1"
                                            @click="createIsochrones()"
                                        >
                                            {{ $t("additional:modules.tools.cosi.accessibilityAnalysis.calculate") }}
                                        </v-btn>
                                    </div>
                                    <div class="col-sm-1">
                                        <v-icon
                                            id="help"
                                            :title="$t('additional:modules.tools.cosi.accessibilityAnalysis.help')"
                                            @click="showHelp()"
                                        >
                                            mdi-help-circle-outline
                                        </v-icon>
                                    </div>
                                    <div class="col-sm-1">
                                        <v-icon
                                            id="clear"
                                            :title="$t('additional:modules.tools.cosi.accessibilityAnalysis.clear')"
                                            @click="clear()"
                                        >
                                            mdi-trash-can-outline
                                        </v-icon>
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
                        </div>
                    </div>
                </v-app>
            </template>
        </Tool>
        <v-app>
            <v-snackbar
                v-model="askUpdate"
                color="white"
                :timeout="-1"
            >
                <span class="snackbar-text">
                    {{ $t("additional:modules.tools.cosi.accessibilityAnalysis.askUpdate") }}
                </span>
                <template #action="{ attrs }">
                    <v-btn
                        color="black"
                        text
                        v-bind="attrs"
                        @click="createIsochrones"
                    >
                        Ok
                    </v-btn>
                </template>
            </v-snackbar>
        </v-app>
    </div>
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
.snackbar-text{
    color: black
}
#help {
    border: none
}
</style>
