import {expect} from "chai";
import checkHolidayInWeek from "../../../utils/checkHolidayInWeek.js";

describe("addons/trafficCount/utils/checkHolidayInWeek.js", () => {
    describe("checkHolidayInWeek", () => {
        const holidays = [
            "newYearsDay",
            "goodFriday",
            "easterMonday",
            "laborDay",
            "ascensionDay",
            "pentecostMonday",
            "germanUnityDay",
            "reformationDay",
            "christmasDay",
            "secondDayOfChristmas"
        ];

        it("should return false if there no holidays in that week", function () {
            const date = "2020-05-11";

            expect(checkHolidayInWeek(date, holidays, "YYYY-MM-DD")).to.be.false;
        });

        it("should return true if there are holidays in that week", function () {
            const date = "2021-12-31";

            expect(checkHolidayInWeek(date, holidays, "YYYY-MM-DD")).to.be.true;
        });
    });
});
