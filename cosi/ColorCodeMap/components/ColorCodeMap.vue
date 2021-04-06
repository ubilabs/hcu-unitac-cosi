<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersColorCodeMap";
import mutations from "../store/mutationsColorCodeMap";
import utils from "../../utils";
import {Fill, Stroke, Style, Text} from "ol/style.js";
import Multiselect from "vue-multiselect";
import MappingJson from "../../modules/featuresLoader/mapping.json";
import store from "../../../../src/app-store";

export default {
    name: "ColorCodeMap",
    components: {
        Multiselect
    },
    data () {
        return {
            featuresStatistics: [],
            featureCategories: [],
            selectedFeature: "",
            featuresList: [],
            availableYears: [],
            selectedYear: null,
            legendResults: [],
            legendValues: [],
            lastYear: null,
            selectorPosition: 0,
            originalStyling: null,
            hiVal: null,
            loVal: null,
            minimize: false,
            playState: false,
            playSpeed: 1
        };
    },
    computed: {
        ...mapGetters("Tools/ColorCodeMap", Object.keys(getters)),
        ...mapGetters("Tools/DistrictSelector", ["selectedFeatures", "label", "keyOfAttrName", "keyOfAttrNameStats"]),
        ...mapGetters("Tools/DistrictLoader", ["featureList"]),
        dataToCCM () {
            return this.$store.state.Tools.CalculateRatio.dataToCCM;
        },
        ccmDataSet () {
            return this.$store.state.Tools.CalculateRatio.ccmDataSet;
        }
    },
    watch: {
        selectedFeatures () {
            if (this.visualizationState) {
                this.$nextTick(function () {
                    this.updateSelectedDistricts();
                });
            }
        },
        visualizationState () {
            if (!this.dataToCCM) {
                this.renderVisualization();
            }
        },
        featureList () {
            this.updateSelectedDistricts();
        },
        playState (stateChange) {
            if (stateChange) {
                this.animationOverYears(this.playSpeed);
            }
        },
        dataToCCM (newState) {
            if (newState) {
                this.renderCCMData();
            }
        },
        ccmDataSet () {
            if (this.dataToCCM) {
                this.renderCCMData();
            }
        }
    },
    /**
     * Put initialize here if mounting occurs after config parsing
     * @returns {void}
     */
    mounted () {
        this.applyTranslationKey(this.name);
    },
    methods: {
        ...mapMutations("Tools/ColorCodeMap", Object.keys(mutations)),
        /**
         * @todo todo
         * @description todo
         * @returns {void}
         */
        updateSelectedDistricts () {
            this.featuresList = [];
            this.featuresStatistics = store.getters["Tools/DistrictLoader/currentStatsFeatures"];
            if (this.featuresStatistics.length) {
                this.availableYears = utils.getAvailableYears(this.featuresStatistics, this.yearSelector);
                /* this.availableYears = [];
                Object.keys(this.featuresStatistics[0].getProperties()).forEach(key => {
                    if (key.includes(this.yearSelector)) {
                        this.availableYears.push(key.substr(key.indexOf("_") + 1));
                    }
                });*/

                this.updateFeaturesList();
            }
        },

        /**
         * @todo todo
         * @description todo
         * @returns {void}
         */
        updateFeaturesList () {
            this.selectedFeature = MappingJson[0].value;
            this.selectedYear = this.availableYears[0];

            MappingJson.forEach(attr => {
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
         * @todo todo
         * @description todo
         * @param {Boolean} [state] todo
         * @returns {void}
         */
        renderVisualization () {
            if (this.visualizationState) {
                const results = this.featuresStatistics.filter(x => x.getProperties().kategorie === this.selectedFeature),
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
                        if (this.lastYear) {
                            const additionalText = new Style({
                                zIndex: 2,
                                text: new Text({
                                    font: "13px Calibri, sans-serif",
                                    fill: new Fill({
                                        color: [20, 20, 20]
                                    }),
                                    stroke: new Stroke({
                                        color: [240, 240, 240],
                                        width: 2
                                    }),
                                    text: matchResults.getProperties()[this.yearSelector + this.lastYear] ? this.lastYear + ": " + parseFloat(matchResults.getProperties()[this.yearSelector + this.lastYear]).toLocaleString("de-DE") + "  (" + parseFloat(Math.round((matchResults.getProperties()[this.yearSelector + this.lastYear] / matchResults.getProperties()[this.yearSelector + this.selectedYear]) * 100)) + "%)" : "Keine Daten vorhanden",
                                    offsetY: 25
                                })
                            });

                            district.setStyle([new Style(getStyling), additionalText]);
                        }
                        else {
                            district.setStyle(new Style(getStyling));
                        }
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
        renderCCMData () {
            if (!this.visualizationState) {
                this.$store.commit("Tools/ColorCodeMap/setVisualizationState", true);
            }

            const resultValues = this.ccmDataSet.map(x => {
                    return x.data;
                }),
                colorScale = this.getColorsByValues(resultValues);

            // this.generateDynamicLegend(results, colorScale);
            this.selectedFeatures.forEach(district => {
                const getStyling = district.getStyle(),
                    matchResults = this.ccmDataSet.find(x => utils.unifyString(x.name) === utils.unifyString(district.getProperties()[this.keyOfAttrName]));

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
         * @description todo
         * @param {*} results todo
         * @param {*} colorScale todo
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
                    if (index > matchResults.length - 1) {
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
         * @todo todo
         * @description todo
         * @param {*} values todo
         * @returns {Object} the colorScale function(value) and the n-step legend color/value pairs.
         */
        getColorsByValues (values) {
            return Radio.request("ColorScale", "getColorScaleByValues", values, this.colorScheme);
        },

        /**
         * @todo todo
         * @description todo
         * @param {*} value todo
         * @returns {void}
         */
        changeSelector (value) {
            const index = MappingJson.map(e => e.value).indexOf(this.selectedFeature) + value;

            if (index === -1) {
                this.selectedFeature = MappingJson[MappingJson.length - 1].value;
            }
            else if (index === MappingJson.length) {
                this.selectedFeature = MappingJson[0].value;
            }
            else {
                this.selectedFeature = MappingJson[index].value;
            }
            this.renderVisualization();
        }
    }
};
</script>

<template lang="html">
    <div
        v-if="featuresStatistics.length"
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
                        @click="changeSelector(-1)"
                    >
                        <span class="glyphicon glyphicon-chevron-left"></span>
                    </button>
                    <button
                        class="next btn btn-default btn-sm"
                        @click="changeSelector(1)"
                    >
                        <span class="glyphicon glyphicon-chevron-right"></span>
                    </button>

                    <Multiselect
                        v-if="featuresStatistics.length"
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
                        v-if="featuresStatistics.length"
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
                <div
                    v-if="visualizationState"
                    class="btn_group"
                >
                    <button
                        class="play_button btn btn-default btn-sm prev"
                        @click="playState = !playState"
                    >
                        <span class="glyphicon glyphicon-play"></span>
                    </button>
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
                <div id="legend_wrapper">
                    <div
                        v-for="(value, i) in selectedFeatures"
                        :key="i"
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
