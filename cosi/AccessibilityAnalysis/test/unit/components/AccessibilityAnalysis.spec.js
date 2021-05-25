import Vuex from "vuex";
import {
    config,
    shallowMount,
    createLocalVue
} from "@vue/test-utils";
import AccessibilityAnalysisComponent from "../../../components/AccessibilityAnalysis.vue";
import ReachabilityResult from "../../../components/ReachabilityResult.vue";
import AccessibilityAnalysis from "../../../store/index";
import {
    expect
} from "chai";
import sinon from "sinon";
import data from "./isochrones.json";
import {
    registerProjections
} from './util.js'

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

before(() => {
    registerProjections();
});

describe("AccessibilityAnalysis.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        AccessibilityAnalysis: {
                            "name": "translate#additional:modules.tools.vueAddon.title",
                            "glyphicon": "glyphicon-th-list"
                        }
                    }
                }
            }
        }
    };

    let store, requestStub, sandbox, sourceStub;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        AccessibilityAnalysis
                    }
                },
                Map: {
                    namespaced: true,
                    getters: {
                        map: () => ({
                            addEventListener: () => sinon.stub()
                        })
                    },
                    // mutations: mockMapMutations,
                    // actions: mockMapActions
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/AccessibilityAnalysis/setActive", true);

        // requestMock = {
        //     setVisible: sinon.stub(),
        //     addEventListener: sinon.stub()
        // }
        // stub = sinon.stub(Radio, "request").callsFake(() => requestMock);
    });

    afterEach(function () {
        sandbox.restore();
    });

    function mount(layersMock) {
        sandbox = sinon.createSandbox()
        sourceStub = {
            clear: sinon.stub(),
            addFeatures: sinon.stub()
        }
        requestStub = sandbox.stub(Radio, "request").callsFake((a1, a2) => {
            if (a1 == 'Map')
                return {
                    setVisible: sinon.stub(),
                    addEventListener: sinon.stub(),
                    getSource: () => (sourceStub)
                }
            if (a1 == "OpenRoute" && a2 == "requestIsochrones") {
                return new Promise(function (resolve, reject) {
                    resolve(JSON.stringify(data));
                });
            }
            if (a1 == "Parser" && a2 == "getItemsByAttributes")
                return []
            if (a1 == "ModelList" && a2 == "getModelsByAttributes") {
                return layersMock
            }
        });
        return shallowMount(AccessibilityAnalysisComponent, {
            store,
            localVue
        });
    }

    it("renders Component", () => {
        const wrapper = mount()
        expect(wrapper.find("#accessibilityanalysis").exists()).to.be.true;
    });

    it("contains correct html", () => {
        const wrapper = mount()
        // expect(wrapper.find("#accessibilityanalysis").html()).to.be.equals('')
        expect(wrapper.find("#accessibilityanalysis").html()).to.not.be.empty
    });

    it("trigger button without user input", async () => {
        const wrapper = mount()
        const stub = sandbox.stub(Radio, "trigger")
        await wrapper.find("#create-isochrones").trigger("click");
        sinon.assert.calledWith(stub,
            "Alert", "alert", {
                text: "<strong>Bitte füllen Sie alle Felder aus.</strong>",
                kategorie: "alert-warning",
            });
    });

    it("trigger button with user input no layer selected", async () => {
        const wrapper = mount([])
        const stub = sandbox.stub(Radio, "trigger")
        await wrapper.setData({
            coordinate: "10.155828082155567, 53.60323024735499",
            transportType: "Auto",
            scaleUnit: "time",
            distance: 10
        });

        await wrapper.find("#create-isochrones").trigger("click");

        sinon.assert.callCount(sourceStub.clear, 1)
        sinon.assert.callCount(sourceStub.addFeatures, 1)

        await wrapper.find("#show-result").trigger("click");
        sinon.assert.calledWith(stub,
            "Alert", "alert", {
                text: '<strong>Bitte wählen Sie mindestens ein Thema unter Fachdaten aus, zum Beispiel "Sportstätten".</strong>',
                kategorie: "alert-warning",
            });
    });

    it("trigger button with user input and selected layer", async () => {
        const layersMock = [{
            get: (id) => {
                if (id == 'name') return 'LayerName'
                if (id == 'id') return 'LayerId'
                if (id == 'layer') {
                    return {
                        getSource: () => ({
                            getFeatures: sinon.stub().returns([{
                                getProperties: sinon.stub().returns({
                                    id: 'label'
                                }),
                                getGeometry: sinon.stub().returns({
                                    getType: () => 'Point',
                                    getCoordinates: () => ([0, 0])
                                })
                            }])
                        })
                    }
                }
            },
        }]

        const wrapper = mount(layersMock)
        const stub = sandbox.stub(Radio, "trigger")
        await wrapper.setData({
            coordinate: "10.155828082155567, 53.60323024735499",
            transportType: "Auto",
            scaleUnit: "time",
            distance: 10
        });

        await wrapper.find("#create-isochrones").trigger("click");

        sinon.assert.callCount(sourceStub.clear, 1)
        sinon.assert.callCount(sourceStub.addFeatures, 1)

        await wrapper.find("#show-result").trigger("click");

        const result = wrapper.findComponent(ReachabilityResult).props()
        expect(result['layers']).to.not.be.empty

        await wrapper.find("#show-in-dashboard").trigger("click");
        sinon.assert.calledWith(stub, "Dashboard", "append")
    });

});
