import {generateSimpleGetters} from "../../../src/app-store/utils/generators";
import stateVpiDashboard from "./stateVpiDashboard";

const getters = {
    /**
     * Returns an object of simple getters for a state object, where
     * simple means that they will just return an entry for any key.
     * For example, given a state object {key: value}, an object
     * {key: state => state[key]} will be returned.
     * This is useful to avoid writing basic operations.
     * @param {object} state state to generate getters for
     * @param {object.<string, function>} object of getters
     */
    ...generateSimpleGetters(stateVpiDashboard),

    /**
     * Gets average data about unique visitors per weekday over all years, selected from WhatALocation data.
     * @param {Object} state the store's state object
     * @param {String} day day that shall be requested
     * @returns {Array} array of unique visitors for the day "day" over all years
     */
    getAverageVisitorsPerDay: (state) => (day) => {
        const daily = state.frequencyData?.unique?.dayly,
            averageVisitorsOnDay = daily.filter((element) => {
                return element.weekday === day;
            });

        return averageVisitorsOnDay[0].avg;
    },
    /**
     * Gets average data about unique visitors per month in each year, selected from WhatALocation data.
     * @param {Object} state the store's state object
     * @param {String} month month that shall be requested
     * @returns {Array} array of unique visitors for the month "month" in each year
     */
    getAverageVisitorsPerMonth: (state) => (month) => {
        const monthly = state.frequencyData?.unique?.monthly,
            averageVisitorsOnMonth = monthly.filter((element) => {
                return element.date__month === month;
            });

        return averageVisitorsOnMonth[0].avg;
    },
    /**
     * Gets data about unique visitors per year and weekday, selected from WhatALocation data.
     * @param {Object} frequencyData data from WhatALocation
     * @returns {Array} array of unique visitors per year and weekday
     */
    getBestDay ({frequencyData}) {
        return frequencyData.unique?.best_day;
    },
    /**
     * Gets data about unique visitors per time range (0-6, 6-12, 12-18, 18-24), selected from WhatALocation data.
     * @param {Object} frequencyData data from WhatALocation
     * @returns {Array} array of unique visitors per time range
     */
    getBestHour ({frequencyData}) {
        return frequencyData.unique?.best_hour;
    },
    /**
     * Gets data about unique visitors per year (sum per year and daily average), generated from WhatALocation data.
     * @param {Object} state the stores state object
     * @returns {Array} array of yearly data average, rounded
     */
    getIndividualVisitorsPerYear (state) {
        return state.individualVisitorsPerYear;
    },
    /**
     * Gets data for a bar chart, generated from WhatALocation daily data.
     * @param {Object} state the stores state object
     * @returns {Object} object that can be used in chartJS to create a bar chart
     */
    getBarChartDailyData (state) {
        const daily = state.averageVisitorsPerDay,
            labels = [],
            day_data = [],
            translatedLabelList = i18next.t("additional:modules.tools.vpidashboard.time.days", {returnObjects: true});

        daily.forEach((element, index) => {
            labels.push(translatedLabelList[index]);
            day_data.push(element.avg);
        });
        // eslint-disable-next-line
        const data = {
            labels: labels,
            datasets: [{
                label: i18next.t("additional:modules.tools.vpidashboard.unique.dailyOverview"),
                data: day_data,
                hoverOffset: 4,
                backgroundColor: "#FD763B"
            }]
        };

        return data;
    },
    /**
     * Gets data for a line chart, generated from WhatALocation daily data.
     * @param {Object} state the stores state object
     * @returns {Object} object that can be used in chartJS to create a line chart
     */
    getLineChartDailyData (state) {
        const daily = state.averageVisitorsPerDay,
            labels = [],
            day_data = [],
            translatedLabelList = i18next.t("additional:modules.tools.vpidashboard.time.days", {returnObjects: true});

        daily.forEach((element, index) => {
            labels.push(translatedLabelList[index]);
            day_data.push(element.avg);
        });

        // eslint-disable-next-line
        const data = {
            labels: labels,
            datasets: [{
                label: i18next.t("additional:modules.tools.vpidashboard.unique.dailyOverview"),
                data: day_data,
                fill: false,
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1
            }]
        };

        return data;
    },
    /**
     * Gets data for a bar chart, generated from WhatALocation monthly data.
     * @param {Object} state the stores state object
     * @returns {Object} object that can be used in chartJS to create a bar chart
     */
    getBarChartMonthlyData (state) {
        const monthly = state.averageVisitorsPerMonth,
            labels = [],
            month_data = [],
            translatedLabelList = i18next.t("additional:modules.tools.vpidashboard.time.months", {returnObjects: true});

        monthly.forEach((element) => {
            labels.push(translatedLabelList[element.index]);
            month_data.push(element.avg);
        });
        // eslint-disable-next-line
        const data = {
            labels: labels,
            datasets: [{
                label: i18next.t("additional:modules.tools.vpidashboard.unique.monthlyOverview"),
                data: month_data,
                hoverOffset: 4,
                backgroundColor: "#FD763B"
            }]
        };

        return data;
    },
    /**
     * Gets data for a line chart, generated from WhatALocation monthly data.
     * @param {Object} state the stores state object
     * @returns {Object} object that can be used in chartJS to create a line chart
     */
    getLineChartMonthlyData (state) {
        const monthly = state.averageVisitorsPerMonth,
            labels = [],
            month_data = [],
            translatedLabelList = i18next.t("additional:modules.tools.vpidashboard.time.months", {returnObjects: true});

        monthly.forEach((element) => {
            labels.push(translatedLabelList[element.index]);
            month_data.push(element.avg);
        });

        // eslint-disable-next-line
        const data = {
            labels: labels,
            datasets: [{
                label: i18next.t("additional:modules.tools.vpidashboard.unique.monthlyOverview"),
                data: month_data,
                fill: false,
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1
            }]
        };

        return data;
    },
    /**
     * Gets data for a bar chart, generated from WhatALocation data.
     * @param {Object} frequencyData data from WhatALocation
     * @returns {Object} object that can be used in chartJS to create a bar chart
     */
    getBarChartData ({frequencyData}) {
        const best_month = frequencyData?.unique?.best_month,
            labels = [],
            month_data = [];

        best_month.forEach((element) => {
            labels.push(element.date__month + "_" + element.date__year);
            month_data.push(element.sum);
        });
        // eslint-disable-next-line
        const data = {
            labels: labels.reverse(),
            datasets: [{
                label: i18next.t("additional:modules.tools.vpidashboard.unique.uniqueVisitors"),
                data: month_data.reverse(),
                hoverOffset: 4,
                backgroundColor: "#FD763B"
            }]
        };

        return data;
    },
    /**
     * Gets data for a line chart, generated from WhatALocation data.
     * @param {Object} frequencyData data from WhatALocation
     * @returns {Object} object that can be used in chartJS to create a line chart
     */
    getLineChartData ({frequencyData}) {
        const best_month = frequencyData?.unique?.best_month,
            labels = [],
            month_data = [];

        best_month.forEach((element) => {
            labels.push(element.date__month + "_" + element.date__year);
            month_data.push(element.sum);
        });
        // eslint-disable-next-line
        const data = {
            labels: labels.reverse(),
            datasets: [{
                label: i18next.t("additional:modules.tools.vpidashboard.unique.uniqueVisitors"),
                data: month_data.reverse(),
                fill: false,
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1
            }]
        };

        return data;
    },
    /**
     * Gets GeoJson containing all WhatALocation locations.
     * @param {Object} state of this component
     * @returns {Object} GeoJson of all locations
     */
    getAllLocationsGeoJson (state) {
        return state.allLocationsGeoJson;
    },
    /**
     * Gets Array containing all WhatALocation locations.
     * @param {Object} state of this component
     * @returns {Array} Array of all locations
     */
    getAllLocationsArray (state) {
        return state.allLocationsArray;
    }
};

export default getters;
