
import {expect} from "chai";
import {createHistogram} from "../../../utils/charts";

describe("createHistogram", () => {
    it("should create histogram", () => {
        const ret = createHistogram([{weightedDistanceScores: {score: 133.57}}, {weightedDistanceScores: {score: 214.57}}, {weightedDistanceScores: {score: 446.35}}, {weightedDistanceScores: {score: 71.67}}]);

        expect(ret).to.be.eql({ quantiles: [ 0, 100, 200, 300, 400 ], data: [ 1, 1, 1, 0, 1 ] });
    });
});
