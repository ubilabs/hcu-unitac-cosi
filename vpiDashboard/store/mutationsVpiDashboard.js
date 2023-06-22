import {generateSimpleMutations} from "../../../src/app-store/utils/generators";
import stateVpiDashboard from "./stateVpiDashboard";
import tabVisitorTypesMutations from "./tab/visitor-types/mutations";
import {changeDateFormat} from "../utils/changeDateFormat";

const mutations = {
    ...generateSimpleMutations(stateVpiDashboard),

    ...tabVisitorTypesMutations,

    /**
     * Sets the rounded monthly data for unique visitors to the state, selected from WhatALocation data.
     * @param {Object} state the store's state object
     * @param {Object} payload data from WhatALocation endpoint
     * @returns {void}
     */
    setAverageVisitorsPerMonth (state, payload) {
        const
            data = payload.data,
            aggregated = {},
            result = [];

        Object.keys(data).forEach(key => {
            const
                item = data[key],
                date = new Date(item.date),
                label = date.getMonth();

            if (!aggregated[label]) {
                aggregated[label] = {
                    sum: 0,
                    totalNumberOfDaysInMonthsOverYears: 0
                };
            }
            aggregated[label].sum = item.sum_num_visitors + aggregated[label].sum;
            aggregated[label].totalNumberOfDaysInMonthsOverYears++;
        });

        // Ceil up to 100, e.g. 18318 becomes 18400
        Object.keys(aggregated).forEach(key => {
            result.push({
                index: key,
                avg: Math.ceil(aggregated[key].sum / 100 / aggregated[key].totalNumberOfDaysInMonthsOverYears) * 100
            });
        });

        state.averageVisitorsPerMonth = result;
    },
    /**
     * Sets the rounded daily data for unique visitors to the state, selected from WhatALocation data.
     * @param {Object} state the store's state object
     * @param {Object} payload data from WhatALocation endpoint
     * @returns {void}
     */
    setAverageVisitorsPerDay (state, payload) {
        const
            data = payload.data,
            aggregated = {},
            result = [];

        Object.keys(data).forEach(key => {
            const
                item = data[key],
                date = new Date(item.date),
                label = date.getDay() - 1;

            if (!aggregated[label]) {
                aggregated[label] = {
                    sum: 0,
                    totalNumberOfWeekdaysInMonthsOverYears: 0
                };
            }
            aggregated[label].sum = item.sum_num_visitors + aggregated[label].sum;
            aggregated[label].totalNumberOfWeekdaysInMonthsOverYears++;

        });

        // Ceil up to 100, e.g. 18318 becomes 18400
        Object.keys(aggregated).forEach(key => {
            result.push({
                index: key,
                avg: Math.ceil(aggregated[key].sum / 100 / aggregated[key].totalNumberOfWeekdaysInMonthsOverYears) * 100
            });
        });

        state.averageVisitorsPerDay = result;
    },
    /**
     * Sets the rounded yearly data for unique visitors to the state, selected from WhatALocation data.
     * @param {Object} state the store's state object
     * @param {Object} payload data from WhatALocation endpoint
     * @returns {void}
     */
    setIndividualVisitorsPerYear (state, payload) {
        const
            data = payload.data,
            aggregated = {},
            result = [];

        Object.keys(data).forEach(key => {
            const
                item = data[key],
                date = new Date(item.date),
                label = date.getFullYear();

            if (!aggregated[label]) {
                aggregated[label] = 0;
            }
            aggregated[label] += item.sum_num_visitors;
        });

        // Ceil up to 100, e.g. 18318 becomes 18400
        Object.keys(aggregated).forEach(key => {
            result.push({
                date__year: key,
                avg: Math.ceil(aggregated[key] / 100) * 100
            });
        });

        state.individualVisitorsPerYear = result;
    },
    /**
     * Generate a GeoJson for all WhatALocation Locations.
     * @param {Object} state of this component
     * @param {Array} payload Array of all locations from WhatALocation endpoint
     * @returns {void}
     */
    setAllLocationsGeoJson (state, payload) {
        const geoJSON = {
                type: "FeatureCollection",
                crs: {
                    type: "link",
                    properties: {
                        href: "http://spatialreference.org/ref/epsg/4326/proj4/",
                        type: "proj4"
                    }
                },
                features: []
            },

            allLocationsArray = [];

        let featureJSON;

        payload.forEach(feature => {
            featureJSON = {
                type: "Feature",
                id: feature.location.id,
                geometry: feature.location.point,
                properties: {
                    street: feature.location.street,
                    id: feature.location.id
                    /* avgVisitorsMonday: Math.floor(feature.avg_daily_visitors_isoweekday[1]),
                    avgVisitorsTuesday: Math.floor(feature.avg_daily_visitors_isoweekday[2]),
                    avgVisitorsWednesday: Math.floor(feature.avg_daily_visitors_isoweekday[3]),
                    avgVisitorsThursday: Math.floor(feature.avg_daily_visitors_isoweekday[4]),
                    avgVisitorsFriday: Math.floor(feature.avg_daily_visitors_isoweekday[5]),
                    avgVisitorsSaturday: Math.floor(feature.avg_daily_visitors_isoweekday[6]),
                    avgVisitorsSunday: Math.floor(feature.avg_daily_visitors_isoweekday[7]),
                    avgVisitorsJanuary: Math.floor(feature.avg_daily_visitors_per_month[1]),
                    avgVisitorsFebruary: Math.floor(feature.avg_daily_visitors_per_month[2]),
                    avgVisitorsMarch: Math.floor(feature.avg_daily_visitors_per_month[3]),
                    avgVisitorsApril: Math.floor(feature.avg_daily_visitors_per_month[4]),
                    avgVisitorsMay: Math.floor(feature.avg_daily_visitors_per_month[5]),
                    avgVisitorsJune: Math.floor(feature.avg_daily_visitors_per_month[6]),
                    avgVisitorsJuly: Math.floor(feature.avg_daily_visitors_per_month[7]),
                    avgVisitorsAugust: Math.floor(feature.avg_daily_visitors_per_month[8]),
                    avgVisitorsSeptember: Math.floor(feature.avg_daily_visitors_per_month[9]),
                    avgVisitorsOctober: Math.floor(feature.avg_daily_visitors_per_month[10]),
                    avgVisitorsNovember: Math.floor(feature.avg_daily_visitors_per_month[11]),
                    avgVisitorsDecember: Math.floor(feature.avg_daily_visitors_per_month[12]) */
                }
            };

            /* Object.keys(feature.avg_daily_visitors_per_year).forEach(year => {
                featureJSON.properties["avgVisitors" + year] = Math.floor(feature.avg_daily_visitors_per_year[year]);
            }); */

            geoJSON.features.push(featureJSON);

            allLocationsArray.push({
                id: feature.location.id,
                street: feature.location.street
            });
        });

        geoJSON.styles = [
            {
                styleId: "customLayer",
                rules: [
                    {
                        style: {
                            circleStrokeColor: [
                                255,
                                0,
                                0,
                                1
                            ],
                            circleFillColor: [
                                255,
                                0,
                                0,
                                0.5
                            ]
                        }
                    }
                ]
            }
        ];

        state.allLocationsGeoJson = geoJSON;
        state.allLocationsArray = allLocationsArray;
    },
    /**
     * Sets the dwell times (grouped by "dwell time" and by date), selected from WhatALocation data.
     * @param {Object} state the store's state object
     * @param {Object} payload data from WhatALocation endpoint
     * @returns {void}
     */
    setDwellTimes (state, payload) {
        const dwellTimeByTime = {},
            dwellTimeByDate = {};

        payload.forEach(item => {
            // Visitor sum as integer
            item.sum_num_visitors = Math.ceil(item.sum_num_visitors / 100) * 100;

            // Grouped by dwell time
            if (!dwellTimeByTime[item.DwellTime]) {
                dwellTimeByTime[item.DwellTime] = [];
            }
            dwellTimeByTime[item.DwellTime].push(item);

            // Grouped by date
            if (!dwellTimeByDate[item.date]) {
                dwellTimeByDate[item.date] = [];
            }
            dwellTimeByDate[item.date].push(item);
        });

        state.dwellTimesComplete = payload;
        state.dwellTimesPerTime = dwellTimeByTime;
        state.dwellTimesPerDate = dwellTimeByDate;
    },
    /**
     * Generates Bar Chart Daily Data and saves it to state.
     * @param {Object} state the store's state object
     * @returns {void}
     */
    setBarChartDailyData (state) {
        const daily = state.averageVisitorsPerDay,
            labels = [],
            day_data = [],
            translatedLabelList = i18next.t("additional:modules.tools.vpidashboard.time.days", {returnObjects: true});

        daily.forEach((element, index) => {
            labels.push(translatedLabelList[index]);
            day_data.push(element.avg);
        });

        // eslint-disable-next-line one-var
        const data = {
            labels: labels,
            datasets: [{
                label: i18next.t("additional:modules.tools.vpidashboard.unique.dailyOverview"),
                data: day_data,
                hoverOffset: 4,
                backgroundColor: "#FD763B"
            }]
        };

        state.barChartDailyData = data;

    },

    /**
     * Generates Bar Chart Daily Data and saves it to state.
     * @param {Object} state the store's state object
     * @returns {void}
     */
    setLineChartDailyData (state) {
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

        state.lineChartDailyData = data;
    },

    /**
     * Generates Bar Chart Monthly Data and saves it to state.
     * @param {Object} state the store's state object
     * @returns {void}
     */
    setBarChartMonthlyData (state) {
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

        state.barChartMonthlyData = data;
    },

    /**
     * Generates Line Chart Monthly Data and saves it to state.
     * @param {Object} state the store's state object
     * @returns {void}
     */
    setLineChartMonthlyData (state) {
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

        state.lineChartMonthlyData = data;
    },
    /**
     * Generates Bar Chart Data and saves it to state.
     * @param {Object} state the store's state object
     * @param {Object} payload data from WhatALocation endpoint
     * @returns {void}
     */
    setBarChartData (state, payload) {
        const
            data = payload.data,
            aggregated = {};

        Object.keys(data).forEach(key => {
            const
                item = data[key],
                label = changeDateFormat(new Date(item.date));

            if (!aggregated[label]) {
                aggregated[label] = 0;
            }
            aggregated[label] += item.sum_num_visitors;
        });

        // Ceil up to 100, e.g. 18318 becomes 18400
        Object.keys(aggregated).forEach(key => {
            aggregated[key] = Math.ceil(aggregated[key] / 100) * 100;
        });

        // Bar chart configuration
        state.barChartData = {
            labels: Object.keys(aggregated),
            datasets: [{
                label: i18next.t("additional:modules.tools.vpidashboard.unique.uniqueVisitors"),
                data: Object.values(aggregated),
                hoverOffset: 4,
                backgroundColor: "#FD763B"
            }]
        };
    },
    /**
     * Generates Line Chart Data and saves it to state.
     * @param {Object} state the store's state object
     * @param {Object} payload data from WhatALocation endpoint
     * @returns {void}
     */
    setLineChartData (state, payload) {
        const
            data = payload.data,
            aggregated = {};

        Object.keys(data).forEach(key => {
            const
                item = data[key],
                label = changeDateFormat(new Date(item.date));

            if (!aggregated[label]) {
                aggregated[label] = 0;
            }
            aggregated[label] += item.sum_num_visitors;
        });

        // Ceil up to 100, e.g. 18318 becomes 18400
        Object.keys(aggregated).forEach(key => {
            aggregated[key] = Math.ceil(aggregated[key] / 100) * 100;
        });

        // Line chart configuration
        state.lineChartData = {
            labels: Object.keys(aggregated),
            datasets: [{
                label: i18next.t("additional:modules.tools.vpidashboard.unique.uniqueVisitors"),
                data: Object.values(aggregated),
                fill: false,
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1
            }]
        };
    },
    /**
     * Sets showLoader value in state.
     * Set it true to show loader and set it false to hide loader.
     * @param {Object} state the store's state object
     * @param {Boolean} isLoaderShown variable to set as showLoader
     * @returns {void}
     */
    setLoader (state, isLoaderShown) {
        state.showLoader = isLoaderShown;
    },
    /**
     * Get all age groups data
     * @param {Object} state of this component
     * @param {Array} payload Array of all age groups from the selected location
     * @returns {void}
     */
    setAllAgeGroupsData (state, payload) {
        state.allAgeGroupsData = payload.data;
    },
    /**
     * Get all age groups monthly data
     * @param {Object} state of this component
     * @returns {void}
     */
    setAllAgeGroupsMonthlyData (state) {
        const dataset = [],
            datasetLine = [],
            tempDataset = [],
            tempDatasetLine = [],
            xLabels = [],
            colors = ["#00aa55", "#007ea8", "#9784ff ", "#CC3E00", "#ffa300", "#f8e08e", "#708090"],
            labels = state.ageGroupPieChartLabels,
            grouped = {},
            allYears = [];

        let entryCount = 0,
            xlabel = "",
            ageGroupsByYear = [];

        state.allAgeGroupsData.forEach(entry => {

            if (entry.age_group === "u") {
                return;
            }

            // get the age groups by year and month
            const ageGroupIndex = tempDataset.findIndex((i) => {
                return i.label === entry.age_group;
            });

            if (ageGroupIndex > -1) {

                tempDataset[ageGroupIndex].data.push(Math.ceil(entry.sum_num_visitors / 100) * 100);
                tempDatasetLine[ageGroupIndex].data.push(Math.ceil(entry.sum_num_visitors / 100) * 100);
            }
            else {
                const dataObj = {
                        data: [Math.ceil(entry.sum_num_visitors / 100) * 100],
                        hoverOffset: 4,
                        label: entry.age_group
                    },
                    dataObjLine = {
                        data: [Math.ceil(entry.sum_num_visitors / 100) * 100],
                        label: entry.age_group,
                        fill: false,
                        tension: 0.1
                    };

                tempDataset.push(dataObj);
                tempDatasetLine.push(dataObjLine);
            }

            xlabel = changeDateFormat(entry.date);

            if (!xLabels.find(l => {
                return l === xlabel;
            })) {
                xLabels.push(xlabel);
            }

            // generate the sum of the age groups by year for pie chart
            // eslint-disable-next-line
            const ageGroup = entry.age_group,
                [year] = entry.date.split("-"),
                key = `${ageGroup}-${year}`;

            grouped[key] = grouped[key] || {ageGroup, year, sum: 0};
            grouped[key].sum += Math.ceil(entry.sum_num_visitors / 100) * 100;

            ageGroupsByYear = Object.values(grouped);

            if (allYears.indexOf(year) < 0) {
                allYears.push(year);
            }
        });

        labels.forEach(l => {
            const ageGroupObj = tempDataset.find(ageGroup => {
                    return ageGroup.label.replace(/[[\]']+/g, "") === l;
                }),
                ageGroupObjLine = tempDatasetLine.find(ageGroup => {
                    return ageGroup.label.replace(/[[\]']+/g, "") === l;
                });

            ageGroupObj.backgroundColor = colors[entryCount];
            ageGroupObj.label = l;

            ageGroupObjLine.borderColor = colors[entryCount];
            ageGroupObjLine.label = l;

            dataset.push(ageGroupObj);
            datasetLine.push(ageGroupObjLine);

            ageGroupsByYear.forEach(year => {
                if (year.ageGroup.replace(/[[\]']+/g, "") === l) {
                    year.backgroundColor = colors[entryCount];
                    year.label = l;
                }
            });

            entryCount += 1;
        });

        state.allAgeGroupsMonthlyData = dataset;
        state.allAgeGroupsMonthlyDataLine = datasetLine;
        state.ageGroupxLabels = xLabels;
        state.ageGroupsYearlyData = ageGroupsByYear;
        state.allAgeGroupsYears = allYears;
    },
    /**
     * Sets the id of the selected location.
     * If location B on the compare locations tab is activated the Id will be set for location B.
     * @param {Object} state the store's state object
     * @param {Object} payload containing the locationID and the source where the location was selected from
     * @returns {void}
     */
    setSelectedLocationId (state, payload) {
        if (!state.selectLocationBInMap || payload.source === "dropdown") {
            state.selectedLocationId = payload.locationID;
        }
        else {
            state.selectedLocationB = payload.locationID;
        }
    },
    /**
     * Sets the indicator that location B on the compare location tab is activated.
     * @param {Object} state the store's state object
     * @param {Boolean} value indicates if location B is activated or not
     * @returns {void}
     */
    setSelectLocationBInMap (state, value) {
        state.selectLocationBInMap = value;
    }
};

export default mutations;
