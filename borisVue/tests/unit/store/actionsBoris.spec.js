import {Vector as VectorLayer} from "ol/layer";
import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actionsBorisVue";
import stateBoris from "../../../store/stateBorisVue";

describe("ADDONS: addons/borisVue/store/actionsBorisVue.js", () => {
    let commit, dispatch, rootState, state;

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.stub().resolves(true);
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
    describe("urlParams", () => {
        it.only("handleUrlParameters", () => {
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
});


