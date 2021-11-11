/** Calculates the ratio of a set of features.
* @param {Object[]} dataArray Of Objects containing data to be calculated.
* @param {String} year Year from which data is to be selected.
* @returns {Object[]} Array of calculated Data.
*/
export default function calculateRatio (dataArray, year) {
    const results = [];

    dataArray.forEach(dataSet => {
        const calcObj = {
                scope: dataSet.name,
                paramA_val: typeof dataSet.paramA_calc === "object" ? dataSet.paramA_calc[year] : dataSet.paramA_calc,
                paramB_val: typeof dataSet.paramB_calc === "object" ? dataSet.paramB_calc[year] : dataSet.paramB_calc
            },
            calculation = calculateSingle(calcObj, dataSet);

        results.push(calculation);
    });

    return calculateTotals(results);
}
/** Calculates the extent of a set of features.
* @param {Object} calcObj pre-transformed dataSet.
* @param {Object} dataSet Original dataSet from dataArray.
* @returns {Object} calculated single dataset.
*/
function calculateSingle (calcObj, dataSet) {
    const relation = calcObj.paramA_val / calcObj.paramB_val,
        capacity = calcObj.paramA_val * (dataSet.faktorf_B / dataSet.faktorf_A),
        need = calcObj.paramB_val * (dataSet.faktorf_A / dataSet.faktorf_B),
        coverageA = (calcObj.paramA_val / need) * dataSet.perCalc_B,
        coverageB = (calcObj.paramB_val / need) * dataSet.perCalc_A,
        weightedRelation = relation * (dataSet.perCalc_A / dataSet.perCalc_B);

    calcObj.relation = relation;
    calcObj.capacity = capacity;
    calcObj.need = need;
    calcObj.coverage = coverageA;
    calcObj.mirrorCoverage = coverageB;
    calcObj.weightedRelation = weightedRelation;
    calcObj.data = dataSet;

    return calcObj;
}
/** Calculates total and average values for all single Datasets.
* @param {Array} results Array of all single dataset.
* @returns {Array} Updated Array.
*/
function calculateTotals (results) {
    const filteredResults = results.filter(function (dataSet) {
            if (dataSet.paramA_val === undefined || dataSet.paramB_val === undefined) {
                return false;
            }

            return true;

        }),
        dataHelpers_total = {
            faktorf_A: filteredResults[0].data.faktorf_A,
            faktorf_B: filteredResults[0].data.faktorf_B,
            perCalc_A: filteredResults[0].data.perCalc_A,
            perCalc_B: filteredResults[0].data.perCalc_B,
            incompleteDataSets_A: filteredResults.reduce((total, district) => total + district.data.incompleteDataSets_A, 0),
            incompleteDataSets_B: filteredResults.reduce((total, district) => total + district.data.incompleteDataSets_B, 0),
            dataSets_A: filteredResults.reduce((total, district) => total + district.data.dataSets_A, 0),
            dataSets_B: filteredResults.reduce((total, district) => total + district.data.dataSets_B, 0)
        },
        resultsTotal = {
            scope: "Gesamt",
            paramA_val: filteredResults.reduce((total, district) => total + district.paramA_val, 0),
            paramB_val: filteredResults.reduce((total, district) => total + district.paramB_val, 0)
        },
        total = calculateSingle(resultsTotal, dataHelpers_total),
        dataHelpers_avg = {
            faktorf_A: filteredResults[0].data.faktorf_A,
            faktorf_B: filteredResults[0].data.faktorf_B,
            perCalc_A: filteredResults[0].data.perCalc_A,
            perCalc_B: filteredResults[0].data.perCalc_B,
            incompleteDataSets_A: resultsTotal.data.incompleteDataSets_A / filteredResults.length,
            incompleteDataSets_B: resultsTotal.data.incompleteDataSets_B / filteredResults.length,
            dataSets_A: resultsTotal.data.dataSets_A / filteredResults.length,
            dataSets_B: resultsTotal.data.dataSets_B / filteredResults.length
        },
        resultsAverage = {
            scope: "Durchschnitt",
            paramA_val: resultsTotal.paramA_val / results.length,
            paramB_val: resultsTotal.paramB_val / results.length
        },
        avg = calculateSingle(resultsAverage, dataHelpers_avg);

    results.push(total, avg);
    return results;

}


