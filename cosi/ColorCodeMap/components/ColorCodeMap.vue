<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import getters from "../store/gettersColorCodeMap";
import mutations from "../store/mutationsColorCodeMap";
import utils from "../../utils";
import {Fill, Stroke, Style, Text} from "ol/style.js";
import Multiselect from "vue-multiselect";
import Info from "text-loader!./info.html";

export default {
    name: "ColorCodeMap",
    components: {
        Multiselect
    },
    data () {
        return {
            // Selected Feature
            selectedFeature: "",
            // List of available features for selected Districts
            featuresList: [],
            // Array of all available years
            availableYears: [],
            // Selected Year
            selectedYear: null,
            // Results for generating the CCM legend including colorscale values
            legendResults: [],
            // Values displayed in CCM legend
            legendValues: [],
            // Saves the last year when user changes year manually.
            lastYear: null,
            // Index in Array of selected Feature
            selectorPosition: 0,
            // Saves riginal Map Styling before ColorCodeMap changes styling
            originalStyling: null,
            // Highest Value of selected feature among all selected districts
            hiVal: null,
            // Lowest Value of selected feature among all selected districts
            loVal: null,
            // Triggers classes for minimized view
            minimize: false,
            // State of animation playing
            playState: false,
            // Playback speed of the animation
            playSpeed: 1,
            // State of names of districts visible on map
            showMapNames: false,
            // Helper Variable to force Legend Markers to rerender
            updateLegendList: 1,
            // Helper to pass data to the graph generator
            graphData: [],
            // Helper to store type of feature dataSet
            dataCategory: ""
        };
    },
    computed: {
        ...mapGetters("Tools/ColorCodeMap", Object.keys(getters)),
        ...mapGetters("Tools/DistrictSelector", ["selectedFeatures", "label", "keyOfAttrName", "keyOfAttrNameStats"]),
        ...mapGetters("Tools/DistrictLoader", ["featureList", "selectedDistrictLevel", "mapping", "currentStatsFeatures"]),
        ...mapGetters("Tools/DashboardManager", {dashboardOpen: "active"}),
        ...mapGetters("Tools/CalculateRatio", ["dataToColorCodeMap", "colorCodeMapDataSet"])
    },
    watch: {
        selectedFeatures () {
            this.graphData = [];
            this.updateLegendList += 1;
            if (this.visualizationState) {
                this.$nextTick(function () {
                    this.updateSelectedDistricts();
                });
            }
        },
        visualizationState () {
            if (!this.dataToColorCodeMap) {
                this.renderVisualization();
            }
        },
        selectedDistrictLevel: {
            deep: true,
            handler () {
                if (this.selectedDistrictLevel.features?.length > 0) {
                    this.updateSelectedDistricts();
                }
            }
        },
        playState (stateChange) {
            if (stateChange) {
                this.animationOverYears(this.playSpeed);
            }
        },
        showMapNames () {
            this.renderVisualization();
        },
        dataToColorCodeMap (newState) {
            if (newState) {
                this.renderDataFromCalculateRatio();
            }
            else {
                this.$store.commit("Tools/ColorCodeMap/setVisualizationState", false);
            }
        },
        colorCodeMapDataSet () {
            if (this.dataToColorCodeMap) {
                this.renderDataFromCalculateRatio();
            }
        }
    },
    mounted () {
        this.applyTranslationKey(this.name);
    },
    methods: {
        ...mapMutations("Tools/ColorCodeMap", Object.keys(mutations)),
        ...mapMutations("Tools/ChartGenerator", {setNewChartDataSet: "setNewDataSet"}),
        ...mapActions("Alerting", ["addSingleAlert", "cleanup"]),
        /**
         * @description Updates featuresList when selection of district changes and finds all available years for data.
         * @returns {void}
         */
        updateSelectedDistricts () {
            this.featuresList = [];
            if (this.currentStatsFeatures.length) {
                this.availableYears = utils.getAvailableYears(this.currentStatsFeatures, this.yearSelector);
                this.updateFeaturesList();
            }
        },

        /**
         * @description Gets relevant features based on MappingJson and triggers visualization.
         * @returns {void}
         */
        updateFeaturesList () {
            this.selectedFeature = this.mapping[0].value;
            this.selectedYear = this.availableYears[0];

            this.mapping.forEach(attr => {
                if (attr[this.keyOfAttrNameStats]) {
                    const findGrp = this.featuresList.find(el => el.group === attr.group);

                    if (findGrp) {
                        findGrp.data.push(attr.value);
                    }
                    else {
                        const createObj = {
                            group: attr.group,
                            data: [attr.value]
                        };

                        this.featuresList.push(createObj);
                    }
                }
            });

            this.renderVisualization();
        },
        /**
         * @description Animates data for selected feature on the map over the available years.
         * @param {String} tempo Value for animation playback speed in seconds.
         * @returns {void}
         */
        animationOverYears (tempo) {
            if (this.playState) {
                let current = this.availableYears.indexOf(this.selectedYear) - 1;

                if (current < 0) {
                    current = this.availableYears.length - 1;
                }

                setTimeout(() => {
                    window.requestAnimationFrame(() => {
                        this.selectedYear = this.availableYears[current];
                        this.renderVisualization();
                        this.animationOverYears(tempo);
                    });
                }, tempo * 1000);
            }
        },
        /**
         * @description Changes map styling based on selected feature data.
         * @returns {void}
         */
        renderVisualization () {
            this.graphData = [];
            if (this.visualizationState) {
                const results = this.currentStatsFeatures.filter(x => x.getProperties().kategorie === this.selectedFeature),
                    resultValues = results.map(x => x.getProperties()[this.yearSelector + this.selectedYear]),
                    colorScale = this.getColorsByValues(resultValues);

                this.generateDynamicLegend(results, colorScale);
                this.selectedFeatures.forEach(district => {
                    const getStyling = district.getStyle(),
                        matchResults = results.find(x => utils.unifyString(x.getProperties()[this.keyOfAttrNameStats]) === utils.unifyString(district.getProperties()[this.keyOfAttrName]));

                    if (matchResults) {
                        if (this.originalStyling === null) {
                            this.originalStyling = getStyling;
                        }

                        const styleArray = [];

                        this.prepareGraphData(matchResults);
                        getStyling.fill = new Fill({color: utils.getRgbArray(colorScale.scale(matchResults.getProperties()[this.yearSelector + this.selectedYear]), 0.75)});
                        getStyling.zIndex = 1;
                        getStyling.text = new Text({
                            font: "16px Calibri,sans-serif",
                            fill: new Fill({
                                color: [255, 255, 255]
                            }),
                            stroke: new Stroke({
                                color: [0, 0, 0],
                                width: 3
                            }),
                            text: matchResults.getProperties()[this.yearSelector + this.selectedYear] ? parseFloat(matchResults.getProperties()[this.yearSelector + this.selectedYear]).toLocaleString("de-DE") : "Keine Daten vorhanden"
                        });
                        styleArray.push(new Style(getStyling));
                        if (this.lastYear) {
                            const additionalText = new Style({
                                zIndex: 2,
                                text: new Text({
                                    font: "13px Calibri, sans-serif",
                                    fill: new Fill({
                                        color: [0, 0, 0]
                                    }),
                                    stroke: new Stroke({
                                        color: [240, 240, 240],
                                        width: 2
                                    }),
                                    text: matchResults.getProperties()[this.yearSelector + this.lastYear] ? this.lastYear + ": " + parseFloat(matchResults.getProperties()[this.yearSelector + this.lastYear]).toLocaleString("de-DE") + "  (" + parseFloat(Math.round((matchResults.getProperties()[this.yearSelector + this.lastYear] / matchResults.getProperties()[this.yearSelector + this.selectedYear]) * 100)) + "%)" : "Keine Daten vorhanden",
                                    offsetY: 25
                                })
                            });

                            styleArray.push(additionalText);
                        }
                        if (this.showMapNames) {
                            const headText = new Style({
                                zIndex: 100,
                                text: new Text({
                                    font: "16px Calibri, sans-serif",
                                    fill: new Fill({
                                        color: [0, 0, 0]
                                    }),
                                    placement: "point",
                                    backgroundFill: new Fill({
                                        color: [255, 255, 255]
                                    }),
                                    padding: [5, 10, 5, 10],
                                    text: matchResults.getProperties()[this.keyOfAttrNameStats],
                                    offsetY: -35
                                })
                            });

                            styleArray.push(headText);
                        }

                        district.setStyle(styleArray);
                    }
                });
            }
            else {
                this.selectedFeatures.forEach(district => {
                    const style = new Style({
                        fill: new Fill({color: "rgba(255, 255, 255, 0)"}),
                        stroke: new Stroke({color: "#3399CC", width: 5})
                    });

                    district.setStyle(style);
                });
            }
        },
        /**
         * @todo Generate Dynamic Legend for incoming data from CalculateRatio Component.
         * @description Renders data on map from CalculateRatio Component.
         * @returns {void}
         */
        renderDataFromCalculateRatio () {
            if (!this.visualizationState) {
                // this.$store.commit("Tools/ColorCodeMap/setVisualizationState", true);
                this.setVisualizationState(true);
            }

            const resultValues = this.colorCodeMapDataSet.map(x => {
                    return x.data;
                }),
                colorScale = this.getColorsByValues(resultValues);

            // todo generate Legend for CC Data
            this.selectedFeatures.forEach(district => {
                const getStyling = district.getStyle(),
                    matchResults = this.colorCodeMapDataSet.find(x => utils.unifyString(x.name) === utils.unifyString(district.getProperties()[this.keyOfAttrName]));

                if (matchResults) {
                    if (this.originalStyling === null) {
                        this.originalStyling = getStyling;
                    }

                    getStyling.fill = new Fill({color: utils.getRgbArray(colorScale.scale(matchResults.data), 0.75)});
                    getStyling.zIndex = 1;
                    getStyling.text = new Text({
                        font: "16px Calibri,sans-serif",
                        fill: new Fill({
                            color: [255, 255, 255]
                        }),
                        stroke: new Stroke({
                            color: [0, 0, 0],
                            width: 3
                        }),
                        text: matchResults.data ? parseFloat(matchResults.data).toLocaleString("de-DE") : "Keine Daten vorhanden"
                    });

                    district.setStyle(new Style(getStyling));
                }

            });
        },

        /**
         * @todo todo
         * @description Generates dynamic Legend in CCM based on selected feature values.
         * @param {*} results Values calculated in renderVisualization() function.
         * @param {*} colorScale color range for values from getColorsByValues() function.
         * @returns {void}
         */
        generateDynamicLegend (results, colorScale) {
            if (results.length > 1) {
                const legendDiv = document.getElementById("colorCodeMapLegend"),
                    legendMarks = document.querySelector("#legend_wrapper").children,
                    legendMarksArray = Array.from(legendMarks),
                    matchResults = results.filter(x => {
                        return this.selectedFeatures.some(y => {
                            return utils.unifyString(x.getProperties()[this.keyOfAttrNameStats]) === utils.unifyString(y.getProperties()[this.keyOfAttrName]);
                        });
                    });

                colorScale.legend.values.forEach((value, index) => {
                    if (value === "Keine Daten") {
                        colorScale.legend.colors.splice(index, 1);
                        colorScale.legend.values.splice(index, 1);
                    }
                });

                this.legendValues = [colorScale.scale(colorScale.legend.values[0]), colorScale.scale((colorScale.legend.values[colorScale.legend.values.length - 1] + colorScale.legend.values[0]) / 2), colorScale.scale(colorScale.legend.values[colorScale.legend.values.length - 1])];

                legendDiv.setAttribute("style", "background:linear-gradient(90deg," + this.legendValues[0] + "," + this.legendValues[1] + "," + this.legendValues[2] + ")");


                legendMarksArray.forEach((mark, index) => {
                    if (index > matchResults.length) {
                        mark.remove();
                    }
                    else {
                        const value = matchResults[index].getProperties()[this.yearSelector + this.selectedYear],
                            relativeValue = ((value - colorScale.legend.values[0]) * 100) / (colorScale.legend.values[colorScale.legend.values.length - 1] - colorScale.legend.values[0]),
                            pDistrict = mark.querySelector(".district"),
                            pValue = mark.querySelector(".value");

                        if (Math.round(relativeValue) === 100) {
                            mark.setAttribute("style", "left: calc(" + Math.round(relativeValue) + "% - 8px);");
                        }
                        else {
                            mark.setAttribute("style", "left: " + Math.round(relativeValue) + "%;");
                        }
                        pDistrict.innerHTML = matchResults[index].getProperties()[this.keyOfAttrNameStats] + ": ";
                        pValue.innerHTML = value;
                    }

                    this.loVal = colorScale.legend.values[0].toLocaleString("de-DE");
                    this.hiVal = colorScale.legend.values[colorScale.legend.values.length - 1].toLocaleString("de-DE");
                });
            }
        },

        /**
         * @description Calculate dynamic colors for Array based on its values.
         * @param {*} values Array of ints.
         * @returns {Object} the colorScale function(value) and the n-step legend color/value pairs.
         */
        getColorsByValues (values) {
            return Radio.request("ColorScale", "getColorScaleByValues", values, this.colorScheme);
        },
        /**
         * @description Changes selected feature with arrow buttons.
         * @param {*} value 1 or -1 for next or prev.
         * @returns {void}
         */
        changeSelector (value) {
            const index = this.mapping.map(e => e.value).indexOf(this.selectedFeature) + value;

            if (index === -1) {
                this.selectedFeature = this.mapping[this.mapping.length - 1].value;
            }
            else if (index === this.mapping.length) {
                this.selectedFeature = this.mapping[0].value;
            }
            else {
                this.selectedFeature = this.mapping[index].value;
            }
            this.renderVisualization();
        },
        /**
         * @description Shows component info as popup.
         * @returns {Void} Function returns nothing.
         */
        showInfo () {
            this.addSingleAlert({
                category: "Info",
                content: Info
            });
        },
        /**
         * @description Adjusting CCM data for Graph Generator Tool.
         * @param {Object} dataSet dataSet from renderVisualization function.
         * @returns {void}
         */
        prepareGraphData (dataSet) {
            const newDataSet = {
                label: dataSet.getProperties()[this.keyOfAttrNameStats],
                data: []
            };

            this.dataCategory = dataSet.getProperties().kategorie;
            this.availableYears.forEach(year => {
                newDataSet.data.push(dataSet.getProperties()[this.yearSelector + year]);
            });

            this.graphData.push(newDataSet);
        },
        /**
         * @description Passes data to the Chart Generator Tool.
         * @returns {Void} Function returns nothing.
         */
        loadToChartGenerator () {
            const graphObj = {
                id: "ccm",
                name: [this.keyOfAttrNameStats] + " - " + this.dataCategory,
                type: ["LineChart","BarChart"],
                color: "blue",
                source: "Kartenvisualisierungswerkzeug",
                scaleLabels: [this.selectedFeature, "Jahre"],
                data: {
                    labels: [],
                    dataSets: []
                }
            };
            console.log(this.graphData);
            this.availableYears.forEach(year => {
                graphObj.data.labels.push(year);
            });

            this.graphData.forEach(dataSet => {
                dataSet.data.reverse();
                graphObj.data.dataSets.push(dataSet);
            });

            graphObj.data.labels.reverse();

            this.setNewChartDataSet(graphObj);
        }
    }
};
</script>

<template lang="html">
    <div
        v-if="currentStatsFeatures.length"
        id="ccm"
        class="addon_container"
        :class="{minimized: minimize}"
    >
        <div
            class="addon_wrapper"
        >
            <div class="select_wrapper">
                <div class="btn_group">
                    <button
                        class="minimize"
                        :class="{ highlight: !minimize }"
                        title="Maximieren/ Minimieren"
                        @click="minimize = !minimize"
                    >
                        <template v-if="minimize">
                            <span class="glyphicon glyphicon-plus"></span>
                        </template>
                        <template v-else>
                            <span class="glyphicon glyphicon-minus"></span>
                        </template>
                    </button>
                    <button
                        class="switch"
                        :class="{ highlight: !visualizationState }"
                        title="Visualisierung an/ aus"
                        @click="toggleVisualizationState()"
                    >
                        <span
                            v-if="visualizationState"
                            class="glyphicon glyphicon-eye-close"
                        />
                        <span
                            v-else
                            class="glyphicon glyphicon-eye-open"
                        />
                    </button>
                    <button
                        class="prev btn btn-default btn-sm"
                        title="Vorherigen Datensatz auswählen"
                        @click="changeSelector(-1)"
                    >
                        <span class="glyphicon glyphicon-chevron-left"></span>
                    </button>
                    <button
                        class="next btn btn-default btn-sm"
                        title="Nächsten Datensatz auswählen"
                        @click="changeSelector(1)"
                    >
                        <span class="glyphicon glyphicon-chevron-right"></span>
                    </button>

                    <Multiselect
                        v-if="currentStatsFeatures.length"
                        v-model="selectedYear"
                        class="year_selection selection"
                        :allow-empty="false"
                        :options="availableYears"
                        :multiple="false"
                        selectedLabel=""
                        selectLabel=""
                        deselectLabel=""
                        placeholder=""
                        @input="renderVisualization()"
                    >
                        <template>
                            <strong>{{ selectedYear }}</strong>
                        </template>
                    </Multiselect>
                    <Multiselect
                        v-if="currentStatsFeatures.length"
                        v-model="lastYear"
                        class="year_selection selection"
                        :class="{disable: !selectedYear}"
                        :allow-empty="true"
                        :options="availableYears"
                        :multiple="false"
                        selectedLabel=""
                        selectLabel=""
                        deselectLabel="Entfernen"
                        placeholder=""
                        @input="renderVisualization()"
                    >
                        <template>
                            <strong>{{ lastYear }}</strong>
                        </template>
                    </Multiselect>
                </div>
                <Multiselect
                    v-if="featuresList.length"
                    v-model="selectedFeature"
                    class="feature_selection selection"
                    :allow-empty="false"
                    :options="featuresList"
                    group-label="group"
                    :tabIndex="selectorPosition"
                    :group-select="false"
                    group-values="data"
                    :multiple="false"
                    selectedLabel=""
                    selectLabel=""
                    deselectLabel=""
                    placeholder=""
                    @input="renderVisualization()"
                >
                    <template>
                        <strong>{{ selectedFeature }}</strong>
                    </template>
                </Multiselect>
            </div>
            <div
                id="colorCodeMapLegend"
                class="legend"
                :class="{ active: visualizationState && legendValues && selectedFeatures.length > 1 }"
            >
                <div
                    id="legend_wrapper"
                    :key="updateLegendList"
                >
                    <div
                        v-for="feature in selectedFeatures"
                        :key="feature.id"
                        class="legend_mark"
                    >
                        <div class="mark_tip"></div>
                        <div class="hoverbox">
                            <p class="district"></p>
                            <p class="value"></p>
                        </div>
                    </div>
                </div>
                <div class="top val">
                    {{ hiVal }}
                </div>
                <div class="low val">
                    {{ loVal }}
                </div>
            </div>
        </div>
        <div class="hovermenu">
            <div class="btn_grp">
                <button
                    class="info_button"
                    title="Werkzeuginformationen"
                    @click="showInfo()"
                >
                    <span class="glyphicon glyphicon-question-sign"></span>
                </button>
                <div
                    v-if="visualizationState && !minimize"
                    class="field"
                >
                    <button
                        class="play_button"
                        :class="{highlight: playState}"
                        title="Visualisierung über die Jahre animieren"
                        @click="playState = !playState"
                    >
                        <template v-if="!playState">
                            <span class="glyphicon glyphicon-play"></span>
                        </template>
                        <template v-else>
                            <span class="glyphicon glyphicon-pause"></span>
                        </template>
                    </button>
                    <input
                        v-model="playSpeed"
                        class="mini_input"
                    />
                </div>
                <button
                    v-if="visualizationState"
                    class="graph_button"
                    title="Graph aus Datensatz erzeugen"
                    @click="loadToChartGenerator()"
                >
                    <span class="glyphicon glyphicon-stats"></span>
                </button>
                <button
                    v-if="visualizationState"
                    class="map_button"
                    title="Gebietsnamen ein-/ ausblenden"
                    @click="showMapNames = !showMapNames"
                >
                    <span class="glyphicon glyphicon-map-marker"></span>
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="less">
@import "../../utils/variables.less";
@import (less) "../../node_modules/vue-multiselect/dist/vue-multiselect.min.css";

    .addon_container {
        position:fixed;
        z-index:5000;
        left:10px;
        bottom:30px;
        width:460px;
        height:auto;

        .hovermenu {
            position:absolute;
            left:calc(100% - 5px);
            top:5px;
            padding:10px;
            width:auto;
            height:auto;
            transform:translateX(-100%);
            background:rgba(255,255,255,0.9);
            opacity:0;
            pointer-events:none;
            z-index:-1;
            .drop_shadow();

            .btn_grp {

                button {
                    width:26px;
                    height:26px;
                    background:#eee;
                    border:1px solid #ccc;
                    margin:2px 20px 2px 0px;

                    span {
                        top:0px;
                        line-height:26px;
                    }
                }

                .field {
                    display:flex;
                    flex-flow:row wrap;
                    justify-content:flex-start;
                    width:54px;
                    height:26px;
                    margin:2px 0px;

                    button {
                        flex:0 0 26px;
                        height:26px;
                        margin:0px 2px 0px 0px;

                        &.highlight {
                            color:white;
                            background:@brightblue;
                        }
                    }

                    input {
                        width:26px;
                        text-align:center;
                        font-size:90%;
                        font-weight:700;
                        height:26px;
                        line-height:26px;
                        border:1px solid #888;
                    }
                }
            }
        }

        &:hover {
            outline:1px solid #ccc;
            .hovermenu {
                transform:translateX(0);
                opacity:1;
                pointer-events:all;
                transition:0.3s;
            }
        }

        &:after {
            .fullsize_bg_pseudo(white, 0.95);
            .drop_shadow();
        }

        .addon_wrapper {
            position:relative;
            width:100%;
            height:100%;
            padding:10px;
            box-sizing: border-box;
            z-index:3;

            .select_wrapper {
                display:flex;
                flex-flow:row wrap;
                justify-content: flex-start;
                width:100%;
                margin:5px auto 5px auto;

                .btn_group {
                    display:flex;
                    flex-flow:row wrap;
                    justify-content: flex-start;
                    flex-basis:100%;
                    height:30px;

                    button {
                        flex-basis:40px;
                        height:30px;
                        border-radius:0px;
                        border:1px solid #aaa;
                        margin-right:3px;
                        background-color:@buttongrey;

                        &.switch {
                            flex-basis:40px;
                            height:30px;
                            border-radius:0px;
                            background-color:#eee;

                            &.highlight {
                                color:white;
                                border:none;
                                background-color:@brightblue;
                            }
                        }
                    }

                    .year_selection {
                        height:30px;
                        flex-basis:120px;
                        border-radius:none;
                        margin:0px 3px;
                        min-height:0px;
                        border:1px solid #aaa;

                        &.disable {
                            opacity:0.5;
                            pointer-events:none;
                        }

                        .multiselect__single {
                            font-size:90%;
                        }

                        .multiselect__element {
                            font-size:90%;
                        }

                        .multiselect__tags {
                            border-radius:0px;
                            min-height:0px;
                            height:30px;
                            padding: 5px 30px 0 5px;
                            box-sizing: border-box;
                        }

                        .multiselect__select {
                            height:30px;
                            line-height: 15px;
                        }
                    }
                }

                .feature_selection {
                    flex:1 0 100%;
                    margin:10px auto;
                    padding:10px 0px;
                    border-top:1px solid #aaa;
                    border-bottom:1px solid #aaa;

                    .multiselect__single {
                        font-size:80%;
                    }

                    .multiselect__element {
                        font-size:10px;
                    }

                    .multiselect__tags {
                        border-radius:0px;
                    }

                    .multiselect__select {
                        height: 40px;
                        line-height: 30px;
                    }
                }
            }
        }

        #colorCodeMapLegend {
            position:relative;
            width:70%;
            height:0px;
            opacity:0;
            pointer-events:none;
            margin:10px auto;
            overflow:hidden;

            &.active {
                height:30px;
                opacity:1;
                pointer-events:all;
                overflow:visible;
            }

            .val {
                position:absolute;
                top:0;
                height:30px;
                line-height:30px;
                padding:0px 5px;
                font-size:80%;
                font-weight:700;
                border:1.5px solid #222;

                &.top {
                    right: -50px;
                }

                &.low {
                    left: -50px;
                }
            }

            .legend_mark {
                position:absolute;
                width:10px;
                background:transparent;
                border-radius:1px;
                border:1px solid black !important;
                top:-5px;
                left:0;
                background:whitesmoke;
                //height:calc(100% + 2px);
                height:10px;
                z-index:10;
                .drop_shadow();

                &:after {
                    content:'';
                    position:absolute;
                    width:1px;
                    height: 12px;
                    top: 15px;
                    left:50%;
                    transform: translateX(-50%);
                    background:rgba(255,255,255,0.8);
                }

                .mark_tip {
                    position:absolute;
                    top:100%;
                    left:-1px;
                    width:0;
                    height:0;
                    border-left: 5px solid transparent;
                    border-right: 5px solid transparent;
                    border-top: 5px solid black;
                    z-index:15;
                    .drop_shadow();

                    &:after {
                        content: '';
                        width: 0;
                        height: 0;
                        border-left: 5px solid transparent;
                        border-right: 5px solid transparent;
                        border-top: 5px solid whitesmoke;
                        position: absolute;
                        z-index:18;
                        top: -6px;
                        left: -5px;
                    }
                }

                .hoverbox {
                    position:absolute;
                    left:50%;
                    bottom:calc(100% + 3px);
                    width:max-content;
                    height:30px;
                    padding:10px 20px;
                    opacity:0;
                    pointer-events:none;
                    box-sizing: border-box;
                    z-index:10;
                    .paper_bg();
                    .drop_shadow();

                    p {
                        display:inline;
                        color:#444;
                        font-size:120%;
                        font-weight:300;

                        &:first-child {
                            color:#222;
                            font-weight:500;
                        }
                    }
                }

                &:hover {
                    cursor:pointer;
                    .hoverbox {
                        opacity:1;
                        pointer-events:all;
                        transition:0.3s;
                    }
                }
            }
        }

        &.minimized {
            .hovermenu {
                width:120px;
                .btn_grp {
                    button {
                        margin:2px;
                    }
                }
            }

            .legend {
                margin:0;
                display:none;
            }

            .select_wrapper {

                .year_selection {
                    display:none;
                }

                .btn_group {
                    flex-basis:40%;
                }

                .feature_selection {
                    flex: 1 0 58%;
                    border: none;
                    margin: 0px 2px;
                    height: 30px;
                    min-height: 0px;
                    padding: 0;

                    .multiselect__tags {
                            border-radius:0px;
                            min-height:0px;
                            height:30px;
                            padding: 5px 30px 0 5px;
                            box-sizing: border-box;
                        }

                        .multiselect__select {
                            height:30px;
                            line-height: 15px;
                        }
                }
            }
        }
    }
</style>
