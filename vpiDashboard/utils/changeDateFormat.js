/**
 * @param {Number} month The month of the date
 * @param {Number} year The year of the date
 * @return {string} The new formatted string MM-YYYY
 */
export function changeDateFormat (month, year) {
    return `${month.toString().padStart(2, "0")}-${year}`;
}
