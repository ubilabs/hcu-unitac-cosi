<script>
import Barchart from "../../../../src/share-components/charts/components/Barchart.vue";
import thousandsSeparator from "../../../../src/utils/thousandsSeparator.js";
import {
    optimizeComplexTypeValues,
    optimizeValueRootedInComplexType,
    convertComplexTypeToBarchart,
    sortComplexType,
    isComplexType,
    hasComplexTypeValues
} from "../../../utils/complexType.js";

/**
 * a complex type is an object to represent a wfs array
 * @typedef {Object} ComplexType
 * @property {Object} metadata the metadata to describe the content of the array
 * @property {String} metadata.type the type e.g. "timeseries"
 * @property {String} metadata.format the format of the keys e.g. "DD.MM.YYYY"
 * @property {String} metadata.description the description of the values
 * @property {ComplexTypeValue[]} values an array of values
 */

/**
 * a set of data in a complex type is an object with key and value params
 * @typedef {Object} ComplexTypeValue
 * @property {String|Number} key the key of the array entry
 * @property {*} value the value for the key
 */

export default {
    name: "BildungsatlasBalkendiagrammWanderungen",
    components: {
        Barchart
    },
    props: {
        /**
         * checks if the given tab name is currently active
         * @param {String} tab the tab name
         * @returns {Boolean}  true if the given tab name is active
         */
        isActiveTab: {
            type: Function,
            required: true
        },

        /**
         * translates the given key, checkes if the key exists and throws a console warning if not
         * @param {String} key the key to translate
         * @param {Object} [options=null] for interpolation, formating and plurals
         * @returns {String} the translation or the key itself on error
         */
        translate: {
            type: Function,
            required: true
        },

        /**
         * the properties as a key value object
         */
        properties: {
            type: Object,
            required: true
        },

        /**
         * the chartRange as object to fix min and max values for the chart
         */
        chartRange: {
            type: [Object, Boolean],
            required: true
        }
    },
    data () {
        return {
            statgeb_id: "",
            sozialraum_name: "",
            stadtteil_name: "",

            wanderungssaldo_u6_complexType: false,
            wanderungssaldo_u6_aus_umland_complexType: false,
            wanderungssaldo_u6_ins_umland_complexType: false,

            wanderungssaldo_u6: false,
            wanderungssaldo_u6_aus_umland: false,
            wanderungssaldo_u6_ins_umland: false,

            barchartData: false,
            barchartDataOptions: {},
            barchartData_aus_umland: false,
            barchartData_ins_umland: false
        };
    },
    watch: {
        // when the gfi window is switched, the gfi is refreshed
        properties: {
            handler (newVal, oldVal) {
                if (oldVal) {
                    this.refreshGfi();
                }
            },
            immediate: true
        }
    },
    mounted () {
        this.refreshGfi();
    },
    methods: {
        /**
         * refreshes the gfi
         * @returns {void}
         */
        refreshGfi () {
            this.statgeb_id = this.properties?.statgeb_id ? this.properties.statgeb_id : "";
            this.sozialraum_name = this.properties?.sozialraum_name ? this.properties.sozialraum_name : "";
            this.stadtteil_name = this.properties?.stadtteil_name ? this.properties.stadtteil_name : "";
            this.bezirk_name = this.properties?.bezirk_name ? this.properties.bezirk_name : "";

            this.wanderungssaldo_u6_complexType = this.properties?.wanderungssaldo_u6 ? this.properties.wanderungssaldo_u6 : "";
            this.wanderungssaldo_u6_aus_umland_complexType = this.properties?.wanderungssaldo_u6_aus_umland ? this.properties.wanderungssaldo_u6_aus_umland : "";
            this.wanderungssaldo_u6_ins_umland_complexType = this.properties?.wanderungssaldo_u6_ins_umland ? this.properties.wanderungssaldo_u6_ins_umland : "";

            this.wanderungssaldo_u6 = isComplexType(this.wanderungssaldo_u6_complexType) ? thousandsSeparator(optimizeValueRootedInComplexType(this.wanderungssaldo_u6_complexType.values[0].value, 2)) : false;
            this.wanderungssaldo_u6_aus_umland = isComplexType(this.wanderungssaldo_u6_aus_umland_complexType) ? thousandsSeparator(optimizeValueRootedInComplexType(this.wanderungssaldo_u6_aus_umland_complexType.values[0].value, 2)) : false;
            this.wanderungssaldo_u6_ins_umland = isComplexType(this.wanderungssaldo_u6_ins_umland_complexType) ? thousandsSeparator(optimizeValueRootedInComplexType(this.wanderungssaldo_u6_ins_umland_complexType.values[0].value, 2)) : false;

            if (hasComplexTypeValues(this.wanderungssaldo_u6_complexType)) {
                this.barchartData = convertComplexTypeToBarchart(sortComplexType(optimizeComplexTypeValues(this.wanderungssaldo_u6_complexType, 2)));
                this.barchartDataOptions = this.getChartOptions("wanderungssaldo_u6", this.chartRange);
                if (this.barchartDataOptions === false) {
                    this.barchartDataOptions = this.getChartOptionsForPercentage();
                }
            }
            else {
                this.barchartData = false;
                this.barchartDataOptions = {};
            }
            if (hasComplexTypeValues(this.wanderungssaldo_u6_aus_umland_complexType)) {
                this.barchartData_aus_umland = convertComplexTypeToBarchart(sortComplexType(optimizeComplexTypeValues(this.wanderungssaldo_u6_aus_umland_complexType, 2)));
            }
            else {
                this.barchartData_aus_umland = false;
            }
            if (hasComplexTypeValues(this.wanderungssaldo_u6_ins_umland_complexType)) {
                this.barchartData_ins_umland = convertComplexTypeToBarchart(sortComplexType(optimizeComplexTypeValues(this.wanderungssaldo_u6_ins_umland_complexType, 2)));
            }
            else {
                this.barchartData_ins_umland = false;
            }
        },

        /**
         * returns the options for the chart using the chartRange to set min and max for y axis
         * @param {String} propertyName the property name to lookup in chartRange
         * @param {Object|boolean} chartRange the given chartRange
         * @returns {Object} the options for ChartJS
         */
        getChartOptions (propertyName, chartRange) {
            if (
                typeof chartRange !== "object" || chartRange === null
                || !Object.prototype.hasOwnProperty.call(chartRange, propertyName)
                || !Array.isArray(chartRange[propertyName])
                || !chartRange[propertyName].length === 2
            ) {
                return false;
            }
            return {
                scales: {
                    yAxes: [{
                        ticks: {
                            suggestedMin: chartRange[propertyName][0],
                            suggestedMax: chartRange[propertyName][1]
                        }
                    }]
                }
            };
        },

        /**
         * returns the options for the chart with unit for percentages
         * @returns {Object} the options for ChartJS
         */
        getChartOptionsForPercentage () {
            return {
                scales: {
                    yAxes: [{
                        ticks: {
                            suggestedMin: 0,
                            suggestedMax: 100
                        }
                    }]
                }
            };
        }
    }
};
</script>

<template>
    <div class="gfi-balkendiagramm-wanderungen">
        <div
            class="tab-panel gfi-data"
            :class="{ 'hidden': !isActiveTab('data') }"
        >
            <div class="rba_header">
                <div
                    v-if="statgeb_id"
                    class="rba_header_title"
                >
                    {{ stadtteil_name }}: {{ statgeb_id }}
                </div>
                <div
                    v-else-if="sozialraum_name"
                    class="rba_header_title"
                >
                    {{ sozialraum_name }}
                </div>
                <div
                    v-else
                    class="rba_header_title"
                >
                    {{ stadtteil_name }}
                </div>
            </div>
            <div class="rba_table">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <td colspan="2">
                                <b>{{ translate("additional:addons.gfiThemes.bildungsatlas.balkendiagrammwanderungen.title") }}</b>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td v-if="statgeb_id">
                                {{ translate("additional:addons.gfiThemes.bildungsatlas.balkendiagrammwanderungen.table.statgeb") }}
                            </td>
                            <td v-else-if="sozialraum_name">
                                {{ translate("additional:addons.gfiThemes.bildungsatlas.balkendiagrammwanderungen.table.sozialraum", {sozialraum_name}) }}
                            </td>
                            <td v-else>
                                {{ translate("additional:addons.gfiThemes.bildungsatlas.balkendiagrammwanderungen.table.stadtteil", {stadtteil_name}) }}
                            </td>
                            <td
                                v-if="wanderungssaldo_u6"
                                class="rba_table_rightcol"
                            >
                                {{ wanderungssaldo_u6 }}
                            </td>
                            <td
                                v-else
                                class="rba_table_rightcol"
                            >
                                g.F.
                            </td>
                        </tr>
                        <tr v-if="wanderungssaldo_u6_aus_umland !== false">
                            <td>
                                {{ translate("additional:addons.gfiThemes.bildungsatlas.balkendiagrammwanderungen.table.ausUmland",) }}
                            </td>
                            <td
                                v-if="wanderungssaldo_u6_aus_umland"
                                class="rba_table_rightcol"
                            >
                                {{ wanderungssaldo_u6_aus_umland }}%
                            </td>
                            <td
                                v-else
                                class="rba_table_rightcol"
                            >
                                g.F.
                            </td>
                        </tr>
                        <tr v-if="wanderungssaldo_u6_ins_umland !== false">
                            <td>
                                {{ translate("additional:addons.gfiThemes.bildungsatlas.balkendiagrammwanderungen.table.insUmland",) }}
                            </td>
                            <td
                                v-if="wanderungssaldo_u6_ins_umland"
                                class="rba_table_rightcol"
                            >
                                {{ wanderungssaldo_u6_ins_umland }}%
                            </td>
                            <td
                                v-else
                                class="rba_table_rightcol"
                            >
                                g.F.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="rba_chart">
                <div
                    class="rba_chart_title"
                >
                    {{ translate("additional:addons.gfiThemes.bildungsatlas.balkendiagrammwanderungen.barchart.title") }}
                </div>
                <div
                    v-if="barchartData"
                    class="rba_chart_content"
                >
                    <Barchart
                        v-if="barchartData"
                        :given-options="barchartDataOptions"
                        :data="barchartData"
                    />
                </div>
                <div v-else>
                    g.F.
                </div>
            </div>
            <div
                v-if="barchartData_aus_umland"
                class="rba_chart"
            >
                <div
                    class="rba_chart_title"
                >
                    {{ translate("additional:addons.gfiThemes.bildungsatlas.balkendiagrammwanderungen.table.ausUmland") }}
                </div>
                <div class="rba_chart_content">
                    <Barchart
                        :given-options="getChartOptionsForPercentage()"
                        :data="barchartData_aus_umland"
                    />
                </div>
            </div>
            <div
                v-if="barchartData_ins_umland"
                class="rba_chart"
            >
                <div
                    class="rba_chart_title"
                >
                    {{ translate("additional:addons.gfiThemes.bildungsatlas.balkendiagrammwanderungen.table.insUmland") }}
                </div>
                <div class="rba_chart_content">
                    <Barchart
                        :given-options="getChartOptionsForPercentage()"
                        :data="barchartData_ins_umland"
                    />
                </div>
            </div>
            <div class="rba_footer">
                <p>
                    {{ translate("additional:addons.gfiThemes.bildungsatlas.general.disclaimer") }}
                </p>
            </div>
        </div>
        <div
            class="tab-panel gfi-info"
            :class="{ 'hidden': !isActiveTab('info') }"
        />
    </div>
</template>

<style lang="less" scoped>
.gfi-balkendiagramm-wanderungen {
    max-width: 420px;
    font-size: 13px;
}
</style>
