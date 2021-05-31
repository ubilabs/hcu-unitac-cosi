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
import {getOlGeomConstructorByGmlType, getOlGeomTypeByGmlType} from "../utils/getOlGeomByGmlType";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
import Point from "ol/geom/Point";
import Draw from "ol/interaction/Draw";
import {featureTagStyle} from "../utils/guideLayer";
import getValuesForField from "../utils/getValuesForField";
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
        ...mapGetters("Tools/FeaturesList", ["mapping", "activeLayerMapping"]),
        ...mapGetters("Map", ["map", "layerById"])
    },

    watch: {
        workingLayer (layerMap) {
            Radio.trigger("Util", "showLoader");
            this.resetFeature();

            describeFeatureTypeByLayerId(layerMap.layerId)
                .then(desc => {
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
            }
        }
    },
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
            }
            else if (this.geometry.type === "Polygon") {
                this.drawPolygon();
            }
            else {
                // don't toggle location picker active if geom type is not implemented
                this.locationPickerActive = false;
            }
        },
        unlisten () {
            this.removePointMarker();
            if (this.geometry.type === "Point") {
                this.map.removeEventListener("click", this.pickLocation);
            }
            else if (this.geometry.type === "Polygon") {
                this.map.removeInteraction(this.drawPolygonInteraction);
                this.drawPolygonInteraction = null;
            }
        },
        pickLocation (evt) {
            console.log(evt);
            this.geometry.value = new Point(evt.coordinate);
            this.placingPointMarker(evt.coordinate);
        },
        resetLocation () {
            this.geometry.value = null;
            this.removePointMarker();
            this.clearDrawPolygon();
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
            console.log(this.drawPolygonInteraction);
        },
        undoDrawPolygonStep () {
            this.drawPolygonInteraction.removeLastPoint();
        },
        onDrawPolygonStart () {
            this.clearDrawPolygon();
        },
        onDrawPolygonEnd (evt) {
            console.log(evt);
            const geom = evt.feature.getGeometry();

            console.log(geom);
            this.geometry.value = geom;
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
            this.locationPickerActive = false;
        },

        // /**
        //  * Generates a OL geometry of the specified type
        //  * @returns {module:ol/geom/Geometry} the generated geometry
        //  */
        // generateGeometry () {
        //     return new this.geometry.constructor(this.geometry.value);
        // },

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
        },

        pruneActiveScenario () {
            // eslint-disable-next-line no-alert
            if (confirm(this.$t("additional:modules.tools.cosi.scenarioBuilder.pruneAllFeaturesWarning"))) {
                this.activeScenario.prune();
            }
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
                                        />
                                    </v-col>
                                    <v-col cols="8">
                                        <MoveFeatures
                                            :activeScenario="activeScenario"
                                            :workingLayer="workingLayer"
                                            :active="active"
                                            :useIcons="useIcons"
                                            :guideLayer="guideLayer"
                                        />
                                    </v-col>
                                </v-row>
                                <v-divider />
                            </div>
                            <div class="form-group">
                                <label> {{ $t('additional:modules.tools.cosi.scenarioBuilder.defineFeature') }} </label>
                                <v-row
                                    v-for="field in featureTypeDesc"
                                    :key="field.name"
                                    :class="compareLayerMapping(field, workingLayer) ? 'essential-field elevation-2 primary lighten-4' : ''"
                                    :title="compareLayerMapping(field, workingLayer) ? $t('additional:modules.tools.cosi.scenarioBuilder.essentialField') : ''"
                                    dense
                                >
                                    <v-col cols="3">
                                        <v-subheader>{{ beautifyKey(field.name) }}</v-subheader>
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
                                            v-else-if="typesMapping[field.type] !== 'geom'"
                                            v-model="featureProperties[field.name]"
                                            :items="valuesForFields[field.name]"
                                            :name="field.name"
                                            :label="field.type"
                                            :rules="validateProp(field, workingLayer)"
                                            dense
                                        />
                                        <v-text-field
                                            v-else
                                            v-model="geometry.value"
                                            :name="field.name"
                                            :label="field.type"
                                            dense
                                        >
                                            <template v-slot:append>
                                                <v-btn
                                                    tile
                                                    depressed
                                                    small
                                                    :color="locationPickerActive ? 'warning' : ''"
                                                    :title="$t('additional:modules.tools.cosi.scenarioBuilder.chooseLocation')"
                                                    @click="toggleLocationPicker(field.type)"
                                                >
                                                    <span v-if="useIcons">
                                                        <v-icon>mdi-lead-pencil</v-icon>
                                                        <!-- <v-icon>{{ geometry.type === 'Polygon' ? 'mdi-lead-pencil' : 'mdi-map-marker' }}</v-icon> -->
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
                                <v-row>
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
                                </v-row>
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
        }
    }
</style>
