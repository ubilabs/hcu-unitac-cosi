import {expect} from "chai";
import Tool from "@modules/core/modelList/tool/model.js";
import ModelList from "@modules/core/modelList/list.js";
import SdpDownloadModel from "@addons/sdpdownload/model.js";

describe("ADDON: sdpdownload", function () {
    var tool,
        model;

    before(function () {
        tool = new Tool({id: "sdpdownload", type: "tool"});
        new ModelList([tool]);
        model = new SdpDownloadModel();
    });

    describe("addFeaturenameToRasternames", function () {
        const featureA = {getProperties: () => {
                return {kachel: "1234"};
            }},
            featureB = {getProperties: () => {
                return {kachel: "9999"};
            }};
        let rasterNames = [];

        before(function () {
            rasterNames = [];
        });
        it("addFeaturenameToRasternames called with undefined or null", function () {
            model.addFeaturenameToRasternames(undefined, undefined);
            model.addFeaturenameToRasternames(null, null);
        });
        it("addFeaturenameToRasternames -  uniqueness", function () {
            model.addFeaturenameToRasternames(featureA, rasterNames);
            expect(rasterNames).to.eql(["1234"]);
            model.addFeaturenameToRasternames(featureA, rasterNames);
            expect(rasterNames).to.eql(["1234"]);
        });
        it("addFeaturenameToRasternames -  fill list", function () {
            model.addFeaturenameToRasternames(featureA, rasterNames);
            expect(rasterNames).to.eql(["1234"]);
            model.addFeaturenameToRasternames(featureB, rasterNames);
            expect(rasterNames).to.eql(["1234", "9999"]);
        });


    });
    describe("checkRasterNamesAmount", function () {
        it("checkRasterNamesAmount with empty rasternames", function () {
            model.set("rasterNames", []);
            expect(model.checkRasterNamesAmount()).to.be.false;
        });
        it("checkRasterNamesAmount with more than 9 rasternames", function () {
            model.set("rasterNames", ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
            expect(model.checkRasterNamesAmount()).to.be.false;
        });
        it("checkRasterNamesAmount with rasternames 1-9", function () {
            model.set("rasterNames", ["1"]);
            expect(model.checkRasterNamesAmount()).to.be.true;
            model.set("rasterNames", ["1", "2", "3", "4", "5", "6", "7", "8", "9"]);
            expect(model.checkRasterNamesAmount()).to.be.true;
        });
        it("checkRasterNamesAmount with adapted selectedRasterLimit", function () {
            model.set("selectedRasterLimit", 3);
            model.set("rasterNames", ["1"]);
            expect(model.checkRasterNamesAmount()).to.be.true;
            model.set("rasterNames", ["1", "2", "3", "4", "5", "6", "7", "8", "9"]);
            expect(model.checkRasterNamesAmount()).to.be.false;
        });

    });
});

