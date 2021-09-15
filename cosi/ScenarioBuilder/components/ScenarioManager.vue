<script>
import getters from "../store/gettersScenarioBuilder";
import mutations from "../store/mutationsScenarioBuilder";
import actions from "../store/actionsScenarioBuilder";
import {mapGetters, mapActions, mapMutations} from "vuex";
import Modal from "../../../../src/share-components/modals/Modal.vue";
import Scenario from "../classes/Scenario";
import Multiselect from "vue-multiselect";

export default {
    name: "ScenarioManager",
    components: {
        Modal,
        Multiselect
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
                oldActiveScenario.isActive = false;
            }
            if (newActiveScenario) {
                newActiveScenario.restore();
                newActiveScenario.isActive = true;
            }
        }
    },
    methods: {
        ...mapMutations("Tools/ScenarioBuilder", Object.keys(mutations)),
        ...mapActions("Tools/ScenarioBuilder", Object.keys(actions)),

        escapeCreateNewScenario () {
            // ...
        },

        createNewScenario () {
            const newScenario = new Scenario(this.newScenarioName, this.guideLayer);

            this.scenarios.push(newScenario);
            this.createNewScenarioModalOpen = false;

            // set the new scenario active, if no other scenario is selected
            if (!this.activeScenario) {
                this.setActiveScenario(newScenario);
            }
        },

        deleteScenario () {
            // eslint-disable-next-line no-alert
            if (confirm(this.$t("additional:modules.tools.cosi.scenarioManager.deleteScenarioWarning"))) {
                this.activeScenario.prune();
                this.setActiveScenario(null);
                this.setScenarios(this.scenarios.filter(scenario => scenario !== this.activeScenario));
            }
        },

        pruneActiveScenario () {
            // eslint-disable-next-line no-alert
            if (confirm(this.$t("additional:modules.tools.cosi.scenarioManager.pruneAllFeaturesWarning"))) {
                this.activeScenario.prune();
            }
        },

        validateNewScenario () {
            this.$refs["new-scenario-form"].validate();
            if (this.$refs["new-scenario-form"].validate()) {
                this.createNewScenario();
            }
        }
    }
};
</script>

<template>
    <div>
        <v-row>
            <v-col cols="6">
                <Multiselect
                    v-model="_activeScenario"
                    class="layer_selection selection"
                    :options="scenarios"
                    track-by="name"
                    label="name"
                    :multiple="false"
                    :allow-empty="false"
                    selected-label=""
                    select-label=""
                    deselect-label=""
                    :placeholder="$t('additional:modules.tools.cosi.scenarioManager.selectScenarios')"
                >
                    <template slot="singleLabel">
                        <strong v-if="_activeScenario">{{ _activeScenario.name }}</strong>
                    </template>
                    <template slot="noOptions">
                        <span>{{ $t('additional:modules.tools.cosi.scenarioManager.noScenarios') }}</span>
                    </template>
                </Multiselect>
            </v-col>
            <v-col
                class="flex"
                cols="6"
            >
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
                                @click="activeScenario ? activeScenario.exportScenarioNeighborhoods() : null"
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
                                @click="activeScenario ? activeScenario.exportScenarioFeatures() : null"
                            >
                                <span v-if="useIcons">
                                    <v-icon>mdi-home-group</v-icon>
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
            </v-col>
        </v-row>
        <v-row>
            <v-col
                class="flex"
                cols="12"
            >
                <v-btn
                    tile
                    depressed
                    :disabled="!activeScenario"
                    :title="$t('additional:modules.tools.cosi.scenarioManager.helpRestoreAllFeatures')"
                    class="flex-item"
                    @click="activeScenario.restore()"
                >
                    <v-icon left>
                        mdi-cached
                    </v-icon>
                    {{ $t('additional:modules.tools.cosi.scenarioManager.restoreAllFeatures') }}
                </v-btn>
                <v-btn
                    tile
                    depressed
                    :disabled="!activeScenario"
                    :title="$t('additional:modules.tools.cosi.scenarioManager.helpPruneAllFeatures')"
                    class="flex-item"
                    @click="pruneActiveScenario"
                >
                    <v-icon left>
                        mdi-backspace
                    </v-icon>
                    {{ $t('additional:modules.tools.cosi.scenarioManager.pruneAllFeatures') }}
                </v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <label v-if="!activeScenario">
                    {{ $t('additional:modules.tools.cosi.scenarioManager.noActiveScenario') }}
                </label>
            </v-col>
        </v-row>
        <Modal
            :show-modal="createNewScenarioModalOpen"
            @modalHid="escapeCreateNewScenario"
            @clickedOnX="escapeCreateNewScenario"
            @clickedOutside="escapeCreateNewScenario"
        >
            <label> {{ $t('additional:modules.tools.cosi.scenarioManager.createNewTitle') }} </label>
            <v-form
                id="new-scenario-form"
                ref="new-scenario-form"
                v-model="newScenarioValid"
                @submit.prevent="validateNewScenario"
            >
                <v-row>
                    <v-col cols="12">
                        <v-text-field
                            v-model="newScenarioName"
                            required
                            :rules="newScenarioRules"
                            :label="$t('additional:modules.tools.cosi.scenarioManager.scenarioName')"
                        />
                        <v-btn
                            tile
                            depressed
                            type="submit"
                            :title="$t('additional:modules.tools.cosi.scenarioManager.createNewTitle')"
                            :disabled="!newScenarioValid"
                            form="new-scenario-form"
                        >
                            {{ $t('additional:modules.tools.cosi.scenarioManager.createNewSubmit') }}
                        </v-btn>
                    </v-col>
                </v-row>
            </v-form>
        </Modal>
    </div>
</template>

<style lang="less" scoped>
    #new-scenario-form {
        width: 40vw;
    }
</style>
