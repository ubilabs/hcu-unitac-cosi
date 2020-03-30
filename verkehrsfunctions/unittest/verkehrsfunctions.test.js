import {expect} from "chai";
import Verkehrsfunctions from "@addons/verkehrsfunctions/verkehrsfunctions.js";

describe("ADDON: Verkehrsfunctions", function () {
    let model;

    before(function () {
        model = new Verkehrsfunctions();
    });

    describe("addThousandPoints", function () {
        it("should parse string with a 'No data'", function () {
            expect(model.addThousandPoints("test")).to.equal("No data");
        });

        it("should parse number with a point as thousand division", function () {
            expect(model.addThousandPoints(1001)).to.equal("1.001");
        });
    });

    describe("getPhenomenonTimeRange", function () {
        it("should parse the right time format", function () {
            const startTime = "2020-03-26T18:45:01.000Z",
                endTime = "2020-03-26T19:00:00.000Z";

            expect(model.getPhenomenonTimeRange(startTime, endTime)).to.equal("26.03.2020, 19:45 Uhr - 20:00 Uhr");
        });
    });

    describe("getAbsTrafficCount", function () {
        it("should return a empty value", function () {
            const dataStreamNames = "test | test",
                dataStreamValues = "219 | 0.29";

            expect(model.getAbsTrafficCount(dataStreamNames, dataStreamValues)).to.equal("");
        });

        it("should parse the right the absolute count", function () {
            const dataStreamNames = "Anzahl | Prozent",
                dataStreamValues = "219 | 0.29";

            expect(model.getAbsTrafficCount(dataStreamNames, dataStreamValues)).to.equal("219");
        });
    });

    describe("getPropTrafficCount", function () {
        it("should return a empty value", function () {
            const dataStreamNames = "test | test",
                dataStreamValues = "219 | 0.29";

            expect(model.getPropTrafficCount(dataStreamNames, dataStreamValues)).to.equal("");
        });

        it("should parse the right the proportional count", function () {
            const dataStreamNames = "Anzahl | Prozent",
                dataStreamValues = "219 | 0.29";

            expect(model.getPropTrafficCount(dataStreamNames, dataStreamValues)).to.equal("0.29");
        });
    });
});
