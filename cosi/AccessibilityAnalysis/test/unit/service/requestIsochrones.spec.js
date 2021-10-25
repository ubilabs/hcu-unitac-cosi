import {
    expect
} from "chai";
import requestIsochrones from "../../../service/requestIsochrones";
import axios from "axios";
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
                    [9.744273174491198, 53.86052854494209]
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
});
