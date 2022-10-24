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
import {getModelByAttributes} from "../../utils/radioBridge.js";
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
            hoverLayerSource: new VectorSource(),
            extendedOptions: [],
            mergeable: false,
            selectionsToMerge: []
        };
    },
    computed: {
        ...mapGetters("Tools/SelectionManager", Object.keys(getters)),
        ...mapGetters("Language", ["currentLocale"]),
        ...mapGetters("Tools/ColorCodeMap", ["upperEdge"]),
        ...mapGetters("Tools/DistrictSelector", ["name", "selectedDistrictLevel", "selectedFeatures", "label", "keyOfAttrName", "keyOfAttrNameStats", "loadend", "metadataUrls", "boundingGeometry"]),
        ...mapGetters("Maps", ["getVisibleLayerList"]),
        ...mapGetters("Tools/FeaturesList", ["activeVectorLayerList", {facilitiesMapping: "mapping"}]),
        dashboardOpen () {
            return this.$store.getters["Tools/Dashboard/active"] || this.$store.getters["Tools/FeaturesList/active"];
        },
        selectionGroups () {
            return [... new Set(this.selections.map(selection => selection.source).sort())];
        },
        activeLayerList () {
            return this.activeVectorLayerList.map(layer => layer.getProperties().name);
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

        const hoverLayer = new VectorLayer({
            name: "selection_manager_hover_layer",
            source: this.hoverLayerSource,
            style: new Style({
                fill: new Fill({
                    color: "rgba(214, 187, 47, 0.1)"
                })
            })
        });

        this.map.addLayer(hoverLayer);
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
                this.setActiveSelection(index);
                if (this.selections[index].storedLayers.length > 0) {
                    this.setStoredLayersActive(this.selections[index].storedLayers);
                }
                if (this.selections[index].settings.bufferActive) {
                    this.rerenderSelection(index);
                }
                else {

                    //  remove layers from selection manager
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
            }
            else {
                this.removeLayer();
                this.setActiveSelection(null);
            }
        },
        rerenderSelection (index) {
            if (this.activeSelection === index) {
                this.map.getLayers().getArray().filter(layer => layer.get("name") === "selection_manager").forEach(layer => this.map.removeLayer(layer));

                const vectorSource = new VectorSource({
                        features: this.selections[index].bufferedSelection
                    }),
                    layer = new VectorLayer({
                        name: "selection_manager",
                        source: vectorSource,
                        style: new Style({
                            fill: new Fill({
                                color: "rgba(214, 187, 47, 0.35)"
                            }),
                            stroke: new Stroke({
                                color: "#D6B62F",
                                width: 3
                            })
                        })
                    });

                layer.setZIndex(9999);
                this.map.addLayer(layer);

                setBBoxToGeom.call(this, getBoundingGeometry(this.selections[index].bufferedSelection));
            }
        },
        hoverSelection (index) {
            this.map.getLayers().getArray().filter(layer => layer.get("name") === "selection_manager_hover_layer").forEach(layer => this.map.removeLayer(layer));

            const vectorSource = new VectorSource({
                    features: this.selections[index].selection
                }),
                layer = new VectorLayer({
                    name: "selection_manager_hover_layer",
                    source: vectorSource,
                    style: new Style({
                        fill: new Fill({
                            color: "rgba(214, 96, 93, 0.2)"
                        })
                    })
                });

            layer.setZIndex(9999);
            this.map.addLayer(layer);
        },
        resetHovers () {
            this.map.getLayers().getArray().filter(layer => layer.get("name") === "selection_manager_hover_layer").forEach(layer => this.map.removeLayer(layer));
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
            //  inverse the stored layers to get the theme data layers that are about to hideflat().filter(layer => !storedLayers.includes(layer.id)),
            this.activeVectorLayerList.forEach(layer => {
                const layerId = layer.getProperties().id,
                    model = getModelByAttributes({type: "layer", id: layerId});

                if (model) {
                    model.set("isSelected", false);
                }
            });

            storedLayers.forEach(layerName => {
                const model = getModelByAttributes({type: "layer", name: layerName});

                if (model) {
                    model.set("isSelected", true);
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
            if (this.selections[index].settings.bufferActive) {
                this.selections[index].settings.bufferActive = false;
                if (this.activeSelection === index) {
                    this.highlightSelection(index);
                }
            }
            else {
                this.selections[index].settings.bufferActive = true;
                const newGeometry = getBoundingGeometry(this.selections[index].selection, this.selections[index].settings.buffer),
                    transformedPolygons = [];

                newGeometry.getGeometries().forEach(geometry => {
                    transformedPolygons.push(new Feature(geometry));
                });

                this.selections[index].bufferedSelection = transformedPolygons;
                this.rerenderSelection(index);
            }
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
        },
        indicateMergeSelections () {
            if (this.activeSelection !== null && this.selections.length > 1) {
                this.mergeable = true;
            }
            else {
                this.mergeable = false;
            }
        },
        addMergedSelection (index) {
            this.selectionsToMerge.push(this.selections[index].selection);
            const flatArray = this.selectionsToMerge.flat();

            this.addNewSelection({selection: flatArray, source: this.$t("additional:modules.tools.cosi.selectionManager.title"), id: this.$t("additional:modules.tools.cosi.selectionManager.mergedSelections") + " (" + this.selectionsToMerge.length + ")"});
            this.mergeable = false;
            this.selectionsToMerge = [];
            this.highlightSelection(this.selections.length - 1);
        },
        mergeSelections (index) {
            this.selectionsToMerge.push(this.selections[index].selection);
        }
    }
};
</script>

<template lang="html">
    <div
        v-if="!dashboardOpen && selections.length > 0 && activeVectorLayerList.length > 0"
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
            :class="{
                open: openAddon,
                mergeHover: mergeable
            }"
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
                                    :class="{
                                        extended: extendedOptions.includes(i),
                                        hoverHighlight: mergeable && activeSelection !== i
                                    }"
                                    @mouseenter.exact="hoverSelection(i)"
                                    @mouseover.exact="hoverSelection(i)"
                                    @mouseleave="resetHovers"
                                    @focusin.ctrl="indicateMergeSelections"
                                    @focusout="resetHovers"
                                    @mouseover.ctrl="indicateMergeSelections"
                                    @click.ctrl="mergeSelections(i)"
                                    @keyup.ctrl.exact="addMergedSelection(i)"
                                >
                                    <p>{{ selection.id }}</p>
                                    <ul
                                        class="function_buttons"
                                    >
                                        <button
                                            class="view_btn"
                                            :class="{
                                                highlight: activeSelection === i,
                                                scaledHighlight: selection.settings.bufferActive,
                                            }"
                                            @click.exact="highlightSelection(i)"
                                        >
                                            <v-icon>mdi-eye-outline</v-icon>
                                        </button>
                                        <button
                                            v-if="selectionsToMerge.length > 0 && activeSelection === i"
                                            class="combine_btn"
                                            @click.exact="addMergedSelection(i)"
                                        >
                                            <v-icon>mdi-vector-combine</v-icon>
                                        </button>
                                        <button
                                            class="freeze_btn"
                                            :class="{highlight: selection.storedLayers.length > 0}"
                                            :title="selection.storedLayers.join(', ')"
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
                                            <v-icon>mdi-tools</v-icon>
                                        </button>
                                        <button
                                            class="remove_btn"
                                            @click="removeSelection(i)"
                                        >
                                            <v-icon>mdi-close</v-icon>
                                        </button>
                                    </ul>
                                    <div class="extended_options">
                                        <v-slider
                                            v-model="selection.settings.buffer"
                                            max="2500"
                                            min="-2500"
                                            step="10"
                                        />
                                        <button
                                            class="activate_btn"
                                            :class="{highlight: selection.settings.bufferActive}"
                                            @click="polygonChange(i)"
                                        >
                                            <v-icon>mdi-selection-drag</v-icon>
                                        </button>
                                    </div>
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

                &.mergeHover {
                    background:rgba(255,255,255,0.85);
                    backdrop-filter:blur(5px);
                    outline:2px solid $masterportal_blue;
                }

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
                            overflow:hidden;
                            transition:0.15s;

                            &.hoverHighlight {
                                &:hover {
                                    cursor:pointer;
                                    background:#D6605D;
                                    border:1px solid #222;;
                                    z-index:10;
                                    transform:scale(1.01);
                                    transition:0.15s;

                                    p {
                                        color:white;
                                    }
                                }
                            }

                            &.extended {
                                height:70px;
                            }

                            .extended_options {
                                    display:flex;
                                    flex-flow:row wrap;
                                    justify-content:flex-end;
                                    height:40px;
                                    padding:5px;
                                    flex:1 0 100%;
                                    box-sizing:border-box;

                                    button.activate_btn {
                                        flex-basis:20px;
                                        height:20px;
                                        background:#424242;
                                        margin:5px 0px 0px 5px;

                                        &.highlight {
                                            background:#D6B62F;
                                        }

                                        .v-icon {
                                            color:whitesmoke;
                                            font-size:16px;
                                        }
                                    }

                                    .v-input__slider {
                                        height:30px;
                                        width:110px;
                                        flex:0 0 110px;

                                        .v-slider__thumb:before {
                                            display:none;
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
                                            background:#D6605D;

                                            &.scaledHighlight {
                                                background:#D6B62F;

                                                .v-icon {
                                                    color:#222;
                                                }
                                            }

                                            &:hover {
                                                filter:invert(0);
                                            }
                                        }
                                    }

                                    &.combine_btn {
                                        background:$brightred;

                                        .v-icon {
                                            color:whitesmoke;
                                        }

                                        &:hover {
                                            border:1px solid $brightred;
                                            background:whitesmoke;

                                            .v-icon {
                                                color:$brightred;
                                            }
                                        }
                                    }

                                    &.freeze_btn {
                                        &.highlight {
                                            background:$masterportal_blue;
                                        }
                                    }

                                    &.option_btn {
                                        &.highlight {
                                            background:whitesmoke;
                                            border:1px solid #222;

                                            .v-icon {
                                                color:#222;
                                            }
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
