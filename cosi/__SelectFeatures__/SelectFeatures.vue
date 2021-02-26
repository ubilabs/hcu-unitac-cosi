<script>
/* Component description:
    This component enables the user to make the preliminary choices regarding the region (district, borough, ..)
    in which the parcels are looked for.
*/
import {DragBox} from "ol/interaction";
import {platformModifierKeyOnly} from "ol/events/condition";
import {mapState, mapGetters, mapMutations, mapActions} from "vuex";
import Styles from "../../olStyles";
/**
 * This component enables the user to make the preliminary choices regarding the region (district, borough, ..)
    in which the parcels are looked for.
   * @vue-data {Number} [search=null] -
   * @vue-data {Array} selectedFeatureNames - array of selected features (bezirke, stadtteile, gemarkung or stat. gebiete)
   * @vue-data {*} [activeLayerStyleFunction=null] - style of the active layer
   * @vue-data {Array} [selectedGeometries=null] - array of selected geometries (coordinates of the bbox)
   * @vue-data {Object} boxInteraction - allows the user to draw a vector box by clicking and dragging on the map
   * @vue-data {Object} infoGebiet - infotext
   * @vue-computed {Boolean} filter - filter the treeview by using the search prop
   * @vue-computed {Array} layerNames - array of available layers (districts)
   * @vue-computed {Object} active - true if SelectFeatures is active
   * @vue-computed {String} activeLayerName - name of the active layer (bezirk, stadtteil, gemarkung or stat. gebiet)
   * @vue-computed {Array} activeLayerFeatureNames - array of the values for the chosen layer (name of all city districts)
   */
export default {
    name: "SelectFeatures",
    components: {
    },
    data () {
        return {
            search: null,
            selectedFeatureNames: [],
            activeLayerStyleFunction: null,
            selectedGeometries: null,
            boxInteraction: new DragBox({
                condition: platformModifierKeyOnly,
                onBoxEnd: this.boxSelect
            }),
            infoGebiet: {
                state: false,
                text: "Referenzgebiet auf der Karte wählen. Für Box-Auswahl Strg gedrückt halten und ziehen."
            }
        };
    },
    computed: {
        ...mapState("Tools/LigFinder/SelectFeatures", [
            "renderToWindow",
            "resizableWindow",
            "active",
            "glyphicon",
            "title",
            "featureLayers",
            "activeLayerId",
            "id",
            "selectedFeatures",
            "strokeWidth",
            "toggleNoneActiveLayers",
            "bboxGeometry"
        ]),
        ...mapGetters("Tools/LigFinder/SelectFeatures", [
            "getActiveSelector",
            "title"
        ]),
        filter () {
            return this.caseSensitive
                ? (item, search, textKey) => item[textKey].indexOf(search) > -1
                : undefined;
        },
        layerNames () {
            return this.featureLayers.map(layer => layer.name);
        },
        activeLayerName: {
            get () {
                return this.$store.getters["Tools/LigFinder/SelectFeatures/getActiveLayerName"];
            },
            set (val) {
                this.$store.commit("Tools/LigFinder/SelectFeatures/setActiveLayerId",
                    this.$store.getters["Tools/LigFinder/SelectFeatures/getLayer"](val)?.id
                );
            }
        },
        activeLayerFeatureNames () {
            return this.getOlFeatures(this.activeLayerId)
                .map(feature => feature.get(this.getActiveSelector))
                .sort();
        }
    },
    watch: {
        /**
         * @description "active"-state event listener, starts the click listener
         * @param {boolean} newVal the tool's "active" state
         * @returns {void}
         */
        active (newVal) {
            if (newVal) {
                this.listen();
            }
            else {
                this.unlisten();
            }
        },

        /**
         * @description resets selection, retrieves the active Layers styling function
         * @param {string} id the layer's id
         * @returns {void}
         */
        activeLayerId (id) {
            // if toggleNoneActiveLayers is specified
            // set Layer Visibility for the active scope Layer. All others will be turned off.
            if (this.toggleNoneActiveLayers) {
                this.featureLayers.forEach(l => this.getOlLayer(l.id).setVisible(l.id === id));
            }

            this.resetSelectedFeatures();
            this.activeLayerStyleFunction = this.getOlLayer(id).getStyleFunction();
            this.getOlFeatures(id).forEach(feature => {
                feature.setStyle(this.activeLayerStyleFunction(feature));
            });
        },

        /**
         * @description retrieves the respective features from the active layer by name and commits the resulting array to the store
         * @param {string[]} selection the array of feature names
         * @returns {void}
         */
        selectedFeatureNames (selection) {
            this.$store.commit("Tools/LigFinder/SelectFeatures/setSelectedFeatures",
                this.getOlFeatures(this.activeLayerId)
                    .filter(feature => selection.includes(feature.get(this.getActiveSelector)))
            );
        },

        /**
         * @description styles the selected features with the layers styling function by increasing their stroke width
         * @param {ol/Feature[]} newSelection the current array of features
         * @param {ol/Feature[]} oldSelection the old array of features
         * @returns {void}
         */
        selectedFeatures (newSelection, oldSelection) {
            oldSelection.forEach(feature => {
                feature.setStyle(this.activeLayerStyleFunction(feature));
            });

            newSelection.forEach(feature => {
                feature.setStyle(Styles.select(feature.getStyle()));
            });
            this.generateBboxGeometry();
        },

        /**
         * commits the new Selection to the search-filters module of the store,
         * triggers updating available criteria from Backend
         * @param {*} geom - the bbox-polygon as point-array
         * @returns {void}
         */
        bboxGeometry (geom) {
            this.$store.commit("Tools/LigFinder/Filters/setGeometry", geom);
            this.$store.commit("Tools/LigFinder/Filters/setDistricts", {
                districtType: this.activeLayerName,
                districtNames: this.selectedFeatureNames
            });
            this.updateCriteria();
        }
    },
    created () {
        this.$on("close", this.close);
    },
    mounted () {
        this.setInitialValues();
        if (this.active) {
            this.listen();
        }
    },
    methods: {
        ...mapMutations("Tools/LigFinder/SelectFeatures", [
            "setBboxGeometry"

        ]),
        ...mapActions("Tools/LigFinder", [
            "searchParcels",
            "updateCriteria",
            "setupDrawingLayers",
            "resetAll"
        ]),
        /**
         * @description Adds the click and box listeners to the map
         * @returns {void}
         */
        listen () {
            const map = this.$store.getters["Map/map"];

            map.addEventListener("click", this.clickSelect);
            map.addInteraction(this.boxInteraction);

            // hack for GFI
            Radio.request("ModelList", "getModelByAttributes", {id: "gfi"}).setIsActive(false);

        },

        /**
         * @description Removes the click and box listeners to the map
         * @returns {void}
         */
        unlisten () {
            const map = this.$store.getters["Map/map"];

            map.removeEventListener("click", this.clickSelect);
            map.removeInteraction(this.boxInteraction);

            // hack for GFI
            // Radio.request("ModelList", "getModelByAttributes", {id: "gfi"}).setIsActive(true);
        },

        /**
         * @description The click event listener, adding/removing clicked features from the active layer to/from the selection
         * @param {Event} evt The click event
         * @returns {void}
         */
        clickSelect (evt) {
            evt.map.forEachFeatureAtPixel(evt.pixel, feature => {
                const featureName = feature.get(this.getActiveSelector);

                if (!this.selectedFeatureNames.includes(featureName)) {
                    this.selectedFeatureNames.push(featureName);
                }
                else {
                    this.selectedFeatureNames = this.selectedFeatureNames.filter(name => name !== featureName);
                }
            }, {
                layerFilter: layer => layer.get("id") === this.activeLayerId
            });

            return true;
        },

        /**
         * @description The boxSelect event listener, adding/removing clicked features from the active layer to/from the selection
         * @returns {void}
         */
        boxSelect () {
            const extent = this.boxInteraction.getGeometry().getExtent();

            this.getOlLayer(this.activeLayerId).getSource().forEachFeatureIntersectingExtent(extent, feature => {
                const featureName = feature.get(this.getActiveSelector);

                if (!this.selectedFeatureNames.includes(featureName)) {
                    this.selectedFeatureNames.push(featureName);
                }
            });
        },

        /**
         * @description retrieve the active OpenLayers layer
         * @param {string} id layer ID
         * @returns {ol/Layer} the layer
         */
        getOlLayer (id) {
            return this.$store.getters?.["Map/layerById"](id)?.olLayer;
        },

        /**
         * @description retrieve the OpenLayers Features from the active layer
         * @param {string} id layer ID
         * @returns {ol/Feature[]} the features array
         */
        getOlFeatures (id) {
            return this.getOlLayer(id)?.getSource().getFeatures() || [];
        },

        /**
         * @description reseting the selection, emptying the array
         * @param {Boolean} all true if all should be reseted, false else
         * @returns {void}
         */

        resetSelectedFeatures (all) {
            this.selectedFeatureNames = [];
            if (all) {
                this.resetAll();
                this.setInitialValues();
                this.setupDrawingLayers();
                this.activeLayerStyleFunction = this.getOlLayer(this.activeLayerId).getStyleFunction();
            }
        },

        /**
         * @description Setting initial values from the tools config
         * @returns {void}
         */
        setInitialValues () {
            this.activeLayerName = this.layerNames[0];
        },
        /**
         * @description generate a bounding box
         * @returns {void}
         */
        generateBboxGeometry () {
            this.selectedGeometries = this.selectedFeatures.map(f => f.getGeometry().getCoordinates()[0]);
            this.setBboxGeometry(this.selectedGeometries);
        }
    }
};
</script>

<template lang="html">
    <v-main>
        <v-sheet>
            <v-container fluid>
                <h5>
                    {{ title }}

                    <v-btn
                        class="ma-2"
                        icon
                        small
                        @click="infoGebiet.state = true"
                    >
                        <v-icon>
                            info
                        </v-icon>
                    </v-btn>
                </h5>
                <v-snackbar
                    v-model="infoGebiet.state"
                    :timeout="100000"
                    color="info"
                    :top="true"
                    class="snackInfo"
                >
                    {{ infoGebiet.text }}
                    <v-btn
                        text
                        @click="infoGebiet.state = false"
                    >
                        Schließen
                    </v-btn>
                </v-snackbar>
                <v-row align="start">
                    <v-col
                        class="d-flex"
                        sm="5"
                    >
                        <v-select
                            v-model="activeLayerName"
                            :items="layerNames"
                            label="Bezugsrahmen wählen"
                        />
                    </v-col>
                    <v-col
                        class="d-flex"
                        sm="5"
                    >
                        <v-select
                            v-model="selectedFeatureNames"
                            :items="activeLayerFeatureNames"
                            :search="search"
                            label="Gebiete auswählen"
                            multiple
                        >
                            <template v-slot:selection="{ item, index }">
                                <v-chip v-if="index === 0">
                                    <span>{{ item }}</span>
                                </v-chip>
                                <span
                                    v-if="index === 1"
                                    class="grey--text caption"
                                >(+{{ selectedFeatures.length - 1 }} weitere)</span>
                            </template>
                        </v-select>
                    </v-col>
                </v-row>
                <v-row align="start">
                    <slot name="utils" />
                </v-row>
                <v-row align="start">
                    <v-col
                        class="d-flex"
                        sm="3"
                    >
                        <v-btn
                            :color="active ? 'red' : 'primary'"
                            :outlined="active"
                            block
                            right
                            @click="active=!active"
                        >
                            {{ active ? 'Auswahl beenden' : 'Auswahl Tätigen' }}
                        </v-btn>
                    </v-col>
                    <v-col
                        class="d-flex"
                        sm="5"
                    >
                        <v-btn
                            color="secondary"
                            outlined
                            :disabled="!active"
                            block
                            right
                            @click="resetSelectedFeatures(true)"
                        >
                            Auswahl aufheben
                        </v-btn>
                    </v-col>
                    <!-- <v-col
                        class="d-flex"
                        sm="5"
                    >
                        <v-btn
                            color="primary"
                            :disabled="selectedFeatures.length === 0"
                            block
                            @click="submit"
                        >
                            Auswahl bestätigen
                        </v-btn>
                    </v-col> -->
                </v-row>
                <v-divider />
            </v-container>
        </v-sheet>
    </v-main>
</template>


<style lang="less" scoped>
    .snackInfo {
         font-size: 14px;
    }
</style>
