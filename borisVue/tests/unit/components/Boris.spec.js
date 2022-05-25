import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import BorisVueComponent from "../../../components/BorisVue.vue";
import BorisVue from "../../../store/indexBorisVue";
import {preparePrint} from "../../../utils/preparePrint.js";
import {expect} from "chai";
import sinon from "sinon";
// import Print from "../../../../../src/modules/tools/print/components/PrintMap.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("ADDONS: addons/borisVue/components/BorisVue.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        borisVue: {
                            "name": "common:menu.tools.borisVue",
                            "icon": "bi-vinyl",
                            "active": true,
                            "renderToWindow": false
                        }
                    }
                }
            }
        }
    };
    let store,
        wrapper,
        originalMatchPolygonFeatureWithLanduse,
        originalSimulateLanduseSelect,
        originalSendWpsConvertRequest,
        originalUpdateSelectedBrwFeature;

    beforeEach(() => {
        originalMatchPolygonFeatureWithLanduse = BorisVue.actions.matchPolygonFeatureWithLanduse;
        BorisVue.actions.matchPolygonFeatureWithLanduse = sinon.spy();

        originalSimulateLanduseSelect = BorisVue.actions.simulateLanduseSelect;
        BorisVue.actions.simulateLanduseSelect = sinon.spy();

        originalSendWpsConvertRequest = BorisVue.actions.sendWpsConvertRequest;
        BorisVue.actions.sendWpsConvertRequest = sinon.spy();

        originalUpdateSelectedBrwFeature = BorisVue.actions.updateSelectedBrwFeature;
        BorisVue.actions.updateSelectedBrwFeature = sinon.spy();

        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        BorisVue,
                        Print: {
                            namespaced: true,
                            getters: {printFileReady: () => sinon.stub(),
                                fileDownloadUrl: () => sinon.stub(),
                                filename: () => sinon.stub(),
                                printStarted: () => sinon.stub(),
                                progressWidth: () => sinon.stub()}
                        }
                    },
                    getters: {mobile: () => false}
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
    });
    afterEach(() => {
        BorisVue.actions.matchPolygonFeatureWithLanduse = originalMatchPolygonFeatureWithLanduse;
        BorisVue.actions.simulateLanduseSelect = originalSimulateLanduseSelect;
        BorisVue.actions.sendWpsConvertRequest = originalSendWpsConvertRequest;
        BorisVue.actions.updateSelectedBrwFeature = originalUpdateSelectedBrwFeature;
        sinon.restore();
        if (wrapper) {
            wrapper.destroy();
        }
    });

    describe("Boris template", () => {
        it("renders BorisVue", () => {
            store.state.Tools.BorisVue.active = true;
            wrapper = shallowMount(BorisVueComponent, {store, localVue});
            expect(wrapper.find("#boris").exists()).to.be.true;
        });
        it("do not render BorisVue if not active", () => {
            store.state.Tools.BorisVue.active = false;
            wrapper = shallowMount(BorisVueComponent, {store, localVue});
            expect(wrapper.find("#boris").exists()).to.be.false;
        });
        it("renders input to toggle boarder stripes", () => {
            store.state.Tools.BorisVue.active = true;
            store.state.Tools.BorisVue.isAreaLayer = true;
            wrapper = shallowMount(BorisVueComponent, {store, localVue});
            // input mit der id showStripes ist vorhanden
            expect(wrapper.find("#showStripes").exists()).to.be.true;
            // input value is false --> ist zunächst nicht ausgewählt
            expect(wrapper.find("#showStripes").element.checked).to.be.false;
            // the label is available
            expect(wrapper.find(".form-check-label").exists()).to.be.true;
            // check if translation works
            expect(wrapper.find(".form-check-label").text()).to.equals("additional:modules.tools.boris.toggleStripesLayer");
            // Fragezeichen-Icon vorhanden?
            expect(wrapper.find(".bootstrap-icon", "bi-question-circle-fill").exists()).to.be.true;
            // die div mit dem Info-Text ist zunächst false --> warum funktioniert es nicht? das ist doch erst vorhanden, wenn in textIds die 1 vorhanden ist?
            expect(wrapper.find(".info-text").exists()).to.be.false;
        });
        it("render text to click on polygon if no polygon is selected", () => {
            store.state.Tools.BorisVue.active = true;
            store.state.Tools.BorisVue.selectedPolygon = null;
            wrapper = shallowMount(BorisVueComponent, {store, localVue});
            // show text if no polygon is selected
            expect(wrapper.find("#selectPolygonText").text()).to.equals("additional:modules.tools.boris.SelectAreaInMap");
        });
        it("render choose landuse selection", () => {
            const feature = {
                get: () => "value"
            };

            store.state.Tools.BorisVue.active = true;
            store.commit("Tools/BorisVue/setSelectedPolygon", feature);
            wrapper = shallowMount(BorisVueComponent, {store, localVue});
            expect(wrapper.find(".form-group", ".col-12", "first").exists()).to.be.true;
        });
    });

    describe("getFilterListWithoutStripes computed property", () => {
        const layer1 = {
                attributes: {
                    name: "ich habe -stripes"
                }
            },
            layer2 = {
                attributes: {
                    name: "ich nicht"
                }
            };

        it("getFilterListWithoutStripes includes layer without stripes", () => {
            store.state.Tools.BorisVue.active = true;
            store.state.Tools.BorisVue.filteredLayerList.push(layer1);
            store.state.Tools.BorisVue.filteredLayerList.push(layer2);
            wrapper = shallowMount(BorisVueComponent, {store, localVue});

            expect(wrapper.vm.getFilterListWithoutStripes).that.includes(layer2.attributes.name);

        });
        it("getFilterListWithoutStripes does not include layer with stripes", () => {
            store.state.Tools.BorisVue.active = true;
            store.state.Tools.BorisVue.filteredLayerList.push(layer1);
            store.state.Tools.BorisVue.filteredLayerList.push(layer2);
            wrapper = shallowMount(BorisVueComponent, {store, localVue});

            expect(wrapper.vm.getFilterListWithoutStripes).that.does.not.include(layer1.attributes.name);
        });

    });
    describe("selectedLanduseComputed computed property", () => {
        const oldValue = "BH Burohäuser",
            newValue = "A Acker";

        // ist das so richtig getestet?

        it("selectedLanduseComputed equals newValue", () => {
            store.state.Tools.BorisVue.active = true;
            store.commit("Tools/BorisVue/setSelectedLanduse", newValue);
            wrapper = shallowMount(BorisVueComponent, {store, localVue});
            expect(wrapper.vm.selectedLanduseComputed).to.equal(newValue);
        });
        it("selectedLanduseComputed does not equal oldValue", () => {
            store.state.Tools.BorisVue.active = true;
            store.commit("Tools/BorisVue/setSelectedLanduse", newValue);
            wrapper = shallowMount(BorisVueComponent, {store, localVue});
            expect(wrapper.vm.selectedLanduseComputed).to.not.equal(oldValue);
        });
    });
    describe("selectedPolygon watcher", () => {
        it("landuse select should be simulated if parametric Url is being used ", () => {
            store.state.Tools.BorisVue.active = true;
            store.state.Tools.BorisVue.isProcessFromParametricUrl = true;
            wrapper = shallowMount(BorisVueComponent, {store, localVue});
            wrapper.vm.$options.watch.selectedPolygon.call(wrapper.vm);

            expect(BorisVue.actions.simulateLanduseSelect.calledOnce).to.equal(true);

        });
    });
    describe("selectedLanduse watcher", () => {
        it("selectedLanduse shall change buttonValue and call matchPolygonFeatureWithLanduse", () => {
            const oldValue = "BH Bürohäuser",
                newValue = "A Acker";

            store.state.Tools.BorisVue.active = true;
            store.state.Tools.BorisVue.buttonValue = "liste";
            wrapper = shallowMount(BorisVueComponent, {store, localVue});
            wrapper.vm.$options.watch.selectedLanduse.call(wrapper.vm, newValue, oldValue);

            expect(store.state.Tools.BorisVue.buttonValue).to.equals("info");
            expect(BorisVue.actions.matchPolygonFeatureWithLanduse.calledOnce).to.equal(true);
        });
    });
    describe("toggleInfoText method", () => {
        it("toggleInfoText", () => {
            store.state.Tools.BorisVue.active = true;
            store.state.Tools.BorisVue.textIds = ["id1", "id2"];
            wrapper = shallowMount(BorisVueComponent, {store, localVue});
            wrapper.vm.toggleInfoText("id3");

            expect(store.state.Tools.BorisVue.textIds).to.have.lengthOf(3);
            expect(store.state.Tools.BorisVue.textIds).that.includes("id3");
        });
    });
    describe("handle input and option change methods", () => {
        it("handleOptionChange", () => {
            const event = {target: {value: "dh Doppelhaushälfte"}, get: () => "value"},
                subject = "zBauweise";

            store.state.Tools.BorisVue.active = true;
            wrapper = shallowMount(BorisVueComponent, {store, localVue});
            wrapper.vm.handleOptionChange(event, subject);

            expect(store.state.Tools.BorisVue.selectedOption).to.equal("dh Doppelhaushälfte");
            expect(BorisVue.actions.updateSelectedBrwFeature.calledOnce).to.equal(true);
            expect(BorisVue.actions.sendWpsConvertRequest.calledOnce).to.equal(true);

        });
        it("handleInputChange", () => {
            const event = {type: "change", key: "Enter", currentTarget: {value: "12,34"}},
                subject = "345";

            store.state.Tools.BorisVue.active = true;
            wrapper = shallowMount(BorisVueComponent, {store, localVue});
            wrapper.vm.handleInputChange(event, subject);
            expect(BorisVue.actions.updateSelectedBrwFeature.calledOnce).to.equal(true);
            expect(BorisVue.actions.sendWpsConvertRequest.calledOnce).to.equal(true);


        });
    });
    describe("close method", () => {
        it("close", () => {
            wrapper = shallowMount(BorisVueComponent, {store, localVue});
            wrapper.vm.close();

            expect(store.state.Tools.BorisVue.active).to.equal(false);
        });
    });
    describe("startPrint method", () => {
        it.only("startPrint", async () => {
            
            store.state.Tools.BorisVue.active = true;
            store.state.Tools.BorisVue.selectedBrwFeature = {id: 1, name: "feature1",  get: () => "value" };
            wrapper = shallowMount(BorisVueComponent, {store, localVue});
            const printButton = wrapper.find(".btn-infos");
            wrapper.vm.startPrint = sinon.spy();
            printButton.trigger("click");
            
            wrapper.vm.$nextTick()

            // console.log(preparePrint.callCount)
            // console.log(preparePrint().callCount)

            // expect(preparePrint().calledOnce).to.equal(true);

            // Wie kann ich startPrint und/oder preparePrint testen? 

        })
    })

});


