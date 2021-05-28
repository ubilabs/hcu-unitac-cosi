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
 * tries to optimize the values of the ComplexType: cutting down decimal points, converts german numbers to ChartJS standard
 * @param {ComplexType} complexType the ComplexType to optimize
 * @param {Number|boolean} [decimals=false] the number of decimal points to cut at - or false if no cuts
 * @returns {ComplexType} the same complexType with optimized values
 */
function optimizeComplexTypeValues (complexType, decimals = false) {
    if (!isComplexType(complexType)) {
        return complexType;
    }
    const factor = decimals ? Math.pow(10, decimals) : false;

    complexType.values.forEach(item => {
        if (typeof item.value === "number" && factor !== false) {
            item.value = Math.round(item.value * factor) / factor;
        }
        else if (typeof item.value === "string") {
            if (item.value.indexOf(",") !== -1) {
                item.value = item.value.replace(/,/, ".");
            }
            if (decimals !== false) {
                item.value = Math.round(parseFloat(item.value) * factor) / factor;
            }
            else {
                item.value = Number(item.value);
            }
        }
    });
    return complexType;
}

/**
 * converter for complexTypes to pie chart data for ChartJS
 * @param {ComplexType} complexType the complexType to convert - sort complexTypes beforehand with sortComplexType
 * @param {Object} [options=null] options to apply to each pice of pie
 * @param {String[]|boolean} [pieColors=false] the array of colors (everything convertColor accepts) that overwrites the default colors
 * @see {@link https://jfly.uni-koeln.de/color/}
 * @return {Object|boolean} an object following chartJS dataset configuration or false on failure
 * @see {@link https://www.chartjs.org/docs/master/general/data-structures.html}
 */
function convertComplexTypeToPiechart (complexType, options = null, pieColors = false) {
    if (!isComplexType(complexType)) {
        return false;
    }
    const data = [],
        labels = [],
        label = complexType.metadata.description ? complexType.metadata.description : "",
        colors = [],
        defaultColors = Array.isArray(pieColors) && pieColors.length ? pieColors : [
            [230, 159, 0, 1],
            [86, 180, 233, 1],
            [0, 158, 115, 1],
            [240, 228, 66, 1],
            [0, 114, 178, 1],
            [213, 94, 0, 1],
            [204, 121, 167, 1]
        ];

    complexType.values.forEach((elem, idx) => {
        // elem without value mustn't be added for piecharts
        if (typeof elem === "object" && elem !== null && elem.key && elem.value) {
            data.push(elem.value);
            labels.push(elem.key);
            colors.push(convertColor(defaultColors[idx % defaultColors.length], "rgbaString"));
        }
    });
    return {
        datasets: [Object.assign({
            label,
            data,
            backgroundColor: colors,
            hoverOffset: 4
        }, options)],
        labels
    };
}

/**
 * converter for complexTypes to line chart data for ChartJS
 * @param {ComplexType} complexType the complexType to convert - sort complexTypes beforehand with sortComplexType
 * @param {Object} [options=null] options to apply to each line
 * @param {*} [lineColor="#005ca9"] the color of the line (everything convertColor accepts), the default is masterportal standard blue
 * @return {Object|boolean} an object following chartJS dataset configuration or false on failure
 * @see {@link https://www.chartjs.org/docs/master/general/data-structures.html}
 */
function convertComplexTypeToLinechart (complexType, options = null, lineColor = "#005ca9") {
    if (!isComplexType(complexType)) {
        return false;
    }
    return convertComplexTypesToMultilinechart([complexType], options, [lineColor]);
}

/**
 * converter for complexTypes to multi line chart data for ChartJS
 * @param {ComplexType[]} complexTypes an array of complexTypes to convert - sort each complexTypes beforehand with sortComplexType
 * @param {Object} [options=null] options to apply to each line
 * @param {String[]|boolean} [lineColors=false] the array of colors (everything convertColor accepts) that overwrites the default colors
 * @see {@link https://jfly.uni-koeln.de/color/}
 * @return {Object|boolean} an object following chartJS dataset configuration for multilinecharts or false on failure
 * @see {@link https://www.chartjs.org/docs/master/general/data-structures.html}
 */
function convertComplexTypesToMultilinechart (complexTypes, options = null, lineColors = false) {
    if (!Array.isArray(complexTypes)) {
        return false;
    }
    const labelsets = [],
        datasets = [],
        // default colors - see  https://jfly.uni-koeln.de/color/
        defaultColors = Array.isArray(lineColors) && lineColors.length ? lineColors : [
            [230, 159, 0, 1],
            [86, 180, 233, 1],
            [0, 158, 115, 1],
            [240, 228, 66, 1],
            [0, 114, 178, 1],
            [213, 94, 0, 1],
            [204, 121, 167, 1]
        ];

    complexTypes.forEach((complexType, idx) => {
        if (!isComplexType(complexType)) {
            return;
        }
        const data = [],
            labels = [],
            label = complexType.metadata.description ? complexType.metadata.description : "";

        complexType.values.forEach(elem => {
            if (typeof elem === "object" && elem !== null && elem.key) {
                labels.push(elem.key);
                data.push(typeof elem.value === "number" || elem.value ? elem.value : null);
            }
        });

        labelsets.push(labels);
        datasets.push(Object.assign({
            label,
            data,
            borderColor: convertColor(defaultColors[idx % defaultColors.length], "rgbaString"),
            backgroundColor: convertColor(defaultColors[idx % defaultColors.length], "rgbaString"),
            spanGaps: false,
            fill: false,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 4,
            lineTension: 0
        }, options));
    });

    if (!Array.isArray(labelsets) || !labelsets.length || !Array.isArray(datasets) || !datasets.length) {
        return false;
    }
    return {
        datasets,
        labels: getCompletestLabels(labelsets)
    };
}

/**
 * converter for complexTypes to bar chart data for ChartJS
 * @param {ComplexType} complexType a complexType to convert - sort the complexType beforehand with sortComplexType
 * @param {Object} [options=null] options to apply to each bar
 * @return {Object|boolean} an object following chartJS dataset configuration for multilinecharts or false on failure
 * @see {@link https://www.chartjs.org/docs/master/general/data-structures.html}
 */
function convertComplexTypeToBarchart (complexType, options = null) {
    if (!isComplexType(complexType)) {
        return false;
    }
    const label = complexType.metadata.description ? complexType.metadata.description : "",
        data = [],
        labels = [];

    complexType.values.forEach(elem => {
        // for bar charts elem without value shall be shown as gaps - so no check of elem.value
        if (typeof elem === "object" && elem !== null && elem.key) {
            data.push(elem.value);
            labels.push(elem.key);
        }
    });

    if (options?.backgroundColor) {
        options.backgroundColor = convertColor(options.backgroundColor, "rgbaString");
    }
    if (options?.hoverBackgroundColor) {
        options.hoverBackgroundColor = convertColor(options.hoverBackgroundColor, "rgbaString");
    }

    return {
        datasets: [Object.assign({
            label,
            data,
            // as standard colors we use masterportal standard blue and red
            backgroundColor: convertColor("#005ca9", "rgbaString"),
            hoverBackgroundColor: convertColor("#e10019", "rgbaString"),
            borderWidth: 1
        }, options)],
        labels
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
 * @param {ComplexType} complexType the complex type to sort
 * @param {Function|boolean} [compareFunction=false] the compare function as function(firstEl, secondEl) to sort with or false to use a default behavior
 * @see sort https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
 * @returns {ComplexType} the complex type with sorted values
 */
function sortComplexType (complexType, compareFunction = false) {
    if (!isComplexType(complexType)) {
        return false;
    }
    else if (typeof compareFunction === "function") {
        complexType.values.sort(compareFunction);
        return complexType;
    }

    if (complexType.metadata.type === "timeseries") {
        sortComplexTypeTimeseries(complexType, complexType.metadata.format);
        return complexType;
    }

    sortComplexTypeDefault(complexType);
    return complexType;
}


/** private */

/**
 * private function of complexType.js - sorts the given complexType (must be valid) plain by its keys
 * @param {ComplexType} complexType the complex type to sort
 * @returns {ComplexType} the sorted complex type
 */
function sortComplexTypeDefault (complexType) {
    return complexType.values.sort((firstEl, secondEl) => {
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


/** private */

/**
 * private function of complexType.js - sorts the given complexType by keys with the given moment format
 * @param {ComplexType} complexType the complex type to sort
 * @param {String} format the format to sort with
 * @returns {ComplexType} the sorted complex type
 */
function sortComplexTypeTimeseries (complexType, format) {
    return complexType.values.sort((firstEl, secondEl) => {
        if (typeof firstEl !== "object" || firstEl === null || !firstEl.hasOwnProperty("key")) {
            return 1;
        }
        else if (typeof secondEl !== "object" || secondEl === null || !secondEl.hasOwnProperty("key")) {
            return -1;
        }
        return moment(firstEl.key, format).diff(moment(secondEl.key, format));
    });
}

/**
 * helper function for convertComplexTypesToMultilinechart to filter the healthiest labels
 * @param {Array[]} labels an array of array of labels to choose from
 * @returns {String[]|boolean} the item from labels that seems to be the completest one or false if no label was found
 */
function getCompletestLabels (labels) {
    if (!Array.isArray(labels)) {
        return false;
    }
    let max = 0,
        result = false;

    labels.forEach(subset => {
        if (!Array.isArray(subset)) {
            return;
        }
        const len = subset.length;

        if (len > max) {
            max = len;
            result = subset;
        }
    });
    return result;
}

export {
    optimizeComplexTypeValues,
    convertComplexTypeToPiechart,
    convertComplexTypeToLinechart,
    convertComplexTypeToBarchart,
    convertComplexTypesToMultilinechart,
    isComplexType,
    sortComplexType
};
