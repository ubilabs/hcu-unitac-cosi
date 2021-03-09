<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import Dropdown from "../../../../src/share-components/dropdowns/DropdownSimple.vue";
import prepareDistrictLevels from "../utils/prepareDistrictLevels";
import calculateExtent from "../../utils/calculateExtent.js";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersDistrictSelector";
import mutations from "../store/mutationsDistrictSelector";
import {DragBox, Select} from "ol/interaction";
import {singleClick} from "ol/events/condition";
import {Fill, Stroke, Style} from "ol/style.js";

export default {
    name: "DistrictSelector",
    components: {
        Tool,
        Dropdown
    },
    data () {
        return {
            // The current id of the selected district level
            selectedLevelId: "",
            // A buffer for the extent of the selected district(s)
            bufferValue: 0,
            // css class for the drag box button
            dragBoxButtonClass: "btn-lgv-grey"
        };
    },
    computed: {
        ...mapGetters("Tools/DistrictSelector", Object.keys(getters)),
        ...mapGetters("Map", ["layerList"]),

        /**
         * Gets the options for the dropdown. The layerId for the value and the label for the text content.
         * @returns {Object} The options.
         */
        optionsDropdown: function () {
            const obj = {};

            this.districtLevels.forEach(district => {
                obj[district.layerId] = district.label;
            });

            return obj;
        }
    },

    watch: {
        /**
         * If the tool is active, activate the select interaction.
         * If the tool is not actvie, deactivate the interactions (select, drag box)
         * and update the extent of the selected features (districts).
         * @param {boolean} newActive - Defines if the tool is active.
         * @returns {void}
         */
        active (newActive) {
            if (newActive) {
                this.select.setActive(true);
            }
            else {
                this.updateExtent();
                this.dragBox.setActive(false);
                this.select.setActive(false);
            }
        },

        /**
         * Every time the list of layers of the map (computed property Map/layerList) changes the function prepareDistricts is called.
         * @param {module:ol/layer[]} newLayerList - An array of layers.
         * @returns {void}
         */
        layerList: function (newLayerList) {
            prepareDistrictLevels(this.districtLevels, newLayerList);
        },

        selectedDistrictsCollection: "transferFeatures",
        selectedDistrictLevel: "clearFeatures",
        selectedLevelId: "changeSelectedDistrictLevel"
    },
    created () {
        this.$on("close", () => {
            this.setActive(false);
        });
        prepareDistrictLevels(this.districtLevels, this.layerList);
        this.selectedLevelId = this.districtLevels[0].layerId;
        this.setNonReactiveData();
    },

    methods: {
        ...mapMutations("Tools/DistrictSelector", Object.keys(mutations)),
        ...mapActions("Alerting", ["addSingleAlert"]),
        ...mapActions("Map", ["addInteraction", "removeInteraction", "zoomTo"]),

        /**
         * Remove all features from the features collection of the select interaction.
         * @returns {void}
         */
        clearFeatures () {
            this.select.getFeatures().clear();
        },

        /**
         * Sets the district level to the given id.
         * @param {String} id - The layer id of the selected district lelvel.
         * @returns {void}
         */
        changeSelectedDistrictLevel (id) {
            const districtLevel = this.getDistrictLevelById(id);

            this.setSelectedDistrictLevel(districtLevel);
        },

        /**
         * Gets the selected district level to the given id.
         * @param {String} layerId - The layer id of the selected district level.
         * @returns {Object} The selected district level.
         */
        getDistrictLevelById (layerId) {
            return this.districtLevels.find(district => {
                return district.layerId === layerId;
            });
        },


        /**
         * Registers listener for drag box interaction events.
         * On "boxend" all features that intersect the box are added to the feature collection.
         * On "boxstart" calls the clearFeatures function.
         * @param {module:ol/interaction/DragBox} dragBox - Interaction for drawing a vector box.
         * @param {String} selectedLevleId - Id of the selected district level.
         * @param {module:ol/Collection} featureCollection - The feature collection of the select interaction.
         * @returns {void}
         */
        registerDragBoxListener (dragBox, selectedLevleId, featureCollection) {
            dragBox.on("boxend", (evt) => {
                const extent = evt.target.getGeometry().getExtent(),
                    source = this.getDistrictById(selectedLevleId).layer.getSource();

                source.forEachFeatureIntersectingExtent(extent, (feature) => {
                    featureCollection.push(feature);
                });
            });

            dragBox.on("boxstart", () => this.clearFeatures());
        },

        /**
         * Registers listener for the feature collection of the select interaction.
         * On "change:length" (add or remove a feautre to/from the collection) the names of the selected districts are saved to the store.
         * @param {module:ol/Collection} featureCollection - The feature collection of the select interaction.
         * @returns {void}
         */
        registerFeatureCollectionListener (featureCollection) {
            featureCollection.on("change:length", (evt) => {
                this.setSelectedDistrictsCollection(evt.target);
            });
        },

        /**
         * Shows an alert message.
         * @param {String} content - The content of the message.
         * @param {String} [category="Info"] - The category (Info, Warnung, Error) of the message.
         * @param {String} [cssClass="info"] - The style (info, warning, error) of the message.
         * @returns {void}
         */
        showAlert (content, category = "Info", cssClass = "info") {
            this.addSingleAlert({
                category: category,
                content: content,
                displayClass: cssClass
            });
        },

        /**
         * Sets all needed non reactive data.
         * @returns {void}
         */
        setNonReactiveData () {
            // select interaction
            this.select = new Select({
                // select only features of the selected district level
                filter: (feature, layer) => layer.get("id") === this.selectedLevelId,
                style: new Style({
                    fill: new Fill({color: "rgba(255, 255, 255, 0)"}),
                    stroke: new Stroke({color: "#3399CC", width: 5})
                }),
                addCondition: singleClick,
                removeCondition: singleClick
            });
            this.registerFeatureCollectionListener(this.select.getFeatures());
            this.addInteraction(this.select);

            // drag box interaction
            this.dragBox = new DragBox();
            this.dragBox.setActive(false);
            this.registerDragBoxListener(this.dragBox, this.selectedLevleId, this.select.getFeatures());
            this.addInteraction(this.dragBox);
        },

        /**
         * Activates/deactivates the dragbox interaction and toggles the css class for the drag box button.
         * @returns {void}
         */
        toggleDragBox () {
            if (this.dragBox.getActive()) {
                this.dragBox.setActive(false);
                this.dragBoxButtonClass = "btn-lgv-grey";
            }
            else {
                this.dragBox.setActive(true);
                this.dragBoxButtonClass = "btn-primary";
            }
        },

        /**
         * If the collection are set outside this component,
         * the features of this collection are transferred to the feature collection of the select interaction.
         * Then the updateExtent function is called.
         * Otherwise nothing else happens.
         * @param {module:ol/Collection} featureCollection - The feature collection of the select interaction.
         * @returns {void}
         */
        transferFeatures (featureCollection) {
            if (featureCollection.get("fromExternal")) {
                this.select.getFeatures().clear();
                featureCollection.forEach(feature => {
                    this.select.getFeatures().push(feature);
                });
                this.updateExtent();
            }
        },

        /**
         * Sets the extent and zoom to it, if not empty.
         * If the extent is empty (this means no features are selected), a warning appears.
         * @returns {void}
         */
        updateExtent () {
            const extent = calculateExtent(this.selectedFeatures, this.bufferValue);

            if (extent) {
                this.setExtent(extent);
                this.zoomTo(extent);
            }
            else {
                this.showAlert(this.$t("additional:modules.tools.districtSelector.warning"), "Warnung", "warning");
            }
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t('additional:modules.tools.districtSelector.title')"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template
            v-if="active"
            v-slot:toolBody
        >
            <form>
                <div class="form-group">
                    <label>{{ $t('additional:modules.tools.districtSelector.dropdownLabel') }}</label>
                    <Dropdown
                        v-model="selectedLevelId"
                        :options="optionsDropdown"
                    />
                </div>
                <div class="form-group">
                    <label>{{ $t('additional:modules.tools.districtSelector.dropdownInput') }}</label>
                    <input
                        v-model="bufferValue"
                        class="form-control"
                        type="number"
                        step="250"
                        min="0"
                    >
                    <p class="help-block">
                        {{ $t('additional:modules.tools.districtSelector.explaination') }}
                    </p>
                </div>
                <button
                    class="btn btn-lgv-grey"
                    type="button"
                    @click="setActive(false);"
                >
                    {{ $t('additional:modules.tools.districtSelector.buttonConfirm') }}
                </button>
                <button
                    class="btn btn-lgv-grey"
                    type="button"
                    @click="clearFeatures"
                >
                    {{ $t('additional:modules.tools.districtSelector.buttonReset') }}
                </button>
                <button
                    type="button"
                    class="btn"
                    title="Auswahlrechteck zeichnen"
                    :class="[dragBoxButtonClass]"
                    @click="toggleDragBox"
                >
                    <span class="glyphicon glyphicon-pencil" />
                </button>
                <button
                    type="button"
                    class="btn btn-lgv-grey"
                    title="Info"
                    @click="showAlert(info.DistrictSelector.help)"
                >
                    <span class="glyphicon glyphicon-question-sign" />
                </button>
            </form>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
    form {
        max-width: 420px;;
            .help-block {
                margin-top: 5px;
                font-size: 12px;
            }
    }
</style>

<style lang="less">
    .ol-dragbox {
        background-color: rgba(255, 255, 255, 0.4);
        border-color: rgba(51, 153, 204, 1);
        border-width: 1.25
    }
</style>
