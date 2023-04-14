<script>
import ToolTemplate from "../../../src/modules/tools/ToolTemplate.vue";
import getters from "../store/gettersVpiDashboard";
import mutations from "../store/mutationsVpiDashboard";
import actions from "../store/actionsVpiDashboard";
import {mapGetters, mapActions, mapMutations} from "vuex";
import {getComponent} from "../../../src/utils/getComponent";
import DataCard from "./DataCard.vue";
import Tabs from "./Tabs.vue";
import LinechartItem from "../../../src/share-components/charts/components/LinechartItem.vue";
import BarchartItem from "../../../src/share-components/charts/components/BarchartItem.vue";
export default {
    name: "VpiDashboard",
    components: {
        ToolTemplate,
        DataCard,
        LinechartItem,
        BarchartItem,
        Tabs
    },
    data () {
        return {
            chartType: "bar",
            filterData: {
                bestAvgDay: ["mo", "tu", "we", "th", "fr", "sa", "su"],
                bestAvgMonth: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
            },
            avgBestDay: 0,
            avgBestHour: 0,
            avgBestMonth: 0,
            individualVisitorsPerYear: 0,
            layerList: null,
            chartdata: {
                bar: {
                    datasets: [
                        {
                            backgroundColor: "#FD736B",
                            data: [1, 2, 3],
                            hoverOffset: 4,
                            label: "Label"
                        }
                    ]
                },
                line: {
                    datasets: [
                        {
                            backgroundColor: "#FD736B",
                            data: [1, 2, 3],
                            hoverOffset: 4,
                            label: "Label"
                        }
                    ]
                }
            },
            chartMonthsData: {
                bar: {
                    datasets: [
                        {
                            backgroundColor: "#FD736B",
                            data: [1, 2, 3],
                            hoverOffset: 4,
                            label: "Label"
                        }
                    ]
                },
                line: {
                    datasets: [
                        {
                            backgroundColor: "#FD736B",
                            data: [1, 2, 3],
                            hoverOffset: 4,
                            label: "Label"
                        }
                    ]
                }
            },
            chartDailyData: {
                bar: {
                    datasets: [
                        {
                            backgroundColor: "#FD736B",
                            data: [1, 2, 3],
                            hoverOffset: 4,
                            label: "Label"
                        }
                    ]
                }
            },
            TabItems: [
                {
                    index: 0,
                    name: "Individuelle Besucher",
                    selected: true
                },
                {
                    index: 1,
                    name: "Geschlecht",
                    selected: false
                },
                {
                    index: 2,
                    name: "Altersgruppe",
                    selected: false
                },
                {
                    index: 3,
                    name: "Verweildauer",
                    selected: false
                },
                {
                    index: 4,
                    name: "Besuchertypen",
                    selected: false
                },
                {
                    index: 5,
                    name: "Distanz",
                    selected: false
                }
            ]
        };
    },
    computed: {
        ...mapGetters("Tools/VpiDashboard", Object.keys(getters)),
        ...mapGetters("Language", ["currentLocale"])
    },
    async created () {
        this.$on("close", this.close);
        await this.getWhatALocationData();
    // this.getWhatALocationData();
    },
    methods: {
        ...mapMutations("Tools/VpiDashboard", Object.keys(mutations)),
        ...mapActions("Tools/VpiDashboard", Object.keys(actions)),
        close () {
            this.setActive(false);
            const model = getComponent(this.$store.state.Tools.VpiDashboard.id);

            if (model) {
                model.set("isActive", false);
            }
        },
        setChartType (chartType) {
            this.chartType = chartType;
        },
        async getWhatALocationData () {
            await this.getIndividualVisitors();
            this.avgBestDay = Math.round(this.getAverageVisitorsPerDay(this.filterData.bestAvgDay[0])).toLocaleString(this.currentLocale);
            this.avgBestHour = Math.round(this.getBestHour[0].avg).toLocaleString(this.currentLocale);
            this.avgBestMonth = Math.round(this.getAverageVisitorsPerMonth(this.filterData.bestAvgMonth[0])).toLocaleString(this.currentLocale);
            this.individualVisitorsPerYear = Math.round(this.getIndividualVisitorsPerYear).toLocaleString(this.currentLocale);
            // Create the chart data
            this.chartdata.bar = this.getBarChartData;
            this.chartdata.line = this.getLineChartData;
            this.chartMonthsData.bar = this.getBarChartMonthlyData;
            this.chartMonthsData.line = this.getLineChartMonthlyData;

            this.chartDailyData.bar = this.getBarChartDailyData;
        },
        getDayPager (index) {
            this.avgBestDay = Math.round(this.getAverageVisitorsPerDay(this.filterData.bestAvgDay[index])).toLocaleString(this.currentLocale);
        },
        getMonthPager (index) {
            this.avgBestMonth = Math.round(this.getAverageVisitorsPerMonth(this.filterData.bestAvgMonth[index])).toLocaleString(this.currentLocale);
        },
        showChart (chartoverview) {
            this.changeChart(chartoverview);
            let cards = document.querySelectorAll(".statistic-card");
            cards.forEach(card => {
              card.classList.remove("blue-card");
            });

        }
    }
};
</script>

<template lang="html">
    <ToolTemplate
        :title="$t(name)"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :initial-width="700"
        :deactivate-g-f-i="deactivateGFI"
    >
        <template #toolBody>
            <div class="row h-100">
                <div class="col-12 col-md-12 col-lg-12 h-100">
                    <div class="h-100">
                        <!-- Tabs Component (START) -->
                        <div
                            class="tabs horizontal"
                            role="tabs"
                            disabled="false"
                        >
                            <!-- <Tabs /> -->
                            <Tabs :tab-items="TabItems">
                                <div slot="tab-content-0">
                                    <!-- Tab Inhalt (START) -->
                                    <div class="tab">
                                        <div
                                            class="tab-panel h-100"
                                            role="tabpanel"
                                        >
                                            <div class="tab-content h100">
                                                <div class="row">
                                                    <div class="headline">
                                                        <h3>
                                                            Mönckebergstrasse 3, 20095 Hamburg
                                                        </h3>
                                                    </div>
                                                </div>
                                                <div class="row cards">
                                                    <DataCard
                                                        title="Ø Individuelle Besucher pro Jahr"
                                                        :number="individualVisitorsPerYear"
                                                        :navigation="false"
                                                    />
                                                    <DataCard
                                                        title="Ø individuelle tägliche Besucher an einem"
                                                        :number="avgBestDay"
                                                        :navigation="true"
                                                        :filter-data="filterData.bestAvgDay"
                                                        detail="monthly"
                                                        @pager="getDayPager"
                                                    />
                                                    <DataCard
                                                        title="Ø individuelle tägliche Besucher pro Monat"
                                                        :number="avgBestMonth"
                                                        :navigation="true"
                                                        :filter-data="filterData.bestAvgMonth"
                                                        detail="daily"
                                                        @pager="getMonthPager"
                                                    />
<!--                                                    <DataCard-->
<!--                                                        title="Ø individuelle tägliche Besucher pro Monat in"-->
<!--                                                        :number="monthdata"-->
<!--                                                        :navigation="true"-->
<!--                                                        subtitle="Januar"-->
<!--                                                    />-->
<!--                                                    <DataCard-->
<!--                                                        title="Bestes Jahr"-->
<!--                                                        :number="2023"-->
<!--                                                        :navigation="false"-->
<!--                                                        subtitle="Jahr zu Datum"-->
<!--                                                    />-->
                                                </div>
                                                <div class="charts">
                                                    <!-- Bar Chart -->
                                                    <div v-if="chartType === 'bar'">
                                                        <div
                                                            v-if="chartData === 'overview'"
                                                            class="row chart bar"
                                                        >
                                                            <BarchartItem :data="chartdata.bar" />
                                                        </div>
                                                        <div
                                                            v-if="chartData === 'monthlyoverview'"
                                                            class="row chart bar"
                                                        >
                                                            <BarchartItem :data="chartMonthsData.bar" />
                                                        </div>
                                                        <div
                                                            v-if="chartData === 'dailyoverview'"
                                                            class="row chart bar"
                                                        >
                                                            <BarchartItem :data="chartDailyData.bar" />
                                                        </div>
                                                    </div>
                                                    <!-- Line Chart -->
                                                    <div v-if="chartType === 'line'">
                                                        <div
                                                            v-if="chartData === 'overview'"
                                                            class="row chart line"
                                                        >
                                                            <LinechartItem :data="chartdata.line" />
                                                        </div>
                                                        <div
                                                            v-if="chartData === 'monthlyoverview'"
                                                            class="row chart line"
                                                        >
                                                            <LinechartItem :data="chartMonthsData.line" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="charts chart-types select">
                                                    <button
                                                        type="button"
                                                        :class="['btn', chartType === 'bar' ? 'btn-primary': 'btn-secondary']"
                                                        @click="setChartType('bar')"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="16"
                                                            height="16"
                                                            fill="currentColor"
                                                            class="bi bi-bar-chart-line"
                                                            viewBox="0 0 16 16"
                                                        >
                                                            <path d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1V2zm1 12h2V2h-2v12zm-3 0V7H7v7h2zm-5 0v-3H2v3h2z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        :class="['btn', chartType === 'line' ? 'btn-primary': 'btn-secondary']"
                                                        @click="setChartType('line')"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="16"
                                                            height="16"
                                                            fill="currentColor"
                                                            class="bi bi-graph-up"
                                                            viewBox="0 0 16 16"
                                                        >
                                                            <path
                                                                fill-rule="evenodd"
                                                                d="M0 0h1v15h15v1H0V0Zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07Z"
                                                            />
                                                        </svg>
                                                    </button>
                                                    <button @click="showChart('overview')">
                                                        All Data
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- Tab Inhalt (ENDE) -->
                                </div>
                                <div slot="tab-content-1">
                                    <h1>Tab 2 Content</h1>
                                    Component Here
                                </div>
                                <div slot="tab-content-2">
                                    <h1>Tab 3 Content</h1>
                                    Component Here
                                </div>
                                <div slot="tab-content-3">
                                    <h1>Tab 4 Content</h1>
                                    Component Here
                                </div>
                                <div slot="tab-content-4">
                                    <h1>Tab 5 Content</h1>
                                    Component Here
                                </div>
                                <div slot="tab-content-5">
                                    <h1>Tab 6 Content</h1>
                                    Component Here
                                </div>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </ToolTemplate>
</template>

<style scoped>
.cards {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  gap: 1rem;
}

.charts {
    margin: 0.5rem;
}
</style>
