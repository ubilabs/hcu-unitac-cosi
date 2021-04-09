<script>
import Tool from "../../../src/modules/tools/Tool.vue";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersCommuterFlows";
import mutations from "../store/mutationsCommuterFlows";
import {CommuterApi} from "../utils/commuterApi";
import {CommuterOL} from "../utils/commuterOL";
import {convertColor} from "../../../src/utils/colorTools.js";
import thousandsSeparator from "../../../src/utils/thousandsSeparator.js";

export default {
    name: "CommuterFlows",
    components: {
        Tool
    },
    data () {
        return {
            wfsApi: null,
            olApi: null,

            listDistricts: [],
            listCities: [],
            lastDataset: null,
            lastMarker: null,

            currentDistrict: "",
            currentCity: "",
            currentDirection: "out",

            captionsChecked: true,
            numbersChecked: true,
            beamsChecked: true,
            animationChecked: false,

            tooltipOutActive: false,
            tooltipInActive: false
        };
    },
    computed: {
        ...mapGetters("Tools/CommuterFlows", Object.keys(getters)),

        homeToWork () {
            return this.currentDirection === "out";
        },
        isAnimationRunning () {
            return this.olApi.isAnimationRunning();
        }
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

                if (this.wfsApi === null) {
                    this.wfsApi = new CommuterApi({
                        serviceUrl: this.serviceURL,
                        blacklistedDistricts: this.blacklistedDistricts
                    });
                    this.wfsApi.getListDistricts(result => {
                        this.listDistricts = result;
                    }, this.onApiError);
                }
                if (this.olApi === null) {
                    // the CommuterOL creates layers on construction
                    // only construct when necessary - e.g. on first activation of the tool
                    this.olApi = new CommuterOL({
                        font: this.olFont,
                        fontShadow: this.olFontShadow,
                        beam: this.olBeam,
                        bubblePixelMax: this.olBubblePixelMax,
                        bubblePixelMin: this.olBubblePixelMin,
                        bubbleBorder: this.olBubbleBorder,
                        bubbleColors: this.olBubbleColors,
                        bubbleColorShift: this.olBubbleColorShift,
                        zoomOptions: this.olZoomOptions,
                        animationPaces: this.olAnimationPaces
                    });
                }
                if (typeof this.onstart === "object") {
                    this.captionsChecked = this.onstart.captionsChecked;
                    this.numbersChecked = this.onstart.numbersChecked;
                    this.beamsChecked = this.onstart.beamsChecked;
                    this.animationChecked = this.onstart.animationChecked;
                    this.currentDirection = this.onstart.direction;
                }
            }
        },
        /**
         * on change of the last dataset all kinds of ol changes take place
         * @returns {void}
         */
        lastDataset () {
            if (Array.isArray(this.lastDataset?.featureList)) {
                this.olApi.addCaptions(
                    this.lastDataset.caption,
                    this.lastDataset.coordinate,
                    this.lastDataset.featureList,
                    this.captionsChecked,
                    this.numbersChecked
                );

                if (this.beamsChecked) {
                    this.olApi.addBeams(this.lastDataset.featureList);
                }
                else {
                    this.olApi.removeBeams();
                }

                if (this.animationChecked) {
                    this.olApi.initAnimation(this.lastDataset.featureList, this.lastDataset.totalMax, this.olBubbleAlgorithm);
                }
                else {
                    this.olApi.removeAnimation();
                }
            }
            else {
                this.olApi.clearLayers();
            }
        },
        /**
         * watches the current district and calls selectDistrict if a district is given
         * resets currentCity
         * @param {String} district the new district
         * @returns {void}
         */
        currentDistrict (district) {
            this.currentCity = "";
            if (district) {
                this.selectDistrict(district, this.homeToWork, this.listChunk);
            }
        },
        /**
         * watches the current city and calls selectCity if a city is given
         * calls selectDistrict if no city is given
         * @param {String} city the new city
         * @returns {void}
         */
        currentCity (city) {
            if (city) {
                this.selectCity(city, this.homeToWork, this.listChunk);
            }
            else {
                this.selectDistrict(this.currentDistrict, this.homeToWork, this.listChunk);
            }
        }
    },
    created () {
        this.$on("close", this.close);
    },
    /**
     * Put initialize here if mounting occurs after config parsing
     * @returns {void}
     */
    mounted () {
        this.applyTranslationKey(this.name);
    },
    methods: {
        ...mapMutations("Tools/CommuterFlows", Object.keys(mutations)),
        thousandsSeparator,

        /**
         * translates the given key, checkes if the key exists and throws a console warning if not
         * @param {String} key the key to translate
         * @param {Object} [options=null] for interpolation, formating and plurals
         * @returns {String} the translation or the key itself on error
         */
        translate (key, options = null) {
            if (key === "additional:" + this.$t(key)) {
                console.warn("the key " + JSON.stringify(key) + " is unknown to the additional translation");
            }
            return this.$t(key, options);
        },

        /**
         * logs the given error as api error
         * @param {Object} error the error from the api
         * @returns {void}
         */
        onApiError (error) {
            console.warn("addons/CommuterFlow - Api error", error);
        },

        /**
         * returns the css style to use for the feature at a certain list position
         * @param {Number} idx the list position
         * @returns {Object} the css style to be interpreted by Vues :style argument
         */
        getStyleByIdx (idx) {
            return {
                "background-color": convertColor(this.olApi.getColor(idx), "rgbaString")
            };
        },

        /**
         * helper function to zoom into the current extent
         * @returns {void}
         * @pre the zoom is anywhere
         * @post the map is zoomed into the extent of this.lastDataset.featureList
         */
        zoomIntoExtent () {
            if (typeof this.olZoomOptions === "object" && this.olZoomOptions !== null && Array.isArray(this.lastDataset?.featureList)) {
                this.olApi.zoomToExtent(this.lastDataset.featureList);
            }
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
         * auto scrolls the div of the featureList
         * @param {String} whereto whether to scroll up ("top") or down ("bottom")
         * @returns {void}
         */
        autoscrollFeatureList (whereto) {
            const elem = this.$el.querySelector(".featureList");

            if (whereto === "top") {
                elem.scrollTop = 0;
            }
            else if (whereto === "bottom") {
                elem.scrollTop = elem.scrollHeight;
            }
        },

        /**
         * sets/unsets the marker
         * @param {Number[]} coords the coordinates to place the marker at
         * @returns {void}
         */
        toggleMarker (coords) {
            if (!this.setMarkerOnClickInList) {
                return;
            }
            if (!Array.isArray(coords) || this.lastMarker === coords) {
                this.lastMarker = null;
                this.$store.dispatch("MapMarker/removePointMarker");
            }
            else {
                this.lastMarker = coords;
                this.$store.dispatch("MapMarker/placingPointMarker", coords);
            }
        },

        /**
         * sets the dataset for the selected district
         * @param {String} district the selected district
         * @param {Boolean} homeToWork out-commuter (true) or in-commuter (false)
         * @param {Number} listChunk the number of features to load initialy
         * @returns {void}
         */
        selectDistrict (district, homeToWork, listChunk) {
            this.wfsApi.getListCities(district, result => {
                this.listCities = result;
            }, this.onApiError);
            this.wfsApi.getFeaturesDistrict(district, homeToWork, 0, listChunk, dataset => {
                this.lastDataset = dataset;
                this.zoomIntoExtent();
            }, this.onApiError);
        },

        /**
         * sets the dataset for the selected city
         * @param {String} city the selected city
         * @param {Boolean} homeToWork out-commuter (true) or in-commuter (false)
         * @param {Number} listChunk the number of features to load initialy
         * @returns {void}
         */
        selectCity (city, homeToWork, listChunk) {
            this.wfsApi.getFeaturesCity(city, homeToWork, 0, listChunk, dataset => {
                this.lastDataset = dataset;
                this.zoomIntoExtent();
            }, this.onApiError);
        },

        /**
         * reacts to the check of the checkbox
         * @param {Boolean} value true if the checkbox was checked
         * @returns {void}
         */
        checkCaptions (value) {
            this.captionsChecked = value;

            if (Array.isArray(this.lastDataset?.featureList)) {
                this.olApi.addCaptions(
                    this.lastDataset.caption,
                    this.lastDataset.coordinate,
                    this.lastDataset.featureList,
                    this.captionsChecked,
                    this.numbersChecked
                );
            }
            else {
                this.olApi.removeCaptions();
            }
        },
        /**
         * reacts to the check of the checkbox
         * @param {Boolean} value true if the checkbox was checked
         * @returns {void}
         */
        checkNumbers (value) {
            this.numbersChecked = value;

            if (Array.isArray(this.lastDataset?.featureList)) {
                this.olApi.addCaptions(
                    this.lastDataset.caption,
                    this.lastDataset.coordinate,
                    this.lastDataset.featureList,
                    this.captionsChecked,
                    this.numbersChecked
                );
            }
            else {
                this.olApi.removeCaptions();
            }
        },
        /**
         * reacts to the check of the checkbox
         * @param {Boolean} value true if the checkbox was checked
         * @returns {void}
         */
        checkBeams (value) {
            this.beamsChecked = value;

            if (this.beamsChecked && Array.isArray(this.lastDataset?.featureList)) {
                this.olApi.addBeams(this.lastDataset.featureList);
            }
            else {
                this.olApi.removeBeams();
            }
        },
        /**
         * reacts to the check of the checkbox
         * @param {Boolean} value true if the checkbox was checked
         * @returns {void}
         */
        checkAnimation (value) {
            this.animationChecked = value;

            if (this.animationChecked && Array.isArray(this.lastDataset?.featureList)) {
                this.olApi.initAnimation(this.lastDataset.featureList, this.lastDataset.totalMax, this.olBubbleAlgorithm);
            }
            else {
                this.olApi.removeAnimation();
            }
        },
        /**
         * reacts to the check of a radio box
         * @param {Boolean} value "out" or "in" based on the direction
         * @returns {void}
         */
        checkDirection (value) {
            this.currentDirection = value;

            if (this.lastDataset?.source === "getFeaturesDistrict") {
                this.wfsApi.getFeaturesDistrict(this.currentDistrict, this.homeToWork, 0, this.listChunk, dataset => {
                    this.lastDataset = dataset;
                    this.zoomIntoExtent();
                }, this.onApiError);
            }
            else if (this.lastDataset?.source === "getFeaturesCity") {
                this.wfsApi.getFeaturesCity(this.currentCity, this.homeToWork, 0, this.listChunk, dataset => {
                    this.lastDataset = dataset;
                    this.zoomIntoExtent();
                }, this.onApiError);
            }
            else {
                this.olApi.clearLayers();
            }
        },
        /**
         * loads more features in the feature list
         * @returns {void}
         */
        loadMore () {
            let len = 0;

            if (this.lastDataset?.source === "getFeaturesDistrict") {
                len = this.lastDataset.len + this.listChunk;
                this.wfsApi.getFeaturesDistrict(this.currentDistrict, this.homeToWork, 0, len, dataset => {
                    this.lastDataset = dataset;
                    this.zoomIntoExtent();
                    this.$nextTick(() => {
                        this.autoscrollFeatureList("bottom");
                    });
                }, this.onApiError);
            }
            else if (this.lastDataset?.source === "getFeaturesCity") {
                len = this.lastDataset.len + this.listChunk;
                this.wfsApi.getFeaturesCity(this.currentCity, this.homeToWork, 0, len, dataset => {
                    this.lastDataset = dataset;
                    this.zoomIntoExtent();
                    this.$nextTick(() => {
                        this.autoscrollFeatureList("bottom");
                    });
                }, this.onApiError);
            }
            else {
                this.olApi.clearLayers();
            }
        },
        /**
         * loads less features in the feature list
         * @returns {void}
         */
        loadLess () {
            let len = 0;

            if (this.lastDataset?.source === "getFeaturesDistrict") {
                len = this.lastDataset.len - this.listChunk;
                this.wfsApi.getFeaturesDistrict(this.currentDistrict, this.homeToWork, 0, len, dataset => {
                    this.lastDataset = dataset;
                    this.zoomIntoExtent();
                }, this.onApiError);
            }
            else if (this.lastDataset?.source === "getFeaturesCity") {
                len = this.lastDataset.len - this.listChunk;
                this.wfsApi.getFeaturesCity(this.currentCity, this.homeToWork, 0, len, dataset => {
                    this.lastDataset = dataset;
                    this.zoomIntoExtent();
                }, this.onApiError);
            }
            else {
                this.olApi.clearLayers();
            }
        },
        /**
         * loads all features in the feature list
         * @returns {void}
         */
        loadAll () {
            if (this.lastDataset?.source === "getFeaturesDistrict") {
                this.wfsApi.getFeaturesDistrict(this.currentDistrict, this.homeToWork, 0, this.lastDataset.totalLength, dataset => {
                    this.lastDataset = dataset;
                    this.zoomIntoExtent();
                    this.$nextTick(() => {
                        this.autoscrollFeatureList("top");
                    });
                }, this.onApiError);
            }
            else if (this.lastDataset?.source === "getFeaturesCity") {
                this.wfsApi.getFeaturesCity(this.currentCity, this.homeToWork, 0, this.lastDataset.totalLength, dataset => {
                    this.lastDataset = dataset;
                    this.zoomIntoExtent();
                    this.$nextTick(() => {
                        this.autoscrollFeatureList("top");
                    });
                }, this.onApiError);
            }
            else {
                this.olApi.clearLayers();
            }
        },
        /**
         * removes all features from the layers, empties list
         * @returns {void}
         */
        clearAll () {
            this.listCities = [];
            this.currentDistrict = "";
            this.currentCity = "";
            this.lastDataset = null;
            this.captionsChecked = this.onstart.captionsChecked;
            this.numbersChecked = this.onstart.numbersChecked;
            this.beamsChecked = this.onstart.beamsChecked;
            this.animationChecked = this.onstart.animationChecked;
            this.currentDirection = this.onstart.direction;
            this.toggleMarker(null);

            this.olApi.clearLayers();
        },
        /**
         * starts the animation
         * @returns {void}
         */
        playAnimation () {
            this.olApi.startAnimation();
        },
        /**
         * stops the animation
         * @returns {void}
         */
        stopAnimation () {
            this.olApi.stopAnimation();
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
            <div
                id="CommuterFlows"
                class="container"
            >
                <div class="row section">
                    <div class="col">
                        <div
                            v-if="active"
                            class="form-group"
                        >
                            <select
                                v-model="currentDistrict"
                                class="form-control"
                            >
                                <option
                                    selected
                                    disabled
                                    value=""
                                >
                                    {{ translate("additional:modules.tools.CommuterFlows.selectDistrict") }}
                                </option>
                                <option
                                    v-for="(district, i) in listDistricts"
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
                <div v-if="lastDataset !== null">
                    <div class="row section">
                        <div class="col">
                            <div class="form-group">
                                <select
                                    v-model="currentCity"
                                    class="form-control"
                                >
                                    <option
                                        selected
                                        value=""
                                    >
                                        {{ translate("additional:modules.tools.CommuterFlows.selectCity") }}
                                    </option>
                                    <option
                                        v-for="(city, i) in listCities"
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
                    <div class="row section">
                        <div class="col"></div>
                    </div>
                    <div class="row section">
                        <div class="col-sm-12">
                            <div class="form-check">
                                <input
                                    id="idCaptionsChecked"
                                    v-model="captionsChecked"
                                    class="form-check-input"
                                    type="checkbox"
                                    @change="checkCaptions($event.target.checked)"
                                >
                                <label
                                    class="form-check-label"
                                    for="idCaptionsChecked"
                                >
                                    {{ translate("additional:modules.tools.CommuterFlows.checkName") }}
                                </label>
                            </div>
                        </div>
                        <div class="col-sm-12">
                            <div class="form-check">
                                <input
                                    id="idNumbersChecked"
                                    v-model="numbersChecked"
                                    class="form-check-input"
                                    type="checkbox"
                                    @change="checkNumbers($event.target.checked)"
                                >
                                <label
                                    class="form-check-label"
                                    for="idNumbersChecked"
                                >
                                    {{ translate("additional:modules.tools.CommuterFlows.checkNumber") }}
                                </label>
                            </div>
                        </div>
                        <div class="col-sm-12">
                            <div class="form-check">
                                <input
                                    id="idBeamsChecked"
                                    v-model="beamsChecked"
                                    class="form-check-input"
                                    type="checkbox"
                                    @change="checkBeams($event.target.checked)"
                                >
                                <label
                                    class="form-check-label"
                                    for="idBeamsChecked"
                                >
                                    {{ translate("additional:modules.tools.CommuterFlows.checkBeams") }}
                                </label>
                            </div>
                        </div>
                        <div class="col-sm-6">
                            <div class="form-check">
                                <input
                                    id="idAnimationChecked"
                                    v-model="animationChecked"
                                    class="form-check-input"
                                    type="checkbox"
                                    @change="checkAnimation($event.target.checked)"
                                >
                                <label
                                    class="form-check-label"
                                    for="idAnimationChecked"
                                >
                                    {{ translate("additional:modules.tools.CommuterFlows.checkAnimation") }}
                                </label>
                            </div>
                        </div>
                        <div class="col-sm-6">
                            <div
                                v-if="!isAnimationRunning"
                                class="form-group pull-right"
                            >
                                <button
                                    type="button"
                                    class="btn btn-default btn-sm animationButton"
                                    :disabled="!animationChecked"
                                    @click="playAnimation"
                                >
                                    <span class="glyphicon glyphicon-play"></span>
                                    {{ translate("additional:modules.tools.CommuterFlows.buttonStart") }}
                                </button>
                            </div>
                            <div
                                v-else
                                class="form-group pull-right"
                            >
                                <button
                                    type="button"
                                    class="btn btn-default btn-sm animationButton"
                                    @click="stopAnimation"
                                >
                                    <span class="glyphicon glyphicon-stop"></span>
                                    {{ translate("additional:modules.tools.CommuterFlows.buttonStop") }}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="row section">
                        <div class="col"></div>
                    </div>
                    <div class="row section">
                        <div class="col-6 col-sm-6 tooltipWrapper">
                            <div
                                class="form-check form-check-inline"
                                @mouseover="tooltipOutActive = true"
                                @mouseout="tooltipOutActive = false"
                            >
                                <input
                                    id="idOutChecked"
                                    v-model="currentDirection"
                                    class="form-check-input"
                                    type="radio"
                                    name="outInCommuter"
                                    value="out"
                                    @change="checkDirection($event.target.value)"
                                >
                                <label
                                    class="form-check-label"
                                    for="idOutChecked"
                                >
                                    {{ translate("additional:modules.tools.CommuterFlows.selectOut") }}
                                </label>
                            </div>
                            <div
                                v-show="tooltipOutActive"
                                class="tooltip"
                            >
                                {{ translate("additional:modules.tools.CommuterFlows.tooltipOut") }}
                            </div>
                        </div>
                        <div class="col-6 col-sm-6 tooltipWrapper">
                            <div
                                class="form-check form-check-inline"
                                @mouseover="tooltipInActive = true"
                                @mouseout="tooltipInActive = false"
                            >
                                <input
                                    id="idInChecked"
                                    v-model="currentDirection"
                                    class="form-check-input"
                                    type="radio"
                                    name="outInCommuter"
                                    value="in"
                                    @change="checkDirection($event.target.value)"
                                >
                                <label
                                    class="form-check-label"
                                    for="idInChecked"
                                >
                                    {{ translate("additional:modules.tools.CommuterFlows.selectIn") }}
                                </label>
                            </div>
                            <div
                                v-show="tooltipInActive"
                                class="tooltip tooltipRight"
                            >
                                {{ translate("additional:modules.tools.CommuterFlows.tooltipIn") }}
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <hr />
                        </div>
                    </div>
                    <div class="row section">
                        <div
                            v-if="Array.isArray(lastDataset.featureList) && lastDataset.featureList.length"
                            class="col-sm-12 featureList"
                        >
                            <table>
                                <tbody>
                                    <tr
                                        v-for="(feature, idx) in lastDataset.featureList"
                                        :key="`feature-${idx}`"
                                        @click="toggleMarker(feature.get('coordinate'))"
                                    >
                                        <td
                                            class="featureColor"
                                        >
                                            <div :style="getStyleByIdx(idx)"></div>
                                        </td>
                                        <td class="featureCaption">
                                            {{ feature.get("caption") }}
                                        </td>
                                        <td class="featureValue">
                                            {{ thousandsSeparator(feature.get("value")) }}
                                        </td>
                                        <td class="featurePeople">
                                            {{ translate("additional:modules.tools.CommuterFlows.labelPeople") }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <hr />
                        </div>
                    </div>
                    <div class="row section">
                        <div class="col-12 col-sm-4">
                            <button
                                type="button"
                                class="btn btn-default btn-block"
                                :disabled="lastDataset.len <= listChunk"
                                @click="loadLess"
                            >
                                {{ translate("additional:modules.tools.CommuterFlows.buttonLess", {listChunk}) }}
                                <span class="glyphicon glyphicon-arrow-up"></span>
                            </button>
                        </div>
                        <div class="col-12 col-sm-4">
                            <button
                                type="button"
                                class="btn btn-default btn-block"
                                :disabled="lastDataset.len >= lastDataset.totalLength"
                                @click="loadMore"
                            >
                                {{ translate("additional:modules.tools.CommuterFlows.buttonMore", {listChunk}) }}
                                <span class="glyphicon glyphicon-arrow-down"></span>
                            </button>
                        </div>
                        <div class="col-12 col-sm-4">
                            <button
                                type="button"
                                class="btn btn-default btn-block"
                                :disabled="lastDataset.len >= lastDataset.totalLength"
                                @click="loadAll"
                            >
                                {{ translate("additional:modules.tools.CommuterFlows.buttonAll") }}
                                <!--<span class="glyphicon glyphicon-arrow-right"></span>-->
                            </button>
                        </div>
                    </div>
                    <div
                        v-if="metaVerPath"
                        class="row section"
                    >
                        <div class="col-sm-12">
                            <a
                                :href="metaVerPath"
                                target="_blank"
                                class="pull-right"
                            >
                                {{ translate("additional:modules.tools.CommuterFlows.linkMoreInfo") }}
                            </a>
                        </div>
                    </div>
                    <div class="row section">
                        <div class="col-12 col-sm-12">
                            <button
                                type="button"
                                class="btn btn-default btn-block"
                                @click="clearAll"
                            >
                                <span class="glyphicon glyphicon-trash"></span>
                                {{ translate("additional:modules.tools.CommuterFlows.buttonReset") }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
    .container {
        max-width: 340px;
    }
    .section {
        .col-sm-1, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-6, .col-sm-12 {
            padding-left: 2px;
            padding-right: 2px;
        }
        .col-12 {
            padding-top: 2px;
            padding-bottom: 2px;
        }
        margin-bottom: 10px;
    }
    hr {
        margin-top: 10px;
        margin-bottom: 10px;
        border-top: solid #ddd 1px;
    }
    .form-check-label {
        padding-left: 4px;
    }
    .animationButton {
        width: 80px;
    }
    .featureList {
        height: 200px;
        overflow-y: auto;
        table {
            width: 100%;
            padding: 0;
            margin: 0;
            tbody tr:nth-child(odd) {
                background-color: #fdfdfd;
            }
            tbody tr:nth-child(odd) {
                background-color: #f8f8f8;
            }
            tr {
                width: 100%;
                height: 35px;
                padding: 0;
                margin: 0;

                td {
                    padding: 0 1px 0 1px;
                    margin: 0;
                    vertical-align: middle;
                }
                td.featureColor {
                    width: 15%;
                    text-align: center;
                    div {
                        width: 25px;
                        height: 25px;
                        border-radius: 50%;
                    }
                }
                td.featureCaption {
                    width: 35%;
                }
                td.featureValue {
                    width: 25%;
                    text-align: right;
                }
                td.featurePeople {
                    width: 25%;
                }
            }
        }
    }
    .tooltipWrapper {
        position: relative;
        width: 50%;
        float: left;
        .tooltip {
            position: absolute;
            top: 25px;
            width: 200px;
            z-index: 1;
            opacity: 1;
            border-radius: 4px;
            border: solid 1px #000;
            background-color: white;
            padding: 5px;
        }
        .tooltipRight {
            right: 0px;
        }
    }
</style>
