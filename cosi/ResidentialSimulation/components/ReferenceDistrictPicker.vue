<script>
import {Select} from "ol/interaction";
import {mapActions, mapGetters} from "vuex";
import getAvailableYears from "../../utils/getAvailableYears";
import groupMapping from "../../utils/groupMapping";

export default {
    name: "ReferenceDistrictPicker",
    props: {
        groupsList: {
            type: Array,
            required: false,
            default: () => []
        },
        timelinePrefix: {
            type: String,
            required: false,
            default: "jahr_"
        }
    },
    data: () => ({
        select: null,
        referencePickerActive: false,
        workingDistrictLevel: null,
        selectedStatsFeature: null,
        layer: null
    }),
    computed: {
        ...mapGetters("Map", ["map", "layerById"]),
        ...mapGetters("Tools/DistrictSelector", ["districtLevels", "selectedDistrictLevel", "mapping"]),

        statsMapping () {
            return groupMapping(this.mapping);
        }
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
            if (this.referencePickerActive) {
                this.unlisten();
                this.listen();
            }
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
        ...mapActions("Tools/DistrictSelector", ["getStatsByDistrict"]),
        ...mapActions("Alerting", ["addSingleAlert"]),

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
                    id: feature.getId(),
                    districtLevel: this.workingDistrictLevel
                }),
                baseStats = this.processStats(
                    feature.get(this.workingDistrictLevel.keyOfAttrName),
                    this.workingDistrictLevel.label,
                    stats,
                    "Bevölkerung insgesamt"
                );

            if (baseStats) {
                this.$emit("pickReference", baseStats);
            }

            this.referencePickerActive = false;
        },

        /**
         * @todo ONLY PROTOTYPE!!!! refactor
         * @param {String} districtName -
         * @param {String} districtLevel -
         * @param {module:ol/Feature[]} statsFeatures -
         * @param {String} basePopulationProp -
         * @returns {Object} - the base stats for the picked reference district
         */
        processStats (districtName, districtLevel, statsFeatures, basePopulationProp) {
            if (!statsFeatures) {
                this.alertError();
                return null;
            }
            const stats = statsFeatures.map(feature => feature.getProperties()),
                years = getAvailableYears(statsFeatures),
                latestYear = this.timelinePrefix + years[0],
                populationStats = this.groupsList.length > 0 ? this.mapping.filter(mappingObj => this.groupsList.includes(mappingObj.group)) : this.mapping,
                basePopulationFeature = statsFeatures.find(feature => feature.get("kategorie") === basePopulationProp),
                basePopulation = parseFloat(basePopulationFeature.get(latestYear)),
                baseStats = {
                    reference: {
                        districtName,
                        districtLevel
                    },
                    absolute: [],
                    relative: []
                };

            for (const mappingObj of populationStats) {
                const datum = stats.find(d => d.kategorie === mappingObj.value);
                let value;

                if (mappingObj.valueType === "absolute") {
                    const refValue = parseFloat(datum[latestYear]);

                    /**
                     * @todo Das ist sehr unschön... wir müssen uns da was schlaues überlegen,
                     * aber so hard-coded, reingehackt ist das super statisch und nicht skalierbar
                     * Eine Idee wäre den Referenzwert auch in der mapping.json zu hinterlegen...
                     */
                    if (mappingObj.value.includes("Frauen")) {
                        value = refValue / stats.find(d => d.kategorie === "Bevölkerung weiblich")[latestYear];
                    }
                    else if (mappingObj.value.includes("Männer")) {
                        value = refValue / stats.find(d => d.kategorie === "Bevölkerung männlich")[latestYear];
                    }
                    else {
                        value = refValue / basePopulation;
                    }
                }
                else {
                    value = parseFloat(datum[latestYear]);
                }

                baseStats[mappingObj.valueType].push({
                    group: datum.group,
                    category: datum.kategorie,
                    value: value,
                    valueType: mappingObj.valueType
                });
            }

            return baseStats;
        },

        alertError () {
            this.addSingleAlert({
                category: "Warnung",
                content: this.$t("additional:modules.tools.cosi.residentialSimulation.errorPickReference"),
                displayClass: "warning"
            });
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
        <!-- TODO: Combine with CompareDistricts/DistrictQuery -->
        <!-- <v-row>
            <v-col cols="12">
                <v-select
                    v-model="selectedStatsFeature"
                    :items="statsMapping"
                    item-text="value"
                    return-object
                    :label="$t('additional:modules.tools.cosi.residentialSimulation.statsFeatures')"
                    :title="$t('additional:modules.tools.cosi.residentialSimulation.showStatsFeatures')"
                    append-icon="mdi-chart-box"
                />
            </v-col>
        </v-row> -->
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
