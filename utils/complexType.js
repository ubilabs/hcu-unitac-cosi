import {convertColor} from "../../src/utils/convertColor";

/**
 * This function converts complex data to pie chartJs Data
 * Example complex data:
 *  complexData =
 *       {
 *           metadata: {
 *               type: "timeseries",
 *               format: "YYYY/YY",
 *               description: "Anzahl"
 *           },
 *           values: [
 *               {key: "2019/20", value: 372},
 *               {key: "2018/19", value: 392},
 *               {key: "2017/18", value: 398},
 *               {key: "2016/17", value: 381},
 *               {key: "2015/16", value: 384}
 *           ]
 *       },
 *
 * Example ChartJs Data:
 *  pieChartJSData =
 *      {
 *          datasets: [
 *               {
 *                   label: "Anzahl",
 *                   data: [
 *                       372,
 *                       392,
 *                       398,
 *                       381,
 *                       384
 *                   ],
 *                    backgroundColor: [
 *                       "rgba(230, 159, 0, 1)",
 *                       "rgba(86, 180, 233, 1)",
 *                       "rgba(0, 158, 115, 1)",
 *                       "rgba(240, 228, 66, 1)",
 *                       "rgba(0, 114, 178, 1)"
 *                    ],
 *                   hoverOffset: 4
 *               }
 *          ],
 *               labels: [
 *                   "2019/20",
 *                   "2018/19",
 *                   "2017/18",
 *                   "2016/17",
 *                   "2015/16"
 *               ]
 *       };
 * @param {Object} complexData a wfs complexType as Object{metadata, values}
 * @param {Array[]|boolean} [backgroundColors=false] the array of colors that overwrite default colors
 * @return {Object|boolean} an object following chartJS Dataset Configuration (see https://www.chartjs.org/docs/master/general/data-structures.html)
 */
function convertComplexTypeToPiechart (complexData, backgroundColors = false) {
    const data = [],
        labels = [],
        colors = [],
        defaultColors = Array.isArray(backgroundColors) && backgroundColors.length ? backgroundColors : [
            [230, 159, 0, 1],
            [86, 180, 233, 1],
            [0, 158, 115, 1],
            [240, 228, 66, 1],
            [0, 114, 178, 1],
            [213, 94, 0, 1],
            [204, 121, 167, 1]
        ];

    if (!isComplexType(complexData)) {
        return false;
    }
    complexData.values.forEach((elem, i) => {
        if (typeof elem === "object" && elem !== null && elem?.key && elem?.value) {
            data.push(elem.value);
            labels.push(elem.key);
            colors.push(convertColor(defaultColors[i % defaultColors.length], "rgbaString"));
        }
    });

    return {
        datasets: [{
            label: complexData.metadata.description ? complexData.metadata.description : "",
            data,
            backgroundColor: colors,
            hoverOffset: 4
        }],
        labels: labels
    };
}


/**
 * returns true if data is a complextype, or false if not
 * @param {Object} data the given data
 * @return {boolean} true or false
 */
function isComplexType (data) {
    return typeof data === "object" && data !== null
        && typeof data.metadata === "object" && data.metadata !== null
        && typeof data.metadata.type === "string"
        && typeof data.metadata.format === "string"
        && Array.isArray(data.values);
}

export {
    convertComplexTypeToPiechart,
    isComplexType
};
