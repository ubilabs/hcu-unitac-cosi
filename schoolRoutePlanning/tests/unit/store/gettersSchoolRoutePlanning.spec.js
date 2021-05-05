import getters from "../../../store/gettersSchoolRoutePlanning";
import stateSchoolRoutePlanning from "../../../store/stateSchoolRoutePlanning";
import {expect} from "chai";

describe("addons/schoolRoutePlanning/store/gettersSchoolRoutePlanning.js", () => {
    describe("SchoolRoutePlanning getters", () => {
        it("returns the selectPointerMove from state", () => {
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

            expect(getters.sortedSchools(stateSchoolRoutePlanning)).to.be.an("array").that.is.empty;
            getters.sortedSchools(state).forEach((school, index) => {
                expect(school.get("schulname")).equals(finalPosition[index]);
            });
        });
    });
});
