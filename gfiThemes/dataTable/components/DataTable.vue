<script>

import {mapGetters} from "vuex";
import getters from "../../../../src/modules/tools/gfi/store/gettersGfi";
import {isWebLink} from "../../../../src/utils/urlHelper.js";
import ExportButtonCSV from "../../../../src/share-components/exportButton/components/ExportButtonCSV.vue";
import sortBy from "../../../../src/utils/sortBy";

export default {
    name: "DataTable",
    components: {
        ExportButtonCSV
    },
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            columns: this.getColumns(this.feature.getAttributesToShow()),
            rows: this.feature.getFeatures().map(singleFeature => singleFeature.getMappedProperties())
        };
    },
    computed: {
        /**
         * Gets the unsorted and unfiltered rows.
         * @returns {Object[]} The origin rows.
         */
        originRows: function () {
            return this.feature.getFeatures().map(singleFeature => singleFeature.getMappedProperties());
        },

        enableDownload: function () {
            return this.feature?.getTheme()?.params?.enableDownload;
        },

        /**
         * Returns whether the table is sortable.
         * @returns {Boolean} True if the table is sortable otherwise false.
         */
        isSortable: function () {
            return this.feature.getTheme()?.params?.isSortable || false;
        }
    },
    created () {
        this.fileName = this.feature?.getTitle();
    },
    methods: {
        ...mapGetters("Tools/Gfi", Object.keys(getters)),
        isWebLink,

        /**
         * Creates and returns the columns for the table.
         * @param {Object} gfiAttributes - The attributes to be displayed.
         * @returns {Object[]} The column objects.
         */
        getColumns (gfiAttributes) {
            return Object.keys(gfiAttributes).map((key, idx) => {
                return {
                    name: gfiAttributes[key],
                    order: "origin",
                    index: idx
                };
            });
        },

        /**
         * Gets a specific icon class to the passed order.
         * @param {String} order - The order in which the table is sorted.
         * @returns {String} The icon css class for the given order.
         */
        getIconClassByOrder (order) {
            if (order === "asc") {
                return "bi-arrow-up";
            }
            if (order === "desc") {
                return "bi-arrow-down";
            }
            return "bi-arrow-down-up origin-order";
        },

        /**
         * Gets the old sorted column if another one is to be sorted.
         * @param {Object[]} columns - The columns objects.
         * @param {Number} indexNewColumn - The index of the column that will be sorted.
         * @returns {Object|undefined} The old sorted column or undefined if it not exits.
         */
        getOldSortedColumn (columns, indexNewColumn) {
            return columns.find(col => {
                return col.order !== "origin" && col.index !== indexNewColumn;
            });
        },

        /**
         * Gets the rows sorted in the correct order.
         * @param {Object[]} rows - The rows.
         * @param {String} order - The order in which the table is sorted.
         * @param {String} columnName - The name of the column to sort by.
         * @returns {Object[]} The sorted rows.
         */
        getSortedRows (rows, order, columnName) {
            if (order === "asc") {
                return sortBy(rows, columnName);
            }
            if (order === "desc") {
                return sortBy(rows, columnName).reverse();
            }
            return this.originRows;
        },

        /**
         * Gets the next sort order.
         * @param {String} order - The order in which the table is sorted.
         * @returns {String} The sort order.
         */
        getSortOrder (order) {
            if (order === "origin") {
                return "asc";
            }
            if (order === "asc") {
                return "desc";
            }
            return "origin";
        },

        /**
         * Sets the order and sorts the table by the given column.
         * Sorting by a new column resets the order of the old column.
         * @param {Object} column - The column to sort by.
         * @returns {void}
         */
        runSorting (column) {
            const oldColumn = this.getOldSortedColumn(this.columns, column.index);

            if (oldColumn) {
                oldColumn.order = "origin";
            }
            column.order = this.getSortOrder(column.order);
            this.rows = this.getSortedRows(this.rows, column.order, column.name);
        }
    }
};
</script>

<template>
    <div id="table-data-container">
        <table
            v-if="rows.length > 0"
            class="table table-hover"
        >
            <thead>
                <th
                    v-for="col in columns"
                    :key="col.index"
                >
                    {{ col.name }}
                    <div
                        v-if="isSortable"
                        class="bootstrap-icon"
                        :class="getIconClassByOrder(col.order)"
                        @click="runSorting(col)"
                        @keypress="runSorting(col)"
                    />
                </th>
            </thead>

            <tbody>
                <tr
                    v-for="(singleRow, index1) in rows"
                    :key="index1"
                >
                    <td
                        v-for="(col, index2) in columns"
                        :key="index2"
                    >
                        <a
                            v-if="isWebLink(singleRow[col.name])"
                            :href="singleRow[col.name]"
                            target="_blank"
                        >
                            {{ singleRow[col.name] ? singleRow[col.name] : '' }}
                        </a>
                        <span v-else>
                            {{ singleRow[col.name] ? singleRow[col.name] : '' }}
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
        <div
            v-if="enableDownload === true"
            class="download"
        >
            <ExportButtonCSV
                :url="false"
                :filename="fileName"
                :data="rows"
                :use-semicolon="true"
                :title="$t('modules.tools.filter.download.labelBtn')"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

#table-data-container {
    margin:6px 15px 0 12px;

    .origin-order {
        opacity: 0.3;
        &:hover {
            opacity: 1;
        }
    }

    table {
        margin: 0;
        th {
            position: sticky;
            top: 0px;
            background: $white;
            div {
                cursor: pointer;
            }
        }
        td, th {
            padding: 6px;
        }
    }
    .download {
        position: sticky;
        bottom: 20px;
        float: right;
    }
}
</style>
