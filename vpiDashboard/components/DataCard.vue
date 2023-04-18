<script>
import Paginator from "./Paginator.vue";
import { mapActions, mapGetters, mapState } from "vuex";
import getters from "../store/gettersVpiDashboard";
import actions from "../store/actionsVpiDashboard";

export default {
  name: "DataCard",
  components: { Paginator },
  data() {
    return {
      currentMonthIndex: 0,
      currentDayIndex: 0
    }
  },
  props: {
    title: {
      type: String,
      required: true
    },
    detail: {
      type: String,
      required: false,
      default: ""
    },
    navigation: {
      type: Boolean,
      required: false,
      default: false
    },
    subtitle: {
      type: String,
      required: false,
      default: ""
    }
  },
  computed: {
    ...mapGetters("Tools/VpiDashboard", Object.keys(getters)),
    ...mapGetters("Language", ["currentLocale"]),
    ...mapState(
      "Tools/VpiDashboard",
      [
        'averageVisitorsPerMonth',
        'averageVisitorsPerDay',
        'individualVisitorsPerYear'
      ]),
    statisticSet() {
      if (this.detail == 'monthly') return this.averageVisitorsPerMonth[this.currentMonthIndex].avg.toLocaleString(this.currentLocale);
      if (this.detail == 'daily') return this.averageVisitorsPerDay[this.currentDayIndex].avg.toLocaleString(this.currentLocale);
      if (this.detail == 'individualVisitors') return this.individualVisitorsPerYear.toLocaleString(this.currentLocale);
    },
    filterData() {
      if (this.detail == "monthly") return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
      if (this.detail == "daily") return ["mo", "tu", "we", "th", "fr", "sa", "su"]
    },

  },
  methods: {
    ...mapActions("Tools/VpiDashboard", Object.keys(actions)),
    changeIndex(index) {
      if (this.detail == "monthly") this.currentMonthIndex = index
      if (this.detail == "daily") this.currentDayIndex = index
    },
    showChart(chartoverview, title) {
      this.changeChart(chartoverview);
      this.changeChartStyle(title)
    },

    changeChartStyle(title) {
      let cardId = "card" + title;
      let cards = document.querySelectorAll(".statistic-card");
      cards.forEach(card => {
        card.classList.remove("blue-card");
        if (card.id == cardId) card.classList.toggle("blue-card")
      });
    }
  }
};
</script>

<template>
  <div class="card statistic-card"
       :id="`card` + title">
    <h4>{{ title }}</h4>
    <div v-if="navigation">
      <Paginator :paginator-data="filterData"
                 @pager="changeIndex" />
    </div>
    <div v-else>
      <span class="current-index sub-index">{{ subtitle }}</span>
    </div>
    <div>
      <span class="statistic-value-text">
        {{ statisticSet }}
      </span>
    </div>
    <div class="buttons">
      <button v-if="detail !== ''"
              @click="showChart(`${detail}overview`, title)">
        Details
      </button>
    </div>
  </div>
</template>

<style lang="scss">
.card {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  width: 12rem;
  max-width: 12rem;
  height: 12rem;
  padding: 1rem;
}

.card h4 {
  font-size: 0.7rem;
  text-align: center;
  margin-bottom: 0;

}

.statistic-card {
  background: #f6f7f8;
  border-radius: 3px;
  border: none;
}

.card .buttons {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.statistic-value-text {
  font-family: "HamburgSans-Regular", sans-serif;
  font-style: normal;
  font-weight: 900;
  font-size: 16pt;
  text-align: center;
  letter-spacing: .2px;
  color: #000;
  display: block;
}


.blue-card {
  background-color: #003063 !important;
  color: white;
}

.blue-card .page-item a {
  background-color: #003063 !important;
  color: white;
}

.blue-card .statistic-value-text {
  color: white;
}
</style>
