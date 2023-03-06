/**
 * Composes a filename from a given name and the current date
 * @param {String} filename - the raw filename
 * @param {String} locale - language locale, e.g. "de-DE"
 * @returns {String} the filename
 */
export default function composeFilename (filename, locale = "en-US") {
    const date = new Date().toLocaleDateString(locale, {year: "numeric", month: "numeric", day: "numeric"});

    return `${filename}_${date}`;
}
