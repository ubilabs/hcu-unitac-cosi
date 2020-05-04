import {expect} from "chai";
import OktagonURLParameterModel from "@addons/oktagonKartenportal/oktagonURLParameter.js";

describe("ADDON: oktagonKartenportal oktagonURLParameter", function () {
    let model;

    before(function () {
        model = new OktagonURLParameterModel();
    });

    describe("hasBezirk checks if input is in Config.zoomToGeometry.geometries and returns it in upperCase", function () {
        it("hasBezirk called with undefined or null", function () {
            model.hasBezirk(undefined);
            model.hasBezirk(null);
        });
        it("hasBezirk returns the found destrict in upperCase from Config.js", function () {
            Config.zoomToGeometry = {
                geometries: [
                    "BERGEDORF"
                ]
            };
            expect(model.hasBezirk("Bergedorf")).to.equal("BERGEDORF");
        });
    });
    describe("parseCoordinatesToFloat parses the input to float and returns an array with coordinates", function () {
        it("parseCoordinatesToFloat returns an array with float coordinates", function () {
            const inputArray = ["567773.340", "5933469.927"],
                expextedOutput = [567773.34, 5933469.927];

            expect(model.parseCoordinatesToFloat(inputArray)).to.deep.equal(expextedOutput);
        });
        it("hasBezirk called with undefined, null or empty string", function () {
            model.parseCoordinatesToFloat(undefined);
            model.parseCoordinatesToFloat(null);
            model.parseCoordinatesToFloat("");
        });
    });
});

