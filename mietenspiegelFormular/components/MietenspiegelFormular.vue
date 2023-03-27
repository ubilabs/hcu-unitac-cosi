<script>
import ToolTemplate from "../../../src/modules/tools/ToolTemplate.vue";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersMietenspiegelFormular";
import mutations from "../store/mutationsMietenspiegelFormular";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import {getFeatureGET} from "../../../src/api/wfs/getFeature";
import {WFS} from "ol/format.js";

export default {
    name: "MietenspiegelFormular",
    components: {
        ToolTemplate
    },
    data () {
        return {
        };
    },
    computed: {
        ...mapGetters("Tools/MietenspiegelFormular", Object.keys(getters))
    },
    async created () {
        this.METADATA = await this.getFeatureProperties(this.layerIdMetadata);

        this.$on("close", () => {
            this.setActive(false);
        });
    },
    methods: {
        ...mapMutations("Tools/MietenspiegelFormular", Object.keys(mutations)),

        /**
         * Gets the properties of a feature from a layer.
         * @param {String} layerId - The id of the layer.
         * @param {Number} index - The index of the feature.
         * @return {Object|Boolean} The feature properties or false if the layer id is not given.
         */
        async getFeatureProperties (layerId, index = 0) {
            if (typeof layerId !== "string") {
                return false;
            }
            const rawLayer = rawLayerList.getLayerWhere({id: layerId}),
                response = await getFeatureGET(rawLayer.url, {version: rawLayer.version, featureType: rawLayer.featureType}),
                wfsReader = new WFS({version: rawLayer.version}),
                metaDataFeature = wfsReader.readFeatures(response)[index];

            return metaDataFeature.getProperties();
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
    >
        <template
            v-if="active"
            #toolBody
        >
            <div class="mietenspiegel-formular">
                Test
            </div>
        </template>
    </ToolTemplate>
</template>

<style>

</style>
