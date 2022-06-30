import {expect} from "chai";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
import sinon from "sinon";
import {createFeatureByCoordinate, collectFeatures, getFilter} from "../../../utils/collectFeatures.js";

describe("addons/valuationPrint/utils/collectFeatures.js", () => {
    const feature = new Feature({
        geometry: new Polygon([[
            [563599.939, 5936263.688, 0],
            [563602.501, 5936266.163, 0],
            [563608.446, 5936271.905, 0],
            [563609.548, 5936272.969, 0],
            [563617.959, 5936281.094, 0],
            [563619.708, 5936280.381, 0],
            [563628.979, 5936276.605, 0],
            [563630.879, 5936275.831, 0],
            [563634.164, 5936274.492, 0],
            [563625.036, 5936252.064, 0],
            [563624.785, 5936251.517, 0],
            [563624.488, 5936250.994, 0],
            [563624.147, 5936250.498, 0],
            [563623.765, 5936250.033, 0],
            [563623.344, 5936249.603, 0],
            [563622.888, 5936249.21, 0],
            [563622.4, 5936248.858, 0],
            [563621.883, 5936248.55, 0],
            [563621.342, 5936248.287, 0],
            [563620.78, 5936248.071, 0],
            [563620.202, 5936247.904, 0],
            [563619.612, 5936247.788, 0],
            [563619.013, 5936247.723, 0],
            [563618.412, 5936247.709, 0],
            [563617.811, 5936247.747, 0],
            [563617.216, 5936247.837, 0],
            [563616.631, 5936247.977, 0],
            [563616.06, 5936248.168, 0],
            [563615.508, 5936248.406, 0],
            [563614.978, 5936248.691, 0],
            [563614.474, 5936249.021, 0],
            [563614.001, 5936249.392, 0],
            [563613.561, 5936249.803, 0],
            [563599.939, 5936263.688, 0]]])
    });

    describe("createFeatureByCoordinate", () => {
        it("should return a feature", () => {
            const pointFeature = createFeatureByCoordinate([574729.649, 5927590.856]);

            expect(pointFeature instanceof Feature).to.be.true;
        });

        it("should return a feature with the passed coordinate", () => {
            const pointFeature = createFeatureByCoordinate([574729.649, 5927590.856]);

            expect(pointFeature.getGeometry().getCoordinates()).to.deep.equal([574729.649, 5927590.856]);
        });
    });

    describe("getFilter", () => {
        it("should return a intersects filter", () => {
            const filter = getFilter(feature.getGeometry(), "geom", "intersects");

            expect(filter.tagName_).to.be.equal("Intersects");
        });

        it("should return a within filter", () => {
            const filter = getFilter(feature.getGeometry(), "geom", "within");

            expect(filter.tagName_).to.be.equal("Within");
        });

        it("should return undefined if no filter type is passed", () => {
            const filter = getFilter(feature.getGeometry(), "geom");

            expect(filter).to.be.undefined;
        });
    });

    describe("collectFeatures", () => {
        it("should call onsuccess if a coorindate is given", () => {
            const onsuccess = sinon.spy();

            collectFeatures({}, {coordinate: [574729.649, 5927590.856]}, undefined, onsuccess);

            expect(onsuccess.calledOnce).to.be.true;
        });
    });
});
