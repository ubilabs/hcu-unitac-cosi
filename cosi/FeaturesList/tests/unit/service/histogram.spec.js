
import {expect} from "chai";
import {createHistogram} from "../../../utils/charts";

describe("createHistogram", () => {
    it("should create histogram", () => {
        const ret = createHistogram([133.57, 214.57, 446.35, 71.67], 10, 100, 100);

        expect(ret.bins).to.be.eql([[71.67], [133.57], [], [214.57], [], [], [], [446.35]]);
    });
});
