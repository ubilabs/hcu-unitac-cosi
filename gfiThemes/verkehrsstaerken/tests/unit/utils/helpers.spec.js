import {expect} from "chai";
import {combineYearsData, createNewRowName, createLegendData, createYAxisLabel} from "../../../utils/helpers.js";

describe("src/modules/tools/gfi/components/themes/verkehrsstaerken/utils/helpers.js", () => {

    const years = [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018],
        dataPerYear = [{"year": 2008, "attrName": "DTV", "value": "25000"}, {"year": 2008, "attrName": "DTVw", "value": "29000"}, {"year": 2008, "attrName": "Schwerverkehrsanteil am DTVw", "value": "3 %"}, {"year": 2009, "attrName": "DTV", "value": "25000"}, {"year": 2009, "attrName": "DTVw", "value": "27000"}, {"year": 2009, "attrName": "Schwerverkehrsanteil am DTVw", "value": "3 %"}, {"year": 2010, "attrName": "DTV", "value": "23000"}, {"year": 2010, "attrName": "DTVw", "value": "26000"}, {"year": 2010, "attrName": "Schwerverkehrsanteil am DTVw", "value": "3 %"}, {"year": 2011, "attrName": "DTV", "value": "26000"}, {"year": 2011, "attrName": "DTVw", "value": "29000"}, {"year": 2011, "attrName": "Schwerverkehrsanteil am DTVw", "value": "3 %"}, {"year": 2011, "attrName": "Baustelleneinfluss", "value": "*"}, {"year": 2012, "attrName": "DTV", "value": "29000"}, {"year": 2012, "attrName": "DTVw", "value": "32000"}, {"year": 2012, "attrName": "Schwerverkehrsanteil am DTVw", "value": "2 %"}, {"year": 2012, "attrName": "Baustelleneinfluss", "value": "*"}, {"year": 2013, "attrName": "DTV", "value": "29000"}, {"year": 2013, "attrName": "DTVw", "value": "32000"}, {"year": 2013, "attrName": "Schwerverkehrsanteil am DTVw", "value": "2 %"}, {"year": 2013, "attrName": "Baustelleneinfluss", "value": "*"}, {"year": 2014, "attrName": "DTV", "value": "27000"}, {"year": 2014, "attrName": "DTVw", "value": "30000"}, {"year": 2014, "attrName": "Schwerverkehrsanteil am DTVw", "value": "3 %"}, {"year": 2015, "attrName": "DTV", "value": "25000"}, {"year": 2015, "attrName": "DTVw", "value": "28000"}, {"year": 2015, "attrName": "Schwerverkehrsanteil am DTVw", "value": "3 %"}, {"year": 2016, "attrName": "DTV", "value": "26000"}, {"year": 2016, "attrName": "DTVw", "value": "29000"}, {"year": 2016, "attrName": "Schwerverkehrsanteil am DTVw", "value": "3 %"}, {"year": 2017, "attrName": "DTV", "value": "25000"}, {"year": 2017, "attrName": "DTVw", "value": "28000"}, {"year": 2017, "attrName": "Schwerverkehrsanteil am DTVw", "value": "3 %"}, {"year": 2018, "attrName": "DTV", "value": "25000"}, {"year": 2018, "attrName": "DTVw", "value": "27000"}, {"year": 2018, "attrName": "Schwerverkehrsanteil am DTVw", "value": "3 %"}];

    before(function () {
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });

    describe("createNewRowName", function () {
        it("Should remove \"_2004\" from \"test_2004\" with year input as string", function () {
            expect(createNewRowName("test_2004", "2004")).to.equal("test");
        });
        it("Should remove \"_2004\" from \"test_2004\" with year input as number", function () {
            expect(createNewRowName("test_2004", 2004)).to.equal("test");
        });
        it("Should remove \" 2004\" from \"test 2004\" with year input as string", function () {
            expect(createNewRowName("test 2004", "2004")).to.equal("test");
        });
        it("Should remove \" 2004\" from \"test 2004\" with year input as number", function () {
            expect(createNewRowName("test 2004", 2004)).to.equal("test");
        });
        it("Should return input string this the ending is not \"_[4-digit-String-or-number]\" or \" [4-digit-String-or-number]\"", function () {
            expect(createNewRowName("test2004", 2004)).to.equal("test2004");
        });

    });

    describe("combineYearsData", function () {
        it("should return array that is not empty", function () {
            expect(combineYearsData(dataPerYear, years)).to.be.an("array").to.not.be.empty;
        });
        it("should return array that has length of 1", function () {
            expect(combineYearsData(undefined)).to.be.an("array").to.have.lengthOf(0);
        });
        it("should return array that has length of 1", function () {
            expect(combineYearsData()).to.be.an("array").to.have.lengthOf(0);
        });
    });

    describe("createLegendData", function () {
        it("should return array with length 2", function () {
            expect(createLegendData("DTV")).to.be.an("array").that.have.lengthOf(2);
        });
        it("should return array with length 1", function () {
            expect(createLegendData(undefined)).to.be.an("array").that.have.lengthOf(2);
        });
        it("should return array with length 1", function () {
            expect(createLegendData()).to.be.an("array").that.have.lengthOf(2);
        });
    });

    describe("createYAxisLabel", function () {
        it("should return dedicated label", function () {
            expect(createYAxisLabel("DTV")).to.be.equals("modules.tools.gfi.themes.verkehrsstaerken.carsPerDay");
            expect(createYAxisLabel("DTVw")).to.be.equals("modules.tools.gfi.themes.verkehrsstaerken.carsPerDayWeekly");
            expect(createYAxisLabel("Schwerverkehrsanteil am DTVw")).to.be.equals("modules.tools.gfi.themes.verkehrsstaerken.HGVsPerWeek");
        });
    });

});
