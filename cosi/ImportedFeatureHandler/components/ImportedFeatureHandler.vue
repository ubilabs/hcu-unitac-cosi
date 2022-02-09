<script>
import getComponent from "../../../../src/utils/getComponent";
import {mapGetters, mapMutations} from "vuex";
import getters from "../../cosiFileImport/store/gettersCosiFileImport";
import mutations from "../../cosiFileImport/store/mutationsCosiFileImport";

export default {
    name: "ImportedFeatureHandler",
    components: {
    },
    data () {
        return {
            featureActive: false,
            importedLayerIds: [],
            importedFeatures: [],
            importedFeaturesFull: [],
            openFeature: {},
            featureClicked: false
        };
    },
    computed: {
        ...mapGetters("Tools/CosiFileImport", Object.keys(getters)),
        ...mapGetters("Map", {layerIds: "layerIds", layers: "layers", map: "ol2DMap"}),
        ...mapGetters("Tools/DistrictSelector", ["selectedFeatures"])
    },
    watch: {
        newLayerInformation (payload) {
            this.importedLayerIds.push(payload.id);
            payload.features.forEach(feature => {
                this.importedFeatures.push(feature.ol_uid);
                this.importedFeaturesFull.push(feature);
            });

            this.showHideSelectedDistricts();
        },
        updateLayerStyles () {
            if (this.importedLayerIds.length) {
                this.showHideSelectedDistricts();
            }
        },
        selectedFeatures () {
            if (this.importedLayerIds.length) {
                this.showHideSelectedDistricts();
            }
        }
    },
    created () {
        // this.$on("close", this.close);
    },
    mounted () {
        // this.map.addEventListener("click", this.onClick);
        // this.map.on("pointermove", (evt) => {
        //     this.checkHover(evt);
        // });
    },
    methods: {
        ...mapMutations("Tools/CosiFileImport", Object.keys(mutations)),
        showHideSelectedDistricts () {
            const layerArray = this.importedLayerIds
                .map(layerId => Radio.request("ModelList", "getModelByAttributes", {id: layerId}))
                .filter(layer => Boolean(layer));

            if (this.selectedFeatures.length > 0) {
                layerArray.forEach(layer => {
                    if (layer) {
                        const layerSource = layer.get("layerSource"),
                            allFeatures = layer.get("features"),
                            featuresToShow = [];

                        allFeatures.forEach(feature => {
                            const featureGeometry = feature.getGeometry().getExtent(),
                                match = this.selectedFeatures.find(district => district.getGeometry().intersectsExtent(featureGeometry));

                            if (match) {
                                featuresToShow.push(feature);
                            }

                        });

                        layerSource.clear();
                        layerSource.addFeatures(featuresToShow);
                        Radio.trigger("VectorLayer", "resetFeatures", layer.get("id"), allFeatures);

                    }
                });
            }
            else {
                layerArray.forEach(layer => {
                    const layerSource = layer.get("layerSource"),
                        allFeatures = layer.get("features");

                    layerSource.clear();
                    layerSource.addFeatures(allFeatures);
                    Radio.trigger("VectorLayer", "resetFeatures", layer.get("id"), allFeatures);
                });
            }
        },
        close () {
            this.setActive(false);
            const model = getComponent(this.id);

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};
</script>

<template lang="html">
    <div
        v-if="featureClicked"
        id="ifh"
        class="imported-file-handler"
    >
        <div class="wrapper">
            {{ openFeature._values }}
        </div>
    </div>
</template>


<style lang="scss">
    @import "../../utils/variables.scss";

    #ifh-popup {
        position: fixed;
        padding:20px;
        max-width:300px;
        box-sizing: border-box;
        background:white;
        @include drop_shadow();
    }
</style>

