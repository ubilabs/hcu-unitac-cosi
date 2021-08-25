<script>
import getComponent from "../../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
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
            importedLayers: [],
            importedFeatures: [],
            importedFeaturesFull: [],
            openFeature: {},
            featureClicked: false
        };
    },
    computed: {
        ...mapGetters("Tools/CosiFileImport", Object.keys(getters)),
        ...mapGetters("Map", ["layerIds", "layers", "map"]),
        ...mapGetters("Tools/DistrictSelector", ["selectedFeatures"]),
    },
    watch: {
        newLayerInformation (payload) {
            this.importedLayers.push(payload.id)
            payload.features.forEach(feature => {
                this.importedFeatures.push(feature.ol_uid);
                this.importedFeaturesFull.push(feature);
            });

            this.checkSelectedDistricts();
        },
        updateLayerStyles(){
            this.checkSelectedDistricts();
        },
        selectedFeatures(){
            this.checkSelectedDistricts();
        }
    },
    created () {
        this.$on("close", this.close);
    },
    mounted () {
        console.log("not working, is it");
        this.map.addEventListener('click', this.onClick);
        this.map.on("pointermove", (evt) => {
            this.checkHover(evt);
        });
    },
    methods: {
        ...mapMutations("Tools/CosiFileImport", Object.keys(mutations)),
        onClick(evt){
            if(!this.featureClicked){
                Radio.request("Map", "getMap").forEachFeatureAtPixel(evt.pixel, (feature) => {
                    if(this.importedFeatures.includes(feature.ol_uid)){
                        this.openFeature = feature;
                        this.featureClicked = true;
                        this.openInfo(evt.pixel[0], evt.pixel[1]);
                    }
                });
            } else {
                const popup = document.getElementById("ifh-popup");
                popup.parentNode.removeChild(popup);
                this.openFeature = {};
                this.featureClicked = false;
            }
        },
        checkHover(evt){
            const hit = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => {
                if(this.importedFeatures.includes(feature.ol_uid)){
                    return true;
                }
            }); 
            
            this.map.getViewport().style.cursor = hit ? 'pointer' : '';
        },
        openInfo(x, y){
            const popup = document.createElement("div");
            const toolManager = document.getElementsByClassName('tool-manager');
            const aNode = toolManager[0];

            popup.id = "ifh-popup";
            popup.style.position = "fixed";
            popup.style.left = x + "px";
            popup.style.top = y + "px";
            popup.innerHTML = JSON.stringify(this.openFeature.getProperties());

            aNode.append(popup);
        },
        checkSelectedDistricts(){
            if(this.selectedFeatures.length > 0) {
                this.importedFeaturesFull.forEach(feature => {
                    const featureGeometry = feature.getGeometry().getExtent();

                    const match = this.selectedFeatures.find(district => district.getGeometry().intersectsExtent(featureGeometry));
                    
                    if(match) {
                            const originalStyle = feature.get("originalStyle");

                            if(originalStyle !== "undefined" || originalStyle !== empty){
                                feature.setStyle(originalStyle);
                            }

                        } else {
                            const emptyStyle = new Style ({});
                            feature.setStyle(emptyStyle);
                        }
                });
            } else {
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
        },
    }
}
</script>
<template lang="html">
    <div id="ifh" class="imported-file-handler" v-if="featureClicked">
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

