<script>

import {mapGetters} from "vuex";
import {createNewRowName, combineYearsData} from "../utils/helpers";
import VerkehrsstaerkenTable from "./VerkehrsstaerkenTable.vue";
import VerkehrsstaerkenLineChart from "./VerkehrsstaerkenLineChart.vue";

export default {
    name: "Verkehrsstaerken",
    components: {
        VerkehrsstaerkenTable,
        VerkehrsstaerkenLineChart
    },
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            activeTab: "table",
            downloadLink: "https://daten-hamburg.de/transport_verkehr/verkehrsstaerken/DTV_DTVw_Download.xlsx",
            years: [],
            rowNames: [],
            dataset: []
        };
    },
    computed: {
        ...mapGetters("Language", ["currentLocale"])
    },
    watch: {
        // When the gfi window switched with arrow, the connection will be refreshed
        feature: {
            handler () {
                this.filterProperties();
                this.setContentStyle();
            },
            immediate: true
        },
        // language is switched
        currentLocale: function (newVal, oldVal) {
            if (oldVal) {
                this.dataset = [];
                this.filterProperties();
            }
        }
    },
    mounted () {
        this.setContentStyle();
    },
    methods: {
        /**
         * Parses the mapped properties of gfi into several variables for the graphics and for the info tab.
         * @returns {void}
         */
        filterProperties () {
            const allProperties = this.feature.getMappedProperties(),
                dataPerYear = [],
                newRowNames = [],
                parsedYears = [];


            Object.keys(allProperties).forEach(rowName => {
                const year = parseInt(rowName.slice(-4), 10);
                let newRowName,
                    yearData;

                if (!isNaN(year)) {
                    newRowName = createNewRowName(rowName, year);
                    yearData = {
                        year: year,
                        attrName: newRowName,
                        value: allProperties[rowName]
                    };
                    dataPerYear.push(yearData);
                    newRowNames.push(newRowName);
                    parsedYears.push(year);
                }
            });
            this.years = [...new Set(parsedYears)];
            this.rowNames = [...new Set(newRowNames)];
            this.dataset = combineYearsData(dataPerYear, this.years);
        },


        /**
         * checks if the given tab name is currently active
         * @param {String} tab the tab name
         * @returns {Boolean}  true if the given tab name is active
         */
        isActiveTab (tab) {
            return this.activeTab === tab;
        },
        /**
         * set the current tab id after clicking.
         * @param {Object[]} evt the target of current click event
         * @returns {void}
         */
        setActiveTab (evt) {
            if (evt && evt.target && evt.target.hash) {
                this.activeTab = evt.target.hash.substring(1);
            }
        },
        /**
         * returns the classnames for the tab
         * @param {String} tab name of the tab depending on property activeTab
         * @returns {String} classNames of the tab
         */
        getTabPaneClasses (tab) {
            return {active: this.isActiveTab(tab), in: this.isActiveTab(tab), "tab-pane": true, fade: true};
        },
        /**
         * Setting the gfi content max width the same as graph
         * @returns {void}
         */
        setContentStyle () {
            if (document.getElementsByClassName("gfi-content").length) {
                document.getElementsByClassName("gfi-content")[0].style.maxWidth = "880px";
            }
        },
        /**
         * Reacts on click on download button. Opens the downloadLink.
         * @param {Object} evt the dedicated event
         * @returns {void}
         */
        onClick (evt) {
            evt.stopPropagation();
            window.open(this.downloadLink);
        }
    }
};
</script>

<template>
    <div class="verkehrsstaerken">
        <div class="panel header">
            <strong>{{ feature.getMappedProperties().Zählstelle +": "+feature.getMappedProperties().Bezeichnung }}</strong>
            <br>
            <small>{{ $t("additional:modules.tools.gfi.themes.verkehrsstaerken.kind", {kind: feature.getMappedProperties().Art}) }}</small>
        </div>
        <ul class="nav nav-pills">
            <li
                id="verkehrsstaerken-table-tab"
                value="table"
                :class="{ active: isActiveTab('table') }"
            >
                <a
                    href="#table"
                    @click="setActiveTab"
                >
                    {{ $t("additional:modules.tools.gfi.themes.verkehrsstaerken.table") }}
                </a>
            </li>
            <li
                id="verkehrsstaerken-diagram-tab"
                value="diagram"
                :class="{ active: isActiveTab('diagram') }"
            >
                <a
                    href="#diagram"
                    @click="setActiveTab"
                >
                    {{ $t("additional:modules.tools.gfi.themes.verkehrsstaerken.diagram") }}
                </a>
            </li>
        </ul>
        <div
            id="verkehrsstaerken-tab-content"
            class="tab-content"
        >
            <VerkehrsstaerkenTable
                :show="isActiveTab('table')"
                :class="getTabPaneClasses('table')"
                :row-names="rowNames"
                :years="years"
                :dataset="dataset"
                :type="String('table')"
            />
            <VerkehrsstaerkenLineChart
                :show="isActiveTab('diagram')"
                :class="getTabPaneClasses('diagram')"
                :dataset="dataset"
                :type="String('diagram')"
            />
        </div>
        <div
            v-if="!isActiveTab('info')"
            class="tab-pane downloadButton fade in active"
        >
            <button
                class="btn btn-primary csv-download"
                type="button"
                @click="onClick"
            >
                <span class="glyphicon glyphicon-download" />{{ $t("additional:modules.tools.gfi.themes.verkehrsstaerken.download") }}
            </button>
        </div>
    </div>
</template>

<style lang="less" scoped>
.verkehrsstaerken {
    overflow-x: auto;

    box-sizing: border-box;
    padding: 5px 20px 5px 20px;
    @media (max-width: 767px) {
        width: inherit;
        height: inherit;
        padding-left: 10px;
        padding-right: 10px;

        div.graph {
            width: inherit;
            height: inherit;
        }
    }
    @media (min-width: 768px) {
        width: 80vw;
        height: 50vh;
    }
    @media (min-width: 1024px) {
        width: 50vw;
        height: 50vh;
    }
    .header{
        text-align: center;
    }
    .nav-pills {
        padding: 6px;
    }
    .tab-content {
        overflow: auto;
        width: 100%;
        height: 32vh;
        padding: 0px 5px 5px 5px;
    }
    .downloadButton{
         padding: 6px;
         button{
            outline: none;
         }
    }
    .glyphicon {
        padding-right: 5px;
    }

}
</style>
