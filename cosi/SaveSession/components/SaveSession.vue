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
            state: null
        };
    },
    computed: {
        ...mapGetters("Tools/SaveSession", Object.keys(getters)),
        ...mapGetters("Tools/ScenarioBuilder", {simGuideLayer: "guideLayer"}),
        ...mapGetters("Map", "layerById")
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

        this.loadFromLocalStorage();
    },
    methods: {
        ...mapMutations("Tools/SaveSession", Object.keys(mutations)),
        ...mapActions("Tools/SaveSession", Object.keys(actions)),
        save () {
            this.serializeState();
            this.storeToLocalStorage();

            console.log(this.state);
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
                console.warn("No session has yet been saved");
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
            console.log(scenario);
            const _scenario = new Scenario(
                scenario.name,
                this.simGuideLayer,
                scenario
            );
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
                simulatedFeatures,
                modifiedFeatures,
                neighborhoods
            };
        },

        serializeScenarioFeature (scenarioFeature, parser) {
            return {
                ...scenarioFeature,
                guideLayer: null,
                feature: parser.writeFeature(scenarioFeature.feature),
                layer: scenarioFeature.layer.get("id")
            };
        },

        serializeNeighborhood (scenarioNeighborhood, parser) {
            return {
                ...scenarioNeighborhood,
                layer: null,
                feature: parser.writeFeature(scenarioNeighborhood.feature),
                districts: scenarioNeighborhood.districts.map(dist => ({
                    ...dist,
                    district: dist.adminFeature.getId()
                }))
            };
        }
    }
};
</script>

<template lang="html">
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
            </v-app>
        </template>
    </Tool>
</template>

<style lang="less">
    @import "../../utils/variables.less";
</style>

<style src="vue-select/dist/vue-select.css">
</style>


