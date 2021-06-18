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
import Feature from "ol/Feature";
import {featureTagStyle, toggleTagsOnLayerVisibility} from "../utils/guideLayer";
import getValuesForField from "../utils/getValuesForField";
import hash from "object-hash";
import ReferencePicker from "./ReferencePicker.vue";
import MoveFeatures from "./MoveFeatures.vue";
import GeometryPicker from "./GeometryPicker.vue";
import ScenarioManager from "./ScenarioManager.vue";
import ScenarioFeature from "../classes/ScenarioFeature";
import createLayer from "../../utils/createLayer";

export default {
    name: "ScenarioBuilder",
    components: {
        Tool,
        Multiselect,
        ReferencePicker,
        MoveFeatures,
        ScenarioManager,
        GeometryPicker
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
            geometry: null,
            valuesForFields: {}
        };
    },
    computed: {
        ...mapGetters("Tools/ScenarioBuilder", Object.keys(getters)),
        ...mapGetters("Tools/FeaturesList", ["activeLayerMapping", "activeVectorLayerList"]),
        ...mapGetters("Map", ["map", "layerById"]),

        /**
         * Getter and Setter for the manuel coordinates Input for the geometry
         */
        geomCoords: {
            get () {
                return this.geometry ? JSON.stringify(this.geometry.getCoordinates()) : undefined;
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
                this.geomPickerUnlisten();
                this.geomPickerClearDrawPolygon();
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
            const newLayer = createLayer(this.id + "_layer");

            newLayer.setVisible(true);
            newLayer.setStyle(featureTagStyle);
            this.setGuideLayer(newLayer);

            return newLayer;
        },

        /**
         * Resets the new feature properties
         * @returns {void}
         */
        resetFeature () {
            this.featureProperties = {};
            this.geomPickerResetLocation();
            this.geomPickerUnlisten();
        },

        /**
         * Unlistens the map events to draw / pick a geometry and toggles the button in the geomPicker off
         * @returns {void}
         */
        geomPickerUnlisten () {
            if (this.$refs["geometry-picker"]) {
                this.$refs["geometry-picker"].locationPickerActive = false;
                this.$refs["geometry-picker"].unlisten();
            }
        },

        /**
         * Resets the currently picked location in the geomPicker
         * @returns {void}
         */
        geomPickerResetLocation () {
            this.geometry = null;
            if (this.$refs["geometry-picker"]) {
                this.$refs["geometry-picker"].resetLocation();
            }
        },

        /**
         * Clears the drawing source of the geomPicker
         * Does not remove any picked geometry
         * @returns {void}
         */
        geomPickerClearDrawPolygon () {
            this.$refs["geometry-picker"].clearDrawPolygon();
        },

        /**
         * Updates the geometry from the geomPicker in the data for later use when instantiating a new feature
         * @param {module:ol/Geometry} geom the new geometry object
         * @returns {void}
         */
        updateGeometry (geom) {
            this.geometry = geom;
        },

        /**
         * Creates a new simulated feature and adds it to the map
         * @todo move to the scenarioFeature constructor?
         * @returns {void}
         */
        createFeature () {
            const layer = this.layerById(this.workingLayer.layerId).olLayer,
                geom = this.geometry,
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
            this.geomPickerUnlisten();
            this.geomPickerClearDrawPolygon();
            this.removePointMarker();
            this.locationPickerActive = false;
        },

        /**
         * Asynchronously Retrieves the avaialble values for each field of the featureType
         * stores the result for use in select fields
         * @param {Object[]} desc - the featureType description
         * @returns {void}
         */
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

        /**
         * Sets a reference feature's properties as the properties of the feature to create
         * deletes the original features geom if necessary
         * @param {module:ol/Feature} feature - the feature picked as reference
         * @returns {void}
         */
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
                                            @referencePickerActive="locationPickerActive = false; geomPickerUnlisten();"
                                        />
                                    </v-col>
                                    <v-col cols="8">
                                        <MoveFeatures
                                            :activeScenario="activeScenario"
                                            :workingLayer="workingLayer"
                                            :active="active"
                                            :useIcons="useIcons"
                                            :guideLayer="guideLayer"
                                            @moveFeaturesActive="locationPickerActive = false; geomPickerUnlisten();"
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
                                            <GeometryPicker
                                                ref="geometry-picker"
                                                :geomField="featureTypeDescSorted.geom"
                                                :useIcons="useIcons"
                                                @updateGeometry="updateGeometry"
                                            />
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
                                    <v-col
                                        class="flex"
                                        cols="12"
                                    >
                                        <v-btn
                                            tile
                                            depressed
                                            color="primary"
                                            :disabled="!activeScenario || geometry === null"
                                            class="flex-item"
                                            @click="createFeature"
                                        >
                                            {{ $t('additional:modules.tools.cosi.scenarioBuilder.createFeature') }}
                                        </v-btn>
                                        <v-btn
                                            tile
                                            depressed
                                            :disabled="!activeScenario"
                                            class="flex-item"
                                            @click="resetFeature"
                                        >
                                            {{ $t('additional:modules.tools.cosi.scenarioBuilder.resetFeature') }}
                                        </v-btn>
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
            .col-3 {
                overflow: hidden;
            }
        }
        .flex {
            display: flex;
            .flex-item {
                margin: 0 2px 0 2px;
            }
        }
    }
</style>
