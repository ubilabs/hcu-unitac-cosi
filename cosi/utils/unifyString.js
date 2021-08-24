/**
 * Unifies given String.
 * @param {String} str The String that is to be modified.
 * @param {Boolean} [toLowerCase=true] The output string should be lowerCase.
 * @returns {String} The unified string.
 */
export default function unifyString (str, toLowerCase = true) {
    if (typeof str === "string") {
        return toLowerCase
            ? str.replace(/\s/g, "").replace(/^\w/, c => c.toLowerCase())
            : str.replace(/\s/g, "");
    }
    return str;
}
