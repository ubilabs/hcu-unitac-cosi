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
    <div>
        <div class="card statistic-card">
            <h4>{{ title }}</h4>
            <div v-if="navigation">
                <Paginator @pager="getPagerValue" />
            </div>
            <div v-if="subtitle">
                <span class="current-index sub-index">{{ subtitle }}</span>
            </div>
            <div>
                <span class="statistic-value-text">{{ number }}</span>
            </div>
            <div>
                <button @click="showChart('overview')">
                    Show All Data Chart
                </button>
                <button @click="showChart('monthlyoverview')">
                    Show Details Chart
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
.statistic-card {
    background: #f6f7f8;
    border-radius: 3px;
    padding: 10pt;
    border: none;
    min-height: 100%;
    width: 100%;
    height: 100%
}

.statistic-value-text {
    font-family: "HamburgSans-Regular", sans-serif;
    font-style: normal;
    font-weight: 900;
    font-size: 16pt;
    text-align: center;
    letter-spacing: .2px;
    color: #000;
    margin-top: 15pt;
    display: block;
}
</style>
