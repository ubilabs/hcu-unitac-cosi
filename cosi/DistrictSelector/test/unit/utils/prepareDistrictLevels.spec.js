import {getAllDistrictsWithoutLayer, getLayerById, getNameList, setNameList, prepareDistrictLevels} from "../../../utils/prepareDistrictLevels.js";
import {expect} from "chai";
import Source from "ol/source/Vector.js";
import Layer from "ol/layer/Vector.js";
import Feature from "ol/Feature.js";
import sinon from "sinon";

describe("addons/DistrictSelector/utils/prepareDistrictLevels.js", () => {
    describe("getAllDistrictsWithoutLayer", () => {
        it("should return an empty array if the given parameter is not an array or an array with length zero", () => {
            expect(getAllDistrictsWithoutLayer({})).to.be.empty;
            expect(getAllDistrictsWithoutLayer(true)).to.be.empty;
            expect(getAllDistrictsWithoutLayer("districtLevels")).to.be.empty;
            expect(getAllDistrictsWithoutLayer(undefined)).to.be.empty;
            expect(getAllDistrictsWithoutLayer(null)).to.be.empty;
            expect(getAllDistrictsWithoutLayer(42)).to.be.empty;
            expect(getAllDistrictsWithoutLayer([])).to.be.empty;
        });

        it("should return an array with length three", () => {
            const testArray = [{}, {}, {}],
                testArrayTwo = [{layer: {}}, {layer: {}}, {}, {}, {}];

            expect(getAllDistrictsWithoutLayer(testArray)).to.be.an("array");
            expect(getAllDistrictsWithoutLayer(testArray)).to.have.lengthOf(3);
            expect(getAllDistrictsWithoutLayer(testArrayTwo)).to.be.an("array");
            expect(getAllDistrictsWithoutLayer(testArrayTwo)).to.have.lengthOf(3);
        });

        it("should return an array with to objects, that have no layer attribute", () => {
            const testArray = [{id: "123"}, {name: "Hello"}, {layer: {}}];

            expect(getAllDistrictsWithoutLayer(testArray)).to.deep.equal([{id: "123"}, {name: "Hello"}]);
        });
    });

    describe("getLayerById", () => {
        it("should return undefined if only one param is given", () => {
            expect(getLayerById(["Test"])).to.be.undefined;
        });

        it("should return undefined if the first param is not an array", () => {
            expect(getLayerById({}, "123")).to.be.undefined;
            expect(getLayerById(true, "123")).to.be.undefined;
            expect(getLayerById("districtLevels", "123")).to.be.undefined;
            expect(getLayerById(undefined, "123")).to.be.undefined;
            expect(getLayerById(null, "123")).to.be.undefined;
            expect(getLayerById(42, "123")).to.be.undefined;
        });

        it("should return undefined if the first param is an empty array", () => {
            expect(getLayerById([], "123")).to.be.undefined;
        });

        it("should return undefined if the second param is not a string", () => {
            expect(getLayerById([], {})).to.be.undefined;
            expect(getLayerById([], true)).to.be.undefined;
            expect(getLayerById([], undefined)).to.be.undefined;
            expect(getLayerById([], null)).to.be.undefined;
            expect(getLayerById([], 42)).to.be.undefined;
            expect(getLayerById([], [])).to.be.undefined;
        });

        it("should return a layer with the passed id", () => {
            const layerOne = new Layer({id: "123"}),
                layerTwo = new Layer({id: "456"}),
                layerThree = new Layer({id: "789"}),
                layerList = [layerOne, layerTwo, layerThree];

            expect(getLayerById(layerList, "123")).to.be.an("object");
            expect(getLayerById(layerList, "456")).to.be.an("object");
        });

        it("should return undefined if no layer is found", () => {
            const layerOne = new Layer({id: "123"}),
                layerTwo = new Layer({id: "456"}),
                layerList = [layerOne, layerTwo];

            expect(getLayerById(layerList, "789")).to.be.undefined;
        });
    });

    describe("getNameList", () => {
        it("should return an empty array if only one param is passed", () => {
            const layerOne = new Layer();

            expect(getNameList(layerOne)).to.be.an("array").that.is.empty;
            expect(getNameList(true)).to.be.an("array").that.is.empty;
            expect(getNameList("layerOne")).to.be.an("array").that.is.empty;
            expect(getNameList(42)).to.be.an("array").that.is.empty;
        });

        it("should return an empty array if the first param is not an object", () => {
            expect(getNameList([], "123")).to.be.empty;
            expect(getNameList(true, "123")).to.be.empty;
            expect(getNameList("districtLevels", "123")).to.be.empty;
            expect(getNameList(undefined, "123")).to.be.empty;
            expect(getNameList(null, "123")).to.be.empty;
            expect(getNameList(42, "123")).to.be.empty;
        });

        it("should return an empty array if the second param is not a string", () => {
            const layerOne = new Layer();

            expect(getNameList(layerOne, {})).to.be.empty;
            expect(getNameList(layerOne, true)).to.be.empty;
            expect(getNameList(layerOne, undefined)).to.be.empty;
            expect(getNameList(layerOne, null)).to.be.empty;
            expect(getNameList(layerOne, 42)).to.be.empty;
            expect(getNameList(layerOne, [])).to.be.empty;
        });

        it("should return an empty array if no features with the attribute name exist", () => {
            const layerOne = new Layer({
                source: new Source({
                    features: [
                        new Feature({
                            id: "123"
                        }),
                        new Feature({
                            bezeichnung: "Ottensen"
                        })
                    ]
                })
            });

            expect(getNameList(layerOne, "name")).to.be.an("array").that.is.empty;
        });

        it("should return an array with the length of two'", () => {
            const layerOne = new Layer({
                source: new Source({
                    features: [
                        new Feature({
                            name: "Altona",
                            id: "123"
                        }),
                        new Feature({
                            name: "Ottensen"
                        }),
                        new Feature({
                            id: "Ottensen"
                        })
                    ]
                })
            });

            expect(getNameList(layerOne, "name")).to.be.an("array");
            expect(getNameList(layerOne, "name")).to.have.lengthOf(2);
        });

        it("should return an array with the strings 'Altona' and 'Ottensen'", () => {
            const layerOne = new Layer({
                source: new Source({
                    features: [
                        new Feature({
                            name: "Altona",
                            id: "123"
                        }),
                        new Feature({
                            name: "Ottensen"
                        })
                    ]
                })
            });

            expect(getNameList(layerOne, "name")).to.be.an("array");
            expect(getNameList(layerOne, "name")).to.deep.equal(["Altona", "Ottensen"]);
        });
    });

    describe("setNameList", () => {
        const bindObj = {
                keyOfAttrName: "name",
                layer: new Layer({
                    source: new Source({
                        features: [
                            new Feature({
                                name: "Altona",
                                id: "123"
                            }),
                            new Feature({
                                name: "Ottensen"
                            })
                        ]
                    })
                })
            },
            eventDummy = {
                target: {
                    getFeatures: () => ["", ""]
                }
            },
            eventDummyEmpty = {
                target: {
                    getFeatures: () => []
                }
            },
            copySetNameList = setNameList.bind(bindObj);

        it("should return an object without the property 'nameList'", () => {
            copySetNameList(eventDummyEmpty);
            expect(bindObj).to.have.not.property("nameList");
        });

        it("should return an object with the property 'nameList'", () => {
            copySetNameList(eventDummy);

            expect(bindObj).to.have.property("nameList");
        });

        it("should return an array for the property 'nameList'", () => {
            copySetNameList(eventDummy);

            expect(bindObj.nameList).to.be.an("array");
        });

        it("should return ['Altona', 'Ottensen'] for the property 'nameList'", () => {
            copySetNameList(eventDummy);

            expect(bindObj.nameList).to.deep.equal(["Altona", "Ottensen"]);
        });

        it("should return ['Altona', 'Ottensen'] for the property 'nameList'", () => {
            copySetNameList(eventDummy);

            expect(bindObj.nameList).to.deep.equal(["Altona", "Ottensen"]);
        });
    });

    describe("prepareDistrictLevels", () => {
        const layerOne = new Layer({id: "123", source: new Source()}),
            spyOnSource = sinon.spy(layerOne.getSource(), "on"),
            layerList = [layerOne];

        it("should call on listener", () => {
            const testArray = [{layerId: "123", stats: {}}];

            prepareDistrictLevels(testArray, layerList);
            expect(spyOnSource.calledOnce).to.be.true;
        });

        it("should return an object with the properties 'nameList', 'layer' and 'districts'", () => {
            const testArray = [{layerId: "123", stats: {}}];

            prepareDistrictLevels(testArray, layerList);
            expect(testArray[0]).to.have.property("nameList");
            expect(testArray[0]).to.have.property("layer");
            expect(testArray[0].stats).to.have.property("districts");
        });

        it("should do nothing if layer already there", () => {
            const testArray = [{layer: {}, stats: {}}];

            prepareDistrictLevels(testArray, layerList);
            expect(testArray[0]).to.have.not.property("nameList");
            expect(testArray[0].stats).to.have.not.property("districts");
        });
    });
});
