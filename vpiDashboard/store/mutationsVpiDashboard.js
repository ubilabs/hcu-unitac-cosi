import {generateSimpleMutations} from "../../../src/app-store/utils/generators";
import stateVpiDashboard from "./stateVpiDashboard";

const mutations = {
    ...generateSimpleMutations(stateVpiDashboard),

    setAverageVisitorsPerMonth (state, payload) {
        const monthly = payload.unique?.monthly,
            months = [];

        monthly.forEach(month => {
            const newMonth = {};

            newMonth.index = month.date__month - 1;
            newMonth.avg = Math.round(month.avg);
            months.push(newMonth);
        });
        months.sort((a, b) => a.index - b.index);
        state.averageVisitorsPerMonth = months;
    },

    setAverageVisitorsPerDay (state, payload) {
        const dayly = payload.unique?.dayly,
            days = [];

        dayly.forEach(day => {
            const newDay = {};

            newDay.index = day.weekday;
            newDay.avg = Math.round(day.avg);
            days.push(newDay);
        });
        state.averageVisitorsPerDay = days;
    },

    setIndividualVisitorsPerYear (state, payload) {
        const split_yearly = payload?.unique?.split_yearly,
            individualVisitorsPerYear = split_yearly.reduce((n, {avg}) => n + avg, 0);

        state.individualVisitorsPerYear = Math.round(individualVisitorsPerYear);
    }
};

export default mutations;
