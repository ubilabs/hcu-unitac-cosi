import {generateSimpleGetters} from "../../../src/app-store/utils/generators";
import stateVpiDashboard from "./stateVpiDashboard";
import tabVisitorTypesGetters from "./tab/visitor-types/getters";
import tabCompareDatesGetters from "./tab/compare/dates/getters";
import tabCompareLocationsGetters from "./tab/compare/locations/getters";

const getters = {
    /**
     * Returns an object of simple getters for a state object, where
     * simple means that they will just return an entry for any key.
     * For example, given a state object {key: value}, an object
     * {key: state => state[key]} will be returned.
     * This is useful to avoid writing basic operations.
     */
    ...generateSimpleGetters(stateVpiDashboard),

    ...tabVisitorTypesGetters,
    ...tabCompareDatesGetters,
    ...tabCompareLocationsGetters,

    /**
     * Gets average data about unique visitors per weekday over all years, selected from WhatALocation data.
     * @param {Object} state the store's state object
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
    },
    /**
     * Generates the data array for the bar chart for location a
     * @param {Object} dwellTimeLocationA dwellTimeDataA state
     * @return {Object} data Object for bar chart
     */
    getDwellTimeLocationA ({dwellTimeLocationA}) {
        const
            avg_num_visitors = [],
            labels = [];

        dwellTimeLocationA.data.forEach((element) => {
            avg_num_visitors.push(Math.round(element.avg_num_visitors));
            labels.push(element.DwellTime);
        });
        // eslint-disable-next-line
        const data = {
            labels: labels,
            datasets: [{
                label: "Dwell Times Location A",
                data: avg_num_visitors,
                hoverOffset: 4,
                backgroundColor: "#FD763B"
            }]
        };

        return data;
    },
    /**
     * Generates the data array for the bar chart for location a
     * @param {Object} dwellTimeLocationB dwellTimeDataB state
     * @return {Object} data Object for bar chart
     */
    getDwellTimeLocationB ({dwellTimeLocationB}) {
        const
            avg_num_visitors = [],
            labels = [];

        dwellTimeLocationB.data.forEach((element) => {
            avg_num_visitors.push(Math.round(element.avg_num_visitors));
            labels.push(element.DwellTime);
        });
        // eslint-disable-next-line
        const data = {
            labels: labels,
            datasets: [{
                label: "Dwell Times Location B",
                data: avg_num_visitors,
                hoverOffset: 4,
                backgroundColor: "#0335FC"
            }]
        };

        return data;
    },
    /**
     * Generates the data array for the bar chart for location a
     * @param {Object} ageGroupsLocationA ageGroupsLocationA state
     * @return {Object} data Object for bar chart
     */
    getAgeGroupsLocationA ({ageGroupsLocationA}) {
        const
            avg_num_visitors = [],
            labels = [];

        ageGroupsLocationA.data.forEach((element) => {
            avg_num_visitors.push(Math.round(element.avg_num_visitors));
            labels.push(element.age_group);
        });
        // eslint-disable-next-line
        const data = {
            labels: labels,
            datasets: [{
                label: "Age Groups Location A",
                data: avg_num_visitors,
                hoverOffset: 4,
                backgroundColor: "#FD763B"
            }]
        };

        return data;
    },
    /**
     * Generates the data array for the bar chart for location b
     * @param {Object} ageGroupsLocationB ageGroupsLocationA state
     * @return {Object} data Object for bar chart
     */
    getAgeGroupsLocationB ({ageGroupsLocationB}) {
        const
            avg_num_visitors = [],
            labels = [];

        ageGroupsLocationB.data.forEach((element) => {
            avg_num_visitors.push(Math.round(element.avg_num_visitors));
            labels.push(element.age_group);
        });
        // eslint-disable-next-line
        const data = {
            labels: labels,
            datasets: [{
                label: "Age Groups Location B",
                data: avg_num_visitors,
                hoverOffset: 4,
                backgroundColor: "#0335FC"
            }]
        };

        return data;
    },
    /**
     * Generates the data array for the bar chart for location a
     * @param {Object} visitorTypesLocationA visitorTypesLocationA state
     * @return {Object} data Object for bar chart
     */
    getVisitorTypesLocationA ({visitorTypesLocationA}) {
        const
            avg_num_visitors = [],
            labels = [];

        visitorTypesLocationA.data.forEach((element) => {
            avg_num_visitors.push(Math.round(element.avg_num_visitors));
            labels.push(element.VisitorType);
        });
        // eslint-disable-next-line
        const data = {
            labels: labels,
            datasets: [{
                label: "Visitor Types Location A",
                data: avg_num_visitors,
                hoverOffset: 4,
                backgroundColor: "#FD763B"
            }]
        };

        return data;
    },
    /**
     * Generates the data array for the bar chart for location a
     * @param {Object} visitorTypesLocationB visitorTypesLocationB state
     * @return {Object} data Object for bar chart
     */
    getVisitorTypesLocationB ({visitorTypesLocationB}) {
        const
            avg_num_visitors = [],
            labels = [];

        visitorTypesLocationB.data.forEach((element) => {
            avg_num_visitors.push(Math.round(element.avg_num_visitors));
            labels.push(element.age_group);
        });
        // eslint-disable-next-line
        const data = {
            labels: labels,
            datasets: [{
                label: "Visitor Types Location B",
                data: avg_num_visitors,
                hoverOffset: 4,
                backgroundColor: "#0335FC"
            }]
        };

        return data;
    },
    /**
     * Generates the data array for the bar chart for location a
     * @param {Object} individualVisitorsLocationA visitorTypesLocationB state
     * @return {Object} data Object for bar chart
     */
    getIndividualVisitorsLocationA ({individualVisitorsLocationA}) {
        const
            avg_num_visitors = [],
            labels = [];

        individualVisitorsLocationA.data.forEach((element) => {
            avg_num_visitors.push(Math.round(element.avg_num_visitors));
            labels.push(element.ReiseArt);
        });
        // eslint-disable-next-line
        const data = {
            labels: labels,
            datasets: [{
                label: "Individual Vistors Location A",
                data: avg_num_visitors,
                hoverOffset: 4,
                backgroundColor: "#FD763B"
            }]
        };

        return data;
    },
    /**
     * Generates the data array for the bar chart for location a
     * @param {Object} individualVisitorsLocationB visitorTypesLocationB state
     * @return {Object} data Object for bar chart
     */
    getIndividualVisitorsLocationB ({individualVisitorsLocationB}) {
        const
            avg_num_visitors = [],
            labels = [];

        individualVisitorsLocationB.data.forEach((element) => {
            avg_num_visitors.push(Math.round(element.avg_num_visitors));
            labels.push(element.ReiseArt);
        });
        // eslint-disable-next-line
        const data = {
            labels: labels,
            datasets: [{
                label: "Individual Vistors Location B",
                data: avg_num_visitors,
                hoverOffset: 4,
                backgroundColor: "#0335FC"
            }]
        };

        return data;
    },
    /*
     * Gets Array containing all WhatALocation dwell time data per dwell time range.
     * @param {Object} state of this component
     * @returns {Array} Array of dwell time data
     */
    getDwellTimePerTime (state) {
        return state.dwellTimesPerTime;
    },
    /**
     * Gets Array containing all WhatALocation dwell time data per date.
     * @param {Object} state of this component
     * @returns {Array} Array of dwell time data
     */
    getDwellTimePerDate (state) {
        return state.dwellTimesPerDate;
    },
    /**
     * Get a dwell time ChartJS data object for the requested chart type.
     * @param {Object} state of this component
     * @returns {Object} ChartJS data for given chartType
     */
    getDwellTimeChartJsData: (state) => (chartType) => {
        const labels = [],
            data_30_60 = [],
            data_60_120 = [],
            data_120_240 = [],
            data_240 = [];

        Object.keys(state.dwellTimesPerDate).forEach(date => {
            const items = state.dwellTimesPerDate[date],
                theDate = new Date(date),
                year = theDate.getFullYear(),
                month = theDate.getMonth() + 1;

            // Set label from date, e.g. 2023-01-01 becomes 2023-01
            labels.push(`${year}-${month.toString().padStart(2, "0")}`);

            data_30_60.push(
                items.find(i => i.DwellTime === "30-60")?.sum_num_visitors || 0
            );
            data_60_120.push(
                items.find(i => i.DwellTime === "60-120")?.sum_num_visitors || 0
            );
            data_120_240.push(
                items.find(i => i.DwellTime === "120-240")?.sum_num_visitors || 0
            );
            data_240.push(
                items.find(i => i.DwellTime === "240+")?.sum_num_visitors || 0
            );
        });

        let chartData;

        switch (chartType) {
            case "line":
                chartData = {
                    labels: labels,
                    datasets: [
                        {
                            label: "30-60",
                            data: data_30_60,
                            fill: false,
                            borderColor: "#00AA55",
                            tension: 0.1
                        },
                        {
                            label: "60-120",
                            data: data_60_120,
                            fill: false,
                            borderColor: "#063970",
                            tension: 0.1
                        },
                        {
                            label: "120-240",
                            data: data_120_240,
                            fill: false,
                            borderColor: "#B381B3",
                            tension: 0.1
                        },
                        {
                            label: "240+",
                            data: data_240,
                            fill: false,
                            borderColor: "#CC3E00",
                            tension: 0.1
                        }]
                };
                break;
            case "bar":
            default:
                chartData = {
                    labels: labels,
                    datasets: [
                        {
                            label: "30-60",
                            data: data_30_60,
                            hoverOffset: 4,
                            backgroundColor: "#00AA55"
                        },
                        {
                            label: "60-120",
                            data: data_60_120,
                            hoverOffset: 4,
                            backgroundColor: "#063970"
                        },
                        {
                            label: "120-240",
                            data: data_120_240,
                            hoverOffset: 4,
                            backgroundColor: "#B381B3"
                        },
                        {
                            label: "240+",
                            data: data_240,
                            hoverOffset: 4,
                            backgroundColor: "#CC3E00"
                        }]
                };
                break;
        }

        return chartData;
    }
};

export default getters;
