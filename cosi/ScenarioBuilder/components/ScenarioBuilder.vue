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
import getClusterSource from "../../utils/getClusterSource";
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import Point from 'ol/geom/Point';

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
            }
        };
    },
    computed: {
        ...mapGetters("Tools/ScenarioBuilder", Object.keys(getters)),
        ...mapGetters("Tools/FeaturesList", ["mapping", "activeLayerMapping", "activeVectorLayerList"]),
        ...mapGetters("Map", ["map", "layerById", "visibleLayerList"]),
        validateProp: () => field => validateProp(field)
    },

    watch: {
        workingLayer (layer) {
            this.resetFeature();

            describeFeatureTypeByLayerId(layer.layerId)
                .then(desc => {
                    this.featureTypeDesc = desc;
                    console.log(desc);
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
    },
    mounted () {
        console.log(this.activeLayerMapping);
    },
    methods: {
        ...mapMutations("Tools/ScenarioBuilder", Object.keys(mutations)),
        ...mapActions("Tools/ScenarioBuilder", Object.keys(actions)),
        ...mapActions("MapMarker", ["placingPointMarker", "removePointMarker"]),
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

        createFeature () {
            const layer = this.layerById(this.workingLayer.layerId).olLayer,
                geom = this.generateGeometry(),
                feature = new Feature({geometry: geom});

            console.log(feature, layer);
            feature.setProperties(this.featureProperties);

            this.addFeatureToScenario({feature, layer});
            this.unlisten();
            this.locationPickerActive = false;
        },

        generateGeometry () {
            return new this.geometry.Constructor(this.geometry.value);
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
                                    <v-text-field
                                        v-if="typesMapping[field.type] !== 'geom'"
                                        v-model="featureProperties[field.name]"
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
                                        color="success"
                                        @click="restoreScenario"
                                    >
                                        {{ $t('additional:modules.tools.cosi.scenarioBuilder.restoreAllFeatures') }}
                                    </v-btn>
                                    <v-btn
                                        tile
                                        depressed
                                        color="warning"
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


