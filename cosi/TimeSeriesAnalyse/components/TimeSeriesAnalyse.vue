<script>
// Documentation in ./doc/TimeSeries.md
import Tool from "../../../../src/modules/tools/ToolTemplate.vue";
import {getComponent} from "../../../../src/utils/getComponent";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersTimeSeriesAnalyse";
import mutations from "../store/mutationsTimeSeriesAnalyse";
import store from "../../../../src/app-store";
import {Circle as CircleStyle, Fill, Stroke, Style} from "ol/style.js";
import BarchartItem from "../../../../src/share-components/charts/components/BarchartItem.vue";
import LinechartItem from "../../../../src/share-components/charts/components/LinechartItem.vue";
import PiechartItem from "../../../../src/share-components/charts/components/PiechartItem.vue";

export default {
    name: "TimeSeriesAnalyse",
    components: {
        BarchartItem,
        LinechartItem,
        PiechartItem,
        Tool
    },
    data () {
        return {
            features: [],
            isChartActive: false,
            barChartData: false,
            lineChartData: false,
            pieChartData: false,
            chartGivenOptions: {},
            firstYear: 1980,
            secondYear: 2022,
            interval: null
        };
    },
    computed: {
        ...mapGetters("Language", ["currentLocale"]),
        ...mapGetters("Tools/TimeSeriesAnalyse", Object.keys(getters))
    },
    watch: {
        firstYear (value) {
            this.filterFeature(value, this.firstYearLayer, this.firstYearStyle, this.features, this.layerId, this.key);
        },
        secondYear (value) {
            this.filterFeature(value, this.secondYearLayer, this.secondYearStyle, this.features, this.layerId, this.key);
        },
        active (val) {
            if (val) {
                this.setFeatures();
            }
        }
    },
    mounted () {
        this.sliderInstance = this.min;
    },
    async created () {
        this.$on("close", this.close);
        this.min = this.yearRange[0];
        this.max = this.yearRange[1];
        this.firstYearLayer = await store.dispatch("Maps/addNewLayerIfNotExists", {layerName: "timeSeriesyear1"}, {root: true});
        this.secondYearLayer = await store.dispatch("Maps/addNewLayerIfNotExists", {layerName: "timeSeriesyear2"}, {root: true});
        this.firstYearStyle = new Style({
            image: new CircleStyle({
                radius: 10,
                fill: new Fill({
                    color: [0, 153, 255, 1]
                }),
                stroke: new Stroke({
                    color: [0, 0, 0, 1],
                    width: 2
                })
            })
        });
        this.secondYearStyle = new Style({
            image: new CircleStyle({
                radius: 6,
                fill: new Fill({
                    color: [225, 0, 25, 1]
                }),
                stroke: new Stroke({
                    color: [0, 0, 0, 1],
                    width: 2
                })
            })
        });
    },
    methods: {
        ...mapMutations("Tools/TimeSeriesAnalyse", Object.keys(mutations)),
        /**
         * Closes the tool window
         * @returns {void}
         */
        close () {
            this.setActive(false);
            this.barChartData = false;
            this.lineChartData = false;
            this.pieChartData = false;

            const model = getComponent(this.id);

            if (model) {
                model.set("isActive", false);
            }
        },
        /**
         * Filters the feature with key
         * @param {String} year - the year
         * @param {ol/layer} layer - the created layer
         * @param {ol/style/Style} style - the layer style
         * @param {ol/Feature[]} features the features of the layer
         * @param {String} layerId - the layer Id
         * @param {String|String[]} key - the year as key to be filtered
         * @returns {void}
         */
        filterFeature (year, layer, style, features, layerId, key) {
            if (typeof year !== "string" || typeof layer === "undefined" || !features.length) {
                return;
            }

            if (typeof layerId === "string") {
                const originLayer = mapCollection.getMap("2D").getLayers().getArray().find(l => l.get("id") === layerId);

                if (typeof originLayer !== "undefined") {
                    originLayer.setVisible(false);
                    Radio.request("ModelList", "getModelByAttributes", {id: this.layerId}).setIsSelected(false);
                }
            }
            else if (Array.isArray(layerId)) {
                layerId.forEach(id => {
                    const originLayer = mapCollection.getMap("2D").getLayers().getArray().find(l => l.get("id") === id);

                    if (typeof originLayer !== "undefined") {
                        originLayer.setVisible(false);
                        Radio.request("ModelList", "getModelByAttributes", {id: id}).setIsSelected(false);
                    }
                });
            }

            let featureData = [];

            layer.getSource().clear();

            if (typeof key === "string") {
                featureData = features.filter(feature => {
                    return feature.get(key) === Number(year);
                });
            }
            else if (Array.isArray(key) && key.length) {
                key.forEach(k => {
                    featureData = features.filter(feature => {
                        return feature.get(k) === Number(year);
                    });
                });
            }

            layer.getSource().addFeatures(featureData);
            layer.setStyle(style);
        },
        /**
         * Sets the features
         * @returns {void}
         */
        setFeatures () {
            if (typeof this.layerId !== "string" && (!Array.isArray(this.layerId) || !this.layerId.length)) {
                console.error("Please add the layer Id in config");
                return;
            }
            if (typeof this.layerId === "string") {
                const layer = mapCollection.getMap("2D").getLayers().getArray().find(l => l.get("id") === this.layerId);

                if (typeof layer === "undefined") {
                    console.warn("Please activate the configured layer with id " + this.layerId + " in tree");
                }
                else {
                    this.features = this.features.concat(layer.getSource().getFeatures());
                }
            }
            else if (Array.isArray(this.layerId)) {
                this.layerId.forEach(id => {
                    const layer = mapCollection.getMap("2D").getLayers().getArray().find(l => l.get("id") === id);

                    if (typeof layer === "undefined") {
                        console.warn("Please activate the configured layer with id " + id + " in tree");
                    }
                    else {
                        this.features = this.features.concat(layer.getSource().getFeatures());
                    }
                });
            }
        },
        /**
         * Opens the bar chart
         * @param {String} typ - the chart typ
         * @returns {void}
         */
        openChart (typ) {
            if (typ === "bar") {
                if (this.barChartData) {
                    this.barChartData = false;
                    return;
                }
                this.barChartData = this.getCountsForChart(typ, this.key, this.statisKey, this.firstYear, this.secondYear, this.count, this.features);
                this.chartGivenOptions = this.getGivenOptions(typ, this.statiskey);
                this.lineChartData = false;
                this.pieChartData = false;
            }
            else if (typ === "line") {
                if (this.lineChartData) {
                    this.lineChartData = false;
                    return;
                }
                this.lineChartData = this.getCountsForChart(typ, this.key, this.statisKey, this.firstYear, this.secondYear, this.count, this.features);
                this.chartGivenOptions = this.getGivenOptions(typ, this.statiskey);
                this.barChartData = false;
                this.pieChartData = false;
            }
            else if (typ === "pie") {
                if (this.pieChartData) {
                    this.pieChartData = false;
                    return;
                }
                this.pieChartData = this.getCountsForChart(typ, this.key, this.statisKey, this.firstYear, this.secondYear, this.count, this.features);
                this.chartGivenOptions = this.getGivenOptions(typ, this.statiskey);
                this.barChartData = false;
                this.lineChartData = false;
            }
        },
        /**
         * Gets the given options of chart
         * @param {String} typ - the chart typ
         * @param {String|String[]} statiskey - the property as key for chart
         * @returns {Object} the given option of chart
         */
        getGivenOptions (typ, statiskey) {
            let options = {
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: this.$t("additional:modules.tools.cosi.timeSeriesAnalyse.featureCount")
                        }
                    }]
                }
            };

            if (typeof statiskey === "undefined" || statiskey === "" || (Array.isArray(statiskey) && !statiskey.length)) {
                if (typ === "line") {
                    options = {
                        scales: {
                            yAxes: [{
                                scaleLabel: {
                                    display: true,
                                    labelString: this.$t("additional:modules.tools.cosi.timeSeriesAnalyse.featureCount")
                                }
                            }]
                        },
                        elements: {
                            line: {
                                fill: false
                            }
                        }
                    };
                }
                else if (typ === "pie") {
                    options = {
                        legend: {
                            display: false
                        },
                        scales: {
                            yAxes: [{
                                scaleLabel: {
                                    display: true,
                                    labelString: this.$t("additional:modules.tools.cosi.timeSeriesAnalyse.featureCount")
                                }
                            }]
                        }
                    };
                }
            }

            return options;
        },
        /**
         * Gets the count for chart
         * @param {String} typ - the chart typ
         * @param {String|String[]} key - the year as key to be filtered
         * @param {String|String[]} statiskey - the property as key for chart
         * @param {String} firstYear - the first year
         * @param {String} secondYear - the second year
         * @param {NUmber} count the counts to be shown in chart
         * @param {ol/Feature[]} features the features of the layer
         * @returns {Object} the data for chart
         */
        getCountsForChart (typ, key, statiskey, firstYear, secondYear, count, features) {
            let data, finalCount;

            if (typeof count !== "number" || count <= 0) {
                return undefined;
            }

            if (count >= Math.abs(secondYear - firstYear)) {
                finalCount = Math.abs(secondYear - firstYear);
            }
            else {
                finalCount = count;
            }

            if (typeof statiskey === "undefined" || statiskey === "" || (Array.isArray(statiskey) && !statiskey.length)) {
                data = this.getCountsOfFeatures(typ, Math.max(firstYear, secondYear), finalCount, key, features);
            }
            else {
            //    data = this.getDataForChart(statiskey, Math.max(firstYear, secondYear), finalCount, key, features);
            }

            return data;
        },
        /**
         * Gets the counts of features
         * @param {String} typ - the chart typ
         * @param {String} year - the larger year
         * @param {NUmber} count the counts to be shown in chart
         * @param {String|String[]} key - the year as key to be filtered
         * @param {ol/Feature[]} features the features of the layer
         * @returns {Object} the counts of features
         */
        getCountsOfFeatures (typ, year, count, key, features) {
            const totalCount = [];

            for (let i = 0; i <= count; i++) {
                if (typeof key === "string") {
                    totalCount[i] = features.filter(feature => {
                        return Number(feature.get(key)) === (year - i);
                    }).length;
                }
                else if (Array.isArray(key) && key.length) {
                    key.forEach(k => {
                        totalCount[i] += features.filter(feature => {
                            return Number(feature.get(k)) === (year - i);
                        }).length;
                    });
                }
            }

            return {
                datasets: [{
                    backgroundColor: "#57A845",
                    data: totalCount.reverse(),
                    label: this.$t("additional:modules.tools.cosi.timeSeriesAnalyse.count"),
                    borderColor: typ === "pie" ? "#ffffff" : "#57A845"
                }],
                labels: this.getLabels(count, year)
            };
        },
        /**
         * Gets the counts of features
         * @param {NUmber} count the counts to be shown in chart
         * @param {String} year - the larger year
         * @returns {String[]} the labels in string
         */
        getLabels (count, year) {
            const labels = [];

            for (let i = count; i >= 0; i--) {
                labels.push(year - i);
            }

            return labels;
        },
        /**
         * Gets the data for chart
         * @param {String|String[]} statiskey - the property as key for chart
         * @param {String} year - the second year
         * @param {Number} finalCount the counts to be shown in chart
         * @param {String|String[]} key - the year as key to be filtered
         * @param {ol/Feature[]} features the features of the layer
         * @returns {Object} the counts of features

        getDataForChart (statiskey, year, finalCount, key, features) {

        }
        */

        /**
         * Plays the slider
         * @returns {void}
         */
        playSlider () {
            this.interval = setInterval(() => {
                this.firstYear++;
                this.firstYear = this.firstYear.toString();
                if (this.firstYear >= this.max) {
                    clearInterval(this.interval);
                    this.firstYear = this.max;
                    this.pauseSlider();
                }
            }, 250); // adjust the interval to control the speed of movement
        },
        /**
         * Stops the slider
         * @returns {void}
         */
        pauseSlider () {
            clearInterval(this.interval);
            this.interval = null;
        },
        /**
         * Toggles the slider
         * @returns {void}
         */
        toggleIsPlaying () {
            if (!this.interval) {
                this.playSlider();
            }
            else {
                this.pauseSlider();
            }
        },
        /**
         * Decrements the slider
         * @returns {void}
         */
        decrementSlider () {
            if (this.firstYear > this.min) {
                this.firstYear--;
                this.firstYear = this.firstYear.toString();
            }
            clearInterval(this.interval);
        },
        /**
         * Increments the slider
         * @returns {void}
         */
        incrementSlider () {
            if (this.firstYear < this.max) {
                this.firstYear++;
                this.firstYear = this.firstYear.toString();
            }
            clearInterval(this.interval);
        }
    }
};
</script>

<template lang="html">
    <Tool
        :id="id"
        :title="$t('additional:modules.tools.cosi.timeSeriesAnalyse.title')"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
        class="time-series"
    >
        <template #toolBody>
            <div
                v-if="barChartData"
                class="chart"
            >
                <BarchartItem
                    :data="barChartData"
                    :given-options="chartGivenOptions"
                />
            </div>
            <div
                v-if="lineChartData"
                class="chart"
            >
                <LinechartItem
                    :data="lineChartData"
                    :given-options="chartGivenOptions"
                />
            </div>
            <div
                v-if="pieChartData"
                class="chart"
            >
                <PiechartItem
                    :data="pieChartData"
                    :given-options="chartGivenOptions"
                />
            </div>
            <div class="animation-button">
                <button
                    @click="decrementSlider()"
                >
                    <v-icon
                        v-model="firstYear"
                        :min="min"
                    >
                        mdi-skip-previous
                    </v-icon>
                </button>
                <button
                    @click="toggleIsPlaying()"
                >
                    <v-icon
                        v-if="!interval"
                    >
                        mdi-play
                    </v-icon>
                    <v-icon
                        v-else
                    >
                        mdi-pause
                    </v-icon>
                </button>
                <button
                    @click="incrementSlider()"
                >
                    <v-icon
                        v-model="firstYear"
                    >
                        mdi-skip-next
                    </v-icon>
                </button>
            </div>
            <div
                id="app"
                class="slider-range"
            >
                <label
                    for="firstYear"
                >{{ firstYear }}</label>
                <div>
                    <input
                        id="firstYear"
                        v-model="firstYear"
                        class="slider-1"
                        name="firstYear"
                        type="range"
                        step="1"
                        :min="min"
                        :max="max"
                    >
                    <div class="sliderticks">
                        <p /> <p /> <p /> <p /> <p /> <p /> <p /> <p /> <p />
                        <p /> <p /> <p /> <p /> <p /> <p /> <p /> <p /> <p />
                    </div>
                </div>
                <label
                    for="secondYear"
                >{{ secondYear }}</label>
                <div>
                    <input
                        id="secondYear"
                        v-model="secondYear"
                        class="slider-2"
                        name="secondYear"
                        type="range"
                        step="1"
                        :min="min"
                        :max="max"
                    >
                    <div class="sliderticks">
                        <p /> <p /> <p /> <p /> <p /> <p /> <p /> <p /> <p />
                        <p /> <p /> <p /> <p /> <p /> <p /> <p /> <p /> <p />
                    </div>
                </div>
            </div>
            <div class="icons-function">
                <span>
                    <i
                        class="bi bi-bar-chart-fill"
                        @click="openChart('bar')"
                        @keydown="openChart('bar')"
                    />
                </span>
                <span>
                    <i
                        class="bi bi-line"
                        @click="openChart('line')"
                        @keydown="openChart('line')"
                    />
                </span>
                <span>
                    <i
                        class="bi bi-pie-chart"
                        @click="openChart('pie')"
                        @keydown="openChart('pie')"
                    />
                </span>
            </div>
        </template>
    </Tool>
</template>

<style lang="scss" scoped>
.time-series.tool-window-vue{
    bottom: 20px;
    min-width: 600px;
    top: inherit;
}
* {
    box-sizing: border-box;
}

.animation-button {
    float: left;
    height: 80px;
    margin-top: 40px;
    margin-right: 20px;
    button {
        i {
            font-size: 30px;
        }
    }
}

.slider-range {
    width: calc(100% - 250px);
    float: left;
}

.slider {
    &:hover{
        opacity: 1;
    }
}

.slider-1 {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 3px;
    background: #000000;
    outline: none;
    opacity: 0.7;
    -webkit-transition: .2s;
    transition: opacity .2s;
}

.slider-1::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 15px;
    height: 15px;
    background: #007FFF;
    cursor: pointer;
}

.slider-1::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: #007FFF;
    cursor: pointer;
}

.slider-2 {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 3px;
    background: #000000;
    outline: none;
    opacity: 0.7;
    -webkit-transition: .2s;
    transition: opacity .2s;
}

.slider-2::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 15px;
    height: 15px;
    background: #eb0000;
    cursor: pointer;
}

.slider-2::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: #eb0000;
    cursor: pointer;
}

.sliderticks {
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
}

.sliderticks p {
    position: relative;
    display: flex;
    justify-content: center;
    text-align: center;
    width: 2px;
    background: #D3D3D3;
    height: 10px;
    line-height: 40px;
    margin: 0 0 20px 0;
}

.track {
    pointer-events: none;
    height: 100%;
}

.thumb {
    cursor: pointer;
    border-color: #333;
    border-style: solid;
    background-color: #0f4534;
    background-color: rgba(100, 100, 100, 1);
    border-radius: 5%;
    position: absolute;
}
.output {
    pointer-events: none;
    margin: 0;
    width: 30px;
    height: 30px;
    line-height: 30px;
    border-radius: 50% 50% 0 50%;
    background-color: #0000ff;
    text-align: center;
    -webkit-transform: rotate(45deg);
    -moz-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
    position: absolute;
    top: -45px;
}
.output p {
    pointer-events: none;
    font-size: 14px;
    color: #0a1a17;
    text-align: center;
    -webkit-transform: rotate(-45deg);
    -moz-transform: rotate(-45deg);
    -ms-transform: rotate(-45deg);
    transform: rotate(-45deg);
}
.icons-function {
    float: right;
    height: 80px;
    margin-top: 30px;
    span {
        cursor: pointer;
        i {
            font-size: 40px;
        }
    }
}
</style>
