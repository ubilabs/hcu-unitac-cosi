import {expect} from "chai";
import Tool from "@modules/core/modelList/tool/model.js";
import ModelList from "@modules/core/modelList/list.js";
import initializeCockpitModel from "@addons/cockpit_bauvorhaben/cockpit/model.js";

describe("ADDON: Cockpit-Bauvorhaben", function () {
    var tool,
        model,
        data = [
            {district: "Altona", year: 2000, building_project_count: 10, month_short: "01"},
            {district: "Altona", year: 2000, building_project_count: 11, month_short: "02"},
            {district: "Altona", year: 2000, building_project_count: 12, month_short: "03"},
            {district: "Bergedorf", year: 2000, building_project_count: 20, month_short: "01"},
            {district: "Hamburg-Mitte", year: 2000, building_project_count: 30, month_short: "01"},
            {district: "Eimsbüttel", year: 2000, building_project_count: 40, month_short: "01"},
            {district: "Harburg", year: 2000, building_project_count: 50, month_short: "01"},
            {district: "Altona", year: 2001, building_project_count: 60, month_short: "01"},
            {district: "Bergedorf", year: 2001, building_project_count: 70, month_short: "01"},
            {district: "Hamburg-Mitte", year: 2001, building_project_count: 80, month_short: "01"},
            {district: "Eimsbüttel", year: 2001, building_project_count: 90, month_short: "01"},
            {district: "Harburg", year: 2001, building_project_count: 100, month_short: "01"},
            {district: "Altona", year: 2002, building_project_count: 110, month_short: "01"},
            {district: "Bergedorf", year: 2002, building_project_count: 120, month_short: "01"},
            {district: "Hamburg-Mitte", year: 2002, building_project_count: 130, month_short: "01"},
            {district: "Eimsbüttel", year: 2002, building_project_count: 140, month_short: "01"},
            {district: "Harburg", year: 2002, building_project_count: 150, month_short: "01"}
        ];

    before(function () {
        tool = new Tool({id: "cockpit", type: "tool"});
        new ModelList([tool]);
        model = initializeCockpitModel();
    });

    describe("filterYears", function () {
        it("should filter data by attribute 'year' and sort it DESCENDING", function () {
            model.filterYears(data);
            expect(model.get("years")).to.deep.equal([2002, 2001, 2000]);
        });
    });

    describe("filterDistricts", function () {
        it("should filter data by attribute 'year' and sort them by \"Hamburger-Uhr\"", function () {
            model.filterDistricts(data);
            expect(model.get("districts")).to.deep.equal(["Hamburg-Mitte", "Altona", "Eimsbüttel", "Bergedorf", "Harburg"]);
        });
    });
    describe("filterByAttribute", function () {
        it("should filter data based on given string values and attribute name 'district'", function () {
            expect(model.filterByAttribute(data, ["Altona"], "district")).to.deep.equal([
                {district: "Altona", year: 2000, building_project_count: 10, month_short: "01"},
                {district: "Altona", year: 2000, building_project_count: 11, month_short: "02"},
                {district: "Altona", year: 2000, building_project_count: 12, month_short: "03"},
                {district: "Altona", year: 2001, building_project_count: 60, month_short: "01"},
                {district: "Altona", year: 2002, building_project_count: 110, month_short: "01"}
            ]);
        });
        it("should filter data based on given number values and attribute name 'year'", function () {
            expect(model.filterByAttribute(data, [2001, 2002], "year")).to.deep.equal([
                {district: "Altona", year: 2001, building_project_count: 60, month_short: "01"},
                {district: "Bergedorf", year: 2001, building_project_count: 70, month_short: "01"},
                {district: "Hamburg-Mitte", year: 2001, building_project_count: 80, month_short: "01"},
                {district: "Eimsbüttel", year: 2001, building_project_count: 90, month_short: "01"},
                {district: "Harburg", year: 2001, building_project_count: 100, month_short: "01"},
                {district: "Altona", year: 2002, building_project_count: 110, month_short: "01"},
                {district: "Bergedorf", year: 2002, building_project_count: 120, month_short: "01"},
                {district: "Hamburg-Mitte", year: 2002, building_project_count: 130, month_short: "01"},
                {district: "Eimsbüttel", year: 2002, building_project_count: 140, month_short: "01"},
                {district: "Harburg", year: 2002, building_project_count: 150, month_short: "01"}
            ]);
        });
    });
    describe("intersectArrays", function () {
        it("should intersect arrays and only returns the objects that are in both arrays", function () {
            const array1 = model.filterByAttribute(data, ["Altona"], "district"),
                array2 = model.filterByAttribute(data, [2001, 2002], "year");

            expect(model.intersectArrays(array1, array2)).to.deep.equal([
                {district: "Altona", year: 2001, building_project_count: 60, month_short: "01"},
                {district: "Altona", year: 2002, building_project_count: 110, month_short: "01"}
            ]);
        });
        it("should return empty array in first array is empty", function () {
            const array2 = model.filterByAttribute(data, [2001, 2002], "year");

            expect(model.intersectArrays([], array2)).to.deep.equal([]);
        });
        it("should return empty array in second array is empty", function () {
            const array1 = model.filterByAttribute(data, ["Altona"], "district");

            expect(model.intersectArrays(array1, [])).to.deep.equal([]);
        });
    });
    describe("aggregateByValues", function () {
        it("should find all objects matching the condition and merge attribute given by attribute name", function () {
            expect(model.aggregateByValues(data, {attributeName: "year", values: [2001, 2002]}, "building_project_count")).to.deep.equal([
                {district: "Altona", year: undefined, building_project_count: 1050, month_short: "01"}
            ]);
        });
    });
    describe("mergeMonthsToYears", function () {
        it("merges monthly values to yearly values and creates new attribute date", function () {
            expect(model.mergeMonthsToYears(data, false, [2000], {attrName: "district", values: ["Altona"]}, "building_project_count")).to.deep.equal([
                {date: 2000, district: "Altona", building_project_count: 33}
            ]);
        });
        it("keeps monthly values and and creates new attribute date", function () {
            expect(model.mergeMonthsToYears(data, true, undefined, {attrName: "district", values: ["Altona"]}, undefined)).to.deep.equal([
                {district: "Altona", year: 2000, building_project_count: 10, month_short: "01", date: "200001"},
                {district: "Altona", year: 2000, building_project_count: 11, month_short: "02", date: "200002"},
                {district: "Altona", year: 2000, building_project_count: 12, month_short: "03", date: "200003"},
                {district: "Bergedorf", year: 2000, building_project_count: 20, month_short: "01", date: "200001"},
                {district: "Hamburg-Mitte", year: 2000, building_project_count: 30, month_short: "01", date: "200001"},
                {district: "Eimsbüttel", year: 2000, building_project_count: 40, month_short: "01", date: "200001"},
                {district: "Harburg", year: 2000, building_project_count: 50, month_short: "01", date: "200001"},
                {district: "Altona", year: 2001, building_project_count: 60, month_short: "01", date: "200101"},
                {district: "Bergedorf", year: 2001, building_project_count: 70, month_short: "01", date: "200101"},
                {district: "Hamburg-Mitte", year: 2001, building_project_count: 80, month_short: "01", date: "200101"},
                {district: "Eimsbüttel", year: 2001, building_project_count: 90, month_short: "01", date: "200101"},
                {district: "Harburg", year: 2001, building_project_count: 100, month_short: "01", date: "200101"},
                {district: "Altona", year: 2002, building_project_count: 110, month_short: "01", date: "200201"},
                {district: "Bergedorf", year: 2002, building_project_count: 120, month_short: "01", date: "200201"},
                {district: "Hamburg-Mitte", year: 2002, building_project_count: 130, month_short: "01", date: "200201"},
                {district: "Eimsbüttel", year: 2002, building_project_count: 140, month_short: "01", date: "200201"},
                {district: "Harburg", year: 2002, building_project_count: 150, month_short: "01", date: "200201"}
            ]);
        });
    });

    describe("mergeByAttribute", function () {
        it("Merges 'building_project_count' to districts and adds attributes 'class' and 'style' for graph", function () {
            expect(model.mergeByAttribute(data, "district", "building_project_count", "district")).to.deep.equal([
                {district: "Altona", Altona: 110, class: "dot", style: "circle"},
                {district: "Bergedorf", Bergedorf: 120, class: "dot", style: "circle"},
                {district: "Eimsbüttel", Eimsbüttel: 140, class: "dot", style: "circle"},
                {district: "Hamburg-Mitte", "Hamburg-Mitte": 130, class: "dot", style: "circle"},
                {district: "Harburg", Harburg: 150, class: "dot", style: "circle"}
            ]);
        });
    });
    describe("addNullValues", function () {
        it("should add 0 to each object that does not have a given attribute", function () {
            expect(model.addNullValues([{Altona: 1}, {Bergedorf: 2}, {Altona: 3, Bergedorf: 4}, {}, {}], ["Altona", "Bergedorf", "Hamburg-Mitte"])).to.deep.equal([
                {Altona: 1, Bergedorf: 0, "Hamburg-Mitte": 0},
                {Altona: 0, Bergedorf: 2, "Hamburg-Mitte": 0},
                {Altona: 3, Bergedorf: 4, "Hamburg-Mitte": 0},
                {Altona: 0, Bergedorf: 0, "Hamburg-Mitte": 0},
                {Altona: 0, Bergedorf: 0, "Hamburg-Mitte": 0}
            ]);
        });
    });
    describe("rearrangeArray", function () {
        it("should rearrange array and put newOrder to front", function () {
            const oldArray = ["a", "b", "c", "d", "e"],
                newOrder = ["c", "b", "a"];

            expect(model.rearrangeArray(oldArray, true, newOrder)).to.deep.equal([
                "c",
                "b",
                "a",
                "d",
                "e"
            ]);
        });
        it("should rearrange array and put newOrder to back", function () {
            const oldArray = ["a", "b", "c", "d", "e"],
                newOrder = ["c", "b", "a"];

            expect(model.rearrangeArray(oldArray, false, newOrder)).to.deep.equal([
                "d",
                "e",
                "c",
                "b",
                "a"
            ]);
        });
        it("should return empty array if oldArray is empty", function () {
            const newOrder = ["c", "b", "a"];

            expect(model.rearrangeArray([], false, newOrder)).to.deep.equal([]);
        });
        it("should return oldArray newOrder is empty", function () {
            const oldArray = ["a", "b", "c", "d", "e"];

            expect(model.rearrangeArray(oldArray, false, [])).to.deep.equal([
                "a",
                "b",
                "c",
                "d",
                "e"
            ]);
        });
    });
});
