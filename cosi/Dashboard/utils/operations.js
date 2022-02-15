import Feature from "ol/Feature";
import arrayIntersect from "../../utils/arrayIntersect";
import mathutils from "../../utils/math";

const operationSymbols = {
        add: "+",
        subtract: "-",
        multiply: "*",
        divide: "/"
    },
    valueTypes = {
        add: "absolute",
        subtract: "absolute",
        multiply: "relative",
        divide: "relative"
    };

/**
 * removes the timestamp values from the object before refilling it
 * @param {Object} properties - the properties to clean
 * @param {String} timestampPrefix - the string to look for
 * @return {Object} the clean object
 */
function pruneProps (properties, timestampPrefix) {
    for (const key in properties) {
        if (key.includes(timestampPrefix)) {
            delete properties[key];
        }
    }

    return properties;
}

/**
 * Calculates a new statsFeature for the selected districts and their reference districts
 * @param {"add" | "subtract" | "multiply" | "divide"} operation - the mathmatical operation to execute
 * @returns {void}
 */
export function calculateStats (operation) {
    let properties, feature, val_A, val_B, res;
    const mappingObject = {
            category: this.fields.A.category + ` ${operationSymbols[operation]} ` + this.fields.B.category,
            group: "Berechnungen",
            valueType: valueTypes[operation],
            isTemp: true
        },
        timestamps = arrayIntersect(this.fields.A.years, this.fields.B.years);

    this.addCategoryToMapping(mappingObject);

    for (const col of this.districtColumns) {
        properties = {
            ...this.fields.A[col.value],
            kategorie: mappingObject.category,
            group: mappingObject.group
        };

        pruneProps(properties, this.timestampPrefix);

        for (const timestamp of timestamps) {
            val_A = parseFloat(this.fields.A[col.value]?.[this.timestampPrefix + timestamp]);
            val_B = parseFloat(this.fields.B[col.value]?.[this.timestampPrefix + timestamp]);
            res = mathutils[operation](val_A, val_B);

            properties[this.timestampPrefix + timestamp] = res;
        }

        feature = new Feature(properties);
        col.district.statFeatures.push(feature);
    }

    this.updateDistricts();
}

/**
 * Sums up the values for all selected rows
 * @returns {void}
 */
export function sumUpSelected () {
    let properties, feature, vals, res;
    const
        mappingObject = {
            category: this.selectedItems.map(item => item.category).join(", "),
            group: "Berechnungen",
            valueType: "absolute",
            isTemp: true
        },
        timestamps = this.selectedItems.reduce((years, item) => arrayIntersect(years, item.years), [...this.selectedItems[0].years]);

    this.addCategoryToMapping(mappingObject);

    for (const col of this.districtColumns) {
        // skip columns for which not all properties are available
        if (this.selectedItems.find(item => !item[col.value])) {
            continue;
        }

        properties = {
            ...this.selectedItems[0][col.value],
            kategorie: mappingObject.category,
            group: mappingObject.group
        };

        pruneProps(properties, this.timestampPrefix);

        for (const timestamp of timestamps) {
            vals = this.selectedItems.map(item => parseFloat(item[col.value][this.timestampPrefix + timestamp])); // parseFloat(this.fields.A[col.value][this.timestampPrefix + timestamp])
            res = mathutils.sum(vals);

            properties[this.timestampPrefix + timestamp] = res;
        }

        feature = new Feature(properties);
        col.district.statFeatures.push(feature);
    }

    this.updateDistricts();
}

/**
 * Divides all selected rows by field B
 * @returns {void}
 */
export function divideSelected () {
    const currA = this.fields.A;

    for (const item of this.selectedItems) {
        this.fields.A = item;
        this.calculateStats("divide");
    }

    this.fields.A = currA;
}

/**
 * gets matching X/Y pairs for two data sets
 * @param {Object} datasetA - the data for category A
 * @param {Object} datasetB - the data for category B
 * @param {String[]} districts - the district name list
 * @param {Number[]} timestamps - the list of timestamps to include
 * @param {String} timestampPrefix - the prefix for timestamp attributes
 * @returns {Object[]} the data pairs as array
 */
export function getXYPairs (datasetA, datasetB, districts, timestamps, timestampPrefix) {
    const data = [];

    for (const district of districts) {
        for (const timestamp of timestamps) {
            const datum = {
                district: district,
                timestamp: timestamp,
                x: parseFloat(datasetA[district][timestampPrefix + timestamp]),
                y: parseFloat(datasetB[district][timestampPrefix + timestamp])
            };

            if (isNaN(datum.x) || isNaN(datum.y)) {
                continue;
            }

            data.push(datum);
        }
    }

    return data;
}

/**
 * Calculates a correlation and regression between two datasets
 * Can be used for the rendering of a scatterplot
 * @returns {Object} the correlation dataset
 */
export function calculateCorrelation () {
    const timestamps = arrayIntersect(this.fields.A.years, this.fields.B.years),
        data = getXYPairs(this.fields.A, this.fields.B, this.selectedColumns
            .map(col => col.value)
            .filter(colName => colName !== "average" && colName !== "total"),
        timestamps, this.timestampPrefix),
        xArr = data.map(d => d.x),
        yArr = data.map(d => d.y),
        fReg = mathutils.linearRegression(xArr, yArr),
        yEstArr = mathutils.yEst(data, fReg),
        stdDevArr = mathutils.stdDev(data, yEstArr),
        stdDev = mathutils.mean(stdDevArr),
        covar = mathutils.covar(xArr, yArr),
        corr = mathutils.pearsons(xArr, yArr);

    return {
        data,
        standardDeviation: stdDev,
        covariance: covar,
        correlation: corr,
        regression: fReg
    };
}

/**
 * Calculates the average of a dataset
 * @param {Object} item - the data for that category
 * @param {String[]} districtNames - the districts objects to generate the chart data for
 * @param {Number} timestamp - the current timestamp
 * @param {String} timestampPrefix - the prefix for timestamp attributes
 * @returns {Number} the average
 */
export function getAverage (item, districtNames, timestamp, timestampPrefix) {
    if (item.valueType !== "absolute") {
        return "-";
    }
    let result = getTotal(item, districtNames, timestamp, timestampPrefix);

    result /= districtNames.filter(dist => item[dist]).length;

    return result;
}

/**
 * Calculates the total of a dataset
 * @param {Object} item - the data for that category
 * @param {String[]} districtNames - the districts objects to generate the chart data for
 * @param {Number} timestamp - the current timestamp
 * @param {String} timestampPrefix - the prefix for timestamp attributes
 * @returns {Number} the total
 */
export function getTotal (item, districtNames, timestamp, timestampPrefix) {
    if (item.valueType !== "absolute") {
        return "-";
    }
    let result = 0;

    for (const district of districtNames) {
        if (item[district]?.[timestampPrefix + timestamp]) {
            result += parseFloat(item[district][timestampPrefix + timestamp]);
        }
    }

    return result;
}

/**
 * Removes a stats category from the table
 * @param {String} category - the category to delete
 * @param {String} group - the group the category belongs to (to avoid duplicates)
 * @returns {void}
 */
export function deleteStats (category, group) {
    this.removeCategoryFromMapping({category, group});
    this.updateDistricts();
}
