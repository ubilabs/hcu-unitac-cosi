<script>
import {getTrendStyle, getTrend} from "../utils/trends";

export default {
    name: "StatsTrend",
    props: {
        item: {
            type: Object,
            required: true
        },
        header: {
            type: Object,
            required: true
        },
        currentTimestamp: {
            type: Number,
            default: undefined
        },
        timestampPrefix: {
            type: String,
            default: "jahr_"
        },
        locale: {
            type: String,
            default: "de-DE"
        }
    },
    computed: {
        dy () {
            return this.getTrend(this.item[this.header.value], this.item.years, this.currentTimestamp, this.timestampPrefix);
        }
    },
    methods: {
        getTrend,
        getTrendStyle
    }
};

</script>

<template>
    <v-tooltip
        left
        :nudge-top="60"
    >
        <template #activator="{ on, attrs }">
            <v-icon
                class="float-left"
                :style="getTrendStyle(dy)"
                v-bind="attrs"
                v-on="on"
            >
                mdi-arrow-right
            </v-icon>
        </template>
        <span>
            <small>{{ ((dy - 1) * 100).toLocaleString(locale) }}%</small>
        </span>
    </v-tooltip>
</template>

<style lang="less" scoped>
    .float-left {
        float: left;
    }
</style>
