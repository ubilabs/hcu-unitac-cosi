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
 * Calculates a new statsFeature for the selected districts and their reference districts
 * @param {"add" | "subtract" | "multiply" | "divide"} operation - the mathmatical operation to execute
 * @returns {void}
 */
export function calculateStats (operation) {
    let properties, feature, val_A, val_B, res;
    const mappingObject = {
            category: this.fields.A.category + ` ${operationSymbols[operation]} ` + this.fields.B.category,
            group: "Berechnungen",
            valueType: valueTypes[operation]
        },
        timestamps = arrayIntersect(this.fields.A.years, this.fields.B.years);

    this.addCategoryToMapping(mappingObject);

    for (const col of this.districtColumns) {
        properties = {
            ...this.fields.A[col.value],
            kategorie: mappingObject.category,
            group: mappingObject.group
        };

        for (const timestamp of timestamps) {
            val_A = parseFloat(this.fields.A[col.value][this.timestampPrefix + timestamp]);
            val_B = parseFloat(this.fields.B[col.value][this.timestampPrefix + timestamp]);
            res = mathutils[operation](val_A, val_B);

            properties[this.timestampPrefix + timestamp] = res;
        }

        feature = new Feature(properties);
        col.district.statFeatures.push(feature);

        this.updateDistricts();
    }
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
        data = getXYPairs(this.fields.A, this.fields.B, this.selectedColumnNames, timestamps, this.timestampPrefix),
        xArr = data.map(d => d.x),
        yArr = data.map(d => d.y),
        fReg = mathutils.linearRegression(xArr, yArr),
        yEstArr = mathutils.yEst(data, fReg),
        stdDevArr = mathutils.stdDev(data, yEstArr),
        stdDev = mathutils.mean(stdDevArr),
        covar = mathutils.covar(xArr, yArr),
        corr = mathutils.pearsons(xArr, yArr);

    // console.log(fReg, data, stdDev, covar, corr);

    return {
        data,
        standardDeviation: stdDev,
        covariance: covar,
        correlation: corr,
        regression: fReg
    };
}
