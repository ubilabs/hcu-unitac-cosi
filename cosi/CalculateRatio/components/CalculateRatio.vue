<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersCalculateRatio";
import mutations from "../store/mutationsCalculateRatio";
import MappingJsonFacilities from "../mapping.json";
// import MappingJsonFeatures from "../../assets/mapping.json";
import utils from "../../utils";
import Multiselect from "vue-multiselect";
import JsonExcel from "vue-json-excel";
import store from "../../../../src/app-store";

export default {
    name: "CalculateRatio",
    components: {
        Tool,
        Multiselect,
        JsonExcel
    },
    data () {
        return {
            layerIdList: [],
            facilityList: [],
            featuresList: [],
            subFeaturesList: [],
            availableYears: [],
            selectedYear: "",
            facilityPropertyList_A: [],
            facilityPropertyList_B: [],
            ASwitch: true,
            BSwitch: true,
            sumUpSwitchA: false,
            sumUpSwitchB: false,
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
            results: [],
            resultsClone: [],
            columnSelector: "relation"
        };
    },
    computed: {
        ...mapGetters("Tools/CalculateRatio", Object.keys(getters)),
        ...mapGetters("Tools/DistrictSelector", ["selectedFeatures", "label", "keyOfAttrName", "keyOfAttrNameStats"]),
        ...mapGetters("Tools/DistrictLoader", ["mapping", "selectedDistrictLevel", "currentStatsFeatures"]),
        ...mapGetters("Map", ["layerList"]),
        resultData () {
            const json = {
                json_fields: {
                },
                json_data: [],
                json_meta: [
                    [
                        {
                            "key": "charset",
                            "value": "utf-8"
                        }
                    ]
                ]
            };

            json.json_fields[this.label] = "scope";
            json.json_fields[this.selectedFieldA.id] = this.paramFieldA.name === "Anzahl" ? "paramA_count" : "paramA_val";
            json.json_fields[this.selectedFieldB.id] = this.paramFieldB.name === "Anzahl" ? "paramB_count" : "paramB_val";
            json.json_fields[this.selectedFieldA.id + " / " + this.selectedFieldB.id] = "relation";
            json.json_fields.Bedarfsdeckung = "coverage";

            if (this.ASwitch || this.BSwitch) {
                json.json_fields.Kapazität = "capacity";
                json.json_fields.Bedarf = "need";
            }

            this.results.forEach(result => {
                json.json_data.push(result);
            });

            return json;
        },
        availableColumns () {
            const options = [
                {name: "Verhältnis", key: "relation"},
                {name: "Bedarfsdeckung", key: "coverage"}
            ];

            if (this.fActive_A || this.fActive_B) {
                const capacity = {
                        name: "Kapazität",
                        key: "capacity"
                    },
                    need = {
                        name: "Bedarf",
                        key: "need"
                    };

                options.push(capacity, need);
            }

            return options;
        }
    },
    watch: {
        layerList () {
            this.layerIdList = this.layerList.map(x => x.getProperties().name);
            this.updateFacilities();
        },
        selectedDistrictLevel: {
            deep: true,
            handler () {
                if (this.selectedDistrictLevel.features?.length > 0) {
                    this.updateFeaturesList();
                }
            }
        },
        availableYears (newYears) {
            if (newYears.length > 0) {
                this.selectedYear = newYears[0];
            }
        },
        results (newResults) {
            if (newResults.length > 0) {
                this.resultsClone = [...newResults];
            }
        },
        resultsClone (newClone) {
            newClone.forEach((result, index) => {
                if (result.scope === "Gesamt" || result.scope === "Durchschnitt") {
                    newClone.splice(index, 1);
                }
            });
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
        /**
         * @todo todo
         * @description todo
         * @returns {void}
         */
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
        /**
         * @todo todo
         * @description todo
         * @returns {void}
         */
        updateFeaturesList () {
            this.featuresList = [];
            this.availableYears = utils.getAvailableYears(this.currentStatsFeatures, this.yearSelector);
            this.mapping.forEach(attr => {
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

                    if (attr.summable) {
                        if (this.subFeaturesList.length === 0) {
                            const createSubObj = {
                                group: "Aufsummierbar",
                                data: [attr.value]
                            };

                            this.subFeaturesList.push(createSubObj);
                        }
                        else {
                            this.subFeaturesList[0].data.push(attr.value);
                        }

                    }
                }
            });

            if (this.featuresList.length !== 0) {
                this.BSwitch = false;
            }

            console.log(this.featuresList);
        },
        /**
         * @todo todo
         * @description todo
         * @returns {void}
         */
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
        /**
         * @todo todo
         * @description todo
         * @param {String} letter The String that is to be modified.
         * @returns {void}
         */
        checkSumUp (letter) {
            if (!this[letter + "Switch"]) {
                const checkSumUp = this.mapping.find(x => x.value === this["selectedField" + letter].id);

                if (!this["sumUpSwitch" + letter]) {
                    if (checkSumUp.summable) {
                        this["sumUpSwitch" + letter] = true;
                    }
                }
                else if (this["selectedField" + letter].id === "" || this["selectedField" + letter].id.length === 0) {
                    this["sumUpSwitch" + letter] = false;
                }
            }
        },
        /**
         * @todo todo
         * @description todo
         * @param {String} letter The String that is to be modified.
         * @returns {void}
         */
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
        /**
         * @todo todo
         * @description Clears all values from Field A and Field B
         * @returns {void}
         */
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
        /**
         * @todo todo
         * @description todo
         * @returns {void}
         */
        switchSelection () {
            const h_selectedFieldA = this.selectedFieldA,
                h_selectedFieldB = this.selectedFieldB,
                h_paramFieldA = this.paramFieldA,
                h_paramFieldB = this.paramFieldB,
                h_fActive_A = this.fActive_A,
                h_fActive_B = this.fActive_B,
                h_faktorf_A = this.faktorf_A,
                h_faktorf_B = this.faktorf_B,
                h_ASwitch = this.ASwitch,
                h_BSwitch = this.BSwitch;

            this.ASwitch = h_BSwitch;
            this.BSwitch = h_ASwitch;
            this.selectedFieldA = h_selectedFieldB;
            this.selectedFieldB = h_selectedFieldA;
            this.paramFieldA = h_paramFieldB;
            this.paramFieldB = h_paramFieldA;
            this.fActive_A = h_fActive_B;
            this.fActive_B = h_fActive_A;
            this.faktorf_A = h_faktorf_B;
            this.faktorf_B = h_faktorf_A;

            if (this.results.length > 0) {
                this.prepareCoverage();
            }
        },
        /**
         * @todo todo
         * @description todo
         * @param {String} letter The String that is to be modified.
         * @returns {void}
         */
        prepareCoverage () {
            this.results = [];
            this.selectedFeatures.forEach(district => {
                const name = district.getProperties()[this.keyOfAttrName],
                    geometry = district.getGeometry();

                this.calcHelper = {};
                this.calcHelper.name = name;
                if (this.ASwitch) {
                    const findLayer = this.layerList.find(layer => layer.get("name") === this.selectedFieldA.id),
                        layerFeatures = findLayer.getSource().getFeatures();

                    this.featureVals = [];
                    layerFeatures.forEach(layer => {
                        const layerGeometry = layer.getGeometry().getExtent();

                        if (geometry.intersectsExtent(layerGeometry)) {
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
                    if (Array.isArray(this.selectedFieldA.id)) {
                        this.selectedFieldA.id.forEach(id => {
                            const featureData = this.getFeatureData(name, id);

                            this.featureVals.push(featureData);
                        });

                        const sumUpYearValues = {};

                        this.featureVals = [].concat(...this.featureVals);
                        this.featureVals.forEach(year => {
                            if (sumUpYearValues[year.jahr]) {
                                sumUpYearValues[year.jahr] += year.wert;
                            }
                            else {
                                sumUpYearValues[year.jahr] = year.wert;
                            }
                        });
                        this.featureVals = sumUpYearValues;
                    }
                    else {
                        const featureData = this.getFeatureData(name, this.selectedFieldA.id),
                            yearValues = {};

                        featureData.forEach(year => {
                            yearValues[year.jahr] = year.wert;
                        });
                        this.featureVals = yearValues;
                    }

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
                    if (Array.isArray(this.selectedFieldB.id)) {
                        this.selectedFieldB.id.forEach(id => {
                            const featureData = this.getFeatureData(name, id);

                            this.featureVals.push(featureData);
                        });

                        const sumUpYearValues = {};

                        this.featureVals = [].concat(...this.featureVals);
                        this.featureVals.forEach(year => {
                            if (sumUpYearValues[year.jahr]) {
                                sumUpYearValues[year.jahr] += year.wert;
                            }
                            else {
                                sumUpYearValues[year.jahr] = year.wert;
                            }
                        });

                        this.featureVals = sumUpYearValues;
                    }
                    else {
                        const featureData = this.getFeatureData(name, this.selectedFieldB.id),
                            yearValues = {};

                        featureData.forEach(year => {
                            yearValues[year.jahr] = year.wert;
                        });
                        this.featureVals = yearValues;
                    }

                    this.calcHelper.paramB_val = this.featureVals;
                }

                this.calculateRatio(name, this.calcHelper);
            });

            this.calculateTotalValues();
        },
        /**
         * @todo todo
         * @description todo
         * @param {String} districtName The String that is to be modified.
         * @param {String} featureName The String that is to be modified.
         * @returns {void}
         */
        getFeatureData (districtName, featureName) {
            const featureDataList = [];

            this.currentStatsFeatures.forEach(feature => {
                if (utils.unifyString(feature.getProperties()[this.keyOfAttrNameStats]) === utils.unifyString(districtName) && utils.unifyString(feature.get("kategorie")) === utils.unifyString(featureName)) {
                    Object.entries(feature.getProperties()).forEach(([key, val]) => {
                        if (key.includes(this.yearSelector)) {
                            const obj = {
                                jahr: key.substr(key.indexOf("_") + 1),
                                wert: parseFloat(val)
                            };

                            featureDataList.push(obj);
                        }
                    });
                }
            });

            return featureDataList;
        },
        /**
         * @todo todo
         * @description todo
         * @param {String} name The String that is to be modified.
         * @param {String} data The String that is to be modified.
         * @returns {void}
         */
        calculateRatio (name, data) {
            const calcObj = {
                    scope: name,
                    paramA_count: this.ASwitch ? data.paramA_count : 0,
                    paramA_val: typeof data.paramA_val === "object" ? data.paramA_val[this.selectedYear] : data.paramA_val,
                    paramB_count: this.BSwitch ? data.paramB_count : 0,
                    paramB_val: typeof data.paramB_val === "object" ? data.paramB_val[this.selectedYear] : data.paramB_val
                },
                relation = (this.paramFieldA.name === "Anzahl" ? calcObj.paramA_count : calcObj.paramA_val) / (this.paramFieldB.name === "Anzahl" ? calcObj.paramB_count : calcObj.paramB_val),
                mirroredRelation = Math.round((((this.paramFieldB.name === "Anzahl" ? calcObj.paramB_count : calcObj.paramB_val)) / ((this.paramFieldA.name === "Anzahl" ? calcObj.paramA_count : calcObj.paramA_val)) + Number.EPSILON) * 100) / 100,
                capacity = Math.round((((this.paramFieldA.name === "Anzahl" ? calcObj.paramA_count : calcObj.paramA_val) * (this.faktorf_B / this.faktorf_A)) + Number.EPSILON) * 100) / 100,
                need = Math.round((((this.paramFieldB.name === "Anzahl" ? calcObj.paramB_count : calcObj.paramB_val) * (this.faktorf_A / this.faktorf_B)) + Number.EPSILON) * 100) / 100,
                coverageA = this.fActive_A || this.fActive_B ? Math.round(((((this.paramFieldA.name === "Anzahl" ? calcObj.paramA_count : calcObj.paramA_val) / need) * this.perCalc_B) + Number.EPSILON) * 100) / 100 : Math.round(((this.perCalc_B * relation) + Number.EPSILON) * 100) / 100,
                coverageB = this.fActive_A || this.fActive_B ? Math.round(((((this.paramFieldB.name === "Anzahl" ? calcObj.paramB_count : calcObj.paramB_val) / need) * this.perCalc_A) + Number.EPSILON) * 100) / 100 : Math.round(((this.perCalc_A * mirroredRelation) + Number.EPSILON) * 100) / 100,
                weightedRelation = Math.round(((relation * (this.perCalc_A / this.perCalc_B)) + Number.EPSILON) * 100) / 100;

            calcObj.relation = relation;
            calcObj.mirroredRelation = mirroredRelation;
            calcObj.capacity = capacity;
            calcObj.need = need;
            calcObj.coverage = coverageA;
            calcObj.mirrorCoverage = coverageB;
            calcObj.weightedRelation = weightedRelation;
            calcObj.data = data;

            this.results.push(calcObj);
        },
        /**
         * @todo todo
         * @description todo
         * @returns {void}
         */
        recalcData () {
            this.results = [];

            this.resultsClone.forEach(result => {
                this.calculateRatio(result.scope, result.data);
            });

            this.calculateTotalValues();

            console.log(this.results);
        },
        /**
         * @todo todo
         * @description todo
         * @returns {void}
         */
        calculateTotalValues () {
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
        },
        /**
         * @todo todo
         * @description todo
         * @returns {void}
         */
        loadToCCM () {
            const switchVar = this.$store.state.dataToCCM;

            if (!switchVar) {
                const prepareData = [];

                this.results.forEach(result => {
                    if (result.scope !== "Gesamt" || result.scope !== "Durschnitt") {
                        const data = {
                            name: result.scope,
                            data: result[this.columnSelector.key]
                        };

                        prepareData.push(data);
                    }
                });

                this.$store.commit("Tools/CalculateRatio/setCcmDataSet", prepareData);
                this.$store.commit("Tools/CalculateRatio/setDataToCCM", !switchVar);
            }
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
                            <span>{{ $t("additional:modules.tools.cosi.calculateRatio.warningNoData") }}</span>
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
                                    <span>{{ $t("additional:modules.tools.cosi.calculateRatio.dataA") }}</span>
                                </template>
                                <template v-else>
                                    <span>{{ $t("additional:modules.tools.cosi.calculateRatio.dataB") }}</span>
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
                                id="feature_selector_A"
                                v-model="selectedFieldA.id"
                                class="feature_selection selection"
                                :options="sumUpSwitchA ? subFeaturesList : featuresList"
                                group-label="group"
                                :group-select="false"
                                group-values="data"
                                :multiple="sumUpSwitchA ? true : false"
                                selectedLabel=""
                                selectLabel=""
                                deselectLabel=""
                                :placeholder="$t('additional:modules.tools.cosi.calculateRatio.placeholderA')"
                                @input="checkSumUp('A')"
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
                                    <span>{{ $t("additional:modules.tools.cosi.calculateRatio.dataA") }}</span>
                                </template>
                                <template v-else>
                                    <span>{{ $t("additional:modules.tools.cosi.calculateRatio.dataB") }}</span>
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
                                id="feature_selector_B"
                                v-model="selectedFieldB.id"
                                class="feature_selection selection"
                                :options="sumUpSwitchB ? subFeaturesList : featuresList"
                                group-label="group"
                                :group-select="false"
                                group-values="data"
                                :multiple="sumUpSwitchB ? true : false"
                                selectedLabel=""
                                selectLabel=""
                                deselectLabel=""
                                :placeholder="$t('additional:modules.tools.cosi.calculateRatio.placeholderB')"
                                @input="checkSumUp('B')"
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
                                class="switch"
                                @click="switchSelection"
                            >
                                <span class="glyphicon glyphicon-retweet"></span>
                            </button>
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
                        <div class="head_wrapper">
                            <JsonExcel
                                class="btn btn-default xl_btn"
                                :data="resultData.json_data"
                                :fields="resultData.json_fields"
                                worksheet="Versorgungsanalyse"
                                :name="selectedYear + '_versorgungsanalyse.xls'"
                            >
                                <span class="glyphicon glyphicon-download"></span>Download XSL
                            </JsonExcel>
                            <Multiselect
                                v-model="columnSelector"
                                track-by="name"
                                label="name"
                                class="column_selection selection"
                                :options="availableColumns"
                                :multiple="false"
                                :preselect-first="true"
                                selectedLabel=""
                                selectLabel=""
                                deselectLabel=""
                                placeholder=""
                            >
                                <template slot="singleLabel">
                                    <span><strong>{{ columnSelector.name }}</strong></span>
                                </template>
                            </Multiselect>
                            <button
                                class="ccm"
                                :class="{ highlight: !dataToCCM}"
                                @click="loadToCCM()"
                            >
                                <span
                                    v-if="!dataToCCM"
                                    class="glyphicon glyphicon-eye-open"
                                ></span>
                                <span
                                    v-else
                                    class="glyphicon glyphicon-eye-close"
                                ></span>
                            </button>
                            <div
                                v-if="!ASwitch || !BSwitch"
                                class="year_selector"
                            >
                                <Multiselect
                                    v-model="selectedYear"
                                    class="year_selection selection"
                                    :options="availableYears"
                                    :allow-empty="false"
                                    :multiple="false"
                                    :preselect-first="true"
                                    :disabled="ASwitch && BSwitch"
                                    selectedLabel=""
                                    selectLabel=""
                                    deselectLabel=""
                                    placeholder=""
                                    @input="recalcData()"
                                >
                                    <template slot="singleLabel">
                                        <strong>{{ selectedYear }}</strong>
                                    </template>
                                </Multiselect>
                            </div>
                        </div>
                        <table class="forged_table">
                            <tr class="head_row">
                                <th>
                                    <div class="styling_helper head_scope">
                                        {{ label }}
                                    </div>
                                </th>
                                <th>
                                    <div class="styling_helper">
                                        {{ Array.isArray(selectedFieldA.id) ? "Aufsummierte Auswahl" : selectedFieldA.id }}
                                    </div>
                                </th>
                                <th>
                                    <div class="styling_helper">
                                        {{ Array.isArray(selectedFieldB.id) ? "Aufsummierte Auswahl" : selectedFieldB.id }}
                                    </div>
                                </th>
                                <th v-if="fActive_A || fActive_B">
                                    <div class="styling_helper">
                                        Kapazität
                                    </div>
                                </th>
                                <th v-if="fActive_A || fActive_B">
                                    <div class="styling_helper">
                                        Bedarf
                                    </div>
                                </th>
                                <th>
                                    <div class="styling_helper">
                                        {{ Array.isArray(selectedFieldA.id) ? "Aufsummierte Auswahl" : selectedFieldA.id }} / {{ Array.isArray(selectedFieldB.id) ? "Aufsummierte Auswahl" : selectedFieldB.id }}
                                    </div>
                                </th>
                                <th>
                                    <div class="styling_helper">
                                        Bedarfsdeckung (1,0 ~ 100%)
                                    </div>
                                </th>
                            </tr>
                            <tr
                                v-for="result in results"
                                :key="result.scope"
                            >
                                <td class="row_head">
                                    <div class="styling_helper scope">
                                        {{ result.scope }}
                                    </div>
                                </td>
                                <td>
                                    <div class="styling_helper">
                                        {{ paramFieldA.name === "Anzahl" ? result.paramA_count : result.paramA_val }}
                                    </div>
                                </td>
                                <td>
                                    <div class="styling_helper">
                                        {{ paramFieldB.name === "Anzahl" ? result.paramB_count : result.paramB_val }}
                                    </div>
                                </td>
                                <td v-if="fActive_A || fActive_B">
                                    <div class="styling_helper">
                                        {{ result.capacity }}
                                    </div>
                                </td>
                                <td v-if="fActive_A || fActive_B">
                                    <div class="styling_helper">
                                        {{ result.need }}
                                    </div>
                                </td>
                                <td>
                                    <div class="styling_helper">
                                        {{ result.relation.toFixed(2) }}
                                    </div>
                                </td>
                                <td>
                                    <div class="styling_helper">
                                        {{ result.coverage }}
                                    </div>
                                </td>
                            </tr>
                        </table>
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

        .section {
            &.third {
                    border:1px solid #ddd;
                }
        }

        .select_wrapper {
            display:flex;
            flex-flow:row wrap;
            justify-content:flex-start;
            align-content:flex-start;

            .button {
                flex-basis:30%;
                background: #222;
                margin: 0px 5px 5px 0px;

                button {
                    background: transparent;
                    border:none;
                    color:whitesmoke;
                    font-size:90%;
                }

                &:hover {
                    background:#666;
                }
            }
            .selection {
                flex: 1 1 66%;
                margin:0px;
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
                        margin-right:5px;

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
            width:780px;

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
                    height:auto;
                    margin:20px 5px;

                    .head_wrapper {
                        display:flex;
                        flex-flow:row wrap;
                        justify-content:flex-end;

                        .xl_btn {
                            height:40px;
                            line-height:40px;
                            width:auto;
                            opacity:0.75;
                            background:#57A845;
                            color:white;
                            padding: 0px 10px;
                            margin:5px auto 5px 0;

                            span {
                                margin-right:10px;
                            }

                            &:hover {
                                opacity:1;
                            }
                        }

                        button.ccm {
                            height:40px;
                            width:40px;
                            margin:5px 10px 5px 5px;

                            &.highlight {
                                color:white;
                                border:none;
                                background:@brightblue;
                            }
                        }

                        .column_selection {
                            flex:0 0 160px;
                            margin:5px 0px
                        }

                        .year_selector {
                            width: 200px;
                            margin: 5px 0px;
                        }
                    }

                    .forged_table {
                        overflow:hidden;
                    }
                }
            }
        }
    }
</style>
