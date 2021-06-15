<script>
import {Select} from "ol/interaction";
import {mapActions, mapGetters} from "vuex";

export default {
    name: "ReferenceDistrictPicker",
    props: {
    },
    data: () => ({
        select: null,
        referencePickerActive: false,
        referenceFeature: null,
        clusteredFeatures: [],
        showClusteredFeaturePicker: false,
        workingDistrictLevel: null,
        selectedStatsFeature: null
    }),
    computed: {
        ...mapGetters("Map", ["map", "layerById"]),
        ...mapGetters("Tools/DistrictSelector", ["districtLevels", "selectedDistrictLevel"]),
        ...mapGetters("Tools/DistrictLoader", ["mapping"])
    },
    watch: {
        /**
         * Watches the referencePickerActive boolean,
         * triggers the listen/unlisten methods
         * @param {Boolean} state the state of the referencePickerActive boolean
         * @returns {void}
         */
        referencePickerActive (state) {
            if (state) {
                this.listen();
                this.$emit("referencePickerActive");
            }
            else {
                this.unlisten();
            }
        },

        /**
         * Sets the OpenLayers map layer from the workingLayer object as the current layer
         * @returns {void}
         */
        workingDistrictLevel () {
            this.layer = this.layerById(this.workingDistrictLevel?.layerId)?.olLayer;
        }
    },

    /**
     * Selects the selectedDistrictLevel as default
     * @returns {void}
     */
    mounted () {
        this.workingDistrictLevel = this.selectedDistrictLevel;
    },

    /**
     * Deactivate the map interaction when tool is closed forcefully
     * @returns {void}
     */
    beforeDestroy () {
        this.unlisten();
    },
    methods: {
        ...mapActions("Tools/DistrictLoader", ["getAllFeaturesByAttribute", "getStatsByDistrict"]),

        /**
         * Toggles the Select interaction boolean on/off
         * @returns {void}
         */
        togglePickReference () {
            this.referencePickerActive = !this.referencePickerActive;
        },

        /**
         * Activates the OpenLayers Select interaction
         * @returns {void}
         */
        listen () {
            this.select = new Select({
                layers: [this.layer],
                style: null
            });

            console.log(this.layer, this.select);

            this.map.addInteraction(this.select);
            this.select.on("select", this.pickReference.bind(this));
        },

        /**
         * Deactivates the OpenLayers Select interaction
         * @returns {void}
         */
        unlisten () {
            this.map.removeInteraction(this.select);
            this.select = null;
        },


        /**
         * Pick a feature as reference on map click
         * @param {Event} evt The OpenLayers Select event
         * @returns {void}
         */
        async pickReference (evt) {
            const feature = evt.selected[0],
                stats = await this.getStatsByDistrict({
                    districtFeature: feature,
                    districtLevel: this.workingDistrictLevel
                });

            console.log(feature, stats);

            if (feature) {
                this.$emit("pickReference", feature);
            }

            this.referencePickerActive = false;
        }
    }
};
</script>

<template>
    <v-form>
        <v-row>
            <v-col cols="12">
                <v-select
                    v-model="workingDistrictLevel"
                    :items="districtLevels"
                    item-text="label"
                    return-object
                    :label="$t('additional:modules.tools.cosi.districtSelector.districtLevel')"
                    :title="$t('additional:modules.tools.cosi.districtSelector.districtLevel')"
                    append-icon="mdi-layers"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-select
                    v-model="selectedStatsFeature"
                    :items="mapping"
                    item-text="value"
                    return-object
                    :label="$t('additional:modules.tools.cosi.residentialSimulation.statsFeatures')"
                    :title="$t('additional:modules.tools.cosi.residentialSimulation.showStatsFeatures')"
                    append-icon="mdi-chart-box"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-btn
                    tile
                    depressed
                    :color="referencePickerActive ? 'warning' : ''"
                    :title="$t('additional:modules.tools.cosi.residentialSimulation.pickReference')"
                    @click="togglePickReference"
                >
                    <v-icon>mdi-eyedropper</v-icon>
                    <span>
                        {{ $t('additional:modules.tools.cosi.residentialSimulation.pickReference') }}
                    </span>
                </v-btn>
            </v-col>
        </v-row>
    </v-form>
</template>

<style lang="less" scoped>
</style>
