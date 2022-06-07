<script>
import Tool from "../../../src/modules/tools/ToolTemplate.vue";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersBorisVue";
import mutations from "../store/mutationsBorisVue";
import InformationComponent from "./InformationComponent.vue";
import CalculationComponent from "./CalculationComponent.vue";
import FloorComponent from "./FloorComponent.vue";
import {preparePrint} from "../utils/preparePrint.js";
import axios from "axios";
import {getLayerModelsByAttributes} from "../utils/RadioBridge";


export default {
    name: "BorisVue",
    components: {
        Tool,
        InformationComponent,
        CalculationComponent,
        FloorComponent
    },
    computed: {
        ...mapGetters("Tools/BorisVue", Object.keys(getters)),
        ...mapGetters("Tools/Print", ["printFileReady", "fileDownloadUrl", "filename", "printStarted", "progressWidth"]),
        ...mapGetters(["mobile"]),
        /**
         * Gets a list of layers without the stripes-layers
         * @return {Array} filteredListWithoutStripes which is used to select by date
         */
        getFilterListWithoutStripes () {
            // inka@vilma: kann amn das nciht einfacher schreiben?
            // return this.filteredLayerList.filter...
            const filteredListWithoutStripes = [];

            for (const layer in this.filteredLayerList) {
                const layerName = this.filteredLayerList[layer].attributes.name;

                if (layerName.indexOf("-stripes") === -1) {
                    filteredListWithoutStripes.push(layerName);
                }
            }
            return filteredListWithoutStripes;
        },
        /**
         * Gets the selected option from "chosen landuse" which is set as selectedLanduse
         *  @returns {void}
         */
        selectedLanduseComputed: {
            get () {
                return this.selectedLanduse;
            },
            set (value) {
                this.setSelectedLanduse(value);
            }
        }
    },
    watch: {
        /**
         * Listens to the selectedPolygon for simulating landuse if parametric URL is being used
         * @returns {void}
         */
        selectedPolygon () {
            if (this.isProcessFromParametricUrl) {
                this.simulateLanduseSelect(this.paramUrlParams);
            }
        },
        /**
         * Listens to the selectedLanduse to matchPolygonFeatureWithLanduse
         * Defines conditions to deal with Floor Values that aren't available to all landuse categories
         * @param {Object} newValue the newly selected landuse
         * @param {Object} oldValue the previously selected landuse
         * @returns {void}
         */
        selectedLanduse (newValue, oldValue) {
            if (newValue) {
                if (this.buttonValue === "liste") {
                    if (newValue === "EFH Ein- und Zweifamilienhäuser" ||
                        newValue === "A Acker" ||
                        newValue === "GR Grünland" ||
                        newValue === "EGA Erwerbsgartenanbaufläche" ||
                        newValue === "F forstwirtschaftliche Fläche"
                    ) {
                        if (oldValue === "MFH Mehrfamilienhäuser" ||
                            oldValue === "GH Geschäftshäuser (mehrgeschossig, Wertanteil Erdgeschoss)" ||
                            oldValue === "BH Bürohäuser") {
                            this.setButtonValue("info");
                        }
                    }
                }
                this.matchPolygonFeatureWithLanduse({feature: this.selectedPolygon, selectedLanduse: newValue});
            }
        },
        /**
         * Checks if file to print is ready to be printed
         * @returns {void}
         */
        printFileReady () {
            if (this.active && this.printFileReady && this.fileDownloadUrl) {
                const link = document.createElement("a");

                link.href = this.fileDownloadUrl;
                link.click();
            }
        }
    },
    created () {
        this.$on("close", this.close);
        this.initialize();
    },
    mounted () {
        this.$nextTick(() => {
            this.handleUrlParameters();
        });
    },
    methods: {
        ...mapActions("Tools/BorisVue", [
            "initialize",
            "handleSelectBRWYear",
            "toggleStripesLayer",
            "handleUrlParameters",
            "matchPolygonFeatureWithLanduse",
            "getSelectedBuildingDesign",
            "updateSelectedBrwFeature",
            "simulateLanduseSelect",
            "sendWpsConvertRequest"
        ]),
        ...mapMutations("Tools/BorisVue", Object.keys(mutations)),
        preparePrint,
        /**
         * Checks if file to print is ready to be printed
         * @param {String} id the textId to toggle the right info text for the intended element
         * @returns {void}
         */
        toggleInfoText (id) {
            if (!Object.values(this.textIds).includes(id)) {
                this.textIds.push(id);
            }
            else {
                for (let i = 0; i < Object.values(this.textIds).length; i++) {
                    if (this.textIds[i] === id) {
                        this.textIds.splice(i, 1);
                    }
                }
            }
        },
        /**
         * Handles option-change for Individual Property Conversion
         * @param {String} event the selected option
         * @param {String} subject contains subject information for the select: building design oder position to street
         * @returns {void}
         */
        handleOptionChange (event, subject) {
            const eventValue = event.target.value;

            this.setSelectedOption(eventValue);
            this.updateSelectedBrwFeature({converted: subject, brw: eventValue});
            this.sendWpsConvertRequest({state: this});
        },
        /**
         * Handles input-change for Individual Property Conversion
         * @param {String} event the selected option
         * @param {String} subject contains subject information for the select: land area in m² or number of floors
         * @returns {void}
         */
        handleInputChange (event, subject) {
            if (event.type === "change" || (event.key === "Enter")) {
                this.updateSelectedBrwFeature({converted: subject, brw: parseFloat(event.currentTarget.value.replace(",", "."))});
                this.sendWpsConvertRequest({state: this});
            }
        },
        /**
         * Close this tool window by setting active to false
         *  @return  {void}
         */
        close () {
            this.setActive(false);

            // TODO replace trigger when Menu is migrated
            // set the backbone model to active false for changing CSS class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            // else the menu-entry for this tool is always highlighted
            const layer = getLayerModelsByAttributes({id: this.$store.state.Tools.BorisVue.id});

            if (layer) {
                layer.set("isActive", false);
            }
        },
        /**
         * start print process
         * @returns {Object} an axios.post request is returned
         */
        startPrint () {
            preparePrint(async (url, payload) => {
                return axios.post(url, payload);
            });
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t('additional:modules.tools.boris.name')"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="boris"
                class="content"
            >
                <div class="form-group col-12 first">
                    <span>{{ $t("additional:modules.tools.boris.labelSelectYear") }}</span>
                </div>
                <div class="form-group col-12">
                    <select
                        id="brwLayerSelect"
                        class="form-control"
                        @change="handleSelectBRWYear($event.target.value)"
                    >
                        <option
                            v-for="(model, index) in getFilterListWithoutStripes"
                            :key="index"
                            :value="model"
                        >
                            {{ model }}
                        </option>
                    </select>
                </div>
                <div
                    v-if="isAreaLayer === true"
                    class="form-check"
                >
                    <input
                        id="showStripes"
                        class="form-check-input"
                        type="checkbox"
                        :value="isStripesLayer"
                        @change="toggleStripesLayer(!isStripesLayer)"
                    >
                    <label
                        class="form-check-label"
                        for="showStripes"
                    >
                        {{ $t("additional:modules.tools.boris.toggleStripesLayer") }}
                    </label>
                    <span
                        class="bootstrap-icon bi-question-circle-fill"
                        @click="toggleInfoText('1')"
                        @keydown.enter="toggleInfoText('1')"
                    />
                    <div v-if="Object.values(textIds).includes('1')">
                        <div class="col-12 info-text">
                            <span>{{ $t("additional:modules.tools.boris.toggleStripesLayerInfo") }}</span>
                            <br>
                            <br>
                        </div>
                    </div>
                </div>
                <div
                    v-if="selectedPolygon === null"
                    class="form-group col-12"
                >
                    <span
                        id="selectPolygonText"
                    >
                        {{ $t("additional:modules.tools.boris.SelectAreaInMap") }}
                    </span>
                </div>
                <div
                    v-else
                    class="form-group col-12 first"
                >
                    <span>{{ $t("additional:modules.tools.boris.labelSelectUse") }}</span>
                    <select
                        v-model="selectedLanduseComputed"
                        class="form-control"
                        id="landuseSelect"
                    >
                        <option
                            value=""
                            disabled
                            selected
                        >
                            {{ $t("additional:modules.tools.boris.selectOption") }}
                        </option>
                        <option
                            v-for="(landuse, index) in selectedPolygon.get('nutzungsart')"
                            :key="index"
                            :value="landuse.nutzungsart"
                        >
                            {{ landuse.nutzungsart }}
                        </option>
                    </select>
                </div>
                <div
                    v-if="Object.keys(selectedBrwFeature).length !== 0"
                    class="form-group col-12 first info-container"
                >
                    {{ $t("additional:modules.tools.boris.referenceNumber") }}: {{ selectedBrwFeature.get("richtwertnummer") }}
                    <hr>
                    <div
                        class="d-flex "
                        role="group"
                    >
                        <div
                            class="flex-fill"
                            role="group"
                        >
                            <button
                                class="btn bi-info-circle-fill w-100"
                                :class="(buttonValue === 'info') ? 'btn-default' : 'btn-active'"
                                value="info"
                                @click="setButtonValue($event.target.value)"
                            />
                        </div>
                        <div
                            class="flex-fill"
                            role="group"
                        >
                            <button
                                class="btn bi-geo-alt-fill w-100"
                                :class="(buttonValue === 'lage') ? 'btn-default' : 'btn-active'"
                                value="lage"
                                @click="setButtonValue($event.target.value)"
                            />
                        </div>
                        <div
                            class="flex-fill bd-highlight"
                            role="group"
                        >
                            <button
                                class="btn bi-currency-euro w-100"
                                :class="(buttonValue === 'euro') ? 'btn-default' : 'btn-active'"
                                value="euro"
                                @click="setButtonValue($event.target.value)"
                            />
                        </div>
                        <div
                            v-if="selectedBrwFeature.get('schichtwert')"
                            class="flex-fill bd-highlight"
                            role="group"
                        >
                            <button
                                class="btn bi-list-ul w-100"
                                :class="(buttonValue === 'liste') ? 'btn-default' : 'btn-active'"
                                value="liste"
                                @click="setButtonValue($event.target.value)"
                            />
                        </div>
                    </div>
                    <div v-if="buttonValue === 'info'">
                        <InformationComponent
                            :title="$t('additional:modules.tools.boris.detailInformation.title')"
                            :selected-brw-feature="selectedBrwFeature"
                            :button-value="buttonValue"
                        />
                    </div>
                    <div v-if="buttonValue === 'lage'">
                        <InformationComponent
                            :title="$t('additional:modules.tools.boris.locationDescription.title')"
                            :selected-brw-feature="selectedBrwFeature"
                            :button-value="buttonValue"
                        />
                    </div>
                    <div v-if="buttonValue === 'euro'">
                        <h4>{{ $t('additional:modules.tools.boris.landCalculation.title') }} </h4>
                        <dl>
                            <div
                                v-if="selectedBrwFeature.get('zBauweise')"
                            >
                                <CalculationComponent
                                    :title="$t('additional:modules.tools.boris.landCalculation.buildingDesigns')"
                                    :options="buildingDesigns"
                                    :selected-brw-feature="selectedBrwFeature"
                                    :text-ids="textIds"
                                    :text-id="2"
                                    :text="$t('additional:modules.tools.boris.landCalculation.buildingDesignsInfo')"
                                    :toggle-info-text="toggleInfoText"
                                    :handle-change="handleOptionChange"
                                    :subject="'zBauweise'"
                                    :type="'select'"
                                />
                            </div>
                            <div
                                v-if="selectedBrwFeature.get('zStrassenLage')"
                            >
                                <CalculationComponent
                                    :title="$t('additional:modules.tools.boris.landCalculation.positionToStreet')"
                                    :options="positionsToStreet"
                                    :selected-brw-feature="selectedBrwFeature"
                                    :text-ids="textIds"
                                    :text-id="3"
                                    :text="$t('additional:modules.tools.boris.landCalculation.positionToStreetInfo')"
                                    :toggle-info-text="toggleInfoText"
                                    :handle-change="handleOptionChange"
                                    :subject="'zStrassenLage'"
                                    :type="'select'"
                                />
                            </div>
                            <div
                                v-if="selectedBrwFeature.get('zGeschossfl_zahl')"
                            >
                                <CalculationComponent
                                    :title="$t('additional:modules.tools.boris.landCalculation.numberOfFloor')"
                                    :options="[]"
                                    :selected-brw-feature="selectedBrwFeature"
                                    :text-ids="textIds"
                                    :text-id="4"
                                    :text="$t('additional:modules.tools.boris.landCalculation.numberOfFloorInfo')"
                                    :toggle-info-text="toggleInfoText"
                                    :handle-change="handleInputChange"
                                    :subject="'zGeschossfl_zahl'"
                                    :type="'input'"
                                />
                            </div>
                            <div
                                v-if="selectedBrwFeature.get('zGrdstk_flaeche')"
                            >
                                <CalculationComponent
                                    :title="$t('additional:modules.tools.boris.landCalculation.landArea')"
                                    :options="[]"
                                    :selected-brw-feature="selectedBrwFeature"
                                    :text-ids="textIds"
                                    :text-id="5"
                                    :text="$t('additional:modules.tools.boris.landCalculation.landAreaInfo')"
                                    :toggle-info-text="toggleInfoText"
                                    :handle-change="handleInputChange"
                                    :subject="'zGrdstk_flaeche'"
                                    :type="'input'"
                                />
                            </div>
                            <dt>
                                <span>{{ $t('additional:modules.tools.boris.landCalculation.calculatedLandValue') }}</span>
                                <span
                                    class="bootstrap-icon bi-question-circle-fill"
                                    @click="toggleInfoText('6')"
                                    @keydown.enter="toggleInfoText('6')"
                                />
                            </dt>
                            <dd
                                v-if="selectedBrwFeature.get('convertedBrwDM') === ''"
                            >
                                {{ convertedBrw }} €/m²
                                <div
                                    v-if="Object.values(textIds).includes('6')"
                                    class="help"
                                >
                                    <span v-html="$t('additional:modules.tools.boris.landCalculation.calculatedLandValueInfo')" />
                                </div>
                            </dd>
                            <dd
                                v-else
                            >   
                                <div
                                    class="d-flex justify-content-between"
                                >
                                    <span>{{ convertedBrw }} €/m²</span>
                                    <span>{{ selectedBrwFeature.get("convertedBrwDM") }} DM/m²</span>
                                </div>
                                <div
                                    v-if="Object.values(textIds).includes('6')"
                                    class="help"
                                >
                                    <span v-html="$t('additional:modules.tools.boris.landCalculation.calculatedLandValueInfo')" />
                                </div>
                            </dd>
                        </dl>
                    </div>
                    <div v-if="buttonValue === 'liste' && selectedBrwFeature.get('schichtwert')">
                        <FloorComponent
                            :title="$t('additional:modules.tools.boris.floorValues.title')"
                            :feature="selectedBrwFeature.get('schichtwert')"
                            :label="$t('additional:modules.tools.boris.floorValues.subTitle')"
                        />
                    </div>
                    <button
                        class="btn btn-primary btn-infos"
                        :title="'export as PDF'"
                        @click="startPrint"
                    >
                        {{ $t("additional:modules.tools.boris.print") }}
                    </button>
                    <div
                        v-if="printStarted"
                        class="form-group pt-20"
                    >
                        <div class="progress">
                            <div
                                class="progress-bar"
                                role="progressbar"
                                :style="progressWidth"
                            >
                                <span class="visually-hidden">30% Complete</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Tool>
</template>


<style lang="scss" scoped>
.content {
        .first{
            padding-top: 5px;
        }
        .form-group {
            >label {
                float: left;
                width: 75%;
            }
        }
        .form-check{
            padding-left: 15px;
            padding-bottom: 15px;
        }
    };
.btn-default {
    background-color: rgb(231, 223, 223);
}
.btn-active {
    border-style: solid;
    border-width: 0.5px;
    border-color: lightgrey;
}
::v-deep dt {
    background-color: rgba(227, 227, 227, 0.5);
    font-family: "UniversNextW04-620CondB", "Arial Narrow", Arial, sans-serif;
    padding: 8px;
};
::v-deep dd{
    padding: 8px;
    word-wrap: break-word;
}
::v-deep h4 {
    font-size: 1rem;
}
</style>
