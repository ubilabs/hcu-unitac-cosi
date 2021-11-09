
<script>
import {Bar} from "vue-chartjs";
import * as d3 from "d3";

/**
 * @param {Array} values values
 * @param {Number} bin_count bin_count
 * @param {Number} width width
 * @param {Number} height height
 * @returns {*} histogram
 */
export function createHistogram (values, bin_count, width, height) {
    const x = d3
            .scaleLinear()
            .domain([d3.min(values), d3.max(values)])
            .range([0, width]),
        ticks = x.ticks(bin_count),
        hist = d3
            .histogram()
            .value((e) => e)
            .domain(x.domain())
            .thresholds(ticks),
        bins = hist(values),

        y = d3
            .scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(bins, (d) => d.length)]);

    return {x, y, bins};
}

/**
 * @param {string} id id
 * @param {Number} x x
 * @param {Number} y y
 * @param {*} bins bins
 * @param {Number} width width
 * @param {Number} height height
 * @param {*} margin margin
 * @returns {void}
 */
function createSvg (id, x, y, bins, width, height, margin) {
    const svg = d3
        .select(id)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    svg.append("g").call(d3.axisLeft(y));

    svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", 1)
        .attr("transform", function (d) {
            return "translate(" + x(d.x0) + "," + y(d.length) + ")";
        })
        .attr("width", function (d) {
            return x(d.x1) - x(d.x0) - 1;
        })
        .attr("height", function (d) {
            return height - y(d.length);
        })
        .style("fill", "blue");
}

export default {
    name: "Histogram",
    extends: Bar,
    props: {
        values: {type: Array, default: null},
        binCount: {type: Number, default: 0},
        width: {type: Number, default: 0},
        height: {type: Number, default: 0},
        margin: {type: Number, default: 0}
    },

    data: () => ({}),
    mounted () {
        const values = this.values,
            margin = {
                top: this.margin,
                right: this.margin,
                bottom: this.margin,
                left: this.margin
            },
            width = this.width - margin.left - margin.right,
            height = this.height - margin.top - margin.bottom,

            {x, y, bins} = createHistogram(values, this.binCount, width, height);

        createSvg("#chart", x, y, bins, width, height, margin);
    }
};
</script>

<template>
    <svg id="chart" />
</template>

<style lang="less">
</style>

