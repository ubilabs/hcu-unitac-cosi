import {Vector as VectorLayer} from "ol/layer";
import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actionsBorisVue";
import stateBoris from "../../../store/stateBorisVue";

describe("ADDONS: addons/borisVue/store/actionsBorisVue.js", () => {
    let commit, dispatch, getters, rootState, state;

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.stub().resolves(true);
        getters = sinon.stub();
        rootState = {
            Maps: {
                mode: "2D"
            },
            urlParams: {
                "brwId": "01510241",
                "brwLayerName": "31.12.2017",
                "Maps/center": "[565774, 5933956]"
            }
        };
        state = {...stateBoris};
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("initialize", () => {
        it("initializes the layerlist ", () => {
            const layer1 = new VectorLayer(),
                layer2 = new VectorLayer(),
                layer3 = new VectorLayer();
            let listenerRegistered = false,
                resultArray = [];

            layer1.set("name", "Layer1");
            layer1.set("id", "1");
            layer1.set("gfiAttributes", "ignore");
            layer1.set("isNeverVisibleInTree", "true");
            layer2.set("name", "Layer2");
            layer2.set("id", "2");
            layer2.set("gfiAttributes", "");
            layer2.set("isNeverVisibleInTree", "true");
            layer3.set("name", "Layer3");
            layer3.set("id", "3");
            layer3.set("gfiAttributes", "");
            layer3.set("isNeverVisibleInTree", "true");

            sinon.stub(Radio, "request").callsFake(function (channel, topic) {
                if (channel === "ModelList" && topic === "getModelsByAttributes") {
                    return [layer1, layer2, layer3];
                }
                else if (channel === "Map" && topic === "registerListener") {
                    listenerRegistered = true;
                }
                return null;
            });

            actions.initialize({commit, dispatch});
            resultArray = commit.args[0][1];

            expect(commit.calledOnce).to.be.true;
            expect(commit.args[0][0]).to.equal("setFilteredLayerList");
            expect(resultArray[1]).to.deep.equal(layer2);
            expect(resultArray).to.deep.equal([layer3, layer2]);

            expect(listenerRegistered).to.be.true;
        });
    });
    describe("handleUrlParameters", () => {
        it("handles URL parameters", () => {
            actions.handleUrlParameters({rootState, commit, dispatch});
            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setIsProcessFromParametricUrl");
            expect(commit.firstCall.args[1]).to.equal(true);
            expect(commit.secondCall.args[0]).to.equal("setParamUrlParams");
            expect(commit.secondCall.args[1].brwId).to.equal(rootState.urlParams.brwId);
            expect(commit.secondCall.args[1].brwLayerName).to.equal(rootState.urlParams.brwLayerName);
            expect(commit.secondCall.args[1].center).to.equal(rootState.urlParams["Maps/center"]);
            expect(dispatch.calledThrice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("switchLayer");
            expect(dispatch.firstCall.args[1]).to.equal(rootState.urlParams.brwLayerName);
            expect(dispatch.secondCall.args[0]).to.equal("Maps/setCenter");
            expect(dispatch.secondCall.args[1]).to.equal(rootState.urlParams["Maps/center"], {root: true});
            expect(dispatch.thirdCall.args[0]).to.equal("requestGFI");
            expect(dispatch.thirdCall.args[1].undefined).to.equal(undefined);
            expect(dispatch.thirdCall.args[1].processFromParametricUrl).to.equal(true);
            expect(dispatch.thirdCall.args[1].center).to.equal(rootState.urlParams["Maps/center"]);
        });
        it("do not handle url parameters", () => {
            rootState.urlParams = {};
            actions.handleUrlParameters({rootState, commit, dispatch});
            expect(commit.notCalled).to.be.true;
        });
    });
    describe("simulateLanduseSelect", () => {
        it("simulates landuse selection for paramURL", () => {
            getters.findLanduseByBrwId = "BH Bürohäuser";

            actions.simulateLanduseSelect({commit, getters});
            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setSelectedLanduse");
            expect(commit.firstCall.args[1]).to.equal(getters.findLanduseByBrwId);
            expect(commit.secondCall.args[0]).to.equal("setIsProcessFromParametricUrl");
            expect(commit.secondCall.args[1]).to.equal(false);

        });
    });
    describe("switchLayer", () => {
        it("handles layer switch for point & stripes layer", () => {
            const selectedLayerName = "31.12.2017";

            state.selectedLayer = {"attributes": {"layers": "lgv_brw_zonen_2017,lgv_brw_zonen_brw_grdstk_2017"}};

            actions.switchLayer({state, dispatch, commit}, selectedLayerName);
            expect(commit.calledThrice).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setSelectedBrwFeature");
            expect(commit.firstCall.args[1]).to.deep.equal({});
            expect(commit.secondCall.args[0]).to.equal("setTextIds");
            expect(commit.secondCall.args[1]).to.deep.equal([]);
            expect(commit.thirdCall.args[0]).to.equal("setIsAreaLayer");
            expect(commit.thirdCall.args[1]).to.equal(false);
            expect(dispatch.callCount).to.equal(4);
            expect(dispatch.args[0][0]).to.equal("selectLayerByName");
            expect(dispatch.args[0][1]).to.equal(selectedLayerName);
            expect(dispatch.args[1][0]).to.equal("MapMarker/removePolygonMarker");
            expect(dispatch.args[1][1]).to.equal(null);
            expect(dispatch.args[2][0]).to.equal("MapMarker/removePointMarker");
            expect(dispatch.args[2][1]).to.equal(null);
            expect(dispatch.args[3][0]).to.equal("toggleStripesLayer");
            expect(dispatch.args[3][1]).to.equal(false);

        });
        it("handles layer switch for area layer", () => {
            const selectedLayerName = "31.12.2019";

            state.selectedLayer = {"attributes": {"layers": "v_brw_zonen_geom_flaeche_2019"}};

            actions.switchLayer({state, dispatch, commit}, selectedLayerName);
            expect(commit.thirdCall.args[0]).to.equal("setIsAreaLayer");
            expect(commit.thirdCall.args[1]).to.equal(true);
        });
    });
    describe("handleSelectBRWYear", () => {
        it("handles layer selection by date", () => {
            const selectedLayerName = "31.12.2019";

            actions.handleSelectBRWYear({state, dispatch}, selectedLayerName);
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("switchLayer");
            expect(dispatch.firstCall.args[1]).to.equal(selectedLayerName);
        });
    });
    describe("checkBrwFeature", () => {
        it("brw feature is already available", async () => {
            const brwFeatures = {},
                year = "2019";

            await actions.checkBrwFeature({state, dispatch, commit}, {brwFeatures, year});
            expect(commit.calledThrice).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setSelectedPolygon");
            expect(commit.firstCall.args[1]).to.equal(null);
            expect(commit.secondCall.args[0]).to.equal("setBrwFeatures");
            expect(commit.secondCall.args[1]).to.deep.equal([]);
            expect(commit.thirdCall.args[0]).to.equal("setSelectedBrwFeature");
            expect(commit.thirdCall.args[1]).to.deep.equal({});
            expect(dispatch.calledOnce).to.be.true;
        });
        // to do: brwFeature by year: when is it defined? im alten boris wenn fläche ausgewählt wird und das Jahr gewechselt, hab ich abgeändert)
        // betrifft auch die action: combineFeatureWithSelectedDate
        // it.only("brw feature and brwFeatureByYear is already available", async () => {
        //     const brwFeatures = {},
        //         year = "2019";

        //     await actions.checkBrwFeature({state, dispatch, commit}, {brwFeatures, year});
        // })
        it("brwFeature is not available yet", async () => {
            const brwFeatures = undefined,
                year = "2022";

            await actions.checkBrwFeature({state, dispatch, commit}, {brwFeatures, year});
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setSelectedPolygon");
            expect(commit.firstCall.args[1]).to.equal(null);
        });
    });
    describe("toggleStripesLayer", () => {
        const attribute1 = {
                "name": "31.12.2022",
                "isNeverVisibleInTree": true,
                "isSelected": true
            },
            attribute2 = {
                "name": "31.12.2020",
                "isNeverVisibleInTree": true,
                "isSelected": false
            },
            layerName = attribute1.name + "-stripes";

        it("show stripes layer", () => {
            const value = true;

            state.filteredLayerList = [
                {
                    "attributes": attribute1,
                    get: (key)=> {
                        return attribute1[key];
                    }
                },
                {
                    "attributes": attribute2,
                    get: (key)=> {
                        return attribute2[key];
                    }
                }
            ];

            actions.toggleStripesLayer({state, dispatch, commit}, value);
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setIsStripesLayer");
            expect(commit.firstCall.args[1]).to.equal(value);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("selectLayerByName");
            expect(dispatch.firstCall.args[1]).to.equal(layerName);
        });
        it("hide stripes layer", () => {
            const value = false;

            state.filteredLayerList = [
                {
                    "attributes": attribute1,
                    get: (key)=> {
                        return attribute1[key];
                    }
                },
                {
                    "attributes": attribute2,
                    get: (key)=> {
                        return attribute2[key];
                    }
                }
            ];

            actions.toggleStripesLayer({state, dispatch, commit}, value);
            expect(commit.calledOnce).to.be.true;
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setIsStripesLayer");
            expect(commit.firstCall.args[1]).to.equal(value);
            expect(dispatch.calledOnce).to.be.false;
        });
    });
    describe("selectLayerByName", () => {
        const attribute1 = {
                "name": "31.12.2022",
                "isNeverVisibleInTree": true,
                "isSelected": true,
                "isVisibleInMap": false
            },
            attribute2 = {
                "name": "31.12.2020",
                "isNeverVisibleInTree": true,
                "isSelected": false,
                "isVisibleInMap": false
            };

        it.only("selectLayerByName", () => {
            const selectedLayerName = "31.12.2022";

            state.filteredLayerList = [
                {
                    "attributes": attribute1,
                    get: (key)=> {
                        return attribute1[key];
                    },
                    set: (key, value) => {
                        attribute1[key] = value;
                    }
                },
                {
                    "attributes": attribute2,
                    get: (key)=> {
                        return attribute2[key];
                    },
                    set: (key, value) => {
                        attribute2[key] = value;
                    }
                }
            ];

            actions.selectLayerByName({state, commit}, selectedLayerName);
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setSelectedLayer");
            expect(commit.firstCall.args[1]).to.equal(state.filteredLayerList[0]);
        });
    });
});


