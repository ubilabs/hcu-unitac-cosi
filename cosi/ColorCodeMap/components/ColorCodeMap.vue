<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersColorCodeMap";
import mutations from "../store/mutationsColorCodeMap";
import utils from "../../utils";
import {Fill, Stroke, Style, Icon, Text} from "ol/style.js";
import Multiselect from "vue-multiselect";
import MappingJson from "../../modules/featuresLoader/mapping.json";

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
            selectedYear: "",
            legendResults: [],
            legendValues: [],
            lastYear: null,
            hiVal: null,
            loVal: null
        };
    },
    computed: {
        ...mapGetters("Tools/ColorCodeMap", Object.keys(getters)),
        ...mapGetters("Tools/DistrictSelector", ["selectedFeatures", "label", "keyOfAttrName", "keyOfAttrNameStats"])
    },
    /**
     * Put initialize here if mounting occurs after config parsing
     * @returns {void}
     */
    mounted () {
        Radio.on("FeaturesLoader", "districtsLoaded", this.updateSelectedDistricts);
        this.applyTranslationKey(this.name);
    },
    methods: {
        ...mapMutations("Tools/ColorCodeMap", Object.keys(mutations)),
        updateSelectedDistricts () {
            this.featuresList = [];
            this.featuresStatistics = Radio.request("FeaturesLoader", "getDistrictsByScope", this.label);

            if (this.featuresStatistics.length) {
                this.availableYears = [];
                Object.keys(this.featuresStatistics[0].getProperties()).forEach(key => {
                    if (key.includes(this.yearSelector)) {
                        this.availableYears.push(key.substr(key.indexOf("_") + 1));
                    }
                });

                this.updateFeaturesList();
            }
        },

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
        },

        generateVisualization () {
            const results = this.featuresStatistics.filter(x => x.getProperties().kategorie === this.selectedFeature),
                resultValues = results.map(x => x.getProperties()[this.yearSelector + this.selectedYear]),
                colorScale = this.getColorsByValues(resultValues);

            this.generateDynamicLegend(results, colorScale);
            this.selectedFeatures.forEach(district => {
                const getStyling = district.getStyle(),
                    matchResults = results.find(x => utils.unifyString(x.getProperties()[this.keyOfAttrNameStats]) === utils.unifyString(district.getProperties()[this.keyOfAttrName]));

                if (matchResults) {
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
                    if (this.lastYear !== null) {
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
                            }),

                            addIcon = new Style({
                                zIndex: 3,
                                image: new Icon(/** @type {olx.style.IconOptions} */ {
                                    color: matchResults.getProperties()[this.yearSelector + this.lastYear] > matchResults.getProperties()[this.yearSelector + this.selectedYear] ? [255, 79, 66] : [173, 255, 133],
                                    src: matchResults.getProperties()[this.yearSelector + this.lastYear] > matchResults.getProperties()[this.yearSelector + this.selectedYear] ? "../../utils/assets/arrow_dwn.png" : "../../utils/assets/arrow_up.png"
                                })
                            });

                        district.setStyle([new Style(getStyling), additionalText, addIcon]);
                    }
                    else {
                        district.setStyle(new Style(getStyling));
                    }
                }
            });

            this.lastYear = this.selectedYear;
        },
        generateDynamicLegend (results, colorScale) {
            if (results.length > 2) {
                const legendDiv = document.getElementById("colorCodeMapLegend"),
                    legendMarks = document.querySelector("#legend_wrapper").children,
                    legendMarksArray = Array.from(legendMarks);

                colorScale.legend.values.forEach((value, index) => {
                    if (value === "Keine Daten") {
                        colorScale.legend.colors.splice(index, 1);
                        colorScale.legend.values.splice(index, 1);
                    }
                });

                this.legendValues = [colorScale.scale(colorScale.legend.values[0]), colorScale.scale((colorScale.legend.values[colorScale.legend.values.length - 1] + colorScale.legend.values[0]) / 2), colorScale.scale(colorScale.legend.values[colorScale.legend.values.length - 1])];

                legendDiv.setAttribute("style", "background:linear-gradient(90deg," + this.legendValues[0] + "," + this.legendValues[1] + "," + this.legendValues[2] + ")");

                legendMarksArray.forEach((mark, index) => {
                    const value = results[index].getProperties()[this.yearSelector + this.selectedYear],
                        relativeValue = ((value - colorScale.legend.values[0]) * 100) / (colorScale.legend.values[colorScale.legend.values.length - 1] - colorScale.legend.values[0]),
                        pDistrict = mark.querySelector(".district"),
                        pValue = mark.querySelector(".value");

                    this.hiVal = colorScale.legend.values[0].toLocaleString("de-DE");
                    this.loVal = colorScale.legend.values[colorScale.legend.values.length - 1].toLocaleString("de-DE");

                    if (relativeValue > 50) {
                        mark.setAttribute("style", "left: " + relativeValue + "%; border:1.5px solid whitesmoke;");
                    }
                    else {
                        mark.setAttribute("style", "left: " + relativeValue + "%; border:1.5px solid #222;");
                    }

                    pDistrict.innerHTML = results[index].getProperties()[this.keyOfAttrNameStats] + ": ";
                    pValue.innerHTML = value;

                });
            }
        },
        getColorsByValues (values) {
            return Radio.request("ColorScale", "getColorScaleByValues", values, this.colorScheme);
        }
    }
};
</script>

<template lang="html">
    <div
        v-if="selectedFeatures.length"
        class="addon_container"
    >
        <div
            class="addon_wrapper"
        >
            <Multiselect
                v-if="featuresStatistics.length"
                v-model="selectedYear"
                class="year_selection selection"
                :allow-empty="false"
                :options="availableYears"
            >
                <template>
                    {{ selectedYear }}
                </template>
            </Multiselect>

            <div class="select_wrapper">
                <button
                    class="switch btn btn-default btn-sm"
                    @click="generateVisualization"
                >
                    <span class="glyphicon glyphicon-eye-open"></span>
                </button>
                <div class="btn_group">
                    <button class="prev btn btn-default btn-sm">
                        <span class="glyphicon glyphicon-chevron-left"></span>
                    </button>
                    <button class="next btn btn-default btn-sm">
                        <span class="glyphicon glyphicon-chevron-right"></span>
                    </button>
                </div>
                <Multiselect
                    v-if="featuresList.length"
                    v-model="selectedFeature"
                    class="feature_selection selection"
                    :allow-empty="false"
                    :options="featuresList"
                    group-label="group"
                    :group-select="false"
                    group-values="data"
                    :multiple="false"
                    selectLabel=""
                    deselectLaben=""
                >
                    <template>
                        <strong>{{ selectedFeature }}</strong>
                    </template>
                </Multiselect>
            </div>
            <div
                id="colorCodeMapLegend"
                class="legend"
                :class="{ active: legendValues && selectedFeatures.length > 2 }"
            >
                <div id="legend_wrapper">
                    <div
                        v-for="(district, i) in selectedFeatures"
                        :key="i"
                        class="legend_mark"
                    >
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
        width:450px;
        height:auto;

        &:after {
            .fullsize_bg_pseudo(whitesmoke, 0.85);
            .drop_shadow();
        }

        .addon_wrapper {
            position:relative;
            width:100%;
            height:100%;
            padding:10px;
            box-sizing: border-box;

            .year_selection {
                position:absolute;
                top:-45px;
                left:0;
                height:30px;
                width:150px;
                border-radius:none;
                .drop_shadow();

                    .multiselect__single {
                        font-size:90%;
                    }

                    .multiselect__element {
                        font-size:90%;
                    }

                    .multiselect__tags {
                        border-radius:0px;
                    }
            }

            .select_wrapper {
                display:flex;
                flex-flow:row wrap;
                justify-content: flex-start;
                width:100%;
                margin:5px auto 5px auto;

                .btn_group {
                    flex-basis:80px;
                    margin-left:3px;

                    /*.button {
                        flex-basis:40px;
                        height:30px;
                        border-radius:0px;
                        background-color:#eee;
                    }*/
                }

                .switch {
                    flex-basis:40px;
                    height:30px;
                    border-radius:0px;
                    background-color:#eee;
                }

                .feature_selection {
                    flex:1 0 100%;
                    margin:5px auto;

                    .multiselect__single {
                        font-size:80%;
                    }

                    .multiselect__element {
                        font-size:80%;
                    }

                    .multiselect__tags {
                        border-radius:0px;
                    }
                }
            }
        }

        #colorCodeMapLegend {
            position:relative;
            width:80%;
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
                line-height:30px;

                &.top {
                    right: -40px;
                }

                &.low {
                    left: -40px;
                }
            }

            .legend_mark {
                position:absolute;
                width:8px;
                background:transparent;
                border-radius:1px;
                top:-1px;
                left:0;
                height:calc(100% + 2px);

                .hoverbox {
                    position:absolute;
                    left:0;
                    bottom:100%;
                    width:auto;
                    height:30px;
                    padding:10px 20px;
                    opacity:0;
                    pointer-events:none;
                    box-sizing: border-box;
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

                &:last-child {
                    transform: translateX(-8px);
                }
            }
        }
    }
</style>
