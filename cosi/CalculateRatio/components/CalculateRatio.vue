<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersCalculateRatio";
import mutations from "../store/mutationsCalculateRatio";
import utils from "../../utils";
import Multiselect from "vue-multiselect";
import JsonExcel from "vue-json-excel";
import DataTable from "./DataTable.vue";
import Info from "text-loader!./info.html";
import {exportAsGeoJson} from "../utils/exportResults";
import mapping from "../../assets/mapping.json";

export default {
    name: "CalculateRatio",
    components: {
        Tool,
        Multiselect,
        JsonExcel,
        DataTable
    },
    data () {
        return {
            // All available features
            featuresStatistics: [],
            // List with names of selected Layers
            layerIdList: [],
            // List of all available "facilites" (theme layers)
            facilityList: [],
            // filter IDs for facility list
            filters: {},
            // Sorted an grouped list of availabke features
            featuresList: [],
            // List with summable features like "age 10-15" etc
            subFeaturesList: [],
            // All available years in data
            availableYears: [],
            // Year the user selected manually
            selectedYear: "",
            // Properties of facility type (like Schülerzahl in schools) for Field A
            facilityPropertyList_A: [],
            // Properties of facility type (like Schülerzahl in schools) for Field B
            facilityPropertyList_B: [],
            // Var that controls if user calculates with statistical data (feature) oder facility for Field A
            ASwitch: true,
            // Var that controls if user calculates with statistical data (feature) oder facility for Field B
            BSwitch: true,
            // Var that controls if user chose summable statistical data set for Field A
            sumUpSwitchA: false,
            // Var that controls if user chose summable statistical data set for Field B
            sumUpSwitchB: false,
            // Selected value for Field A (it's an object because it can carry more information like values or properties, depending on the data set)
            selectedFieldA: {id: ""},
            // Selected value for Field B (it's an object because it can carry more information like values or properties, depending on the data set)
            selectedFieldB: {id: ""},
            // Selected property for Field A (facility only)
            paramFieldA: {name: "", id: ""},
            // Selected property for Field B (facility only)
            paramFieldB: {name: "", id: ""},
            // "Faktor F" has been entered by the user for Field A
            fActive_A: false,
            // "Faktor F" has been entered by the user for Field B
            fActive_B: false,
            // "Faktor F" for Field A
            faktorf_A: 1,
            // "Faktor F" for Field B
            faktorf_B: 1,
            // Modifier "berechnen pro" for Field A
            perCalc_A: 1,
            // Modifier "berechnen pro" for Field B
            perCalc_B: 1,
            // Helper Array to use selected values beyond function scope
            featureVals: [],
            // Object that helps calculating the data in prepareCoverage function
            calcHelper: {},
            // Clone of the results array for helping updating the displayed table live
            resultsClone: [],
            // Selected column to render in CCM
            columnSelector: {name: "Verhältnis", key: "relation"}
        };
    },
    computed: {
        ...mapGetters("Tools/CalculateRatio", Object.keys(getters)),
        ...mapGetters("Tools/DistrictSelector", ["selectedFeatures", "label", "keyOfAttrName", "keyOfAttrNameStats", "selectedStatFeatures", "loadend"]),
        ...mapGetters("Tools/FeaturesList", {facilitiesMapping: "mapping"}),
        ...mapGetters("Map", ["layerList"]),
        ...mapGetters("Tools/ColorCodeMap", ["visualizationState"]),
        // Transforming results data for excel export
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
        loadend (newValue) {
            if (newValue && this.selectedStatFeatures.length > 0) {

                this.updateFeaturesList();
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
        },
        visualizationState (newState) {
            if (!newState) {
                this.$store.commit("Tools/CalculateRatio/setDataToColorCodeMap", false);
            }
        },
        facilitiesMapping () {
            this.updateFacilities();
        },
        filters () {
            this.prepareCoverage();
        }
    },
    created () {
        this.$on("close", this.close);
    },
    mounted () {
        this.applyTranslationKey(this.name);

        Radio.on("Filter", "filteredIdsChanged", (layerId, featureIds) => {
            this.filters[layerId] = featureIds;
        });

        if (this.facilityList.length === 0) {
            this.ASwitch = false;
            this.BSwitch = false;
        }
    },
    methods: {
        ...mapMutations("Tools/CalculateRatio", Object.keys(mutations)),
        ...mapActions("Alerting", ["addSingleAlert", "cleanup"]),
        ...mapActions("Tools/ChartGenerator", ["channelGraphData"]),
        ...mapMutations("Tools/ChartGenerator", ["setNewDataSet"]),
        /**
         * @description Updates theme layer selection and sorting/ grouping it for display in multiselect.
         * @todo triggers too often!!! refactor
         * @returns {void}
         */
        updateFacilities () {
            this.facilityList = this.facilitiesMapping.reduce((list, group) => {
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
         * @description Updates featuresList and sorting/ grouping it for display in multiselect.
         * @returns {void}
         */
        updateFeaturesList () {
            this.featuresList = [];
            this.availableYears = utils.getAvailableYears(this.selectedStatFeatures, this.yearSelector);
            mapping.forEach(attr => {
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
        },
        /**
         * @description Changes dropdown display between statistical data (features) and them layers (facilities).
         * @param {String} letter String that determines which field is to be modified (A or B for FieldA or FieldB).
         * @returns {void}
         */
        switchVal (letter) {
            if (this[letter + "Switch"]) {
                if (this.featuresList.length === 0) {
                    this.showAlert(this.$t("additional:modules.tools.cosi.calculateRatio.noFeaturesWarning"));
                }
                else {
                    this[letter + "Switch"] = !this[letter + "Switch"];
                    this["selectedField" + letter] = {id: ""};
                    this["paramField" + letter] = "";
                }
            }
            else if (this.facilityList.length === 0) {
                this.showAlert(this.$t("additional:modules.tools.cosi.calculateRatio.noFacilitiesWarning"));
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
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.id});

            if (model) {
                model.set("isActive", false);
            }
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
         * @description Checks if the user selected a summable statistical data set (feature).
         * @param {String} letter String that determines which field is to be modified (A or B for FieldA or FieldB).
         * @returns {void} Function returns nothing.
         */
        checkSumUp (letter) {
            if (!this[letter + "Switch"]) {
                const checkSumUp = mapping.find(x => x.value === this["selectedField" + letter].id);

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
         * @description Gets Data for the selected theme layer (facility)
         * @param {String} letter String that determines for which field the data should be loaded (A or B for FieldA or FieldB).
         * @returns {void}
         */
        getFacilityData (letter) {
            if (this[letter + "Switch"]) {
                this["facilityPropertyList_" + letter] = [];
                const findLayer = this.layerList.find(layer => layer.get("name") === this["selectedField" + letter].id),
                    layerId = findLayer.get("id"),
                    layerFeatures = findLayer.getSource().getFeatures(),
                    countData = {
                        name: "Anzahl",
                        // count: layerFeatures.length,
                        count: layerId in this.filters ? this.filters[layerId][0].ids.length : layerFeatures.length,
                        filter: layerId in this.filters ? this.filters[layerId][0].ids : ""
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
         * @description Clears all values from Field A and Field B
         * @returns {void}
         */
        clearAllValues () {
            this.selectedFieldA = {id: ""};
            this.selectedFieldB = {id: ""};
            this.paramFieldA = {name: "", id: ""};
            this.paramFieldB = {name: "", id: ""};
            this.fActive_A = false;
            this.fActive_B = false;
            this.faktorf_A = 1;
            this.faktorf_B = 1;
            this.setResults([]);
        },
        /**
         * @description Switches all parameters between FieldA and FieldB.
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
         * @description Fires when user hits calulcate button. Prepares data sets for calculation. Triggers coverageFunction twice.
         * @returns {void}
         */
        prepareCoverage () {
            this.setResults([]);
            const allData = [],

                dataArray_A = this.coverageFunction("A"),
                dataArray_B = this.coverageFunction("B");

            dataArray_A.forEach((obj_A) => {
                const obj_B = dataArray_B.find(obj => obj.name === obj_A.name),
                    combined = {...obj_A, ...obj_B};

                allData.push(combined);
            });

            this.setResults(utils.calculateRatio(allData, this.selectedYear));
            this.setResultHeaders({
                typeA: Array.isArray(this.selectedFieldA.id) ? this.$t("additional:modules.tools.cosi.calculateRatio.addedSelection") : this.selectedFieldA.id,
                typeB: Array.isArray(this.selectedFieldB.id) ? this.$t("additional:modules.tools.cosi.calculateRatio.addedSelection") : this.selectedFieldB.id,
                fActive: this.fActive_A || this.fActive_B,
                faktorF: `${this.faktorf_B} / ${this.faktorf_A}`
            });
        },
        /**
         * @description Fires when user hits calulcate button. Prepares data sets for calculation.
         * @param {String} letter "A" or "B" for selectedFieldA or selectedFieldB.
         * @returns {Array} dataArray -> Array containing all collected data for all selected districts.
         */
        coverageFunction (letter) {
            const dataArray = [];


            this.selectedFeatures.forEach(district => {
                const name = district.getProperties()[this.keyOfAttrName],
                    geometry = district.getGeometry();

                this.calcHelper = {};
                this.calcHelper.name = name;
                this.calcHelper["faktorf_" + letter] = this["faktorf_" + letter];
                this.calcHelper["perCalc_" + letter] = this["perCalc_" + letter];
                if (this[letter + "Switch"]) {
                    const findLayer = this.layerList.find(layer => layer.get("name") === this["selectedField" + letter].id),
                        layerFeatures = findLayer.getSource().getFeatures();

                    this.checkFilters(findLayer.get("id"), layerFeatures);
                    this.calcHelper["type_" + letter] = "facility";
                    this.featureVals = [];
                    layerFeatures.forEach(feature => {
                        if (this.filters[findLayer.get("id")][0].ids.includes(feature.getId())) {
                            const layerGeometry = feature.getGeometry().getExtent();

                            if (geometry.intersectsExtent(layerGeometry)) {
                                if (this.paramFieldA.name !== "Anzahl") {
                                    if (
                                        typeof feature.getProperties()[this["paramField" + letter].id] !== "number" ||
                                        typeof feature.getProperties()[this["paramField" + letter].id] !== "string"
                                    ) {
                                        const value = feature.getProperties()[this["paramField" + letter].id],
                                            valueTransformed = typeof value === "string" ? parseFloat(value.replace(/\D/g, "")) : value;

                                        this.featureVals.push(valueTransformed);
                                    }
                                    else {
                                        this.featureVals.push("");
                                    }
                                }
                                else {
                                    this.featureVals.push(0);
                                }
                            }
                        }
                    });

                    // eslint-disable-next-line
                    const checkForLackingData = utils.compensateLackingData(this.featureVals);

                    if (checkForLackingData === "error") {
                        this.showAlert("Warnung für das Gebiet: " + district + this.$t("additional:modules.tools.cosi.calculateRatio.noData"));
                        return;
                    }

                    this.calcHelper["param" + letter + "_count"] = this.featureVals.length;
                    this.calcHelper["param" + letter + "_val"] = checkForLackingData.data.reduce((total, val) => total + parseFloat(val), 0);
                    this.calcHelper["incompleteDataSets_" + letter] = checkForLackingData.incompleteDataSets;
                    this.calcHelper["dataSets_" + letter] = checkForLackingData.totalDataSets;
                    if (this["paramField" + letter].name === "Anzahl") {
                        this.calcHelper["param" + letter + "_calc"] = this.calcHelper["param" + letter + "_count"];
                    }
                    else {
                        this.calcHelper["param" + letter + "_calc"] = this.calcHelper["param" + letter + "_val"];
                    }
                }
                else {
                    this.featureVals = [];
                    this.calcHelper["type_" + letter] = "feature";
                    if (Array.isArray(this["selectedField" + letter].id)) {
                        this["selectedField" + letter].id.forEach(id => {
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
                        const featureData = this.getFeatureData(name, this["selectedField" + letter].id),
                            yearValues = {};

                        featureData.forEach(year => {
                            yearValues[year.jahr] = year.wert;
                        });
                        this.featureVals = yearValues;
                    }

                    this.calcHelper["param" + letter + "_val"] = this.featureVals;
                    this.calcHelper["param" + letter + "_calc"] = this.calcHelper["param" + letter + "_val"];
                    this.calcHelper["incompleteDataSets_" + letter] = 0;
                }

                dataArray.push(this.calcHelper);
            });

            return dataArray;
        },
        /**
         * @description Checks if filter is set and whitelists all features if not
         * @param {String} layerId Id of the layer.
         * @param {Array} features Features of the layer.
         * @returns {void}
         */
        checkFilters (layerId, features) {
            if (!(layerId in this.filters)) {
                this.filters[layerId] = [{ids: []}];
                this.filters[layerId][0].ids = features.map(feature => feature.getId());
            }
        },
        /**
         * @description Gets Data for the selected statistical data (features)
         * @param {String} districtName name of the district.
         * @param {String} featureName name of the statistical data set (feature).
         * @returns {void}
         */
        getFeatureData (districtName, featureName) {
            const featureDataList = [];

            this.selectedStatFeatures.forEach(feature => {
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
         * @description Recalculate the data set dynamically when one parameter changes.
         * @returns {void}
         */
        recalcData () {
            const dataArray = [];

            this.setResults([]);
            this.resultsClone.forEach(result => {
                dataArray.push(result.data);
            });

            this.setResults(utils.calculateRatio(dataArray, this.selectedYear));
        },
        /**
         * @description Push data that is to be visualized on the map to ColorCodeMap Component.
         * @returns {void}
         */
        loadToColorCodeMap () {
            const switchVar = this.dataToColorCodeMap;

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

                this.setColorCodeMapDataSet(prepareData);
                this.setDataToColorCodeMap(!switchVar);
            }
            else {

                this.setDataToColorCodeMap(!switchVar);
            }
        },
        /**
         * @description Passes data to the Chart Generator Tool.
         * @returns {Void} Function returns nothing.
         */
        loadToChartGenerator () {
            const graphObj = {
                    id: "calcratio",
                    name: "Versorgungsanalyse - Visualisierung " + this.columnSelector.name,
                    type: ["LineChart", "BarChart"],
                    color: "green",
                    source: "Versorgungsanalyse",
                    scaleLabels: [this.columnSelector.name, "Jahre"],
                    data: {
                        labels: [...this.availableYears],
                        dataSets: []
                    }
                },

                dataArray = [];

            this.resultsClone.forEach(result => {
                dataArray.push(result.data);
            });

            this.availableYears.forEach(year => {
                const dataPerYear = utils.calculateRatio(dataArray, year);

                dataPerYear.forEach(dataSet => {
                    const checkExisting = graphObj.data.dataSets.find(set => set.label === dataSet.scope);

                    if (checkExisting) {
                        checkExisting.data.push(dataSet[this.columnSelector.key]);
                    }
                    else {
                        const obj = {
                            label: dataSet.scope,
                            data: [dataSet[this.columnSelector.key]]
                        };

                        graphObj.data.dataSets.push(obj);
                    }
                });
            });

            graphObj.data.labels.reverse();
            graphObj.data.dataSets.forEach(dataSet => {
                dataSet.data.reverse();
            });

            // this.setNewDataSet(graphObj);
            this.channelGraphData(graphObj);
        },

        // the export function from utils
        exportAsGeoJson
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
        :deactivate-gfi="deactivateGFI"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="calculateratio"
                :class="{ expanded: results.length > 0 }"
            >
                <div class="addon_wrapper">
                    <button
                        class="info_button"
                        :title="$t('additional:modules.tools.cosi.calculateRatio.infoTooltip')"
                        @click="showInfo()"
                    >
                        <span class="glyphicon glyphicon-question-sign" />
                    </button>
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
                        <div
                            class="button switch"
                            :title="$t('additional:modules.tools.cosi.calculateRatio.switchFieldType')"
                        >
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
                                selected-label=""
                                select-label=""
                                deselect-label=""
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
                                selected-label=""
                                select-label=""
                                deselect-label=""
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
                                            :title="$t('additional:modules.tools.cosi.calculateRatio.addFactorTooltip')"
                                            :class="{ reduced: fActive_A }"
                                        >
                                            <button @click="fActive_A = !fActive_A">
                                                <span
                                                    v-if="fActive_A"
                                                    class="glyphicon glyphicon-remove"
                                                />
                                                <span v-else>{{ $t('additional:modules.tools.cosi.calculateRatio.addFactor') }}</span>
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
                                        v-if="facilityList.length"
                                        v-model="paramFieldA"
                                        track-by="name"
                                        label="name"
                                        class="feature_selection selection"
                                        :options="facilityPropertyList_A"
                                        :multiple="false"
                                        :preselect-first="true"
                                        :disabled="facilityPropertyList_A.length < 2"
                                        selected-label=""
                                        select-label=""
                                        deselect-label=""
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
                                        <p>{{ $t("additional:modules.tools.cosi.calculateRatio.calcPer") }} </p>
                                        <input
                                            v-model="perCalc_A"
                                            type="number"
                                        >
                                        <p><strong> {{ $t("additional:modules.tools.cosi.calculateRatio.ofData") }}</strong></p>
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
                        <div
                            class="button switch"
                            :title="$t('additional:modules.tools.cosi.calculateRatio.switchFieldType')"
                        >
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
                                selected-label=""
                                select-label=""
                                deselect-label=""
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
                                selected-label=""
                                select-label=""
                                deselect-label=""
                                :placeholder="$t('additional:modules.tools.cosi.calculateRatio.placeholderB')"
                                @input="checkSumUp('B')"
                            >
                                <template slot="singleLabel">
                                    <!-- eslint-disable-next-line vue/no-multiple-template-root -->
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
                                            <button
                                                :title="$t('additional:modules.tools.cosi.calculateRatio.addFactorTooltip')"
                                                @click="fActive_B = !fActive_B"
                                            >
                                                <span
                                                    v-if="fActive_B"
                                                    class="glyphicon glyphicon-remove"
                                                />
                                                <span v-else>{{ $t('additional:modules.tools.cosi.calculateRatio.addFactor') }}</span>
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
                                        v-if="facilityList.length"
                                        v-model="paramFieldB"
                                        track-by="name"
                                        label="name"
                                        class="feature_selection selection"
                                        :options="facilityPropertyList_B"
                                        :multiple="false"
                                        :preselect-first="true"
                                        :disabled="facilityPropertyList_B.length < 2"
                                        selected-label=""
                                        select-label=""
                                        deselect-label=""
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
                                        <p>{{ $t("additional:modules.tools.cosi.calculateRatio.calcPer") }} </p>
                                        <input
                                            v-model="perCalc_B"
                                            type="number"
                                        >
                                        <p><strong> {{ $t("additional:modules.tools.cosi.calculateRatio.ofData") }}</strong></p>
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
                                :title="$t('additional:modules.tools.cosi.calculateRatio.swapFields')"
                                @click="switchSelection"
                            >
                                <span class="glyphicon glyphicon-retweet" />
                            </button>
                            <button
                                class="cancel"
                                :title="$t('additional:modules.tools.cosi.calculateRatio.resetTooltip')"
                                @click="clearAllValues"
                            >
                                <span class="glyphicon glyphicon-remove-circle" />
                                {{ $t('additional:modules.tools.cosi.calculateRatio.reset') }}
                            </button>
                            <button
                                class="confirm"
                                :title="$t('additional:modules.tools.cosi.calculateRatio.calculateTooltip')"
                                @click="prepareCoverage"
                            >
                                <span class="glyphicon glyphicon-ok-circle" />
                                {{ $t('additional:modules.tools.cosi.calculateRatio.calculate') }}
                            </button>
                        </div>
                    </div>

                    <div
                        v-if="results.length > 0"
                        class="data_table"
                    >
                        <div class="head_wrapper">
                            <JsonExcel
                                :title="$t('additional:modules.tools.cosi.calculateRatio.downloadXlsxTooltip')"
                                class="btn btn-default xl_btn"
                                :data="resultData.json_data"
                                :fields="resultData.json_fields"
                                worksheet="Versorgungsanalyse"
                                :name="selectedYear + '_versorgungsanalyse.xlsx'"
                            >
                                <span class="glyphicon glyphicon-download" />
                                {{ $t('additional:modules.tools.cosi.calculateRatio.downloadXlsx') }}
                            </JsonExcel>

                            <button
                                class="btn btn-default xl_btn"
                                :title="$t('additional:modules.tools.cosi.calculateRatio.downloadGeoJsonTooltip')"
                                @click="exportAsGeoJson()"
                            >
                                <span class="glyphicon glyphicon-floppy-disk" />
                                {{ $t('additional:modules.tools.cosi.calculateRatio.downloadGeoJson') }}
                            </button>

                            <button
                                class="cg"
                                :title="$t('additional:modules.tools.cosi.calculateRatio.visualizeChart')"
                                @click="loadToChartGenerator()"
                            >
                                <span
                                    class="glyphicon glyphicon-stats"
                                />
                            </button>
                            <Multiselect
                                v-model="columnSelector"
                                track-by="name"
                                label="name"
                                class="column_selection selection"
                                :options="availableColumns"
                                :multiple="false"
                                :preselect-first="true"
                                selected-label=""
                                select-label=""
                                deselect-label=""
                                placeholder=""
                            >
                                <template slot="singleLabel">
                                    <span><strong>{{ columnSelector.name }}</strong></span>
                                </template>
                            </Multiselect>
                            <button
                                class="ccm"
                                :class="{ highlight: !dataToColorCodeMap}"
                                :title="$t('additional:modules.tools.cosi.calculateRatio.visualizeMap')"
                                @click="loadToColorCodeMap()"
                            >
                                <span
                                    v-if="!dataToColorCodeMap"
                                    class="glyphicon glyphicon-eye-open"
                                />
                                <span
                                    v-else
                                    class="glyphicon glyphicon-eye-close"
                                />
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
                                    selected-label=""
                                    select-label=""
                                    deselect-label=""
                                    placeholder=""
                                    @input="recalcData()"
                                >
                                    <template slot="singleLabel">
                                        <strong>{{ selectedYear }}</strong>
                                    </template>
                                </Multiselect>
                            </div>
                        </div>
                        <DataTable
                            :data-set="results"
                            :type-a="resultHeaders.typeA"
                            :type-b="resultHeaders.typeB"
                            :f-active="resultHeaders.fActive"
                            :faktor-f="resultHeaders.faktorF"
                        />
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

        .info_button {
            display:block;
            width:30px;
            height:30px;
            background:#eee;
            margin:0px 0px 0px auto;
        }

        .section {
            &.intro {
                border-top:1px solid #ccc;
                padding-top:30px;
            }

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

            .info_button {
                position:absolute;
                top:10px;
                right:25px;
            }

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

                    &.grouped {
                        margin-top:30px;
                    }
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
                            background:@green;
                            color:white;
                            padding: 0px 10px;
                            margin:5px 0px;
                            font-size: 12px;x

                            span {
                                margin-right:10px;
                            }

                            &:hover {
                                opacity:1;
                            }
                        }

                        button.ccm, button.cg {
                            height:40px;
                            width:40px;
                            margin:5px;
                            background:#eee;
                            border:1px solid #eee;

                            &:hover {
                                border:1px solid #aaa;
                            }

                            &.highlight {
                                color:white;
                                border:1px solid @brightblue;
                                background:@brightblue;
                            }
                        }

                        button.cg {
                            margin:5px auto 5px 5px;
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
