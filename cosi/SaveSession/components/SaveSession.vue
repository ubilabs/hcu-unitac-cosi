<script>
/* eslint-disable new-cap */
import Tool from "../../../../src/modules/tools/Tool.vue";
import getComponent from "../../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersSaveSession";
import mutations from "../store/mutationsSaveSession";
import actions from "../store/actionsSaveSession";

export default {
    name: "SaveSession",
    components: {
        Tool
    },
    data () {
        return {
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
        ...mapGetters("Tools/SaveSession", Object.keys(getters))
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
    },
    methods: {
        ...mapMutations("Tools/SaveSession", Object.keys(mutations)),
        ...mapActions("Tools/SaveSession", Object.keys(actions)),
        save () {
            const state = JSON.parse(JSON.stringify(this.storePaths));

            this.deepCopyState(state, this.$store.state);

            console.log(state);
            this.state = state;

            this.parseScenarios();
        },

        deepCopyState (state, store) {
            for (const key in state) {
                if (
                    Array.isArray(state[key]) &&
                    state[key].every(e => typeof e === "string")
                ) {
                    for (const attr of state[key]) {
                        state[key][attr] = store[key][attr];
                    }
                }
                else if (state[key].constructor === Object) {
                    this.deepCopyState(state[key], store[key]);
                }
            }
        },

        parseScenarios () {
            this.state.Tools.ScenarioBuilder.scenarios.map(scenario => {
                console.log(scenario);
            });
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


