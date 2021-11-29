import {
    expect
} from "chai";
import sinon from "sinon";

import {
    registerProjections
} from "../components/util.js";
import {Worker} from "../../../service/isochronesWorker";
import service, {setWorker, setWorkerFactory} from "../../../service/index";
import features from "./featuresPoint.json";
import featuresRegion from "./featuresRegion.json";
import GeoJSON from "ol/format/GeoJSON";
import * as turf from "@turf/turf";
import {initializeLayerList} from "../../../../utils/initializeLayerList";
import {getAllFeatures} from "../../../../utils/getAllFeatures";
import * as Proj from "ol/proj.js";


/**
* @param {object} actualFeatures actual features
* @param {object} expFeatures expected features
* @returns {void}
*/
function expectFeaturesEqual (actualFeatures, expFeatures) {
    expect(actualFeatures.length, expFeatures.length);

    actualFeatures.sort((a, b) => a.getGeometry().getCoordinates()[0].length > b.getGeometry().getCoordinates()[0].length ? 1 : -1);
    expFeatures.sort((a, b) => a.getGeometry().getCoordinates()[0].length > b.getGeometry().getCoordinates()[0].length ? 1 : -1);
    const parser = new GeoJSON();

    for (let i = 0; i < actualFeatures.length; i++) {
        const f1 = turf.polygon(actualFeatures[i].getGeometry().getCoordinates()),
            f2 = turf.polygon(expFeatures[i].getGeometry().getCoordinates());

        expect(turf.booleanEqual(f1, f2)).to.be.true;
        expect(parser.writeFeature(actualFeatures[i]).properties).to.deep.equal(parser.writeFeature(expFeatures[i]).properties);
    }
}

before(() => {
    registerProjections();
    setWorkerFactory(() => new Worker());
});

describe("createIsochrones", () => {

    it("createIsochrones point", async () => {
        const commitStub = sinon.stub(),
            ret = await service.store.actions.getIsochrones({getters: {}, commit: commitStub},
                {
                    coordinates: [[10.155828082155567, 53.60323024735499]],
                    transportType: "driving-car",
                    scaleUnit: "time",
                    distance: 10
                });

        sinon.assert.callCount(commitStub, 3);
        expect(ret.length).to.equal(3);
        expect(service.store.state.progress).to.equal(0);
        expectFeaturesEqual(ret, new GeoJSON().readFeatures(features));
    });

    it("should cancel first call", async () => {
        // eslint-disable-next-line require-jsdoc
        async function act () {
            return service.store.actions.getIsochrones({getters: {}, commit: sinon.stub()},
                {
                    coordinates: [[10.155828082155567, 53.60323024735499]],
                    transportType: "driving-car",
                    scaleUnit: "time",
                    distance: 10
                });
        }

        let error;

        act().catch(err => {
            error = err;
        });
        await act();

        expect(error).to.be.eql({
            "request_canceled": true,
            "type": "createIsochrones"
        });
    });

    it("createIsochrones several points", async () => {

        const commitStub = sinon.stub(),
            ret = await service.store.actions.getIsochrones({getters: {}, commit: commitStub},
                {
                    coordinates: [[10.044398219793916, 53.58614195023027],
                        [10.00047212535128, 53.59431305465069],
                        [10.009020188268527, 53.54967920652423],
                        [10.042859099930093, 53.57695084241739]],
                    transportType: "driving-car",
                    scaleUnit: "time",
                    distance: 10
                });

        // expectFeaturesEqual(ret, new GeoJSON().readFeatures(featuresRegion)); turf does not like the resulting polygons..
        expect(new GeoJSON().writeFeatures(ret)).to.be.equal(JSON.stringify(featuresRegion));
    });

    it("should fetch and use filter poly", async () => {
        setWorker(undefined);

        const ret = await service.store.actions.getIsochrones({
                getters: {
                    batchSize: 2, // with this batch size the hole request would fail without the filter poly
                    filterUrl: "https://geodienste.hamburg.de/HH_WFS_Verwaltungsgrenzen",
                    filterFeatureType: "landesgrenze"
                }, commit: sinon.stub()},
            {
                coordinates: [
                    [9.744273174491198, 53.86052854494209], // outside HH
                    [10.044398219793916, 53.58614195023027]
                ],
                transportType: "driving-car",
                scaleUnit: "time",
                distance: 10
            }),

            filterPoly = await service.store.actions.getFilterPoly();

        expect(filterPoly.type).to.be.equal("Feature");
        expect(ret.length).to.equal(3);
    });

    it("should use filter poly", async () => {
        setWorker(undefined);

        const ret = await service.store.actions.getIsochrones({
                getters: {
                    batchSize: 2, // with this batch size the hole request would fail without the filter poly
                    filterPoly: [
                        [548365.316, 5916918.107],
                        [588010.382, 5916918.107],
                        [588010.382, 5955161.675],
                        [548365.316, 5955161.675],
                        [548365.316, 5916918.107]] // bbox of HH
                }, commit: sinon.stub()},
            {
                coordinates: [
                    [9.744273174491198, 53.86052854494209], // outside HH
                    [10.044398219793916, 53.58614195023027]
                ],
                transportType: "driving-car",
                scaleUnit: "time",
                distance: 10
            }),

            filterPoly = await service.store.actions.getFilterPoly();

        expect(filterPoly.type).to.be.equal("Feature");
        expect(ret.length).to.equal(3);
    });

    it("createIsochrones point error", async () => {
        const commitStub = sinon.stub();

        let fail = false;

        try {
            await service.store.actions.getIsochrones({getters: {}, commit: commitStub},
                {
                    coordinates: [[9.744273174491198, "b"]],
                    transportType: "driving-car",
                    scaleUnit: "time",
                    distance: 10
                });
        }
        catch (err) {
            fail = true;
            expect(err.response.data.error.code).to.be.equal(3002);
        }

        expect(fail).to.equal(true);
        expect(service.store.state.progress).to.equal(0);
    });
    it("should not fail if one point is outside hamburg", async () => {
        const commitStub = sinon.stub(),
            ret = await service.store.actions.getIsochrones({getters: {batchSize: 1}, commit: commitStub},
                {
                    coordinates:
                        [
                            [9.744273174491198, 53.86052854494209], // outside HH
                            [10.044398219793916, 53.58614195023027],
                            [10.00047212535128, 53.59431305465069],
                            [10.009020188268527, 53.54967920652423],
                            [10.042859099930093, 53.57695084241739]
                        ],
                    transportType: "driving-car",
                    scaleUnit: "time",
                    distance: 10
                });

        expect(ret.length).to.equal(3);
    });
    it("should return empty list if all points outside hamburg", async () => {
        const commitStub = sinon.stub(),
            ret = await service.store.actions.getIsochrones({getters: {batchSize: 1}, commit: commitStub},
                {
                    coordinates:
                        [
                            [9.744273174491198, 53.86052854494209], // outside HH
                            [9.744273174491198, 53.86052854494209] // outside HH
                        ],
                    transportType: "driving-car",
                    scaleUnit: "time",
                    distance: 10
                });

        expect(ret).to.be.eql([]);
    });
    it.skip("should create isochrones for alle schulen hamburg", async function () {
        this.timeout(205000);

        await initializeLayerList();

        const commitStub = sinon.stub(),
            allFeatures = await getAllFeatures("1732"),
            coords = allFeatures.map(f => Proj.transform(f.getGeometry().flatCoordinates.slice(0, 2), "EPSG:25832", "EPSG:4326")),

            ret = await service.store.actions.getIsochrones({getters: {batchSize: 10}, commit: commitStub},
                {
                    coordinates: coords,
                    transportType: "driving-car",
                    scaleUnit: "time",
                    distance: 10
                });

        expect(ret.length).to.equal(3);
    });
});
