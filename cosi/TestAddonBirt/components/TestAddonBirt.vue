<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersVueAddon";
import mutations from "../store/mutationsVueAddon";

export default {
    name: "TestAddonBirt",
    components: {
        // Tool
    },
    data () {
        return {
            featuresSelected: []
        };
    },
    computed: {
        ...mapGetters("Tools/TestAddonBirt", Object.keys(getters)),
    },
    watch: {
        featuresSelected () {
            console.log("features are selected", this.featuresSelected);
        }
    },
    created () {
        // this.$on("close", this.close);
    },
    /**
     * Put initialize here if mounting occurs after config parsing
     * @returns {void}
     */
    mounted () {
        Radio.on("SelectDistrict", "selectionChanged", this.updateBla);
        this.applyTranslationKey(this.name);
    },
    methods: {
        ...mapMutations("Tools/TestAddonBirt", Object.keys(mutations)),
        updateBla () {
            this.featuresSelected = Radio.request("SelectDistrict", "getSelector", "getSelectedDistricts");
            
        }

        /**
         * Closes this tool window by setting active to false
         * @returns {void}
         */
        // close () {
        //     this.setActive(false);

        //     // TODO replace trigger when Menu is migrated
        //     // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
        //     // else the menu-entry for this tool is always highlighted
        //     const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.testAddonBirt.id});

        //     if (model) {
        //         model.set("isActive", false);
        //     }
        // }
    }
};
</script>

<template lang="html">
    <div
        v-if="featuresSelected.length"
        class="test"
    >
        <!--<Tool
            :title="$t(name)"
            :icon="glyphicon"
            :active="active"
            :render-to-window="renderToWindow"
            :resizable-window="resizableWindow"
            :deactivateGFI="deactivateGFI"
        >
            <template v-slot:toolBody>
            </template>
        </Tool>-->

        <div
            id="tab-addon"
        >
            {{ $t("additional:modules.tools.TestAddonBirt.content") }}
        </div>
    </div>
</template>

<style lang="less">
    .test {
        position:fixed;
        z-index:5000;
        left:10px;
        bottom:10px;
        width:300px;
        height:120px;
        background:white;
    }
</style>
