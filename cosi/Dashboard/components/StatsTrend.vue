<script>
// import {interpolate} from "../../utils/math";
import {getTrendStyle} from "../utils/trends";

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
    methods: {
        getTrendStyle
        // filterLinear (x, len) {
        //     return (2 / len) * (x + 0.5);

        //     // a.map((x,i) => x * f(i)).reduce((r,x) => r+x, 0) / a.length
        // },
        // deriveLocalLinear (arr) {
        //     return arr.map((v, i) => arr[i + 1] / v).filter(v => !isNaN(v));
        // },
        // averageSlope (arr, steps = 5) {
        //     const _steps = arr.length > steps ? steps : arr.length;

        //     return arr
        //         .slice(arr.length - _steps)
        //         .map((v, i) => v * this.filterLinear(i, _steps))
        //         .reduce((r, v)=> r + v, 0) / _steps;
        // },
        // getTrendStyle () {
        //     const
        //         district = this.header.value,
        //         timestamps = this.item.years,
        //         vals = timestamps.map(t => parseFloat(this.item[district][this.timestampPrefix + t])).reverse(),
        //         dy_1 = this.deriveLocalLinear(vals),
        //         dy_2 = this.deriveLocalLinear(dy_1),
        //         avg_dy_2 = this.averageSlope(dy_2),
        //         dy = avg_dy_2 * dy_1[dy_1.length - 1];

        //     if (dy > 1.05) {
        //         return {color: "green", transform: "rotate(-45deg)"};
        //     }
        //     if (dy > 1.025 && dy <= 1.05) {
        //         return {color: "green", transform: "rotate(-30deg)"};
        //     }
        //     if (dy > 1.005 && dy <= 1.025) {
        //         return {color: "green", transform: "rotate(-15deg)"};
        //     }
        //     if (dy >= 0.995 && dy <= 1.005) {
        //         return {color: "lightgrey"};
        //     }
        //     if (dy >= 0.975 && dy < 0.995) {
        //         return {color: "crimson", transform: "rotate(15deg)"};
        //     }
        //     if (dy >= 0.95 && dy < 0.975) {
        //         return {color: "crimson", transform: "rotate(30deg)"};
        //     }
        //     if (dy < 0.95) {
        //         return {color: "crimson", transform: "rotate(45deg)"};
        //     }

        //     return {display: "none"};
        // }
    }
};

</script>

<template>
    <v-icon
        class="float-left"
        :style="getTrendStyle(item[header.value], item.years, timestampPrefix)"
    >
        mdi-arrow-right
    </v-icon>
</template>

<style lang="less" scoped>
    .float-left {
        float: left;
    }
</style>
