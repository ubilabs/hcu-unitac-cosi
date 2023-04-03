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
        const daily = state.frequencyData?.unique?.dayly;
        console.log(daily);
        const averageVisitorsOnDay = daily.filter((element) => {return element.weekday === day})
        return averageVisitorsOnDay[0].avg;
    },
    getBestDay ({frequencyData}) {
        return frequencyData.unique?.best_day;
    },

    getBestHour ({frequencyData}) {
        return frequencyData.unique?.best_hour;
    },

    getIndividualVisitorsPerYear({frequencyData}) {
        const split_yearly = frequencyData?.unique?.split_yearly;
        return split_yearly.reduce((n, {avg}) => n + avg, 0);

    },
    getIndividualVisitorsPerMonth({frequencyData}) {
        const monthly = frequencyData?.unique?.monthly;
        const month = monthly.filter((element) => {return element.date__month === 12});
        return month[0].avg;
    },
    getBarChartMonthlyData({frequencyData}) {
        const monthly = frequencyData?.unique?.monthly;
        const labels = [];
        const month_data = [];

        monthly.forEach((element, index) => {
            labels.push(element.date__month);
            month_data.push(element.sum);
        });

        const data = {
            labels: labels.reverse(),
            datasets: [{
                label: 'Unique Visitors (Months)',
                data: month_data.reverse(),
                hoverOffset: 4,
                backgroundColor: '#FD763B'
            }]
        };

        return data;
    },
    getLineChartMonthlyData({frequencyData}) {
        const monthly = frequencyData?.unique?.monthly;

        const labels = [];
        const month_data = [];

        monthly.forEach((element, index) => {
            labels.push(element.date__month);
            month_data.push(element.sum);
        });

        const data = {
            labels: labels.reverse(),
            datasets: [{
                label: 'Unique Visitors (Months)',
                data: month_data.reverse(),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };

        return data;
    },
    getBarChartData({frequencyData}) {
        const best_month = frequencyData?.unique?.best_month;
        const labels = [];
        const month_data = [];
        best_month.forEach((element, index) => {
            labels.push(element.date__month + "_" + element.date__year);
            month_data.push(element.sum);
        });
        const data = {
            labels: labels.reverse(),
            datasets: [{
                label: 'Unique Visitors',
                data: month_data.reverse(),
                hoverOffset: 4,
                backgroundColor: '#FD763B'
            }]
        };

        return data;
    },
    getLineChartData({frequencyData}) {
        const best_month = frequencyData?.unique?.best_month;
        const labels = [];
        const month_data = [];
        best_month.forEach((element, index) => {
            labels.push(element.date__month + "_" + element.date__year);
            month_data.push(element.sum);
        });
        const data = {
            labels: labels.reverse(),
            datasets: [{
                label: 'Unique Visitors',
                data: month_data.reverse(),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };

        return data;
    },
    getChartSwitcher({chartData}) {
        return chartData;
    }
};

export default getters;
