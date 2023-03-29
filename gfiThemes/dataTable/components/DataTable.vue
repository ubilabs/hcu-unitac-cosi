<script>

import {mapGetters} from "vuex";
import getters from "../../../../src/modules/tools/gfi/store/gettersGfi";
import {isWebLink} from "../../../../src/utils/urlHelper.js";
import ExportButtonCSV from "../../../../src/share-components/exportButton/components/ExportButtonCSV.vue";
import sortBy from "../../../../src/utils/sortBy";
import isObject from "../../../../src/utils/isObject";
import Multiselect from "vue-multiselect";

export default {
    name: "DataTable",
    components: {
        ExportButtonCSV,
        Multiselect
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
            rows: this.feature.getFeatures().map(singleFeature => singleFeature.getMappedProperties()),
            dropdownSelected: {},
            filterObject: {},
            originFilteredRows: undefined
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
        },
        /**
         * Returns whether the table is filterable.
         * @returns {Boolean} True if the table is filterable otherwise false.
         */
        isFilterable: function () {
            return this.feature.getTheme()?.params?.isFilterable || false;
        },
        /**
         * Returns the column which has an other order than 'origin'.
         * @returns {Object|undefined} The column or undefined if no column is found.
         */
        sortingColumn: function () {
            return this.columns.find(column => column.order !== "origin");
        }
    },
    watch: {
        filterObject: {
            handler () {
                const filteredRows = this.getFilteredRows(this.filterObject, this.originRows);

                this.originFilteredRows = filteredRows;
                if (this.sortingColumn) {
                    this.rows = this.getSortedRows(this.originFilteredRows ? this.originFilteredRows : this.rows, this.sortingColumn.order, this.sortingColumn.name);
                }
                else {
                    this.rows = filteredRows;
                }
            },
            deep: true
        }
    },
    created () {
        this.fileName = this.feature?.getTitle();
    },
    methods: {
        ...mapGetters("Tools/Gfi", Object.keys(getters)),
        isWebLink,
        isObject,
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
            return this.originFilteredRows ? this.originFilteredRows : this.originRows;
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
            this.rows = this.getSortedRows(this.originFilteredRows ? this.originFilteredRows : this.rows, column.order, column.name);
        },

        /**
         * Gets the unique values for given column name.
         * @param {String} columnName The column name.
         * @param {Object[]} originRows The rows to iterate.
         * @returns {String[]} the unique values.
         */
        getUniqueValuesByColumnName (columnName, originRows) {
            if (typeof columnName !== "string" || !Array.isArray(originRows) || !originRows.length) {
                return [];
            }
            const result = {};

            originRows.forEach(row => {
                if (typeof row[columnName] !== "undefined" && !result[row[columnName]]) {
                    result[row[columnName]] = true;
                }
            });
            return Object.keys(result);
        },

        /**
         * Adds a filter to the filterObject property.
         * @param {String} selectedOption The selected option.
         * @param {String} columnName The name of the column.
         * @returns {void}
         */
        addFilter (selectedOption, columnName) {
            if (typeof selectedOption !== "string" || typeof columnName !== "string") {
                return;
            }

            const value = selectedOption.toLowerCase(),
                filterObject = JSON.parse(JSON.stringify(this.filterObject));

            if (!Object.prototype.hasOwnProperty.call(filterObject, columnName)) {
                filterObject[columnName] = {};
            }
            filterObject[columnName][value] = true;
            this.filterObject = filterObject;
        },

        /**
         * Removes a filter from the filterObject property.
         * @param {String} removedOption The selected option.
         * @param {String} columnName The name of the column.
         * @returns {void}
         */
        removeFilter (removedOption, columnName) {
            if (typeof removedOption !== "string" || typeof columnName !== "string") {
                return;
            }
            const value = removedOption.toLowerCase(),
                filterObject = JSON.parse(JSON.stringify(this.filterObject));

            if (Object.keys(filterObject[columnName]).length === 1) {
                delete filterObject[columnName];
            }
            else {
                delete filterObject[columnName][value];
            }
            this.filterObject = filterObject;
        },

        /**
         * Gets the rows based on given filter.
         * @param {Object} filter The filter object.
         * @param {Object[]} allRows All rows to filter.
         * @returns {Object[]} the rows who matches the filter object.
         */
        getFilteredRows (filter, allRows) {
            if (!isObject(filter) || !Array.isArray(allRows)) {
                return [];
            }
            return allRows.filter((row) => {
                let filterHit = true,
                    allMatching = true;

                Object.keys(filter).forEach(key => {
                    if (!allMatching) {
                        return;
                    }
                    const filterValue = typeof row[key] === "string" ? filter[key][row[key].toLowerCase()] : false;

                    if (!filterValue) {
                        allMatching = false;
                        filterHit = false;
                    }
                });
                return filterHit;
            });
        }
    }
};
</script>

<template>
    <div id="table-data-container">
        <table
            class="table table-hover"
        >
            <thead>
                <th
                    v-for="col in columns"
                    :key="col.index"
                    class="filter-select-box-container"
                >
                    <div
                        v-if="isFilterable"
                        class="multiselect-dropdown"
                    >
                        <Multiselect
                            v-model="dropdownSelected[col.name]"
                            :options="getUniqueValuesByColumnName(col.name, originRows)"
                            :multiple="true"
                            :show-labels="false"
                            open-direction="auto"
                            :close-on-select="true"
                            :clear-on-select="false"
                            :searchable="false"
                            placeholder=""
                            :taggable="true"
                            class="multiselect-dropdown"
                            @select="(selectedOption) => addFilter(selectedOption, col.name)"
                            @remove="(removedOption) => removeFilter(removedOption, col.name)"
                        >
                            <template
                                slot="selection"
                            >
                                <span
                                    class="multiselect__single"
                                >{{ col.name }}</span>
                            </template>d
                        </Multiselect>
                    </div>
                    <span v-else>{{ col.name }}</span>
                    <div
                        v-if="isSortable"
                        class="bootstrap-icon"
                        :class="getIconClassByOrder(col.order)"
                        @click="runSorting(col)"
                        @keypress="runSorting(col)"
                    />
                </th>
            </thead>
            <tbody v-if="rows.length > 0">
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

<style lang="scss">
@import "~variables";

#table-data-container {
    margin:6px 15px 0 12px;
    min-height: 350px;

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
    .filter-select-box-container .multiselect {
        margin:0;
        padding: 0;
    }
    .filter-select-box-container .multiselect .multiselect__single {
        margin:0;
        padding: 0;
    }
    .filter-select-box-container .multiselect, .filter-select-box-container .multiselect__input, .filter-select-box-container .multiselect__single {
        font-family: inherit;
        font-size: $font-size-base;
    }
    .filter-select-box-container .multiselect .multiselect__tags {
        border: none;
        box-shadow: none;
    }
    .filter-select-box-container .multiselect .multiselect__option {
        display: block;
        min-height: 16px;
        line-height: 8px;
        text-decoration: none;
        text-transform: none;
        vertical-align: middle;
        position: relative;
        cursor: pointer;
        white-space: nowrap;
        padding: 10px 12px;
    }
    .filter-select-box-container .multiselect .multiselect__option--highlight, .filter-select-box-container .multiselect .multiselect__option--selected {
        background: $light_blue;
        outline: none;
        color: $white;
    }
    .filter-select-box-container .multiselect .option__image {
        width: 22px;
    }
    .filter-select-box-container .multiselect .multiselect__option--highlight:after {
        content: attr(data-select);
        background: $light_blue;
        color: $white;
    }
    .filter-select-box-container .multiselect .multiselect__tag-icon::after {
        content: "\D7";
        color: $light_grey;
        font-size: $font_size_big;
    }
    .filter-select-box-container .multiselect .multiselect__tag-icon:hover {
        background: $light_blue;
    }
    .filter-select-box-container .multiselect .multiselect__placeholder {
        display: none;
    }
    .filter-select-box-container .multiselect .multiselect__tag-icon:focus, .multiselect__tag-icon:hover {
        background: $light_grey;
    }
    .filter-select-box-container .multiselect__select {
        height: 34px;
        line-height: 14px;
    }
    .filter-select-box-container .multiselect__select::before {
        top: 64%;
    }
    .filter-select-box-container .multiselect--active {
        color: $black;
        background-color: $white;
        border-color: $light_blue;
        outline: 0;
        box-shadow: unset;
    }
}
</style>
