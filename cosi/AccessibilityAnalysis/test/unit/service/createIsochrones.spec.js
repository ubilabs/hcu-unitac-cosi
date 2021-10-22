import {
    expect
} from "chai";
import sinon from "sinon";

import {
    registerProjections
} from "../components/util.js";
import {Worker} from "../../../service/isochronesWorker";
import service, {setWorkerFactory} from "../../../service/index";
import features from "./featuresPoint.json";
import featuresRegion from "./featuresRegion.json";
import GeoJSON from "ol/format/GeoJSON";
import * as turf from "@turf/turf";


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
            ret = await service.store.actions.getIsochrones({getters: null, commit: commitStub},
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

    it("createIsochrones several points", async () => {

        const commitStub = sinon.stub(),
            ret = await service.store.actions.getIsochrones({getters: null, commit: commitStub},
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

    it("createIsochrones point error", async () => {
        const commitStub = sinon.stub();

        let fail = false;

        try {
            await service.store.actions.getIsochrones({getters: null, commit: commitStub},
                {
                    coordinates: [[9.744273174491198, "b"]],
                    transportType: "driving-car",
                    scaleUnit: "time",
                    distance: 10
                });
        }
        catch (err) {
            fail = true;
            expect(err.error.response.data.error.code).to.be.equal(3002);
        }

        expect(fail).to.equal(true);
        expect(service.store.state.progress).to.equal(0);
    });
});
