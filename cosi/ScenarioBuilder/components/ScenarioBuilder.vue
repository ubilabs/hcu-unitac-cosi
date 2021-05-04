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
import validateProp from "../utils/validateProp";
import TypesMapping from "../../assets/mapping.types.json";
import getOlGeomByGmlType from "../utils/getOlGeomByGmlType";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
import Point from "ol/geom/Point";
import {featureTagStyle} from "../utils/guideLayer";
import getValuesForField from "../utils/getValuesForField";
import hash from "object-hash";

export default {
    name: "ScenarioBuilder",
    components: {
        Tool,
        Multiselect
    },
    data () {
        return {
            workingLayer: {},
            featureTypeDesc: [],
            featureProperties: {},
            beautifyKey: beautifyKey,
            typesMapping: TypesMapping,
            locationPickerActive: false,
            geometry: {
                Constructor: null,
                value: null
            },
            valuesForFields: {}
        };
    },
    computed: {
        ...mapGetters("Tools/ScenarioBuilder", Object.keys(getters)),
        ...mapGetters("Tools/FeaturesList", ["mapping", "activeLayerMapping", "activeVectorLayerList"]),
        ...mapGetters("Map", ["map", "layerById"])
        // validateProp: () => field => validateProp(field)
    },

    watch: {
        workingLayer (layer) {
            this.resetFeature();

            describeFeatureTypeByLayerId(layer.layerId)
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
                this.removePointMarker();
            }
        }
    },
    created () {
        this.$on("close", () => {
            this.setActive(false);
        });
        this.createGuideLayer();
    },
    mounted () {
        console.log(this.activeLayerMapping);
    },
    methods: {
        ...mapMutations("Tools/ScenarioBuilder", Object.keys(mutations)),
        ...mapActions("Tools/ScenarioBuilder", Object.keys(actions)),
        ...mapActions("MapMarker", ["placingPointMarker", "removePointMarker"]),

        // getValuesForField, // the utils function returning all possible values for a field
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
        resetFeature () {
            this.featureProperties = {};
            this.geometry.value = null;
        },
        toggleLocationPicker (type) {
            console.log("toggle");
            console.log(this.map);
            console.log(type);
            this.locationPickerActive = !this.locationPickerActive;
            this.geometry.Constructor = getOlGeomByGmlType(type);

            if (this.locationPickerActive) {
                this.listen();
            }
            else {
                this.unlisten();
            }
        },
        listen () {
            if (this.geometry.Constructor === Point) {
                this.map.addEventListener("click", this.pickLocation);
            }
        },
        unlisten () {
            if (this.geometry.Constructor === Point) {
                this.map.removeEventListener("click", this.pickLocation);
            }
        },
        pickLocation (evt) {
            this.geometry.value = evt.coordinate;
            this.placingPointMarker(evt.coordinate);
        },

        resetLocation () {
            this.geometry.value = null;
            this.removePointMarker();
        },

        /**
         * Creates a new simulated feature and adds it to the map
         * @returns {void}
         */
        createFeature () {
            const layer = this.layerById(this.workingLayer.layerId).olLayer,
                geom = this.generateGeometry(),
                feature = new Feature({geometry: geom});

            // set properties
            feature.setProperties(this.featureProperties);
            // flag as simulated
            feature.set("isSimulation", true);
            // create unique hash as ID
            feature.setId(hash({...this.featureProperties, geom: this.geometry}));

            this.addFeatureToScenario({feature, layer});
            this.unlisten();
            this.locationPickerActive = false;
        },

        /**
         * Generates a OL geometry of the specified type
         * @returns {module:ol/geom/Geometry} the generated geometry
         */
        generateGeometry () {
            return new this.geometry.Constructor(this.geometry.value);
        },

        asyncGetValuesForField (desc) {
            this.valuesForFields = {};

            desc.forEach(field => {
                getValuesForField(field.name, this.workingLayer.layerId)
                    .then(items => {
                        this.valuesForFields = {
                            ...this.valuesForFields,
                            [field.name]: items
                        };
                    });
            });
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
                <div id="scenario-builder">
                    <form class="form-inline features-list-controls">
                        <div class="form-group">
                            <Multiselect
                                v-if="activeLayerMapping.length > 0"
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
                                    <strong>{{ workingLayer.id }}</strong>
                                </template>
                            </Multiselect>
                        </div>
                        <div
                            v-if="featureTypeDesc.length > 0"
                            class="form-group"
                        >
                            <v-row
                                v-for="field in featureTypeDesc"
                                :key="field.name"
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
                                    <v-combobox
                                        v-else-if="typesMapping[field.type] !== 'geom'"
                                        v-model="featureProperties[field.name]"
                                        :items="valuesForFields[field.name]"
                                        :name="field.name"
                                        :label="field.type"
                                        :rules="validateProp(field)"
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
                                                @click="toggleLocationPicker(field.type)"
                                            >
                                                {{ $t('additional:modules.tools.cosi.scenarioBuilder.chooseLocation') }}
                                            </v-btn>
                                            <v-btn
                                                tile
                                                depressed
                                                small
                                                :disabled="geometry.value === null"
                                                @click="resetLocation"
                                            >
                                                {{ $t('additional:modules.tools.cosi.scenarioBuilder.resetLocation') }}
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
                                        :disabled="!(geometry.value !== null && geometry.type !== null)"
                                        @click="createFeature"
                                    >
                                        {{ $t('additional:modules.tools.cosi.scenarioBuilder.createFeature') }}
                                    </v-btn>
                                    <v-btn
                                        tile
                                        depressed
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
                                        @click="restoreScenario"
                                    >
                                        {{ $t('additional:modules.tools.cosi.scenarioBuilder.restoreAllFeatures') }}
                                    </v-btn>
                                    <v-btn
                                        tile
                                        depressed
                                        @click="pruneScenario"
                                    >
                                        {{ $t('additional:modules.tools.cosi.scenarioBuilder.pruneAllFeatures') }}
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </div>
                    </form>
                </div>
            </v-app>
        </template>
    </Tool>
</template>

<style lang="less">
    #scenario-builder {
        .form-group {
            width: 100%;
            .row {
                margin-top: 0px;
            }
        }
    }
</style>

<style src="vue-select/dist/vue-select.css">
</style>


