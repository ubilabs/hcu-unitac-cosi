import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import BorisVueComponent from "../../../components/BorisVue.vue";
import BorisVue from "../../../store/indexBorisVue";
import {expect} from "chai";
import sinon from "sinon";
import Print from "../../../../../src/modules/tools/print/components/PrintMap.vue";

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
    let store, wrapper, originalMatchPolygonFeatureWithLanduse;

    beforeEach(() => {
        originalMatchPolygonFeatureWithLanduse = BorisVue.actions.matchPolygonFeatureWithLanduse;
        BorisVue.actions.matchPolygonFeatureWithLanduse = sinon.spy();

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
    }),
    afterEach(function () {
        BorisVue.actions.matchPolygonFeatureWithLanduse = originalMatchPolygonFeatureWithLanduse;
        sinon.restore();
        if (wrapper) {
            wrapper.destroy();
        }
    });

    describe("Boris template", () => {
        it("renders BorisVue", () => {
            store.state.Tools.BorisVue.active = true;
            wrapper = shallowMount(BorisVueComponent, {store, localVue});
            console.log(wrapper.html());
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
            store.state.Tools.BorisVue.active = true;
            store.commit("Tools/BorisVue/selectedPolygon", {polygonKey: "polygonValue"});
            // store.state.Tools.BorisVue.selectedPolygon.polygon3s = "polygonData";
            wrapper = shallowMount(BorisVueComponent, {store, localVue});
            expect(wrapper.find(".form-group", ".col-12", "first").exists()).to.be.true;
        });
    });

    describe("getFilterListWithoutStripes function", () => {
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


});


