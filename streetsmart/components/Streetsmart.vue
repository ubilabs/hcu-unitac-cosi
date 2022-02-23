<script>

import {mapGetters, mapActions, mapMutations} from "vuex";
import getComponent from "../../../src/utils/getComponent";
import ToolTemplate from "../../../src/modules/tools/ToolTemplate.vue";
import getters from "../store/gettersStreetsmart";
import mutations from "../store/mutationsStreetsmart";
import loadPackages from "../utils/loadPackages";

export default {
    name: "Streetsmart",
    components: {
        ToolTemplate
    },
    computed: {
        ...mapGetters("Tools/Streetsmart", Object.keys(getters)),
        ...mapGetters("Map", ["clickCoord"])
    },
    watch: {
        active (value) {
            if (value) {
                this.$nextTick(() => {
                    this.initApi();
                });
            }
            else {
                this.close();
            }
        },
        clickCoord (newCoord, lastCoord) {
            if (newCoord !== lastCoord) {
                this.setPosition(newCoord);
            }
        }
    },
    created () {
        loadPackages(this.streetsmartAPIVersion, this.reactVersion);
        this.$on("close", this.close);
    },

    methods: {
        ...mapMutations("Tools/Streetsmart", Object.keys(mutations)),
        ...mapActions("Tools/Streetsmart", ["initApi", "setPosition"]),

        close () {
            this.setActive(false);
            const model = getComponent("streetsmart");

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
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
        :initial-width="initialWidth"
    >
        <template #toolBody>
            <div id="streetsmart" />
        </template>
    </ToolTemplate>
</template>

<style lang="scss">
    @import "~/css/mixins.scss";
	#streetsmart{
		height: 84vh;
	}
</style>
