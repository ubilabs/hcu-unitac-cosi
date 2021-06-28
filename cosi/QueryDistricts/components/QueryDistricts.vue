<script>
import {mapGetters} from "vuex";
import Tool from "../../../../src/modules/tools/Tool.vue";
import getters from "../store/gettersQueryDistricts";

export default {
    name: "QueryDistricts",
    components: {
        Tool
    },
    data () {
        return {
        };
    },
    computed: {
        ...mapGetters("Tools/QueryDistricts", Object.keys(getters))
        // ...mapGetters("Map", ["map", "getOverlayById"]),
        // ...mapGetters("MapMarker", ["markerPoint", "markerPolygon"]),
        // ...mapGetters("Tools/DistrictSelector", ["extent", "boundingGeometry"]),
        // ...mapGetters("Tools/FeaturesList", ["isFeatureDisabled"])
    },
    watch: {
    },
    /**
    * @returns {void}
    */
    created () {
        this.$on("close", this.close);
    },
    /**
   * Put initialize here if mounting occurs after config parsing
   * @returns {void}
   */
    async mounted () {
        this.applyTranslationKey(this.name);
    },
    methods: {
        // ...mapActions("Alerting", ["addSingleAlert", "cleanup"]),
        // ...mapMutations("Tools/AccessibilityAnalysis", Object.keys(mutations)),
        // ...mapMutations("Map", ["setCenter"]),
        // ...mapActions("MapMarker", ["placingPointMarker", "removePointMarker"]),
        // ...mapActions("GraphicalSelect", ["featureToGeoJson"]),
        // ...mapActions("Map", ["createLayer"]),
        // ...mapActions("Alerting", ["addSingleAlert", "cleanup"]),
        // ...methods,



        /**
        * Closes this tool window by setting active to false
        * @returns {void}
        */
        close () {
            this.setActive(false);
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t('additional:modules.tools.cosi.queryDistricts.title')"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
            <div
                v-if="active"
                id="queryDistricts"
            >
            </div>
        </template>
    </Tool>
</template>

<style lang="less">
#accessibilityanalysis {
  width: 400px;
  min-height: 100px;
}
.isochrones {
  margin-top: 10px;
}
.dropdown-info {
  margin-bottom: 5px;
}
.snackbar-text{
    color: black
}
</style>
