<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersCalculateRatio";
import mutations from "../store/mutationsCalculateRatio";
import MappingJsonFacilities from "../mapping.json";
import MappingJsonFeatures from "../../assets/mapping.json";
import utils from "../../utils";
import {Fill, Stroke, Style, Text} from "ol/style.js";
import Multiselect from "vue-multiselect";
import VGrid from "@revolist/vue-datagrid";
import store from "../../../../src/app-store";

export default {
    name: "CalculateRatio",
    components: {
        Tool,
        Multiselect,
        VGrid
    },
    data () {
        return {
            featuresStatistics: [],
            layerIdList: [],
            facilityList: [],
            featuresList: [],
            facilityPropertyList_A: [],
            facilityPropertyList_B: [],
            ASwitch: true,
            BSwitch: true,
            selectedFieldA: {id: ""},
            selectedFieldB: {id: ""},
            paramFieldA: "",
            paramFieldB: "",
            fActive_A: false,
            fActive_B: false,
            faktorf_A: 1,
            faktorf_B: 1,
            perCalc_A: 1,
            perCalc_B: 1,
            featureVals: [],
            calcHelper: {},
            results: []
        };
    },
    computed: {
        ...mapGetters("Tools/CalculateRatio", Object.keys(getters)),
        ...mapGetters("Tools/DistrictSelector", ["selectedFeatures", "label", "keyOfAttrName", "keyOfAttrNameStats"]),
        ...mapGetters("Tools/DistrictLoader", ["featureList"]),
        ...mapGetters("Map", ["layerList"]),
        gridColumns () {
            return [
                {name: this.label, prop: "scope", size: 200},
                {name: this.selectedFieldA.id, prop: this.paramFieldA.name === "Anzahl" ? "paramA_count" : "paramA_val", size: 200},
                {name: this.selectedFieldB.id, prop: this.paramFieldB.name === "Anzahl" ? "paramB_count" : "paramB_val", size: 200},
                {name: this.selectedFieldA.id + " / " + this.selectedFieldB.id, prop: "relation", size: 200},
                {name: "Bedarfsdeckung (1 ~ 100%)", prop: "coverage", size: 200}
            ];
        }
    },
    watch: {
        selectedFeatures () {
            this.updateSelectedDistricts();
        },
        layerList () {
            this.layerIdList = this.layerList.map(x => x.getProperties().name);
            this.updateFacilities();
        },
        featureList () {
            this.updateFeaturesList();
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

        if (this.facilityList.length === 0) {
            this.ASwitch = false;
            this.BSwitch = false;
        }
    },
    methods: {
        ...mapMutations("Tools/CalculateRatio", Object.keys(mutations)),
        ...mapActions("Alerting", ["addSingleAlert", "cleanup"]),
        updateSelectedDistricts () {
        },
        updateFacilities () {
            this.facilityList = MappingJsonFacilities.reduce((list, group) => {
                const lengthCheck = group.layer.filter(layer => this.layerIdList.includes(layer.id));

                if (lengthCheck.length > 0) {
                    return [
                        ...list,
                        {
                            group: group.group,
                            layer: lengthCheck
                        }
                    ];
                }

                return list;
            }, []);

            if (this.facilityList.length !== 0) {
                this.ASwitch = true;
            }
        },
        updateFeaturesList () {
            this.featuresList = [];
            this.featuresStatistics = store.getters["Tools/DistrictLoader/currentStatsFeatures"];

            MappingJsonFeatures.forEach(attr => {
                if (attr[this.keyOfAttrNameStats] && attr.valueType === "absolute") {
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

            if (this.featuresList.length !== 0) {
                this.BSwitch = false;
            }
        },
        switchVal (letter) {
            if (this[letter + "Switch"]) {
                if (this.featuresList.length === 0) {
                    this.showAlert("$t('additional:modules.tools.cosi.calculateRatio.noFeaturesWarning')");
                }
                else {
                    this[letter + "Switch"] = !this[letter + "Switch"];
                    this["selectedField" + letter] = {id: ""};
                    this["paramField" + letter] = "";
                }
            }
            else if (this.facilityList.length === 0) {
                this.showAlert("$t('additional:modules.tools.cosi.calculateRatio.noFacilitiesWarning')");
            }
            else {
                this[letter + "Switch"] = !this[letter + "Switch"];
                this["selectedField" + letter] = {id: ""};
            }
        },
        showAlert (content, category = "Warnung", cssClass = "warning") {
            this.addSingleAlert({
                category: category,
                content: content,
                displayClass: cssClass
            });
        },
        /**
         * Closes this tool window by setting active to false
         * @returns {void}
         */
        close () {
            this.setActive(false);

            // TODO replace trigger when Menu is migrated
            // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            // else the menu-entry for this tool is always highlighted
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.CalculateRatio.id});

            if (model) {
                model.set("isActive", false);
            }
        },
        getFacilityData (letter) {
            if (this[letter + "Switch"]) {
                this["facilityPropertyList_" + letter] = [];
                const findLayer = this.layerList.find(layer => layer.get("name") === this["selectedField" + letter].id),
                    layerFeatures = findLayer.getSource().getFeatures(),
                    countData = {
                        name: "Anzahl",
                        count: layerFeatures.length
                    };

                this["facilityPropertyList_" + letter].push(countData);
                this["selectedField" + letter].numericalValues.forEach(value => {
                    const data = {
                        name: value.name,
                        id: value.id,
                        count: layerFeatures.reduce((total, layer) => total + parseFloat(layer.getProperties()[value.id] ? layer.getProperties()[value.id] : 0), 0)
                    };

                    this["facilityPropertyList_" + letter].push(data);
                });

                this["paramField" + letter] = this["facilityPropertyList_" + letter][0];
            }
        },
        clearAllValues () {
            this.selectedFieldA = {id: ""};
            this.selectedFieldB = {id: ""};
            this.paramFieldA = "";
            this.paramFieldB = "";
            this.fActive_A = false;
            this.fActive_B = false;
            this.faktorf_A = 1;
            this.faktorf_B = 1;
            this.results = [];
        },
        prepareCoverage () {
            this.results = [];
            this.selectedFeatures.forEach(district => {
                const name = district.getProperties()[this.keyOfAttrName],
                    geometry = district.getGeometry();

                if (this.ASwitch) {
                    const findLayer = this.layerList.find(layer => layer.get("name") === this.selectedFieldA.id),
                        layerFeatures = findLayer.getSource().getFeatures();

                    this.featureVals = [];
                    layerFeatures.forEach(layer => {
                        const layerGeometry = layer.getGeometry().getExtent();

                        if (geometry.intersectsExtent(layerGeometry)) {
                        // if (layer.getProperties()[this.keyOfAttrNameStats] === name) {
                            if (this.paramFieldA.name !== "Anzahl") {
                                this.featureVals.push(layer.getProperties()[this.paramFieldA.id]);
                            }
                            else {
                                this.featureVals.push(0);
                            }
                        }
                    });

                    this.calcHelper.paramA_count = this.featureVals.length;
                    this.calcHelper.paramA_val = this.featureVals.reduce((total, val) => total + parseFloat(val), 0);
                }
                else {
                    this.featureVals = [];
                    this.featuresStatistics.forEach(feature => {
                        if (feature.getProperties()[this.keyOfAttrNameStats] === name && feature.get("kategorie") === this.selectedFieldA.id) {
                            Object.entries(feature.getProperties()).forEach(([key, val]) => {
                                if (key.includes(this.yearSelector)) {
                                    const obj = {
                                        jahr: key.substr(key.indexOf("_") + 1),
                                        wert: parseFloat(val)
                                    };

                                    this.featureVals.push(obj);
                                }
                            });
                        }
                    });

                    this.calcHelper.paramA_val = this.featureVals;
                }

                if (this.BSwitch) {
                    const findLayer = this.layerList.find(layer => layer.get("name") === this.selectedFieldB.id),
                        layerFeatures = findLayer.getSource().getFeatures();

                    this.featureVals = [];
                    layerFeatures.forEach(layer => {
                        const layerGeometry = layer.getGeometry().getExtent();

                        if (geometry.intersectsExtent(layerGeometry)) {
                            if (this.paramFieldB.name !== "Anzahl") {
                                this.featureVals.push(layer.getProperties()[this.paramFieldB.id]);
                            }
                            else {
                                this.featureVals.push(0);
                            }
                        }
                    });

                    this.calcHelper.paramB_count = this.featureVals.length;
                    this.calcHelper.paramB_val = this.featureVals.reduce((total, val) => total + parseFloat(val), 0);
                }
                else {
                    this.featureVals = [];
                    this.featuresStatistics.forEach(feature => {
                        if (feature.getProperties()[this.keyOfAttrNameStats] === name && feature.get("kategorie") === this.selectedFieldB.id) {
                            Object.entries(feature.getProperties()).forEach(([key, val]) => {
                                if (key.includes(this.yearSelector)) {
                                    const obj = {
                                        jahr: key.substr(key.indexOf("_") + 1),
                                        wert: parseFloat(val)
                                    };

                                    this.featureVals.push(obj);
                                }
                            });
                        }
                    });

                    this.calcHelper.paramB_val = this.featureVals;
                }

                this.calculateRatio(name, this.calcHelper);
            });

            const resultsTotal = {
                    scope: "Gesamt",
                    paramA_count: this.results.reduce((total, district) => total + district.paramA_count, 0),
                    paramB_count: this.results.reduce((total, district) => total + district.paramB_count, 0),
                    paramA_val: this.results.reduce((total, district) => total + district.paramA_val, 0),
                    paramB_val: this.results.reduce((total, district) => total + district.paramB_val, 0)
                },

                resultsAverage = {
                    scope: "Durchschnitt",
                    paramA_count: resultsTotal.paramA_count / this.results.length,
                    paramB_count: resultsTotal.paramB_count / this.results.length,
                    paramA_val: resultsTotal.paramA_val / this.results.length,
                    paramB_val: resultsTotal.paramB_val / this.results.length
                };

            this.calculateRatio(resultsTotal.scope, resultsTotal);
            this.calculateRatio(resultsAverage.scope, resultsAverage);
            console.log(this.results);
        },
        calculateRatio (name, data) {
            const calcObj = {
                    scope: name,
                    paramA_count: this.ASwitch ? data.paramA_count : 0,
                    paramA_val: Array.isArray(data.paramA_val) ? data.paramA_val[0].wert : data.paramA_val,
                    paramB_count: this.BSwitch ? data.paramB_count : 0,
                    paramB_val: Array.isArray(data.paramB_val) ? data.paramB_val[0].wert : data.paramB_val
                },
                relation = ((this.paramFieldA.name === "Anzahl" ? calcObj.paramA_count : calcObj.paramA_val)) / ((this.paramFieldB.name === "Anzahl" ? calcObj.paramB_count : calcObj.paramB_val)),
                mirroredRelation = ((this.paramFieldB.name === "Anzahl" ? calcObj.paramB_count : calcObj.paramB_val)) / ((this.paramFieldA.name === "Anzahl" ? calcObj.paramA_count : calcObj.paramA_val)),
                capacity = (this.paramFieldA.name === "Anzahl" ? calcObj.paramA_count : calcObj.paramA_val) * (this.faktorf_B / this.faktorf_A),
                need = (this.paramFieldB.name === "Anzahl" ? calcObj.paramB_count : calcObj.paramB_val) * (this.faktorf_A / this.faktorf_B),
                coverageA = this.perCalc_B * relation,
                coverageB = this.perCalc_A * mirroredRelation,
                weightedRelation = relation * (this.perCalc_A / this.perCalc_B);

            calcObj.relation = relation;
            calcObj.mirroredRelation = mirroredRelation;
            calcObj.capacity = capacity;
            calcObj.need = need;
            calcObj.coverage = coverageA;
            calcObj.mirrorCoverage = coverageB;
            calcObj.weightedRelation = weightedRelation;

            this.results.push(calcObj);
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t('additional:modules.tools.cosi.calculateRatio.title')"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
            <div
                v-if="active"
                id="calculateratio"
                :class="{ expanded: results.length > 0 }"
            >
                <div class="addon_wrapper">
                    <p class="section intro">
                        {{ $t("additional:modules.tools.cosi.calculateRatio.description") }}
                    </p>
                    <div
                        v-if="featuresList.length === 0 && facilityList.length === 0"
                        class="warning_wrapper section"
                    >
                        <p class="warning">
                            {{ $t("additional:modules.tools.cosi.calculateRatio.warningNoData") }}
                        </p>
                    </div>
                    <div
                        v-else
                        class="select_wrapper section first"
                        :class="{ grouped: selectedFieldA.id }"
                    >
                        <div class="button switch">
                            <button
                                @click="switchVal('A')"
                            >
                                <template v-if="ASwitch">
                                    {{ $t("additional:modules.tools.cosi.calculateRatio.dataA") }}
                                </template>
                                <template v-else>
                                    {{ $t("additional:modules.tools.cosi.calculateRatio.dataB") }}
                                </template>
                            </button>
                        </div>
                        <template v-if="ASwitch">
                            <Multiselect
                                v-if="facilityList.length"
                                v-model="selectedFieldA"
                                class="facility_selection selection"
                                :options="facilityList"
                                group-label="group"
                                :group-select="false"
                                group-values="layer"
                                track-by="id"
                                label="id"
                                :multiple="false"
                                selectedLabel=""
                                selectLabel=""
                                deselectLabel=""
                                :placeholder="$t('additional:modules.tools.cosi.calculateRatio.placeholderA')"
                                @input="getFacilityData('A')"
                            >
                                <template
                                    slot="singleLabel"
                                >
                                    <strong>{{ selectedFieldA.id }}</strong>
                                </template>
                            </Multiselect>
                        </template>
                        <template v-else>
                            <Multiselect
                                v-if="featuresList.length"
                                v-model="selectedFieldA.id"
                                class="feature_selection selection"
                                :options="featuresList"
                                group-label="group"
                                :group-select="false"
                                group-values="data"
                                :multiple="false"
                                selectedLabel=""
                                selectLabel=""
                                deselectLabel=""
                                :placeholder="$t('additional:modules.tools.cosi.calculateRatio.placeholderA')"
                            >
                                <template slot="singleLabel">
                                    <strong>{{ selectedFieldA.id }}</strong>
                                </template>
                            </Multiselect>
                        </template>

                        <div
                            v-if="selectedFieldA.id"
                            class="subsection"
                        >
                            <template v-if="ASwitch">
                                <div class="sub_wrapper">
                                    <div
                                        class="faktor_f"
                                    >
                                        <div
                                            class="btn"
                                            :class="{ reduced: fActive_A }"
                                        >
                                            <button @click="fActive_A = !fActive_A">
                                                <span
                                                    v-if="fActive_A"
                                                    class="glyphicon glyphicon-remove"
                                                ></span>
                                                <span v-else>Faktor (F) hinzufügen</span>
                                            </button>
                                        </div>
                                        <div
                                            v-if="fActive_A"
                                            class="input"
                                        >
                                            <input
                                                v-model="faktorf_A"
                                                type="number"
                                            >
                                        </div>
                                    </div>
                                    <Multiselect
                                        v-if="featuresList.length"
                                        v-model="paramFieldA"
                                        track-by="name"
                                        label="name"
                                        class="feature_selection selection"
                                        :options="facilityPropertyList_A"
                                        :multiple="false"
                                        :preselect-first="true"
                                        :disabled="facilityPropertyList_A.length < 2"
                                        selectedLabel=""
                                        selectLabel=""
                                        deselectLabel=""
                                        placeholder=""
                                    >
                                        <template slot="singleLabel">
                                            <strong>{{ paramFieldA.name }}</strong>
                                        </template>
                                    </Multiselect>
                                </div>
                            </template>
                            <template v-else>
                                <div class="sub_wrapper">
                                    <div class="custom_wrapper">
                                        <p>berechnen pro </p>
                                        <input
                                            v-model="perCalc_A"
                                            type="number"
                                        >
                                        <p><strong> der Datengrundlage</strong></p>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                    <div
                        v-if="selectedFieldA.id"
                        class="select_wrapper section second"
                        :class="{ grouped: selectedFieldB.id }"
                    >
                        <div class="button switch">
                            <button
                                @click="switchVal('B')"
                            >
                                <template v-if="BSwitch">
                                    {{ $t("additional:modules.tools.cosi.calculateRatio.dataA") }}
                                </template>
                                <template v-else>
                                    {{ $t("additional:modules.tools.cosi.calculateRatio.dataB") }}
                                </template>
                            </button>
                        </div>
                        <template v-if="BSwitch">
                            <Multiselect
                                v-if="facilityList.length"
                                v-model="selectedFieldB"
                                class="facility_selection selection"
                                :options="facilityList"
                                group-label="group"
                                :group-select="false"
                                group-values="layer"
                                track-by="id"
                                label="id"
                                :multiple="false"
                                selectedLabel=""
                                selectLabel=""
                                deselectLabel=""
                                :placeholder="$t('additional:modules.tools.cosi.calculateRatio.placeholderA')"
                                @input="getFacilityData('B')"
                            >
                                <template slot="singleLabel">
                                    <strong>{{ selectedFieldB.id }}</strong>
                                </template>
                            </Multiselect>
                        </template>
                        <template v-else>
                            <Multiselect
                                v-if="featuresList.length"
                                v-model="selectedFieldB.id"
                                class="feature_selection selection"
                                :options="featuresList"
                                group-label="group"
                                :group-select="false"
                                group-values="data"
                                :multiple="false"
                                selectedLabel=""
                                selectLabel=""
                                deselectLabel=""
                                :placeholder="$t('additional:modules.tools.cosi.calculateRatio.placeholderB')"
                            >
                                <template slot="singleLabel">
                                    <strong>{{ selectedFieldB.id }}</strong>
                                </template>
                            </Multiselect>
                        </template>
                        <div
                            v-if="selectedFieldB.id"
                            class="subsection"
                        >
                            <template v-if="BSwitch">
                                <div class="sub_wrapper">
                                    <div
                                        class="faktor_f"
                                    >
                                        <div
                                            class="btn"
                                            :class="{ reduced: fActive_B }"
                                        >
                                            <button @click="fActive_B = !fActive_B">
                                                <span
                                                    v-if="fActive_B"
                                                    class="glyphicon glyphicon-remove"
                                                ></span>
                                                <span v-else>Faktor (F) hinzufügen</span>
                                            </button>
                                        </div>
                                        <div
                                            v-if="fActive_B"
                                            class="input"
                                        >
                                            <input
                                                v-model="faktorf_B"
                                                type="number"
                                            >
                                        </div>
                                    </div>
                                    <Multiselect
                                        v-if="featuresList.length"
                                        v-model="paramFieldB"
                                        track-by="name"
                                        label="name"
                                        class="feature_selection selection"
                                        :options="facilityPropertyList_B"
                                        :multiple="false"
                                        :preselect-first="true"
                                        :disabled="facilityPropertyList_B.length < 2"
                                        selectedLabel=""
                                        selectLabel=""
                                        deselectLabel=""
                                        placeholder=""
                                    >
                                        <template slot="singleLabel">
                                            <strong>{{ paramFieldB.name }}</strong>
                                        </template>
                                    </Multiselect>
                                </div>
                            </template>
                            <template v-else>
                                <div class="sub_wrapper">
                                    <div class="custom_wrapper">
                                        <p>berechnen pro </p>
                                        <input
                                            v-model="perCalc_B"
                                            type="number"
                                        >
                                        <p><strong> der Datengrundlage</strong></p>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                    <div
                        v-if="selectedFieldA.id && selectedFieldB.id"
                        class="select_wrapper section third"
                    >
                        <div class="btn_grp finalization">
                            <button
                                class="cancel"
                                @click="clearAllValues"
                            >
                                <span class="glyphicon glyphicon-remove-circle"></span>
                                Zurücksetzen
                            </button>
                            <button
                                class="confirm"
                                @click="prepareCoverage"
                            >
                                <span class="glyphicon glyphicon-ok-circle"></span>
                                Berechnen
                            </button>
                        </div>
                    </div>

                    <div
                        v-if="results.length > 0"
                        class="data_table"
                    >
                        <VGrid
                            class="revo-grid"
                            theme="material"
                            :source="results"
                            :columns="gridColumns"
                            width="100%"
                            height="auto"
                        ></VGrid>
                    </div>
                </div>
            </div>
        </template>
    </tool>
</template>


<style lang="less">
    @import "../../utils/variables.less";
    @import (less) "../../node_modules/vue-multiselect/dist/vue-multiselect.min.css";

    #calculateratio {
        background:rgba(255,255,255,0.95);
        width:400px;
        height:60vh;

        .select_wrapper {
            display:flex;
            flex-flow:row wrap;
            justify-content:flex-start;

            .button {
                flex-basis:30%;
                background: @masterportal_blue;

                button {
                    background: transparent;
                    border:none;
                    color:whitesmoke;
                    font-size:90%;
                }
            }
            .selection {
                flex: 1 1 66%;
                margin-left:6px;
            }

            .subsection {
                width:100%;
                margin:5px auto;

                .sub_wrapper {
                    width:100%;
                    display:flex;
                    flex-flow:row wrap;
                    justify-content: flex-start;

                    .faktor_f {
                        display:flex;
                        flex-flow:row nowrap;
                        justify-content: flex-start;
                        flex-basis:30%;

                        .btn {
                            flex-basis:100%;
                            margin:0;
                            padding:0;
                            height:40px;

                            button {
                                width:100%;
                                height:40px;
                                font-size:70%;
                                font-weight:700;
                            }

                            &.reduced {
                                flex-basis:40px;
                            }
                        }

                        .input {
                            position:relative;
                            flex-basis:calc(100% - 40px);
                            flex-grow: 1;
                            flex-shrink: 1;
                            margin:1px 0px 0px -2px;

                            input {
                                width:100%;
                                height:40px;
                                text-align:center;
                                font-weight:900;
                                border:1px solid #ccc;
                            }
                        }
                    }

                    .custom_wrapper {
                        display:flex;
                        flex-flow:row wrap;
                        justify-content:center;
                        width:100%;
                        margin:0;

                        input {
                            flex-basis: 33%;
                            text-align:center;
                            height:40px;
                            font-weight:700;
                            margin:0px 5px;
                            border:1px solid #ccc;
                        }

                        p {
                            flex: 1 1 25%;
                            line-height: 40px;
                            margin: 0px;
                            font-size: 80%;
                            text-align: center;
                        }
                    }
                }
            }
        }


        &.expanded {
            width:700px;

            .addon_wrapper {
                display:flex;
                flex-flow: row wrap;
                justify-content:flex-start;

                .section.intro {
                    display:none;
                }

                .section {
                    flex:1 0 45%;
                    margin:5px;
                }

                .data_table {
                    flex-basis:100%;
                    height:400px;

                    .revo-grid {
                        width:100%;

                        .viewports {
                            width:100%;
                        }
                    }
                }
            }
        }
    }
</style>
