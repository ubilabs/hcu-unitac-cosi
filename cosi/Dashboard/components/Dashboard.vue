<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import getComponent from "../../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersDashboard";
import mutations from "../store/mutationsDashboard";
import actions from "../store/actionsDashboard";
import DashboardTable from "./DashboardTable.vue";

export default {
    name: "Dashboard",
    components: {
        Tool,
        DashboardTable
    },
    data () {
        return {
            dashboardOpen: false
        };
    },
    computed: {
        ...mapGetters("Tools/Dashboard", Object.keys(getters))
    },

    watch: {
        active () {
            // ..
        }
    },
    created () {
        /**
         * If the tool is used from the menu,
         * toggles the menu item inactive if closed
         * @param {boolean} newActive - Defines if the tool is active.
         * @returns {void}
         */
        this.$on("close", () => {
            const model = getComponent(this.id);

            this.setActive(false);
            if (model) {
                model.set("isActive", false);
            }
        });
    },

    methods: {
        ...mapMutations("Tools/Dashboard", Object.keys(mutations)),
        ...mapActions("Tools/Dashboard", Object.keys(actions))
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t('additional:modules.tools.cosi.dashboard.title')"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
        :initial-width="0.6"
    >
        <template
            #toolBody
        >
            <v-app absolute>
                <v-main>
                    <DashboardTable />
                </v-main>
            </v-app>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
</style>


