/**
 * Gets all available Years from array of features.
 * @param {Object[]} features Array Of Features.
 * @param {String} year_selector The identifier for year data (usually "jahr_").
 * @returns {String[]} The Array of all available Years in the data set.
 */
export default function getAvailableYears (features, year_selector) {
    const availableYears = [];

    features.forEach(feature => {

        Object.keys(feature.getProperties()).forEach(key => {
            if (key.includes(year_selector)) {
                // availableYears.push(key.substr(key.indexOf(year_selector) + 1));
                availableYears.push(key.replace(year_selector, ""));
            }
        });
    });

    return [...new Set(availableYears)];
}
