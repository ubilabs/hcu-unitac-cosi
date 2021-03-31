<script>
/* eslint-disable new-cap */
import Tool from "../../../../../src/modules/tools/Tool.vue";
import getComponent from "../../../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersDashboardTable";
import mutations from "../store/mutationsDashboardTable";
import actions from "../store/actionsDashboardTable";
import VGrid, {VGridVueTemplate} from "@revolist/vue-datagrid";
import categories from "../../../assets/mapping.json";
import findDistrictFeatureByName from "../utils/findDistrictFeatureByName";
import ValueCell from "./ValueCell.vue";
import YearCell from "./YearCell.vue";
import MenuCell from "./MenuCell.vue";
import CategoryCell from "./CategoryCell.vue";
import {getTimestamps} from "../../../utils/timeline";

export default {
    name: "DashboardTable",
    components: {
        Tool,
        VGrid
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
                {prop: "menu", autoSizeColumn: true, cellTemplate: VGridVueTemplate(MenuCell)},
                {name: "Kategorie", prop: "category", size: 150, cellTemplate: VGridVueTemplate(CategoryCell)},
                {name: "Jahr", prop: "years", autoSizeColumn: true, size: 40, cellTemplate: VGridVueTemplate(YearCell)}
            ],
            rows: [],
            rowDefinitions: [],
            grouping: {
                props: ["group"]
            },
            timeStampPrefix: "jahr_",
            currentTimeStamp: 0
        };
    },
    computed: {
        ...mapGetters("Tools/DashboardTable", Object.keys(getters)),
        ...mapGetters("Tools/DistrictLoader", {featureList: "featureList", districtLevelStats: "districtLevels"}),
        ...mapGetters("Tools/DistrictSelector", ["selectedFeatures", "keyOfAttrName", "keyOfAttrNameStats", "districtLevels"]),
        ...mapGetters("Map", ["layerById"]),
        columns () {
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
            console.log(this.columns);
            console.log(this.rows);
        },
        featureList () {
            this.getData();
        },
        openTimelineRows (openRows) {
            this.rowDefinitions = this.rows.map((row, rowIndex) => ({
                type: "row",
                index: rowIndex,
                size: openRows.includes(rowIndex) ? 40 * row.years.length : 40
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
            this.rows = categories.reduce((rows, category) => {
                if (!category[this.keyOfAttrNameStats]) {
                    return rows;
                }

                return [
                    ...rows,
                    this.getDistrictStatsByCategory(category)
                ];
            }, []);
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
                    {
                        name: level.label,
                        prop: level.label,
                        children: this.generateColumnsForLevel(level)
                    }
                ];
            }, []);
        },
        generateColumnsForLevel (level) {
            const columnNames = Object.keys(this.rows[0] || []).filter(districtName => {
                return level.features.some(feature => feature.get(level.keyOfAttrName) === districtName);
            });

            return columnNames.map(districtName => ({
                name: districtName,
                prop: districtName,
                cellTemplate: VGridVueTemplate(ValueCell),
                currentTimeStamp: 2019,
                timeStampPrefix: this.timeStampPrefix
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
            <VGrid
                key="dashboard-table"
                ref="dashboard-table"
                theme="compact"
                :source="rows"
                :columns="columns"
                :grouping="grouping"
                :autoSizeColumn="{
                    mode: 'autoSizeOnTextOverlap'
                }"
                :row-headers="{size: 40}"
                :row-definitions="rowDefinitions"
                :row-size="40"
                resize
            />
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


