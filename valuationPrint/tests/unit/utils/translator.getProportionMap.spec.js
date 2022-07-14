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
                },
                result = getProportionMap(config.coordinates, config.extent, config.projection, config.style, config.proportion, config.layerIds, undefined);

            expect(result).to.be.an("object").that.is.not.empty;
            expect(result.dpi).to.equal(200);
            expect(result.projection).to.equal("EPSG:1234");
            expect(result.bbox).to.deep.equal([562524.784633423, 5940783.541169781, 563118.0923938458, 5941376.848930203]);
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
                },
                result = getProportionMap(config.coordinates, config.extent, config.projection, config.style, config.proportion, config.layerIds, config.dpi);

            expect(result).to.be.an("object").that.is.not.empty;
            expect(result.dpi).to.equal(72);
            expect(result.projection).to.equal("EPSG:1234");
            expect(result.bbox).to.deep.equal([562524.784633423, 5940783.541169781, 563118.0923938458, 5941376.848930203]);
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
                562524.784633423,
                5940783.541169781,
                563118.0923938458,
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
                562331.9596112855,
                5940590.7161476435,
                563310.917415983,
                5941569.673952341
            ]);
            expect(getBoundingBox(extent, 0.5)).to.deep.equal([
                562625.6469526947,
                5940884.403489053,
                563017.2300745738,
                5941275.986610932
            ]);
            expect(getBoundingBox(extent, 0.8)).to.deep.equal([
                562699.0687880472,
                5940957.825324405,
                562943.8082392216,
                5941202.56477558
            ]);
        });
    });
});
