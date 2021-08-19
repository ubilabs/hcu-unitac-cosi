<script>
/* eslint-disable new-cap */
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersDashboard";
// import mutations from "../store/mutationsDashboard";
// import actions from "../store/actionsDashboard";
import {getTimestamps} from "../../utils/timeline";
import beautifyKey from "../../../../src/utils/beautifyKey";
import groupMapping from "../../utils/groupMapping";
import TableRowMenu from "./TableRowMenu.vue";
import {calculateStats, calculateCorrelation, getTotal, getAverage} from "../utils/operations";
import {generateChartForDistricts, generateChartForCorrelation} from "../utils/chart";

export default {
    name: "DashboardTable",
    components: {
        TableRowMenu
    },
    data () {
        return {
            rows: [],
            baseColumns: [
                {
                    value: "menu",
                    filterable: false,
                    sortable: false,
                    groupable: false
                },
                {
                    value: "group",
                    text: this.$t("additional:modules.tools.cosi.dashboard.groupCol")
                },
                {
                    value: "category",
                    text: this.$t("additional:modules.tools.cosi.dashboard.categoryCol"),
                    sortable: false,
                    groupable: false,
                    filter: value => {
                        if (this.statsFeatureFilter.length < 1) {
                            return true;
                        }

                        return this.statsFeatureFilter.map(t => typeof t === "string" ? t : t.value).includes(value);
                    }
                },
                {
                    value: "years",
                    text: this.$t("additional:modules.tools.cosi.dashboard.timestampCol"),
                    filterable: false,
                    sortable: false,
                    divider: true,
                    groupable: false
                }
            ],
            aggregateColumns: [
                {
                    text: this.$t("additional:modules.tools.cosi.dashboard.avgCol"),
                    value: "average",
                    align: "end",
                    sortable: false,
                    groupable: false,
                    selected: false,
                    isAggregation: true
                },
                {
                    text: this.$t("additional:modules.tools.cosi.dashboard.totalCol"),
                    value: "total",
                    align: "end",
                    sortable: false,
                    groupable: false,
                    selected: false,
                    isAggregation: true
                }
            ],
            districtColumns: [],
            items: [],
            timestampPrefix: "jahr_",
            timestamps: [],
            currentTimeStamp: null,
            search: "",
            statsFeatureFilter: [],
            fields: {
                A: null,
                B: null
            }
        };
    },
    computed: {
        ...mapGetters("Tools/Dashboard", Object.keys(getters)),
        ...mapGetters("Tools/DistrictSelector", [
            "selectedFeatures",
            "selectedDistrictLevel",
            "selectedDistrictsNames",
            "keyOfAttrNameStats",
            "districtLevels",
            "mapping",
            "loadend"
        ]),
        ...mapGetters("Map", ["layerById"]),
        ...mapGetters("Language", ["currentLocale"]),
        ...mapGetters("Tools/ColorCodeMap", ["selectedYear"]),
        columns () {
            return [
                ...this.baseColumns,
                ...this.districtColumns,
                ...this.aggregateColumns
            ];
        },
        statsMapping () {
            return this.groupMapping(this.mapping);
        },
        selectedColumnNames () {
            const selectedCols = [...this.districtColumns, ...this.aggregateColumns].filter(col => col.selected),
                districtNames = selectedCols.length > 0
                    ? selectedCols.map(col => col.text)
                    : [...this.districtColumns, ...this.aggregateColumns].map(col => col.text);

            return districtNames;
        }
    },

    watch: {
        loadend (v) {
            if (v) {
                this.generateTable();
            }
        },
        currentTimeStamp (v) {
            this.setSelectedYear(v);
        },

        /**
         * @todo merge both properties!
         * @param {Number} v - the current value of ColorCodeMaps selectedYear
         * @returns {void}
         */
        selectedYear (v) {
            this.currentTimeStamp = v;
        }
    },
    mounted () {
        this.generateTable();
    },
    methods: {
        ...mapMutations("Tools/DistrictSelector", ["addCategoryToMapping", "removeCategoryFromMapping"]),
        ...mapMutations("Tools/ColorCodeMap", ["setSelectedYear"]),
        ...mapMutations("Tools/ChartGenerator", {setNewChartDataSet: "setNewDataSet"}),
        ...mapActions("Tools/DistrictSelector", ["updateDistricts"]),
        generateTable () {
            this.timestamps = [];
            this.districtColumns = this.getColumns(this.selectedDistrictLevel, this.selectedDistrictsNames, []);
            this.rows = this.getRows();
            this.items = this.getData();
            this.currentTimeStamp = this.timestamps[0];
        },
        getRows () {
            return this.mapping.reduce((rows, category) => {
                if (!category[this.keyOfAttrNameStats]) {
                    return rows;
                }

                return [
                    ...rows,
                    {
                        visualized: false,
                        expanded: false,
                        category: category.value,
                        group: category.group,
                        valueType: category.valueType
                    }
                ];
            }, []);
        },
        getData () {
            return this.rows.map(row => this.getDistrictStatsByCategory(row), []);
        },
        getDistrictStatsByCategory (row) {
            const districtStats = {
                ...row
            };

            for (const col of this.districtColumns) {
                const statFeature = col.district.statFeatures
                    .find(feature => feature.get("kategorie") === row.category);

                if (statFeature) {
                    districtStats[col.value] = statFeature.getProperties();
                }
            }

            districtStats.years = [...getTimestamps(districtStats, this.timestampPrefix)];
            this.timestamps = districtStats.years.reduce((timestamps, timestamp) => {
                return timestamps.includes(timestamp) ? timestamps : [timestamp, ...timestamps].sort().reverse();
            }, this.timestamps);

            return districtStats;
        },
        getColumns (districtLevel, districtNames, colList) {
            const districts = districtLevel.displayAll
                    ? districtLevel.districts
                    : districtLevel.districts.filter(dist => districtNames.includes(dist.getName())),
                refKeyOfAttrName = districtLevel.referenceLevel?.keyOfAttrName,
                refDistrictNames = [];
            let district, refDistrictName;

            for (district of districts) {
                colList.push({
                    text: beautifyKey(district.getLabel()),
                    value: district.getLabel(),
                    align: "end",
                    district,
                    districtLevel: districtLevel.label,
                    sortable: false,
                    groupable: false,
                    selected: false
                });

                refDistrictName = district.adminFeature?.get(refKeyOfAttrName);
                if (refDistrictName) {
                    refDistrictNames.push(refDistrictName);
                }
            }

            colList[colList.length - 1].divider = true;

            if (districtLevel.referenceLevel) {
                // add columns for reference areas
                this.getColumns(districtLevel.referenceLevel, refDistrictNames, colList);
            }

            return colList;
        },

        setColDividers () {
            for (let i = 0; i < this.districtColumns.length; i++) {
                if (this.districtColumns[i].districtLevel !== this.districtColumns[i + 1]?.districtLevel) {
                    this.districtColumns[i].divider = true;
                }
                else {
                    this.districtColumns[i].divider = false;
                }
            }
        },

        /**
         * Moves a district column left/right
         * @param {Object} col - the column to move
         * @param {0 | 1} [dir=0] - the direction to move, 0 = left, 1 = right
         * @returns {void}
         */
        moveCol (col, dir = 0) {
            // dont move left if index is 0
            if (this.districtColumns.findIndex(_col => _col === col) === 0 && dir === 0) {
                return;
            }

            const i = this.districtColumns.findIndex(_col => _col === col),
                c0 = this.districtColumns.slice(0, i - 1 + dir),
                c1 = this.districtColumns.slice(i + 1 + dir),
                cSwap = this.districtColumns.slice(i - 1 + dir, i + 1 + dir).reverse(),
                cols = [...c0, ...cSwap, ...c1];

            this.districtColumns = cols;
            this.setColDividers();
        },

        getValue (item, header, timestamp) {
            const val = parseFloat(item[header.value][this.timestampPrefix + timestamp]);

            console.log(item[header.value], item[header.value].isModified);

            return val ? val.toLocaleString(this.currentLocale) : "-";
        },

        getValueClass (item, header, timestamp) {
            return item[header.value].isModified <= timestamp ? "modified" : "";
        },

        getAverage (item, timestamp) {
            const average = getAverage(item, this.selectedDistrictsNames, timestamp, this.timestampPrefix);

            return average.toLocaleString(this.currentLocale);
        },

        getTotal (item, timestamp) {
            const total = getTotal(item, this.selectedDistrictsNames, timestamp, this.timestampPrefix);

            return total.toLocaleString(this.currentLocale);
        },

        setField (field, item) {
            this.fields[field] = item;
        },

        resetFields () {
            for (const field in this.fields) {
                this.fields[field] = null;
            }
        },

        renderCharts (item) {
            const total = Object.fromEntries(
                    item.years.map(timestamp => [
                        this.timestampPrefix + timestamp,
                        getTotal(item, this.selectedDistrictsNames, timestamp, this.timestampPrefix)
                    ])
                ),
                average = Object.fromEntries(
                    item.years.map(timestamp => [
                        this.timestampPrefix + timestamp,
                        getAverage(item, this.selectedDistrictsNames, timestamp, this.timestampPrefix)
                    ])
                ),
                data = {
                    ...item,
                    Gesamt: total,
                    Durchschnitt: average
                },
                chart = generateChartForDistricts(
                    data,
                    this.selectedColumnNames,
                    this.selectedDistrictLevel.label,
                    this.timestampPrefix
                );

            this.setNewChartDataSet(chart);
        },

        renderScatterplot () {
            const correlation = this.calculateCorrelation(),
                chart = generateChartForCorrelation(correlation, this.fields.B.category, this.fields.A.category);

            this.setNewChartDataSet(chart);
        },

        onVisualizationChanged () {
            let item;

            for (item of this.items) {
                item.visualized = false;
            }
        },

        calculateStats,
        calculateCorrelation,
        groupMapping
    }
};
</script>

<template lang="html">
    <v-container fluid>
        <v-row
            dense
            align-content="end"
        >
            <v-col cols="4">
                <v-combobox
                    v-model="statsFeatureFilter"
                    :items="statsMapping"
                    item-text="value"
                    :label="$t('additional:modules.tools.cosi.featuresList.layerFilter')"
                    append-icon="mdi-chart-box-plus-outline"
                    outlined
                    dense
                    chips
                    multiple
                    clearable
                >
                    <template #selection="{ item, index }">
                        <v-chip v-if="index === 0">
                            <span>{{ item.value }}</span>
                        </v-chip>
                        <span
                            v-if="index === 1"
                            class="grey--text text-caption"
                        >
                            (+{{ statsFeatureFilter.length - 1 }} weitere)
                        </span>
                    </template>
                </v-combobox>
            </v-col>
            <v-col cols="4">
                <v-text-field
                    v-model="search"
                    type="text"
                    :label="$t('additional:modules.tools.cosi.dashboard.search')"
                    append-icon="mdi-magnify"
                    outlined
                    dense
                />
            </v-col>
        </v-row>
        <v-data-table
            :headers="columns"
            :items="items"
            group-by="group"
            show-group-by
            :items-per-page="-1"
            :search="search"
            hide-default-footer
            dense
            show-select
            item-key="category"
            class="dashboard-table"
        >
            <!-- Header for years selector -->
            <template #header.years="{ header }">
                <v-select
                    v-model="currentTimeStamp"
                    :items="timestamps"
                    dense
                >
                    <template #prepend>
                        <span>{{ $t('additional:modules.tools.cosi.dashboard.timestampCol') }}</span>
                    </template>
                </v-select>
            </template>

            <!-- Header for districts -->
            <template
                v-for="district in [...districtColumns, ...aggregateColumns]"
                #[`header.${district.value}`]="{ header }"
            >
                <div
                    :key="district.value"
                    class="district-header"
                >
                    <v-checkbox
                        v-model="header.selected"
                        :label="header.text"
                        dense
                        hide-details
                    />
                    <template v-if="!district.isAggregation">
                        <v-icon
                            class="move-col left"
                            @click="moveCol(district, 0)"
                        >
                            mdi-chevron-left
                        </v-icon>
                        <v-icon
                            class="move-col right"
                            @click="moveCol(district, 1)"
                        >
                            mdi-chevron-right
                        </v-icon>
                    </template>
                </div>
            </template>

            <!-- Base Columns -->
            <template #item.years="{ item }">
                <div class="text-end">
                    <template v-if="item.expanded">
                        <ul class="timeline">
                            <li
                                v-for="year in item.years"
                                :key="year"
                            >
                                <small class="timestamp">{{ year }}</small>
                            </li>
                        </ul>
                    </template>
                    <template v-else>
                        <span><small class="timestamp">{{ currentTimeStamp }}</small></span>
                    </template>
                </div>
            </template>
            <template #item.menu="{ item }">
                <TableRowMenu
                    :item="item"
                    :fields="fields"
                    @setField="setField"
                    @resetFields="resetFields"
                    @add="calculateStats('add')"
                    @subtract="calculateStats('subtract')"
                    @multiply="calculateStats('multiply')"
                    @divide="calculateStats('divide')"
                    @correlate="renderScatterplot"
                    @visualizationChanged="onVisualizationChanged"
                    @renderCharts="renderCharts"
                />
            </template>

            <!-- Columns of all Districts -->
            <template
                v-for="district in districtColumns"
                #[`item.${district.value}`]="{ item, header }"
            >
                <!--eslint-disable-next-line-->
                <v-tooltip
                    :key="district.value"
                    bottom
                    :nudge-top="60"
                >
                    <template #activator="{ on, attrs }">
                        <div
                            class="text-end"
                            v-bind="attrs"
                            v-on="on"
                        >
                            <template v-if="item.expanded">
                                <ul class="timeline">
                                    <li
                                        v-for="year in item.years"
                                        :key="year"
                                    >
                                        <span :class="getValueClass(item, header, year)">{{ getValue(item, header, year) }}</span>
                                    </li>
                                </ul>
                            </template>
                            <template v-else>
                                <span :class="getValueClass(item, header, currentTimeStamp)">{{ getValue(item, header, currentTimeStamp) }}</span>
                            </template>
                        </div>
                    </template>
                    <span>{{ header.text }} {{ item.expanded ? '' : `(${currentTimeStamp})` }}</span>
                </v-tooltip>
            </template>

            <!-- Columns for aggregated data -->
            <template
                #item.average="{ item }"
            >
                <!--eslint-disable-next-line-->
                <v-tooltip
                    bottom
                    :nudge-top="60"
                >
                    <template #activator="{ on, attrs }">
                        <div
                            class="text-end"
                            v-bind="attrs"
                            v-on="on"
                        >
                            <template v-if="item.expanded">
                                <ul class="timeline">
                                    <li
                                        v-for="year in item.years"
                                        :key="year"
                                    >
                                        {{ getAverage(item, year) }}
                                    </li>
                                </ul>
                            </template>
                            <template v-else>
                                {{ getAverage(item, currentTimeStamp) }}
                            </template>
                        </div>
                    </template>
                    <span>{{ $t('additional:modules.tools.cosi.dashboard.avgCol') }} {{ item.expanded ? '' : `(${currentTimeStamp})` }}</span>
                </v-tooltip>
            </template>

            <template
                #item.total="{ item }"
            >
                <v-tooltip
                    bottom
                    :nudge-top="60"
                >
                    <template #activator="{ on, attrs }">
                        <!--eslint-disable-next-line-->
                        <div
                            class="text-end"
                            v-bind="attrs"
                            v-on="on"
                        >
                            <template v-if="item.expanded">
                                <ul class="timeline">
                                    <li
                                        v-for="year in item.years"
                                        :key="year"
                                    >
                                        {{ getTotal(item, year) }}
                                    </li>
                                </ul>
                            </template>
                            <template v-else>
                                <span>{{ getTotal(item, currentTimeStamp) }}</span>
                            </template>
                        </div>
                    </template>
                    <span>{{ $t('additional:modules.tools.cosi.dashboard.totalCol') }} {{ item.expanded ? '' : `(${currentTimeStamp})` }}</span>
                </v-tooltip>
            </template>
        </v-data-table>
    </v-container>
</template>

<style lang="less">
@import "../../utils/variables.less";

.dashboard-table {
    .v-data-table__wrapper {
        padding-top: 10px;
    }

    thead {
        .district-header {
            position: relative;
            .move-col {
                position: absolute;
                top: -10px;
                font-size: 16px;
                &.left {
                    right: 0;
                }
                &.right {
                    right: -10px;
                }
            }
        }
        .v-input {
            font-size: unset;
            label {
                font-size: 12px;
                font-weight: 700;
                i {
                    font-size: 20px;
                }
            }
        }
    }

    td {
        vertical-align: top;

        div.text-end {
            text-align: right;
        }
        ul.timeline {
            list-style: none;
            li {
                text-align: right;
            }
        }
        .timestamp {
            color: @brightblue;
        }
        .no-wrap {
            white-space: nowrap;
        }
        .modified {
            color: @brightred;
        }
    }
}
</style>


