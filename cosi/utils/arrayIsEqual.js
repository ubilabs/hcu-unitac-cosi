/**
 * compares two lists for equality
 * @param {Array.<any>} arr1 - the 1st list to compare
 * @param {Array.<any>} arr2 - the 2nd list to compare
 * @param {Boolean} ordered - is the list order important?
 * @returns {Boolean} are the arrays equal?
 */
export default function arrayIsEqual (arr1, arr2, ordered = false) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    if (!ordered) {
        for (const el of arr1) {
            if (!arr2.find(_el => _el === el)) {
                return false;
            }
        }
    }
    else {
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
    }
    return true;
}
