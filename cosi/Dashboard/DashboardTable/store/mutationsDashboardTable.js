import {generateSimpleMutations} from "../../../../../src/app-store/utils/generators";
import stateDashboardTable from "./stateDashboardTable";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateDashboardTable),

    /**
     * @description add or remove a rowIndex from the open timeline rows
     * @param {Object} state - the state of the DashboardTable
     * @param {number} payload.rowIndex - index of row to toggle 
     * @param {Boolean} payload.timelineOpen - state of the selected timeline
     * @returns {void}
     */
    toggleTimelineRow (state, {rowIndex, timelineOpen}) {
        if (timelineOpen && !state.openTimelineRows.includes(rowIndex)) {
            state.openTimelineRows = [...state.openTimelineRows, rowIndex];
        }
        else if (!timelineOpen && state.openTimelineRows.includes(rowIndex)) {
            state.openTimelineRows = state.openTimelineRows.filter(index => index !== rowIndex);
        }
    }


    // mutation for extent / bbox
};

export default mutations;
