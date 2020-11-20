import {expect} from "chai";
import Verkehrsfunctions from "@addons/verkehrsfunctions/verkehrsfunctions.js";
import * as moment from "moment";

describe("ADDON: Verkehrsfunctions", function () {
    let model;

    before(function () {
        model = new Verkehrsfunctions();
    });

    describe("addThousandPoints", function () {
        it("should parse string with a 'No data'", function () {
            expect(model.addThousandPoints({})).to.equal("No data");
        });

        it("should parse string with a point as thousand division", function () {
            expect(model.addThousandPoints("10020")).to.equal("10.020");
        });

        it("should parse number with a point as thousand division", function () {
            expect(model.addThousandPoints(1001)).to.equal("1.001");
        });
    });

    describe("getPhenomenonTimeRange", function () {
        it("should parse the right time format", function () {
            const startTime = "2020-03-26T18:45:01.000Z",
                endTime = "2020-03-26T19:00:00.000Z",
                expectedStart = moment(startTime).format("DD.MM.YYYY, HH:mm"),
                expectedEnd = moment(endTime).format("HH:mm");

            expect(model.getPhenomenonTimeRange(startTime, endTime)).to.equal(expectedStart + " Uhr - " + expectedEnd + " Uhr");
        });
    });

    describe("getAbsTrafficCount", function () {
        it("should return text with 'No data'", function () {
            const dataStreamValue = null;

            expect(model.getAbsTrafficCount(dataStreamValue)).to.equal("No data");
        });

        it("should parse the right the absolute count", function () {
            const dataStreamValue = "219";

            expect(model.getAbsTrafficCount(dataStreamValue)).to.equal("219");
        });
    });

    describe("getPropTrafficCount", function () {
        it("should return text with 'No data'", function () {
            const dataStreamValue = null;

            expect(model.getPropTrafficCount(dataStreamValue)).to.equal("No data");
        });

        it("should parse the right the proportional count", function () {
            const dataStreamValue = "0.29";

            expect(model.getPropTrafficCount(dataStreamValue)).to.equal(29);
        });
    });
});
