import {convertColor} from "../../src/utils/convertColor";
import moment from "moment";

/**
 * ComplexTypes are invented by the LGV to represent wfs array structures.
 * This is a collection of functions to use, handeling ComplexTypes.
 */

/**
 * a complex type is an object to represent a wfs array
 * @typedef {Object} ComplexType
 * @property {Object} metadata the metadata to describe the content of the array
 * @property {String} metadata.type the type e.g. "timeseries"
 * @property {String} metadata.format the format of the keys e.g. "DD.MM.YYYY"
 * @property {String} metadata.description the description of the values
 * @property {ComplexTypeValue[]} values an array of values
 */

/**
 * a set of data in a complex type is an object with key and value params
 * @typedef {Object} ComplexTypeValue
 * @property {String|Number} key the key of the array entry
 * @property {*} value the value for the key
 */

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


/**
 * sorts a complexType with the given compare function or ascending by its keys by default
 * @param {ComplexType} complexData the complex type to sort
 * @param {Function|boolean} [compareFunction=false] the compare function as function(firstEl, secondEl) to sort with or false to use a default behavior
 * @see sort https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
 * @returns {ComplexType} the complex type with sorted values
 */
function sortComplexType (complexData, compareFunction = false) {
    if (!isComplexType(complexData)) {
        return false;
    }
    else if (typeof compareFunction === "function") {
        complexData.values.sort(compareFunction);
        return complexData;
    }

    if (complexData.metadata.type === "timeseries") {
        sortComplexTypeTimeseries(complexData, complexData.metadata.format);
        return complexData;
    }

    sortComplexTypeDefault(complexData);
    return complexData;
}


/** private */

/**
 * private function of complexType.js - sorts the given complexType (must be valid) plain by its keys
 * @param {ComplexType} complexData the complex type to sort
 * @returns {ComplexType} the sorted complex type
 */
function sortComplexTypeDefault (complexData) {
    return complexData.values.sort((firstEl, secondEl) => {
        if (typeof firstEl !== "object" || firstEl === null || !firstEl.hasOwnProperty("key")) {
            return 1;
        }
        else if (typeof secondEl !== "object" || secondEl === null || !secondEl.hasOwnProperty("key")) {
            return -1;
        }
        else if (firstEl.key < secondEl.key) {
            return -1;
        }
        else if (firstEl.key > secondEl.key) {
            return 1;
        }
        return 0;
    });
}

/**
 * private function of complexType.js - sorts the given complexType by keys with the given moment format
 * @param {ComplexType} complexData the complex type to sort
 * @param {String} format the format to sort with
 * @returns {ComplexType} the sorted complex type
 */
function sortComplexTypeTimeseries (complexData, format) {
    return complexData.values.sort((firstEl, secondEl) => {
        if (typeof firstEl !== "object" || firstEl === null || !firstEl.hasOwnProperty("key")) {
            return 1;
        }
        else if (typeof secondEl !== "object" || secondEl === null || !secondEl.hasOwnProperty("key")) {
            return -1;
        }
        return moment(firstEl.key, format).diff(moment(secondEl.key, format));
    });
}


export {
    convertComplexTypeToPiechart,
    isComplexType,
    sortComplexType
};
