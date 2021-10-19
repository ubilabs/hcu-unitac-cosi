import {
    expect
} from "chai";
import requestIsochrones, {getCityLimits} from "../../../service/requestIsochrones";
import axios from "axios";
import {WFS} from "ol/format.js";
import * as turf from "@turf/turf";
import {initializeLayerList} from "../../../../utils/initializeLayerList";
import {getAllFeatures} from "../../../../utils/getAllFeatures";
import * as Proj from "ol/proj.js";
// import layers from "./layers.json";


// import fetch from 'node-fetch';


// node-fetch not working: https://notes.alex-miller.co/20210520161027-mocking_fetch_in_a_jsdom_node_environment/
describe("requestIsochrones", () => {
    it("point request within hamburg", async () => {
        const res = await requestIsochrones(
            "driving-car", [
                [10.01454373872902, 53.54889579639215]
            ],
            "time", [600 * 0.33, 600 * 0.67, 600]);


        expect(res.type).to.equal("FeatureCollection");
        expect(res.features).to.have.length(3);
    });
    it("point request within hamburg with abort", async () => {

        const cancelTokenSource = axios.CancelToken.source();

        await requestIsochrones(
            "driving-car", [
                [10.01454373872902, 53.54889579639215]
            ],
            "time", [600 * 0.33, 600 * 0.67, 600], cancelTokenSource);

        cancelTokenSource.cancel();
    });
    it("point request outside hamburg", async () => {
        try {
            await requestIsochrones(
                "driving-car", [
                    [9.744273174491198, 53.86052854494209],
                    [10.044398219793916, 53.58614195023027],
                    [10.00047212535128, 53.59431305465069],
                    [10.009020188268527, 53.54967920652423],
                    [10.042859099930093, 53.57695084241739]
                ],
                "time", [600 * 0.33, 600 * 0.67, 600]);
        }
        catch (e) {
            expect(e.response.data.error.code).to.equal(3099);
        }
    });
    it("point request invalid data", async () => {
        try {
            await requestIsochrones(
                "driving-car", [
                    [9.744273174491198, "b"]
                ],
                "time", [600 * 0.33, 600 * 0.67, 600]);
        }
        catch (e) {
            expect(e.response.data.error.code).to.equal(3002);
        }
    });
    it.skip("point request invalid data", async function () {

        this.timeout(205000);

        await initializeLayerList();

        const ret = await getCityLimits("https://geodienste.hamburg.de/HH_WFS_Verwaltungsgrenzen", "landesgrenze"),
            wfsReader = new WFS({}),
            feature = wfsReader.readFeatures(ret)[0],
            features = await getAllFeatures("16601"),
            poly = turf.polygon(feature.getGeometry().getPolygon(0).getCoordinates()),
            inp = [],
            out = [];

        console.log("start");
        console.log(features.length);
        for (let i = 0; i < features.length; i++) {
            const p = features[i].getGeometry().flatCoordinates.slice(0, 2);

            if (turf.booleanPointInPolygon(p, poly)) {
                inp.push(p);
            }
            else {
                out.push(p);
            }
        }
        console.log(inp.length);
        console.log(out.length);
        let failc = 0;

        for (const p of inp) {
            try {
                const tp = Proj.transform(p, "EPSG:25832", "EPSG:4326"),
                    res = await requestIsochrones("driving-car", [tp], "time", [600 * 0.33, 600 * 0.67, 600]);
            }
            catch (e) {
                failc += 1;
            }
        }
        console.log(failc);
    });
});
