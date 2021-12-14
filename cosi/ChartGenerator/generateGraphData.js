import {color} from "d3-color";
import generateColorScale from "./generateColorScale";
import beautifyKey from "../../../src/utils/beautifyKey";

/**
         * @description Generates the graph component and passes the data dynamically.
         * @param {Object} arg dataSet containing the data and a String for type property.
         * @param {Object} type type
         * @returns {void}
         */
export default function generateGraphData (arg, type) {
    const dataSet = JSON.parse(JSON.stringify(arg)),
        colorRange = generateColorScale(dataSet);

    dataSet.data.dataSets.forEach((set, index) => {
        let getColor = colorRange(index),
            d3Color = color(getColor);

        if (!getColor) {
            getColor = "rgba(0, 40, 255, 1)";
            d3Color = color(getColor);
        }

        d3Color.opacity = 0.5;
        set.borderColor = getColor;
        set.backgroundColor = d3Color;
    });

    if (type === "PieChart") {
        return createPieChartData(dataSet);
    }

    return dataSet;
}

/**
 * @description Modifies the dataSet to match chart.js requirements for PieCharts.
 * @param {Object} dataSet dataSet containing the data to be rendered as graph.
 * @returns {Array} Transformed Dataset.
 */
function createPieChartData (dataSet) {
    const newPieChartData = [];

    dataSet.data.labels.forEach((label, i) => {
        const obj = {
            name: beautifyKey(dataSet.name) + " - " + label,
            type: "PieChart",
            group: label,
            label: [],
            dataSets: {backgroundColor: [], data: []},
            target: dataSet.target ? dataSet.target : "",
            cgid: dataSet.cgid,
            id: dataSet.id,
            source: dataSet.source
        };

        dataSet.data.dataSets.forEach((set) => {
            const labelScope = set.label,
                labelVal = set.data[i];

            obj.label.push(labelScope);
            obj.dataSets.backgroundColor.push(set.backgroundColor);
            obj.dataSets.data.push(labelVal);
        });

        newPieChartData.push(obj);
    });

    return newPieChartData;
}
