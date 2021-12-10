<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import getComponent from "../../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersDashboard";
import mutations from "../store/mutationsDashboard";
import actions from "../store/actionsDashboard";
import {getTimestamps} from "../../utils/timeline";
import beautifyKey from "../../../../src/utils/beautifyKey";
import groupMapping from "../../utils/groupMapping";
import TableRowMenu from "./TableRowMenu.vue";
import {calculateStats, calculateCorrelation, getTotal, getAverage} from "../utils/operations";
import {generateChartForDistricts, generateChartForCorrelation} from "../utils/chart";
import {prepareTableExport, prepareTableExportWithTimeline} from "../utils/export";
import composeFilename from "../../utils/composeFilename";
import exportXlsx from "../../utils/exportXlsx";
import DashboardToolbar from "./DashboardToolbar.vue";
import StatsTrend from "./StatsTrend.vue";
import ToolInfo from "../../components/ToolInfo.vue";

export default {
    name: "Dashboard",
    components: {
        Tool,
        ToolInfo,
        TableRowMenu,
        DashboardToolbar,
        StatsTrend
    },
    data () {
        return {
            dashboardOpen: false,
            rows: [],
            baseColumns: [
                // {
                //     value: "group",
                //     text: this.$t("additional:modules.tools.cosi.dashboard.groupCol")
                // },
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
                    value: "menu",
                    filterable: false,
                    sortable: false,
                    groupable: false
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
            // all current (visible) items in the table
            currentItems: [],
            // selected items in the table
            selectedItems: [],
            timestampPrefix: "jahr_",
            timestamps: [],
            // currentTimeStamp: null,
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
            "selectedDistrictNames",
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
        selectedColumns () {
            const selectedCols = [...this.districtColumns, ...this.aggregateColumns].filter(col => col.selected);

            return selectedCols.length > 0
                ? selectedCols
                : [...this.districtColumns, ...this.aggregateColumns];
        },
        selectedColumnNames () {
            return this.selectedColumns.map(col => col.value);
        },
        unselectedColumnLabels () {
            return [...this.districtColumns, ...this.aggregateColumns].filter(col => !this.selectedColumns.includes(col)).map(col => col.text);
        },
        currentTimeStamp: {
            get () {
                return parseInt(this.selectedYear, 10);
            },
            set (v) {
                this.setSelectedYear(v);
            }
        }
    },

    watch: {
        active () {
            // ..
        },
        loadend (v) {
            if (v && this.selectedDistrictNames.length > 0) {
                this.generateTable();
            }
        }
    },
    created () {
        /**
         * If the tool is used from the menu,
         * toggles the menu item inactive if closed
         * @param {boolean} newActive - Defines if the tool is active.
         * @returns {void}
         */
        this.$on("close", () => {
            const model = getComponent(this.id);

            this.setActive(false);
            if (model) {
                model.set("isActive", false);
            }
        });
    },

    methods: {
        ...mapMutations("Tools/Dashboard", Object.keys(mutations)),
        ...mapActions("Tools/Dashboard", Object.keys(actions)),
        ...mapMutations("Tools/DistrictSelector", ["addCategoryToMapping", "removeCategoryFromMapping"]),
        ...mapMutations("Tools/ColorCodeMap", ["setSelectedYear"]),
        ...mapActions("Tools/ChartGenerator", ["channelGraphData"]),
        ...mapActions("Tools/DistrictSelector", ["updateDistricts"]),
        generateTable () {
            this.timestamps = [];
            this.districtColumns = this.getColumns(this.selectedDistrictLevel, this.selectedDistrictNames, []);
            this.rows = this.getRows();
            this.items = this.getData();
            this.currentTimeStamp = this.selectedYear;
        },
        getRows () {
            let counter = 0;

            return this.mapping.reduce((rows, category, index, array) => {
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
                        valueType: category.valueType,
                        groupIndex: array[index].group !== array[index + 1]?.group ? counter++ : counter
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
                    selected: false,
                    minimized: false
                });

                refDistrictName = district.getReferencDistrictName();

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

        minimizeCol (col) {
            col.minimized = !col.minimized;
            col.class = col.minimized ? "minimized" : "";
        },

        getValue (item, header, timestamp) {
            let val;

            if (item[header.value]) {
                val = parseFloat(item[header.value][this.timestampPrefix + timestamp]);
            }

            return val ? val.toLocaleString(this.currentLocale) : "-";
        },

        getValueClass (item, header, timestamp) {
            return item[header.value]?.isModified <= timestamp ? "modified" : "";
        },

        getValueTooltip (item, header, timestamp) {
            return item[header.value]?.isModified <= timestamp ? this.$t("additional:modules.tools.cosi.dashboard.modifiedTooltip") : undefined;
        },

        getAverage (item, timestamp) {
            const average = getAverage(item, this.selectedDistrictNames, timestamp, this.timestampPrefix);

            return average.toLocaleString(this.currentLocale);
        },

        getTotal (item, timestamp) {
            const total = getTotal(item, this.selectedDistrictNames, timestamp, this.timestampPrefix);

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
                        getTotal(item, this.selectedDistrictNames, timestamp, this.timestampPrefix)
                    ])
                ),
                average = Object.fromEntries(
                    item.years.map(timestamp => [
                        this.timestampPrefix + timestamp,
                        getAverage(item, this.selectedDistrictNames, timestamp, this.timestampPrefix)
                    ])
                ),
                data = {
                    ...item,
                    total,
                    average
                },
                chart = generateChartForDistricts(
                    data,
                    this.selectedColumnNames,
                    this.selectedDistrictLevel.label,
                    this.timestampPrefix
                );

            this.channelGraphData(chart);
        },

        renderScatterplot () {
            const correlation = this.calculateCorrelation(),
                chart = generateChartForCorrelation(correlation, this.fields.B.category, this.fields.A.category);

            this.channelGraphData(chart);
        },

        onVisualizationChanged () {
            let item;

            for (item of this.items) {
                item.visualized = false;
            }
        },

        /**
         * Export the table as XLSX.
         * Either the simple view for the selected or all years.
         * @param {Boolean} exportTimeline - Whether to include all years.
         * @param {Object[]} selectedItems - Selected items in the table.
         * @param {Object[]} currentItems - All current (visible) items in the table
         * @returns {void}
         */
        exportTable (exportTimeline = false) {
            const items = this.selectedItems.length > 0 ? this.selectedItems : this.currentItems,
                data = exportTimeline
                    ? prepareTableExportWithTimeline(items, this.selectedDistrictNames, this.timestamps, this.timestampPrefix)
                    : prepareTableExport(items, this.selectedDistrictNames, this.selectedYear, this.timestampPrefix),
                filename = composeFilename(this.$t("additional:modules.tools.cosi.dashboard.exportFilename"));

            exportXlsx(data, filename, {exclude: [...this.excludedPropsForExport, ...this.unselectedColumnLabels]});
        },

        calculateStats,
        calculateCorrelation,
        groupMapping,

        /**
         * @param {String[]} value -
         * @returns {void}
         */
        setStatsFeatureFilter (value) {
            this.statsFeatureFilter = value;
        },

        /**
         * @param {String} value -
         * @returns {void}
         */
        setSearch (value) {
            this.search = value;
        },

        /**
         * Sets the current (visible) items of the table.
         * @param {Object[]} items - The of the table.
         * @returns {void}
         */
        setCurrentItems (items) {
            this.currentItems = items;
        }

    }
};
</script>

<template lang="html">
    <Tool
        :title="$t('additional:modules.tools.cosi.dashboard.title')"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
        :initial-width="0.6"
    >
        <template
            #toolBody
        >
            <v-app
                id="dashboard-wrapper"
                absolute
            >
                <v-main>
                    <ToolInfo :url="readmeUrl[currentLocale]" />
                    <v-container fluid>
                        <DashboardToolbar
                            :stats-feature-filter="statsFeatureFilter"
                            :search="search"
                            @setStatsFeatureFilter="setStatsFeatureFilter"
                            @setSearch="setSearch"
                            @exportTable="exportTable"
                        />
                        <v-row class="dashboard-table-wrapper">
                            <v-data-table
                                v-model="selectedItems"
                                :headers="columns"
                                :items="items"
                                group-by="groupIndex"
                                show-group-by
                                :items-per-page="-1"
                                :search="search"
                                hide-default-footer
                                dense
                                show-select
                                item-key="category"
                                class="dashboard-table"
                                @current-items="setCurrentItems"
                            >
                                <!-- Header for years selector -->
                                <template #[`header.years`]>
                                    <v-select
                                        v-model="currentTimeStamp"
                                        :items="timestamps"
                                        :height="20"
                                        :label="$t('additional:modules.tools.cosi.dashboard.timestampCol')"
                                        dense
                                        hide-details
                                    />
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
                                            <v-btn
                                                class="move-col left"
                                                icon
                                                x-small
                                                :title="$t('additional:modules.tools.cosi.dashboard.moveColLeft')"
                                                @click="moveCol(district, 0)"
                                            >
                                                <v-icon>mdi-chevron-left</v-icon>
                                            </v-btn>
                                            <v-btn
                                                class="move-col right"
                                                icon
                                                x-small
                                                :title="$t('additional:modules.tools.cosi.dashboard.moveColRight')"
                                                @click="moveCol(district, 1)"
                                            >
                                                <v-icon>mdi-chevron-right</v-icon>
                                            </v-btn>
                                            <v-btn
                                                class="move-col minimize"
                                                icon
                                                x-small
                                                :title="$t('additional:modules.tools.cosi.dashboard.minimize')"
                                                @click="minimizeCol(district)"
                                            >
                                                <v-icon>{{ district.minimized ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
                                            </v-btn>
                                        </template>
                                    </div>
                                </template>

                                <template #[`group.header`]="group">
                                    <th
                                        :colspan="group.headers.length"
                                        class="text-start"
                                    >
                                        <v-icon @click="group.toggle">
                                            {{ group.isOpen ? 'mdi-minus' : 'mdi-plus' }}
                                        </v-icon>
                                        {{ group.items[0].group }}
                                    </th>
                                </template>

                                <!-- Base Columns -->
                                <template #[`item.years`]="{ item }">
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
                                <template #[`item.menu`]="{ item }">
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
                                    :class="{'text-end': true, 'minimized': header.minimized}"
                                >
                                    <!--eslint-disable-next-line-->
                                    <v-tooltip
                                        :key="district.value"
                                        bottom
                                        :nudge-top="60"
                                    >
                                        <template #activator="{ on, attrs }">
                                            <div
                                                :class="{'text-end': true, 'minimized': header.minimized}"
                                                v-bind="attrs"
                                                v-on="on"
                                            >
                                                <StatsTrend
                                                    v-if="getValue(item, header, currentTimeStamp) !== '-'"
                                                    :item="item"
                                                    :header="header"
                                                    :current-timestamp="currentTimeStamp"
                                                    :timestamp-prefix="timestampPrefix"
                                                    :locale="currentLocale"
                                                />
                                                <template v-if="item.expanded">
                                                    <ul class="timeline">
                                                        <li
                                                            v-for="year in item.years"
                                                            :key="year"
                                                        >
                                                            <span
                                                                :title="getValueTooltip(item, header, year)"
                                                                :class="getValueClass(item, header, year)"
                                                            >
                                                                {{ getValue(item, header, year) }}
                                                            </span>
                                                        </li>
                                                    </ul>
                                                </template>
                                                <template v-else>
                                                    <span
                                                        :title="getValueTooltip(item, header, currentTimeStamp)"
                                                        :class="getValueClass(item, header, currentTimeStamp)"
                                                    >
                                                        {{ getValue(item, header, currentTimeStamp) }}
                                                    </span>
                                                </template>
                                            </div>
                                        </template>
                                        <span>{{ header.text }} {{ item.expanded ? '' : `(${currentTimeStamp})` }}</span>
                                    </v-tooltip>
                                </template>

                                <!-- Columns for aggregated data -->
                                <template #[`item.average`]="{ item }">
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
                                <template #[`item.total`]="{ item }">
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
                        </v-row>
                    </v-container>
                </v-main>
            </v-app>
        </template>
    </Tool>
</template>

<style lang="less">
@import "../../utils/variables.less";

#dashboard-wrapper {
    height: 100%;
    .v-main {
        height: 100%;
        .container {
            height: 100%;
            .dashboard-table-wrapper {
                height: calc(100% - 40px);
            }
        }
    }
}

.dashboard-table {
    height: 100%;
    .v-data-table__wrapper {
        padding-top: 10px;
        overflow-x: auto;
        overflow-y: auto;
        height: 100%;
    }

    thead {
        .district-header {
            position: relative;
            .move-col {
                position: absolute;
                top: -10px;
                font-size: 16px;
                &.left {
                    left: 0px;
                }
                &.right {
                    left: 10px;
                }
                &.minimize {
                    right: 0px;
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

    th.minimized {
        width: 20px;
        max-width:20px;

        .v-input {
            display: none;
        }
        .move-col {
            &.left {
                display: none;
            }
            &.right {
                display: none;
            }
            &.minimize {
                left: -10px;
                right: unset;
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
        .minimized {
            // overflow: hidden;
            // width: 20px;
            display: none;
        }
    }
}
</style>


