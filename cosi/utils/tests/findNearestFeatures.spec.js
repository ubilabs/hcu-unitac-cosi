import {initializeLayerList} from "../initializeLayerList";
import {getAllFeatures} from "../getAllFeatures";
import {findNearestFeatures} from "../findNearestFeatures";
import {expect} from "chai";
import * as Proj from "ol/proj.js";
import {registerProjections} from "../registerProjections";

describe.skip("findNearestFeature", () => {
    before(async function () {
        this.timeout(10000);
        await initializeLayerList();
        registerProjections();
    });
    it("should find feature from same feature", async function () {
        const features = await getAllFeatures("20569"),


            foundFeatures = await findNearestFeatures("20569", features[0], 0.001, 0.001);

        expect(foundFeatures).to.have.lengthOf(1);
        expect(features[0].getId()).to.be.equal(foundFeatures[0].getId());
    });
    it("should find feature", async () => {
        const p = Proj.transform([9.818415798420284, 53.26231927558228], "EPSG:4326", "EPSG:25832"),
            feature = {getId: () => "id", getGeometry: () => ({flatCoordinates: p, getExtent: ()=>[p[0], p[1], p[0], p[1]]})},

            foundFeatures = await findNearestFeatures("20569", feature, 10000, 10000);

        expect(foundFeatures).to.have.lengthOf(1);
    });
    it("should find no feature", async () => {
        const p = Proj.transform([9.818415798420284, 53.26231927558228], "EPSG:4326", "EPSG:25832"),
            feature = {getId: () => "id", getGeometry: () => ({flatCoordinates: p, getExtent: ()=>[p[0], p[1], p[0], p[1]]})},

            foundFeatures = await findNearestFeatures("20569", feature, 1, 1);

        expect(foundFeatures).to.have.lengthOf(0);
    });
    it("should find feature on hvv layer", async function () {

        const p = [594740.74394628, 5901017.57758488],
            feature = {getId: () => "id", getGeometry: () => ({flatCoordinates: p, getExtent: ()=>[p[0], p[1], p[0], p[1]]})},
            foundFeatures = await findNearestFeatures("5246", feature, 1, 1);

        expect(foundFeatures).to.have.lengthOf(1);
    });
});

