<script>
import { mapGetters, mapActions } from "vuex";
import getters from "../../store/gettersVpiDashboard";
import actions from "../../store/actionsVpiDashboard";

// Components Import
import LinechartItem from "../../../../src/share-components/charts/components/LinechartItem.vue";
import DataCard from "../DataCard.vue";
import BarchartItem from "../../../../src/share-components/charts/components/BarchartItem.vue";
export default {
  name: "IndividualBesucher",
  components: {
    DataCard,
    LinechartItem,
    BarchartItem,
  },
  data() {
    return {
      chartType: "bar",
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
    }
  },
  computed: {
    ...mapGetters("Tools/VpiDashboard", Object.keys(getters)),
  },
  methods: {
    ...mapActions("Tools/VpiDashboard", Object.keys(actions)),
    async getWhatALocationData() {

      // Create the chart data
      this.chartdata.bar = this.getBarChartData;
      this.chartdata.line = this.getLineChartData;
      this.chartMonthsData.bar = this.getBarChartMonthlyData;
      this.chartMonthsData.line = this.getLineChartMonthlyData;
      this.chartDailyData.bar = this.getBarChartDailyData;
      this.chartDailyData.line = this.getLineChartDailyData;
    },

    setChartType(chartType) {
      this.chartType = chartType;
    },
    showChart(chartoverview) {
      this.changeChart(chartoverview);
      let cards = document.querySelectorAll(".statistic-card");
      cards.forEach(card => {
        card.classList.remove("blue-card");
      });

    },
    close() {
      this.setActive(false);
      const model = getComponent(this.$store.state.Tools.VpiDashboard.id);

      if (model) {
        model.set("isActive", false);
      }
    },
  },
  async created() {
    this.$on("close", this.close);
    await this.getWhatALocationData();
  },
}
</script>
<template>
  <div class="tab">
    <div class="tab-panel h-100"
         role="tabpanel">
      <div class="tab-content h100">
        <div class="row">
          <div class="headline">
            <h3>
              Mönckebergstrasse 3, 20095 Hamburg
            </h3>
          </div>
        </div>
        <div class="row cards">
          <DataCard title="Ø Individuelle Besucher pro Jahr"
                    detail="individualVisitors"
                    :navigation="false" />
          <DataCard
                    title="Ø individuelle tägliche Besucher an einem"
                    :navigation="true"
                    detail="daily" />
          <DataCard
                    title="Ø individuelle tägliche Besucher pro Monat"
                    :navigation="true"
                    detail="monthly" />
        </div>
        <div class="charts">
          <!-- Bar Chart -->
          <div v-if="chartType === 'bar'">
            <div v-if="chartData === 'overview'"
                 class="row chart bar">
              <BarchartItem :data="chartdata.bar" />
            </div>
            <div v-if="chartData === 'monthlyoverview'"
                 class="row chart bar">
              <BarchartItem :data="chartMonthsData.bar" />
            </div>
            <div v-if="chartData === 'dailyoverview'"
                 class="row chart bar">
              <BarchartItem :data="chartDailyData.bar" />
            </div>
          </div>
          <!-- Line Chart -->
          <div v-if="chartType === 'line'">
            <div v-if="chartData === 'overview'"
                 class="row chart line">
              <LinechartItem :data="chartdata.line" />
            </div>
            <div v-if="chartData === 'monthlyoverview'"
                 class="row chart line">
              <LinechartItem :data="chartMonthsData.line" />
            </div>
            <div v-if="chartData === 'dailyoverview'"
                 class="row chart bar">
              <LinechartItem :data="chartDailyData.line" />
            </div>
          </div>
        </div>
        <div class="charts chart-types select">
          <button type="button"
                  :class="['btn', chartType === 'bar' ? 'btn-primary' : 'btn-secondary']"
                  @click="setChartType('bar')">
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="16"
                 height="16"
                 fill="currentColor"
                 class="bi bi-bar-chart-line"
                 viewBox="0 0 16 16">
              <path
                    d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1V2zm1 12h2V2h-2v12zm-3 0V7H7v7h2zm-5 0v-3H2v3h2z" />
            </svg>
          </button>
          <button type="button"
                  :class="['btn', chartType === 'line' ? 'btn-primary' : 'btn-secondary']"
                  @click="setChartType('line')">
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="16"
                 height="16"
                 fill="currentColor"
                 class="bi bi-graph-up"
                 viewBox="0 0 16 16">
              <path fill-rule="evenodd"
                    d="M0 0h1v15h15v1H0V0Zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07Z" />
            </svg>
          </button>
          <button @click="showChart('overview')">
            All Data
          </button>
        </div>
      </div>
    </div>
  </div>
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