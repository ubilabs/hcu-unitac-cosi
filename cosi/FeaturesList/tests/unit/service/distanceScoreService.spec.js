import service from "../../../service/index";
import {initializeLayerList} from "../../../../utils/initializeLayerList";
import {getAllFeatures} from "../../../../utils/getAllFeatures";
import sinon from "sinon";
import {expect} from "chai";

describe.only("distanceScoreService", () => {
    before(async function () {
        await initializeLayerList();
    });
    it("getDistanceScore with small layer", async () => {
        const features = await getAllFeatures("20569"),
            commitStub = sinon.stub(),
            getters = {mindists: {}},

            score = await service.store.actions.getDistanceScore({getters, commit: commitStub},
                {
                    feature: features[0],
                    layerIds: ["19862"],
                    weights: [1]
                });

        expect(score).to.be.equal(191.82);
        expect(commitStub.firstCall.args[1]).to.eql(
            {
                "DE.HH.UP_AMIRA_1d275df7-64f4-4a43-a647-ae34648191c119862": 191.82
            });
    });
    it("getDistanceScore feature outside hamburg", async () => {
        const p = [9.818415798420284, 53.26231927558228],
            commitStub = sinon.stub(),
            getters = {mindists: {}},

            score = await service.store.actions.getDistanceScore({getters, commit: commitStub},
                {
                    feature: {getId: ()=>"id", getGeometry: ()=> ({flatCoordinates: p})},
                    layerIds: ["19862"],
                    weights: [1]
                });

        expect(score).to.be.equal(null);

    });
    it("getDistanceScore with small layer inside extend", async () => {
        const commitStub = sinon.stub(),
            getters = {mindists: {}},
            extend = [566074.67, 5933911.077, 567996.251, 5935623.892], // St. Georg
            p1 = [567120.1618948006, 5934379.965736715], // inside St. Georg

            score = await service.store.actions.getDistanceScore({getters, commit: commitStub},
                {
                    feature: {getId: ()=>"id", getGeometry: ()=> ({flatCoordinates: p1})},
                    layerIds: ["20569"], // one feature insdie St. Georg
                    weights: [1],
                    extend
                });

        expect(score).to.be.equal(157.41);
        expect(commitStub.firstCall.args[1]).to.eql(
            {
                "id20569566074.67,5933911.077,567996.251,5935623.892": 157.41
            });
    });
    it("getDistanceScore with small layer outside extend", async () => {

        const commitStub = sinon.stub(),
            getters = {mindists: {}},
            extend = [563262.057, 5941046.992, 568546.555, 5944993.724], // Fuhlsbuettel
            p1 = [567120.1618948006, 5934379.965736715], // inside St. Georg

            score = await service.store.actions.getDistanceScore({getters, commit: commitStub},
                {
                    feature: {getId: ()=>"id", getGeometry: ()=> ({flatCoordinates: p1})},
                    layerIds: ["20569"], // one feature insdie St. Georg
                    weights: [1],
                    extend
                });

        expect(score).to.be.equal(null);
        expect(commitStub.firstCall.args[1]).to.eql(
            {
                "id20569563262.057,5941046.992,568546.555,5944993.724": null
            });
    });
    it.skip("getDistanceScore with large layer", async function () {
        this.timeout(120000);

        const features = await getAllFeatures("19951"),
            commitStub = sinon.stub(),
            getters = {mindists: {}},

            score = await service.store.actions.getDistanceScore({getters, commit: commitStub},
                {
                    feature: features[0],
                    layerIds: ["16601"],
                    weights: [1]
                });

        expect(score).to.be.equal(133.57);
    });
});
