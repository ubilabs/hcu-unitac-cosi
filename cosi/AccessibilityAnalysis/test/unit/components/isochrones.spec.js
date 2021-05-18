import {
    config,
    shallowMount
} from "@vue/test-utils";
import {
    fetchIsochroneFeatures
} from "../../../components/util.js";
import {
    expect
} from "chai";
import sinon from "sinon";
import data from "./isochrones.json";
import {
    expectedFeatures
} from "./features.expect.js";
import * as crs from "masterportalAPI/src/crs";

const coordinates = [
    [10.155828082155567, 53.60323024735499],
    [10.121047700109056, 53.605443831123594],
    [10.078696404760024, 53.6111957469764]
]

const namedProjections = [
    ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
    ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
    ["EPSG:8395", "+title=ETRS89/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
    ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
];

before(() => {
    crs.registerProjections(namedProjections);

    i18next.init({
        lng: "cimode",
        debug: false
    });
});

describe("addons/AccessibilityAnalysis/createIsochrones2", () => {

    before(() => {});

    // it("invalid arguments", () => {
    //     createIsochrones2(null, [], "", "", 0)
    //     // expect(wrapper.exists()).to.be.true;

    // });
    it("one coordinate", async () => {
        const stub = sinon.stub(Radio, "request").resolves(JSON.stringify(data));

        // const s = {
        //     getSource: () => ({
        //         clear: sinon.stub(),
        //         addFeatures: sinon.stub()
        //     })
        // }

        const ret = await fetchIsochroneFeatures([coordinates[0]], "ttype", "sunit", 1)
        expect(JSON.stringify(ret)).to.equal(expectedFeatures)
        sinon.assert.calledWith(stub, "OpenRoute", "requestIsochrones", "ttype", [coordinates[0]], "sunit",
            [1, 0.67, 0.33]);
    });
});
