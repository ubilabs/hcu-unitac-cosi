import {expect} from "chai";
import QRModel from "@addons/qr/model.js";

describe("ADDON: QR-Code-Tool QRModel", function () {
    let model;

    before(function () {
        model = new QRModel({
            urlSchema: "http://geoinfo.de?lat={{LAT}}&lon={{LON}}",
            projection: "EPSG:4326"
        });
    });

    describe("setPlacementClickInteraction sets the click interaction", function () {
        it("setPlacementClickInteraction called with default empty object", function () {
            model.setPlacementClickInteraction({});
        });
        it("getPlacementClickInteraction returns empty object", function () {
            expect(model.getPlacementClickInteraction()).to.deep.equal({});
        });
    });

    describe("addQRPlacementInteraction adds the click interaction", function () {
        it("addQRPlacementInteraction called", function () {
            model.addQRPlacementInteraction();
        });
        it("getPlacementClickInteraction returns Pointer object", function () {
            const interact = model.getPlacementClickInteraction();

            expect(typeof interact).to.equal("object");
            expect(interact.targetPointers).to.deep.equal([]);
        });
    });

    describe("transformCoords transforms coordinates", function () {
        it("transformCoords returns transformed coordinates", function () {
            const coord = model.transformCoords([566064.50, 5934534.23]);

            expect(coord).to.be.an("array");
            expect(coord).to.have.lengthOf(2);
            expect(coord[0]).to.equal(9.997277956824725);
            expect(coord[1]).to.equal(53.55553108045473);
        });
    });

    describe("replaceDataInURLSchema generates URL for QR code", function () {
        it("replaceDataInURLSchema returns object", function () {
            const url = model.replaceDataInURLSchema([566064.50, 5934534.23]);

            expect(url).to.be.an("string");
            expect(url).to.equal("http://geoinfo.de?lat=53.55553108045473&lon=9.997277956824725");
        });
    });

    describe("setQRPopup adds the popup to the map", function () {
        it("setQRPopup called", function () {
            model.setQRPopup({});
        });
        it("getQRPopup returns Popup", function () {
            const popup = model.getQRPopup();

            expect(popup).to.deep.equal({});
        });
        it("removeQRPopup removes Popup", function () {
            let popup = "";

            model.removeQRPopup();
            popup = model.getQRPopup();

            expect(popup).to.be.null;
        });
    });
});
