import {scaleLinear} from "d3-scale";
import {hsl} from "d3-color";
import {interpolateRainbow} from "d3";

/**
 * @description Generates colorScale for the amount of dataSets in the data property of the dataSet to be generated.
 * @param {Object} dataSet dataSet containing the data to be rendered as graph.
 * @returns {Array} ColorScale Array.
 */
export default function generateColorScale (dataSet) {

    if (Array.isArray(dataSet.color)) {
        const domainRange = [0];

        dataSet.color.map(incColor => hsl(incColor));
        dataSet.color.forEach((incColor, index) => {
            if (index < (dataSet.color.length - 2)) {
                domainRange.push(dataSet.data.dataSets.length / (index + 2));
            }
        });

        domainRange.push(dataSet.data.dataSets.length);
        domainRange.sort();
        return scaleLinear().domain(domainRange).range(dataSet.color);
    }
    else if (dataSet.color === "rainbow") {
        const range = [],
            domainRange = [];

        dataSet.data.dataSets.forEach((set, index) => {
            domainRange.push(index);
        });

        dataSet.data.dataSets.forEach((set, index) => {
            const indexValue = (index + 1) / dataSet.data.dataSets.length,
                rainbowColor = interpolateRainbow(indexValue).toString();

            range.push(rainbowColor);
        });

        return scaleLinear().domain(domainRange).range(range);
    }

    const d3Color = hsl(dataSet.color);
    let colorA = "",
        colorB = "",
        range = "";

    d3Color.h += 20;
    d3Color.s += 0.3;
    d3Color.l += 0.15;

    colorA = String(d3Color);

    d3Color.h -= 40;
    d3Color.s -= 0.6;
    d3Color.l -= 0.3;

    colorB = String(d3Color);

    range = [colorA, String(d3Color), colorB];

    return scaleLinear().domain([0, dataSet.data.dataSets.length]).range(range);
}


// <template
//     v-if="type==='PieChart'"
// >
//     <!-- <PieChart
//         v-for="(pieData, j) in graph['PieChart']"
//         :id="`graph-${index}-${i}-${j}`"
//         :key="`graph-${index}-${i}-${j}`"
//         :data-sets="pieData"
//         :options="graph.options"
//     /> -->
// </template>
