import {expect} from "chai";
import QRModel from "@addons/qr/model.js";
import Overlay from "ol/Overlay";
import sinon from "sinon";
import mapCollection from "../../../src/core/dataStorage/mapCollection";

describe("ADDON: QR-Code-Tool QRModel", function () {
    let model;

    before(function () {
        mapCollection.clear();
        mapCollection.addMap({
            mode: "2D",
            addInteraction: sinon.spy(),
            addOverlay: sinon.spy(),
            removeInteraction: sinon.spy(),
            removeOverlay: sinon.spy()
        }, "2D");

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

    describe("replaceDataInURLSchema generates URL for QR code", function () {
        it("replaceDataInURLSchema returns object", function () {
            const url = model.replaceDataInURLSchema([566064.50, 5934534.23]);

            expect(url).to.be.an("string");
            expect(url.substr(0, 30)).to.equal("http://geoinfo.de?lat=53.55553");
        });
    });

    describe("setQRPopup adds the popup to the map", function () {
        it("setQRPopup called", function () {
            model.setQRPopup(new Overlay({id: 1234}));
        });
        it("getQRPopup returns Popup", function () {
            const popup = model.getQRPopup();

            expect(popup).to.be.an("object");
            expect(popup.options.id).to.be.equal(1234);
        });
        it("removeQRPopup removes Popup", function () {
            let popup = "";

            model.removeQRPopup();
            popup = model.getQRPopup();

            expect(popup).to.be.null;
        });
    });
});
