<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import getters from "../store/gettersSelectionManager";
import mutations from "../store/mutationsSelectionManager";
import actions from "../store/actionsSelectionManager";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import getBoundingGeometry from "../../utils/getBoundingGeometry.js";
import setBBoxToGeom from "../../utils/setBBoxToGeom.js";
import ToolInfo from "../../components/ToolInfo.vue";
import * as turf from "@turf/turf";
import {GeoJSON} from "ol/format";
import Feature from "ol/Feature";
import {Fill, Stroke, Style} from "ol/style.js";

export default {
    name: "SelectionManager",
    components: {
        ToolInfo
    },
    data () {
        return {
            openAddon: false,
            extendedOptions: []
        };
    },
    computed: {
        ...mapGetters("Tools/SelectionManager", Object.keys(getters)),
        ...mapGetters("Language", ["currentLocale"]),
        ...mapGetters("Tools/ColorCodeMap", ["upperEdge"]),
        ...mapGetters("Tools/DistrictSelector", ["name", "selectedDistrictLevel", "selectedFeatures", "label", "keyOfAttrName", "keyOfAttrNameStats", "loadend", "metadataUrls", "boundingGeometry"]),
        ...mapGetters("Maps", ["getVisibleLayerList"]),
        ...mapGetters("Tools/FeaturesList", {facilitiesMapping: "mapping"}),
        dashboardOpen () {
            return this.$store.getters["Tools/Dashboard/active"] || this.$store.getters["Tools/FeaturesList/active"];
        },
        selectionGroups () {
            return [... new Set(this.selections.map(selection => selection.source).sort())];
        },
        activeLayerList () {
            const layerNames = this.getVisibleLayerList.map(layer => layer.getProperties().name),
                activeLayers = this.facilitiesMapping.map(map => map.layer).flat().filter(layer => layerNames.includes(layer.id));

            return activeLayers.map(layer => layer.id);
        }
    },
    watch: {
        openAddon () {
            const selectionLayer = this.map.getLayers().getArray().filter(layer => layer.get("name") === "selection_manager");

            if (!this.openAddon) {
                const style = new Style({
                    stroke: new Stroke({
                        color: "#A8404E",
                        width: 4
                    })
                });

                if (selectionLayer.length > 0) {
                    selectionLayer[0].setStyle(style);
                }
            }
            else {
                const style = new Style({
                    fill: new Fill({
                        color: "rgba(214, 96, 93, 0.35)"
                    }),
                    stroke: new Stroke({
                        color: "#D6605D",
                        width: 1
                    })
                });

                if (selectionLayer.length > 0) {
                    selectionLayer[0].setStyle(style);
                }
            }
        }
    },
    created () {
        this.map = mapCollection.getMap("2D");
    },
    methods: {
        ...mapMutations("Tools/SelectionManager", Object.keys(mutations)),
        ...mapActions("Tools/SelectionManager", Object.keys(actions)),
        ...mapMutations("Maps", ["setLayerVisibility", "addLayerToMap", "removeLayerFromMap"]),
        /**
             * @description Creates VectorLayer for the chosen selection
             * @param {Integer} index - Index of the chosen selection in this.selections
             * @returns {void}
             */
        highlightSelection (index) {
            if (this.activeSelection !== index) {
                if (this.selections[index].storedLayers.length > 0) {
                    this.setStoredLayersActive(this.selections[index].storedLayers);
                }

                //  remove layers from selection manager
                this.setActiveSelection(index);
                this.map.getLayers().getArray().filter(layer => layer.get("name") === "selection_manager").forEach(layer => this.map.removeLayer(layer));

                const vectorSource = new VectorSource({
                        features: this.selections[index].selection
                    }),
                    layer = new VectorLayer({
                        name: "selection_manager",
                        source: vectorSource,
                        style: new Style({
                            fill: new Fill({
                                color: "rgba(214, 96, 93, 0.35)"
                            }),
                            stroke: new Stroke({
                                color: "#D6605D",
                                width: 3
                            })
                        })
                    });

                layer.setZIndex(9999);
                this.map.addLayer(layer);

                setBBoxToGeom.call(this, getBoundingGeometry(this.selections[index].selection, 0));
            }
            else {
                this.removeLayer();
            }
        },
        rerenderSelection (index) {
            console.log("i am trying to rerender", this.selections[index]);
            this.map.getLayers().getArray().filter(layer => layer.get("name") === "selection_manager").forEach(layer => this.map.removeLayer(layer));

            const vectorSource = new VectorSource({
                    features: this.selections[index].scaledSelection
                }),
                layer = new VectorLayer({
                    name: "selection_manager",
                    source: vectorSource,
                    style: new Style({
                        fill: new Fill({
                            color: "rgba(214, 96, 93, 0.35)"
                        }),
                        stroke: new Stroke({
                            color: "#D6605D",
                            width: 3
                        })
                    })
                });

            layer.setZIndex(9999);
            this.map.addLayer(layer);

            setBBoxToGeom.call(this, getBoundingGeometry(this.selections[index].scaledSelection, 0));
        },
        /**
             * @description Stores current layers or resets the stored layers in chosen selection
             * @param {Integer} index - Index of the chosen selection in this.selections
             * @returns {void}
             */
        storeLayers (index) {
            if (this.selections[index].storedLayers.length > 0) {
                this.selections[index].storedLayers = [];
            }
            else {
                this.selections[index].storedLayers = this.activeLayerList;
            }
        },
        /**
             * @description Sets the storedLayers from the selection active and all other theme data layers inactive
             * @param {Array} storedLayers - The names of the stored layers inside the saved selection
             * @returns {void}
             */
        setStoredLayersActive (storedLayers) {
            //  inverse the stored layers to get the theme data layers that are about to hide
            const inverseActiveLayers = this.facilitiesMapping.map(map => map.layer).flat().filter(layer => !storedLayers.includes(layer.id)),
                inverseLayerNames = inverseActiveLayers.map(layer => layer.id);

            inverseLayerNames.forEach(layerName => {
                const layerToHide = this.map.getLayers().getArray().filter(layer => layer.get("name") === layerName);
                console.log("just to test", layerToHide);
                // note this
                /*if (layerToHide.length > 0) {
                    this.removeLayerFromMap(layerToHide[0]);
                }*/

                if (layerToHide.length > 0) {
                    layerToHide[0].setVisible(false);
                }
            });

            storedLayers.forEach(layerName => {
                const layerToShow = this.map.getLayers().getArray().filter(layer => layer.get("name") === layerName);

                /*if (layerToShow.length > 0) {
                    this.addLayerToMap(layerToShow[0]);
                }*/
                
                if (layerToShow.length > 0) {
                    layerToShow[0].setVisible(true);
                }
            });
        },
        setExtendedOptions (index) {
            if (this.extendedOptions.includes(index)) {
                this.extendedOptions.splice(this.extendedOptions.indexOf(index), 1);
            }
            else {
                this.extendedOptions.push(index);
            }
        },
        polygonChange (index) {
            const newGeometry = this.transformPolygon(this.selections[index].selection, this.selections[index].settings.scale);

            this.selections[index].scaledSelection = newGeometry;
            this.rerenderSelection(index);
        },
        transformPolygon (selections, factor) {
            const format = new GeoJSON(),
                alteredGeometry = [];

            selections.forEach(selection => {
                const turfObj = format.writeGeometryObject(selection),
                    feature = turf.buffer(turfObj, factor, {units: "meters"});
                    // feature = turf.transformScale(turfObj.geometry, factor);

                if (format.readFeature(feature).getGeometry().getType() === "MultiPolygon") {
                    format.readFeature(feature).getGeometry().getPolygons().forEach(polygon => {
                        alteredGeometry.push(new Feature(polygon));
                    });
                }
                else {
                    alteredGeometry.push(format.readFeature(feature));
                }
            });

            return alteredGeometry;
        },
        /**
             * @description Removes the selection_manager layer from the map
             * @returns {void}
             */
        removeLayer () {
            this.setActiveSelection(null);
            this.map.getLayers().getArray().filter(layer => layer.get("name") === "selection_manager").forEach(layer => this.map.removeLayer(layer));
        },
        /**
             * @description Removes a single selection from the this.selections array
             * @param {Integer} index - Index of the chosen selection in this.selections
             * @returns {void}
             */
        removeSelection (index) {
            this.selections.splice(index, 1);

            if (this.selections.length === 0) {
                this.removeLayer();
            }
        }
    }
};
</script>

<template lang="html">
    <div
        v-if="!dashboardOpen && selections.length > 0 && activeLayerList.length > 0"
        id="sm"
        class="sm_addon_container"
        :style="{bottom: upperEdge + 10 + 'px'}"
    >
        <button
            id="sm_btn"
            class="addon_icon cosi_menu_btn"
            :class="{highlight: openAddon}"
            @click="openAddon = !openAddon"
        >
            <v-icon>mdi-selection-ellipse-arrow-inside</v-icon>
        </button>
        <div
            id="sm_wrapper"
            class="addon_wrapper"
            :class="{open: openAddon}"
        >
            <div class="selection_menu">
                <div class="addon_head">
                    <p>{{ $t('additional:modules.tools.cosi.selectionManager.title') }}</p>
                    <ToolInfo
                        :url="readmeUrl"
                        :locale="currentLocale"
                    />
                </div>
                <ul class="groups">
                    <li
                        v-for="(group, index) in selectionGroups"
                        :key="index"
                        class="grouplevel"
                    >
                        <div class="group_header">
                            {{ group }}
                        </div>
                        <ul class="selections">
                            <template v-for="(selection, i) in selections">
                                <li
                                    v-if="selection.source === group"
                                    :key="i"
                                    class="selectionlevel"
                                    :class="{extended: extendedOptions.includes(i)}"
                                >
                                    <p>{{ selection.id }}</p>
                                    <ul
                                        class="function_buttons"
                                    >
                                        <button
                                            class="view_btn"
                                            :class="{highlight: activeSelection === i}"
                                            @click="highlightSelection(i)"
                                        >
                                            <v-icon>mdi-eye-outline</v-icon>
                                        </button>
                                        <button
                                            class="freeze_btn"
                                            :class="{highlight: selection.storedLayers.length > 0}"
                                            @click="storeLayers(i)"
                                        >
                                            <template v-if="selection.storedLayers.length > 0">
                                                <v-icon>mdi-anchor</v-icon>
                                            </template>
                                            <template v-else>
                                                <v-icon>mdi-layers-plus</v-icon>
                                            </template>
                                        </button>
                                        <button
                                            class="option_btn"
                                            :class="{highlight: extendedOptions.includes(i)}"
                                            @click="setExtendedOptions(i)"
                                        >
                                            <v-icon>mdi-cog</v-icon>
                                        </button>
                                        <button
                                            class="remove_btn"
                                            @click="removeSelection(i)"
                                        >
                                            <v-icon>mdi-close</v-icon>
                                        </button>
                                        <div class="extended_options">
                                            <v-slider
                                                v-model="selection.settings.scale"
                                                max="5000"
                                                min="-5000"
                                                step="10"
                                            />
                                        </div>
                                        <button
                                            class="activate_btn"
                                            @click="polygonChange(i)"
                                        >
                                            <v-icon>mdi-selection-drag</v-icon>
                                        </button>
                                    </ul>
                                </li>
                            </template>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>


<style lang="scss">
    @import "../../utils/variables.scss";
        .sm_addon_container {
            position:fixed;
            z-index:5000;
            left:18px;

            .addon_icon {
                position:absolute;
                left:0;
                bottom:0;
                width:44px;
                height:36px;
                background:$buttongrey;
                border:1px solid #aaa;
                @include drop_shadow;

                .v-icon {
                    font-size:24px;
                }

                &.highlight {
                    border:1px solid $brightblue;
                    background:whitesmoke;
                }
            }

            .addon_wrapper {
                position:absolute;
                bottom:0;
                left:50px;
                width:410px;
                height:0;
                background:white;
                transition:0.3s;
                overflow:hidden;
                @include drop_shadow;

                .addon_head {
                    p {
                        font-size: 120%;
                        font-weight: 700;
                        color: black;
                        margin-left: 10px;
                        padding-top: 15px;
                        margin-bottom: -25px;
                    }
                }

                &.open {
                    height:auto;
                    overflow-y:auto;
                    overflow-x:hidden;
                    max-height:68vh;
                    transition:0.3s;
                }

                ul {
                    display:flex;
                    flex-flow:row wrap;
                    width:100%;
                    padding:0;
                    list-style:none;

                    li {
                        flex:1 0 100%;
                    }
                }

                ul.groups {
                    .group_header {
                        width:100%;
                        height:40px;
                        line-height:40px;
                        color:black;
                        font-weight:700;
                        padding-left:10px;
                        background:white;
                        border-bottom:1px solid #aaa;
                    }

                    li.grouplevel {
                    }

                    ul.selections {
                        li.selectionlevel {
                            display:flex;
                            flex-flow:row wrap;
                            flex:1 0 100%;
                            background:whitesmoke;
                            border-bottom:1px solid #ccc;
                            height:30px;
                            padding-left:20px;
                            text-align:left;
                            box-sizing:border-box;

                            &.extended {
                                height:70px;

                                .extended_options {
                                    display:flex;
                                    flex-flow:row wrap;
                                    justify-content:flex-end;
                                    height:40px;
                                    padding:5px;
                                    box-sizing:border-box;

                                    .v-icon {
                                        flex-basis:30px;
                                        color:#424242;
                                        margin-right:5px;
                                    }

                                    .v-input__slider {
                                        height:30px;
                                        width:110px;
                                        flex-basis:110px;
                                    }
                                }
                            }

                            p {
                                flex-basis:auto;
                                line-height:30px;
                            }

                            ul.function_buttons {
                                display:flex;
                                flex-flow:row wrap;
                                flex-basis:110px;
                                justify-content: flex-end;
                                padding-right: 5px;
                                margin: 0px 0px 0px auto;

                                button {
                                    flex-basis:20px;
                                    height:20px;
                                    background:#424242;
                                    margin-top:5px;
                                    margin-left:5px;

                                    &.view_btn {
                                        &.highlight {
                                            background:$brightblue;

                                            &:hover {
                                                filter:invert(0);
                                            }
                                        }
                                    }

                                    &.freeze_btn {
                                        &.highlight {
                                            background:$masterportal_blue;
                                        }
                                    }

                                    &.options_btn {
                                        background: whitesmoke;
                                        border:1px solid #222;

                                        .v-icon {
                                            color:#222;
                                        }
                                    }

                                    &.remove_btn {
                                        background:$error_red;
                                    }

                                    &:hover {
                                        outline:1px solid #222;
                                        background:whitesmoke;

                                        .v-icon {
                                            color:#222;
                                        }
                                    }

                                    .v-icon {
                                        font-size:16px;
                                        color:whitesmoke;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
</style>
