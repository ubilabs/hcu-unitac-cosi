/** If parameters of a facility dataset is inconsistent, this function provides the average value from all other facilities.
* @param {Array} dataArray Of Objects containing data to be checked for lacking data sets.
* @returns {Array} Array of complete/fixed Data.
*/
export default function compensateLackingData (dataArray) {
    const completeData = [],
        incompleteData = [];

    dataArray.forEach(dataSet => {
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
        const fixData = completeData.reduce((total, data) => total + data, 0) / completeData.length;

        for (let i = 0; i < incompleteData.length; i++) {
            completeData.push(fixData);
        }
    }

    return completeData;
}
