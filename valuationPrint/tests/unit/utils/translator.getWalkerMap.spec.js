import {expect} from "chai";
import sinon from "sinon";

import {
    getWalkerMap
} from "../../../utils/translator.getWalkerMap";
import store from "../../../../../src/app-store";

describe("addons/valuationPrint/utils/translator.getWalkerMap.js", () => {

    beforeEach(() => {
        store.getters = {
            "Maps/projection": {
                getCode: () => "EPSG:25832"
            }
        };
    });
    afterEach(sinon.restore);

    describe("getWalkerMap", () => {
        it("should return the default map configuration", () => {
            expect(getWalkerMap(undefined).dpi).to.equal(200);
            expect(getWalkerMap(undefined).scale).to.equal(20000);
            expect(getWalkerMap(undefined).projection).to.equal("EPSG:25832");
            expect(getWalkerMap(undefined).center).to.be.an("array").with.length(0);

            expect(getWalkerMap(null).dpi).to.equal(200);
            expect(getWalkerMap(null).scale).to.equal(20000);
            expect(getWalkerMap(null).projection).to.equal("EPSG:25832");
            expect(getWalkerMap(null).center).to.be.an("array").with.length(0);

            expect(getWalkerMap([]).dpi).to.equal(200);
            expect(getWalkerMap([]).scale).to.equal(20000);
            expect(getWalkerMap([]).projection).to.equal("EPSG:25832");
            expect(getWalkerMap([]).center).to.be.an("array").with.length(0);

            expect(getWalkerMap(true).dpi).to.equal(200);
            expect(getWalkerMap(true).scale).to.equal(20000);
            expect(getWalkerMap(true).projection).to.equal("EPSG:25832");
            expect(getWalkerMap(true).center).to.be.an("array").with.length(0);

            expect(getWalkerMap("string").dpi).to.equal(200);
            expect(getWalkerMap("string").scale).to.equal(20000);
            expect(getWalkerMap("string").projection).to.equal("EPSG:25832");
            expect(getWalkerMap("string").center).to.be.an("array").with.length(0);
        });
    });

    it("should return the map configuration with configured and default value", () => {
        const config = {
            "coordinates": [
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
            ],
            "center": [
                561968.7521088345,
                5939653.913689158
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
            "scale": 20000,
            "layerIds": [
                "2426"
            ]
        };

        expect(getWalkerMap(config.coordinates, config.center, config.projection, undefined, config.style, config.scale, config.LayerIds).dpi).to.equal(200);
        expect(getWalkerMap(config.coordinates, config.center, config.projection, undefined, config.style, config.scale, config.LayerIds).scale).to.equal(20000);
        expect(getWalkerMap(config.coordinates, config.center, config.projection, undefined, config.style, config.scale, config.LayerIds).center).to.deep.equal([561968.7521088345, 5939653.913689158]);
        expect(getWalkerMap(config.coordinates, config.center, config.projection, undefined, config.style, config.scale, config.LayerIds).projection).to.equal("EPSG:1234");
    });

    it("should return the map configuration with configured value", () => {
        const config = {
            "coordinates": [
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
            ],
            "center": [
                561968.7521088345,
                5939653.913689158
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
            "scale": 20000,
            "layerIds": [
                "2426"
            ]
        };

        expect(getWalkerMap(config.coordinates, config.center, config.projection, config.dpi, config.style, config.scale, config.LayerIds).dpi).to.equal(72);
        expect(getWalkerMap(config.coordinates, config.center, config.projection, config.dpi, config.style, config.scale, config.LayerIds).scale).to.equal(20000);
        expect(getWalkerMap(config.coordinates, config.center, config.projection, config.dpi, config.style, config.scale, config.LayerIds).center).to.deep.equal([561968.7521088345, 5939653.913689158]);
        expect(getWalkerMap(config.coordinates, config.center, config.projection, config.dpi, config.style, config.scale, config.LayerIds).projection).to.equal("EPSG:1234");
    });
});
