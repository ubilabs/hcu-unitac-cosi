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
            // todo anpassen:
            urlParams: {
                "Tools/bufferAnalysis/active": true,
                initvalues: [
                    "{\"applySelectedSourceLayer\":\"1711\"",
                    "\"applyBufferRadius\":\"1010\"",
                    "\"setResultType\":0",
                    "\"applySelectedTargetLayer\":\"2128\"}"
                ]
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
                layer2 = new VectorLayer();
            let listenerRegistered = false;

            layer1.set("name", "Layer1");
            layer1.set("id", "1");
            layer1.set("gfiAttributes", "ignore");
            layer2.set("name", "Layer2");
            layer2.set("id", "2");
            layer2.set("gfiAttributes", "");

            sinon.stub(Radio, "request").callsFake(function (channel, topic) {
                if (channel === "ModelList" && topic === "getModelsByAttributes") {
                    return [layer1, layer2];
                }
                else if (channel === "Map" && topic === "registerListener") {
                    listenerRegistered = true;
                }
                return null;
            });

            actions.initialize({commit, dispatch});
            expect(commit.calledOnce).to.be.true;
            expect(commit.args[0][0]).to.equal("setFilteredLayerList");
            expect(commit.args[0][1]).to.deep.equal([layer2]);

            expect(listenerRegistered).to.be.true;
        });
    });
});
