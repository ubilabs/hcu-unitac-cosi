/**
 * Unifies given String.
 * @param {String} str The String that is to be modified.
 * @returns {String} The unified string.
 */
 export default function unifyString (str) {
    if (typeof str === "string") {
        return str.replace(/\s/g, "").replace(/^\w/, c => c.toLowerCase());
    }
    return str;
}