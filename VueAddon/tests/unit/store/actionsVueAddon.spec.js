import testAction from "../../../../../test/unittests/VueTestUtils";
import actions from "../../../store/actionsVueAddon";

const {setActive, activateByUrlParam} = actions;

describe("actionsVueAddon", function () {
    describe("activateByUrlParam", function () {
        it("activateByUrlParam  isinitopen=vueaddon", done => {
            const rootState = {
                queryParams: {
                    "isinitopen": "vueaddon"
                }
            };

            testAction(activateByUrlParam, null, {active: false}, rootState, [
                {type: "setActive", payload: true}
            ], {}, done);
        });
        it("activateByUrlParam no isinitopen", done => {
            const rootState = {
                queryParams: {
                }
            };

            testAction(activateByUrlParam, null, {active: false}, rootState, [], {}, done);
        });
    });
    describe("setActive", function () {
        it("setActive(true) should set rounded currentScale", done => {
            const payload = true,
                mutationActivePayload = true;

            testAction(setActive, payload, {}, {}, [
                {type: "setActive", payload: mutationActivePayload}
            ], {}, done);

        });
        it("setActive(false) should do nothing", done => {
            const payload = false,
                mutationActivePayload = false;

            testAction(setActive, payload, {}, {}, [
                {type: "setActive", payload: mutationActivePayload}
            ], {}, done);

        });
    });
});
