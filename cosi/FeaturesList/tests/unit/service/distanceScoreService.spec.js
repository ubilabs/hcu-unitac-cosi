import service from "../../../service/index";
import {initializeLayerList} from "../../../../utils/initializeLayerList";
import {getAllFeatures} from "../../../../utils/getAllFeatures";
import sinon from "sinon";
import {expect} from "chai";

describe("distanceScoreService", () => {
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
