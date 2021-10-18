import {initializeLayerList} from "../initializeLayerList";
import {getAllFeatures} from "../getAllFeatures";
import {findNearestFeatures} from "../findNearestFeatures";
import {expect} from "chai";
import * as Proj from "ol/proj.js";

describe.only("findNearestFeature", () => {
    before(async function () {
        await initializeLayerList();
    });
    it("should find feature from same feature", async () => {
        const features = await getAllFeatures("20569"),

            foundFeatures = await findNearestFeatures("20569", features[0], 10000, 10000);

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
});
