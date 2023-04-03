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
            avgBestDay: 0,
            avgBestHour: 0,
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
            monthdata: 0,
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
        ...mapGetters("Tools/VpiDashboard", Object.keys(getters))
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
        async getWhatALocationData () {
            await this.getIndividualVisitors();
            this.avgBestDay = Math.round(this.getAverageVisitorsPerDay("su")).toLocaleString("de-DE");
            this.avgBestHour = Math.round(this.getBestHour[0].avg).toLocaleString("de-DE");
            this.individualVisitorsPerYear = Math.round(this.getIndividualVisitorsPerYear).toLocaleString("de-DE");
            this.chartdata.bar = this.getBarChartData;
            this.chartdata.line = this.getLineChartData;
            this.monthdata = Math.round(this.getIndividualVisitorsPerMonth).toLocaleString("de-De");
            this.chartMonthsData.bar = this.getBarChartMonthlyData;
            this.chartMonthsData.line = this.getLineChartMonthlyData;
        },
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
                                                        subtitle="Samstag"
                                                    />
                                                    <DataCard
                                                        title="Ø individuelle tägliche Besucher pro Tag"
                                                        :number="avgBestHour"
                                                        :navigation="true"
                                                        subtitle="06:00 12:00"
                                                    />
                                                    <DataCard
                                                        title="Ø individuelle tägliche Besucher pro Monat in"
                                                        :number="monthdata"
                                                        :navigation="true"
                                                        subtitle="Januar"
                                                    />
                                                    <DataCard
                                                        title="Bestes Jahr"
                                                        :number="2023"
                                                        :navigation="false"
                                                        subtitle="Jahr zu Datum"
                                                    />
                                                </div>
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
                            <button @click="getWhatALocationData">
                                Get Data
                            </button>
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
</style>
