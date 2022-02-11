<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import getComponent from "../../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersSaveSession";
import mutations from "../store/mutationsSaveSession";
import actions from "../store/actionsSaveSession";
import {downloadJsonToFile} from "../../utils/download";
import {Point, Polygon, MultiPoint, MultiPolygon} from "ol/geom";
import serializeState from "./serializeState";
import parseState from "./parseState";
import ToolInfo from "../../components/ToolInfo.vue";

export default {
    name: "SaveSession",
    components: {
        Tool,
        ToolInfo
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
                    ChartGenerator: [
                        "datasets",
                        "chartConfigs"
                    ],
                    CalculateRatio: [
                        "resultHeaders",
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
                        "rawGeoJson",
                        "mode",
                        "coordinate",
                        "clickCoordinate",
                        "selectedFacilityName",
                        "setByFeature",
                        "transportType",
                        "scaleUnit",
                        "distance",
                        "steps",
                        "active"
                    ],
                    Dashboard: [
                        "statsFeatureFilter"
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
            autoSave: null,
            autoSaveInterval: undefined,
            autoSaveDialog: false,
            confirmDialog: false,
            settingsChanged: false,
            geomConstructors: {Point, Polygon, MultiPoint, MultiPolygon},
            warningDialog: false
        };
    },
    computed: {
        ...mapGetters("Language", ["currentLocale"]),
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
                this.warningDialog = true;
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
        },

        sessionToLoad (session) {
            this.load(session);
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
        ...parseState,
        ...serializeState,

        save () {
            // console.log(this.$store.state);
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
            // console.log(this.session);
            this.localStorage.setItem("cosi-state", JSON.stringify(this.session));
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

        load (session) {
            const state = session.state || session; // fallback for old saves

            this.session.meta.title = session.meta?.title || this.session.meta.title;
            this.setActive(false);
            this.parseState(this.storePaths, state);
            this.addSingleAlert({
                content: `Sitzung ${session.meta?.title} vom ${session.meta?.created} erfolgreich geladen.`,
                category: "Erfolg",
                displayClass: "success"
            });
        },

        getTopicsLayer (layerId) {
            let layer = this.layerById(layerId);

            if (layer) {
                return layer.olLayer;
            }
            if (this.onlyUdpServices && isNaN(parseInt(layerId, 10))) {
                return undefined;
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
                <v-app class="clamp-40vw">
                    <ToolInfo
                        :url="readmeUrl[currentLocale]"
                    />
                    <v-container class="flex btn-grid">
                        <v-card-title secondary-title>
                            Schnelles Speichern
                        </v-card-title>
                        <div class="mb-2">
                            Sitzungen im Browser (z.B. Edge, Firefox) speichern. Diese können beim Start von CoSI über den Button 'Letzte Laden' wieder geladen werden. <br>
                            Wenn Browserverlauf oder Cache geleert werden, geht dieser Speicherstand verloren! Es kann immer nur eine Sitzung vorgehalten werden.
                        </div>
                        <v-row class="flex">
                            <v-col
                                cols="6"
                                class="flex"
                            >
                                <v-btn
                                    id="save-session"
                                    tile
                                    dense
                                    small
                                    color="grey lighten-1"
                                    :title="$t('additional:modules.tools.cosi.saveSession.saveTooltip')"
                                    @click="quickSave"
                                >
                                    {{ $t('additional:modules.tools.cosi.saveSession.save') }}
                                </v-btn>
                            </v-col>
                            <v-col
                                cols="5"
                                class="flex"
                            >
                                <v-btn
                                    id="load-session"
                                    tile
                                    dense
                                    small
                                    color="grey lighten-1"
                                    :title="$t('additional:modules.tools.cosi.saveSession.loadTooltip')"
                                    @click="loadLastSession"
                                >
                                    {{ $t('additional:modules.tools.cosi.saveSession.load') }}
                                </v-btn>
                            </v-col>
                            <v-col
                                cols="1"
                                class="flex"
                            >
                                <v-btn
                                    id="clear-session"
                                    tile
                                    dense
                                    small
                                    color="grey lighten-1"
                                    :title="$t('additional:modules.tools.cosi.saveSession.clear')"
                                    @click="clear"
                                >
                                    <v-icon>mdi-delete</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>
                        <v-divider />
                        <v-card-title secondary-title>
                            Lokales Speichern
                        </v-card-title>
                        <div class="mb-2">
                            Sitzungen als Datei auf dem Rechner speichern und über den Button 'Datei laden' wieder laden. Diese können jederzeit wieder geladen oder mit anderen CoSI Nutzer:innen geteilt werden.
                        </div>
                        <v-row class="flex">
                            <v-col
                                cols="6"
                                class="flex"
                            >
                                <v-btn
                                    id="save-to-file"
                                    tile
                                    dense
                                    small
                                    color="grey lighten-1"
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
                                    dense
                                    small
                                    color="grey lighten-1"
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
                                <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
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
                        <v-row
                            class="flex"
                            dense
                        >
                            <v-col
                                cols="6"
                                class="flex"
                            >
                                <v-checkbox
                                    id="auto-save"
                                    v-model="autoSave"
                                    class="form-check-input"
                                    dense
                                    hide-details
                                    :label="$t('additional:modules.tools.cosi.saveSession.autoSave')"
                                    :title="$t('additional:modules.tools.cosi.saveSession.autoSaveCheck')"
                                />
                            </v-col>
                        </v-row>
                    </v-container>
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
            <v-snackbar
                v-model="warningDialog"
                :timeout="4000"
                color="secondary"
            >
                Bitte beachten Sie, dass sich das Tool noch in Entwicklung befindet und noch nicht alle Arbeitsstände sauber abgelegt werden. Nur zum Testen geeignet!
                <template #action="{ attrs }">
                    <v-btn
                        v-bind="attrs"
                        text
                        @click="warningDialog = false"
                    >
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </template>
            </v-snackbar>
        </v-app>
    </div>
</template>

<style lang="scss" scoped>
    @import "../../utils/variables.scss";

    .hidden {
        display: hidden;
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
