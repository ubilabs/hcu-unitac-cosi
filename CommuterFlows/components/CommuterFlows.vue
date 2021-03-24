<script>
import Tool from "../../../src/modules/tools/Tool.vue";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersCommuterFlows";
import mutations from "../store/mutationsCommuterFlows";
import {CommuterApi} from "../library/commuterApi";
import {Stroke, Style} from "ol/style.js";
import Feature from "ol/Feature.js";

export default {
    name: "CommuterFlows",
    components: {
        Tool
    },
    data () {
        return {
            blacklistedDistricts: ["Bremen", "Berlin", "Kiel", "Hannover"],
            serviceURL: "https://geodienste.hamburg.de/MRH_WFS_Pendlerstroeme_im_Tool",
            districts: [],
            cities: [],
            featureList: [],
            currentDistrict: "",
            currentCity: "",
            start: false,
            text: true,
            number: true,
            beams: true,
            animation: false,
            direction: "outCommuter",
            api: {},
            layer: "",
            inCommuterToolTipActive: false,
            outCommuterToolTipActive: false
        };
    },
    computed: {
        ...mapGetters("Tools/CommuterFlows", Object.keys(getters))
    },
    watch: {
        /**
             * Starts the action for processes, if the tool is be activated (active === true).
             * @param {Boolean} value Value deciding whether the tool gets activated or deactivated.
             * @returns {void}
             */
        active (value) {
            if (value) {
                this.setActive(value);

                this.api.getListDistricts(result => {
                    this.districts = result;
                });
            }
        }
    },
    created () {
        this.layer = Radio.request("Map", "createLayerIfNotExists", "commuter_flows_layer");

        this.$on("close", this.close);
    },
    /**
         * Put initialize here if mounting occurs after config parsing
         * @returns {void}
         */
    mounted () {
        this.api = new CommuterApi({serviceUrl: this.serviceURL, blacklistedDistricts: this.blacklistedDistricts});
        this.applyTranslationKey(this.name);
    },
    methods: {
        ...mapMutations("Tools/CommuterFlows", Object.keys(mutations)),

        translate (key) {
            if (key.indexOf(this.$t(key)) !== -1) {
                console.warn("the key " + key + " is unknown to the translation");
            }
            return this.$t(key);
        },

        /**
             * Closes this tool window by setting active to false
             * @returns {void}
             */
        close () {
            this.setActive(false);

            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.CommuterFlows.id});

            if (model) {
                model.set("isActive", false);
            }
        },

        /**
             * Called if selection of currentDistrict changed.
             * @param {Event} event changed selection event
             * @returns {void}
             */
        selectDistrict (event) {
            this.layer.getSource().getFeatures().forEach((feature) => {
                this.layer.getSource().removeFeature(feature);
            });
            this.currentDistrict = event.target.value;
            this.currentCity = -1;
            console.log(this.currentDistrict);
            this.api.getListCities(this.currentDistrict, result => {
                this.cities = result;
            });
            this.api.getFeaturesDistrict(this.currentDistrict, false, 0, 5, result => {
                this.featureList = result.featureList;
                this.addBeamFeatureToLayer(this.featureList);
                console.log(result);
            });
        },

        /**
             * Called if selection of currentCity changed.
             * @param {Event} event changed selection event
             * @returns {void}
             */
        selectCity (event) {
            this.layer.getSource().getFeatures().forEach((feature) => {
                this.layer.getSource().removeFeature(feature);
            });
            this.currentCity = event.target.value;
            console.log(this.currentCity);
            this.api.getFeaturesCity(this.currentCity, false, 0, 5, result => {
                console.log(result);
                this.featureList = result.featureList;
                // es werden hier nur die letzten Auswahl angezeigt
                this.addBeamFeatureToLayer(result.featureList);
            });
        },

        /**
             * adds lines (beams) into the layer
             * @param {ol/Feature} features array of the ol/Feature to place
             * @returns {void}
             */
        addBeamFeatureToLayer: function (features) {
            features.forEach(feature => {
                // Erzeuge die Strahlen
                const newFeature = new Feature({
                    geometry: feature.getGeometry()
                });

                newFeature.setStyle(new Style({
                    stroke: new Stroke(Object.assign({
                        color: [192, 9, 9, 1],
                        width: "3"
                    }))
                }));
                // "styleId" neccessary for print, that style and feature can be linked
                newFeature.set("styleId", Radio.request("Util", "uniqueId"));
                this.layer.getSource().addFeature(newFeature);
            });
        },

        checkText (value) {
            this.text = value;
            console.log(this.text);
        },
        checkNumber (value) {
            this.number = value;
            console.log(this.number);
        },
        checkBeams (value) {
            this.beams = value;
            console.log(this.beams);
        },
        checkAnimation (value) {
            this.animation = value;
            console.log(this.animation);
        },
        checkCommuter (value) {
            this.direction = value;
            console.log(this.direction);
        },
        showMore () {
            console.log("showMore called!");
            const a = this.featureList,
                b = [...a, ...a];

            this.featureList = b;
        },
        showLess () {
            const a = this.featureList;

            if (a.length > 5) {
                this.featureList = a.slice(5);
            }

            console.log("showLess called!");
        },
        showAll () {
            console.log("showAll called!");
        },
        clearAll () {
            this.layer.getSource().getFeatures().forEach((feature) => {
                this.layer.getSource().removeFeature(feature);
            });

            console.log("clearAll called!");
        },
        playAnimation () {
            this.start = true;
            console.log("playAnimation called!");
        },
        stopAnimation () {
            this.start = false;
            console.log("stopAnimation called!");
        },
        inCommuterMouseOver () {
            this.inCommuterToolTipActive = !this.inCommuterToolTipActive;
        },
        outCommuterMouseOver () {
            this.outCommuterToolTipActive = !this.outCommuterToolTipActive;
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t(name)"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
            <div class="container">
                <div class="section">
                    <div class="row">
                        <div class="col">
                            <div
                                v-if="active"
                                id="CommuterFlows"
                            >
                                <div class="form-group">
                                    <select
                                        id="select-kreis"
                                        v-model="currentDistrict"
                                        class="form-control"
                                        @change="selectDistrict($event)"
                                    >
                                        <option
                                            selected
                                            disabled
                                            value=""
                                        >
                                            {{ translate("additional:modules.tools.CommuterFlows.chooseDistrictLabel") }}
                                        </option>
                                        <option
                                            v-for="(district, i) in districts"
                                            :key="i"
                                            :value="district"
                                            :SELECTED="district === currentDistrict"
                                        >
                                            {{ district }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <div
                                v-if="cities.length > 0"
                                class="form-group"
                            >
                                <select
                                    id="select-city"
                                    v-model="currentCity"
                                    class="form-control"
                                    @change="selectCity($event)"
                                >
                                    <option
                                        selected
                                        disabled
                                        value="-1"
                                    >
                                        {{ translate("additional:modules.tools.CommuterFlows.chooseMunicipalityLabel") }}
                                    </option>
                                    <option
                                        v-for="(city, i) in cities"
                                        :key="i"
                                        :value="city"
                                        :SELECTED="city === currentCity"
                                    >
                                        {{ city }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="currentDistrict">
                    <div class="section">
                        <div class="row">
                            <div class="col">
                                <div class="form-group">
                                    <label>
                                        <input
                                            id="activateText"
                                            v-model="text"
                                            class="textCheckbox form-check-input"
                                            type="checkbox"
                                            @change="checkText($event.target.checked)"
                                        > {{ translate("additional:modules.tools.CommuterFlows.activateTextLabel") }}
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <div class="form-group">
                                    <label>
                                        <input
                                            id="activateNumber"
                                            v-model="number"
                                            class="numberCheckbox form-check-input"
                                            type="checkbox"
                                            @change="checkNumber($event.target.checked)"
                                        > {{ translate("additional:modules.tools.CommuterFlows.activateNumberLabel") }}
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <div class="form-group">
                                    <label>
                                        <input
                                            id="beams"
                                            v-model="beams"
                                            class="beamsCheckbox form-check-input"
                                            type="checkbox"
                                            @change="checkBeams($event.target.checked)"
                                        > {{ translate("additional:modules.tools.CommuterFlows.beamsLabel") }}
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-sm-10">
                                <div class="form-group">
                                    <label>
                                        <input
                                            id="animation"
                                            v-model="animation"
                                            class="animationCheckbox form-check-input"
                                            type="checkbox"
                                            @change="checkAnimation($event.target.checked)"
                                        > {{ translate("additional:modules.tools.CommuterFlows.animationLabel") }}
                                    </label>
                                </div>
                            </div>
                            <div
                                v-if="!start && animation"
                                class="col-sm-2"
                            >
                                <div class="form-group">
                                    <button
                                        type="button"
                                        class="btn btn-default btn-sm"
                                        @click="playAnimation"
                                    >
                                        <span class="glyphicon glyphicon-play"></span>
                                        {{ translate("additional:modules.tools.CommuterFlows.startLabel") }}
                                    </button>
                                </div>
                            </div>
                            <div
                                v-if="start && animation"
                                class="col-sm-2"
                            >
                                <div class="form-group">
                                    <button
                                        type="button"
                                        class="btn btn-default btn-sm"
                                        @click="stopAnimation"
                                    >
                                        <span class="glyphicon glyphicon-stop"></span>
                                        {{ translate("additional:modules.tools.CommuterFlows.stopLabel") }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        v-if="featureList.length > 0"
                        id="result-container"
                        class="row"
                    >
                        <div class="col-sm-12">
                            <span
                                v-for="(feature, index) in featureList"
                                :key="`feature-${index}`"
                            >
                                <span v-html="feature.values_.caption">
                                    {{ feature.values_.caption }}
                                </span>:&nbsp;
                                <span v-html="feature.values_.value">
                                    {{ feature.values_.value }}
                                </span>
                                <span>&nbsp;{{ translate("additional:modules.tools.CommuterFlows.people") }}</span>
                                <hr />
                            </span>
                        </div>
                    </div>
                    <div class="section">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="radio">
                                    <div class="col-sm-6">
                                        <label
                                            class="radio-inline"
                                            @mouseover="outCommuterMouseOver"
                                            @mouseout="outCommuterMouseOver"
                                        >
                                            <input
                                                v-model="direction"
                                                type="radio"
                                                name="outInCommuter"
                                                value="outCommuter"
                                                autocomplete="off"
                                                data-toggle="tooltip"
                                                title="tooltip on radio!"
                                                @change="checkCommuter($event.target.value)"
                                            >
                                            {{ translate("additional:modules.tools.CommuterFlows.outCommuterLabel") }}
                                            <div
                                                v-show="outCommuterToolTipActive"
                                                class="tooltip"
                                            >
                                                <span class="tooltiptext">
                                                    {{ translate("additional:modules.tools.CommuterFlows.outCommuterTooltipLabel") }}
                                                </span>
                                            </div>
                                        </label>
                                    </div>
                                    <div class="col-sm-6">
                                        <label
                                            class="radio-inline"
                                            @mouseover="inCommuterMouseOver"
                                            @mouseout="inCommuterMouseOver"
                                        >
                                            <input
                                                v-model="direction"
                                                type="radio"
                                                name="outInCommuter"
                                                value="inCommuter"
                                                checked=""
                                                @change="checkCommuter($event.target.value)"
                                            >
                                            {{ translate("additional:modules.tools.CommuterFlows.inCommuterLabel") }}
                                            <div
                                                v-show="inCommuterToolTipActive"
                                                class="tooltip"
                                            >
                                                <span class="tooltiptext">
                                                    {{ translate("additional:modules.tools.CommuterFlows.inCommuterTooltipLabel") }}
                                                </span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="section">
                        <div class="row">
                            <div class="col-sm-4">
                                <button
                                    type="button"
                                    class="btn btn-default btn-sm btn-btm"
                                    @click="showLess"
                                >
                                    <span class="glyphicon glyphicon-arrow-up"></span>
                                    {{ translate("additional:modules.tools.CommuterFlows.loadLessLabel") }}
                                </button>
                            </div>
                            <div class="col-sm-4">
                                <button
                                    type="button"
                                    class="btn btn-default btn-sm btn-btm"
                                    @click="showMore"
                                >
                                    <span class="glyphicon glyphicon-arrow-down"></span>
                                    {{ translate("additional:modules.tools.CommuterFlows.loadMoreLabel") }}
                                </button>
                            </div>
                            <div class="col-sm-4">
                                <button
                                    type="button"
                                    class="btn btn-default btn-sm btn-btm"
                                    @click="showAll"
                                >
                                    <span class="glyphicon glyphicon-arrow-right"></span>
                                    {{ translate("additional:modules.tools.CommuterFlows.loadAllLabel") }}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="row information">
                        <div class="col-sm-12">
                            <a
                                :href="metaVerPath"
                                target="_blank"
                            >
                                {{ translate("additional:modules.tools.CommuterFlows.moreInfoLabel") }}
                            </a>
                        </div>
                    </div>
                    <div class="section">
                        <div class="row">
                            <div class="col-sm-12">
                                <button
                                    type="button"
                                    class="btn btn-default btn-sm form-control"
                                    @click="clearAll"
                                >
                                    <span class="glyphicon glyphicon-trash"></span>
                                    {{ translate("additional:modules.tools.CommuterFlows.deleteAllLabel") }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
    .section {
        margin-bottom: 10px;
    }
    #CommuterFlows {
        margin-bottom: 10px;
    }
    .btn-btm {
        width: 125px;
    }
    hr {
        margin-top: 10px;
        margin-bottom: 10px;
        border-top: solid #ddd 1px;
    }
    .radio {
        margin-top: 5px;
    }
    input[type="radio"] {
        margin-bottom: 0px;
        margin-top: 1px;
    }
    .row {
        padding: 0 0 5px 0;
        &.information {
            margin-bottom: 10px;
            text-align: right;
        }
    }
    .container {
        width: auto;
    }
    .col-sm-12, .col-sm-10, .col-sm-6, .col-sm-4, .col-sm-2 {
        padding-left: 0px;
    }
    .col-sm-12 {
        padding-right: 0px;
    }
    #result-container {
        max-height: 200px;
        overflow-y: auto;
    }
    .tooltip {
        position: relative;
        display: inline-block;
        opacity: 1;
        float: left;
        left: 20px;
        top: -5px;
        .tooltiptext {
            visibility: visible;
            width: 200px;
            background-color: #FFFFFF;
            color: #292929;
            text-align: left;
            border-radius: 4px;
            padding: 5px;
            position: absolute;
            z-index: 1;
            top: 30px;
            left: -55px;
            border: solid 1px #000;
        }
    }
    @media only screen and (max-width: 780px) {
        .btn-btm {
            width: 100%;
            margin-bottom: 10px;
        }
        .col-sm-6 {
            width: 50%;
            float: left;
        }
    }
    @media only screen and (max-width: 480px) {
        .row {
            &.information {
                text-align: center;
                margin-top: -10px;
                margin-bottom: 5px;
            }
        }
    }
</style>

