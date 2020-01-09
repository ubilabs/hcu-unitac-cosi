import {expect} from "chai";
import Tool from "@modules/core/modelList/tool/model.js";
import ModelList from "@modules/core/modelList/list.js";
import initializeBrwAbfrageModel from "@addons/boris/bodenrichtwertabfrage/model.js";
import Feature from "ol/Feature";

describe("ADDON: Bodenrichtwert-Abfrage (BORIS)", function () {
    var tool,
        model;

    before(function () {
        tool = new Tool({id: "brw", type: "tool"});
        new ModelList([tool]);
        model = initializeBrwAbfrageModel();
    });

    describe("jsonParse", function () {
        it("should return undefined for undefined input", function () {
            expect(model.jsonParse(undefined)).to.be.undefined;
        });

        it("should return undefined for empty string as input", function () {
            expect(model.jsonParse("")).to.be.undefined;
        });

        it("should return empty object", function () {
            expect(model.jsonParse("{}")).to.deep.equal({});
        });

        it("should return undefined for string", function () {
            expect(model.jsonParse("helloWorld!")).to.be.undefined;
        });

        it("should return object with key value pair and value as string", function () {
            expect(model.jsonParse("{\"key1\": \"value1\"}")).to.deep.equal({key1: "value1"});
        });

        it("should return object with key value pair and value as boolean", function () {
            expect(model.jsonParse("{\"key1\": false}")).to.deep.equal({key1: false});
        });

        it("should return object with key value pair and value as number", function () {
            expect(model.jsonParse("{\"key1\": 123}")).to.deep.equal({key1: 123});
        });

        it("should return object with key value pair and value as number", function () {
            expect(model.jsonParse("{\"key1\": [{\"key2\": true}, {\"key3\": 123}, {\"key4\": \"helloWorld!\"}]}")).to.deep.equal({
                key1: [
                    {key2: true},
                    {key3: 123},
                    {key4: "helloWorld!"}
                ]
            });
        });
    });

    describe("findBrwFeatureByYear", function () {
        it("should return feature that matches jahrgang", function () {
            const brwFeatures = [
                    new Feature({jahrgang: "2017"}),
                    new Feature({jahrgang: "2016"}),
                    new Feature({jahrgang: "2015"})
                ],
                feature = model.findBrwFeatureByYear(brwFeatures, "2016");

            expect(feature.get("jahrgang")).to.equal("2016");
        });

        it("should return undefined if no feature matches jahrgang", function () {
            const brwFeatures = [
                    new Feature({jahrgang: "2017"}),
                    new Feature({jahrgang: "2016"}),
                    new Feature({jahrgang: "2015"})
                ],
                feature = model.findBrwFeatureByYear(brwFeatures, "2014");

            expect(feature).to.be.undefined;
        });

        it("should return undefined if jahrgang is undefined", function () {
            const brwFeatures = [
                    new Feature({jahrgang: "2017"}),
                    new Feature({jahrgang: "2016"}),
                    new Feature({jahrgang: "2015"})
                ],
                feature = model.findBrwFeatureByYear(brwFeatures, undefined);

            expect(feature).to.be.undefined;
        });

        it("should return undefined if brwFeatures is empty array", function () {
            const feature = model.findBrwFeatureByYear([], "2016");

            expect(feature).to.be.undefined;
        });

        it("should return undefined if both inputs are undefined", function () {
            const feature = model.findBrwFeatureByYear([], undefined);

            expect(feature).to.be.undefined;
        });
    });
    describe("setObjectAttribute", function () {
        it("should add object as attribute to given object", function () {
            const attribute = "attr1",
                value = "value1",
                dataType = "string";

            expect(model.setObjectAttribute({}, attribute, value, dataType)).to.deep.equal({
                attr1: {dataType: "string", value: "value1"}
            });
        });
    });
    describe("createAddressString", function () {
        it("should create address string based on strassenname, hausnummer, hausnummerzusatz", function () {
            const feature = new Feature({
                strassenname: "strasse",
                hausnummer: "123",
                hausnummerzusatz: "abc"
            });

            expect(model.createAddressString(feature)).to.equal("strasse 123abc");
        });

        it("should create trimmed address string based on strassenname, hausnummer, hausnummerzusatz", function () {
            const feature = new Feature({
                strassenname: " strasse",
                hausnummer: "123",
                hausnummerzusatz: "abc "
            });

            expect(model.createAddressString(feature)).to.equal("strasse 123abc");
        });

        it("should create trimmed address string only with strassenname", function () {
            const feature = new Feature({
                strassenname: "strasse"
            });

            expect(model.createAddressString(feature)).to.equal("strasse");
        });

        it("should create trimmed address string only with hausnummer", function () {
            const feature = new Feature({
                hausnummer: "123"
            });

            expect(model.createAddressString(feature)).to.equal("123");
        });

        it("should create trimmed address string only with hausnummerzusatz", function () {
            const feature = new Feature({
                hausnummer: "abc"
            });

            expect(model.createAddressString(feature)).to.equal("abc");
        });
    });
    describe("createPlzGemeindeString", function () {
        it("should create postal-code and municipality string based on plz, gemeinde", function () {
            const feature = new Feature({
                postleitzahl: "plz",
                gemeinde: "gemeinde"
            });

            expect(model.createPlzGemeindeString(feature)).to.equal("plz gemeinde");
        });

        it("should create trimmed postal-code and municipality string based on plz, gemeinde", function () {
            const feature = new Feature({
                postleitzahl: " plz",
                gemeinde: "gemeinde "
            });

            expect(model.createPlzGemeindeString(feature)).to.equal("plz gemeinde");
        });

        it("should create postal-code and municipality string only with plz", function () {
            const feature = new Feature({
                postleitzahl: "plz"
            });

            expect(model.createPlzGemeindeString(feature)).to.equal("plz");
        });

        it("should create postal-code and municipality string only with gemeinde", function () {
            const feature = new Feature({
                gemeinde: "gemeinde"
            });

            expect(model.createPlzGemeindeString(feature)).to.equal("gemeinde");
        });
    });
});
