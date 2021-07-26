import ChartDataSet from "../../ChartGenerator/classes/ChartDataSet";

/**
 * @description Adjusting data for Graph Generator Tool.
 * @param {Object} data - the item from the dashboardTable
 * @param {String} districtName the district name
 * @param {Number[]} timestamps - the timestamps for the x-Axis
 * @param {String} timestampPrefix - the string the timestamps start with (e.g. jahr_)
 * @returns {void}
 */
export function prepareGraphData (data, districtName, timestamps, timestampPrefix) {
    const statFeature = data[districtName],
        newDataSet = {
            label: districtName,
            data: []
        };

    for (const timestamp of timestamps) {
        newDataSet.data.push(statFeature[timestampPrefix + timestamp]);
    }

    newDataSet.data.reverse();

    return newDataSet;
}

/**
* @description Passes data to the Chart Generator Tool.
* @param {Object[]} graphData - the data for all districts
* @param {String} districtLevelLabel - the label of the districtLevel
* @param {String} category - the category to get the charts for
* @param {Number[]} timestamps - the timestamps for the x-Axis
* @returns {Void} Function returns nothing.
*/
export function generateGraphObj (graphData, districtLevelLabel, category, timestamps) {
    return new ChartDataSet({
        id: "ccm",
        name: districtLevelLabel + " - " + category,
        type: ["LineChart", "BarChart"],
        color: "blue",
        source: "Dashboard",
        scaleLabels: [category, "Jahre"],
        data: {
            labels: [...timestamps].reverse(),
            dataSets: graphData
        }
    });
}

/**
 * Generates chart data from a set of districts and their stats feature
 * @param {Object} data - the item from the dashboardTable
 * @param {String[]} districtNames - the districts objects to generate the chart data for
 * @param {String} districtLevelLabel - the label of the districtLevel
 * @param {String} timestampPrefix - the string the timestamps start with (e.g. jahr_)
 * @returns {ChartDataSet} the chart data
 */
export default function generateChartForDistricts (data, districtNames, districtLevelLabel, timestampPrefix = "jahr_") {
    const graphData = districtNames.map(dist => prepareGraphData(data, dist, data.years, timestampPrefix)),
        graphObj = generateGraphObj(graphData, districtLevelLabel, data.category, data.years);

    return graphObj;
}
