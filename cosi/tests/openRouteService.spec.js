import {
    expect
} from "chai";
import OpenRouteService from "../modules/openRouteService/model";

describe("openRouteService.vue", () => {
    it("point request within hamburg", async () => {
        new OpenRouteService();
        const res = await Radio.request(
            "OpenRoute",
            "requestIsochrones",
            "driving-car", [
                [10.01454373872902, 53.54889579639215]
            ],
            "time", [600 * 0.33, 600 * 0.67, 600]);

        expect(JSON.parse(res).type).to.equal("FeatureCollection");
    });
    it("point request outside hamburg", async () => {
        new OpenRouteService();
        try {
            await Radio.request(
                "OpenRoute",
                "requestIsochrones",
                "driving-car", [
                    [9.744273174491198, 53.86052854494209]
                ],
                "time", [600 * 0.33, 600 * 0.67, 600]);
        }
        catch (e) {
            expect(JSON.parse(e.response).error.code).to.equal(3099);
        }

    });
    it("point request invalid data", async () => {
        new OpenRouteService();
        try {
            await Radio.request(
                "OpenRoute",
                "requestIsochrones",
                "driving-car", [
                    [9.744273174491198, "b"]
                ],
                "time", [600 * 0.33, 600 * 0.67, 600]);
        }
        catch (e) {
            expect(JSON.parse(e.response).error.code).to.equal(3002);
        }
    });
});
