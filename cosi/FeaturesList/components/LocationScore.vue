<script>
import ToolInfo from "../../components/ToolInfo.vue";
import LayerWeights from "./LocationScoreWeights.vue";
import {mapGetters, mapActions} from "vuex";
import deepEqual from "deep-equal";

export default {
    name: "LocationScore",
    components: {
        ToolInfo,
        LayerWeights
    },
    props: {
        facilities: {
            type: Array,
            required: true
        },
        // umbenennen layer group oder so
        groupedLayer: {
            type: Array,
            required: true
        }
    },
    data () {
        return {
            facilityQueue: [],
            showWeightsDialog: false,
            selectedLayerOptions: [],
            disableChartButtons: true
        };
    },
    computed: {
        ...mapGetters("Tools/DistrictSelector", {extent: "extent"}),
        ...mapGetters("Tools/DistanceScoreService", ["wmsLayersInfo"]),

        scoringIsOngoing () {
            return this.facilityQueue.length !== 0;
        },

        progressValue () {
            if (this.facilityQueue.length && this.facilities.length) {
                return Math.round(100 - this.facilityQueue.length / this.facilities.length * 100);
            }
            return 0;
        },

        selectedFeatureLayers () {
            return this.selectedLayerOptions.filter(l=>l.group !== "Wms Layers");
        },
        selectedWmsLayers () {
            return this.selectedLayerOptions.filter(l=>l.group === "Wms Layers");
        }
    },

    watch: {
        facilities: {
            handler: function (newItems, oldItems) {
                if (!deepEqual(newItems.map(i=>i.key), oldItems.map(i=>i.key))) {
                    this.updateDistanceScores();
                }
                if (typeof newItems[0]?.distanceScore !== "undefined") {
                    this.disableChartButtons = false;
                }
            },
            deep: true
        },

        extent: "updateDistanceScores"

    },
    methods: {
        ...mapActions("Tools/DistanceScoreService", ["getDistanceScore", "getFeatureValues"]),

        layerOptions () {
            let layerOptions = [];

            this.groupedLayer.forEach(group => {
                const layerList = this.getLayer(group.layer, group.group);

                layerOptions.push({header: group.group});
                layerOptions = layerOptions.concat(layerList);
            });

            for (const l of this.wmsLayersInfo) {
                layerOptions.push({header: "Wms Layers"});
                layerOptions = layerOptions.concat({...l, id: l.name, layerId: l.id, group: "Wms Layers"});
            }

            return layerOptions;
        },
        // extent layer mit der group vlt schon beim mapping??
        getLayer (layers, group) {
            const allLayers = [];

            layers.forEach(layer => {
                allLayers.push({
                    id: layer.id,
                    layerId: layer.layerId,
                    // url: rawLayer.url, // wird wahrscheinlich nicht benötigt
                    group: group,
                    weighting: 1
                    // featureType: rawLayer.featureType // wird wahrscheinlich nicht benötigt
                });
            });

            return allLayers;
        },

        setSelectedLayerOptions (value) {
            this.selectedLayerOptions = value;
        },
        updateShowWeightsDialog (value) {
            this.showWeightsDialog = value;
            // wenn dialog geschlossen wird scoring starten?
        },
        showDistanceScoresForSelected () {
            this.$emit("showDistanceScoresForSelected", this.selectedFeatureLayers);
        },
        showDistanceScoreHistogram () {
            this.$emit("showDistanceScoreHistogram", this.selectedFeatureLayers);
        },

        setFacilityQueue (facilities) {
            this.facilityQueue = facilities.map(item=>{
                const ret = {...item};

                delete ret.weightedDistanceScores;
                delete ret.distanceScore;
                return ret;
            });
        },

        async updateDistanceScores () {
            if (this.facilities && this.facilities.length) {
                const items = [];

                this.setFacilityQueue(this.facilities);

                while (this.facilityQueue.length) {
                    const item = this.facilityQueue.shift();

                    if (this.selectedFeatureLayers.length > 0) {
                        const ret = await this.getDistanceScore({feature: item.feature, layerIds: this.selectedFeatureLayers.map(l=>l.layerId),
                            weights: this.selectedFeatureLayers.map(l=>l.weighting),
                            extent: this.extent ? this.extent : undefined});

                        item.weightedDistanceScores = ret;
                        item.distanceScore = ret !== null ? ret.score.toFixed(1) : "na";
                        delete item.weightedDistanceScores.score;
                    }
                    for (const layer of this.selectedWmsLayers) {
                        const value = await this.getFeatureValues({feature: item.feature, layerId: layer.layerId});

                        item[layer.name] = value;
                    }

                    items.push(item);
                }

                this.$emit("updateItems", items);
            }
        }
    }
};
</script>

<template>
    <v-card
        outlined
        rounded="0"
        class="mb-4"
    >
        <v-progress-linear
            v-if="progressValue > 0"
            :value="progressValue"
            height="25"
        >
            <strong>{{ progressValue }}%</strong>
        </v-progress-linear>
        <v-card-title>
            {{ $t('additional:modules.tools.cosi.featuresList.titleLocationScore') }}
        </v-card-title>
        <v-card-text>
            <ToolInfo
                :summary="'Die Entfernung (Fußweg) zur nächstgelegenen ausgewählten Einrichtung wird berechnet. Werden mehrere Einrichtungen ausgewählt, wird die Entfernung gemittelt.'"
            />
            <v-row
                dense
            >
                <v-autocomplete
                    id="selectedDistanceScoreLayers"
                    class="rounded-0"
                    :value="selectedLayerOptions"
                    :items="layerOptions()"
                    :label="$t('additional:modules.tools.cosi.featuresList.distanceScoreLayerLabel')"
                    outlined
                    :disabled="scoringIsOngoing"
                    dense
                    item-text="id"
                    return-object
                    hide-details
                    chips
                    clearable
                    deletable-chips
                    multiple
                    small-chips
                    @input="setSelectedLayerOptions"
                />
            </v-row>
        </v-card-text>
        <v-card-actions>
            <v-btn
                class="ml-1"
                depressed
                :disabled="scoringIsOngoing || selectedLayerOptions.length === 0"
                tile
                color="grey lighten-1"
                @click.native="updateDistanceScores"
            >
                Berechnung starten
            </v-btn>
            <v-btn
                depressed
                :disabled="scoringIsOngoing || selectedLayerOptions.length < 2"
                tile
                color="grey lighten-1"
                @click.native="updateShowWeightsDialog(true)"
            >
                {{ $t('additional:modules.tools.cosi.featuresList.weighting') }}
            </v-btn>
            <v-btn
                depressed
                :disabled="disableChartButtons"
                tile
                color="grey lighten-1"
                :title="$t('additional:modules.tools.cosi.featuresList.distanceScoreChartTooltip')"
                @click.native="showDistanceScoresForSelected"
            >
                <v-icon>mdi-radar</v-icon>
            </v-btn>
            <v-btn
                depressed
                :disabled="disableChartButtons"
                tile
                color="grey lighten-1"
                :title="$t('additional:modules.tools.cosi.featuresList.distanceScoreHistogramTooltip')"
                @click.native="showDistanceScoreHistogram"
            >
                <v-icon>mdi-chart-histogram</v-icon>
            </v-btn>
        </v-card-actions>
        <LayerWeights
            :is-visible="showWeightsDialog"
            :layers="selectedFeatureLayers"
            @updateShowWeightsDialog="updateShowWeightsDialog"
        />
    </v-card>
</template>

<style lang="scss" scoped>
</style>
