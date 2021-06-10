<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import getComponent from "../../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersScenarioBuilder";
import mutations from "../store/mutationsScenarioBuilder";
import actions from "../store/actionsScenarioBuilder";
import Multiselect from "vue-multiselect";
import describeFeatureTypeByLayerId from "../../utils/describeFeatureType";
import beautifyKey from "../../../../src/utils/beautifyKey";
import validateProp, {compareLayerMapping} from "../utils/validateProp";
import TypesMapping from "../../assets/mapping.types.json";
import {getOlGeomTypeByGmlType} from "../utils/getOlGeomByGmlType";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
import Point from "ol/geom/Point";
import Draw from "ol/interaction/Draw";
import {featureTagStyle, toggleTagsOnLayerVisibility} from "../utils/guideLayer";
import getValuesForField from "../utils/getValuesForField";
import {getSearchResultsCoordinates, getSearchResultsGeometry} from "../../utils/getSearchResultsGeom";
import hash from "object-hash";
import ReferencePicker from "./ReferencePicker.vue";
import MoveFeatures from "./MoveFeatures.vue";
import ScenarioManager from "./ScenarioManager.vue";
import ScenarioFeature from "../classes/ScenarioFeature";

export default {
    name: "ScenarioBuilder",
    components: {
        Tool,
        Multiselect,
        ReferencePicker,
        MoveFeatures,
        ScenarioManager
    },
    data () {
        return {
            workingLayer: null,
            featureTypeDesc: [],
            featureTypeDescSorted: {
                required: [],
                optional: []
            },
            featureProperties: {},
            beautifyKey: beautifyKey,
            typesMapping: TypesMapping,
            locationPickerActive: false,
            geometry: {
                type: "",
                value: null
            },
            valuesForFields: {},
            drawPolygonInteraction: null,
            drawLayer: null
        };
    },
    computed: {
        ...mapGetters("Tools/ScenarioBuilder", Object.keys(getters)),
        ...mapGetters("Tools/FeaturesList", ["mapping", "activeLayerMapping", "activeVectorLayerList"]),
        ...mapGetters("Map", ["map", "layerById"]),

        /**
         * Getter and Setter for the manuel coordinates Input for the geometry
         */
        geomCoords: {
            get () {
                return this.geometry.value ? JSON.stringify(this.geometry.value.getCoordinates()) : undefined;
            },
            set (v) {
                this.setGeomByInput(v);
            }
        }
    },

    watch: {
        /**
         * Watcher function for the workingLayer.
         * Triggers the retrival of the featureType description and the available values.
         * @param {Object} layerMap - the layerMap of the current working layer.
         * @returns {void}
         */
        workingLayer (layerMap) {
            Radio.trigger("Util", "showLoader");
            this.resetFeature();

            describeFeatureTypeByLayerId(layerMap.layerId)
                .then(desc => {
                    const required = [],
                        optional = [];
                    let geom;

                    for (const field of desc) {
                        if (compareLayerMapping(field, layerMap)) {
                            required.push(field);
                        }
                        else if (this.typesMapping[field.type] === "geom") {
                            geom = field;
                        }
                        else {
                            optional.push(field);
                        }
                    }
                    this.featureTypeDescSorted = {required, optional, geom};
                    this.featureTypeDesc = desc;
                    this.asyncGetValuesForField(desc);
                });
        },
        /**
         * If the tool is active, activate the select interaction and add overlay to the districtLayers if necessary
         * If the tool is not actvie, deactivate the interactions (select, drag box) and remove overlay if no districts are selected
         * and update the extent of the selected features (districts).
         * @param {boolean} newActive - Defines if the tool is active.
         * @returns {void}
         */
        active (newActive) {
            if (!newActive) {
                const model = getComponent(this.id);

                if (model) {
                    model.set("isActive", false);
                }

                this.locationPickerActive = false;
                this.unlisten();
                this.clearDrawPolygon();
                this.removePointMarker();
            }
        },

        activeVectorLayerList (layerList) {
            toggleTagsOnLayerVisibility(this.guideLayer, layerList);
        }
    },
    /**
     * Lifecycle function, triggers on component initialize. Creates necessary guide and drawing layers.
     * @returns {void}
     */
    created () {
        this.$on("close", () => {
            this.setActive(false);
        });
        this.createGuideLayer();
        this.createDrawingLayer();
    },
    methods: {
        ...mapMutations("Tools/ScenarioBuilder", Object.keys(mutations)),
        ...mapActions("Tools/ScenarioBuilder", Object.keys(actions)),
        ...mapActions("MapMarker", ["placingPointMarker", "removePointMarker"]),

        compareLayerMapping, // the utils function that checks a prop against the layer map
        validateProp, // the utils function validating the type of props and returning the relevant rules

        /**
         * @description create a guide layer used for additional info to display on the map
         * @returns {void}
         */
        createGuideLayer () {
            const newLayer = Radio.request("Map", "createLayerIfNotExists", this.id);

            newLayer.setVisible(true);
            newLayer.setStyle(featureTagStyle);
            this.setGuideLayer(newLayer);

            return newLayer;
        },
        createDrawingLayer () {
            const newLayer = Radio.request("Map", "createLayerIfNotExists", this.id + "_draw");

            newLayer.setVisible(true);
            this.drawLayer = newLayer;

            return newLayer;
        },
        resetFeature () {
            this.featureProperties = {};
            this.geometry.value = null;
            this.clearDrawPolygon();
            this.unlisten();
            this.removePointMarker();
        },
        toggleLocationPicker (type) {
            this.locationPickerActive = !this.locationPickerActive;
            // this.geometry.constructor = getOlGeomConstructorByGmlType(type);
            this.geometry.type = getOlGeomTypeByGmlType(type);

            if (this.locationPickerActive) {
                this.listen();
            }
            else {
                this.unlisten();
            }
        },
        listen () {
            if (this.geometry.type === "Point") {
                this.map.addEventListener("click", this.pickLocation);

                // Get coords from searchbar if geom type is "Point"
                Radio.on("Searchbar", "hit", this.pickLocationBySearchbar.bind(this));
            }
            else if (this.geometry.type === "Polygon") {
                this.drawPolygon();

                // Get coords from searchbar if geom type is "Point"
                Radio.on("Searchbar", "hit", this.pickPolygonBySearchbar.bind(this));
            }
            else {
                // don't toggle location picker active if geom type is not implemented
                this.locationPickerActive = false;
            }
        },
        unlisten () {
            if (this.geometry.type === "Point") {
                this.map.removeEventListener("click", this.pickLocation);
            }
            else if (this.geometry.type === "Polygon") {
                this.map.removeInteraction(this.drawPolygonInteraction);
                this.drawPolygonInteraction = null;
            }

            // unlisten to the searchbar
            Radio.off("Searchbar", "hit");
        },
        pickLocation (evt) {
            // console.log(evt);
            this.geometry.value = new Point(evt.coordinate);
            this.placingPointMarker(evt.coordinate);
        },
        resetLocation () {
            this.geometry.value = null;
            this.removePointMarker();
            this.clearDrawPolygon();
        },
        pickLocationBySearchbar () {
            this.geometry.value = new Point(getSearchResultsCoordinates());
        },
        pickPolygonBySearchbar () {
            const geometry = getSearchResultsGeometry(),
                type = geometry?.getType();

            if (type === "Polygon" || type === "MultiPolygon") {
                this.geometry.value = geometry;
            }
        },
        drawPolygon () {
            this.drawPolygonInteraction = new Draw({
                source: this.drawLayer.getSource(),
                type: "Polygon"
            });

            this.map.addInteraction(this.drawPolygonInteraction);

            this.drawPolygonInteraction.on("drawstart", this.onDrawPolygonStart.bind(this));
            this.drawPolygonInteraction.on("drawend", this.onDrawPolygonEnd.bind(this));
        },
        clearDrawPolygon () {
            this.drawLayer.getSource().clear();
        },
        undoDrawPolygonStep () {
            this.drawPolygonInteraction.removeLastPoint();
        },
        onDrawPolygonStart () {
            this.clearDrawPolygon();
        },
        onDrawPolygonEnd (evt) {
            this.geometry.value = evt.feature.getGeometry();
        },
        drawPolygonByCoords (coords) {
            try {
                const polygon = new Polygon(coords),
                    feature = new Feature({geometry: this.geometry.value});

                this.clearDrawPolygon();
                this.geometry.value = polygon;
                this.drawLayer.getSource().addFeature(feature);
            }
            catch (e) {
                console.warn("ScenarioBuilder: The entered geometry is not a valid Polygon. Please check the List of Coordinates.");
            }
        },
        drawPointByCoords (coords) {
            try {
                this.geometry.value = new Point(coords);
                this.placingPointMarker(coords);
            }
            catch (e) {
                console.warn("ScenarioBuilder: The entered geometry is not a valid Point. Please check the List of Coordinates.");
            }
        },
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
        },

        /**
         * Creates a new simulated feature and adds it to the map
         * @todo move to the scenarioFeature constructor?
         * @returns {void}
         */
        createFeature () {
            const layer = this.layerById(this.workingLayer.layerId).olLayer,
                geom = this.geometry.value,
                feature = new Feature({geometry: geom});

            // set properties
            feature.setProperties(this.featureProperties);
            // flag as simulated
            feature.set("isSimulation", true);
            // create unique hash as ID
            feature.setId(hash({...this.featureProperties, geom: this.geometry}));

            this.activeScenario.addFeature(
                new ScenarioFeature(feature, layer)
            );
            this.unlisten();
            this.clearDrawPolygon();
            this.removePointMarker();
            this.locationPickerActive = false;
        },

        asyncGetValuesForField (desc) {
            this.valuesForFields = {};

            for (const field of desc) {
                getValuesForField(field.name, this.workingLayer.layerId)
                    .then(items => {
                        this.valuesForFields = {
                            ...this.valuesForFields,
                            [field.name]: items
                        };
                    });
            }

            Radio.trigger("Util", "hideLoader");
        },

        getDataFromReferenceFeature (feature) {
            const referenceProps = feature.getProperties();

            if (referenceProps.hasOwnProperty("geom")) {
                delete referenceProps.geom;
            }

            this.featureProperties = referenceProps;
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t('additional:modules.tools.cosi.scenarioBuilder.title')"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
        :initial-width="0.4"
        :initial-height="0.4"
    >
        <template
            v-if="active"
            v-slot:toolBody
        >
            <v-app>
                <div
                    v-if="activeLayerMapping.length === 0"
                    class="warning_wrapper section"
                >
                    <p class="warning">
                        <span>{{ $t("additional:modules.tools.cosi.scenarioBuilder.warningNoData") }}</span>
                    </p>
                </div>
                <div
                    v-else
                    id="scenario-builder"
                >
                    <form class="form-inline features-list-controls">
                        <div class="form-group">
                            <label> {{ $t('additional:modules.tools.cosi.scenarioManager.title') }} </label>
                            <ScenarioManager />
                        </div>
                        <v-divider />
                        <div class="form-group">
                            <label> {{ $t('additional:modules.tools.cosi.scenarioBuilder.layerSelector') }} </label>
                            <Multiselect
                                v-model="workingLayer"
                                class="layer_selection selection"
                                :options="activeLayerMapping"
                                group-label="group"
                                :group-select="false"
                                group-values="layer"
                                track-by="id"
                                label="id"
                                :multiple="false"
                                selectedLabel=""
                                selectLabel=""
                                deselectLabel=""
                                :placeholder="$t('additional:modules.tools.cosi.scenarioBuilder.layerSelector')"
                            >
                                <template slot="singleLabel">
                                    <strong v-if="workingLayer">{{ workingLayer.id }}</strong>
                                </template>
                            </Multiselect>
                        </div>
                        <template v-if="featureTypeDesc.length > 0">
                            <div class="form-group">
                                <v-row>
                                    <v-col cols="4">
                                        <ReferencePicker
                                            :workingLayer="workingLayer"
                                            :active="active"
                                            :useIcons="useIcons"
                                            @pickReference="getDataFromReferenceFeature"
                                            @referencePickerActive="locationPickerActive = false; unlisten();"
                                        />
                                    </v-col>
                                    <v-col cols="8">
                                        <MoveFeatures
                                            :activeScenario="activeScenario"
                                            :workingLayer="workingLayer"
                                            :active="active"
                                            :useIcons="useIcons"
                                            :guideLayer="guideLayer"
                                            @moveFeaturesActive="locationPickerActive = false; unlisten();"
                                        />
                                    </v-col>
                                </v-row>
                                <v-divider />
                            </div>
                            <div class="form-group">
                                <label> {{ $t('additional:modules.tools.cosi.scenarioBuilder.defineFeature') }} </label>
                                <v-expansion-panels
                                    accordion
                                    multiple
                                    :value="[0,1]"
                                >
                                    <v-expansion-panel>
                                        <v-expansion-panel-header>
                                            {{ $t('additional:modules.tools.cosi.scenarioBuilder.geomFieldHeader') }}
                                        </v-expansion-panel-header>
                                        <v-expansion-panel-content>
                                            <v-row
                                                :key="featureTypeDescSorted.geom.name"
                                                dense
                                            >
                                                <v-col cols="3">
                                                    <v-subheader :title="beautifyKey(featureTypeDescSorted.geom.name)">
                                                        {{ beautifyKey(featureTypeDescSorted.geom.name) }}
                                                    </v-subheader>
                                                </v-col>
                                                <v-col cols="9">
                                                    <v-text-field
                                                        v-model="geomCoords"
                                                        :name="featureTypeDescSorted.geom.name"
                                                        :label="featureTypeDescSorted.geom.type"
                                                        dense
                                                    >
                                                        <template v-slot:append>
                                                            <v-btn
                                                                tile
                                                                depressed
                                                                small
                                                                :color="locationPickerActive ? 'warning' : ''"
                                                                :title="$t('additional:modules.tools.cosi.scenarioBuilder.chooseLocation')"
                                                                @click="toggleLocationPicker(featureTypeDescSorted.geom.type)"
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
                                                                tile
                                                                depressed
                                                                small
                                                                :disabled="geometry.value === null"
                                                                :title="$t('additional:modules.tools.cosi.scenarioBuilder.resetLocation')"
                                                                @click="resetLocation"
                                                            >
                                                                <span v-if="useIcons">
                                                                    <v-icon>mdi-delete-forever</v-icon>
                                                                    <!-- <v-icon>{{ geometry.type === 'Polygon' ? 'mdi-delete-forever' : 'mdi-map-marker-off' }}</v-icon> -->
                                                                </span>
                                                                <span v-else>
                                                                    {{ $t('additional:modules.tools.cosi.scenarioBuilder.resetLocation') }}
                                                                </span>
                                                            </v-btn>
                                                        </template>
                                                    </v-text-field>
                                                </v-col>
                                            </v-row>
                                        </v-expansion-panel-content>
                                    </v-expansion-panel>
                                    <v-expansion-panel>
                                        <v-expansion-panel-header>
                                            {{ $t('additional:modules.tools.cosi.scenarioBuilder.essentialFieldHeader') }}
                                        </v-expansion-panel-header>
                                        <v-expansion-panel-content>
                                            <v-row
                                                v-for="field in featureTypeDescSorted.required"
                                                :key="field.name"
                                                class="essential-field"
                                                :title="$t('additional:modules.tools.cosi.scenarioBuilder.essentialField')"
                                                dense
                                            >
                                                <v-col cols="3">
                                                    <v-subheader :title="beautifyKey(field.name)">
                                                        {{ beautifyKey(field.name) }}
                                                    </v-subheader>
                                                </v-col>
                                                <v-col cols="9">
                                                    <v-switch
                                                        v-if="typesMapping[field.type] === 'boolean'"
                                                        v-model="featureProperties[field.name]"
                                                        :label="field.type"
                                                        dense
                                                        :hide-details="false"
                                                    />
                                                    <!-- Add Date Picker for dates -->
                                                    <!-- <v-date-picker
                                                        v-else-if="typesMapping[field.type] !== 'date'"
                                                        v-model="featureProperties[field.name]"
                                                    /> -->
                                                    <v-combobox
                                                        v-else
                                                        v-model="featureProperties[field.name]"
                                                        :items="valuesForFields[field.name]"
                                                        :name="field.name"
                                                        :label="field.type"
                                                        :rules="validateProp(field, workingLayer)"
                                                        dense
                                                    />
                                                </v-col>
                                            </v-row>
                                        </v-expansion-panel-content>
                                    </v-expansion-panel>
                                    <v-expansion-panel>
                                        <v-expansion-panel-header>
                                            {{ $t('additional:modules.tools.cosi.scenarioBuilder.optionalFieldHeader') }}
                                        </v-expansion-panel-header>
                                        <v-expansion-panel-content>
                                            <v-row
                                                v-for="field in featureTypeDescSorted.optional"
                                                :key="field.name"
                                                :title="$t('additional:modules.tools.cosi.scenarioBuilder.essentialField')"
                                                dense
                                            >
                                                <v-col cols="3">
                                                    <v-subheader :title="beautifyKey(field.name)">
                                                        {{ beautifyKey(field.name) }}
                                                    </v-subheader>
                                                </v-col>
                                                <v-col cols="9">
                                                    <v-switch
                                                        v-if="typesMapping[field.type] === 'boolean'"
                                                        v-model="featureProperties[field.name]"
                                                        :label="field.type"
                                                        dense
                                                    />
                                                    <!-- Add Date Picker for dates -->
                                                    <!-- <v-date-picker
                                                        v-else-if="typesMapping[field.type] !== 'date'"
                                                        v-model="featureProperties[field.name]"
                                                    /> -->
                                                    <v-combobox
                                                        v-else
                                                        v-model="featureProperties[field.name]"
                                                        :items="valuesForFields[field.name]"
                                                        :name="field.name"
                                                        :label="field.type"
                                                        :rules="validateProp(field, workingLayer)"
                                                        dense
                                                    />
                                                </v-col>
                                            </v-row>
                                        </v-expansion-panel-content>
                                    </v-expansion-panel>
                                </v-expansion-panels>
                                <v-row>
                                    <v-col cols="12">
                                        <v-btn
                                            tile
                                            depressed
                                            color="primary"
                                            :disabled="!activeScenario || geometry.value === null || geometry.type === null"
                                            @click="createFeature"
                                        >
                                            {{ $t('additional:modules.tools.cosi.scenarioBuilder.createFeature') }}
                                        </v-btn>
                                        <v-btn
                                            tile
                                            depressed
                                            :disabled="!activeScenario"
                                            @click="resetFeature"
                                        >
                                            {{ $t('additional:modules.tools.cosi.scenarioBuilder.resetFeature') }}
                                        </v-btn>
                                    </v-col>
                                </v-row>
                                <!-- <v-row>
                                    <v-col cols="12">
                                        <v-btn
                                            tile
                                            depressed
                                            :disabled="!activeScenario"
                                            :title="$t('additional:modules.tools.cosi.scenarioBuilder.restoreAllFeatures')"
                                            @click="activeScenario.restore()"
                                        >
                                            {{ $t('additional:modules.tools.cosi.scenarioBuilder.restoreAllFeatures') }}
                                        </v-btn>
                                        <v-btn
                                            tile
                                            depressed
                                            :disabled="!activeScenario"
                                            :title="$t('additional:modules.tools.cosi.scenarioBuilder.pruneAllFeatures')"
                                            @click="pruneActiveScenario"
                                        >
                                            {{ $t('additional:modules.tools.cosi.scenarioBuilder.pruneAllFeatures') }}
                                        </v-btn>
                                        <label v-if="!activeScenario">
                                            {{ $t('additional:modules.tools.cosi.scenarioBuilder.noActiveScenario') }}
                                        </label>
                                    </v-col>
                                </v-row> -->
                            </div>
                        </template>
                    </form>
                </div>
            </v-app>
        </template>
    </Tool>
</template>

<style lang="less">
    @import "../../utils/variables.less";

    #scenario-builder {
        .form-group {
            width: 100%;
            .row {
                margin-top: 0px;
            }
            .col-3 {
                overflow: hidden;
            }
        }
    }
</style>
