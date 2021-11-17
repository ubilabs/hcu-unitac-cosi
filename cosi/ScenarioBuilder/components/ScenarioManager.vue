<script>
import getters from "../store/gettersScenarioBuilder";
import mutations from "../store/mutationsScenarioBuilder";
import actions from "../store/actionsScenarioBuilder";
import {mapGetters, mapActions, mapMutations} from "vuex";
import Modal from "../../../../src/share-components/modals/Modal.vue";
import Scenario from "../classes/Scenario";

export default {
    name: "ScenarioManager",
    components: {
        Modal
    },
    data: () => ({
        newScenarioName: "",
        newScenarioValid: true,
        createNewScenarioModalOpen: false
    }),
    computed: {
        ...mapGetters("Tools/ScenarioBuilder", Object.keys(getters)),

        scenarioNames () {
            return this.scenarios.map(scenario => scenario.name);
        },

        validScenarioName () {
            return this.newScenarioName.length === 0 || this.scenarioNames.includes(this.newScenarioName);
        },

        scenarioByName: () => name => {
            return this.scenarios.find(scenario => scenario.name === name);
        },

        newScenarioRules () {
            return [
                value => Boolean(value) || this.$t("additional:modules.tools.cosi.scenarioBuilder.required"),
                value => !this.scenarioNames.includes(value) || this.$t("additional:modules.tools.cosi.scenarioManager.dublicateName")
            ];
        },

        _activeScenario: {
            get () {
                return this.activeScenario;
            },
            set (v) {
                this.setActiveScenario(v);
            }
        }
    },
    watch: {
        activeScenario (newActiveScenario, oldActiveScenario) {
            if (oldActiveScenario) {
                oldActiveScenario.hideScenario();
            }
            if (newActiveScenario) {
                newActiveScenario.restore();
            }
        }
    },
    methods: {
        ...mapMutations("Tools/ScenarioBuilder", Object.keys(mutations)),
        ...mapActions("Tools/ScenarioBuilder", Object.keys(actions)),

        // escapeCreateNewScenario () {
        //     // ...
        // },

        createNewScenario () {
            const newScenario = new Scenario(this.newScenarioName, this.guideLayer);

            this.scenarios.push(newScenario);
            this.createNewScenarioModalOpen = false;
            this.newScenarioName = "";

            this.setActiveScenario(newScenario);
        },

        deleteScenario () {
            // eslint-disable-next-line no-alert
            if (confirm(this.$t("additional:modules.tools.cosi.scenarioManager.deleteScenarioWarning"))) {
                this.activeScenario.prune();
                this.setScenarios(this.scenarios.filter(scenario => scenario !== this.activeScenario));
                this.setActiveScenario(null);
            }
        },

        pruneActiveScenario () {
            // eslint-disable-next-line no-alert
            if (confirm(this.$t("additional:modules.tools.cosi.scenarioManager.pruneAllFeaturesWarning"))) {
                this.activeScenario.prune();
            }
        },

        pruneActiveScenarioNeighborhoods () {
            // eslint-disable-next-line no-alert
            if (confirm(this.$t("additional:modules.tools.cosi.scenarioManager.pruneNeighborhoodsWarning"))) {
                this.activeScenario.pruneNeighborhoods();
            }
        },

        pruneActiveScenarioSimulatedFeatures () {
            // eslint-disable-next-line no-alert
            if (confirm(this.$t("additional:modules.tools.cosi.scenarioManager.pruneSimulatedFeaturesWarning"))) {
                this.activeScenario.pruneSimulatedFeatures();
            }
        }
    }
};
</script>

<template>
    <div>
        <div class="mb-5 overline">
            {{ $t('additional:modules.tools.cosi.scenarioManager.title') }}
        </div>
        <div class="mb-2">
            Anlegen und Verwalten der Szenarien für fiktive Daten. In einem Szenario können Einrichtungen und Wohnquartiere simuliert, sowie bestehende Einrichtungen verändert werden.
        </div>
        <v-row dense>
            <v-col cols="6">
                <v-select
                    v-model="_activeScenario"
                    :items="scenarios"
                    item-text="name"
                    item-value="name"
                    return-object
                    :no-data-text="$t('additional:modules.tools.cosi.scenarioManager.noScenarios')"
                    :label="$t('additional:modules.tools.cosi.scenarioManager.selectScenarios')"
                    :title="$t('additional:modules.tools.cosi.scenarioManager.selectScenarios')"
                    outlined
                    dense
                    clearable
                />
            </v-col>
            <v-col
                class="flex"
                cols="6"
            >
                <v-btn
                    tile
                    depressed
                    :title="$t('additional:modules.tools.cosi.scenarioManager.createNewTitle')"
                    class="flex-item"
                    @click="createNewScenarioModalOpen = !createNewScenarioModalOpen"
                >
                    <span v-if="useIcons">
                        <v-icon>mdi-domain-plus</v-icon>
                    </span>
                    <span v-else>
                        {{ $t('additional:modules.tools.cosi.scenarioManager.createNewTitle') }}
                    </span>
                </v-btn>
                <v-menu
                    open-on-hover
                    top
                    offset-y
                >
                    <template #activator="{ on, attrs }">
                        <v-btn
                            tile
                            depressed
                            :title="$t('additional:modules.tools.cosi.scenarioManager.exportScenario')"
                            :disabled="!activeScenario"
                            class="flex-item"
                            v-bind="attrs"
                            v-on="on"
                            @click="activeScenario ? activeScenario.exportScenario() : null"
                        >
                            <span v-if="useIcons">
                                <v-icon>mdi-download</v-icon>
                            </span>
                            <span v-else>
                                {{ $t('additional:modules.tools.cosi.scenarioManager.exportScenario') }}
                            </span>
                        </v-btn>
                    </template>

                    <v-list>
                        <v-list-item>
                            <v-btn
                                tile
                                depressed
                                :title="$t('additional:modules.tools.cosi.scenarioManager.exportSimulatedFeatures')"
                                :disabled="!activeScenario"
                                class="flex-item"
                                @click="activeScenario ? activeScenario.exportScenarioFeatures() : null"
                            >
                                <span v-if="useIcons">
                                    <v-icon>mdi-map-marker-multiple</v-icon>
                                </span>
                                <span v-else>
                                    {{ $t('additional:modules.tools.cosi.scenarioManager.exportSimulatedFeatures') }}
                                </span>
                            </v-btn>
                        </v-list-item>
                        <v-list-item>
                            <v-btn
                                tile
                                depressed
                                :title="$t('additional:modules.tools.cosi.scenarioManager.exportNeighborhoods')"
                                :disabled="!activeScenario"
                                class="flex-item"
                                @click="activeScenario ? activeScenario.exportScenarioNeighborhoods() : null"
                            >
                                <span v-if="useIcons">
                                    <v-icon>mdi-home</v-icon>
                                </span>
                                <span v-else>
                                    {{ $t('additional:modules.tools.cosi.scenarioManager.exportNeighborhoods') }}
                                </span>
                            </v-btn>
                        </v-list-item>
                        <v-list-item>
                            <v-btn
                                tile
                                depressed
                                :title="$t('additional:modules.tools.cosi.scenarioManager.exportScenario')"
                                :disabled="!activeScenario"
                                class="flex-item"
                                @click="activeScenario ? activeScenario.exportScenario() : null"
                            >
                                <span v-if="useIcons">
                                    <v-icon>mdi-download</v-icon>
                                </span>
                                <span v-else>
                                    {{ $t('additional:modules.tools.cosi.scenarioManager.exportScenario') }}
                                </span>
                            </v-btn>
                        </v-list-item>
                    </v-list>
                </v-menu>
                <v-btn
                    tile
                    depressed
                    :disabled="!_activeScenario"
                    :title="$t('additional:modules.tools.cosi.scenarioManager.deleteScenario')"
                    class="flex-item"
                    @click="deleteScenario"
                >
                    <span v-if="useIcons">
                        <v-icon>mdi-delete-forever</v-icon>
                    </span>
                    <span v-else>
                        {{ $t('additional:modules.tools.cosi.scenarioManager.deleteScenario') }}
                    </span>
                </v-btn>
            </v-col>
        </v-row>
        <v-row dense>
            <v-col
                class="flex"
                cols="12"
            >
                <v-menu
                    open-on-hover
                    bottom
                    offset-y
                >
                    <template #activator="{ on, attrs }">
                        <v-btn
                            tile
                            depressed
                            :disabled="!activeScenario"
                            :title="$t('additional:modules.tools.cosi.scenarioManager.helpPruneAllFeatures')"
                            class="flex-item"
                            v-bind="attrs"
                            v-on="on"
                            @click="pruneActiveScenario"
                        >
                            <v-icon left>
                                mdi-domain-remove
                            </v-icon>
                            {{ $t('additional:modules.tools.cosi.scenarioManager.pruneAllFeatures') }}
                        </v-btn>
                    </template>

                    <v-list>
                        <v-list-item>
                            <v-btn
                                tile
                                depressed
                                :disabled="!activeScenario"
                                :title="$t('additional:modules.tools.cosi.scenarioManager.helpPruneAllFeatures')"
                                class="flex-item"
                                @click="pruneActiveScenario"
                            >
                                <v-icon left>
                                    mdi-domain-remove
                                </v-icon>
                                {{ $t('additional:modules.tools.cosi.scenarioManager.pruneAllFeatures') }}
                            </v-btn>
                        </v-list-item>
                        <v-list-item>
                            <v-btn
                                tile
                                depressed
                                :disabled="!activeScenario"
                                :title="$t('additional:modules.tools.cosi.scenarioManager.helpPruneNeighborhoods')"
                                class="flex-item"
                                @click="pruneActiveScenarioNeighborhoods"
                            >
                                <v-icon left>
                                    mdi-home-remove
                                </v-icon>
                                {{ $t('additional:modules.tools.cosi.scenarioManager.pruneNeighborhoods') }}
                            </v-btn>
                        </v-list-item>
                        <v-list-item>
                            <v-btn
                                tile
                                depressed
                                :disabled="!activeScenario"
                                :title="$t('additional:modules.tools.cosi.scenarioManager.helpPruneSimulatedFeatures')"
                                class="flex-item"
                                @click="pruneActiveScenarioSimulatedFeatures"
                            >
                                <v-icon left>
                                    mdi-map-marker-remove
                                </v-icon>
                                {{ $t('additional:modules.tools.cosi.scenarioManager.pruneSimulatedFeatures') }}
                            </v-btn>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-col>
        </v-row>
        <v-row dense>
            <v-col cols="12">
                <label v-if="!activeScenario">
                    {{ $t('additional:modules.tools.cosi.scenarioManager.noActiveScenario') }}
                </label>
            </v-col>
        </v-row>
        <Modal
            :show-modal="createNewScenarioModalOpen"
        >
            <label> {{ $t('additional:modules.tools.cosi.scenarioManager.createNewTitle') }} </label>
            <form id="new-scenario-form">
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field
                                v-model="newScenarioName"
                                required
                                dense
                                :rules="newScenarioRules"
                                :label="$t('additional:modules.tools.cosi.scenarioManager.scenarioName')"
                            />
                            <v-btn
                                tile
                                depressed
                                type="button"
                                dense
                                :disabled="validScenarioName"
                                :title="$t('additional:modules.tools.cosi.scenarioManager.createNewTitle')"
                                @click="createNewScenario"
                            >
                                {{ $t('additional:modules.tools.cosi.scenarioManager.createNewSubmit') }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </form>
        </Modal>
    </div>
</template>

<style lang="less" scoped>
    #new-scenario-form {
        width: 40vw;
    }
</style>
