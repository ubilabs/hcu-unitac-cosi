<script>
import {mapGetters, mapActions} from "vuex";
import beautifyKey from "../../../../src/utils/beautifyKey";
import {getOlGeomTypeByGmlType} from "../utils/getOlGeomByGmlType";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
import Point from "ol/geom/Point";
import {Draw, Select} from "ol/interaction";
import {getSearchResultsCoordinates, getSearchResultsGeometry} from "../../utils/getSearchResultsGeom";

export default {
    name: "GeometryPicker",
    props: {
        geomField: {
            type: Object,
            required: true
        },
        isGml: {
            type: Boolean,
            required: false,
            default: true
        },
        useIcons: {
            type: Boolean,
            required: false,
            default: true
        }
    },
    data () {
        return {
            geometry: {
                type: "",
                value: null
            },
            beautifyKey: beautifyKey,
            locationPickerActive: false,
            pickPolygonActive: false,
            drawPolygonInteraction: null,
            drawLayer: null,
            polygonSelect: null
        };
    },
    computed: {
        ...mapGetters("Map", ["map", "layerById"]),
        ...mapGetters("Tools/FeaturesList", ["activeVectorLayerList"]),

        /**
         * Getter and Setter for the manuel coordinates Input for the geometry
         */
        geomCoords: {
            /**
             * Getter for the current value of the geometry as coordinates array
             * @returns {number[]} the current geometry object as coordinates array
             */
            get () {
                return this.geometry.value ? JSON.stringify(this.geometry.value.getCoordinates()) : undefined;
            },
            /**
             * Setter for the current value of the geometry as coordinates array, or single coordinate
             * @param {String} v - the value of the input field
             * @returns {void}
             */
            set (v) {
                this.setGeomByInput(v);
            }
        },

        /**
         * Getter for the current value of the geometry
         * @returns {module:ol/Geometry} the current geometry object
         */
        geom () {
            return this.geometry.value;
        }
    },

    watch: {
        /**
         * Watcher for the picked/constructed geometry
         * Emits the geometry as an event
         * @param {module:ol/Geometry} newGeom - the new geometry object
         * @returns {void}
         */
        geom (newGeom) {
            this.$emit("updateGeometry", newGeom);
        }
    },
    /**
     * Lifecycle function, triggers on component initialize. Creates necessary drawing layer.
     * @returns {void}
     */
    async created () {
        await this.createDrawingLayer();
    },
    beforeDestroy () {
        this.unlisten();
        this.clearDrawPolygon();
    },
    methods: {
        ...mapActions("MapMarker", ["placingPointMarker", "removePointMarker"]),
        ...mapActions("Map", ["createLayer"]),

        /**
         * todo
         * @returns {void}
         */
        async createDrawingLayer () {
            const newLayer = await this.createLayer(this.id + "_draw");

            newLayer.setVisible(true);
            this.drawLayer = newLayer;

            return newLayer;
        },

        /**
         * todo
         * @param {String} type - the geom type as GML (e.g. gmlPointGeometryType)
         * @returns {void}
         */
        toggleLocationPicker (type) {
            // toggle the button active
            this.locationPickerActive = !this.locationPickerActive;
            // translate the GML geometry type into an OL readable format or uses literal
            this.geometry.type = this.isGml ? getOlGeomTypeByGmlType(type) : type;

            if (this.locationPickerActive) {
                this.listen();
            }
            else {
                this.pickPolygonActive = false;
                this.unlisten();
            }
        },

        /**
         * Toggles the event listener for drawing / location picking on
         * Action depends on the set geometry tyoe
         * @returns {void}
         */
        listen () {
            if (this.geometry.type === "Point") {
                this.map.addEventListener("click", this.pickLocation);

                // Get coords from searchbar if geom type is "Point"
                Radio.on("Searchbar", "hit", this.pickLocationBySearchbar.bind(this));
            }
            else if (this.geometry.type === "Polygon") {
                // this.map.addEventListener("click", this.pickPolygon.bind(this));
                this.drawPolygon();

                // Get coords from searchbar if geom type is "Point"
                Radio.on("Searchbar", "hit", this.pickPolygonBySearchbar.bind(this));
            }
            else {
                // don't toggle location picker active if geom type is not implemented
                this.locationPickerActive = false;
            }
        },

        /**
         * Toggles the event listener for drawing / location picking off
         * Destroys all interactions
         * @returns {void}
         */
        unlisten () {
            if (this.geometry.type === "Point") {
                this.map.removeEventListener("click", this.pickLocation);
            }
            else if (this.geometry.type === "Polygon") {
                this.map.removeInteraction(this.drawPolygonInteraction);
                this.map.removeInteraction(this.polygonSelect);
                this.drawPolygonInteraction = null;
                this.polygonSelect = null;
            }

            // unlisten to the searchbar
            Radio.off("Searchbar", "hit");
        },

        /**
         * Sets the picked location as new Point geometry
         * @param {Event} evt - the map click event
         * @returns {void}
         */
        pickLocation (evt) {
            this.geometry.value = new Point(evt.coordinate);
            this.placingPointMarker(evt.coordinate);
        },

        /**
         * Resets the entered location / geometry to null
         * @returns {void}
         */
        resetLocation () {
            this.geometry.value = null;
            this.removePointMarker();
            this.clearDrawPolygon();
        },

        /**
         * Picks the coordinates for a Point geometry from the search results
         * @listens Searchbar#RadioTriggersHit
         * @returns {void}
         */
        pickLocationBySearchbar () {
            this.geometry.value = new Point(getSearchResultsCoordinates());
        },

        /**
         * Picks a polygon geometry from the search results
         * @listens Searchbar#RadioTriggersHit
         * @returns {void}
         */
        pickPolygonBySearchbar () {
            const geometry = getSearchResultsGeometry(),
                type = geometry?.getType();

            if (type === "Polygon" || type === "MultiPolygon") {
                this.geometry.value = geometry;
            }
        },

        /**
         * Toggles the selection of polygon features as geometry on/off
         * Switches back to drawing if off
         * @returns {void}
         */
        togglePickPolygon () {
            this.pickPolygonActive = !this.pickPolygonActive;
            this.unlisten();
            this.clearDrawPolygon();

            if (this.pickPolygonActive) {
                this.pickPolygon();
            }
            else {
                this.drawPolygon();
            }
        },

        /**
         * Sets the Select interaction for picking polygons
         * @returns {void}
         */
        pickPolygon () {
            this.polygonSelect = new Select({
                layers: this.activeVectorLayerList,
                style: null
            });

            this.map.addInteraction(this.polygonSelect);
            this.polygonSelect.on("select", this.onPolygonSelect.bind(this));
        },

        /**
         * EventHandler for a polygon selection
         * Sets the geometry value to a clone of the selected polygon, if possible
         * @param {Event} evt - the selection event
         * @returns {void}
         */
        onPolygonSelect (evt) {
            const feature = evt.selected[0],
                geometry = feature?.getGeometry(),
                type = geometry?.getType();

            if (type === "Polygon" || type === "MultiPolygon") {
                this.geometry.value = geometry.clone();
            }
        },

        /**
         * Sets the Draw interaction for drawing polygons
         * @returns {void}
         */
        drawPolygon () {
            this.drawPolygonInteraction = new Draw({
                source: this.drawLayer.getSource(),
                type: "Polygon"
            });

            this.map.addInteraction(this.drawPolygonInteraction);

            this.drawPolygonInteraction.on("drawstart", this.onDrawPolygonStart.bind(this));
            this.drawPolygonInteraction.on("drawend", this.onDrawPolygonEnd.bind(this));
        },

        /**
         * Removes any drawn polygons
         * @returns {void}
         */
        clearDrawPolygon () {
            this.drawLayer.getSource().clear();
        },

        /**
         * Undoes the last drawing step from the draw interaction
         * @returns {void}
         */
        undoDrawPolygonStep () {
            this.drawPolygonInteraction.removeLastPoint();
        },

        /**
         * EventHandler for polygon drawing start
         * Clears possible previous drawings
         * @param {Event} evt - the drawStart event
         * @returns {void}
         */
        onDrawPolygonStart () {
            this.clearDrawPolygon();
        },

        /**
         * EventHandler for polygon drawing end
         * Sets the geometry value to a clone of the selected polygon, if possible
         * and draws the polygon to the drawing layer
         * @param {Event} evt - the drawStart event
         * @returns {void}
         */
        onDrawPolygonEnd (evt) {
            this.geometry.value = evt.feature.getGeometry();
        },

        /**
         * Tries to generate a new polygon from the text input in the input field
         * @param {number[]} coords - the provided coord array
         * @returns {void}
         */
        drawPolygonByCoords (coords) {
            try {
                const polygon = new Polygon(coords),
                    feature = new Feature({geometry: this.geometry.value});

                this.clearDrawPolygon();
                this.geometry.value = polygon;
                this.drawLayer.getSource().addFeature(feature);
            }
            catch (e) {
                console.warn("GeometryPicker: The entered geometry is not a valid Polygon. Please check the List of Coordinates.");
            }
        },

        /**
         * Tries to generate a new point from the text input in the input field
         * @param {number[]} coords - the provided coords
         * @returns {void}
         */
        drawPointByCoords (coords) {
            try {
                this.geometry.value = new Point(coords);
                this.placingPointMarker(coords);
            }
            catch (e) {
                console.warn("GeometryPicker: The entered geometry is not a valid Point. Please check the List of Coordinates.");
            }
        },

        /**
         * Handles manual input in the geom text field
         * triggers the generation of a geometry from text input
         * @param {String} value - the provided string value, should be at least a single point [x,y]
         * @returns {void}
         */
        setGeomByInput (value) {
            let coords;

            try {
                coords = JSON.parse(value);
            }
            catch (e) {
                coords = value.split(",").map(coord => parseFloat(coord));
            }

            if (this.geometry.type === "Point") {
                this.drawPointByCoords(coords);
            }
            if (this.geometry.type === "Polygon") {
                this.drawPolygonByCoords(coords);
            }
        }
    }
};
</script>

<template lang="html">
    <v-row
        dense
    >
        <v-col cols="3">
            <v-subheader :title="beautifyKey(geomField.name)">
                {{ beautifyKey(geomField.name) }}
            </v-subheader>
        </v-col>
        <v-col cols="9">
            <v-text-field
                v-model="geomCoords"
                :name="geomField.name"
                :label="geomField.type"
                dense
            >
                <template v-slot:append>
                    <v-btn
                        tile
                        depressed
                        small
                        :color="locationPickerActive ? 'warning' : ''"
                        :title="$t('additional:modules.tools.cosi.scenarioBuilder.chooseLocation')"
                        @click="toggleLocationPicker(geomField.type)"
                    >
                        <span v-if="useIcons">
                            <v-icon>mdi-lead-pencil</v-icon>
                        </span>
                        <span v-else>
                            {{ $t('additional:modules.tools.cosi.scenarioBuilder.chooseLocation') }}
                        </span>
                    </v-btn>
                    <v-btn
                        v-if="geometry.type === 'Polygon'"
                        tile
                        depressed
                        small
                        :title="$t('additional:modules.tools.cosi.scenarioBuilder.undo')"
                        :disabled="!locationPickerActive"
                        @click="undoDrawPolygonStep"
                    >
                        <span v-if="useIcons">
                            <v-icon>mdi-undo</v-icon>
                        </span>
                        <span v-else>
                            {{ $t('additional:modules.tools.cosi.scenarioBuilder.undo') }}
                        </span>
                    </v-btn>
                    <v-btn
                        v-if="geometry.type === 'Polygon'"
                        tile
                        depressed
                        small
                        :color="pickPolygonActive ? 'warning' : ''"
                        :title="$t('additional:modules.tools.cosi.scenarioBuilder.pick')"
                        :disabled="!locationPickerActive"
                        @click="togglePickPolygon"
                    >
                        <span v-if="useIcons">
                            <v-icon>mdi-selection-ellipse-arrow-inside</v-icon>
                        </span>
                        <span v-else>
                            {{ $t('additional:modules.tools.cosi.scenarioBuilder.pick') }}
                        </span>
                    </v-btn>
                    <v-btn
                        tile
                        depressed
                        small
                        :disabled="geometry.value === null"
                        :title="$t('additional:modules.tools.cosi.scenarioBuilder.resetLocation')"
                        @click="resetLocation"
                    >
                        <span v-if="useIcons">
                            <v-icon>mdi-delete-forever</v-icon>
                        </span>
                        <span v-else>
                            {{ $t('additional:modules.tools.cosi.scenarioBuilder.resetLocation') }}
                        </span>
                    </v-btn>
                </template>
            </v-text-field>
        </v-col>
    </v-row>
</template>
