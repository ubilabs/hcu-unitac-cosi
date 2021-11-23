<script>
// import {interpolate} from "../../utils/math";
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
        timestampPrefix: {
            type: String,
            default: "jahr_"
        }
    },
    computed: {
        dy () {
            return this.getTrend(this.item[this.header.value], this.item.years, this.timestampPrefix);
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
        <span>{{ ((dy - 1) * 100).toLocaleString("de-DE") }}%</span>
    </v-tooltip>
</template>

<style lang="less" scoped>
    .float-left {
        float: left;
    }
</style>
