import {expect} from "chai";
import OktagonGFIModel from "@addons/oktagonKartenportal/oktagonGFIModel.js";

describe("ADDON: oktagonKartenportal oktagonURLParameter", function () {
    let model;

    before(function () {
        model = new OktagonGFIModel();
    });

    describe("createSubmitURL creates the submit url", function () {
        it("createSubmitURL called with default empty object", function () {
            model.createSubmitURL({});
        });
        it("createSubmitURL returns submit url as string", function () {
            const submitObject = {
                Baublock: "123456",
                Flurstuecksnummer: "1234",
                Gemarkungsname: "Testgemarkung",
                Gemarkungsnummer: "0123",
                KoordinateX: "567774,7569432978",
                KoordinateY: "5933496,393307779"
            };

            model.setSubmitURL("HTTPS://GEOPORTAL-HAMBURG.DE");
            expect(model.createSubmitURL(submitObject)).to.equal("HTTPS://GEOPORTAL-HAMBURG.DE?Baublock=123456&Flurstuecksnummer=1234&Gemarkungsname=Testgemarkung&Gemarkungsnummer=0123&KoordinateX=567774,7569432978&KoordinateY=5933496,393307779");
        });
    });
});

