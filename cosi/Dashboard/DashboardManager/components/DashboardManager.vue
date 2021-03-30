<script>
import Tool from "../../../../../src/modules/tools/Tool.vue";
import getComponent from "../../../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersDashboardManager";
import mutations from "../store/mutationsDashboardManager";
import actions from "../store/actionsDashboardManager";
import DashboardTable from "../../DashboardTable/components/DashboardTable.vue";

export default {
    name: "DashboardManager",
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
        ...mapGetters("Tools/DashboardManager", Object.keys(getters))
    },

    watch: {
        active (state) {
            this.dashboardOpen = state;
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
        ...mapMutations("Tools/DashboardManager", Object.keys(mutations)),
        ...mapActions("Tools/DashboardManager", Object.keys(actions))
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
        :deactivateGFI="deactivateGFI"
        :initial-width="0.6"
    >
        <template
            v-if="active"
            v-slot:toolBody
        >
            <DashboardTable
                :dashboardOpen="dashboardOpen"
            />
        </template>
    </Tool>
</template>

<style lang="less" scoped>
</style>

<style src="vue-select/dist/vue-select.css">
</style>


