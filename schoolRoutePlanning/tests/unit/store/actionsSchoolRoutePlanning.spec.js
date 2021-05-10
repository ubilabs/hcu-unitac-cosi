import testAction from "../../../../../test/unittests/VueTestUtils";
import actions from "../../../store/actionsSchoolRoutePlanning";

const {
    setGeometryByFeatureId
} = actions;


describe("addons/schoolRoutePlanning/store/actionsSchoolRoutePlanning.js", () => {
    describe("setGeometryByFeatureId", () => {
        it("processInput start search streets", done => {
            const targetElement = {
                id: "BratwurstId",
                source: {
                    getExtent: () => "BratwurstExtend"
                },
                geometry: {
                    getType: () => "Point"
                }
            };

            testAction(setGeometryByFeatureId, targetElement, {}, {}, [
                {type: "setFilteredHouseNumbers", payload: []}
            ], {}, done);
        });
    });
});
