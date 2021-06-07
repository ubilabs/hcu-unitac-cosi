/** If parameters of a facility dataset is inconsistent, this function provides the average value from all other facilities.
* @param {Object[]} dataArray Of Objects containing data to be checked for lacking data sets.
* @returns {Object[]} Array of complete/fixed Data.
*/
export default function compensateLackingData (dataArray) {
    const completeData = [],
        incompleteData = [];

    if (dataArray.length === 0) {
        return {
            data: [],
            incompleteDataSets: 0,
            totalDataSets: 0
        };
    }

    dataArray.forEach(dataSet => {
        if (dataSet === undefined || dataSet === "") {
            incompleteData.push(dataSet);
        }
        else {
            completeData.push(dataSet);
        }
    });

    if (completeData.length === 0) {
        return "error";
    }

    if (incompleteData.length > 0) {
        // Old attempt: Calculating average value
        // const fixData = completeData.reduce((total, data) => total + data, 0) / completeData.length;

        // New attempt: Getting Median value
        const sortData = completeData.sort(),
            mid = Math.ceil(sortData.length / 2),

            median =
            sortData.length % 2 === 0 ? (sortData[mid] + sortData[mid - 1]) / 2 : sortData[mid - 1];

        for (let i = 0; i < incompleteData.length; i++) {
            completeData.push(median);
        }
    }

    return {
        data: completeData,
        incompleteDataSets: incompleteData.length,
        totalDataSets: completeData.length
    };
}
