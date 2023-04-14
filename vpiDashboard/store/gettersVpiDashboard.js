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

    // NOTE overwrite (or create additional) getters here if you need special behavior in them
    getAverageVisitorsPerDay: (state) => (day) => {
        const daily = state.frequencyData?.unique?.dayly,
            averageVisitorsOnDay = daily.filter((element) => {
                return element.weekday === day;
            });
        console.log('daily: ', daily);
        console.log('avgDay', averageVisitorsOnDay);
        return averageVisitorsOnDay[0].avg;
    },
    getAverageVisitorsPerMonth: (state) => (month) => {
        const monthly = state.frequencyData?.unique?.monthly,
            averageVisitorsOnMonth = monthly.filter((element) => {
                return element.date__month === month;
            });
        return averageVisitorsOnMonth[0].avg;
    },
    getBestDay ({frequencyData}) {
        return frequencyData.unique?.best_day;
    },

    getBestHour ({frequencyData}) {
        return frequencyData.unique?.best_hour;
    },

    getIndividualVisitorsPerYear ({frequencyData}) {
        const split_yearly = frequencyData?.unique?.split_yearly;

        return split_yearly.reduce((n, {avg}) => n + avg, 0);
    },
    getBarChartDailyData ({frequencyData}) {
        const daily = frequencyData?.unique?.dayly,
            labels = [],
            day_data = [];

        daily.forEach((element, index) => {
            labels.push(element.weekday);
            day_data.push(element.sum);
        });

        const data = {
            labels: labels.reverse(),
            datasets: [{
                label: "Average Unique Visitors (Day)",
                data: day_data.reverse(),
                hoverOffset: 4,
                backgroundColor: "#FD763B"
            }]
        };

        return data;
    },
    getLineChartDailyData ({frequencyData}) {
        const daily = frequencyData?.unique?.dayly,

            labels = [],
            day_data = [];

        daily.forEach((element, index) => {
            labels.push(element.weekday);
            day_data.push(element.sum);
        });

        const data = {
            labels: labels.reverse(),
            datasets: [{
                label: "Unique Visitors (Day)",
                data: day_data.reverse(),
                fill: false,
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1
            }]
        };

        return data;
    },
    getBarChartMonthlyData ({frequencyData}) {
        const monthly = frequencyData?.unique?.monthly,
            labels = [],
            month_data = [];

        monthly.forEach((element, index) => {
            labels.push(element.date__month);
            month_data.push(element.sum);
        });

        const data = {
            labels: labels.reverse(),
            datasets: [{
                label: "Unique Visitors (Months)",
                data: month_data.reverse(),
                hoverOffset: 4,
                backgroundColor: "#FD763B"
            }]
        };

        return data;
    },
    getLineChartMonthlyData ({frequencyData}) {
        const monthly = frequencyData?.unique?.monthly,

            labels = [],
            month_data = [];

        monthly.forEach((element, index) => {
            labels.push(element.date__month);
            month_data.push(element.sum);
        });

        const data = {
            labels: labels.reverse(),
            datasets: [{
                label: "Unique Visitors (Months)",
                data: month_data.reverse(),
                fill: false,
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1
            }]
        };

        return data;
    },
    getBarChartData ({frequencyData}) {
        const best_month = frequencyData?.unique?.best_month,
            labels = [],
            month_data = [];

        best_month.forEach((element, index) => {
            labels.push(element.date__month + "_" + element.date__year);
            month_data.push(element.sum);
        });
        const data = {
            labels: labels.reverse(),
            datasets: [{
                label: "Unique Visitors",
                data: month_data.reverse(),
                hoverOffset: 4,
                backgroundColor: "#FD763B"
            }]
        };

        return data;
    },
    getLineChartData ({frequencyData}) {
        const best_month = frequencyData?.unique?.best_month,
            labels = [],
            month_data = [];

        best_month.forEach((element, index) => {
            labels.push(element.date__month + "_" + element.date__year);
            month_data.push(element.sum);
        });
        const data = {
            labels: labels.reverse(),
            datasets: [{
                label: "Unique Visitors",
                data: month_data.reverse(),
                fill: false,
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1
            }]
        };

        return data;
    },
    getChartSwitcher ({chartData}) {
        return chartData;
    }
};

export default getters;
