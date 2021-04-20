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
            feature: null,
            beautifyKey: beautifyKey,
            typesMapping: TypesMapping
        };
    },
    computed: {
        ...mapGetters("Tools/ScenarioBuilder", Object.keys(getters)),
        ...mapGetters("Tools/FeaturesList", ["mapping", "activeLayerMapping", "activeVectorLayerList"]),
        ...mapGetters("Map", ["map", "visibleLayerList"]),
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
        ...mapActions("MapMarker", ["placingPointMarker"]),
        resetFeature () {
            this.feature = null;
            this.featureProperties = {};
        },
        toggleLocationPicker () {
            console.log("toggle");
            // store.dispatch("MapMarker/placingPointMarker", evt.coordinate);
            // this.model.set("coordinate", coordinate);
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
                                        v-model="featureProperties[field.name]"
                                        :name="field.name"
                                        :label="field.type"
                                        dense
                                    >
                                        <template v-slot:append>
                                            <v-btn
                                                tile
                                                depressed
                                                small
                                                @click="toggleLocationPicker"
                                            >
                                                {{ $t('additional:modules.tools.cosi.scenarioBuilder.chooseLocation') }}
                                            </v-btn>
                                        </template>
                                    </v-text-field>
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


