<script>
/* eslint-disable new-cap */
import Vue from "vue";
import Tool from "../../../../../src/modules/tools/Tool.vue";
import getComponent from "../../../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersDashboardTable";
import mutations from "../store/mutationsDashboardTable";
import actions from "../store/actionsDashboardTable";
import {VueGoodTable} from "vue-good-table";
import categories from "../../../assets/mapping.json";
import findDistrictFeatureByName from "../utils/findDistrictFeatureByName";
import ValueCell from "./ValueCell.vue";
import YearCell from "./YearCell.vue";
import MenuCell from "./MenuCell.vue";
import CategoryCell from "./CategoryCell.vue";
import {getTimestamps} from "../../../utils/timeline";
import Test from "../test.json";
import Cols from "../cols.json";

export default {
    name: "DashboardTable",
    components: {
        Tool,
        VueGoodTable,
        ValueCell,
        YearCell,
        MenuCell,
        CategoryCell
        // VGrid,
    },
    props: {
        dashboardOpen: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    data () {
        return {
            columnsTemplate: [
                {field: "menu", width: "60px" /* , autoSizeColumn: true, cellTemplate: VGridVueTemplate(MenuCell)*/},
                {label: "Kategorie", field: "category", width: "250px" /* , cellTemplate: VGridVueTemplate(CategoryCell)*/},
                {label: "Jahr", field: "years", width: "60px" /* , autoSizeColumn: true, cellTemplate: VGridVueTemplate(YearCell)*/}
            ],
            rows: [],
            rowDefinitions: [],
            testrows: Test,
            colsTest: Cols,
            // grouping: {
            //     props: ["group"]
            // },
            timeStampPrefix: "jahr_",
            currentTimeStamp: 0
        };
    },
    computed: {
        ...mapGetters("Tools/DashboardTable", Object.keys(getters)),
        ...mapGetters("Tools/DistrictLoader", {featureList: "featureList", districtLevelStats: "districtLevels"}),
        ...mapGetters("Tools/DistrictSelector", ["selectedFeatures", "keyOfAttrName", "keyOfAttrNameStats", "districtLevels", "label"]),
        ...mapGetters("Map", ["layerById"]),
        columns () {
            console.log([
                ...this.columnsTemplate,
                ...this.generateDynamicColumns()
            ]);
            return [
                ...this.columnsTemplate,
                ...this.generateDynamicColumns()
            ];
        }
    },

    watch: {
        /**
         * @description refreshes the data on the next tick after render
         * @param {Boolean} state the active state of the Tool
         * @returns {void}
         */
        active (state) {
            if (state) {
                this.$nextTick(() => {
                    this.getData();
                });
            }
        },
        dashboardOpen (state) {
            this.setActive(state);
        },
        rows () {
            console.log(this.rows);
        },
        featureList () {
            this.getData();
        },
        openTimelineRows (openRows) {
            this.rowDefinitions = this.rows.map((row, rowIndex) => ({
                type: "row",
                index: rowIndex,
                size: openRows.includes(rowIndex) ? 42 * row.years.length : 42
            }));
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
    mounted () {
        /**
         * @description Open Tool if used inside the Dashboard Manager
         */
        if (this.dashboardOpen) {
            this.setActive(true);
        }
    },
    beforeDestroy () {
        this.setActive(false);
    },
    methods: {
        ...mapMutations("Tools/DashboardTable", Object.keys(mutations)),
        ...mapActions("Tools/DashboardTable", Object.keys(actions)),
        getData () {
            const rows = categories.reduce((rows, category) => {
                if (!category[this.keyOfAttrNameStats]) {
                    return rows;
                }

                return [
                    ...rows,
                    this.getDistrictStatsByCategory(category)
                ];
            }, []);

            this.rows = rows;
        },
        getDistrictStatsByCategory (category) {
            const districtStats = this.districtLevelStats.reduce((districts, level) => {
                if (!level.features?.length > 0) {
                    return districts;
                }
                return {
                    ...districts,
                    ...level.features.reduce((levelDistricts, feature) => {
                        if (feature.get("kategorie") === category.value) {
                            const districtName = feature.get(level.keyOfAttrName);

                            return {
                                ...levelDistricts,
                                [districtName]: {
                                    ...feature.getProperties(),
                                    feature:
                                        this.selectedFeatures.find(district => district.get(this.keyOfAttrName) === districtName) ||
                                        findDistrictFeatureByName(feature.get(level.keyOfAttrName), level.label),
                                    level: level.label
                                }
                            };
                        }
                        return levelDistricts;
                    }, {
                        // set the group from mapping.json for row grouping
                        group: category.group
                    })
                };
            }, {});

            return {
                ...{
                    category: category.value,
                    years: getTimestamps(districtStats, this.timeStampPrefix)
                },
                ...districtStats
            };
        },
        generateDynamicColumns () {
            return this.districtLevelStats.reduce((cols, level) => {
                if (!level.features?.length > 0) {
                    return cols;
                }

                return [
                    ...cols,
                    ...this.generateColumnsForLevel(level)
                ];
            }, []);
        },
        generateColumnsForLevel (level) {
            const columnNames = Object.keys(this.rows[0] || []).filter(districtName => {
                return level.features.some(feature => feature.get(level.keyOfAttrName) === districtName);
            });

            return columnNames.map(districtName => ({
                label: districtName,
                field: districtName,
                level: level.label,
                isReference: level.label === this.label
            }));
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t('additional:modules.tools.cosi.dashboard.table.title')"
        :icon="glyphicon"
        :active="active"
        :resizable-window="resizableWindow"
        :initialHeight="0.8"
        :initialWidth="0.55"
    >
        <template
            v-if="active"
            v-slot:toolBody
        >
            <VueGoodTable
                ref="dashboard-table"
                :columns="columns"
                :rows="rows"
                fixed-header
                :search-options="{
                    enabled: true
                }"
                :pagination-options="{
                    enabled: true
                }"
                max-height="60vh"
            >
                <template
                    slot="table-row"
                    slot-scope="props"
                >
                    <span v-if="props.column.field === 'menu'">
                        <MenuCell
                            :rowIndex="props.index"
                            :column="props.column"
                            :row="props.formattedRow"
                            :currentTimestamp="currentTimeStamp"
                        />
                    </span>
                    <span v-if="props.column.field === 'years'">
                        <YearCell
                            :rowIndex="props.index"
                            :column="props.column"
                            :row="props.formattedRow"
                            :currentTimestamp="currentTimeStamp"
                        />
                    </span>
                    <span v-else-if="props.column.field === 'category'">
                        <CategoryCell
                            :rowIndex="props.index"
                            :column="props.column"
                            :row="props.formattedRow"
                        />
                    </span>
                    <span v-else-if="props.column.level">
                        <ValueCell
                            :rowIndex="props.index"
                            :column="props.column"
                            :row="props.formattedRow"
                            :currentTimestamp="currentTimeStamp"
                        />
                    </span>
                    <!-- <span v-if="props.column.field === 'menu'">
                        <MenuCell
                            :rowIndex="props.index"
                            :column="props.column"
                            :row="props.formattedRow"
                            :currentTimestamp="currentTimeStamp"
                        />
                    </span>
                    <span v-if="props.column.field === 'years'">
                        <YearCell
                            :rowIndex="props.index"
                            :column="props.column"
                            :row="props.formattedRow"
                            :currentTimestamp="currentTimeStamp"
                        />
                    </span>
                    <span v-else-if="props.column.field === 'category'">
                        <CategoryCell
                            :rowIndex="props.index"
                            :column="props.column"
                            :row="props.formattedRow"
                        />
                    </span>
                    <span v-else-if="props.column.level">
                        <ValueCell
                            :rowIndex="props.index"
                            :column="props.column"
                            :row="props.formattedRow"
                            :currentTimestamp="currentTimeStamp"
                        />
                    </span> -->
                    <span v-else>
                        {{ props.formattedRow[props.column.field] }}
                    </span>
                </template>
            </VueGoodTable>
        </template>
    </Tool>
</template>

<style lang="less">
    revo-grid {
        font-size: 10px;

        .row {
            margin: 0;
        }

        ul.timestamp-list {
            padding: 0;
            li.timestamp-list-item {
                text-align: right;
                list-style: none;
                small {
                    color: #90c6f5;
                }
            }
        }
    }
</style>

<style src="vue-good-table/dist/vue-good-table.css">
</style>


