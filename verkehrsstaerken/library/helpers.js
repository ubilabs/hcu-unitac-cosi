
/**
     * Removes the year from the end of the rowName.
     * After that if the last character is a " " or a "_", this also gets removed
     * @param {String} rowName Name of Row from gfiContent
     * @param {String/Number} year Year
     * @returns {String} - New row name withour the year at the end
     */
export function createNewRowName (rowName, year) {
    const yearAsString = String(year),
        index = rowName.indexOf(yearAsString) - 1,
        yearDigits = rowName.slice(-4).length,
        charBeforeYear = rowName.slice(index, -yearDigits);
    let newRowName = "";

    if (charBeforeYear === "_") {
        newRowName = rowName.replace("_" + yearAsString, "").trim();
    }
    else {
        newRowName = rowName.replace(" " + yearAsString, "").trim();
    }

    return newRowName;
}


/**
     * Prepares the Dataset and sets it directly in the model
     * @param {Object[]} dataPerYear Array of objects containing the data by year.
     * @param {Number[]} years Array of available years
     * @returns {void}
     */
export function combineYearsData (dataPerYear, years) {
    const dataset = [];

    if (years) {
        years.forEach(year => {
            const attrDataArray = dataPerYear.filter(item => item.year === year),
                yearObject = {year: year};

            attrDataArray.forEach(attrData => {
                yearObject[attrData.attrName] = attrData.value;
            });
            dataset.push(yearObject);
        });
    }
    return parseData(dataset);
}

/**
    * Parses the data and prepares them for creating the table or the graph.
    * Creates new attributes in data objects.
    * Tries to parse data to float.
    * @param {Object[]} dataArray contains the data to visualize
    * @returns {Object[]} the parsed data.
    */
function parseData (dataArray) {
    const parsedDataArray = [];

    dataArray.forEach(dataObj => {
        const parsedDataObj = {
            class: "dot",
            style: "circle"
        };

        Object.entries(dataObj).forEach(obj => {
            const dataVal = obj[1],
                dataAttr = obj[0],
                parseDataVal = parseDataValue(dataVal),
                parseFloatVal = parseFloat(parseDataVal);

            if (dataAttr === "Baustelleneinfluss") {
                parsedDataObj.class = "dot_visible";
                parsedDataObj.style = "rect";
            }
            if (isNaN(parseFloatVal)) {
                parsedDataObj[dataAttr] = parseDataVal;
            }
            else {
                parsedDataObj[dataAttr] = parseFloatVal;
            }

        });
        parsedDataArray.push(parsedDataObj);
    });

    return parsedDataArray;
}

/**
     * Maps the string "*" to "Ja".
     * If not, returnes the original value.
     * @param {String} value Input string.
     * @returns {String} - The mapped string.
     */
function parseDataValue (value) {
    if (value === "*") {
        return "Ja";
    }
    return value;
}

/**
         * Creates the definitions for the diagrams legend
         * @param   {String} value category of the inspection, e.g. "DTV"
         * @returns {Object[]} Definitions for diagram legend
         */
export function createLegendData (value) {
    const attr = [];

    if (value === "DTV") {
        attr.push({
            text: i18next.t("additional:modules.tools.gfi.themes.verkehrsstaerken.carsPerDay"),
            class: "dot",
            style: "circle"
        });
    }
    else if (value === "DTVw") {
        attr.push({
            text: i18next.t("additional:modules.tools.gfi.themes.verkehrsstaerken.carsPerDayWeekly"),
            class: "dot",
            style: "circle"
        });
    }
    else {
        attr.push({
            text: i18next.t("additional:modules.tools.gfi.themes.verkehrsstaerken.HGVsPerWeek"),
            class: "dot",
            style: "circle"
        });
    }

    attr.push({
        text: i18next.t("additional:modules.tools.gfi.themes.verkehrsstaerken.withConstructionSiteInfluence"),
        class: "dot_visible",
        style: "rect"
    });

    return attr;
}

/**
         * Mapping of the the y-axis name
         * @param   {String} value  category of the inspection, e.g. "DTV"
         * @returns {String} Mapped y-axis name
         */
export function createYAxisLabel (value) {
    if (value === "DTV") {
        return i18next.t("additional:modules.tools.gfi.themes.verkehrsstaerken.carsPerDay");
    }
    else if (value === "DTVw") {
        return i18next.t("additional:modules.tools.gfi.themes.verkehrsstaerken.carsPerDayWeekly");
    }
    return i18next.t("additional:modules.tools.gfi.themes.verkehrsstaerken.HGVsPerWeek");
}


export default {combineYearsData, createNewRowName, createLegendData, createYAxisLabel};


