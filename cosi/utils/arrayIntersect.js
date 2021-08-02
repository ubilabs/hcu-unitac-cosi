/**
 * Gets the intersection (overlap) of two arrays
 * @param {any[]} arr1 - the 1st array
 * @param {any[]} arr2 - the 2nd array
 * @returns {any[]} the intersection of the two arrays
 */
export default function arrayIntersect (arr1, arr2) {
    const intersection = [];

    for (const el of arr1) {
        if (arr2.find(_el => _el === el)) {
            intersection.push(el);
        }
    }
    for (const el of arr2) {
        if (arr1.find(_el => _el === el) && !intersection.find(_el => _el === el)) {
            intersection.push(el);
        }
    }

    return intersection;
}
