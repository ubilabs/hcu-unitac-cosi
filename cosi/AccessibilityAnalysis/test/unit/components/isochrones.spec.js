import {
    config,
    shallowMount
} from "@vue/test-utils";
import {
    fetchIsochroneFeatures
} from "../../../components/util.js";
import {
    expect
} from "chai";
import sinon from "sinon";
import data from "./isochrones.json";
import {
    expectedFeatures
} from "./features.expect.js";
import { registerProjections } from './util.js'

const coordinates = [
    [10.155828082155567, 53.60323024735499],
    [10.121047700109056, 53.605443831123594],
    [10.078696404760024, 53.6111957469764]
]


before(() => {
    registerProjections();
});

describe("addons/AccessibilityAnalysis/createIsochrones2", () => {

    before(() => {});

    // it("invalid arguments", () => {
    //     createIsochrones2(null, [], "", "", 0)
    //     // expect(wrapper.exists()).to.be.true;

    // });
    it("one coordinate", async () => {
        const stub = sinon.stub(Radio, "request").resolves(JSON.stringify(data));


        const ret = await fetchIsochroneFeatures([coordinates[0]], "ttype", "sunit", 1)
        expect(JSON.stringify(ret)).to.equal(expectedFeatures)
        sinon.assert.calledWith(stub, "OpenRoute", "requestIsochrones", "ttype", [coordinates[0]], "sunit",
            [1, 0.67, 0.33]);
    });
});
