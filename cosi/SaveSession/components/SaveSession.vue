<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import getComponent from "../../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersSaveSession";
import mutations from "../store/mutationsSaveSession";
import actions from "../store/actionsSaveSession";
import {GeoJSON} from "ol/format";
import Feature from "ol/Feature";
import ScenarioNeighborhood from "../../ScenarioBuilder/classes/ScenarioNeighborhood";
import ScenarioFeature from "../../ScenarioBuilder/classes/ScenarioFeature";
import Scenario from "../../ScenarioBuilder/classes/Scenario";
import {downloadJsonToFile} from "../../utils/download";
import Modal from "../../../../src/share-components/modals/Modal.vue";
import {Point, Polygon, MultiPoint, MultiPolygon} from "ol/geom";

export default {
    name: "SaveSession",
    components: {
        Tool,
        Modal
    },
    data () {
        return {
            localStorage,
            storePaths: {
                Map: [
                    "layerIds",
                    "center",
                    "zoomLevel"
                ],
                Tools: {
                    CalculateRatio: [
                        "results",
                        "active"
                    ],
                    ScenarioBuilder: [
                        "scenarios",
                        "active"
                    ],
                    DistrictSelector: [
                        "selectedDistrictLevelId",
                        "selectedDistrictNames",
                        "active"
                    ],
                    AccessibilityAnalysis: [
                        "isochroneFeatures",
                        "active"
                    ]
                }
            },
            state: null,
            session: {
                meta: {
                    title: `${this.$t("additional:modules.tools.cosi.saveSession.newSession")}-${new Date().toLocaleString()}`,
                    info: null,
                    created: null,
                    date: null
                },
                state: null
            },
            latestDate: null,
            loadDialog: false,
            saveDialog: false,
            saveMode: "quickSave",
            sessionFile: null,
            showTemplates: false,
            templates: [],
            autoSave: false,
            autoSaveInterval: undefined,
            autoSaveDialog: false,
            confirmDialog: false,
            settingsChanged: false,
            geomConstructors: {Point, Polygon, MultiPoint, MultiPolygon}
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
                    content: "Bitte beachten Sie, dass sich das Tool noch in Entwicklung befindet und noch nicht alle Arbeitsstände sauber abgelegt werden. Nur zum Testen geeignet!",
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
        },

        autoSave () {
            this.settingsChanged = true;
            this.confirmDialog = true;

            if (this.autoSave) {
                this.localStorage.setItem("cosi-auto-save", true);
                this.enableAutoSave();
            }
            else {
                this.localStorage.setItem("cosi-auto-save", false);
                this.disableAutoSave();
            }
        },

        confirmDialog (state) {
            if (!state) {
                this.settingsChanged = false;
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
        this.localStorage = window.localStorage;
        this.loadTemplates();

        const
            autoSave = JSON.parse(this.localStorage.getItem("cosi-auto-save")),
            lastSession = JSON.parse(this.localStorage.getItem("cosi-state"));

        if (autoSave !== null) {
            this.autoSave = autoSave;
            this.$nextTick(() => {
                this.confirmDialog = false;
            });
        }
        else {
            this.autoSaveDialog = true;
        }

        if (lastSession) {
            this.loadDialog = true;
            this.latestDate = lastSession?.meta?.created;
        }
    },
    methods: {
        ...mapMutations("Tools/SaveSession", Object.keys(mutations)),
        ...mapActions("Tools/SaveSession", Object.keys(actions)),
        ...mapActions("Alerting", ["addSingleAlert", "cleanup"]),
        ...mapActions("Tools/DistrictSelector", ["setDistrictsByName"]),
        save () {
            console.log(this.$store.state);
            this.saveDialog = false;
            this.serializeState();

            this.session.state = this.state;
            this.session.meta.created = new Date().toLocaleString();
            this.session.meta.date = new Date();
            this.confirmDialog = true;
        },
        quickSave () {
            this.save();
            this.storeToLocalStorage();
        },
        saveAs () {
            this.save();
            downloadJsonToFile(this.session, this.session.meta.title + ".json");
        },

        clear () {
            this.localStorage.removeItem("cosi-state");
        },

        storeToLocalStorage () {
            console.log(this.session);
            this.localStorage.setItem("cosi-state", JSON.stringify(this.session));
        },

        async loadTemplates () {
            let path, res;
            const templates = [];

            for (const filename of this.templateFiles) {
                path = `${this.templatePath}/${filename}.json`;

                try {
                    res = await fetch(path);
                    templates.push(await res.json());
                }
                catch (e) {
                    console.warn(`Template at ${path} could not be loaded. Please check that it is a valid JSON file.`)
                }
            }

            this.templates = templates;
        },

        async loadFromTemplate (template) {
            this.showTemplates = false;
            await this.$nextTick();
            this.load(template);
        },

        loadLastSession () {
            this.loadFromLocalStorage();
            this.loadDialog = false;
        },

        loadFromLocalStorage () {
            try {
                const session = JSON.parse(this.localStorage.getItem("cosi-state"));

                this.load(session);
            }
            catch (e) {
                console.error(e);
                console.warn("No loadable session has yet been saved");
            }
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
                    const session = JSON.parse(res.target.result);

                    this.load(session);
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

        async load (session) {
            const state = session.state || session; // fallback for old saves

            this.session.meta.title = session.meta?.title || this.session.meta.title;
            this.setActive(false);
            await this.parseState(this.storePaths, state);
            this.addSingleAlert({
                content: `Sitzung ${session.meta?.title} vom ${session.meta?.created} erfolgreich geladen.`,
                category: "Success",
                displayClass: "success"
            });
        },

        async parseState (map, state, path = []) {
            for (const key in map) {
                if (
                    Array.isArray(map[key]) &&
                    Object.hasOwnProperty.call(state, key) &&
                    map[key].every(e => typeof e === "string")
                ) {
                    for (const attr of map[key]) {
                        // continue if prop doesn't exist on the save state
                        if (!Object.hasOwnProperty.call(state[key], attr)) {
                            continue;
                        }
                        let mutation = `${key}/set${attr[0].toUpperCase() + attr.substring(1)}`;

                        // add parent nodes for nested states
                        if (path.length > 0) {
                            mutation = path.join("/") + "/" + mutation;
                        }

                        switch (`${key}/${attr}`) {
                            case "ScenarioBuilder/scenarios":
                                this.$store.commit(mutation, await this.parseScenarios(state[key][attr]));
                                break;
                            case "DistrictSelector/selectedDistrictNames":
                                this.$nextTick(() => {
                                    this.setDistrictsByName({
                                        districtNames: state[key][attr],
                                        zoomToExtent: false
                                    });
                                });
                                break;
                            case "Map/layerIds":
                                this.$nextTick(() => {
                                    state[key][attr].forEach(layerId => this.getTopicsLayer(layerId));
                                });
                                break;
                            case "Map/zoomLevel":
                                this.$store.dispatch(mutation, state[key][attr]);
                                break;
                            default:
                                this.commitState(mutation, attr, state[key][attr]);
                        }
                    }
                }
                else if (map[key].constructor === Object) {
                    state[key] = this.parseState(map[key], state[key], [...path, key]);
                }
            }

            console.log(this.$store);
        },

        commitState (mutation, attr, state) {
            if (attr === "active") {
                if (state) {
                    this.$store.commit(mutation, state);

                    const key = mutation.replace("/setActive", "/id"),
                        model = getComponent(this.$store.getters[key]);

                    if (model) {
                        model.set("isActive", state);
                    }
                }
            }
            else {
                this.$store.commit(mutation, this.parseFeatures(state));
            }
        },

        parseFeatures (val) {
            const parser = new GeoJSON();

            if (!Array.isArray(val)) {
                if (val?.constructor === Object && val?.properties?.isOlFeature) {
                    return parser.readFeature(val);
                }
                return val;
            }

            return val.map(el => {
                if (el?.constructor === Object && el?.properties?.isOlFeature) {
                    return parser.readFeature(el);
                }
                return el;
            });
        },

        async parseScenarios (scenarios) {
            const parser = new GeoJSON();

            return scenarios.map(scenario => await this.parseScenario(scenario, parser));
        },

        async parseScenario (scenario, parser) {
            console.log(scenario);
            const
                simulatedFeatures = scenario.simulatedFeatures.map(scenarioFeature => await this.parseScenarioFeature(scenarioFeature, parser)),
                modifiedFeatures = scenario.modifiedFeatures.map(scenarioFeature => await this.parseScenarioFeature(scenarioFeature, parser, true)),
                neighborhoods = scenario.neighborhoods.map(scenarioFeature => this.parseScenarioNeighborhood(scenarioFeature, parser)),
                _scenario = new Scenario(
                    scenario.name,
                    this.simGuideLayer,
                    {
                        simulatedFeatures,
                        // modifiedFeatures,
                        neighborhoods
                    }
                );

            console.log(modifiedFeatures)

            return _scenario;
        },

        async parseScenarioFeature (scenarioFeature, parser, fromUdp = false) {
            console.log(scenarioFeature);
            const
                layer = this.getTopicsLayer(scenarioFeature.layer),
                feature = fromUdp
                    ? await this.getFeatureById(layer, scenarioFeature.feature.id)
                    || parser.readFeature(scenarioFeature.feature)
                    : parser.readFeature(scenarioFeature.feature),
                scenarioData = scenarioFeature.scenarioData,
                originalData = scenarioFeature.feature.properties.originalData;

            // parse geom (original data)
            if (originalData) {
                if (originalData.geometry) {
                    this.parseGeometry(originalData.geometry);
                }
                feature.set("originalData", originalData);
            }

            // parse geom (original data)
            if (scenarioData.geometry) {
                scenarioData.geometry = this.parseGeometry(scenarioData.geometry);
            }

            console.log(feature.get("originalData")?.geometry, scenarioData.geometry);

            return new ScenarioFeature(feature, layer, undefined, scenarioData);
        },

        parseScenarioNeighborhood (scenarioNeighborhood, parser) {
            const feature = parser.readFeature(scenarioNeighborhood.feature);

            return new ScenarioNeighborhood(feature, this.simNeighborhoodLayer, this.districtLevels);
        },

        parseDistrictLevel (districtLevelLabel) {
            return this.districtLevels.find(districtLevel => districtLevel.label === districtLevelLabel);
        },

        parseGeometry ({type, coordinates}) {
            if (!type || !coordinates) {
                return undefined;
            }

            console.log(type, coordinates);
            return new this.geomConstructors[type](coordinates);
        },

        serializeState () {
            const state = this.deepCopyState(this.storePaths, this.$store.state);

            this.serializeScenarios(state);
            this.serializeBackboneModules(state);
            this.state = state;
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
                        const val = this.serializeFeatures(store[key][attr]);

                        state[key][attr] = val;
                    }
                }
                else if (map[key].constructor === Object) {
                    state[key] = this.deepCopyState(map[key], store[key]);
                }
            }

            return state;
        },

        serializeFeatures (val) {
            const parser = new GeoJSON();
            let res;

            if (!Array.isArray(val)) {
                if (val.constructor === Feature) {
                    res = parser.writeFeatureObject(val);

                    res.properties.isOlFeature = true;
                }
                else {
                    res = val;
                }
            }
            else {
                res = [];

                for (let i = 0; i < val.length; i++) {
                    if (val[i].constructor === Feature) {
                        const geojson = parser.writeFeatureObject(val[i]);

                        geojson.properties.isOlFeature = true;
                        res.push(geojson);
                    }
                    else {
                        res.push(val[i]);
                    }
                }
            }

            return res;
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
                    scenarioFeature => this.serializeScenarioFeature(scenarioFeature, parser, false)
                ),
                neighborhoods = scenario.getNeighborhoods().map(
                    scenarioNeighborhood => this.serializeNeighborhood(scenarioNeighborhood, parser)
                );

            console.log(modifiedFeatures);
            return {
                ...scenario,
                guideLayer: null,
                isActive: false,
                simulatedFeatures,
                modifiedFeatures,
                neighborhoods
            };
        },

        serializeScenarioFeature (scenarioFeature, parser, deleteOriginalData = true) {
            const feature = parser.writeFeatureObject(scenarioFeature.feature);

            // delete original Data if necessary
            if (deleteOriginalData && Object.hasOwnProperty.call(feature.properties, "originalData")) {
                delete feature.properties.originalData;
            }

            // delete geometry from properties
            if (Object.hasOwnProperty.call(feature.properties, "geometry")) {
                delete feature.properties.geometry;
            }

            // serialize geometry (original data)
            if (feature.properties.originalData?.geometry) {
                feature.properties.originalData.geometry = this.serializeGeometry(feature.properties.originalData.geometry);
            }

            // serialize geometry (scenario data)
            if (scenarioFeature.scenarioData.geometry) {
                scenarioFeature.scenarioData.geometry = this.serializeGeometry(scenarioFeature.scenarioData.geometry);
            }

            return {
                ...scenarioFeature,
                guideLayer: null,
                scenario: null,
                eventKeys: null,
                feature: feature,
                layer: scenarioFeature.layer.get("id")
            };
        },

        serializeNeighborhood (scenarioNeighborhood, parser) {
            return {
                feature: parser.writeFeatureObject(scenarioNeighborhood.feature)
            };
        },

        serializeBackboneModules (state) {
            state.Backbone = {};

            state.Backbone.Filter = this.serializeFilters();
        },

        serializeFilters () {
            const model = Radio.request("ModelList", "getModelByAttributes", {id: "filter"});

            console.log(model);
        },

        serializeGeometry (geom) {
            const
                type = geom.getType(),
                coordinates = geom.getCoordinates();

            return {
                type, coordinates
            };
        },

        getFeatureById (layer, id) {
            return new Promise(res => {
                let features = layer.getSource().getFeatures(),
                    feature, i;

                if (features.length > 0) {
                    feature = layer.getSource().getFeatureById(id);
                    res(feature);
                }
                if (features.length === 0) {
                    const interval = setInterval(() => {
                        features = layer.getSource().getFeatures();

                        if (features.length > 0 || i >= 10) {
                            clearInterval(interval);
                            feature = layer.getSource().getFeatureById(id);
                            res(feature);
                        }

                        i++;
                    }, 1000);
                }
            });
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
        },

        showTemplateInfo (template) {
            this.addSingleAlert({
                content: template.meta?.info,
                category: "Info",
                displayClass: "info"
            });
        },

        escapeSelectFromTemplates () {
            this.showTemplates = false;
        },

        onSavePrompt () {
            this.saveDialog = false;
            this[this.saveMode]();
        },

        enableAutoSave () {
            this.autoSaveInterval = setInterval(() => {
                this.quickSave();
            }, 600000);
        },

        disableAutoSave () {
            clearInterval(this.autoSaveInterval);
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
                        <v-card-title secondary-title>
                            Schnelles Speichern
                        </v-card-title>
                        <v-subheader>
                            Sitzungen als im Browser speichern. Diese können beim Programmstart wieder aus dem Verlauf geladen werden. <br>
                            Wenn Browserverlauf oder Cache geleert werden, geht dieser Speicherstand verloren! Es kann immer nur eine Sitzung parallel vorgehalten werden.
                        </v-subheader>
                        <v-row class="flex">
                            <v-col
                                cols="6"
                                class="flex"
                            >
                                <v-btn
                                    id="save-session"
                                    tile
                                    depressed
                                    :title="$t('additional:modules.tools.cosi.saveSession.saveTooltip')"
                                    @click="saveDialog = true; saveMode = 'quickSave'"
                                >
                                    {{ $t('additional:modules.tools.cosi.saveSession.save') }}
                                </v-btn>
                            </v-col>
                            <v-col
                                cols="6"
                                class="flex"
                            >
                                <v-btn
                                    id="load-session"
                                    tile
                                    depressed
                                    :title="$t('additional:modules.tools.cosi.saveSession.loadTooltip')"
                                    @click="loadLastSession"
                                >
                                    {{ $t('additional:modules.tools.cosi.saveSession.load') }}
                                </v-btn>
                            </v-col>
                        </v-row>
                        <v-divider />
                        <v-card-title secondary-title>
                            Lokales Speichern
                        </v-card-title>
                        <v-subheader>
                            Sitzungen als Datei auf dem Rechner speichern. Diese können jederzeit wieder geladen oder mit anderen CoSI Nutzer:innen geteilt werden.
                        </v-subheader>
                        <v-row class="flex">
                            <v-col
                                cols="6"
                                class="flex"
                            >
                                <v-btn
                                    id="save-to-file"
                                    tile
                                    depressed
                                    :title="$t('additional:modules.tools.cosi.saveSession.saveToFileTooltip')"
                                    @click="saveDialog = true; saveMode = 'saveAs'"
                                >
                                    {{ $t('additional:modules.tools.cosi.saveSession.saveToFile') }}
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
                                    :title="$t('additional:modules.tools.cosi.saveSession.loadFromFileTooltip')"
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
                        <v-divider />
                        <v-row class="flex">
                            <v-col
                                cols="6"
                                class="flex"
                            >
                                <v-checkbox
                                    id="auto-save"
                                    v-model="autoSave"
                                    :label="$t('additional:modules.tools.cosi.saveSession.autoSave')"
                                    :title="$t('additional:modules.tools.cosi.saveSession.autoSaveCheck')"
                                />
                            </v-col>
                            <v-col
                                cols="3"
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
                            <v-col
                                cols="3"
                                class="flex"
                            >
                                <v-btn
                                    id="load-from-templates"
                                    tile
                                    depressed
                                    :title="$t('additional:modules.tools.cosi.saveSession.templates')"
                                    @click="showTemplates = true"
                                >
                                    {{ $t('additional:modules.tools.cosi.saveSession.templates') }}
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-container>
                    <Modal
                        :show-modal="showTemplates"
                        @modalHid="escapeSelectFromTemplates"
                        @clickedOnX="escapeSelectFromTemplates"
                        @clickedOutside="escapeSelectFromTemplates"
                    >
                        <v-container>
                            <v-card-title primary-title>
                                <v-icon
                                    class="template-info-button"
                                >
                                    mdi-file-cog
                                </v-icon>
                                {{ $t("additional:modules.tools.cosi.saveSession.loadFromTemplate") }}
                            </v-card-title>
                            <v-subheader>
                                {{ $t("additional:modules.tools.cosi.saveSession.infoLoadFromTemplates") }}
                            </v-subheader>
                            <v-list dense>
                                <v-list-item-group
                                    color="primary"
                                >
                                    <v-list-item
                                        v-for="(template, i) in templates"
                                        :key="i"
                                        @click="loadFromTemplate(template)"
                                    >
                                        <v-list-item-icon>
                                            <v-tooltip left>
                                                <template #activator="{ on, attrs }">
                                                    <v-icon
                                                        class="template-info-button"
                                                        v-bind="attrs"
                                                        v-on="on"
                                                    >
                                                        mdi-help-circle
                                                    </v-icon>
                                                </template>
                                                {{ template.meta ? template.meta.info : $t("additional:modules.tools.cosi.saveSession.noInfo") }}
                                            </v-tooltip>
                                        </v-list-item-icon>
                                        <v-list-item-content>
                                            <v-list-item-title v-text="template.meta.title" />
                                            <v-list-item-subtitle v-text="template.meta.created" />
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-list-item-group>
                            </v-list>
                        </v-container>
                    </Modal>
                </v-app>
            </template>
        </Tool>
        <v-app>
            <v-snackbar
                v-model="loadDialog"
                :timeout="60000"
                color="white"
                class="light"
            >
                <span>
                    {{ $t('additional:modules.tools.cosi.saveSession.loadLast') }}
                    <template v-if="latestDate">
                        ({{ latestDate }})
                    </template>
                </span>
                <template #action="{ attrs }">
                    <v-btn
                        v-bind="attrs"
                        text
                        @click="loadLastSession"
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
                </template>
            </v-snackbar>
            <v-snackbar
                v-model="saveDialog"
                :timeout="-1"
                color="primary"
            >
                {{ $t('additional:modules.tools.cosi.saveSession.filenamePrompt') }}
                <template v-if="latestDate">
                    <v-text-field
                        id="title-field"
                        v-model="session.meta.title"
                        name="session-title"
                    />
                </template>

                <template #action="{ attrs }">
                    <v-btn
                        v-bind="attrs"
                        text
                        @click="onSavePrompt"
                    >
                        <v-icon>mdi-content-save</v-icon>
                    </v-btn>
                    <v-btn
                        v-bind="attrs"
                        text
                        @click="saveDialog = false"
                    >
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </template>
            </v-snackbar>
            <v-snackbar
                v-model="autoSaveDialog"
                :multi-line="true"
                :timeout="-1"
                color="secondary"
            >

                {{ $t('additional:modules.tools.cosi.saveSession.autoSaveCheck') }} <br>
                <small>{{ $t('additional:modules.tools.cosi.saveSession.autoSaveInfo') }}</small>
                <template #action="{ attrs }">
                    <v-btn
                        v-bind="attrs"
                        text
                        @click="autoSave = true; autoSaveDialog = false"
                    >
                        {{ $t('additional:modules.tools.cosi.saveSession.yes') }}
                    </v-btn>
                    <v-btn
                        v-bind="attrs"
                        text
                        @click="autoSave = false; autoSaveDialog = false"
                    >
                        {{ $t('additional:modules.tools.cosi.saveSession.no') }}
                    </v-btn>
                </template>
            </v-snackbar>
            <v-snackbar
                v-model="confirmDialog"
                :timeout="2000"
                color="success"
            >
                <template v-if="settingsChanged">
                    {{ $t('additional:modules.tools.cosi.saveSession.settingsChanged') }}
                </template>
                <template v-else>
                    {{ $t('additional:modules.tools.cosi.saveSession.success') }}
                </template>
                <template #action="{ attrs }">
                    <v-btn
                        v-bind="attrs"
                        text
                        @click="confirmDialog = false"
                    >
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </template>
            </v-snackbar>
        </v-app>
    </div>
</template>

<style lang="less" scoped>
    @import "../../utils/variables.less";

    .hidden {
        display: hidden;
    }

    .template-info-button {
        margin-right: 20px;
    }

    #title-field {
        width: 20vw;
    }

    .light {
        span {
            color: #111;
        }
        button {
            color: #111;
        }
    }
</style>
