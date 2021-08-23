<script>
/* eslint-disable new-cap */
import Tool from "../../../../src/modules/tools/Tool.vue";
import getComponent from "../../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersFeaturesList";
import mutations from "../store/mutationsFeaturesList";
import actions from "../store/actionsFeaturesList";

export default {
    name: "SaveSession",
    components: {
        Tool
    },
    data () {
        return {
        };
    },
    computed: {
        ...mapGetters("Tools/FeaturesList", Object.keys(getters))
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
        ...mapMutations("Tools/FeaturesList", Object.keys(mutations)),
        ...mapActions("Tools/FeaturesList", Object.keys(actions))
    }
};
</script>

<template lang="html">
    <Tool
        ref="tool"
        :title="$t('additional:modules.tools.cosi.featuresList.title')"
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
                    @click="saveSession"
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


