<script>
import ToolTemplate from "../../../src/modules/tools/ToolTemplate.vue";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersQuickResponseCode";
import mutations from "../store/mutationsQuickResponseCode";

export default {
    name: "QuickResponseCode",
    components: {
        ToolTemplate
    },
    computed: {
        ...mapGetters("Tools/QuickResponseCode", Object.keys(getters))
    },
    created () {
        this.$on("close", this.close);
    },

    methods: {
        ...mapMutations("Tools/QuickResponseCode", Object.keys(mutations)),

        /**
         * Closes this tool window by setting active to false
         * @returns {void}
         */
        close () {
            this.setActive(false);

            // TODO replace trigger when Menu is migrated
            // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            // else the menu-entry for this tool is always highlighted
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.QuickResponseCode.id});

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};
</script>

<template lang="html">
    <ToolTemplate
        :title="$t(name)"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="tool-quick-response-code"
            >
                {{ $t(text) }}
            </div>
        </template>
    </ToolTemplate>
</template>
