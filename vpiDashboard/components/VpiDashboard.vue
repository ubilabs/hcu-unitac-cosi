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
            data: Object,
            avgBestDay: 0,
            avgBestHour: 0,
            individualVisitorsPerYear: 0,
            layerList: null,
            chartdata: {
                bar: null,
                line: null
            },
            monthdata: null,
            chartMonthsData: {
                bar: null,
                line: null
            }
        };
    },
    computed: {
        ...mapGetters("Tools/VpiDashboard", Object.keys(getters)),


    },
    async created () {
        this.$on("close", this.close);
        await this.getIndividualVisitors();
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
            this.avgBestDay = this.getAverageVisitorsPerDay;
            this.avgBestHour = this.getBestHour[0].avg;
            this.individualVisitorsPerYear = this.getIndividualVisitorsPerYear;
            // await this.placingPointMarker([566533.53, 5934063.35]);
            this.chartdata.bar = this.getBarChartData;
            this.chartdata.line = this.getLineChartData;
            this.monthdata = this.getIndividualVisitorsPerMonth;
            this.chartMonthsData.bar = this.getBarChartMonthlyData;
            this.chartMonthsData.line = this.getLineChartMonthlyData;
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
                            <Tabs />
                            <button @click="getWhatALocationData">
                                Get Data
                            </button>
                            <!-- Tabs Component (ENDE)-->
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
                                        <div class="row">
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
                    </div>
                </div>
            </div>
        </template>
    </ToolTemplate>
</template>

<style scoped>

</style>
