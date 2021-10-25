<script>
import getComponent from "../../../../src/utils/getComponent";
import {mapGetters, mapMutations} from "vuex";
import getters from "../../cosiFileImport/store/gettersCosiFileImport";
import mutations from "../../cosiFileImport/store/mutationsCosiFileImport";
import {Style} from "ol/style.js";

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
        ...mapGetters("Map", ["layerIds", "layers", "map"]),
        ...mapGetters("Tools/DistrictSelector", ["selectedFeatures"])
    },
    watch: {
        newLayerInformation (payload) {
            this.importedLayerIds.push(payload.id);
            payload.features.forEach(feature => {
                this.importedFeatures.push(feature.ol_uid);
                this.importedFeaturesFull.push(feature);
            });

            this.checkSelectedDistricts();
        },
        updateLayerStyles () {
            this.checkSelectedDistricts();
        },
        selectedFeatures () {
            this.checkSelectedDistricts();
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
        checkSelectedDistricts () {
            if (this.selectedFeatures.length > 0) {
                this.importedFeaturesFull.forEach(feature => {
                    const featureGeometry = feature.getGeometry().getExtent(),

                        match = this.selectedFeatures.find(district => district.getGeometry().intersectsExtent(featureGeometry));

                    if (match) {
                        const originalStyle = feature.get("originalStyle");

                        if (originalStyle !== "undefined") {
                            feature.setStyle(originalStyle);
                        }

                    }
                    else {
                        const emptyStyle = new Style({});

                        feature.setStyle(emptyStyle);
                    }
                });
            }
            else {
                this.importedFeaturesFull.forEach(feature => {
                    const originalStyle = feature.get("originalStyle");

                    feature.setStyle(originalStyle);
                });
            }

            this.setUpdateLayerStyles = false;
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


<style lang="less">
    @import "../../utils/variables.less";

    #ifh-popup {
        position: fixed;
        padding:20px;
        max-width:300px;
        box-sizing: border-box;
        background:white;
        .drop_shadow();
    }
</style>

