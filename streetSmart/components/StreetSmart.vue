<script>

import {mapGetters, mapActions, mapMutations} from "vuex";
import getComponent from "../../../src/utils/getComponent";
import ToolTemplate from "../../../src/modules/tools/ToolTemplate.vue";
import getters from "../store/gettersStreetSmart";
import mutations from "../store/mutationsStreetSmart";
import loadPackages from "../utils/loadPackages";

export default {
    name: "StreetSmart",
    components: {
        ToolTemplate
    },
    computed: {
        ...mapGetters("Tools/StreetSmart", Object.keys(getters)),
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
        ...mapMutations("Tools/StreetSmart", Object.keys(mutations)),
        ...mapActions("Tools/StreetSmart", ["initApi", "setPosition", "destroyApi"]),

        close () {
            const model = getComponent("streetsmart");

            this.destroyApi();
            this.setActive(false);
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
            <div
                v-if="active"
                id="streetsmart"
            />
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
#streetsmart{
    height: 84vh;
}
</style>
