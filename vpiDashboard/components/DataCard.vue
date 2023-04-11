<script>
import Paginator from "./Paginator.vue";
import {mapActions} from "vuex";
import actions from "../store/actionsVpiDashboard";

export default {
    name: "DataCard",
    components: {Paginator},
    props: {
        title: {
            type: String,
            required: true
        },
        number: {
            type: [Object, Number],
            required: true
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
    methods: {
        ...mapActions("Tools/VpiDashboard", Object.keys(actions)),

        previous () {
            console.log("previous");
        },
        next () {
            console.log("next");
        },
        showChart (chartoverview) {
            // console.log('showChart');
            this.changeChart(chartoverview);
        },
        getPagerValue(value) {
            console.log(value);
        }
    }
};
</script>

<template>

        <div class="card statistic-card">
            <h4>{{ title }}</h4>
            <div v-if="navigation">
                <Paginator @pager="getPagerValue" :subtitle="subtitle" />
            </div>
             <div v-else>
                <span class="current-index sub-index">{{ subtitle }}</span>
            </div>
            <div>
                <span class="statistic-value-text">{{ number }}</span>
            </div>
            <div class="buttons">
                <button @click="showChart('overview')">
                    All Data
                </button>
                <button @click="showChart('monthlyoverview')">
                    Details
                </button>
            </div>
        </div>
</template>

<style lang="scss">

.card{
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  width:12rem;
  max-width: 12rem;
  height:12rem;
  padding:1rem;
}

.card h4{
  font-size: 0.7rem;
  text-align: center;
  margin-bottom: 0;
  
}
.statistic-card {
    background: #f6f7f8;
    border-radius: 3px;
    border: none;
}
.card .buttons{
  width:100%;
  display: flex;
  justify-content: center;
  gap:1rem;
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
</style>
