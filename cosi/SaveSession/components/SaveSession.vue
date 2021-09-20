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
import {downloadJsonToFile} from "../../utils/download";
import Collection from "ol/Collection";

export default {
    name: "SaveSession",
    components: {
        Tool
    },
    data () {
        return {
            localStorage,
            storePaths: {
                Map: [
                    "layerIds"
                ],
                Tools: {
                    CalculateRatio: [
                        "results"
                    ],
                    ScenarioBuilder: [
                        "scenarios"
                    ],
                    DistrictSelector: [
                        "selectedDistrictLevelId",
                        "selectedDistrictsCollection"
                    ]
                }
            },
            state: null,
            loadDialog: false,
            sessionFile: null
        };
    },
    computed: {
        ...mapGetters("Tools/SaveSession", Object.keys(getters)),
        ...mapGetters("Tools/ScenarioBuilder", {simGuideLayer: "guideLayer"}),
        ...mapGetters("Tools/ResidentialSimulation", {simNeighborhoodLayer: "drawingLayer"}),
        ...mapGetters("Tools/DistrictSelector", ["selectedDistrictLevel", "districtLevels"]),
        ...mapGetters("Map", ["layerById"])
    },
    watch: {
        /**
         * Unselect the Menu item if the tool is deactivated
         * @param {boolean} state - Defines if the tool is active.
         * @returns {void}
         */
        active (state) {
            if (state) {
                this.addSingleAlert({
                    content: "WORK IN PROGRESS! Bitte beachten Sie, dass sich das Tool noch in Entwicklung befindet und noch nicht alle Arbeitsstände sauber abgelegt werden. Nur zum Testen geeignet!",
                    category: "Info",
                    displayClass: "info"
                });
            }
            else {
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
        ...mapActions("Alerting", ["addSingleAlert", "cleanup"]),
        save () {
            this.serializeState();
            this.storeToLocalStorage();

            this.addSingleAlert({
                content: "Sitzung erfolgreich gespeichert!",
                category: "Success",
                displayClass: "success"
            });
        },
        saveAs () {
            this.save();
            downloadJsonToFile(this.state, "Neue_Session.json");
        },

        load () {
            this.loadFromLocalStorage();
            this.loadDialog = false;
        },

        loadFromFile () {
            this.$refs["file-prompt"].click();
            this.loadDialog = false;
        },

        handleFile (evt) {
            const file = evt.target.files[0],
                reader = new FileReader();

            reader.onload = res => {
                try {
                    const state = JSON.parse(res.target.result);

                    this.parseState(this.storePaths, state);
                    this.addSingleAlert({
                        content: "Sitzung erfolgreich geladen.",
                        category: "Success",
                        displayClass: "success"
                    });
                }
                catch (e) {
                    console.error(e);
                    console.warn("File could not be read");

                    this.addSingleAlert({
                        content: "Die Datei konnte nicht gelesen werden.",
                        category: "Warning",
                        displayClass: "warning"
                    });
                }
            };
            reader.readAsText(file);
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
                this.addSingleAlert({
                    content: "Sitzung erfolgreich geladen.",
                    category: "Success",
                    displayClass: "success"
                });
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
                            // case "DistrictSelector/selectedDistrictLevelId":
                            //     this.$store.commit(mutation, this.parseDistrictLevel(state[key][attr]));
                            //     break;
                            case "DistrictSelector/selectedDistrictsCollection":
                                this.$nextTick(() => {
                                    this.$store.commit(mutation, this.parseFeatureCollection(state[key][attr]));
                                });
                                break;
                            case "Map/layerIds":
                                this.$nextTick(() => {
                                    console.log(state[key][attr]);
                                    state[key][attr].forEach(layerId => this.getTopicsLayer(layerId));
                                });
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

            console.log(this.$store);
        },

        parseScenarios (scenarios) {
            const parser = new GeoJSON();

            return scenarios.map(scenario => this.parseScenario(scenario, parser));
        },

        parseScenario (scenario, parser) {
            const simulatedFeatures = scenario.simulatedFeatures.map(scenarioFeature => this.parseScenarioFeature(scenarioFeature, parser)),
                neighborhoods = scenario.neighborhoods.map(scenarioFeature => this.parseScenarioNeighborhood(scenarioFeature, parser)),
                _scenario = new Scenario(
                    scenario.name,
                    this.simGuideLayer,
                    {
                        simulatedFeatures,
                        neighborhoods
                    }
                );

            return _scenario;
        },

        parseScenarioFeature (scenarioFeature, parser) {
            const layer = this.getTopicsLayer(scenarioFeature.layer),
                feature = parser.readFeature(scenarioFeature.feature);

            return new ScenarioFeature(feature, layer);
        },

        parseScenarioNeighborhood (scenarioNeighborhood, parser) {
            const feature = parser.readFeature(scenarioNeighborhood.feature);

            return new ScenarioNeighborhood(feature, this.simNeighborhoodLayer, this.districtLevels);
        },

        parseDistrictLevel (districtLevelLabel) {
            return this.districtLevels.find(districtLevel => districtLevel.label === districtLevelLabel);
        },

        parseFeatureCollection (collectionObject) {
            const parser = new GeoJSON(),
                collection = new Collection(parser.readFeatures(collectionObject));

            collection.set("fromExternal", true);

            return collection;
        },

        serializeState () {
            const state = this.deepCopyState(this.storePaths, this.$store.state);

            this.serializeScenarios(state);
            this.serializeDistrictSelector(state);
            // this.serializeLayers(state);
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
                    scenarioNeighborhood => this.serializeNeighborhood(scenarioNeighborhood, parser)
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
                feature: parser.writeFeatureObject(scenarioNeighborhood.feature)
            };
        },

        serializeDistrictSelector (state) {
            const selectedDistrictsCollection = this.serializeFeatureCollection(state.Tools.DistrictSelector.selectedDistrictsCollection);

            state.Tools.DistrictSelector.selectedDistrictsCollection = selectedDistrictsCollection;
        },

        serializeDistrictLevel (districtLevel) {
            return districtLevel.label;
        },

        serializeFeatureCollection (collection) {
            return new GeoJSON().writeFeaturesObject(collection.getArray());
        },

        // serializeLayers (state) {
        //     console.log(state.Map.layerIds);

        //     state.Map.layerIds = [];
        // },

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
                    <v-container class="flex btn-grid">
                        <v-row class="flex">
                            <v-col
                                cols="6"
                                class="flex"
                            >
                                <v-btn
                                    id="save-session"
                                    tile
                                    depressed
                                    :title="$t('additional:modules.tools.cosi.saveSession.save')"
                                    @click="save"
                                >
                                    {{ $t('additional:modules.tools.cosi.saveSession.save') }}
                                </v-btn>
                            </v-col>
                            <v-col
                                cols="6"
                                class="flex"
                            >
                                <v-btn
                                    id="save-to-file"
                                    tile
                                    depressed
                                    :title="$t('additional:modules.tools.cosi.saveSession.saveToFile')"
                                    @click="saveAs"
                                >
                                    {{ $t('additional:modules.tools.cosi.saveSession.saveToFile') }}
                                </v-btn>
                            </v-col>
                        </v-row>
                        <v-row class="flex">
                            <v-col
                                cols="6"
                                class="flex"
                            >
                                <v-btn
                                    id="load-session"
                                    tile
                                    depressed
                                    :title="$t('additional:modules.tools.cosi.saveSession.load')"
                                    @click="load"
                                >
                                    {{ $t('additional:modules.tools.cosi.saveSession.load') }}
                                </v-btn>
                            </v-col>
                            <v-col
                                cols="6"
                                class="flex"
                            >
                                <v-btn
                                    id="load-from-file"
                                    tile
                                    depressed
                                    :title="$t('additional:modules.tools.cosi.saveSession.loadFromFile')"
                                    @click="loadFromFile"
                                >
                                    {{ $t('additional:modules.tools.cosi.saveSession.loadFromFile') }}
                                </v-btn>
                            </v-col>
                        </v-row>
                        <v-row class="hidden">
                            <v-col
                                cols="6"
                                class="flex"
                            >
                                <!-- <v-file-input
                                    v-model="sessionFile"
                                    :label="$t('additional:modules.tools.cosi.saveSession.dropFile')"
                                    tile
                                    depressed
                                    accept="text/json;charset=utf-8"
                                /> -->
                                <input
                                    id="file-prompt"
                                    ref="file-prompt"
                                    type="file"
                                    accept="text/json;charset=utf-8"
                                    @change="handleFile"
                                >
                            </v-col>
                        </v-row>
                        <v-row class="flex">
                            <v-col
                                cols="6"
                                class="flex"
                            >
                                <v-btn
                                    id="clear-session"
                                    tile
                                    depressed
                                    :title="$t('additional:modules.tools.cosi.saveSession.clear')"
                                    @click="clear"
                                >
                                    {{ $t('additional:modules.tools.cosi.saveSession.clear') }}
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-container>
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
                <v-row cols="12">
                    <v-btn
                        v-bind="attrs"
                        text
                        @click="load"
                    >
                        {{ $t("additional:modules.tools.cosi.saveSession.load") }}
                    </v-btn>
                    <v-btn
                        v-bind="attrs"
                        text
                        @click="loadDialog = false"
                    >
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-row>
            </template>
        </v-snackbar>
    </div>
</template>

<style lang="less">
    @import "../../utils/variables.less";

    .hidden {
        display: hidden;
    }
</style>
