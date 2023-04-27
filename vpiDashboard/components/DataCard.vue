<script>
import {mapActions, mapGetters, mapState} from "vuex";
import getters from "../store/gettersVpiDashboard";
import actions from "../store/actionsVpiDashboard";
import DataCardPaginator from "./DataCardPaginator.vue";

export default {
    name: "DataCard",
    components: {DataCardPaginator},
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
    data () {
        return {
            currentMonthIndex: 0,
            currentDayIndex: 0
        };
    },
    computed: {
        ...mapGetters("Tools/VpiDashboard", Object.keys(getters)),
        ...mapGetters("Language", ["currentLocale"]),
        ...mapState(
            "Tools/VpiDashboard",
            [
                "averageVisitorsPerMonth",
                "averageVisitorsPerDay",
                "individualVisitorsPerYear"
            ]),
        statisticSet () {
            if (this.detail === "monthly") {
                return this.averageVisitorsPerMonth[this.currentMonthIndex].avg.toLocaleString(this.currentLocale);
            }
            if (this.detail === "daily") {
                return this.averageVisitorsPerDay[this.currentDayIndex].avg.toLocaleString(this.currentLocale);
            }
            if (this.detail === "individualVisitors") {
                return this.individualVisitorsPerYear.toLocaleString(this.currentLocale);
            }
            return null;
        },
        paginatorData () {
            if (this.detail === "monthly") {
                return ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
            }
            if (this.detail === "daily") {
                return ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
            }
            return null;
        },
        showDetailsButton () {
            return Boolean(this.detail === "monthly" || this.detail === "daily");
        }
    },
    methods: {
        ...mapActions("Tools/VpiDashboard", Object.keys(actions)),
        changeIndex (index) {
            if (this.detail === "monthly") {
                this.currentMonthIndex = index;
            }
            if (this.detail === "daily") {
                this.currentDayIndex = index;
            }
        },
        showChart (chartoverview, title) {
            this.changeChart(chartoverview);
            this.changeChartStyle(title);
            this.changeButtonStyles(title);
        },
        changeButtonStyles (title) {
            const detailButtonId = "button" + title,

                detailButtons = document.querySelectorAll(".detailButton"),
                allDataButton = document.getElementById("all-data-button");

            allDataButton.classList.remove("btn-primary");
            allDataButton.classList.add("btn-secondary");

            detailButtons.forEach(detailButton => {
                if (detailButton.id === detailButtonId) {
                    detailButton.classList.remove("btn-secondary");
                    detailButton.classList.add("buttonClicked");
                }
                else {
                    detailButton.classList.remove("buttonClicked");
                    detailButton.classList.add("btn-secondary");
                }
            });
        },


        changeChartStyle (title) {
            const cardId = "card" + title,
                cards = document.querySelectorAll(".statistic-card");

            cards.forEach(card => {
                card.classList.remove("blue-card");
                if (card.id === cardId) {
                    card.classList.toggle("blue-card");
                }
            });
        }
    }
};
</script>

<template>
    <div
        :id="`card` + title"
        class="card statistic-card"
    >
        <h4>{{ title }}</h4>
        <div v-if="navigation">
            <DataCardPaginator
                :paginator-data="paginatorData"
                @pager="changeIndex"
            />
        </div>
        <div v-else>
            <span class="current-index sub-index">{{ subtitle }}</span>
        </div>
        <div>
            <span class="card-text">
                {{ statisticSet }}
            </span>
        </div>
        <div class="card-buttons">
            <button
                v-if="showDetailsButton"
                :id="`button` + title"
                class="btn-secondary detailButton"
                @click="showChart(`${detail}overview`, title)"
            >
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
  background: #f6f7f8;
  border: none;
}

.card h4 {
  font-size: 0.7rem;
  text-align: center;
  margin-bottom: 0;

}

.card .card-buttons {
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.buttonClicked{
    border:0.1rem solid white !important;
    color:white;
    background-color: #003063 !important;
}
.buttonClicked:hover{
    color:white !important;
}

.card-text {
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
