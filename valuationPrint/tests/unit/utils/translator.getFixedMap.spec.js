import {expect} from "chai";
import sinon from "sinon";

import {
    getFixedMap
} from "../../../utils/translator.getFixedMap";
import store from "../../../../../src/app-store";

describe("addons/valuationPrint/utils/translator.getFixedMap.js", () => {

    beforeEach(() => {
        store.getters = {
            "Maps/projection": {
                getCode: () => "EPSG:25832"
            }
        };
    });
    afterEach(sinon.restore);

    describe("getFixedMap", () => {
        // it("should return the default map configuration", () => {
        //     expect(getFixedMap(undefined).dpi).to.equal(200);
        //     expect(getFixedMap(undefined).bbox).to.deep.equal([545114.80, 5914269.80, 591483.01, 5957132.28]);
        //     expect(getFixedMap(undefined).projection).to.equal("EPSG:25832");

        //     expect(getFixedMap(null).dpi).to.equal(200);
        //     expect(getFixedMap(null).bbox).to.deep.equal([545114.80, 5914269.80, 591483.01, 5957132.28]);
        //     expect(getFixedMap(null).projection).to.equal("EPSG:25832");

        //     expect(getFixedMap([]).dpi).to.equal(200);
        //     expect(getFixedMap([]).bbox).to.deep.equal([545114.80, 5914269.80, 591483.01, 5957132.28]);
        //     expect(getFixedMap([]).projection).to.equal("EPSG:25832");

        //     expect(getFixedMap(true).dpi).to.equal(200);
        //     expect(getFixedMap(true).bbox).to.deep.equal([545114.80, 5914269.80, 591483.01, 5957132.28]);
        //     expect(getFixedMap(true).projection).to.equal("EPSG:25832");

        //     expect(getFixedMap("string").dpi).to.equal(200);
        //     expect(getFixedMap("string").bbox).to.deep.equal([545114.80, 5914269.80, 591483.01, 5957132.28]);
        //     expect(getFixedMap("string").projection).to.equal("EPSG:25832");
        // });

        it("should return the map configuration with configured and default value", () => {
            const config = {
                "coordinates": [
                    561968.7521088345,
                    5939653.913689158
                ],
                "projection": "EPSG:1234",
                "style": {
                    "pointSize": 4,
                    "color": [
                        228,
                        26,
                        28,
                        1
                    ]
                },
                "bbox": [
                    545114.8,
                    5914269.8,
                    591483.1,
                    5957132.8
                ],
                "layerIds": [
                    "2426"
                ]
            };

            expect(getFixedMap(config.coordinates, config.projection, config.style, config.bbox, config.LayerIds, undefined).dpi).to.equal(200);
            expect(getFixedMap(config.coordinates, config.projection, config.style, config.bbox, config.LayerIds, undefined).bbox).to.deep.equal([545114.8, 5914269.8, 591483.1, 5957132.8]);
            expect(getFixedMap(config.coordinates, config.projection, config.style, config.bbox, config.LayerIds, undefined).projection).to.equal("EPSG:1234");
        });

        it("should return the map configuration with configured value", () => {
            const config = {
                "coordinates": [
                    561968.7521088345,
                    5939653.913689158
                ],
                "dpi": 72,
                "projection": "EPSG:1234",
                "style": {
                    "pointSize": 4,
                    "color": [
                        228,
                        26,
                        28,
                        1
                    ]
                },
                "bbox": [
                    545114.8,
                    5914269.8,
                    591483.1,
                    5957132.8
                ],
                "layerIds": [
                    "2426"
                ]
            };

            expect(getFixedMap(config.coordinates, config.projection, config.style, config.bbox, config.layerIds, config.dpi).dpi).to.equal(72);
            expect(getFixedMap(config.coordinates, config.projection, config.style, config.bbox, config.layerIds, config.dpi).bbox).to.deep.equal([545114.8, 5914269.8, 591483.1, 5957132.8]);
            expect(getFixedMap(config.coordinates, config.projection, config.style, config.bbox, config.layerIds, config.dpi).projection).to.equal("EPSG:1234");
        });
    });
});
