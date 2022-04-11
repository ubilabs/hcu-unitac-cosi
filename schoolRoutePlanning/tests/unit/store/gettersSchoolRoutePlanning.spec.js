import getters from "../../../store/gettersSchoolRoutePlanning";
import {expect} from "chai";

describe("addons/schoolRoutePlanning/store/gettersSchoolRoutePlanning.js", () => {
    describe("SchoolRoutePlanning getters", () => {
        it("returns the sorted schools from state", () => {
            const state = {
                    schools: [
                        {
                            name: "aSchool",
                            get: () => "aSchool"
                        },
                        {
                            name: "cSchool",
                            get: () => "cSchool"
                        },
                        {
                            name: "bSchool",
                            get: () => "bSchool"
                        }
                    ]
                },
                finalPosition = ["aSchool", "bSchool", "cSchool"];

            getters.sortedSchools(state).forEach((school, index) => {
                expect(school.get("schulname")).equals(finalPosition[index]);
            });
        });

        it("selectOptions returns empty select options when they are not to be displayed", () => {
            const state = {
                    streetNames: [],
                    filteredHouseNumbers: []
                },
                otherGetters = {
                    displaySelectOptions: false
                };

            expect(getters.selectOptions(state, otherGetters)).to.eql([]);
        });

        it("selectOptions returns first five street names when available", () => {
            const state = {
                    streetNames: [1, 2, 3, 4, 5, 6],
                    filteredHouseNumbers: ["A", "B", "C", "D", "E", "F"]
                        .map(v => ({name: v}))
                },
                otherGetters = {
                    displaySelectOptions: true
                };

            expect(getters.selectOptions(state, otherGetters)).to.eql([1, 2, 3, 4, 5]);
        });

        it("selectOptions returns first five house numbers when exactly one street name is available", () => {
            const state = {
                    streetNames: [1],
                    filteredHouseNumbers: ["A", "B", "C", "D", "E", "F"]
                        .map(v => ({name: v}))
                },
                otherGetters = {
                    displaySelectOptions: true
                };

            expect(getters.selectOptions(state, otherGetters)).to.eql(["A", "B", "C", "D", "E"]);
        });
    });
});
