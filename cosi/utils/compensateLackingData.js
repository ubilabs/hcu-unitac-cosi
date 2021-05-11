/**
 * Calculates the median for a given sample
 * @param {Number[]} data The array of existing values
 * @returns {Number} the median
 */
function median (data) {
    const sortData = data.sort(),
        mid = Math.ceil(sortData.length / 2);

    return sortData.length % 2 === 0 ? (sortData[mid] + sortData[mid - 1]) / 2 : sortData[mid - 1];
}

/**
 * Calculates the mean for a given sample
 * @param {Number[]} data The array of existing values
 * @returns {Number} the mean
 */
function mean (data) {
    return data.reduce((total, datum) => total + datum, 0) / data.length;
}

/** If parameters of a facility dataset is inconsistent, this function provides the average value from all other facilities.
* @param {Number[]} dataArray Of Objects containing data to be checked for lacking data sets.
* @param {String} [strategy="median"] The strategy that will be used for filling in the empty data. Can be "median" or "mean"
* @returns {Object[]} Array of complete/fixed Data.
*/
export default function compensateLackingData (dataArray, strategy = "median") {
    const completeData = [],
        incompleteData = [];
    let avg;

    dataArray.forEach(dataSet => {
        /**
         * @todo this should not only work with a precurated dataset
         */
        if (dataSet !== "avg") {
            completeData.push(dataSet);
        }
        else {
            incompleteData.push(dataSet);
        }
    });

    if (completeData.length === 0) {
        return "error";
    }

    if (incompleteData.length > 0) {
        if (strategy === "mean") {
            avg = mean(completeData);
        }
        else {
            avg = median(completeData);
        }

        for (let i = 0; i < incompleteData.length; i++) {
            completeData.push(avg);
        }
    }

    return {
        data: completeData,
        incompleteDataSets: incompleteData.length,
        totalDataSets: completeData.length
    };
}
