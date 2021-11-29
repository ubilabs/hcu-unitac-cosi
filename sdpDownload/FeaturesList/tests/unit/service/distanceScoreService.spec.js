import service from "../../../service/index";
import {initializeLayerList} from "../../../../utils/initializeLayerList";
import {getAllFeatures} from "../../../../utils/getAllFeatures";
import sinon from "sinon";
import {expect} from "chai";
import {registerProjections} from "../../../../utils/registerProjections";

describe("distanceScoreService", () => {
    before(async function () {
        await initializeLayerList();
        registerProjections();
    });

    /**
     * @return {*}  default getters
     */
    function defaultGetters () {
        return {
            mindists: {},
            initialBuffer: 5000,
            bufferIncrement: 10000
        };
    }

    it("getDistanceScore with small layer", async () => {
        const features = await getAllFeatures("20569"),
            commitStub = sinon.stub(),
            getters = defaultGetters(),

            score = await service.store.actions.getDistanceScore({getters, commit: commitStub},
                {
                    feature: features[0],
                    layerIds: ["19862"],
                    weights: [1]
                });

        expect(score.score).to.be.equal(191.82);
        expect(score["19862"].value).to.be.equal(191.82);
        expect(score["19862"].feature.getId()).to.be.equal("DE.HH.UP_LEBENSLAGENBERATUNG_6");
        expect(commitStub.firstCall.args[1]["DE.HH.UP_AMIRA_1d275df7-64f4-4a43-a647-ae34648191c119862"].dist).to.be.equal(191.82);
    });
    it.skip("getDistanceScore for feature from hvv layer", async function () {
        // this one is too slow
        this.timeout(15000);
        const features = await getAllFeatures("20569"),
            commitStub = sinon.stub(),
            getters = defaultGetters(),

            score = await service.store.actions.getDistanceScore({getters, commit: commitStub},
                {
                    feature: features[0],
                    layerIds: ["5246"],
                    weights: [1]
                });

        expect(score.score).to.be.equal(140.07);
    });
    it("getDistanceScore feature outside hamburg", async () => {
        const p = [9.818415798420284, 53.26231927558228],
            commitStub = sinon.stub(),
            getters = defaultGetters(),

            score = await service.store.actions.getDistanceScore({getters, commit: commitStub},
                {
                    feature: {getId: ()=>"id", getGeometry: ()=> ({flatCoordinates: p, getExtent: ()=>[p[0], p[1], p[0], p[1]]})},
                    layerIds: ["19862"],
                    weights: [1]
                });

        expect(score).to.be.equal(null);

    });
    it("getDistanceScore with small layer inside extend", async () => {
        const commitStub = sinon.stub(),
            getters = {...defaultGetters(), useUserExtent: true},
            extent = [566074.67, 5933911.077, 567996.251, 5935623.892], // St. Georg
            p1 = [567120.1618948006, 5934379.965736715], // inside St. Georg

            score = await service.store.actions.getDistanceScore({getters, commit: commitStub},
                {
                    feature: {getId: ()=>"id", getGeometry: ()=> ({flatCoordinates: p1, getExtent: ()=>[p1[0], p1[1], p1[0], p1[1]]})},
                    layerIds: ["20569"], // one feature insdie St. Georg
                    weights: [1],
                    extent
                });

        expect(score.score).to.be.equal(157.41);
        expect(score["20569"].value).to.be.equal(157.41);
        expect(score["20569"].feature.getId()).to.be.equal("DE.HH.UP_AMIRA_1d275df7-64f4-4a43-a647-ae34648191c1");
        expect(commitStub.firstCall.args[1]["id20569566074.67,5933911.077,567996.251,5935623.892"].dist).to.eql(157.41);
    });
    it("should ignore empty extend", async () => {
        const features = await getAllFeatures("20569"),
            commitStub = sinon.stub(),
            getters = defaultGetters(),

            score = await service.store.actions.getDistanceScore({getters, commit: commitStub},
                {
                    feature: features[0],
                    layerIds: ["19862"],
                    weights: [1],
                    extent: []
                });

        expect(score.score).to.be.equal(191.82);
    });
    it("getDistanceScore with small layer outside extent", async () => {
        // current implementation ignores extent

        const commitStub = sinon.stub(),
            getters = {...defaultGetters(), useUserExtent: true},
            extent = [563262.057, 5941046.992, 568546.555, 5944993.724], // Fuhlsbuettel
            p1 = [567120.1618948006, 5934379.965736715], // inside St. Georg

            score = await service.store.actions.getDistanceScore({getters, commit: commitStub},
                {
                    feature: {getId: ()=>"id", getGeometry: ()=> ({flatCoordinates: p1, getExtent: ()=>[p1[0], p1[1], p1[0], p1[1]]})},
                    layerIds: ["20569"], // one feature insdie St. Georg
                    weights: [1],
                    extent
                });

        expect(score).to.be.equal(null);
        expect(commitStub.firstCall.args[1]).to.eql(
            {
                "id20569563262.057,5941046.992,568546.555,5944993.724": null
            });
    });
    it("should return layer infos", async () => {

        const state = {wmsLayers: [{id: "95"}]},
            infos = await service.store.getters.wmsLayersInfo(state);

        expect(infos).to.be.eql([{"id": "95"}]);
    });
    it("should return feature info value", async () => {

        const commitStub = sinon.stub(),
            getters = {wmsLayers: [
                {
                    id: "95",
                    attribute: "klasse",
                    converter: "DbRangeConverter",
                    resolution: 26
                }
            ]},
            p1 = [567120.1618948006, 5934379.965736715], // inside St. Georg

            score = await service.store.actions.getFeatureValues({getters, commit: commitStub},
                {
                    feature: {getId: ()=>"id", getGeometry: ()=> ({flatCoordinates: p1})},
                    layerId: "95"
                });

        expect(score).to.be.equal(57.5);
    });
    it("should return max feature info value", async () => {

        const commitStub = sinon.stub(),
            getters = {wmsLayers: [
                {
                    id: "95",
                    attribute: "klasse",
                    converter: "DbRangeConverter",
                    resolution: 26,
                    aggregation: "max",
                    featureCount: 50

                }
            ]},
            p1 = [567120.1618948006, 5934379.965736715], // inside St. Georg

            score = await service.store.actions.getFeatureValues({getters, commit: commitStub},
                {
                    feature: {getId: ()=>"id", getGeometry: ()=> ({flatCoordinates: p1})},
                    layerId: "95"
                });

        expect(score).to.be.equal(72.5);
    });
    it("should return feature info values for all features", async function () {
        this.timeout(5000);

        const commitStub = sinon.stub(),
            getters = {wmsLayers: [
                {
                    id: "95",
                    attribute: "klasse",
                    converter: "DbRangeConverter",
                    resolution: 35
                }
            ]},
            features = await getAllFeatures("19574"),

            scores = features.map(async feature=> service.store.actions.getFeatureValues({getters, commit: commitStub},
                {
                    feature,
                    layerId: "95"
                })),

            ret = await Promise.all(scores);

        expect(ret).to.be.eql(
            [
                57.5, 57.5, 75, 57.5, 57.5,
                67.5, 57.5, 57.5, 57.5, null,
                57.5, 57.5, 57.5, 57.5, 62.5,
                null, 72.5, 57.5, 57.5, 57.5,
                57.5, 57.5, 57.5, 57.5, 57.5,
                57.5, 57.5, 57.5, 57.5, 57.5,
                57.5, 57.5, 57.5, 57.5
            ]
        );
    });
    it("getDistanceScore with large layer", async function () {
        this.timeout(120000);

        const features = await getAllFeatures("19951"),
            commitStub = sinon.stub(),
            getters = defaultGetters(),

            score = await service.store.actions.getDistanceScore({getters, commit: commitStub},
                {
                    feature: features[0],
                    layerIds: ["16601"],
                    weights: [1]
                });

        expect(score.score).to.be.equal(133.57);
    });
});
