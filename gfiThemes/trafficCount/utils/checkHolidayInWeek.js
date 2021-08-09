import moment from "moment";
import {getPublicHoliday} from "../../../../src/utils/calendar.js";

/**
 * Checking if there are holidays in the current week of given date
 * @param {String} date - the date in format "YYYY-MM-DD"
 * @param {String[]} holidays - the holidays in array format
 * @param {String} format - the format of date in "YYYY-MM-DD"
 * @returns {Boolean} -
 */
export function checkHolidayInWeek (date, holidays, format) {
    for (let i = 0; i <= 6; i++) {
        const day = moment(date).add(i, "days").format(format);

        if (getPublicHoliday(day, holidays, format)) {
            return true;
        }
    }

    return false;
}

export default checkHolidayInWeek;
