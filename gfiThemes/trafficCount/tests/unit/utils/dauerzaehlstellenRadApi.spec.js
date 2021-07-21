import {expect} from "chai";
import {DauerzaehlstellenRadApi} from "../../../utils/dauerzaehlstellenRadApi";
import moment from "moment";

// change language from moment.js to german
moment.locale("de");

describe("addons/trafficCount/utils/dauerzaehlstellenRadApi.js", () => {
    let dummyApi = null;

    beforeEach(() => {
        // this sets the cache with a boolean true as api without starting the real api
        // use param trafficCountApiOpt to emulate the api for testing methods calling the api
        dummyApi = new DauerzaehlstellenRadApi({
            getProperties: () => ({
                jahrgangslinie: "",
                wochenlinie: "",
                tageslinie: ""
            }),
            getId: () => "testId"
        });
    });

    describe("featureExists", () => {
        it("should recognize an object with a certain structure as a feature", () => {
            const api = new DauerzaehlstellenRadApi({
                getProperties: () => false,
                getId: () => false
            });

            expect(api.featureExists()).to.be.true;
        });
    });
    describe("DauerzaehlstellenRadApi.constructor (simple test)", () => {
        it("should create internal structures for feature and phenomenonMoments", () => {
            expect(dummyApi.gurlittMomentsYear).to.be.an("array").and.to.be.empty;
            expect(dummyApi.gurlittMomentsWeek).to.be.an("array").and.to.be.empty;
            expect(dummyApi.gurlittMomentsDay).to.be.an("array").and.to.be.empty;
        });
    });
    describe("correctGurlittYearPattern", () => {
        it("should only work with strings", () => {
            expect(dummyApi.correctGurlittYearPattern(undefined)).to.be.a("string").and.to.be.empty;
            expect(dummyApi.correctGurlittYearPattern(null)).to.be.a("string").and.to.be.empty;
            expect(dummyApi.correctGurlittYearPattern(123)).to.be.a("string").and.to.be.empty;
            expect(dummyApi.correctGurlittYearPattern(true)).to.be.a("string").and.to.be.empty;
            expect(dummyApi.correctGurlittYearPattern(false)).to.be.a("string").and.to.be.empty;
            expect(dummyApi.correctGurlittYearPattern([])).to.be.a("string").and.to.be.empty;
            expect(dummyApi.correctGurlittYearPattern({})).to.be.a("string").and.to.be.empty;
        });
        it("should only work on strings with '-' in them, should return input otherwise", () => {
            expect(dummyApi.correctGurlittYearPattern("")).to.be.a("string").and.to.be.empty;
            expect(dummyApi.correctGurlittYearPattern("gurlittTime")).to.equal("gurlittTime");
        });
        it("should work with a string that includes '-' no matter what the content is", () => {
            expect(dummyApi.correctGurlittYearPattern("-")).to.equal("NaN,NaN,undefined");
        });
        it("should convert a correct gurlittTime from the wrong pattern into the correct pattern", () => {
            expect(dummyApi.correctGurlittYearPattern("2021,-53,1234")).to.equal("2020,53,1234");
            expect(dummyApi.correctGurlittYearPattern("2020,-52,5678")).to.equal("2019,52,5678");
        });
    });
    describe("getMomentEndByMomentStart", () => {
        it("should return the end of an hour as a moment representation if a gurlittTime day pattern is recognized", () => {
            const gurlittTime = "18.07.2021,0:00:00,104",
                momentStart = moment("18.07.2021 00:00:00", "DD.MM.YYYY HH:mm:ss"),
                momentEnd = dummyApi.getMomentEndByMomentStart(gurlittTime, momentStart);

            expect(momentEnd).to.be.an("object");
            expect(momentEnd.format).to.be.a("function");
            expect(momentEnd.format("DD.MM.YYYY HH:mm:ss")).to.equal("18.07.2021 00:59:59");
        });
        it("should return the end of a day as a moment representation if a gurlittTime week pattern is recognized", () => {
            const gurlittTime = "28,12.07.2021,8564",
                momentStart = moment("12.07.2021 00:00:00", "DD.MM.YYYY HH:mm:ss"),
                momentEnd = dummyApi.getMomentEndByMomentStart(gurlittTime, momentStart);

            expect(momentEnd).to.be.an("object");
            expect(momentEnd.format).to.be.a("function");
            expect(momentEnd.format("DD.MM.YYYY HH:mm:ss")).to.equal("12.07.2021 23:59:59");
        });
        it("should return the end of a week as a moment representation if a gurlittTime year pattern is recognized", () => {
            const gurlittTime = "2021,-53,5873",
                momentStart = moment("28.12.2020 00:00:00", "DD.MM.YYYY HH:mm:ss"),
                momentEnd = dummyApi.getMomentEndByMomentStart(gurlittTime, momentStart);

            expect(momentEnd).to.be.an("object");
            expect(momentEnd.format).to.be.a("function");
            expect(momentEnd.format("DD.MM.YYYY HH:mm:ss")).to.equal("03.01.2021 23:59:59");
        });
    });
    describe("getMomentStartByGurlittTime", () => {
        it("should return a moment representation of a day pattern", () => {
            const gurlittTime = "18.07.2021,0:00:00,104",
                momentStart = dummyApi.getMomentStartByGurlittTime(gurlittTime);

            expect(momentStart).to.be.an("object");
            expect(momentStart.format).to.be.a("function");
            expect(momentStart.format("DD.MM.YYYY HH:mm:ss")).to.equal("18.07.2021 00:00:00");
        });
        it("should return a moment representation of a week pattern", () => {
            const gurlittTime = "28,12.07.2021,8564",
                momentStart = dummyApi.getMomentStartByGurlittTime(gurlittTime);

            expect(momentStart).to.be.an("object");
            expect(momentStart.format).to.be.a("function");
            expect(momentStart.format("DD.MM.YYYY HH:mm:ss")).to.equal("12.07.2021 00:00:00");
        });
        it("should return a moment representation of a year pattern", () => {
            const gurlittTime = "2021,-53,5873",
                momentStart = dummyApi.getMomentStartByGurlittTime(gurlittTime);

            expect(momentStart).to.be.an("object");
            expect(momentStart.format).to.be.a("function");
            expect(momentStart.format("DD.MM.YYYY HH:mm:ss")).to.equal("28.12.2020 00:00:00");
        });
    });
    describe("getResultByGurlittTime", () => {
        it("should return the result found in a gurlitt time day pattern", () => {
            const gurlittTime = "18.07.2021,0:00:00,104",
                result = dummyApi.getResultByGurlittTime(gurlittTime);

            expect(result).to.equal(104);
        });
        it("should return the result found in a gurlitt time week pattern", () => {
            const gurlittTime = "28,12.07.2021,8564",
                result = dummyApi.getResultByGurlittTime(gurlittTime);

            expect(result).to.equal(8564);
        });
        it("should return the result found in a gurlitt time year pattern", () => {
            const gurlittTime = "2021,-53,5873",
                result = dummyApi.getResultByGurlittTime(gurlittTime);

            expect(result).to.equal(5873);
        });
    });
    describe("convertGurlittTimeToGurlittMoment", () => {
        it("should return null if anything but a string is given", () => {
            expect(dummyApi.convertGurlittTimeToGurlittMoment(undefined)).to.be.null;
            expect(dummyApi.convertGurlittTimeToGurlittMoment(null)).to.be.null;
            expect(dummyApi.convertGurlittTimeToGurlittMoment(1234)).to.be.null;
            expect(dummyApi.convertGurlittTimeToGurlittMoment(true)).to.be.null;
            expect(dummyApi.convertGurlittTimeToGurlittMoment(false)).to.be.null;
            expect(dummyApi.convertGurlittTimeToGurlittMoment([])).to.be.null;
            expect(dummyApi.convertGurlittTimeToGurlittMoment({})).to.be.null;
        });
        it("should convert a Gurlitt time into an object of GurlittMoment", () => {
            const gurlittTime = "18.07.2021,0:00:00,104",
                gurlittMoment = dummyApi.convertGurlittTimeToGurlittMoment(gurlittTime);

            expect(gurlittMoment).to.be.an("object");

            expect(gurlittMoment.momentStart).to.be.an("object");
            expect(gurlittMoment.momentStart.format).to.be.a("function");
            expect(gurlittMoment.momentStart.format("DD.MM.YYYY HH:mm:ss")).to.equal("18.07.2021 00:00:00");

            expect(gurlittMoment.momentEnd).to.be.an("object");
            expect(gurlittMoment.momentEnd.format).to.be.a("function");
            expect(gurlittMoment.momentEnd.format("DD.MM.YYYY HH:mm:ss")).to.equal("18.07.2021 00:59:59");

            expect(gurlittMoment.result).to.equal(104);
        });
    });
    describe("convertGurlittTimeLineToPhenomeonMoment", () => {
        it("should return an empty array if anything but a string is given", () => {
            expect(dummyApi.convertGurlittTimeLineToPhenomeonMoment(undefined)).to.be.an("array").and.to.be.empty;
            expect(dummyApi.convertGurlittTimeLineToPhenomeonMoment(null)).to.be.an("array").and.to.be.empty;
            expect(dummyApi.convertGurlittTimeLineToPhenomeonMoment(1234)).to.be.an("array").and.to.be.empty;
            expect(dummyApi.convertGurlittTimeLineToPhenomeonMoment(true)).to.be.an("array").and.to.be.empty;
            expect(dummyApi.convertGurlittTimeLineToPhenomeonMoment(false)).to.be.an("array").and.to.be.empty;
            expect(dummyApi.convertGurlittTimeLineToPhenomeonMoment([])).to.be.an("array").and.to.be.empty;
            expect(dummyApi.convertGurlittTimeLineToPhenomeonMoment({})).to.be.an("array").and.to.be.empty;
        });
        it("should return an array of GurlitMoment for a piped string of Gurlitt times", () => {
            const gurlittTimeLine = "18.07.2021,0:00:00,104|28,12.07.2021,8564|2021,-53,5873",
                gurlittMoments = dummyApi.convertGurlittTimeLineToPhenomeonMoment(gurlittTimeLine);

            expect(gurlittMoments).to.be.an("array").and.to.have.lengthOf(3);

            expect(gurlittMoments[0]).to.be.an("object");
            expect(gurlittMoments[0].momentEnd).to.be.an("object");
            expect(gurlittMoments[0].momentEnd.format).to.be.a("function");
            expect(gurlittMoments[0].momentEnd.format("DD.MM.YYYY HH:mm:ss")).to.equal("18.07.2021 00:59:59");
            expect(gurlittMoments[0].momentStart).to.be.an("object");
            expect(gurlittMoments[0].momentStart.format).to.be.a("function");
            expect(gurlittMoments[0].momentStart.format("DD.MM.YYYY HH:mm:ss")).to.equal("18.07.2021 00:00:00");
            expect(gurlittMoments[0].result).to.equal(104);

            expect(gurlittMoments[1].momentEnd).to.be.an("object");
            expect(gurlittMoments[1].momentEnd.format).to.be.a("function");
            expect(gurlittMoments[1].momentEnd.format("DD.MM.YYYY HH:mm:ss")).to.equal("12.07.2021 23:59:59");
            expect(gurlittMoments[1].momentStart).to.be.an("object");
            expect(gurlittMoments[1].momentStart.format).to.be.a("function");
            expect(gurlittMoments[1].momentStart.format("DD.MM.YYYY HH:mm:ss")).to.equal("12.07.2021 00:00:00");
            expect(gurlittMoments[1].result).to.equal(8564);

            expect(gurlittMoments[2].momentEnd).to.be.an("object");
            expect(gurlittMoments[2].momentEnd.format).to.be.a("function");
            expect(gurlittMoments[2].momentEnd.format("DD.MM.YYYY HH:mm:ss")).to.equal("03.01.2021 23:59:59");
            expect(gurlittMoments[2].momentStart).to.be.an("object");
            expect(gurlittMoments[2].momentStart.format).to.be.a("function");
            expect(gurlittMoments[2].momentStart.format("DD.MM.YYYY HH:mm:ss")).to.equal("28.12.2020 00:00:00");
            expect(gurlittMoments[2].result).to.equal(5873);
        });
    });
});
