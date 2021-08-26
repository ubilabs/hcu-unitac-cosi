<script>
/* eslint-disable new-cap */
import Tool from "../../../../src/modules/tools/Tool.vue";
import getComponent from "../../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersSaveSession";
import mutations from "../store/mutationsSaveSession";
import actions from "../store/actionsSaveSession";
import {GeoJSON} from "ol/format";
import ScenarioNeighborhood from "../../ScenarioBuilder/classes/ScenarioNeighborhood";
import ScenarioFeature from "../../ScenarioBuilder/classes/ScenarioFeature";
import Scenario from "../../ScenarioBuilder/classes/Scenario";

export default {
    name: "SaveSession",
    components: {
        Tool
    },
    data () {
        return {
            localStorage,
            storePaths: {
                Tools: {
                    CalculateRatio: [
                        "results"
                    ],
                    ScenarioBuilder: [
                        "scenarios"
                    ]
                }
            },
            state: null,
            loadDialog: false
        };
    },
    computed: {
        ...mapGetters("Tools/SaveSession", Object.keys(getters)),
        ...mapGetters("Tools/ScenarioBuilder", {simGuideLayer: "guideLayer"}),
        ...mapGetters("Map", ["layerById"])
    },
    watch: {
        /**
         * Unselect the Menu item if the tool is deactivated
         * @param {boolean} state - Defines if the tool is active.
         * @returns {void}
         */
        active (state) {
            if (!state) {
                const model = getComponent(this.id);

                if (model) {
                    model.set("isActive", false);
                }
            }
        }
    },
    created () {
        /**
         * listens to the close event of the Tool Component
         * @listens #close
         */
        this.$on("close", () => {
            this.setActive(false);
        });
    },
    mounted () {
        /**
         * Load data here (LocalStorage / Import)
         */
        this.localStorage = window.localStorage;

        // this.loadFromLocalStorage();

        if (this.localStorage.getItem("cosi-state")) {
            this.loadDialog = true;
        }
        // this.loadDialog = true;
    },
    methods: {
        ...mapMutations("Tools/SaveSession", Object.keys(mutations)),
        ...mapActions("Tools/SaveSession", Object.keys(actions)),
        save () {
            this.serializeState();
            this.storeToLocalStorage();

            console.log(this.state);
        },

        load () {
            this.loadFromLocalStorage();
            this.loadDialog = false;
        },

        clear () {
            this.localStorage.removeItem("cosi-state");
        },

        storeToLocalStorage () {
            this.localStorage.setItem("cosi-state", JSON.stringify(this.state));
        },

        loadFromLocalStorage () {
            try {
                const state = JSON.parse(this.localStorage.getItem("cosi-state"));

                this.parseState(this.storePaths, state);
            }
            catch (e) {
                console.error(e);
                console.warn("No loadable session has yet been saved");
            }
        },

        parseState (map, state, path = []) {
            for (const key in map) {
                if (
                    Array.isArray(map[key]) &&
                    map[key].every(e => typeof e === "string")
                ) {
                    for (const attr of map[key]) {
                        const mutation = `${path.join("/")}/${key}/set${attr[0].toUpperCase() + attr.substring(1)}`;

                        switch (`${key}/${attr}`) {
                            case "ScenarioBuilder/scenarios":
                                this.$store.commit(mutation, this.parseScenarios(state[key][attr]));
                                break;
                            default:
                                this.$store.commit(mutation, state[key][attr]);
                        }
                    }
                }
                else if (map[key].constructor === Object) {
                    state[key] = this.parseState(map[key], state[key], [...path, key]);
                }
            }
        },

        parseScenarios (scenarios) {
            const parser = new GeoJSON();

            return scenarios.map(scenario => this.parseScenario(scenario, parser));
        },

        parseScenario (scenario, parser) {
            const simulatedFeatures = scenario.simulatedFeatures.map(scenarioFeature => this.parseScenarioFeature(scenarioFeature, parser)),
                _scenario = new Scenario(
                    scenario.name,
                    this.simGuideLayer,
                    {
                        simulatedFeatures
                    }
                );

            return _scenario;
        },

        parseScenarioFeature (scenarioFeature, parser) {
            const layer = this.getTopicsLayer(scenarioFeature.layer),
                feature = parser.readFeature(scenarioFeature.feature);

            return new ScenarioFeature(feature, layer);
        },

        serializeState () {
            const state = this.deepCopyState(this.storePaths, this.$store.state);

            this.serializeScenarios(state);
            this.state = state;

            this.storeToLocalStorage();
        },

        deepCopyState (map, store) {
            const state = {};

            for (const key in map) {
                if (
                    Array.isArray(map[key]) &&
                    map[key].every(e => typeof e === "string")
                ) {
                    state[key] = {};
                    for (const attr of map[key]) {
                        state[key][attr] = store[key][attr];
                    }
                }
                else if (map[key].constructor === Object) {
                    state[key] = this.deepCopyState(map[key], store[key]);
                }
            }

            return state;
        },

        serializeScenarios (state) {
            const parser = new GeoJSON();

            state.Tools.ScenarioBuilder.scenarios =
                state.Tools.ScenarioBuilder.scenarios.map(
                    scenario => this.serializeScenario(scenario, parser)
                );
        },

        serializeScenario (scenario, parser) {
            const simulatedFeatures = scenario.getSimulatedFeatures().map(
                    scenarioFeature => this.serializeScenarioFeature(scenarioFeature, parser)
                ),
                modifiedFeatures = scenario.getModifiedFeatures().map(
                    scenarioFeature => this.serializeScenarioFeature(scenarioFeature, parser)
                ),
                neighborhoods = scenario.getNeighborhoods().map(
                    scenarioNeighborhood => this.serzializeNeighborhood(scenarioNeighborhood, parser)
                );

            return {
                ...scenario,
                guideLayer: null,
                isActive: false,
                simulatedFeatures,
                modifiedFeatures,
                neighborhoods
            };
        },

        serializeScenarioFeature (scenarioFeature, parser) {
            return {
                ...scenarioFeature,
                guideLayer: null,
                feature: parser.writeFeatureObject(scenarioFeature.feature),
                layer: scenarioFeature.layer.get("id")
            };
        },

        serializeNeighborhood (scenarioNeighborhood, parser) {
            return {
                ...scenarioNeighborhood,
                layer: null,
                feature: parser.writeFeatureObject(scenarioNeighborhood.feature),
                districts: scenarioNeighborhood.districts.map(dist => ({
                    ...dist,
                    district: dist.adminFeature.getId()
                }))
            };
        },

        getTopicsLayer (layerId) {
            let layer = this.layerById(layerId);

            if (layer) {
                return layer.olLayer;
            }

            const model = this.initializeLayer(layerId);

            if (model) {
                model.set("isSelected", true);
                layer = model.get("layer");

                console.log(model);
            }

            return layer;
        },

        /**
         * @description Checks if the layers are added to the ModelList and adds them if not.
         * @param {String} layerId - the layer id
         * @todo Refactor to vue when MP Core is updated
         * @returns {Object} the layer model from the MP core
         */
        initializeLayer (layerId) {
            if (!Radio.request("ModelList", "getModelByAttributes", {id: layerId})) {
                Radio.trigger("ModelList", "addModelsByAttributes", {id: layerId});
            }

            return Radio.request("ModelList", "getModelByAttributes", {id: layerId});
        }
    }
};
</script>

<template lang="html">
    <div>
        <Tool
            ref="tool"
            :title="$t('additional:modules.tools.cosi.saveSession.title')"
            :icon="glyphicon"
            :active="active"
            :render-to-window="renderToWindow"
            :resizable-window="resizableWindow"
            :deactivate-gfi="deactivateGFI"
        >
            <template
                v-if="active"
                #toolBody
            >
                <v-app>
                    <v-btn
                        id="save-session"
                        tile
                        depressed
                        :title="$t('additional:modules.tools.cosi.saveSession.save')"
                        @click="save"
                    >
                        {{ $t('additional:modules.tools.cosi.saveSession.save') }}
                    </v-btn>
                    <v-btn
                        id="load-session"
                        tile
                        depressed
                        :title="$t('additional:modules.tools.cosi.saveSession.load')"
                        @click="load"
                    >
                        {{ $t('additional:modules.tools.cosi.saveSession.load') }}
                    </v-btn>
                    <v-btn
                        id="clear-session"
                        tile
                        depressed
                        :title="$t('additional:modules.tools.cosi.saveSession.clear')"
                        @click="clear"
                    >
                        {{ $t('additional:modules.tools.cosi.saveSession.clear') }}
                    </v-btn>
                </v-app>
            </template>
        </Tool>
        <v-snackbar
            v-model="loadDialog"
            :timeout="-1"
            color="lightgrey"
        >
            {{ $t('additional:modules.tools.cosi.saveSession.loadLast') }}

            <template #action="{ attrs }">
                <v-btn
                    v-bind="attrs"
                    text
                    @click="load"
                >
                    {{ $t("additional:modules.tools.cosi.saveSession.load") }}
                </v-btn>
            </template>
        </v-snackbar>
    </div>
</template>

<style lang="less">
    @import "../../utils/variables.less";
</style>

<style src="vue-select/dist/vue-select.css">
</style>


