import {expect} from "chai";
import sinon from "sinon";
import Feature from "ol/Feature";
import {MultiPolygon} from "ol/geom";

import {
    getProportionMap,
    getBoundingBox
} from "../../../utils/translator.getProportionMap";
import store from "../../../../../src/app-store";

describe("addons/valuationPrint/utils/translator.getProportionMap.js", () => {
    const feature = new Feature({
        geometry: new MultiPolygon([[
            [
                [
                    562877.0009836305,
                    5940982.299269523
                ],
                [
                    562839.9593369664,
                    5941178.090830462
                ],
                [
                    562765.8760436381,
                    5941141.049183797
                ],
                [
                    562797.626026493,
                    5940982.299269523
                ],
                [
                    562877.0009836305,
                    5940982.299269523
                ]
            ]
        ]])
    });

    beforeEach(() => {
        store.getters = {
            "Maps/projection": {
                getCode: () => "EPSG:25832"
            }
        };
    });
    afterEach(sinon.restore);

    describe("getProportionMap", () => {
        // it("should return the default map configuration", () => {
        //     expect(getProportionMap(undefined).dpi).to.equal(200);
        //     expect(getProportionMap(undefined).bbox).to.deep.equal([545114.80, 5914269.80, 591483.01, 5957132.28]);
        //     expect(getProportionMap(undefined).projection).to.equal("EPSG:25832");

        //     expect(getProportionMap(null).dpi).to.equal(200);
        //     expect(getProportionMap(null).bbox).to.deep.equal([545114.80, 5914269.80, 591483.01, 5957132.28]);
        //     expect(getProportionMap(null).projection).to.equal("EPSG:25832");

        //     expect(getProportionMap([]).dpi).to.equal(200);
        //     expect(getProportionMap([]).bbox).to.deep.equal([545114.80, 5914269.80, 591483.01, 5957132.28]);
        //     expect(getProportionMap([]).projection).to.equal("EPSG:25832");

        //     expect(getProportionMap(true).dpi).to.equal(200);
        //     expect(getProportionMap(true).bbox).to.deep.equal([545114.80, 5914269.80, 591483.01, 5957132.28]);
        //     expect(getProportionMap(true).projection).to.equal("EPSG:25832");

        //     expect(getProportionMap("string").dpi).to.equal(200);
        //     expect(getProportionMap("string").bbox).to.deep.equal([545114.80, 5914269.80, 591483.01, 5957132.28]);
        //     expect(getProportionMap("string").projection).to.equal("EPSG:25832");
        // });

        it("should return the map configuration with configured and default value", () => {
            const config = {
                "coordinates": feature,
                "extent": [
                    562765.8760436381,
                    5940982.299269523,
                    562877.0009836305,
                    5941178.090830462
                ],
                "projection": "EPSG:1234",
                "style": {
                    "borderSize": 4,
                    "color": [
                        228,
                        26,
                        28,
                        1
                    ]
                },
                "proportion": 0.33,
                "layerIds": [
                    "2426"
                ]
            };

            expect(getProportionMap(config.coordinates, config.extent, config.projection, config.style, config.proportion, config.layerIds, undefined).dpi).to.equal(200);
            expect(getProportionMap(config.coordinates, config.extent, config.projection, config.style, config.proportion, config.layerIds, undefined).projection).to.equal("EPSG:1234");
            expect(getProportionMap(config.coordinates, config.extent, config.projection, config.style, config.proportion, config.layerIds, undefined).bbox).to.deep.equal([562653.0673924336, 5940783.541169781, 562989.809634835, 5941376.848930203]);
        });

        it("should return the map configuration with configured value", () => {
            const config = {
                "coordinates": feature,
                "extent": [
                    562765.8760436381,
                    5940982.299269523,
                    562877.0009836305,
                    5941178.090830462
                ],
                "projection": "EPSG:1234",
                "dpi": 72,
                "style": {
                    "borderSize": 4,
                    "color": [
                        228,
                        26,
                        28,
                        1
                    ]
                },
                "proportion": 0.33,
                "layerIds": [
                    "2426"
                ]
            };

            expect(getProportionMap(config.coordinates, config.center, config.projection, config.style, config.proportion, config.layerIds, config.dpi).dpi).to.equal(72);
            expect(getProportionMap(config.coordinates, config.center, config.projection, config.style, config.proportion, config.layerIds, config.dpi).projection).to.equal("EPSG:1234");
            expect(getProportionMap(config.coordinates, config.extent, config.projection, config.style, config.proportion, config.layerIds, undefined).bbox).to.deep.equal([562653.0673924336, 5940783.541169781, 562989.809634835, 5941376.848930203]);
        });
    });

    describe("getBoundingBox", () => {
        const extent = [
            562765.8760436381,
            5940982.299269523,
            562877.0009836305,
            5941178.090830462
        ];

        it("should return the bounding box with proportion 0.33", () => {
            const bbox = [
                562653.0673924336,
                5940783.541169781,
                562989.809634835,
                5941376.848930203
            ];

            expect(getBoundingBox(extent, undefined)).to.deep.equal(bbox);
            expect(getBoundingBox(extent, null)).to.deep.equal(bbox);
            expect(getBoundingBox(extent, [])).to.deep.equal(bbox);
            expect(getBoundingBox(extent, false)).to.deep.equal(bbox);
            expect(getBoundingBox(extent, {})).to.deep.equal(bbox);
            expect(getBoundingBox(extent, "0.33")).to.deep.equal(bbox);
            expect(getBoundingBox(extent, 0.33)).to.deep.equal(bbox);
            expect(getBoundingBox(extent, 0)).to.deep.equal(bbox);
            expect(getBoundingBox(extent, -1)).to.deep.equal(bbox);
            expect(getBoundingBox(extent, 12)).to.deep.equal(bbox);
        });

        it("should return the bounding box with the configured proportion", () => {
            expect(getBoundingBox(extent, 0.2)).to.deep.equal([
                562543.6261636532,
                5940590.7161476435,
                563099.2508636154,
                5941569.673952341
            ]);
            expect(getBoundingBox(extent, 0.5)).to.deep.equal([
                562710.3135736419,
                5940884.403489053,
                562932.5634536268,
                5941275.986610932
            ]);
            expect(getBoundingBox(extent, 0.8)).to.deep.equal([
                562751.9854261391,
                5940957.825324405,
                562890.8916011296,
                5941202.56477558
            ]);
        });
    });
});
