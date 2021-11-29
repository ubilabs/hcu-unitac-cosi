
import {expect} from "chai";
import {createHistogram} from "../../../components/Histogram.vue";

describe.only("createHistogram", () => {
    it("should create histogram", () => {
        const ret = createHistogram([133.57, 214.57, 446.35, 71.67], 10, 100, 100);

        expect(ret).to.be.eql({});
    });
});
