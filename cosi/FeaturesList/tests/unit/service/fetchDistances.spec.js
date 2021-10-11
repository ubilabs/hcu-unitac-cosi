import {fetchDistances} from "../../../service/fetchDistances";
import {expect} from "chai";
import {getAllFeatures} from "../../../../utils/getAllFeatures";
import * as Proj from "ol/proj.js";
import {initializeLayerList} from "../../../../utils/initializeLayerList";

describe("fetchDistances", () => {
    it("fetchDistances many to many points", async () => {
        const p1 = [10.155828082155567, 53.60323024735499],
            p2 = [9.929228790987056, 53.62844116644285],
            p3 = [9.89131688635834, 53.5000628907474],
            p4 = [10.004429884266159, 53.543403216675124],
            dists = await fetchDistances([p1, p4, p2], [p2, p3]);

        expect(dists).to.deep.equal([[17981.68, 26692.29], [12640.27, 13228.32], [0, 19775.77]]);
    });
    it("fetchDistances one to itself", async () => {
        const p1 = [10.155828082155567, 53.60323024735499],
            dists = await fetchDistances([p1], [p1]);

        expect(dists).to.deep.equal([[null]]);
    });
    it("fetchDistances one to one", async () => {
        const p1 = [10.155828082155567, 53.60323024735499],
            p2 = [9.929228790987056, 53.62844116644285],
            dists = await fetchDistances([p1], [p2]);

        expect(dists).to.deep.equal([[17981.68]]);
    });
    it("fetchDistances one to outside hamburg", async () => {
        const p1 = [10.155828082155567, 53.60323024735499],
            p2 = [9.818415798420284, 53.26231927558228],

            dists = await fetchDistances([p1], [p2]);

        expect(dists).to.deep.equal([null]);
    });
    it("fetchDistances source outside hamburg", async () => {
        const p1 = [10.155828082155567, 53.60323024735499],
            p2 = [9.818415798420284, 53.26231927558228],

            dists = await fetchDistances([p2], [p1]);

        expect(dists).to.deep.equal([null]);
    });
    it("fetchDistances two outside hamburg", async () => {
        const p1 = [10.155828082155567, 53.60323024735499],
            p2 = [9.818415798420284, 53.26231927558228],
            p3 = [9.89131688635834, 53.5000628907474],

            dists = await fetchDistances([p1, p2, p2, p1], [p2, p3, p3, p2]);

        expect(dists).to.deep.equal([[26681.29, 26681.29], null, null, [26681.29, 26681.29]]);
    });
    it.skip("fetchDistances many features", async function () {
        // results in network error
        this.timeout(120000);

        await initializeLayerList();

        const features = await getAllFeatures("16601"),
            coords_ = features.map(f => Proj.transform(f.getGeometry().flatCoordinates, "EPSG:25832", "EPSG:4326").slice(0, 2));

        try {
            await fetchDistances(coords_, coords_.map(c => [c[0] + 0.0001, c[1] + 0.0001]));
        }
        catch (err) {
            console.error(err);
            console.error(err.toJSON());
        }
    });
});
